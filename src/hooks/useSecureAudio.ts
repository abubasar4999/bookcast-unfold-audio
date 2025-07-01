
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

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
  const audioRef = useRef<HTMLAudioElement>(null);

  // Generate public URL optimized for mobile data streaming
  const generateAudioUrl = (path: string): string => {
    if (!path) {
      console.error('Audio path is empty');
      return '';
    }

    console.log('Processing audio path:', path);
    
    // Check if the path is already a full URL
    if (path.startsWith('http://') || path.startsWith('https://')) {
      console.log('Audio path is already a full URL:', path);
      // Add mobile-friendly parameters to existing URLs
      const url = new URL(path);
      url.searchParams.set('cache-control', 'public, max-age=3600');
      url.searchParams.set('accept-ranges', 'bytes');
      return url.toString();
    }
    
    try {
      // Generate public URL optimized for mobile streaming
      const { data } = supabase.storage
        .from('book-audios')
        .getPublicUrl(path, {
          download: false,
          transform: {
            quality: 80 // Optimize for mobile data usage
          }
        });
      
      console.log('Generated public URL from path:', data.publicUrl);
      
      // Add mobile-optimized parameters
      const url = new URL(data.publicUrl);
      url.searchParams.set('cache-control', 'public, max-age=3600');
      url.searchParams.set('accept-ranges', 'bytes');
      
      return url.toString();
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
      const { error } = await supabase
        .from('listening_progress')
        .upsert({
          user_id: user.id,
          book_id: bookId,
          current_position: position,
          duration: audioDuration || duration,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error saving progress:', error);
      }
    } catch (error) {
      console.error('Failed to save progress:', error);
    }
  };

  // Test audio URL accessibility for mobile data
  const testAudioUrl = async (url: string): Promise<boolean> => {
    try {
      const response = await fetch(url, {
        method: 'HEAD',
        headers: {
          'Accept': 'audio/*',
          'Cache-Control': 'no-cache',
          'Range': 'bytes=0-1024' // Test partial content support
        }
      });
      
      console.log('Audio URL test response:', response.status, response.headers.get('accept-ranges'));
      return response.ok && response.status < 400;
    } catch (error) {
      console.error('Audio URL test failed:', error);
      return false;
    }
  };

  // Initialize audio with mobile-optimized settings
  const initializeAudio = async () => {
    if (!audioPath) {
      console.error('No audio path provided');
      return;
    }

    setIsLoading(true);
    console.log('Initializing audio with path:', audioPath);
    
    try {
      const finalAudioUrl = generateAudioUrl(audioPath);
      
      if (!finalAudioUrl) {
        console.error('Failed to get valid audio URL');
        setIsLoading(false);
        return;
      }
      
      console.log('Final audio URL:', finalAudioUrl);
      
      // Test URL accessibility before setting it
      const isAccessible = await testAudioUrl(finalAudioUrl);
      if (!isAccessible) {
        console.warn('Audio URL may not be accessible on mobile data');
      }
      
      setAudioUrl(finalAudioUrl);
      
      // Load progress only if user is authenticated
      if (user) {
        await loadProgress();
      }
    } catch (error) {
      console.error('Failed to initialize audio:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle audio time updates
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const newTime = audioRef.current.currentTime;
      setCurrentTime(newTime);
      
      // Save progress every 10 seconds (only for authenticated users)
      if (user && Math.floor(newTime) % 10 === 0) {
        saveProgress(newTime);
      }
    }
  };

  // Handle audio metadata loaded with mobile-specific settings
  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      const audioDuration = audioRef.current.duration;
      setDuration(audioDuration);
      console.log('Audio duration loaded:', audioDuration);
      
      // Apply mobile-optimized settings
      audioRef.current.preload = 'metadata';
      
      // Resume from saved position (only for authenticated users)
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
      saveProgress(0); // Reset progress when finished
    }
  };

  // Enhanced play/pause with mobile data retry logic
  const togglePlay = async () => {
    if (!audioRef.current || !audioUrl) {
      console.error('Audio element or URL not ready');
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
        console.log('Attempting to play audio from URL:', audioUrl);
        
        // Mobile-friendly play attempt with enhanced retry logic
        let playAttempts = 0;
        const maxAttempts = 5;
        
        while (playAttempts < maxAttempts) {
          try {
            // Pre-flight check for mobile data
            if (playAttempts > 0) {
              console.log(`Retry attempt ${playAttempts} for mobile data playback`);
              
              // Reload audio source on retry for mobile data issues
              const currentSrc = audioRef.current.src;
              audioRef.current.src = '';
              audioRef.current.load();
              audioRef.current.src = currentSrc;
              
              // Wait for audio to be ready
              await new Promise((resolve) => {
                const checkReady = () => {
                  if (audioRef.current && audioRef.current.readyState >= 2) {
                    resolve(true);
                  } else {
                    setTimeout(checkReady, 100);
                  }
                };
                checkReady();
              });
            }
            
            await audioRef.current.play();
            setIsPlaying(true);
            console.log('Audio playback started successfully');
            break;
          } catch (playError: any) {
            playAttempts++;
            console.warn(`Play attempt ${playAttempts} failed:`, playError.message);
            
            if (playAttempts >= maxAttempts) {
              // Final attempt failed
              if (playError.name === 'NotAllowedError') {
                console.error('Audio playback blocked - user interaction required');
              } else if (playError.name === 'NotSupportedError') {
                console.error('Audio format not supported or network issue');
              } else {
                console.error('Audio playback failed after all retries:', playError);
              }
              throw playError;
            }
            
            // Progressive delay for mobile data issues
            const delay = Math.min(1000 * Math.pow(2, playAttempts - 1), 5000);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
      }
    } catch (error: any) {
      console.error('Error in audio playback:', error);
      setIsPlaying(false);
      
      // Provide specific error handling for mobile data issues
      if (error.name === 'NotAllowedError') {
        console.error('Playback requires user interaction');
      } else if (error.name === 'NotSupportedError') {
        console.error('Audio format not supported or network connectivity issue');
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

  useEffect(() => {
    if (audioPath) {
      console.log('Audio path changed, reinitializing:', audioPath);
      initializeAudio();
    }
  }, [user, audioPath, bookId]);

  // Auto-save progress on unmount (only for authenticated users)
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
    togglePlay,
    seekTo,
    skip,
    handleTimeUpdate,
    handleLoadedMetadata,
    handleEnded,
    initializeAudio
  };
};
