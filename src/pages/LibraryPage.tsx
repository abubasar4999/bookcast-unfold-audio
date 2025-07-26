
import { useState, useEffect } from 'react';
import { Play, Heart, Bookmark } from 'lucide-react';
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
  const { getLikedBooks } = useLikedBooks();
  const { getSavedBooks } = useSavedBooks();
  const [likedBooks, setLikedBooks] = useState<Book[]>([]);
  const [savedBooks, setSavedBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  const renderBookList = (books: Book[], emptyMessage: string, emptyIcon: React.ReactNode) => {
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
          <div key={book.id} className="flex items-center card-glass rounded-xl p-4 hover:bg-gray-900/70 transition-colors">
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
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="saved" className="flex items-center gap-2">
              <Bookmark size={16} />
              Saved Books ({savedBooks.length})
            </TabsTrigger>
            <TabsTrigger value="liked" className="flex items-center gap-2">
              <Heart size={16} />
              Liked Books ({likedBooks.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="saved" className="mt-6">
            {renderBookList(
              savedBooks, 
              "No Saved Books", 
              <Bookmark size={48} className="text-gray-600 mx-auto mb-4" />
            )}
          </TabsContent>
          
          <TabsContent value="liked" className="mt-6">
            {renderBookList(
              likedBooks, 
              "No Liked Books", 
              <Heart size={48} className="text-gray-600 mx-auto mb-4" />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default LibraryPage;
