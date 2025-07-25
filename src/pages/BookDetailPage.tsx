
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowDown, Play, Heart, Bookmark } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Book } from '@/hooks/useBooks';
import { useLikedBooks } from '@/hooks/useLikedBooks';
import { useSavedBooks } from '@/hooks/useSavedBooks';
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
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { isBookLiked, toggleLike } = useLikedBooks();
  const { isBookSaved, toggleSave } = useSavedBooks();

  useEffect(() => {
    const fetchBook = async () => {
      if (!id) return;
      
      try {
        console.log('Fetching book with ID:', id);
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
          console.log('Book data fetched:', data);
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

  const isBookCurrentlyLiked = id ? isBookLiked(id) : false;
  const isBookCurrentlySaved = id ? isBookSaved(id) : false;

  const handleStartListening = () => {
    if (!user) {
      setShowAuthDialog(true);
      return;
    }
    navigate(`/player/${id}`);
  };

  const handleLikeBook = async () => {
    if (!user) {
      setShowAuthDialog(true);
      return;
    }

    if (isLiking || !id) return;

    setIsLiking(true);
    try {
      await toggleLike(id);
    } catch (error) {
      // Error is already handled in the hook
    } finally {
      setIsLiking(false);
    }
  };

  const handleSaveBook = async () => {
    if (!user) {
      setShowAuthDialog(true);
      return;
    }

    if (isSaving || !id) return;

    setIsSaving(true);
    try {
      await toggleSave(id);
    } catch (error) {
      // Error is already handled in the hook
    } finally {
      setIsSaving(false);
    }
  };

  const handleAuthDialogAction = () => {
    setShowAuthDialog(false);
    navigate('/auth');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <div className="text-white text-lg">Book not found</div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-transparent pb-20">
        {/* Hero Section with Book Cover */}
        <div className="relative h-[70vh] overflow-hidden">
          <div className="absolute inset-0">
            <img
              src={book.cover || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop'}
              alt={book.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
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
                onClick={handleLikeBook}
                disabled={isLiking}
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                  isBookCurrentlyLiked 
                    ? 'bg-red-600 text-white hover:bg-red-500 animate-pulse' 
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                } ${isLiking ? 'scale-95 opacity-75' : ''}`}
              >
                {isLiking ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
                ) : (
                  <Heart 
                    size={20} 
                    className={`${isBookCurrentlyLiked ? 'fill-current animate-in zoom-in-50 duration-200' : ''}`} 
                  />
                )}
              </button>
              <button
                onClick={handleSaveBook}
                disabled={isSaving}
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                  isBookCurrentlySaved 
                    ? 'bg-blue-600 text-white hover:bg-blue-500 animate-pulse' 
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                } ${isSaving ? 'scale-95 opacity-75' : ''}`}
              >
                {isSaving ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
                ) : (
                  <Bookmark 
                    size={20} 
                    className={`${isBookCurrentlySaved ? 'fill-current animate-in zoom-in-50 duration-200' : ''}`} 
                  />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="px-4 py-6 space-y-6">
          {/* Book Info */}
          <div className="bg-black/30 backdrop-blur-sm rounded-xl p-4">
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
                <span className="text-gray-400">Status:</span>
                <div className="flex items-center gap-2">
                  <span className="text-green-400">✓ Available</span>
                  {isBookCurrentlyLiked && <Heart size={12} className="text-red-400 fill-current" />}
                  {isBookCurrentlySaved && <Bookmark size={12} className="text-blue-400 fill-current" />}
                </div>
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
              Please sign in to start listening to audiobooks and save books to your library.
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
