
import React from 'react';
import { Play, Pause, X } from 'lucide-react';
import { useAudioPlayer } from '@/contexts/AudioPlayerContext';
import { useNavigate } from 'react-router-dom';

const MiniPlayer: React.FC = () => {
  const { state, togglePlayback, stopPlayback, seekTo } = useAudioPlayer();
  const navigate = useNavigate();

  console.log('MiniPlayer render:', { 
    showMiniPlayer: state.showMiniPlayer, 
    currentBook: state.currentBook?.title, 
    isPlaying: state.isPlaying,
    hasCurrentBook: !!state.currentBook,
    currentTime: state.currentTime,
    duration: state.duration
  });

  if (!state.showMiniPlayer || !state.currentBook) {
    return null;
  }

  const progressPercentage = state.duration > 0 ? (state.currentTime / state.duration) * 100 : 0;

  const handlePlayerClick = () => {
    console.log('Mini player clicked, navigating to player');
    navigate(`/player/${state.currentBook?.id}`);
  };

  const handleStopClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Stop button clicked');
    stopPlayback();
  };

  const handlePlayPauseClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Play/pause button clicked, current state:', state.isPlaying);
    togglePlayback();
  };

  const handleProgressClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const progressBarWidth = rect.width;
    const clickPercentage = clickX / progressBarWidth;
    const newTime = clickPercentage * state.duration;
    
    console.log('Progress bar clicked:', { clickPercentage, newTime, duration: state.duration });
    seekTo(newTime);
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed bottom-16 md:bottom-4 left-0 right-0 z-40">
      <div 
        onClick={handlePlayerClick}
        className="bg-gradient-to-r from-gray-900/95 to-gray-800/95 backdrop-blur-lg border-t border-gray-700/50 shadow-2xl cursor-pointer hover:shadow-purple-500/10 transition-all duration-300 mx-0"
      >
        {/* Functional Progress bar */}
        <div 
          className="absolute top-0 left-0 right-0 h-1 bg-gray-700/50 overflow-hidden cursor-pointer"
          onClick={handleProgressClick}
        >
          <div 
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        <div className="flex items-center p-3 pt-4">
          {/* Book cover */}
          <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 shadow-lg">
            <img
              src={state.currentBook.cover || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop'}
              alt={state.currentBook.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Book info */}
          <div className="flex-1 mx-3 min-w-0">
            <h4 className="text-white text-sm font-medium truncate">
              {state.currentBook.title}
            </h4>
            <p className="text-gray-400 text-xs truncate">
              {state.currentBook.author}
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
              <span>{formatTime(state.currentTime)}</span>
              <span>/</span>
              <span>{formatTime(state.duration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePlayPauseClick}
              disabled={state.isLoading}
              className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center hover:from-purple-400 hover:to-pink-400 transition-all duration-200 shadow-lg disabled:opacity-50"
            >
              {state.isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : state.isPlaying ? (
                <Pause size={16} className="text-white" />
              ) : (
                <Play size={16} className="text-white ml-0.5" />
              )}
            </button>

            <button
              onClick={handleStopClick}
              className="w-8 h-8 bg-gray-700/60 hover:bg-gray-600/80 rounded-full flex items-center justify-center transition-colors"
            >
              <X size={14} className="text-gray-300" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MiniPlayer;
