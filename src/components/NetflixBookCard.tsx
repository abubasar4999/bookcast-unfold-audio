
import { useState } from 'react';
import { Play, Plus, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Book } from '@/hooks/useBooks';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';

interface NetflixBookCardProps {
  book: Book;
  size?: 'small' | 'medium' | 'large';
}

const NetflixBookCard = ({ book, size = 'medium' }: NetflixBookCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const sizeClasses = {
    small: 'w-32 h-48',
    medium: 'w-40 h-56',
    large: 'w-48 h-64'
  };

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      setShowAuthDialog(true);
      return;
    }
    navigate(`/player/${book.id}`);
  };

  const handleAddToLibrary = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      setShowAuthDialog(true);
      return;
    }

    try {
      const { data: existing } = await supabase
        .from('book_likes')
        .select('id')
        .eq('user_id', user.id)
        .eq('book_id', book.id)
        .maybeSingle();

      if (existing) {
        toast.info('Book is already in your library');
        return;
      }

      const { error } = await supabase
        .from('book_likes')
        .insert({
          user_id: user.id,
          book_id: book.id
        });

      if (error) {
        toast.error('Failed to add book to library');
        return;
      }

      setIsLiked(true);
      toast.success('Book added to your library!');
    } catch (error) {
      toast.error('Something went wrong');
    }
  };

  const handleCardClick = () => {
    navigate(`/book/${book.id}`);
  };

  const handleAuthDialogAction = () => {
    setShowAuthDialog(false);
    navigate('/auth');
  };

  return (
    <>
      <div
        className={`${sizeClasses[size]} rounded-lg overflow-hidden cursor-pointer group relative bg-gradient-to-br from-gray-800 to-gray-900 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleCardClick}
      >
        {/* Book Cover */}
        <img
          src={book.cover || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop'}
          alt={book.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Hover Controls - Only show for this specific card when hovered */}
        {isHovered && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/40 backdrop-blur-sm">
            <div className="flex gap-3">
              <button
                onClick={handlePlay}
                className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-black hover:bg-gray-100 transition-colors shadow-lg transform hover:scale-110"
              >
                <Play size={20} className="fill-current ml-0.5" />
              </button>
              <button
                onClick={handleAddToLibrary}
                className="w-12 h-12 bg-gray-800/80 rounded-full flex items-center justify-center text-white hover:bg-gray-700/80 transition-colors shadow-lg transform hover:scale-110 backdrop-blur-sm border border-white/20"
              >
                {isLiked ? <Heart size={20} className="fill-current text-red-500" /> : <Plus size={20} />}
              </button>
            </div>
          </div>
        )}

        {/* Book Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <h3 className="text-white font-medium text-sm line-clamp-2 mb-1">
            {book.title}
          </h3>
          <p className="text-gray-300 text-xs line-clamp-1">
            {book.author}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-purple-400 bg-purple-500/20 px-2 py-0.5 rounded-full">
              {book.genre}
            </span>
          </div>
        </div>
      </div>

      {/* Auth Required Dialog */}
      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">Sign In Required</DialogTitle>
            <DialogDescription className="text-center">
              Please sign in to start listening to audiobooks and access your library.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 mt-4">
            <Button onClick={handleAuthDialogAction} className="w-full">
              Sign In
            </Button>
            <Button variant="outline" onClick={() => setShowAuthDialog(false)} className="w-full">
              Continue Browsing
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default NetflixBookCard;
