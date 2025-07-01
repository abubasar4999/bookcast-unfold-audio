
export interface UseSecureAudioProps {
  bookId: string;
  audioPath: string;
}

export interface ListeningProgress {
  current_position: number;
  duration: number | null;
}

export interface AudioUrlConfig {
  path: string;
  isMobile: boolean;
  retryCount: number;
}
