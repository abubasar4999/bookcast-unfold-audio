
import { useTrendingBooks } from '@/hooks/useBooks';
import NetflixBookCard from './NetflixBookCard';

const NetflixTrendingCarousel = () => {
  const { data: trendingBooks, isLoading, error } = useTrendingBooks();

  if (isLoading) {
    return (
      <div className="px-4 py-6">
        <h2 className="text-xl md:text-2xl font-bold text-white mb-4">Trending Now</h2>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-48 md:w-64 h-64 md:h-80 bg-gray-800 rounded-lg animate-pulse flex-shrink-0" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !trendingBooks?.length) {
    return null;
  }

  return (
    <div className="px-4 py-6">
      <h2 className="text-xl md:text-2xl font-bold text-white mb-4">Trending Now</h2>
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {trendingBooks.map((book) => (
          <NetflixBookCard 
            key={book.id} 
            book={book} 
            size="large"
          />
        ))}
      </div>
    </div>
  );
};

export default NetflixTrendingCarousel;
