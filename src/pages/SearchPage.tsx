
import { useState } from 'react';
import { Search, TrendingUp, Heart, Play } from 'lucide-react';
import BookCard from '../components/BookCard';
import AuthorCard from '../components/AuthorCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useSearchBooks, useAuthors, useBooks, useTrendingBooks } from '@/hooks/useBooks';
import { useNavigate } from 'react-router-dom';

const SearchPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAllTrendingGuests, setShowAllTrendingGuests] = useState(false);
  const [showAllPopularEpisodes, setShowAllPopularEpisodes] = useState(false);
  const { data: searchResults = [], isLoading: isSearching } = useSearchBooks(searchQuery);
  const { data: authors = [], isLoading: isLoadingAuthors } = useAuthors();
  const { data: allBooks = [], isLoading: isLoadingBooks } = useBooks();
  const { data: trendingBooks = [], isLoading: isLoadingTrending } = useTrendingBooks();
  const navigate = useNavigate();

  // Genre data matching your existing app's genres with updated theme colors
  const genres = [
    { name: 'Motivational', icon: '🎯', color: 'bg-gradient-to-r from-purple-600 to-blue-600' },
    { name: 'Fiction', icon: '📚', color: 'bg-gradient-to-r from-blue-600 to-indigo-600' },
    { name: 'Tech', icon: '💻', color: 'bg-gradient-to-r from-indigo-600 to-purple-600' },
    { name: 'Books', icon: '📖', color: 'bg-gradient-to-r from-purple-600 to-pink-600' },
    { name: 'Science', icon: '🔬', color: 'bg-gradient-to-r from-green-600 to-teal-600' },
    { name: 'Romance', icon: '💝', color: 'bg-gradient-to-r from-pink-600 to-rose-600' },
    { name: 'Thriller', icon: '🎭', color: 'bg-gradient-to-r from-gray-700 to-gray-900' },
    { name: 'Mystery', icon: '🔍', color: 'bg-gradient-to-r from-slate-700 to-gray-700' }
  ];

  const handleGenreClick = (genreName: string) => {
    navigate(`/genre/${genreName.toLowerCase()}`);
  };

  const handleAuthorClick = (authorId: string) => {
    navigate(`/author/${authorId}`);
  };

  const handleBookClick = (bookId: string) => {
    navigate(`/book/${bookId}`);
  };

  // Get trending authors (top 4 for initial display, all for modal)
  const trendingAuthors = authors.slice(0, showAllTrendingGuests ? authors.length : 4);
  
  // Get popular authors with mock episode/like counts
  const popularAuthors = authors.slice(0, 8).map((author, index) => ({
    ...author,
    episodeCount: [12, 8, 15, 6, 9, 11, 7, 13][index] || 5,
    likeCount: [4.8, 3.2, 5.7, 2.9, 4.1, 3.8, 2.5, 4.6][index] || 3.5
  }));

  // Get featured books (popular episodes equivalent)
  const featuredBooks = showAllPopularEpisodes 
    ? (trendingBooks.length > 0 ? trendingBooks : allBooks.slice(0, 10))
    : (trendingBooks.length > 0 ? trendingBooks.slice(0, 3) : allBooks.slice(0, 3));

  return (
    <div className="min-h-screen bg-gray-950 pt-12 pb-20">
      {/* Search Bar */}
      <div className="px-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <Input
            type="text"
            placeholder="Search podcasts, episodes, guests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 bg-gray-800 border-gray-700 text-white placeholder:text-gray-400 focus:border-purple-500 rounded-lg"
          />
        </div>
      </div>

      {!searchQuery ? (
        <>
          {/* Browse by Genre - Updated to pill-shaped buttons */}
          <div className="px-4 mb-8">
            <h2 className="text-xl font-bold text-white mb-4">Browse by Genre</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {genres.map((genre, index) => (
                <button
                  key={index}
                  onClick={() => handleGenreClick(genre.name)}
                  className={`${genre.color} rounded-full p-4 text-white text-left hover:opacity-90 hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{genre.icon}</span>
                    <span className="font-medium">{genre.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Trending Authors - Updated with working See All */}
          <div className="px-4 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Trending Guest</h2>
              <Button
                variant="ghost"
                onClick={() => setShowAllTrendingGuests(!showAllTrendingGuests)}
                className="text-purple-500 hover:text-purple-400 text-sm font-medium hover:bg-purple-500/10"
              >
                {showAllTrendingGuests ? 'Show Less' : 'See all'}
              </Button>
            </div>
            {isLoadingAuthors ? (
              <div className="flex gap-4 overflow-x-auto pb-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="w-20 h-20 bg-gray-800 rounded-full animate-pulse flex-shrink-0" />
                ))}
              </div>
            ) : (
              <div className={`${showAllTrendingGuests ? 'grid grid-cols-4 md:grid-cols-8 gap-4' : 'flex gap-4 overflow-x-auto pb-4 scrollbar-hide'}`}>
                {trendingAuthors.map((author) => (
                  <div
                    key={author.id}
                    onClick={() => handleAuthorClick(author.id)}
                    className="flex-shrink-0 text-center cursor-pointer group"
                  >
                    <div className="relative mb-2">
                      <img
                        src={author.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'}
                        alt={author.name}
                        className="w-20 h-20 rounded-full object-cover group-hover:opacity-80 transition-opacity"
                      />
                      <div className="absolute bottom-0 right-0 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                        <TrendingUp size={12} className="text-white" />
                      </div>
                    </div>
                    <p className="text-white text-sm font-medium line-clamp-2 max-w-[80px]">
                      {author.name}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Most Liked Authors - Updated to grid layout */}
          <div className="px-4 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Most Liked Guests</h2>
              <Button
                variant="ghost"
                className="text-purple-500 hover:text-purple-400 text-sm font-medium hover:bg-purple-500/10"
              >
                View all
              </Button>
            </div>
            {isLoadingAuthors ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-gray-800 rounded-lg p-4 animate-pulse">
                    <div className="w-16 h-16 bg-gray-700 rounded-full mx-auto mb-3" />
                    <div className="h-4 bg-gray-700 rounded mb-2" />
                    <div className="h-3 bg-gray-700 rounded w-2/3 mx-auto" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {popularAuthors.map((author) => (
                  <div
                    key={author.id}
                    onClick={() => handleAuthorClick(author.id)}
                    className="bg-gray-900/50 rounded-lg p-4 cursor-pointer hover:bg-gray-900/70 transition-all duration-200 hover:scale-105 transform"
                  >
                    <div className="flex flex-col items-center space-y-3">
                      <img
                        src={author.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'}
                        alt={author.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      <div className="text-center">
                        <h3 className="text-white font-medium text-sm line-clamp-2">{author.name}</h3>
                        <p className="text-gray-400 text-xs mt-1">{author.bio || 'Author'}</p>
                        <div className="flex items-center justify-center gap-2 mt-2 text-xs">
                          <div className="flex items-center gap-1 text-gray-400">
                            <div className="w-1.5 h-1.5 bg-purple-600 rounded-full" />
                            <span>{author.episodeCount}</span>
                          </div>
                          <div className="flex items-center gap-1 text-gray-400">
                            <Heart size={10} className="text-purple-500" />
                            <span>{author.likeCount}k</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Popular Episodes (Featured Books) - Updated with working See All */}
          <div className="px-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Popular Episodes</h2>
              <Button
                variant="ghost"
                onClick={() => setShowAllPopularEpisodes(!showAllPopularEpisodes)}
                className="text-purple-500 hover:text-purple-400 text-sm font-medium hover:bg-purple-500/10"
              >
                {showAllPopularEpisodes ? 'Show Less' : 'See all'}
              </Button>
            </div>
            {isLoadingTrending || isLoadingBooks ? (
              <div className="space-y-4">
                {[...Array(showAllPopularEpisodes ? 10 : 3)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-16 h-16 bg-gray-800 rounded-lg animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-800 rounded animate-pulse" />
                      <div className="h-3 bg-gray-800 rounded w-2/3 animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={showAllPopularEpisodes ? "grid grid-cols-1 md:grid-cols-2 gap-4" : "space-y-4"}>
                {featuredBooks.map((book, index) => (
                  <div
                    key={book.id}
                    onClick={() => handleBookClick(book.id)}
                    className="flex items-center gap-3 cursor-pointer hover:bg-gray-900 p-2 rounded-lg transition-colors"
                  >
                    <img
                      src={book.cover || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop'}
                      alt={book.title}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="text-white font-medium line-clamp-1">{book.title}</h3>
                      <p className="text-gray-400 text-sm">{book.author}</p>
                      <p className="text-gray-500 text-xs">{book.duration || '32 min'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-gray-400 text-sm">
                        <Play size={12} className="text-purple-500" />
                        <span>{[12.5, 9.8, 7.3, 6.2, 8.9, 5.4, 11.1, 4.8, 9.3, 7.6][index % 10] || 5.2}k</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        // Search Results
        <div className="px-4">
          <p className="text-gray-400 mb-4">
            {isSearching ? 'Searching...' : 
              searchResults.length > 0 
                ? `${searchResults.length} result${searchResults.length !== 1 ? 's' : ''} for "${searchQuery}"`
                : `No results found for "${searchQuery}"`
            }
          </p>
          
          {isSearching ? (
            <div className="grid grid-cols-2 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="aspect-[3/4] bg-gray-800 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : searchResults.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {searchResults.map((book) => (
                <BookCard key={book.id} book={book} size="medium" />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-500 mb-4">
                <Search size={48} className="mx-auto mb-2 opacity-50" />
                <p>Try searching for:</p>
                <ul className="text-sm mt-2 space-y-1">
                  <li>• Book titles</li>
                  <li>• Author names</li>
                  <li>• Genres (fiction, romance, thriller, etc.)</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchPage;
