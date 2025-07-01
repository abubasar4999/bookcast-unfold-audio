
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';

interface UseSecureAudioProps {
  bookId: string;
  audioPath: string;
}

interface ListeningProgress {
  current_position: number;
  duration: number | null;
}

interface NetworkInfo {
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
}

export const useSecureAudio = ({ bookId, audioPath }: UseSecureAudioProps) => {
  const { user } = useAuth();
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState<ListeningProgress | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Detect network information
  const getNetworkInfo = (): NetworkInfo => {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    return {
      effectiveType: connection?.effectiveType || 'unknown',
      downlink: connection?.downlink || 0,
      rtt: connection?.rtt || 0
    };
  };

  // Enhanced URL generation with multiple fallback strategies
  const generateAudioUrl = (path: string): string => {
    if (!path) {
      console.error('Audio path is empty');
      return '';
    }

    console.log('Processing audio path:', path);
    
    if (path.startsWith('http://') || path.startsWith('https://')) {
      console.log('Audio path is already a full URL:', path);
      return path;
    }
    
    try {
      const { data } = supabase.storage
        .from('book-audios')
        .getPublicUrl(path);
      
      // Add cache-busting and mobile-optimized parameters
      const url = new URL(data.publicUrl);
      url.searchParams.set('t', Date.now().toString());
      url.searchParams.set('mobile', '1');
      
      const finalUrl = url.toString();
      console.log('Generated optimized URL:', finalUrl);
      return finalUrl;
    } catch (error) {
      console.error('Error generating public URL:', error);
      return '';
    }
  };

  // Test URL accessibility with comprehensive checks
  const testAudioUrl = async (url: string, attempt: number = 1): Promise<boolean> => {
    const networkInfo = getNetworkInfo();
    console.log(`Testing audio URL (attempt ${attempt}), Network:`, networkInfo);
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(url, {
        method: 'HEAD',
        signal: controller.signal,
        headers: {
          'Accept': 'audio/mpeg, audio/mp3, audio/*',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        // Add credentials for potential auth requirements
        credentials: 'omit'
      });
      
      clearTimeout(timeoutId);
      
      console.log(`Audio URL test response (attempt ${attempt}):`, {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        url: response.url
      });
      
      if (response.ok) {
        const contentType = response.headers.get('content-type');
        console.log('Content-Type:', contentType);
        return true;
      } else {
        console.warn(`Audio URL not accessible: ${response.status} ${response.statusText}`);
        return false;
      }
    } catch (error: any) {
      console.error(`Audio URL test failed (attempt ${attempt}):`, {
        name: error.name,
        message: error.message,
        cause: error.cause
      });
      
      // Log specific error types for debugging
      if (error.name === 'AbortError') {
        console.error('Request timed out - possible network issue');
      } else if (error.name === 'TypeError') {
        console.error('Network error - possible carrier/eSIM blocking');
      }
      
      return false;
    }
  };

  // Load user's listening progress
  const loadProgress = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('listening_progress')
        .select('current_position, duration')
        .eq('user_id', user.id)
        .eq('book_id', bookId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading progress:', error);
        return;
      }

      if (data) {
        setProgress(data);
        setCurrentTime(data.current_position);
      }
    } catch (error) {
      console.error('Failed to load progress:', error);
    }
  };

  // Save listening progress
  const saveProgress = async (position: number, audioDuration?: number) => {
    if (!user) return;

    try {
      const { data: existing, error: selectError } = await supabase
        .from('listening_progress')
        .select('id')
        .eq('user_id', user.id)
        .eq('book_id', bookId)
        .maybeSingle();

      if (selectError && selectError.code !== 'PGRST116') {
        console.error('Error checking existing progress:', selectError);
        return;
      }

      if (existing) {
        const { error } = await supabase
          .from('listening_progress')
          .update({
            current_position: position,
            duration: audioDuration || duration,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id);

        if (error) {
          console.error('Error updating progress:', error);
        }
      } else {
        const { error } = await supabase
          .from('listening_progress')
          .insert({
            user_id: user.id,
            book_id: bookId,
            current_position: position,
            duration: audioDuration || duration,
            updated_at: new Date().toISOString()
          });

        if (error) {
          console.error('Error inserting progress:', error);
        }
      }
    } catch (error) {
      console.error('Failed to save progress:', error);
    }
  };

  // Initialize audio with retry logic
  const initializeAudio = async (forceRetry: boolean = false) => {
    if (!audioPath) {
      console.error('No audio path provided');
      return;
    }

    if (!forceRetry && isLoading) {
      console.log('Already loading, skipping initialization');
      return;
    }

    setIsLoading(true);
    const networkInfo = getNetworkInfo();
    console.log('Initializing audio with network info:', networkInfo, 'Path:', audioPath);
    
    try {
      const finalAudioUrl = generateAudioUrl(audioPath);
      
      if (!finalAudioUrl) {
        console.error('Failed to get valid audio URL');
        toast({
          title: "Audio Error",
          description: "Unable to generate audio URL. Please try again.",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }
      
      // Test URL accessibility with retry logic
      let isAccessible = false;
      const maxAttempts = 3;
      
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        isAccessible = await testAudioUrl(finalAudioUrl, attempt);
        if (isAccessible) break;
        
        if (attempt < maxAttempts) {
          console.log(`Retrying URL test in ${attempt * 1000}ms...`);
          await new Promise(resolve => setTimeout(resolve, attempt * 1000));
        }
      }
      
      if (!isAccessible) {
        console.error('Audio URL not accessible after all attempts');
        toast({
          title: "Network Issue",
          description: "Unable to access audio on current network. Try switching networks or check connection.",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }
      
      setAudioUrl(finalAudioUrl);
      setRetryCount(0);
      
      // Load progress only if user is authenticated
      if (user) {
        await loadProgress();
      }
    } catch (error) {
      console.error('Failed to initialize audio:', error);
      toast({
        title: "Initialization Error",
        description: "Failed to initialize audio player. Please refresh and try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle audio time updates
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const newTime = audioRef.current.currentTime;
      setCurrentTime(newTime);
      
      if (user && Math.floor(newTime) % 10 === 0) {
        saveProgress(newTime);
      }
    }
  };

  // Handle audio metadata loaded
  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      const audioDuration = audioRef.current.duration;
      setDuration(audioDuration);
      console.log('Audio duration loaded:', audioDuration);
      
      if (user && progress && progress.current_position > 0) {
        audioRef.current.currentTime = progress.current_position;
        setCurrentTime(progress.current_position);
      }
    }
  };

  // Handle audio ended
  const handleEnded = () => {
    setIsPlaying(false);
    if (user) {
      saveProgress(0);
    }
  };

  // Enhanced play/pause with comprehensive error handling
  const togglePlay = async () => {
    if (!audioRef.current || !audioUrl) {
      console.error('Audio element or URL not ready');
      toast({
        title: "Player Not Ready",
        description: "Audio player is not ready. Please wait or refresh.",
        variant: "destructive"
      });
      return;
    }

    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
        if (user) {
          saveProgress(currentTime);
        }
      } else {
        const networkInfo = getNetworkInfo();
        console.log('Attempting to play audio with network:', networkInfo, 'URL:', audioUrl);
        
        // Set additional audio properties for mobile data compatibility
        if (audioRef.current) {
          audioRef.current.crossOrigin = null; // Remove CORS restrictions
          audioRef.current.preload = 'none'; // Minimize initial loading
        }
        
        await audioRef.current.play();
        setIsPlaying(true);
        console.log('Audio playback started successfully');
        
        // Reset retry count on successful play
        setRetryCount(0);
      }
    } catch (error: any) {
      console.error('Error in audio playback:', {
        name: error.name,
        message: error.message,
        code: error.code,
        networkInfo: getNetworkInfo()
      });
      
      setIsPlaying(false);
      
      // Enhanced error handling with specific solutions
      if (error.name === 'NotAllowedError') {
        toast({
          title: "User Interaction Required",
          description: "Please tap the play button again to start playback.",
          variant: "destructive"
        });
      } else if (error.name === 'NotSupportedError') {
        toast({
          title: "Format Not Supported",
          description: "Audio format not supported or network connectivity issue.",
          variant: "destructive"
        });
      } else if (error.name === 'AbortError') {
        toast({
          title: "Playback Interrupted",
          description: "Playback was interrupted. Try again or check your connection.",
          variant: "destructive"
        });
      } else {
        // Implement retry logic for network-related errors
        if (retryCount < 2) {
          console.log(`Retrying playback (attempt ${retryCount + 1})...`);
          setRetryCount(prev => prev + 1);
          
          // Clear existing timeout
          if (retryTimeoutRef.current) {
            clearTimeout(retryTimeoutRef.current);
          }
          
          // Retry after delay
          retryTimeoutRef.current = setTimeout(() => {
            initializeAudio(true).then(() => {
              // Try playing again after re-initialization
              if (audioRef.current) {
                audioRef.current.play().catch(console.error);
              }
            });
          }, (retryCount + 1) * 2000);
          
          toast({
            title: "Retrying...",
            description: `Network issue detected. Retrying playback (${retryCount + 1}/3)...`,
          });
        } else {
          toast({
            title: "Playback Failed",
            description: "Unable to play audio on current network. Try switching to Wi-Fi or another network.",
            variant: "destructive"
          });
        }
      }
    }
  };

  // Seek to specific time
  const seekTo = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
      if (user) {
        saveProgress(time);
      }
    }
  };

  // Skip forward/backward
  const skip = (seconds: number) => {
    if (audioRef.current) {
      const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
      seekTo(newTime);
    }
  };

  // Listen for network changes
  useEffect(() => {
    const handleNetworkChange = () => {
      const networkInfo = getNetworkInfo();
      console.log('Network changed:', networkInfo);
      
      // Reinitialize on significant network changes
      if (audioPath && audioUrl) {
        console.log('Reinitializing due to network change...');
        setTimeout(() => initializeAudio(true), 1000);
      }
    };

    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    if (connection) {
      connection.addEventListener('change', handleNetworkChange);
      return () => connection.removeEventListener('change', handleNetworkChange);
    }
  }, [audioPath, audioUrl]);

  useEffect(() => {
    if (audioPath) {
      console.log('Audio path changed, reinitializing:', audioPath);
      initializeAudio();
    }
  }, [user, audioPath, bookId]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      if (user && currentTime > 0) {
        saveProgress(currentTime);
      }
    };
  }, [currentTime, user]);

  return {
    audioRef,
    audioUrl,
    isPlaying,
    currentTime,
    duration,
    isLoading,
    progress,
    retryCount,
    togglePlay,
    seekTo,
    skip,
    handleTimeUpdate,
    handleLoadedMetadata,
    handleEnded,
    initializeAudio
  };
};
