
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
  });

  const audioRef = useRef<HTMLAudioElement>(null);

  const startPlayback = useCallback((book: AudioPlayerState['currentBook']) => {
    console.log('Starting playback for book:', book);
    setState(prev => ({
      ...prev,
      currentBook: book,
      isPlaying: false, // Will be set to true when audio actually starts playing
    }));

    // Set audio source
    if (audioRef.current && book) {
      audioRef.current.src = `/audio/${book.audioPath}`;
      audioRef.current.load();
    }
  }, []);

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
        setState(prev => ({ ...prev, isPlaying: false }));
      } else {
        console.log('Playing audio');
        await audioRef.current.play();
        setState(prev => ({ ...prev, isPlaying: true }));
      }
    } catch (error) {
      console.error('Error toggling playback:', error);
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
    console.log('Setting mini player visibility:', show, 'Current book:', state.currentBook);
    setState(prev => ({
      ...prev,
      showMiniPlayer: show,
    }));
  }, [state.currentBook]);

  const seekTo = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setState(prev => ({ ...prev, currentTime: time }));
    }
  }, []);

  // Audio event handlers
  const handleTimeUpdate = useCallback(() => {
    if (audioRef.current) {
      const currentTime = audioRef.current.currentTime;
      const duration = audioRef.current.duration || 0;
      updateProgress(currentTime, duration);
    }
  }, [updateProgress]);

  const handleLoadedMetadata = useCallback(() => {
    if (audioRef.current) {
      const duration = audioRef.current.duration;
      setState(prev => ({ ...prev, duration }));
    }
  }, []);

  const handleEnded = useCallback(() => {
    setState(prev => ({ ...prev, isPlaying: false, currentTime: 0 }));
  }, []);

  const handlePlay = useCallback(() => {
    setState(prev => ({ ...prev, isPlaying: true }));
  }, []);

  const handlePause = useCallback(() => {
    setState(prev => ({ ...prev, isPlaying: false }));
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

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, [handleTimeUpdate, handleLoadedMetadata, handleEnded, handlePlay, handlePause]);

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
