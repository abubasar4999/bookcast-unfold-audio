
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

  // Generate public URL for audio playback
  const generateAudioUrl = (path: string): string => {
    if (!path) {
      console.error('Audio path is empty');
      return '';
    }

    console.log('Processing audio path:', path);
    
    // Check if the path is already a full URL
    if (path.startsWith('http://') || path.startsWith('https://')) {
      console.log('Audio path is already a full URL:', path);
      return path;
    }
    
    try {
      // Generate public URL for storage bucket
      const { data } = supabase.storage
        .from('book-audios')
        .getPublicUrl(path);
      
      console.log('Generated public URL from path:', data.publicUrl);
      return data.publicUrl;
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

  // Save listening progress with proper upsert handling
  const saveProgress = async (position: number, audioDuration?: number) => {
    if (!user) return;

    try {
      // First try to update existing record
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
        // Update existing record
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
        // Insert new record
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

  // Test audio URL accessibility
  const testAudioUrl = async (url: string): Promise<boolean> => {
    try {
      const response = await fetch(url, {
        method: 'HEAD',
        headers: {
          'Accept': 'audio/*'
        }
      });
      
      console.log('Audio URL test response:', response.status);
      return response.ok;
    } catch (error) {
      console.error('Audio URL test failed:', error);
      return false;
    }
  };

  // Initialize audio
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
      
      // Test URL accessibility
      const isAccessible = await testAudioUrl(finalAudioUrl);
      if (!isAccessible) {
        console.warn('Audio URL may not be accessible');
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

  // Handle audio metadata loaded
  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      const audioDuration = audioRef.current.duration;
      setDuration(audioDuration);
      console.log('Audio duration loaded:', audioDuration);
      
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

  // Play/pause with simplified retry logic
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
        
        // Simple play attempt
        await audioRef.current.play();
        setIsPlaying(true);
        console.log('Audio playback started successfully');
      }
    } catch (error: any) {
      console.error('Error in audio playback:', error);
      setIsPlaying(false);
      
      // Provide specific error handling
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
