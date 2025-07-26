-- Create a table for saved books (separate from liked books)
CREATE TABLE public.book_saves (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  book_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, book_id)
);

-- Enable Row Level Security
ALTER TABLE public.book_saves ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view all book saves" 
ON public.book_saves 
FOR SELECT 
USING (true);

CREATE POLICY "Users can manage their own saves" 
ON public.book_saves 
FOR ALL 
USING (auth.uid() = user_id);