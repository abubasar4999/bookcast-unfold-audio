
import { useAuth } from '@/contexts/AuthContext';
import FeaturedBannerCarousel from '@/components/FeaturedBannerCarousel';
import ContinueListeningSection from '@/components/ContinueListeningSection';
import GenreCarousel from '@/components/GenreCarousel';

const HomePage = () => {
  const { user } = useAuth();

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

  const genres = [
    { title: 'Newly Added', isNewlyAdded: true },
    { title: 'Fiction Picks', genre: 'Fiction' },
    { title: 'Romance', genre: 'Romance' },
    { title: 'Thriller', genre: 'Thriller' },
    { title: 'Fantasy', genre: 'Fantasy' },
    { title: 'Sci-Fi', genre: 'Sci-Fi' },
    { title: 'Mystery', genre: 'Mystery' },
    { title: 'Biography', genre: 'Biography' },
    { title: 'Non-fiction Highlights', genre: 'Non-fiction' },
  ];

  return (
    <div className="min-h-screen bg-gray-950 pb-20 md:pb-8 md:pt-20">
      {/* Personalized Header */}
      <div className="px-4 pt-12 md:pt-8 pb-6">
        <h1 className="text-2xl md:text-4xl font-bold text-white">
          For {getUserFirstName()}
        </h1>
        <p className="text-gray-400 mt-1 text-sm md:text-base">What would you like to listen to today?</p>
      </div>

      {/* Trending Now Banner Carousel */}
      <div className="px-4 mb-8">
        <h2 className="text-xl md:text-2xl font-bold text-white mb-6">Trending Now</h2>
        <FeaturedBannerCarousel />
      </div>

      {/* Continue Listening Section */}
      <ContinueListeningSection />

      {/* Genre-Based Carousels */}
      {genres.map((genreData) => (
        <GenreCarousel
          key={genreData.title}
          title={genreData.title}
          genre={genreData.genre}
          isNewlyAdded={genreData.isNewlyAdded}
        />
      ))}
    </div>
  );
};

export default HomePage;
