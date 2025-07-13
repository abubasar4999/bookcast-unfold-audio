
import { useState } from 'react';
import { Play, Heart } from 'lucide-react';

const mockSavedBooks = [
  {
    id: '1',
    title: 'The Seven Husbands of Evelyn Hugo',
    author: 'Taylor Jenkins Reid',
    cover: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=400&fit=crop',
    duration: '45m',
    savedAt: '2024-03-15'
  },
  {
    id: '2',
    title: 'Where the Crawdads Sing',
    author: 'Delia Owens',
    cover: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=400&fit=crop',
    duration: '41m',
    savedAt: '2024-03-10'
  }
];

const LibraryPage = () => {
  const [savedBooks] = useState(mockSavedBooks);

  if (savedBooks.length === 0) {
    return (
      <div className="min-h-screen pt-12 pb-32 md:pb-24 px-4 flex items-center justify-center">
        <div className="text-center">
          <Heart size={64} className="text-gray-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2 text-readable">Your Library is Empty</h2>
          <p className="text-gray-400 mb-6 text-readable">Start saving books to build your collection</p>
          <button className="bg-purple-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-purple-700 transition-colors">
            Explore Books
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-12 pb-32 md:pb-24">
      <div className="px-4 mb-6">
        <h1 className="text-3xl font-bold text-white mb-2 text-readable">Your Library</h1>
        <p className="text-gray-400 text-readable">{savedBooks.length} saved books</p>
      </div>

      <div className="px-4 space-y-4 mb-8">
        {savedBooks.map((book) => (
          <div key={book.id} className="flex items-center card-glass rounded-xl p-4 hover:bg-gray-900/70 transition-colors">
            <img
              src={book.cover}
              alt={book.title}
              className="w-16 h-20 object-cover rounded-lg mr-4"
            />
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-semibold truncate text-readable">{book.title}</h3>
              <p className="text-gray-400 text-sm truncate text-readable">{book.author}</p>
              <p className="text-gray-500 text-xs text-readable">{book.duration}</p>
            </div>
            <button className="w-12 h-12 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors ml-4">
              <Play size={20} className="text-black ml-1" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LibraryPage;
