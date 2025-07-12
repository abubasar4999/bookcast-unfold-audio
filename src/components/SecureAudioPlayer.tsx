
import React from 'react';
import { Play, Pause, ChevronDown, RefreshCw, Smartphone, AlertTriangle } from 'lucide-react';
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
  const { state: globalAudioState, togglePlayback, seekTo: globalSeekTo, audioRef } = useAudioPlayer();
  const [currentSpeed, setCurrentSpeed] = React.useState(1);
  
  // Use global audio state
  const isPlaying = globalAudioState.isPlaying;
  const currentTime = globalAudioState.currentTime;
  const duration = globalAudioState.duration;
  const isLoading = !globalAudioState.currentBook;

  // Sync with onPlayStateChange callback
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
    globalSeekTo(newTime);
  };

  const handleSpeedChange = (speed: number) => {
    setCurrentSpeed(speed);
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  };

  const skip = (seconds: number) => {
    const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
    globalSeekTo(newTime);
  };

  const speedOptions = [0.75, 1, 1.25, 1.5, 2];

  // Custom Skip Button Component
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
          <Smartphone size={16} className="inline mr-2" />
          Loading audio player...
        </span>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
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
        />

        {/* Main Play/Pause Button */}
        <button
          onClick={togglePlayback}
          className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center hover:from-purple-400 hover:to-pink-400 transition-all duration-200 shadow-lg hover:shadow-purple-500/25 disabled:opacity-50 hover:scale-105"
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
