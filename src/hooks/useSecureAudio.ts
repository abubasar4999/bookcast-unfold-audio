
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

  // Check if we're on mobile
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  // Generate audio URL with mobile-specific handling
  const generateAudioUrl = (path: string): string => {
    if (!path) {
      console.error('Audio path is empty');
      return '';
    }

    console.log('Processing audio path for mobile:', path, 'isMobile:', isMobile);
    
    // If it's already a full URL, return as is
    if (path.startsWith('http://') || path.startsWith('https://')) {
      console.log('Audio path is already a full URL:', path);
      return path;
    }
    
    try {
      // Generate public URL from Supabase storage
      const { data } = supabase.storage
        .from('book-audios')
        .getPublicUrl(path);
      
      let finalUrl = data.publicUrl;
      
      // Add mobile-specific URL parameters for better compatibility
      if (isMobile) {
        const urlObj = new URL(finalUrl);
        urlObj.searchParams.set('t', Date.now().toString()); // Cache busting
        urlObj.searchParams.set('mobile', '1'); // Mobile indicator
        finalUrl = urlObj.toString();
      }
      
      console.log('Generated mobile-optimized URL:', finalUrl);
      return finalUrl;
    } catch (error) {
      console.error('Error generating public URL:', error);
      return '';
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

  // Test if audio URL is accessible
  const testAudioUrl = async (url: string): Promise<boolean> => {
    try {
      const response = await fetch(url, { 
        method: 'HEAD',
        mode: 'cors',
        cache: 'no-cache'
      });
      console.log('Audio URL test response:', response.status, response.statusText);
      return response.ok;
    } catch (error) {
      console.error('Audio URL test failed:', error);
      return false;
    }
  };

  // Initialize audio with mobile-specific handling
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
    console.log('Initializing audio with path:', audioPath, 'Mobile:', isMobile);
    
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

      // Test URL accessibility
      const isAccessible = await testAudioUrl(finalAudioUrl);
      if (!isAccessible) {
        console.error('Audio URL is not accessible');
        toast({
          title: "Network Issue",
          description: "Audio file is not accessible. Please check your connection.",
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
      
      // Save progress every 10 seconds
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
      
      // Resume from saved position
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

  // Mobile-optimized play/pause functionality
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
        console.log('Attempting to play audio on mobile:', isMobile, audioUrl);
        
        // Mobile-specific audio preparation
        if (isMobile) {
          audioRef.current.load(); // Reload audio element
          await new Promise(resolve => setTimeout(resolve, 100)); // Small delay
        }
        
        const playPromise = audioRef.current.play();
        
        if (playPromise !== undefined) {
          await playPromise;
        }
        
        setIsPlaying(true);
        setRetryCount(0);
        
        console.log('Audio playback started successfully');
      }
    } catch (error: any) {
      console.error('Error in audio playback:', error);
      setIsPlaying(false);
      
      if (error.name === 'NotAllowedError') {
        toast({
          title: "User Interaction Required",
          description: "Please tap the play button again to start playback.",
          variant: "destructive"
        });
      } else if (error.name === 'NotSupportedError') {
        toast({
          title: "Format Not Supported",
          description: "Audio format not supported on this device. Please try a different network or refresh the page.",
          variant: "destructive"
        });
        
        // Try to reinitialize on format error
        if (retryCount < 2) {
          console.log('Retrying due to format error...');
          setRetryCount(prev => prev + 1);
          setTimeout(() => initializeAudio(true), 1000);
        }
      } else if (error.name === 'AbortError') {
        toast({
          title: "Network Issue",
          description: "Playback was interrupted. Please check your connection and try again.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Playback Failed",
          description: isMobile 
            ? "Unable to play audio on mobile. Please check your network connection and try again."
            : "Unable to play audio. Please check your connection and try again.",
          variant: "destructive"
        });
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

  // Initialize audio when component mounts or path changes
  useEffect(() => {
    if (audioPath) {
      console.log('Audio path changed, reinitializing:', audioPath);
      initializeAudio();
    }
  }, [user, audioPath, bookId]);

  // Save progress on unmount
  useEffect(() => {
    return () => {
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
    isMobile,
    togglePlay,
    seekTo,
    skip,
    handleTimeUpdate,
    handleLoadedMetadata,
    handleEnded,
    initializeAudio
  };
};
