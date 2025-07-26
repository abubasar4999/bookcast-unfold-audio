
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Book {
  id: string;
  title: string;
  author: string;
  cover: string;
  genre: string;
  description?: string;
  duration?: string;
  is_trending?: boolean;
  popularity_score?: number;
  status?: string;
  audio_path?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Author {
  id: string;
  name: string;
  avatar_url: string | null;
  bio: string | null;
}

export interface Guest {
  id: string;
  name: string;
  avatar_url: string | null;
  bio: string | null;
  character_description: string | null;
}

export interface Genre {
  id: string;
  name: string;
  color: string | null;
  gradient: string | null;
  icon: string | null;
}

export const useBooks = (genre?: string, authorId?: string) => {
  return useQuery({
    queryKey: ['books', genre, authorId],
    queryFn: async () => {
      let query = supabase
        .from('books')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });
      
      if (genre && genre !== 'all') {
        query = query.eq('genre', genre);
      }
      
      if (authorId) {
        query = query.eq('author_id', authorId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      return (data || []).map(book => ({
        ...book,
        cover: book.cover_url,
      }));
    },
  });
};

export const useTrendingBooks = () => {
  return useQuery({
    queryKey: ['trending-books'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .eq('is_trending', true)
        .eq('status', 'active')
        .order('popularity_score', { ascending: false });
      
      if (error) throw error;
      
      return (data || []).map(book => ({
        ...book,
        cover: book.cover_url,
      }));
    },
  });
};

export const useBooksByGenre = (genre: string) => {
  return useQuery({
    queryKey: ['books-by-genre', genre],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .eq('genre', genre)
        .eq('status', 'active')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return (data || []).map(book => ({
        ...book,
        cover: book.cover_url,
      }));
    },
  });
};

export const useBooksByAuthor = (author: string) => {
  return useQuery({
    queryKey: ['books-by-author', author],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .eq('author', author)
        .eq('status', 'active')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return (data || []).map(book => ({
        ...book,
        cover: book.cover_url,
      }));
    },
  });
};

export const useAuthors = () => {
  return useQuery({
    queryKey: ['authors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('authors')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error fetching authors:', error);
        throw error;
      }
      
      return data as Author[];
    }
  });
};

export const useGenres = () => {
  return useQuery({
    queryKey: ['genres'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('genres')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error fetching genres:', error);
        throw error;
      }
      
      return data as Genre[];
    }
  });
};

export const useSearchBooks = (searchQuery: string) => {
  return useQuery({
    queryKey: ['search-books', searchQuery],
    queryFn: async () => {
      if (!searchQuery.trim()) return [];
      
      const query = searchQuery.toLowerCase().trim();
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .or(`title.ilike.%${query}%,author.ilike.%${query}%,genre.ilike.%${query}%,description.ilike.%${query}%`)
        .order('popularity_score', { ascending: false });
      
      if (error) {
        console.error('Error searching books:', error);
        throw error;
      }
      
      // Map cover_url to cover to match BookCard expectations
      return data?.map(book => ({
        ...book,
        cover: book.cover_url
      })) as Book[];
    },
    enabled: !!searchQuery.trim()
  });
};

// Admin hooks for managing books
export const useAdminBooks = () => {
  return useQuery({
    queryKey: ['admin-books'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return (data || []).map(book => ({
        ...book,
        cover: book.cover_url,
      })) as Book[];
    },
  });
};

export const useGuests = () => {
  return useQuery({
    queryKey: ['guests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('guests')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error fetching guests:', error);
        throw error;
      }
      
      return data as Guest[];
    }
  });
};

export const useBooksByGuest = (guestId: string) => {
  return useQuery({
    queryKey: ['books-by-guest', guestId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .eq('guest_id', guestId)
        .eq('status', 'active')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return (data || []).map(book => ({
        ...book,
        cover: book.cover_url,
      }));
    },
  });
};
