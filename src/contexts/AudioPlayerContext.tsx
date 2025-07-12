
import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';

interface AudioPlayerState {
  isPlaying: boolean;
  currentBook: {
    id: string;
    title: string;
    author: string;
    cover: string;
    audioPath: string;
  } | null;
  currentTime: number;
  duration: number;
  showMiniPlayer: boolean;
  isLoading: boolean;
}

interface AudioPlayerContextType {
  state: AudioPlayerState;
  audioRef: React.RefObject<HTMLAudioElement>;
  startPlayback: (book: AudioPlayerState['currentBook']) => void;
  stopPlayback: () => void;
  togglePlayback: () => void;
  updateProgress: (currentTime: number, duration: number) => void;
  setShowMiniPlayer: (show: boolean) => void;
  seekTo: (time: number) => void;
}

const AudioPlayerContext = createContext<AudioPlayerContextType | undefined>(undefined);

export const useAudioPlayer = () => {
  const context = useContext(AudioPlayerContext);
  if (!context) {
    throw new Error('useAudioPlayer must be used within AudioPlayerProvider');
  }
  return context;
};

export const AudioPlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AudioPlayerState>({
    isPlaying: false,
    currentBook: null,
    currentTime: 0,
    duration: 0,
    showMiniPlayer: false,
    isLoading: false,
  });

  const audioRef = useRef<HTMLAudioElement>(null);
  const isInitializingRef = useRef(false);

  const generateAudioUrl = (audioPath: string): string => {
    if (!audioPath) {
      console.error('Audio path is empty');
      return '';
    }

    console.log('Generating audio URL for path:', audioPath);
    
    if (audioPath.startsWith('http://') || audioPath.startsWith('https://')) {
      console.log('Audio path is already a full URL:', audioPath);
      return audioPath;
    }
    
    const baseUrl = 'https://xtqzxtqmqxqorpamsllm.supabase.co/storage/v1/object/public/book-audios/';
    const finalUrl = baseUrl + audioPath;
    
    console.log('Generated audio URL:', finalUrl);
    return finalUrl;
  };

  const startPlayback = useCallback(async (book: AudioPlayerState['currentBook']) => {
    console.log('Starting playback for book:', book);
    
    if (!book || !audioRef.current || isInitializingRef.current) {
      console.error('No book, audio ref, or already initializing');
      return;
    }

    // If it's the same book, don't reinitialize
    if (state.currentBook?.id === book.id && audioRef.current.src) {
      console.log('Same book already loaded, not reinitializing');
      return;
    }

    isInitializingRef.current = true;

    setState(prev => ({
      ...prev,
      currentBook: book,
      isLoading: true,
    }));

    try {
      const audioUrl = generateAudioUrl(book.audioPath);
      if (!audioUrl) {
        console.error('Failed to generate audio URL');
        return;
      }

      console.log('Setting audio source to:', audioUrl);
      
      // Only set source if it's different
      if (audioRef.current.src !== audioUrl) {
        audioRef.current.src = audioUrl;
        audioRef.current.load();

        // Wait for audio to be ready
        await new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('Audio load timeout'));
          }, 10000);

          const handleCanPlay = () => {
            clearTimeout(timeout);
            audioRef.current?.removeEventListener('canplay', handleCanPlay);
            audioRef.current?.removeEventListener('error', handleError);
            resolve();
          };

          const handleError = (e: Event) => {
            clearTimeout(timeout);
            audioRef.current?.removeEventListener('canplay', handleCanPlay);
            audioRef.current?.removeEventListener('error', handleError);
            console.error('Audio load error:', e);
            reject(new Error('Audio load failed'));
          };

          audioRef.current?.addEventListener('canplay', handleCanPlay);
          audioRef.current?.addEventListener('error', handleError);
        });
      }

      console.log('Audio loaded successfully');
      setState(prev => ({ ...prev, isLoading: false }));
    } catch (error) {
      console.error('Error in startPlayback:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    } finally {
      isInitializingRef.current = false;
    }
  }, [state.currentBook?.id]);

  const stopPlayback = useCallback(() => {
    console.log('Stopping playback');
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setState(prev => ({
      ...prev,
      isPlaying: false,
      currentBook: null,
      showMiniPlayer: false,
      currentTime: 0,
      duration: 0,
      isLoading: false,
    }));
  }, []);

  const togglePlayback = useCallback(async () => {
    if (!audioRef.current || !state.currentBook) {
      console.log('No audio or book available');
      return;
    }

    try {
      if (state.isPlaying) {
        console.log('Pausing audio');
        audioRef.current.pause();
      } else {
        console.log('Playing audio from current position:', audioRef.current.currentTime);
        await audioRef.current.play();
      }
    } catch (error) {
      console.error('Error toggling playback:', error);
      setState(prev => ({ ...prev, isPlaying: false }));
    }
  }, [state.isPlaying, state.currentBook]);

  const updateProgress = useCallback((currentTime: number, duration: number) => {
    setState(prev => ({
      ...prev,
      currentTime,
      duration,
    }));
  }, []);

  const setShowMiniPlayer = useCallback((show: boolean) => {
    console.log('Setting mini player visibility:', show, 'Current book:', state.currentBook?.title);
    setState(prev => ({
      ...prev,
      showMiniPlayer: show,
    }));
  }, [state.currentBook]);

  const seekTo = useCallback((time: number) => {
    console.log('Seeking to:', time);
    if (audioRef.current && !isNaN(time) && time >= 0) {
      audioRef.current.currentTime = Math.min(time, audioRef.current.duration || time);
      setState(prev => ({ ...prev, currentTime: time }));
    }
  }, []);

  // Audio event handlers
  const handleTimeUpdate = useCallback(() => {
    if (audioRef.current && !isNaN(audioRef.current.currentTime)) {
      const currentTime = audioRef.current.currentTime;
      const duration = audioRef.current.duration || 0;
      updateProgress(currentTime, duration);
    }
  }, [updateProgress]);

  const handleLoadedMetadata = useCallback(() => {
    if (audioRef.current) {
      const duration = audioRef.current.duration;
      setState(prev => ({ ...prev, duration, isLoading: false }));
      console.log('Audio metadata loaded, duration:', duration);
    }
  }, []);

  const handleEnded = useCallback(() => {
    setState(prev => ({ ...prev, isPlaying: false, currentTime: 0 }));
  }, []);

  const handlePlay = useCallback(() => {
    console.log('Audio started playing');
    setState(prev => ({ ...prev, isPlaying: true }));
  }, []);

  const handlePause = useCallback(() => {
    console.log('Audio paused');
    setState(prev => ({ ...prev, isPlaying: false }));
  }, []);

  const handleError = useCallback((e: Event) => {
    console.error('Audio error:', e);
    setState(prev => ({ ...prev, isPlaying: false, isLoading: false }));
  }, []);

  // Setup audio event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('error', handleError);
    };
  }, [handleTimeUpdate, handleLoadedMetadata, handleEnded, handlePlay, handlePause, handleError]);

  return (
    <AudioPlayerContext.Provider
      value={{
        state,
        audioRef,
        startPlayback,
        stopPlayback,
        togglePlayback,
        updateProgress,
        setShowMiniPlayer,
        seekTo,
      }}
    >
      {children}
      {/* Global audio element that persists across navigation */}
      <audio
        ref={audioRef}
        preload="metadata"
        className="hidden"
        playsInline
        crossOrigin="anonymous"
      />
    </AudioPlayerContext.Provider>
  );
};
