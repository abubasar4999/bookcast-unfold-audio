
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const AVAILABLE_GENRES = [
  'Fiction',
  'Romance',
  'Biographies',
  'Mystery',
  'Self-Help',
  'Science Fiction',
  'Fantasy',
  'Thriller',
  'History',
  'Business',
  'Health & Wellness',
  'True Crime'
];

const GenreSelectionPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleGenreToggle = (genre: string) => {
    setSelectedGenres(prev => 
      prev.includes(genre) 
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    );
  };

  const handleContinue = async () => {
    if (selectedGenres.length < 2) {
      toast.error('Please select at least 2 genres to continue');
      return;
    }

    if (!user) {
      toast.error('Please sign in to continue');
      return;
    }

    setLoading(true);

    try {
      // Save selected genres to user_genre_preferences
      const genreInserts = selectedGenres.map(genre => ({
        user_id: user.id,
        genre
      }));

      const { error: genreError } = await supabase
        .from('user_genre_preferences')
        .insert(genreInserts);

      if (genreError) {
        console.error('Error saving genres:', genreError);
        toast.error('Failed to save your preferences');
        return;
      }

      // Update profile to mark onboarding as completed
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ onboarding_completed: true })
        .eq('id', user.id);

      if (profileError) {
        console.error('Error updating profile:', profileError);
        toast.error('Failed to complete onboarding');
        return;
      }

      toast.success('Preferences saved successfully!');
      navigate('/');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-4 pb-24 md:pb-8">
      <div className="w-full max-w-2xl text-center flex-1 flex flex-col justify-center">
        <h1 className="text-3xl font-bold text-white mb-2">Select your favorite genres</h1>
        <p className="text-gray-400 mb-8">Choose at least 2 genres to get personalized recommendations</p>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
          {AVAILABLE_GENRES.map((genre) => (
            <button
              key={genre}
              onClick={() => handleGenreToggle(genre)}
              className={`px-6 py-4 rounded-full font-medium transition-all duration-200 ${
                selectedGenres.includes(genre)
                  ? 'bg-purple-600 text-white border-2 border-purple-600'
                  : 'bg-gray-800 text-gray-300 border-2 border-gray-700 hover:border-gray-600'
              }`}
            >
              {genre}
            </button>
          ))}
        </div>

        <div className="flex flex-col items-center space-y-4 mb-8">
          <p className="text-gray-400 text-sm">
            {selectedGenres.length} genres selected
          </p>
          
          <Button
            onClick={handleContinue}
            disabled={selectedGenres.length < 2 || loading}
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-8 rounded-full min-w-[200px] z-50"
          >
            {loading ? 'Saving...' : 'Continue'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GenreSelectionPage;
