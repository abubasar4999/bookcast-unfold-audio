import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowDown, Play, Heart } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Book } from '@/hooks/useBooks';
import RelatedBooksCarousel from '@/components/RelatedBooksCarousel';
import PersonalizedRecommendations from '@/components/PersonalizedRecommendations';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';

const BookDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [book, setBook] = useState<Book | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);

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
          setBook({
            ...data,
            cover: data.cover_url,
          });
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBook();
  }, [id]);

  const handleStartListening = () => {
    if (!user) {
      setShowAuthDialog(true);
      return;
    }
    navigate(`/player/${id}`);
  };

  const handleSaveToLibrary = () => {
    if (!user) {
      setShowAuthDialog(true);
      return;
    }
    setIsLiked(!isLiked);
    // In real app, this would save to user's library
  };

  const handleAuthDialogAction = () => {
    setShowAuthDialog(false);
    navigate('/auth');
  };

  if (isLoading) {
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
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-purple-950/20 pb-20">
        {/* Hero Section with Book Cover */}
        <div className="relative h-[70vh] overflow-hidden">
          <div className="absolute inset-0">
            <img
              src={book.cover || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop'}
              alt={book.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/60 to-transparent" />
          </div>
          
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="absolute top-12 left-4 w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center z-10"
          >
            <ArrowDown size={20} className="text-white rotate-90" />
          </button>

          {/* Book Info Overlay */}
          <div className="absolute bottom-8 left-4 right-4">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-white mb-2 leading-tight">
                {book.title}
              </h1>
              <p className="text-purple-300 text-lg mb-1">
                by {book.author}
              </p>
              <div className="flex items-center gap-4 text-gray-300 text-sm">
                <span>{book.genre}</span>
                {book.duration && (
                  <>
                    <span>•</span>
                    <span>{book.duration}</span>
                  </>
                )}
                {book.created_at && (
                  <>
                    <span>•</span>
                    <span>{new Date(book.created_at).toLocaleDateString()}</span>
                  </>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleStartListening}
                className="flex-1 bg-white text-black font-semibold py-4 px-6 rounded-full flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors"
              >
                <Play size={20} />
                Start Listening
              </button>
              <button
                onClick={handleSaveToLibrary}
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
                  isLiked 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <Heart size={20} className={isLiked ? 'fill-current' : ''} />
              </button>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="px-4 py-6 space-y-6">
          {/* Book Info */}
          <div className="bg-gradient-to-r from-gray-900/50 to-gray-800/50 rounded-xl p-4 backdrop-blur-sm">
            <h3 className="text-white font-semibold mb-2">Book Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Author:</span>
                <span className="text-white">{book.author}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Genre:</span>
                <span className="text-white">{book.genre}</span>
              </div>
              {book.duration && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Duration:</span>
                  <span className="text-white">{book.duration}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-400">Access:</span>
                <span className="text-green-400">✓ Public</span>
              </div>
            </div>
          </div>

          {/* Description */}
          {book.description && (
            <div>
              <h3 className="text-white font-semibold mb-3">About This Book</h3>
              <p className="text-gray-300 leading-relaxed">
                {book.description}
              </p>
            </div>
          )}

          {/* Personalized Recommendations - Replaces the features grid */}
          <PersonalizedRecommendations 
            currentBookId={id || ''}
            currentBookGenre={book.genre}
          />
        </div>

        {/* Related Books Carousel */}
        {id && <RelatedBooksCarousel currentBookId={id} />}
      </div>

      {/* Auth Required Dialog */}
      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
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
            <Button variant="outline" onClick={() => setShowAuthDialog(false)} className="w-full">
              Continue Browsing
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BookDetailPage;
