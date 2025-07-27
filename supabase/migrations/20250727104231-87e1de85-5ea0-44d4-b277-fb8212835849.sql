-- Create the update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create hero_carousel table for managing homepage hero carousel items
CREATE TABLE public.hero_carousel (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  background_image_url TEXT,
  cta_text TEXT DEFAULT 'Start Listening',
  cta_link TEXT,
  book_id UUID REFERENCES public.books(id) ON DELETE SET NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.hero_carousel ENABLE ROW LEVEL SECURITY;

-- Create policies for hero_carousel
CREATE POLICY "Anyone can view active hero carousel items" 
ON public.hero_carousel 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage hero carousel" 
ON public.hero_carousel 
FOR ALL 
USING (has_admin_access(auth.uid()));

-- Create trigger for updated_at
CREATE TRIGGER update_hero_carousel_updated_at
BEFORE UPDATE ON public.hero_carousel
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for ordering
CREATE INDEX idx_hero_carousel_order ON public.hero_carousel(display_order);

-- Create index for active items
CREATE INDEX idx_hero_carousel_active ON public.hero_carousel(is_active);