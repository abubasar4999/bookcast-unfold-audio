import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface HeroCarouselItem {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  background_image_url?: string;
  cta_text: string;
  cta_link?: string;
  book_id?: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  books?: {
    id: string;
    title: string;
    author: string;
    cover_url?: string;
  };
}

export interface CreateHeroCarouselItem {
  title: string;
  subtitle?: string;
  description?: string;
  background_image_url?: string;
  cta_text: string;
  cta_link?: string;
  book_id?: string;
  display_order: number;
  is_active: boolean;
}

export interface UpdateHeroCarouselItem extends Partial<CreateHeroCarouselItem> {
  id: string;
}

export const useHeroCarousel = () => {
  return useQuery({
    queryKey: ['hero-carousel'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hero_carousel')
        .select(`
          *,
          books (
            id,
            title,
            author,
            cover_url
          )
        `)
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data as HeroCarouselItem[];
    },
  });
};

export const useAdminHeroCarousel = () => {
  return useQuery({
    queryKey: ['admin-hero-carousel'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hero_carousel')
        .select(`
          *,
          books (
            id,
            title,
            author,
            cover_url
          )
        `)
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data as HeroCarouselItem[];
    },
  });
};

export const useCreateHeroCarousel = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (item: CreateHeroCarouselItem) => {
      const { data, error } = await supabase
        .from('hero_carousel')
        .insert(item)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hero-carousel'] });
      queryClient.invalidateQueries({ queryKey: ['admin-hero-carousel'] });
      toast({
        title: 'Success',
        description: 'Hero carousel item created successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create hero carousel item.',
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateHeroCarousel = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...item }: UpdateHeroCarouselItem) => {
      const { data, error } = await supabase
        .from('hero_carousel')
        .update(item)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hero-carousel'] });
      queryClient.invalidateQueries({ queryKey: ['admin-hero-carousel'] });
      toast({
        title: 'Success',
        description: 'Hero carousel item updated successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update hero carousel item.',
        variant: 'destructive',
      });
    },
  });
};

export const useDeleteHeroCarousel = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('hero_carousel')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hero-carousel'] });
      queryClient.invalidateQueries({ queryKey: ['admin-hero-carousel'] });
      toast({
        title: 'Success',
        description: 'Hero carousel item deleted successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete hero carousel item.',
        variant: 'destructive',
      });
    },
  });
};

export const useReorderHeroCarousel = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (items: { id: string; display_order: number }[]) => {
      // Update each item individually
      for (const item of items) {
        const { error } = await supabase
          .from('hero_carousel')
          .update({ display_order: item.display_order })
          .eq('id', item.id);
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hero-carousel'] });
      queryClient.invalidateQueries({ queryKey: ['admin-hero-carousel'] });
      toast({
        title: 'Success',
        description: 'Hero carousel order updated successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to reorder hero carousel items.',
        variant: 'destructive',
      });
    },
  });
};