
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Book } from './useBooks';
import { toast } from 'sonner';

export const useLikedBooks = () => {
  const { user } = useAuth();
  const [likedBookIds, setLikedBookIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  // Fetch all liked books for the current user
  useEffect(() => {
    const fetchLikedBooks = async () => {
      if (!user) {
        setLikedBookIds(new Set());
        return;
      }

      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('book_likes')
          .select('book_id')
          .eq('user_id', user.id);

        if (error) {
          console.error('Error fetching liked books:', error);
          return;
        }

        const bookIds = new Set(data.map(like => like.book_id));
        setLikedBookIds(bookIds);
      } catch (error) {
        console.error('Error fetching liked books:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLikedBooks();
  }, [user]);

  const isBookLiked = (bookId: string) => {
    return likedBookIds.has(bookId);
  };

  const toggleLike = async (bookId: string) => {
    if (!user) {
      throw new Error('User must be logged in');
    }

    const isCurrentlyLiked = likedBookIds.has(bookId);

    try {
      if (isCurrentlyLiked) {
        // Remove like
        const { error } = await supabase
          .from('book_likes')
          .delete()
          .eq('user_id', user.id)
          .eq('book_id', bookId);

        if (error) throw error;

        setLikedBookIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(bookId);
          return newSet;
        });

        toast.success('Book removed from your library');
        return false;
      } else {
        // Add like
        const { error } = await supabase
          .from('book_likes')
          .insert({
            user_id: user.id,
            book_id: bookId
          });

        if (error) {
          if (error.code === '23505') {
            // Duplicate key error - already liked
            setLikedBookIds(prev => new Set(prev).add(bookId));
            toast.info('Book is already in your library');
            return true;
          }
          throw error;
        }

        setLikedBookIds(prev => new Set(prev).add(bookId));
        toast.success('Book added to your library!');
        return true;
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('Failed to update library');
      throw error;
    }
  };

  const getLikedBooks = async (): Promise<Book[]> => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('book_likes')
        .select(`
          book_id,
          books!inner (
            id,
            title,
            author,
            cover_url,
            genre,
            description,
            duration,
            is_trending,
            popularity_score,
            status,
            audio_path,
            created_at,
            updated_at
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      return data.map(like => ({
        ...like.books,
        cover: like.books.cover_url
      })) as Book[];
    } catch (error) {
      console.error('Error fetching liked books:', error);
      return [];
    }
  };

  return {
    likedBookIds,
    isBookLiked,
    toggleLike,
    getLikedBooks,
    isLoading
  };
};
