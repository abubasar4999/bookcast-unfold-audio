
import React from 'react';
import { Play, Pause, SkipBack, SkipForward, RotateCcw, ChevronDown, RefreshCw, Smartphone, AlertTriangle } from 'lucide-react';
import { useSecureAudio } from '@/hooks/useSecureAudio';
import { useAuth } from '@/contexts/AuthContext';
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

  React.useEffect(() => {
    onPlayStateChange?.(isPlaying);
  }, [isPlaying, onPlayStateChange]);

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

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-2"></div>
        <span className="text-white text-center">
          {isMobile && <Smartphone size={16} className="inline mr-2" />}
          Loading audio...
        </span>
      </div>
    );
  }

  if (!audioUrl) {
    return (
      <div className="text-center p-4">
        <div className="flex items-center justify-center mb-3">
          <AlertTriangle size={20} className="text-red-400 mr-2" />
          <span className="text-gray-400">Unable to load audio</span>
        </div>
        <p className="text-gray-500 text-sm mb-4">
          Please check your connection and try again.
        </p>
        <Button 
          onClick={handleRetry}
          variant="outline"
          size="sm"
          className="text-white border-gray-600 hover:bg-gray-700"
        >
          <RefreshCw size={16} className="mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full">
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
      <div className="mb-6">
        <input
          type="range"
          min="0"
          max={duration || 0}
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          style={{
            background: `linear-gradient(to right, #ffffff 0%, #ffffff ${(currentTime / duration) * 100}%, #374151 ${(currentTime / duration) * 100}%, #374151 100%)`
          }}
        />
        <div className="flex justify-between text-gray-400 text-sm mt-2">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
        
        {/* Resume indicator */}
        {user && progress && progress.current_position > 0 && !usingDemoAudio && (
          <div className="flex items-center text-purple-400 text-xs mt-1">
            <RotateCcw size={12} className="mr-1" />
            <span>Resume from {formatTime(progress.current_position)}</span>
          </div>
        )}
      </div>

      {/* Control Buttons */}
      <div className="flex items-center justify-center gap-8">
        <button 
          onClick={() => skip(-15)}
          className="p-3 hover:bg-gray-800 rounded-full transition-colors"
          disabled={!audioUrl}
        >
          <SkipBack size={28} className="text-white" />
        </button>

        <div className="relative">
          <button
            onClick={togglePlay}
            className={`w-16 h-16 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors disabled:opacity-50 ${
              isMobile ? 'active:scale-95' : ''
            }`}
            disabled={!audioUrl || isLoading}
          >
            {isPlaying ? (
              <Pause size={32} className="text-black" />
            ) : (
              <Play size={32} className="text-black ml-1" />
            )}
          </button>
        </div>

        <button 
          onClick={() => skip(15)}
          className="p-3 hover:bg-gray-800 rounded-full transition-colors"
          disabled={!audioUrl}
        >
          <SkipForward size={28} className="text-white" />
        </button>
      </div>

      {/* Playback Speed Control */}
      <div className="flex items-center justify-center mt-6">
        <DropdownMenu>
          <DropdownMenuTrigger className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
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
