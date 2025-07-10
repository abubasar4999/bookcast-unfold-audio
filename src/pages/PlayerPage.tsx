
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Share, Heart, ChevronDown } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { useAudioPlayer } from '@/contexts/AudioPlayerContext';
import { supabase } from '@/integrations/supabase/client';
import { Book } from '@/hooks/useBooks';
import SecureAudioPlayer from '@/components/SecureAudioPlayer';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';

const PlayerPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { startPlayback, setShowMiniPlayer, updateProgress } = useAudioPlayer();
  const [book, setBook] = useState<Book | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!loading && !user) {
      setShowAuthDialog(true);
    }
  }, [user, loading]);

  useEffect(() => {
    const fetchBook = async () => {
      if (!id) return;
      
      try {
        const { data, error } = await supabase
          .from('books')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          console.error('Error fetching book:', error);
          return;
        }

        if (data) {
          const bookData = {
            ...data,
            cover: data.cover_url,
          };
          setBook(bookData);
          
          // Initialize global audio state
          startPlayback({
            id: data.id,
            title: data.title,
            author: data.author,
            cover: data.cover_url || '',
            audioPath: data.audio_path || '',
          });
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBook();
  }, [id, startPlaybook]);

  // Hide mini player when on player page
  useEffect(() => {
    setShowMiniPlayer(false);
    return () => {
      // Show mini player when leaving if audio is playing
      if (isPlaying) {
        setShowMiniPlayer(true);
      }
    };
  }, [setShowMiniPlayer, isPlaying]);

  const handleShare = () => {
    if (!book) return;
    
    if (navigator.share) {
      navigator.share({
        title: book.title,
        text: `Listen to ${book.title} by ${book.author}`,
        url: window.location.href,
      });
    }
  };

  const handlePlayStateChange = (playing: boolean) => {
    setIsPlaying(playing);
  };

  const handleLikeClick = () => {
    if (!user) {
      setShowAuthDialog(true);
      return;
    }
    setIsLiked(!isLiked);
  };

  const handleAuthDialogAction = () => {
    setShowAuthDialog(false);
    navigate('/auth');
  };

  const handleBackClick = () => {
    if (isPlaying) {
      setShowMiniPlayer(true);
    }
    navigate(-1);
  };

  // Show auth dialog if user is not authenticated
  if (!loading && !user) {
    return (
      <Dialog open={showAuthDialog} onOpenChange={() => navigate('/')}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">Sign In Required</DialogTitle>
            <DialogDescription className="text-center">
              Please sign in to start listening to audiobooks and access your library.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 mt-4">
            <Button onClick={handleAuthDialogAction} className="w-full">
              Sign In
            </Button>
            <Button variant="outline" onClick={() => navigate('/')} className="w-full">
              Back to Home
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-purple-950/20 flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-purple-950/20 flex items-center justify-center">
        <div className="text-white text-lg">Book not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-purple-950/20 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 pt-12 flex-shrink-0">
        <button
          onClick={handleBackClick}
          className="p-2 hover:bg-gray-800 rounded-full transition-colors"
        >
          <ChevronDown size={24} className="text-white" />
        </button>
        <div className="text-center">
          <p className="text-gray-400 text-sm">AUTHENTICATED STREAMING</p>
          <p className="text-gray-500 text-xs">Progress Saved</p>
        </div>
        <button 
          className="p-2 hover:bg-gray-800 rounded-full transition-colors"
          onClick={handleShare}
        >
          <Share size={24} className="text-white" />
        </button>
      </div>

      {/* Main Content - Optimized for viewport */}
      <div className="flex-1 flex flex-col px-6 min-h-0">
        {/* Album Art - Responsive sizing */}
        <div className="flex-1 flex items-center justify-center py-4 min-h-0">
          <div className="w-full max-w-xs md:max-w-sm lg:max-w-md">
            <img
              src={book.cover || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop'}
              alt={book.title}
              className="w-full aspect-square object-cover rounded-2xl shadow-2xl"
            />
          </div>
        </div>

        {/* Player Controls Section */}
        <div className="flex-shrink-0 pb-8 mobile-safe-bottom">
          {/* Track Info */}
          <div className="text-center mb-6">
            <h1 className="text-xl md:text-2xl font-bold text-white mb-2 leading-tight">
              {book.title}
            </h1>
            <p className="text-gray-400 mb-1">{book.author}</p>
            <p className="text-gray-500 text-sm">
              {book.genre}
              {book.duration && ` • ${book.duration}`}
            </p>
          </div>

          {/* Secure Audio Player */}
          <SecureAudioPlayer
            bookId={id || '1'}
            audioPath={book.audio_path || 'alchemist.mp3'}
            onPlayStateChange={handlePlayStateChange}
          />

          {/* Bottom Actions */}
          <div className="flex items-center justify-between mt-6">
            <button 
              className="p-2 hover:bg-gray-800 rounded-full transition-colors"
              onClick={handleShare}
            >
              <Share size={24} className="text-gray-400 hover:text-white" />
            </button>

            <button
              onClick={handleLikeClick}
              className="p-2 hover:bg-gray-800 rounded-full transition-colors"
            >
              <Heart
                size={24}
                className={`${
                  isLiked
                    ? "text-purple-400 fill-current"
                    : "text-gray-400 hover:text-white"
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerPage;
