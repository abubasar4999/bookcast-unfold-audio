
-- First, let's ensure the book-audios bucket exists and is properly configured
INSERT INTO storage.buckets (id, name, public)
VALUES ('book-audios', 'book-audios', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Create policy to allow public access to audio files
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'book-audios');

-- Create policy to allow authenticated users to upload audio files
DROP POLICY IF EXISTS "Authenticated users can upload audio files" ON storage.objects;
CREATE POLICY "Authenticated users can upload audio files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'book-audios');

-- Create policy to allow authenticated users to update audio files
DROP POLICY IF EXISTS "Authenticated users can update audio files" ON storage.objects;
CREATE POLICY "Authenticated users can update audio files"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'book-audios');

-- Create policy to allow authenticated users to delete audio files
DROP POLICY IF EXISTS "Authenticated users can delete audio files" ON storage.objects;
CREATE POLICY "Authenticated users can delete audio files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'book-audios');
