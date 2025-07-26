
import { useState, useEffect, useRef } from 'react';
import { Play, Heart, Bookmark, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useLikedBooks } from '@/hooks/useLikedBooks';
import { useSavedBooks } from '@/hooks/useSavedBooks';
import { Book } from '@/hooks/useBooks';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const LibraryPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { getLikedBooks, toggleLike } = useLikedBooks();
  const { getSavedBooks, toggleSave } = useSavedBooks();
  const [likedBooks, setLikedBooks] = useState<Book[]>([]);
  const [savedBooks, setSavedBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [swipedBook, setSwipedBook] = useState<string | null>(null);

  useEffect(() => {
    const fetchBooks = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const [liked, saved] = await Promise.all([
          getLikedBooks(),
          getSavedBooks()
        ]);
        setLikedBooks(liked);
        setSavedBooks(saved);
      } catch (error) {
        console.error('Error fetching books:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBooks();
  }, [user, getLikedBooks, getSavedBooks]);

  const handlePlay = (bookId: string) => {
    navigate(`/player/${bookId}`);
  };

  const handleRemoveBook = async (bookId: string, type: 'saved' | 'liked') => {
    try {
      if (type === 'saved') {
        await toggleSave(bookId);
        setSavedBooks(prev => prev.filter(book => book.id !== bookId));
      } else {
        await toggleLike(bookId);
        setLikedBooks(prev => prev.filter(book => book.id !== bookId));
      }
      setSwipedBook(null);
    } catch (error) {
      console.error('Error removing book:', error);
    }
  };

  const handleTouchStart = (e: React.TouchEvent, bookId: string) => {
    const touch = e.touches[0];
    const startX = touch.clientX;
    
    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      const currentX = touch.clientX;
      const diffX = startX - currentX;
      
      if (diffX > 50) { // Swipe left threshold
        setSwipedBook(bookId);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      }
    };
    
    const handleTouchEnd = () => {
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
    
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);
  };

  if (!user) {
    return (
      <div className="min-h-screen pt-12 pb-32 md:pb-24 px-4 flex items-center justify-center">
        <div className="text-center">
          <Heart size={64} className="text-gray-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Sign In Required</h2>
          <p className="text-gray-400 mb-6">Sign in to access your library</p>
          <Button onClick={() => navigate('/auth')}>
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen pt-12 pb-32 md:pb-24 px-4 flex items-center justify-center">
        <div className="text-white text-lg">Loading your library...</div>
      </div>
    );
  }

  const renderBookList = (books: Book[], emptyMessage: string, emptyIcon: React.ReactNode, type: 'saved' | 'liked') => {
    if (books.length === 0) {
      return (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            {emptyIcon}
            <h3 className="text-xl font-semibold text-white mb-2">{emptyMessage}</h3>
            <p className="text-gray-400 mb-4">Discover books to add to your collection</p>
            <Button onClick={() => navigate('/')}>
              Explore Books
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {books.map((book) => (
          <div 
            key={book.id} 
            className="relative overflow-hidden"
            onTouchStart={(e) => handleTouchStart(e, book.id)}
            onClick={() => swipedBook === book.id && setSwipedBook(null)}
          >
            <div 
              className={`flex items-center card-glass rounded-xl p-4 hover:bg-gray-900/70 transition-all duration-300 ${
                swipedBook === book.id ? 'transform -translate-x-20' : ''
              }`}
            >
              <img
                src={book.cover || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=400&fit=crop'}
                alt={book.title}
                className="w-16 h-20 object-cover rounded-lg mr-4"
              />
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-semibold truncate">{book.title}</h3>
                <p className="text-gray-400 text-sm truncate">{book.author}</p>
                <p className="text-gray-500 text-xs">{book.duration}</p>
              </div>
              <button 
                onClick={() => handlePlay(book.id)}
                className="w-12 h-12 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors ml-4"
              >
                <Play size={20} className="text-black ml-1" />
              </button>
            </div>
            
            {/* Delete button that appears when swiped */}
            {swipedBook === book.id && (
              <button
                onClick={() => handleRemoveBook(book.id, type)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors animate-fade-in"
              >
                <X size={20} className="text-white" />
              </button>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen pt-12 pb-32 md:pb-24">
      <div className="px-4 mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Your Library</h1>
        <p className="text-gray-400">{savedBooks.length + likedBooks.length} books in your library</p>
      </div>

      <div className="px-4">
        <Tabs defaultValue="saved" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gradient-to-r from-gray-900/50 to-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-1 h-14">
            <TabsTrigger 
              value="saved" 
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/90 data-[state=active]:to-primary-foreground/90 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-primary/25 data-[state=inactive]:text-gray-400 data-[state=inactive]:opacity-60 transition-all duration-300 rounded-xl font-semibold hover:opacity-100"
            >
              <Bookmark size={16} />
              Saved ({savedBooks.length})
            </TabsTrigger>
            <TabsTrigger 
              value="liked" 
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/90 data-[state=active]:to-primary-foreground/90 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-primary/25 data-[state=inactive]:text-gray-400 data-[state=inactive]:opacity-60 transition-all duration-300 rounded-xl font-semibold hover:opacity-100"
            >
              <Heart size={16} />
              Liked ({likedBooks.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="saved" className="mt-6">
            {renderBookList(
              savedBooks, 
              "No Saved Books", 
              <Bookmark size={48} className="text-gray-600 mx-auto mb-4" />,
              'saved'
            )}
          </TabsContent>
          
          <TabsContent value="liked" className="mt-6">
            {renderBookList(
              likedBooks, 
              "No Liked Books", 
              <Heart size={48} className="text-gray-600 mx-auto mb-4" />,
              'liked'
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default LibraryPage;
