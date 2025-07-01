
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Book } from '@/hooks/useBooks';
import NetflixBookCard from '@/components/NetflixBookCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PersonalizedRecommendationsProps {
  currentBookId: string;
  currentBookGenre?: string;
}

const PersonalizedRecommendations = ({ currentBookId, currentBookGenre }: PersonalizedRecommendationsProps) => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        let recommendedBooks: Book[] = [];

        if (user) {
          // Get user's preferred genres
          const { data: userGenres } = await supabase
            .from('user_genre_preferences')
            .select('genre')
            .eq('user_id', user.id);

          if (userGenres && userGenres.length > 0) {
            const genres = userGenres.map(g => g.genre);
            
            // Fetch books from user's preferred genres
            const { data: books } = await supabase
              .from('books')
              .select('*')
              .in('genre', genres)
              .neq('id', currentBookId)
              .eq('status', 'active')
              .order('popularity_score', { ascending: false })
              .limit(8);

            if (books) {
              recommendedBooks = books.map(book => ({
                ...book,
                cover: book.cover_url,
              }));
            }
          }
        }

        // If no personalized recommendations or user not logged in, use genre-based recommendations
        if (recommendedBooks.length === 0 && currentBookGenre) {
          const { data: books } = await supabase
            .from('books')
            .select('*')
            .eq('genre', currentBookGenre)
            .neq('id', currentBookId)
            .eq('status', 'active')
            .order('popularity_score', { ascending: false })
            .limit(8);

          if (books) {
            recommendedBooks = books.map(book => ({
              ...book,
              cover: book.cover_url,
            }));
          }
        }

        // Fallback to popular books
        if (recommendedBooks.length === 0) {
          const { data: books } = await supabase
            .from('books')
            .select('*')
            .neq('id', currentBookId)
            .eq('status', 'active')
            .order('popularity_score', { ascending: false })
            .limit(8);

          if (books) {
            recommendedBooks = books.map(book => ({
              ...book,
              cover: book.cover_url,
            }));
          }
        }

        setRecommendations(recommendedBooks);
      } catch (error) {
        console.error('Error fetching recommendations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [user, currentBookId, currentBookGenre]);

  const scrollContainer = (direction: 'left' | 'right') => {
    const container = document.getElementById('recommendations-carousel');
    if (container) {
      const scrollAmount = 320;
      const newScrollPosition = direction === 'left' 
        ? container.scrollLeft - scrollAmount
        : container.scrollLeft + scrollAmount;
      
      container.scrollTo({
        left: newScrollPosition,
        behavior: 'smooth'
      });
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    setCanScrollLeft(container.scrollLeft > 0);
    setCanScrollRight(
      container.scrollLeft < container.scrollWidth - container.clientWidth - 10
    );
  };

  useEffect(() => {
    const container = document.getElementById('recommendations-carousel');
    if (container) {
      const updateScrollButtons = () => {
        setCanScrollLeft(container.scrollLeft > 0);
        setCanScrollRight(
          container.scrollLeft < container.scrollWidth - container.clientWidth - 10
        );
      };
      
      updateScrollButtons();
      container.addEventListener('scroll', updateScrollButtons);
      return () => container.removeEventListener('scroll', updateScrollButtons);
    }
  }, [recommendations]);

  if (loading) {
    return (
      <div className="mb-6">
        <h3 className="text-white font-semibold mb-4">
          {user ? 'Recommended For You' : 'You Might Also Like'}
        </h3>
        <div className="flex gap-4 overflow-hidden">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="w-40 h-56 bg-gray-800 rounded-lg animate-pulse flex-shrink-0" />
          ))}
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className="mb-6 relative group">
      <h3 className="text-white font-semibold mb-4 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
        {user ? 'Recommended For You' : 'You Might Also Like'}
      </h3>
      
      {/* Navigation Arrows */}
      {canScrollLeft && (
        <button
          onClick={() => scrollContainer('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-black/60 hover:bg-black/80 backdrop-blur-sm rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-300 ml-2"
        >
          <ChevronLeft size={24} />
        </button>
      )}
      
      {canScrollRight && (
        <button
          onClick={() => scrollContainer('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-black/60 hover:bg-black/80 backdrop-blur-sm rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-300 mr-2"
        >
          <ChevronRight size={24} />
        </button>
      )}
      
      {/* Recommendations Container */}
      <div
        id="recommendations-carousel"
        className="flex gap-4 overflow-x-auto scrollbar-hide pb-2"
        onScroll={handleScroll}
      >
        {recommendations.map((book) => (
          <div key={book.id} className="flex-shrink-0">
            <NetflixBookCard book={book} size="medium" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default PersonalizedRecommendations;
