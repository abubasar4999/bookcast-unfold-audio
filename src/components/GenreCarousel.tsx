
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Book } from '@/hooks/useBooks';
import NetflixBookCard from '@/components/NetflixBookCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface GenreCarouselProps {
  title: string;
  genre?: string;
  isNewlyAdded?: boolean;
}

const GenreCarousel = ({ title, genre, isNewlyAdded = false }: GenreCarouselProps) => {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        let query = supabase
          .from('books')
          .select('*')
          .eq('status', 'active')
          .limit(10);

        if (isNewlyAdded) {
          query = query.order('created_at', { ascending: false });
        } else if (genre) {
          query = query.eq('genre', genre).order('popularity_score', { ascending: false });
        } else {
          query = query.order('popularity_score', { ascending: false });
        }

        const { data, error } = await query;

        if (error) {
          console.error('Error fetching books:', error);
          return;
        }

        const mappedBooks = (data || []).map(book => ({
          ...book,
          cover: book.cover_url,
        }));

        setBooks(mappedBooks);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBooks();
  }, [genre, isNewlyAdded]);

  const scrollContainer = (direction: 'left' | 'right') => {
    const container = document.getElementById(`carousel-${title.replace(/\s+/g, '-').toLowerCase()}`);
    if (container) {
      const scrollAmount = 320; // Approximate width of 2 cards
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
    const container = document.getElementById(`carousel-${title.replace(/\s+/g, '-').toLowerCase()}`);
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
  }, [books, title]);

  if (isLoading) {
    return (
      <div className="px-4 mb-8">
        <h2 className="text-xl md:text-2xl font-bold text-white mb-6">{title}</h2>
        <div className="flex gap-4 overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-40 h-56 bg-gray-800 rounded-lg animate-pulse flex-shrink-0" />
          ))}
        </div>
      </div>
    );
  }

  if (books.length === 0) {
    return null;
  }

  return (
    <div className="px-4 mb-8 relative group">
      <h2 className="text-xl md:text-2xl font-bold text-white mb-6">{title}</h2>
      
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
      
      {/* Books Container */}
      <div
        id={`carousel-${title.replace(/\s+/g, '-').toLowerCase()}`}
        className="flex gap-4 overflow-x-auto scrollbar-hide pb-2"
        onScroll={handleScroll}
      >
        {books.map((book) => (
          <div key={book.id} className="flex-shrink-0">
            <NetflixBookCard book={book} size="medium" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default GenreCarousel;
