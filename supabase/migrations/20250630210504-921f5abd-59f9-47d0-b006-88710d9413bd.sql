
-- Create a table to store user genre preferences
CREATE TABLE public.user_genre_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  genre TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, genre)
);

-- Enable RLS for user genre preferences
ALTER TABLE public.user_genre_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies for user genre preferences
CREATE POLICY "Users can view their own genre preferences" 
  ON public.user_genre_preferences 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own genre preferences" 
  ON public.user_genre_preferences 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own genre preferences" 
  ON public.user_genre_preferences 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own genre preferences" 
  ON public.user_genre_preferences 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Add a column to profiles table to track onboarding completion
ALTER TABLE public.profiles 
ADD COLUMN onboarding_completed BOOLEAN DEFAULT false;
