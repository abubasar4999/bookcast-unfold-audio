
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import FeaturedBannerCarousel from '@/components/FeaturedBannerCarousel';
import ContinueListeningSection from '@/components/ContinueListeningSection';
import GenreCarousel from '@/components/GenreCarousel';

const HomePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Extract user's first name from full_name or email, or show default greeting
  const getUserGreeting = () => {
    if (!user) {
      return 'Hi there 👋';
    }
    
    if (user?.user_metadata?.full_name) {
      const firstName = user.user_metadata.full_name.split(' ')[0];
      return `For ${firstName}`;
    }
    if (user?.email) {
      const firstName = user.email.split('@')[0];
      return `For ${firstName}`;
    }
    return 'For you';
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
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-purple-950/20 page-content-mobile md:pb-24 md:pt-20">
      {/* Personalized Header with gradient background */}
      <div className="px-4 pt-12 md:pt-8 pb-6 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 via-transparent to-blue-900/20 rounded-xl" />
        <div className="relative">
          <h1 className="text-2xl md:text-4xl font-bold text-white bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
            {getUserGreeting()}
          </h1>
          <p className="text-gray-400 mt-1 text-sm md:text-base text-readable">What would you like to listen to today?</p>
        </div>
      </div>

      {/* Trending Now Banner Carousel with enhanced background */}
      <div className="px-4 mb-8 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/10 via-blue-900/5 to-purple-900/10 rounded-2xl blur-3xl" />
        <div className="relative">
          <h2 className="text-xl md:text-2xl font-bold text-white mb-6 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
            Trending Now
          </h2>
          <FeaturedBannerCarousel />
        </div>
      </div>

      {/* Continue Listening Section - only show if user is logged in */}
      {user && <ContinueListeningSection />}

      {/* Genre-Based Carousels with alternating gradient backgrounds */}
      <div className="mb-8">
        {genres.map((genreData, index) => (
          <div key={genreData.title} className="relative mb-8">
            {index % 2 === 0 && (
              <div className="absolute inset-0 bg-gradient-to-r from-blue-900/5 via-purple-900/10 to-indigo-900/5 rounded-2xl blur-2xl" />
            )}
            {index % 2 === 1 && (
              <div className="absolute inset-0 bg-gradient-to-r from-purple-900/5 via-pink-900/10 to-purple-900/5 rounded-2xl blur-2xl" />
            )}
            <div className="relative">
              <GenreCarousel
                title={genreData.title}
                genre={genreData.genre}
                isNewlyAdded={genreData.isNewlyAdded}
              />
            </div>
          </div>
        ))}
      </div>
      
      {/* Footer */}
      <footer className="mt-16 pb-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center space-x-6 text-sm text-gray-400">
            <button
              onClick={() => navigate('/privacy-policy')}
              className="hover:text-white transition-colors"
            >
              Privacy Policy
            </button>
            <span>•</span>
            <button
              onClick={() => navigate('/terms-of-service')}
              className="hover:text-white transition-colors"
            >
              Terms of Service
            </button>
            <span>•</span>
            <span>© 2024 AudioBooks. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
