
-- First, remove any listening_progress records that reference non-existent books
DELETE FROM public.listening_progress 
WHERE book_id NOT IN (SELECT id FROM public.books);

-- Now add the foreign key relationship between listening_progress and books tables
ALTER TABLE public.listening_progress 
ADD CONSTRAINT listening_progress_book_id_fkey 
FOREIGN KEY (book_id) REFERENCES public.books(id) ON DELETE CASCADE;
