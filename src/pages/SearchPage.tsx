
import { useState } from 'react';
import { Search, TrendingUp, Heart, Play } from 'lucide-react';
import BookCard from '../components/BookCard';
import AuthorCard from '../components/AuthorCard';
import { Input } from '@/components/ui/input';
import { useSearchBooks, useAuthors, useBooks, useTrendingBooks } from '@/hooks/useBooks';
import { useNavigate } from 'react-router-dom';

const SearchPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: searchResults = [], isLoading: isSearching } = useSearchBooks(searchQuery);
  const { data: authors = [], isLoading: isLoadingAuthors } = useAuthors();
  const { data: allBooks = [], isLoading: isLoadingBooks } = useBooks();
  const { data: trendingBooks = [], isLoading: isLoadingTrending } = useTrendingBooks();
  const navigate = useNavigate();

  // Genre data matching your existing app's genres
  const genres = [
    { name: 'Motivational', icon: '🎯', color: 'bg-red-600' },
    { name: 'Fiction', icon: '📚', color: 'bg-red-600' },
    { name: 'Tech', icon: '💻', color: 'bg-red-600' },
    { name: 'Books', icon: '📖', color: 'bg-red-600' },
    { name: 'Science', icon: '🔬', color: 'bg-red-600' },
    { name: 'Romance', icon: '💝', color: 'bg-red-600' },
    { name: 'Thriller', icon: '🎭', color: 'bg-red-600' },
    { name: 'Mystery', icon: '🔍', color: 'bg-red-600' }
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

  // Get trending authors (top 4)
  const trendingAuthors = authors.slice(0, 4);
  
  // Get popular authors with mock episode/like counts
  const popularAuthors = authors.slice(0, 4).map((author, index) => ({
    ...author,
    episodeCount: [12, 8, 15, 6][index] || 5,
    likeCount: [4.8, 3.2, 5.7, 2.9][index] || 3.5
  }));

  // Get featured books (popular episodes equivalent)
  const featuredBooks = trendingBooks.length > 0 ? trendingBooks.slice(0, 3) : allBooks.slice(0, 3);

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
          {/* Browse by Genre */}
          <div className="px-4 mb-8">
            <h2 className="text-xl font-bold text-white mb-4">Browse by Genre</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {genres.map((genre, index) => (
                <button
                  key={index}
                  onClick={() => handleGenreClick(genre.name)}
                  className={`${genre.color} rounded-lg p-4 text-white text-left hover:opacity-80 transition-opacity`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{genre.icon}</span>
                    <span className="font-medium">{genre.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Trending Authors */}
          <div className="px-4 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Trending Guest</h2>
              <button className="text-red-500 text-sm font-medium">See all</button>
            </div>
            {isLoadingAuthors ? (
              <div className="flex gap-4 overflow-x-auto pb-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="w-20 h-20 bg-gray-800 rounded-full animate-pulse flex-shrink-0" />
                ))}
              </div>
            ) : (
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
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
                      <div className="absolute bottom-0 right-0 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center">
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

          {/* Most Liked Authors */}
          <div className="px-4 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Most Liked Guests</h2>
              <button className="text-red-500 text-sm font-medium">View all</button>
            </div>
            {isLoadingAuthors ? (
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-800 rounded-full animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-800 rounded animate-pulse" />
                      <div className="h-3 bg-gray-800 rounded w-2/3 animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {popularAuthors.map((author) => (
                  <div
                    key={author.id}
                    onClick={() => handleAuthorClick(author.id)}
                    className="flex items-center gap-3 cursor-pointer hover:bg-gray-900 p-2 rounded-lg transition-colors"
                  >
                    <img
                      src={author.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'}
                      alt={author.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="text-white font-medium">{author.name}</h3>
                      <p className="text-gray-400 text-sm">{author.bio || 'Author'}</p>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1 text-gray-400">
                        <div className="w-2 h-2 bg-red-600 rounded-full" />
                        <span>{author.episodeCount} Episodes</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-400">
                        <Heart size={12} className="text-red-500" />
                        <span>{author.likeCount}k</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Popular Episodes (Featured Books) */}
          <div className="px-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Popular Episodes</h2>
              <button className="text-red-500 text-sm font-medium">See all</button>
            </div>
            {isLoadingTrending || isLoadingBooks ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
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
              <div className="space-y-4">
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
                        <Play size={12} className="text-red-500" />
                        <span>{[12.5, 9.8, 7.3][index] || 5.2}k</span>
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
