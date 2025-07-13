
import React from 'react';
import { Play, Pause, ChevronDown, Smartphone } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useAudioPlayer } from '@/contexts/AudioPlayerContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  
  const isPlaying = globalAudioState.isPlaying;
  const currentTime = globalAudioState.currentTime;
  const duration = globalAudioState.duration;
  const isLoading = globalAudioState.isLoading;

  React.useEffect(() => {
    onPlayStateChange?.(isPlaying);
  }, [isPlaying, onPlayStateChange]);

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    if (!isNaN(newTime)) {
      globalSeekTo(newTime);
    }
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

  const SkipButton = ({ direction, onClick, disabled }: { 
    direction: 'backward' | 'forward'; 
    onClick: () => void;
    disabled?: boolean;
  }) => (
    <button 
      onClick={onClick}
      disabled={disabled}
      className="relative w-10 h-10 sm:w-12 sm:h-12 bg-gray-800/60 hover:bg-gray-700/80 rounded-full flex items-center justify-center transition-all duration-200 border border-gray-600/30 hover:border-purple-500/50 group disabled:opacity-50"
    >
      <div className="relative flex items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="relative z-10 flex items-center">
          {direction === 'backward' ? (
            <div className="flex items-center text-white text-[10px] sm:text-xs font-bold">
              <span className="mr-0.5 sm:mr-1">10</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="sm:w-4 sm:h-4">
                <path d="M12 2l-7 7 7 7"/>
                <path d="M21 9H9"/>
              </svg>
            </div>
          ) : (
            <div className="flex items-center text-white text-[10px] sm:text-xs font-bold">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="sm:w-4 sm:h-4">
                <path d="M3 9h12"/>
                <path d="M12 2l7 7-7 7"/>
              </svg>
              <span className="ml-0.5 sm:ml-1">10</span>
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
        <span className="text-white text-center text-sm">
          <Smartphone size={14} className="inline mr-2" />
          Loading audio player...
        </span>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      {/* Progress Bar */}
      <div className="mb-6">
        <input
          type="range"
          min="0"
          max={duration || 0}
          value={currentTime || 0}
          onChange={handleSeek}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          style={{
            background: `linear-gradient(to right, #a855f7 0%, #a855f7 ${(currentTime / duration) * 100}%, #374151 ${(currentTime / duration) * 100}%, #374151 100%)`
          }}
        />
        <div className="flex justify-between text-gray-400 text-xs mt-2">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center justify-center gap-4 sm:gap-6 mb-6">
        <SkipButton 
          direction="backward"
          onClick={() => skip(-10)}
        />

        <button
          onClick={togglePlayback}
          disabled={isLoading}
          className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center hover:from-purple-400 hover:to-pink-400 transition-all duration-200 shadow-lg hover:shadow-purple-500/25 disabled:opacity-50 hover:scale-105"
        >
          {isPlaying ? (
            <Pause size={24} className="text-white sm:w-8 sm:h-8" />
          ) : (
            <Play size={24} className="text-white ml-1 sm:w-8 sm:h-8" />
          )}
        </button>

        <SkipButton 
          direction="forward"
          onClick={() => skip(10)}
        />
      </div>

      {/* Playback Speed Control */}
      <div className="flex items-center justify-center">
        <DropdownMenu>
          <DropdownMenuTrigger className="bg-gray-800/60 hover:bg-gray-700/80 text-white px-3 py-2 rounded-lg flex items-center gap-2 transition-colors border border-gray-600/30 hover:border-purple-500/50 text-sm">
            <span className="font-medium">{currentSpeed}x Speed</span>
            <ChevronDown size={14} />
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
