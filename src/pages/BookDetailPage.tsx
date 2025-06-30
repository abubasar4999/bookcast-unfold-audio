
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowDown, Play, Heart } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Book } from '@/hooks/useBooks';
import RelatedBooksCarousel from '@/components/RelatedBooksCarousel';

const BookDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [book, setBook] = useState<Book | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);

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
    navigate(`/player/${id}`);
  };

  const handleSaveToLibrary = () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    setIsLiked(!isLiked);
    // In real app, this would save to user's library
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-white text-lg">Book not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 pb-20">
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
            {!user && (
              <div className="mt-2 text-green-400 text-sm flex items-center">
                <span>🎵 Free to listen • Sign in to save progress</span>
              </div>
            )}
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
        {/* Public Access Notice */}
        <div className="bg-green-800/20 rounded-xl p-4 border-l-4 border-green-500">
          <h3 className="text-white font-semibold mb-2 flex items-center">
            🎵 Free Public Access
          </h3>
          <p className="text-gray-300 text-sm">
            This audiobook is freely available to everyone. 
            {user ? ' Your listening progress is automatically saved.' : ' Sign in to save your progress and create playlists.'}
          </p>
        </div>

        {/* Book Info */}
        <div className="bg-gray-900 rounded-xl p-4">
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

        {/* Features */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-900/50 rounded-lg p-3">
            <div className="text-purple-400 text-sm font-semibold">
              {user ? 'Resume Playback' : 'Free Access'}
            </div>
            <div className="text-gray-400 text-xs">
              {user ? 'Pick up where you left off' : 'No login required'}
            </div>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-3">
            <div className="text-purple-400 text-sm font-semibold">Variable Speed</div>
            <div className="text-gray-400 text-xs">0.75x to 2x playback</div>
          </div>
        </div>
      </div>

      {/* Related Books Carousel */}
      {id && <RelatedBooksCarousel currentBookId={id} />}
    </div>
  );
};

export default BookDetailPage;
