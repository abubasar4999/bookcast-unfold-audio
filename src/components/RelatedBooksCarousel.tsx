
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Book } from '@/hooks/useBooks';

interface RelatedBooksCarouselProps {
  currentBookId: string;
}

const RelatedBooksCarousel = ({ currentBookId }: RelatedBooksCarouselProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [relatedBooks, setRelatedBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRelatedBooks = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Get user's favorite genres
        const { data: userGenres, error: genresError } = await supabase
          .from('user_genre_preferences')
          .select('genre')
          .eq('user_id', user.id);

        if (genresError) {
          console.error('Error fetching user genres:', genresError);
          setLoading(false);
          return;
        }

        if (!userGenres || userGenres.length === 0) {
          setLoading(false);
          return;
        }

        const genres = userGenres.map(g => g.genre);

        // Fetch books from user's favorite genres, excluding current book
        const { data: books, error: booksError } = await supabase
          .from('books')
          .select('*')
          .in('genre', genres)
          .neq('id', currentBookId)
          .eq('status', 'active')
          .limit(10);

        if (booksError) {
          console.error('Error fetching related books:', booksError);
          setLoading(false);
          return;
        }

        const mappedBooks = (books || []).map(book => ({
          ...book,
          cover: book.cover_url,
        }));

        setRelatedBooks(mappedBooks);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedBooks();
  }, [user, currentBookId]);

  if (loading) {
    return (
      <div className="px-4 py-6">
        <h3 className="text-white font-semibold mb-4">Related Books</h3>
        <div className="flex space-x-4 overflow-x-auto">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex-shrink-0 w-24 h-32 bg-gray-800 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!relatedBooks.length) {
    return null;
  }

  return (
    <div className="px-4 py-6">
      <h3 className="text-white font-semibold mb-4">Related Books</h3>
      <div className="flex space-x-4 overflow-x-auto pb-2 scrollbar-hide">
        {relatedBooks.map((book) => (
          <div
            key={book.id}
            onClick={() => navigate(`/book/${book.id}`)}
            className="flex-shrink-0 cursor-pointer group"
          >
            <div className="w-24 h-32 mb-2 rounded-lg overflow-hidden">
              <img
                src={book.cover || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=200&h=300&fit=crop'}
                alt={book.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              />
            </div>
            <div className="w-24">
              <p className="text-white text-xs font-medium line-clamp-2 mb-1">
                {book.title}
              </p>
              <p className="text-gray-400 text-xs line-clamp-1">
                {book.author}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RelatedBooksCarousel;
