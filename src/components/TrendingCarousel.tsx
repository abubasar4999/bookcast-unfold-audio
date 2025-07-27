import { useTrendingBooks } from '@/hooks/useBooks';
import BookCard from './BookCard';

const TrendingCarousel = () => {
  const { data: trendingBooks = [], isLoading } = useTrendingBooks();

  if (isLoading) {
    return (
      <div className="px-4 py-6">
        <h2 className="text-xl font-bold text-white mb-4">Trending Now</h2>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="min-w-[160px] h-[240px] bg-gray-300 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (trendingBooks.length === 0) {
    return (
      <div className="px-4 py-6">
        <h2 className="text-xl font-bold text-white mb-4">Trending Now</h2>
        <div className="text-gray-400 text-center py-8">
          No trending books available at the moment.
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6">
      <h2 className="text-xl font-bold text-white mb-4">Trending Now</h2>
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {trendingBooks.map((book) => (
          <BookCard key={book.id} book={book} size="large" />
        ))}
      </div>
    </div>
  );
};

export default TrendingCarousel;