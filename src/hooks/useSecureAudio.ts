
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { UseSecureAudioProps, ListeningProgress } from '@/types/audio';
import { generateAudioUrl, testAudioUrl, getDemoAudioUrl } from '@/utils/audioUrlUtils';
import { loadListeningProgress, saveListeningProgress } from '@/utils/progressUtils';
import { detectMobileDevice, isSlowNetwork } from '@/utils/networkUtils';

export const useSecureAudio = ({ bookId, audioPath }: UseSecureAudioProps) => {
  const { user } = useAuth();
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState<ListeningProgress | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [usingDemoAudio, setUsingDemoAudio] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const isMobile = detectMobileDevice();
  const isSlowNet = isSlowNetwork();

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
    console.log('Initializing audio:', { audioPath, isMobile, isSlowNet });
    
    try {
      let finalAudioUrl = generateAudioUrl(audioPath, isMobile);
      
      if (!finalAudioUrl) {
        console.error('Failed to get valid audio URL');
        throw new Error('Unable to generate audio URL');
      }

      // Test URL accessibility
      const isAccessible = await testAudioUrl(finalAudioUrl);
      
      if (!isAccessible) {
        console.error('Primary audio URL is not accessible, using demo audio');
        
        // Use demo audio as fallback
        finalAudioUrl = getDemoAudioUrl();
        setUsingDemoAudio(true);
        
        toast({
          title: "Using Demo Audio",
          description: "The requested audio file is not available. Playing demo audio instead.",
          variant: "default"
        });
      } else {
        setUsingDemoAudio(false);
      }
      
      setAudioUrl(finalAudioUrl);
      setRetryCount(0);
      
      // Load progress only if user is authenticated and not using demo
      if (user && !usingDemoAudio) {
        const userProgress = await loadListeningProgress(user.id, bookId);
        if (userProgress) {
          setProgress(userProgress);
          setCurrentTime(userProgress.current_position);
        }
      }
    } catch (error) {
      console.error('Failed to initialize audio:', error);
      
      // Fallback to demo audio
      const demoUrl = getDemoAudioUrl();
      setAudioUrl(demoUrl);
      setUsingDemoAudio(true);
      
      toast({
        title: "Using Demo Audio",
        description: "Unable to load the requested audio. Playing demo audio instead.",
        variant: "default"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const newTime = audioRef.current.currentTime;
      setCurrentTime(newTime);
      
      // Save progress every 10 seconds (only for real audio, not demo)
      if (user && !usingDemoAudio && Math.floor(newTime) % 10 === 0) {
        saveListeningProgress(user.id, bookId, newTime, duration);
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      const audioDuration = audioRef.current.duration;
      setDuration(audioDuration);
      console.log('Audio duration loaded:', audioDuration);
      
      // Resume from saved position (only for real audio, not demo)
      if (user && progress && progress.current_position > 0 && !usingDemoAudio) {
        audioRef.current.currentTime = progress.current_position;
        setCurrentTime(progress.current_position);
      }
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    if (user && !usingDemoAudio) {
      saveListeningProgress(user.id, bookId, 0, duration);
    }
  };

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
        if (user && !usingDemoAudio) {
          saveListeningProgress(user.id, bookId, currentTime, duration);
        }
      } else {
        console.log('Attempting to play audio:', { isMobile, audioUrl, usingDemoAudio });
        
        // Mobile-specific preparation
        if (isMobile) {
          audioRef.current.load();
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        const playPromise = audioRef.current.play();
        
        if (playPromise !== undefined) {
          await playPromise;
        }
        
        setIsPlaying(true);
        setRetryCount(0);
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
          description: "This audio format is not supported on your device.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Playback Failed",
          description: "Unable to play audio. Please check your connection.",
          variant: "destructive"
        });
      }
    }
  };

  const seekTo = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
      if (user && !usingDemoAudio) {
        saveListeningProgress(user.id, bookId, time, duration);
      }
    }
  };

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

  useEffect(() => {
    return () => {
      if (user && currentTime > 0 && !usingDemoAudio) {
        saveListeningProgress(user.id, bookId, currentTime, duration);
      }
    };
  }, [currentTime, user, bookId, duration, usingDemoAudio]);

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
    usingDemoAudio,
    togglePlay,
    seekTo,
    skip,
    handleTimeUpdate,
    handleLoadedMetadata,
    handleEnded,
    initializeAudio
  };
};
