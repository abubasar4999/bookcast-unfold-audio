
import React, { createContext, useContext, useState, useCallback } from 'react';

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
  startPlayback: (book: AudioPlayerState['currentBook']) => void;
  stopPlayback: () => void;
  togglePlayback: () => void;
  updateProgress: (currentTime: number, duration: number) => void;
  setShowMiniPlayer: (show: boolean) => void;
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

  const startPlayback = useCallback((book: AudioPlayerState['currentBook']) => {
    console.log('Starting playback for book:', book);
    setState(prev => ({
      ...prev,
      currentBook: book,
      isPlaying: true,
    }));
  }, []);

  const stopPlayback = useCallback(() => {
    console.log('Stopping playback');
    setState(prev => ({
      ...prev,
      isPlaying: false,
      currentBook: null,
      showMiniPlayer: false,
      currentTime: 0,
      duration: 0,
    }));
  }, []);

  const togglePlayback = useCallback(() => {
    console.log('Toggling playback, current state:', state.isPlaying);
    setState(prev => {
      const newIsPlaying = !prev.isPlaying;
      console.log('New playing state:', newIsPlaying);
      return {
        ...prev,
        isPlaying: newIsPlaying,
      };
    });
  }, [state.isPlaying]);

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

  return (
    <AudioPlayerContext.Provider
      value={{
        state,
        startPlayback,
        stopPlayback,
        togglePlayback,
        updateProgress,
        setShowMiniPlayer,
      }}
    >
      {children}
    </AudioPlayerContext.Provider>
  );
};
