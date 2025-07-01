
import { supabase } from '@/integrations/supabase/client';
import { ListeningProgress } from '@/types/audio';

export const loadListeningProgress = async (
  userId: string,
  bookId: string
): Promise<ListeningProgress | null> => {
  try {
    const { data, error } = await supabase
      .from('listening_progress')
      .select('current_position, duration')
      .eq('user_id', userId)
      .eq('book_id', bookId)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      console.error('Error loading progress:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Failed to load progress:', error);
    return null;
  }
};

export const saveListeningProgress = async (
  userId: string,
  bookId: string,
  position: number,
  duration?: number
): Promise<void> => {
  try {
    const { data: existing, error: selectError } = await supabase
      .from('listening_progress')
      .select('id')
      .eq('user_id', userId)
      .eq('book_id', bookId)
      .maybeSingle();

    if (selectError && selectError.code !== 'PGRST116') {
      console.error('Error checking existing progress:', selectError);
      return;
    }

    if (existing) {
      const { error } = await supabase
        .from('listening_progress')
        .update({
          current_position: position,
          duration: duration,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id);

      if (error) {
        console.error('Error updating progress:', error);
      }
    } else {
      const { error } = await supabase
        .from('listening_progress')
        .insert({
          user_id: userId,
          book_id: bookId,
          current_position: position,
          duration: duration,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error inserting progress:', error);
      }
    }
  } catch (error) {
    console.error('Failed to save progress:', error);
  }
};
