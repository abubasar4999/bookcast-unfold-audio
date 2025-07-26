import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Book } from './useBooks';
import { toast } from 'sonner';

export const useSavedBooks = () => {
  const { user } = useAuth();
  const [savedBookIds, setSavedBookIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  // Fetch all saved books for the current user
  useEffect(() => {
    const fetchSavedBooks = async () => {
      if (!user) {
        setSavedBookIds(new Set());
        return;
      }

      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('book_saves')
          .select('book_id')
          .eq('user_id', user.id);

        if (error) {
          console.error('Error fetching saved books:', error);
          return;
        }

        const bookIds = new Set(data.map(save => save.book_id));
        setSavedBookIds(bookIds);
      } catch (error) {
        console.error('Error fetching saved books:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSavedBooks();
  }, [user]);

  const isBookSaved = (bookId: string) => {
    return savedBookIds.has(bookId);
  };

  const toggleSave = async (bookId: string) => {
    if (!user) {
      throw new Error('User must be logged in');
    }

    const isCurrentlySaved = savedBookIds.has(bookId);

    try {
      if (isCurrentlySaved) {
        // Remove save
        const { error } = await supabase
          .from('book_saves')
          .delete()
          .eq('user_id', user.id)
          .eq('book_id', bookId);

        if (error) throw error;

        setSavedBookIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(bookId);
          return newSet;
        });

        toast.success('Book removed from saved books');
        return false;
      } else {
        // Add save
        const { error } = await supabase
          .from('book_saves')
          .insert({
            user_id: user.id,
            book_id: bookId
          });

        if (error) {
          if (error.code === '23505') {
            // Duplicate key error - already saved
            setSavedBookIds(prev => new Set(prev).add(bookId));
            toast.info('Book is already saved');
            return true;
          }
          throw error;
        }

        setSavedBookIds(prev => new Set(prev).add(bookId));
        toast.success('Book saved to your library!');
        return true;
      }
    } catch (error) {
      console.error('Error toggling save:', error);
      toast.error('Failed to update saved books');
      throw error;
    }
  };

  const getSavedBooks = async (): Promise<Book[]> => {
    if (!user) return [];

    try {
      // First get the saved book IDs
      const { data: savedData, error: savedError } = await supabase
        .from('book_saves')
        .select('book_id')
        .eq('user_id', user.id);

      if (savedError) throw savedError;

      if (!savedData || savedData.length === 0) return [];

      const bookIds = savedData.map(save => save.book_id);

      // Then get the books by their IDs
      const { data: booksData, error: booksError } = await supabase
        .from('books')
        .select('*')
        .in('id', bookIds);

      if (booksError) throw booksError;

      return (booksData || []).map(book => ({
        ...book,
        cover: book.cover_url
      })) as Book[];
    } catch (error) {
      console.error('Error fetching saved books:', error);
      return [];
    }
  };

  return {
    savedBookIds,
    isBookSaved,
    toggleSave,
    getSavedBooks,
    isLoading
  };
};