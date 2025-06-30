
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Play, Pause } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ListeningProgress {
  id: string;
  book_id: string;
  current_position: number;
  duration: number;
  books: {
    id: string;
    title: string;
    author: string;
    cover_url: string;
  };
}

const ContinueListeningSection = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [listeningProgress, setListeningProgress] = useState<ListeningProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const fetchListeningProgress = async () => {
      try {
        const { data, error } = await supabase
          .from('listening_progress')
          .select(`
            id,
            book_id,
            current_position,
            duration,
            books (
              id,
              title,
              author,
              cover_url
            )
          `)
          .eq('user_id', user.id)
          .gt('current_position', 0)
          .order('updated_at', { ascending: false })
          .limit(5);

        if (error) {
          console.error('Error fetching listening progress:', error);
          return;
        }

        // Filter out any records where books is null (shouldn't happen with foreign key, but safety check)
        const validProgress = (data || []).filter(item => item.books) as ListeningProgress[];
        setListeningProgress(validProgress);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchListeningProgress();
  }, [user]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}:${minutes.toString().padStart(2, '0')}:00 left` : `${minutes}:00 left`;
  };

  const getProgressPercentage = (current: number, total: number) => {
    return total > 0 ? (current / total) * 100 : 0;
  };

  const handleContinueListening = (bookId: string) => {
    navigate(`/player/${bookId}`);
  };

  if (!user || isLoading) {
    return null;
  }

  if (listeningProgress.length === 0) {
    return null;
  }

  return (
    <div className="px-4 mb-8">
      <h2 className="text-xl md:text-2xl font-bold text-white mb-6">Continue Listening</h2>
      
      <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
        {listeningProgress.map((progress) => (
          <div
            key={progress.id}
            onClick={() => handleContinueListening(progress.books.id)}
            className="flex-shrink-0 w-80 bg-gray-800/50 rounded-xl p-4 cursor-pointer hover:bg-gray-800/70 transition-all duration-300 group"
          >
            <div className="flex items-center gap-4">
              {/* Book Cover */}
              <div className="relative">
                <img
                  src={progress.books.cover_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop'}
                  alt={progress.books.title}
                  className="w-16 h-20 object-cover rounded-lg"
                />
                <div className="absolute inset-0 bg-black/30 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Play size={20} className="text-white fill-white" />
                </div>
              </div>
              
              {/* Book Info */}
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-semibold text-sm mb-1 truncate">
                  {progress.books.title}
                </h3>
                <p className="text-gray-400 text-xs mb-2">
                  {progress.books.author} • {formatTime(progress.duration - progress.current_position)}
                </p>
                
                {/* Progress Bar */}
                <div className="w-full bg-gray-700 rounded-full h-1">
                  <div
                    className="bg-red-500 h-1 rounded-full transition-all duration-300"
                    style={{
                      width: `${getProgressPercentage(progress.current_position, progress.duration)}%`
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContinueListeningSection;
