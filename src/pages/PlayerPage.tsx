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
  const { state, startPlayback, setShowMiniPlayer, updateProgress } = useAudioPlayer();
  const [book, setBook] = useState<Book | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
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
          
          // Only initialize if it's a different book or no current book
          if (!state.currentBook || state.currentBook.id !== data.id) {
            console.log('Initializing new book:', data.title);
            startPlayback({
              id: data.id,
              title: data.title,
              author: data.author,
              cover: data.cover_url || '',
              audioPath: data.audio_path || '',
            });
          } else {
            console.log('Same book already loaded, not reinitializing');
          }
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBook();
  }, [id, startPlayback, state.currentBook]);

  // Hide mini player when on player page, show when leaving if audio is available
  useEffect(() => {
    console.log('PlayerPage mounted, hiding mini player');
    setShowMiniPlayer(false);
    
    return () => {
      console.log('PlayerPage unmounting, current state:', { 
        isPlaying: state.isPlaying, 
        currentBook: state.currentBook?.title,
        hasAudio: !!state.currentBook 
      });
      
      if (state.currentBook) {
        console.log('Showing mini player because there is a current book');
        setShowMiniPlayer(true);
      }
    };
  }, [setShowMiniPlayer, state.currentBook]);

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
    console.log('Play state changed in PlayerPage:', playing);
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
    console.log('Back clicked, current state:', { 
      isPlaying: state.isPlaying, 
      currentBook: state.currentBook?.title,
      hasAudio: !!state.currentBook 
    });
    
    if (state.currentBook) {
      console.log('Setting mini player to show before navigation');
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
      <div className="h-screen bg-transparent flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="h-screen bg-transparent flex items-center justify-center">
        <div className="text-white text-lg">Book not found</div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-transparent flex flex-col overflow-hidden">
      {/* Header - Compact */}
      <div className="flex items-center justify-between p-4 pt-safe-top flex-shrink-0" style={{ paddingTop: 'max(env(safe-area-inset-top), 2rem)' }}>
        <button
          onClick={handleBackClick}
          className="p-2 hover:bg-gray-800 rounded-full transition-colors"
        >
          <ChevronDown size={20} className="text-white" />
        </button>
        <div className="text-center">
          <p className="text-gray-400 text-xs">AUTHENTICATED STREAMING</p>
          <p className="text-gray-500 text-[10px]">Progress Saved</p>
        </div>
        <button 
          className="p-2 hover:bg-gray-800 rounded-full transition-colors"
          onClick={handleShare}
        >
          <Share size={20} className="text-white" />
        </button>
      </div>

      {/* Main Content - Optimized for mobile screens */}
      <div className="flex-1 flex flex-col px-4 pb-safe-bottom min-h-0" style={{ paddingBottom: 'calc(10vh + env(safe-area-inset-bottom, 1rem))' }}>
        {/* Album Art - Responsive sizing */}
        <div className="flex-shrink-0 flex items-center justify-center mb-4">
          <div className="w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64">
            <img
              src={book.cover || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop'}
              alt={book.title}
              className="w-full h-full object-cover rounded-2xl shadow-2xl"
            />
          </div>
        </div>

        {/* Track Info - Compact */}
        <div className="text-center mb-4 flex-shrink-0">
          <h1 className="text-base sm:text-lg font-bold text-white mb-1 leading-tight line-clamp-2 px-2">
            {book.title}
          </h1>
          <p className="text-gray-400 text-sm mb-1">{book.author}</p>
          <p className="text-gray-500 text-xs">
            {book.genre}
            {book.duration && ` • ${book.duration}`}
          </p>
        </div>

        {/* Player Controls - Flex remaining space */}
        <div className="flex-1 flex flex-col justify-center min-h-0">
          <SecureAudioPlayer
            bookId={id || '1'}
            audioPath={book.audio_path || 'alchemist.mp3'}
            onPlayStateChange={handlePlayStateChange}
          />
        </div>

        {/* Bottom Actions - Fixed at bottom */}
        <div className="flex items-center justify-between mt-4 flex-shrink-0">
          <button 
            className="p-2 hover:bg-gray-800 rounded-full transition-colors"
            onClick={handleShare}
          >
            <Share size={18} className="text-gray-400 hover:text-white" />
          </button>

          <button
            onClick={handleLikeClick}
            className="p-2 hover:bg-gray-800 rounded-full transition-colors"
          >
            <Heart
              size={18}
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
  );
};

export default PlayerPage;
