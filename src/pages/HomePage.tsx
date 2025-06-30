
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useBooks } from '@/hooks/useBooks';
import FeaturedBannerCarousel from '@/components/FeaturedBannerCarousel';
import NetflixTrendingCarousel from '@/components/NetflixTrendingCarousel';
import NetflixGenreSelector from '@/components/NetflixGenreSelector';
import NetflixBookCard from '@/components/NetflixBookCard';

const HomePage = () => {
  const { user } = useAuth();
  const [selectedGenre, setSelectedGenre] = useState('all');
  const { data: books, isLoading, error } = useBooks(selectedGenre);

  // Extract user's first name from full_name or email
  const getUserFirstName = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name.split(' ')[0];
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'there';
  };

  return (
    <div className="min-h-screen bg-gray-950 pb-20 md:pb-8 md:pt-20">
      {/* Personalized Header */}
      <div className="px-4 pt-12 md:pt-8 pb-6">
        <h1 className="text-2xl md:text-4xl font-bold text-white">
          For {getUserFirstName()}
        </h1>
        <p className="text-gray-400 mt-1 text-sm md:text-base">What would you like to listen to today?</p>
      </div>

      {/* Featured Banner Carousel */}
      <div className="px-4 mb-8">
        <FeaturedBannerCarousel />
      </div>

      {/* Trending Section */}
      <NetflixTrendingCarousel />

      {/* Genre Selection */}
      <NetflixGenreSelector 
        selectedGenre={selectedGenre} 
        onGenreSelect={setSelectedGenre} 
      />

      {/* Popular Books Grid */}
      <div className="px-4 pb-8">
        <h2 className="text-xl md:text-2xl font-bold text-white mb-6">
          {selectedGenre === 'all' ? 'Popular Books' : `Popular ${selectedGenre.charAt(0).toUpperCase() + selectedGenre.slice(1)} Books`}
        </h2>
        
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="w-full h-56 md:h-64 bg-gray-800 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : error || !books?.length ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No books found for this genre.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {books.map((book) => (
              <NetflixBookCard key={book.id} book={book} size="medium" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
