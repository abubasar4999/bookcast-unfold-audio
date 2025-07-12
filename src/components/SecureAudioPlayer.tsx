
import React from 'react';
import { Play, Pause, ChevronDown, RefreshCw, Smartphone, AlertTriangle } from 'lucide-react';
import { useSecureAudio } from '@/hooks/useSecureAudio';
import { useAuth } from '@/contexts/AuthContext';
import { useAudioPlayer } from '@/contexts/AudioPlayerContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface SecureAudioPlayerProps {
  bookId: string;
  audioPath: string;
  onPlayStateChange?: (isPlaying: boolean) => void;
}

const SecureAudioPlayer: React.FC<SecureAudioPlayerProps> = ({
  bookId,
  audioPath,
  onPlayStateChange
}) => {
  const { user } = useAuth();
  const { state: globalAudioState, togglePlayback, updateProgress } = useAudioPlayer();
  const [currentSpeed, setCurrentSpeed] = React.useState(1);
  
  const {
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
  } = useSecureAudio({ bookId, audioPath });

  // Sync with global audio state
  React.useEffect(() => {
    onPlayStateChange?.(isPlaying);
    // Update global progress
    if (isPlaying && currentTime > 0 && duration > 0) {
      updateProgress(currentTime, duration);
    }
  }, [isPlaying, currentTime, duration, onPlayStateChange, updateProgress]);

  // Sync play state with global context
  const handleTogglePlay = React.useCallback(() => {
    togglePlay();
    togglePlayback(); // Sync with global state
  }, [togglePlay, togglePlayback]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    seekTo(newTime);
  };

  const handleSpeedChange = (speed: number) => {
    setCurrentSpeed(speed);
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  };

  const handleRetry = () => {
    console.log('Manual retry requested');
    initializeAudio(true);
  };

  const speedOptions = [0.75, 1, 1.25, 1.5, 2];

  // Custom Skip Button Component with improved design
  const SkipButton = ({ direction, onClick, disabled }: { 
    direction: 'backward' | 'forward'; 
    onClick: () => void;
    disabled?: boolean;
  }) => (
    <button 
      onClick={onClick}
      disabled={disabled}
      className="relative w-12 h-12 bg-gray-800/60 hover:bg-gray-700/80 rounded-full flex items-center justify-center transition-all duration-200 border border-gray-600/30 hover:border-purple-500/50 group disabled:opacity-50"
    >
      <div className="relative flex items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="relative z-10 flex items-center">
          {direction === 'backward' ? (
            <div className="flex items-center text-white text-xs font-bold">
              <span className="mr-1">10</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2l-7 7 7 7"/>
                <path d="M21 9H9"/>
              </svg>
            </div>
          ) : (
            <div className="flex items-center text-white text-xs font-bold">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9h12"/>
                <path d="M12 2l7 7-7 7"/>
              </svg>
              <span className="ml-1">10</span>
            </div>
          )}
        </div>
      </div>
    </button>
  );

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-2"></div>
        <span className="text-white text-center">
          {isMobile && <Smartphone size={16} className="inline mr-2" />}
          Loading audio player...
        </span>
      </div>
    );
  }

  if (!audioUrl) {
    return (
      <div className="text-center p-4">
        <div className="flex items-center justify-center mb-3">
          <AlertTriangle size={20} className="text-red-400 mr-2" />
          <span className="text-gray-400">Audio player unavailable</span>
        </div>
        <p className="text-gray-500 text-sm mb-4">
          Unable to load the audio file. Please check your internet connection.
        </p>
        <Button 
          onClick={handleRetry}
          variant="outline"
          size="sm"
          className="text-white border-gray-600 hover:bg-gray-700"
        >
          <RefreshCw size={16} className="mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Audio element */}
      <audio
        ref={audioRef}
        src={audioUrl}
        preload="metadata"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        className="hidden"
        playsInline
        controls={false}
        style={{ display: 'none' }}
        crossOrigin="anonymous"
      />

      {/* Demo audio warning */}
      {usingDemoAudio && (
        <div className="flex items-center justify-center mb-4">
          <div className="flex items-center text-yellow-400 text-xs bg-yellow-900/20 px-3 py-1 rounded-full">
            <AlertTriangle size={12} className="mr-1" />
            <span>Playing Demo Audio</span>
          </div>
        </div>
      )}

      {/* Mobile indicator */}
      {isMobile && (
        <div className="flex items-center justify-center mb-4">
          <div className="flex items-center text-blue-400 text-xs bg-blue-900/20 px-3 py-1 rounded-full">
            <Smartphone size={12} className="mr-1" />
            <span>Mobile Optimized</span>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      <div className="mb-8">
        <input
          type="range"
          min="0"
          max={duration || 0}
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          style={{
            background: `linear-gradient(to right, #a855f7 0%, #a855f7 ${(currentTime / duration) * 100}%, #374151 ${(currentTime / duration) * 100}%, #374151 100%)`
          }}
        />
        <div className="flex justify-between text-gray-400 text-sm mt-2">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center justify-center gap-6 mb-8">
        {/* Skip Backward 10s */}
        <SkipButton 
          direction="backward"
          onClick={() => skip(-10)}
          disabled={!audioUrl}
        />

        {/* Main Play/Pause Button */}
        <button
          onClick={handleTogglePlay}
          className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center hover:from-purple-400 hover:to-pink-400 transition-all duration-200 shadow-lg hover:shadow-purple-500/25 disabled:opacity-50 hover:scale-105"
          disabled={!audioUrl || isLoading}
        >
          {isPlaying ? (
            <Pause size={32} className="text-white" />
          ) : (
            <Play size={32} className="text-white ml-1" />
          )}
        </button>

        {/* Skip Forward 10s */}
        <SkipButton 
          direction="forward"
          onClick={() => skip(10)}
          disabled={!audioUrl}
        />
      </div>

      {/* Playback Speed Control */}
      <div className="flex items-center justify-center">
        <DropdownMenu>
          <DropdownMenuTrigger className="bg-gray-800/60 hover:bg-gray-700/80 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors border border-gray-600/30 hover:border-purple-500/50">
            <span className="text-sm font-medium">{currentSpeed}x Speed</span>
            <ChevronDown size={16} />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-gray-800 border-gray-700">
            {speedOptions.map((speed) => (
              <DropdownMenuItem
                key={speed}
                onClick={() => handleSpeedChange(speed)}
                className={`text-white hover:bg-gray-700 cursor-pointer ${
                  currentSpeed === speed ? 'bg-purple-600 hover:bg-purple-700' : ''
                }`}
              >
                {speed}x
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default SecureAudioPlayer;
