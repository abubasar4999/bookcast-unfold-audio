-- Create guests table for book characters/guests
CREATE TABLE public.guests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  character_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;

-- Create policies for guests
CREATE POLICY "Anyone can view guests" 
ON public.guests 
FOR SELECT 
USING (true);

-- Add guest_id column to books table
ALTER TABLE public.books 
ADD COLUMN guest_id UUID;

-- Create function to update updated_at column for guests
CREATE OR REPLACE FUNCTION public.update_guests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates on guests
CREATE TRIGGER update_guests_updated_at
BEFORE UPDATE ON public.guests
FOR EACH ROW
EXECUTE FUNCTION public.update_guests_updated_at();

-- Insert some dummy guests data
INSERT INTO public.guests (name, avatar_url, bio, character_description) VALUES
('Santiago', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face', 'A young shepherd from Andalusia', 'The protagonist of The Alchemist, a dreamer who follows his Personal Legend'),
('Evelyn Hugo', 'https://images.unsplash.com/photo-1494790108755-2616b612b882?w=150&h=150&fit=crop&crop=face', 'Legendary Hollywood actress', 'A reclusive Hollywood icon revealing her life story'),
('Paul Atreides', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face', 'Duke of House Atreides', 'The prophesied leader who will transform the desert planet Arrakis'),
('Theo Faber', 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face', 'Psychotherapist', 'A determined therapist obsessed with treating a woman who refuses to speak'),
('Elizabeth Best', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face', 'Retired intelligence officer', 'Sharp-witted leader of the Thursday Murder Club');

-- Add some more dummy books with different genres
INSERT INTO public.books (title, author, author_id, genre, description, cover_url, duration, is_trending, popularity_score, guest_id) VALUES
('The Alchemist', 'Paulo Coelho', (SELECT id FROM authors WHERE name = 'James Clear'), 'Fiction', 'A young shepherd named Santiago travels from Spain to Egypt in search of treasure', 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=400&fit=crop', '4h 30m', true, 90, (SELECT id FROM guests WHERE name = 'Santiago')),
('Business Success Mindset', 'Robert Kiyosaki', (SELECT id FROM authors WHERE name = 'James Clear'), 'Business', 'Essential strategies for entrepreneurial success', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop', '3h 15m', false, 75, NULL),
('Love in the Time of AI', 'Sarah Mitchell', (SELECT id FROM authors WHERE name = 'Taylor Jenkins Reid'), 'Romance', 'A modern love story in the digital age', 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=300&h=400&fit=crop', '5h 20m', true, 85, NULL),
('The Motivation Manual', 'Tony Robbins', (SELECT id FROM authors WHERE name = 'James Clear'), 'Self Help', 'Transform your life with proven motivation techniques', 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=400&fit=crop', '6h 45m', false, 80, NULL),
('Galactic Adventures', 'Isaac Newton', (SELECT id FROM authors WHERE name = 'Frank Herbert'), 'Science Fiction', 'Epic space exploration and alien encounters', 'https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=300&h=400&fit=crop', '7h 10m', true, 88, NULL),
('Medieval Legends', 'J.R.R. Tolkien', (SELECT id FROM authors WHERE name = 'Richard Osman'), 'Fantasy', 'Tales of knights, dragons, and magical kingdoms', 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=400&fit=crop', '8h 30m', false, 82, NULL);

-- Update existing books with guest_id where appropriate
UPDATE public.books 
SET guest_id = (SELECT id FROM guests WHERE name = 'Evelyn Hugo')
WHERE title = 'The Seven Husbands of Evelyn Hugo';

UPDATE public.books 
SET guest_id = (SELECT id FROM guests WHERE name = 'Paul Atreides')
WHERE title = 'Dune';

UPDATE public.books 
SET guest_id = (SELECT id FROM guests WHERE name = 'Theo Faber')
WHERE title = 'The Silent Patient';

UPDATE public.books 
SET guest_id = (SELECT id FROM guests WHERE name = 'Elizabeth Best')
WHERE title = 'The Thursday Murder Club';