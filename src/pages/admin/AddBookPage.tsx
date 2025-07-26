
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';
import { useAuthors, useGuests } from '@/hooks/useBooks';

const AddBookPage = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { data: authors = [] } = useAuthors();
  const { data: guests = [] } = useGuests();
  
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    author_id: '',
    genre: '',
    description: '',
    cover_url: '',
    audio_path: '',
    duration: '',
    guest_id: ''
  });

  const addBookMutation = useMutation({
    mutationFn: async (bookData: typeof formData) => {
      const { data, error } = await supabase
        .from('books')
        .insert({
          ...bookData,
          status: 'active',
          is_trending: false,
          popularity_score: 0,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast({
        title: 'Book Added Successfully',
        description: `"${data.title}" has been added to the library.`,
      });
      
      // Clear form
      setFormData({
        title: '',
        author: '',
        author_id: '',
        genre: '',
        description: '',
        cover_url: '',
        audio_path: '',
        duration: '',
        guest_id: ''
      });
      
      // Invalidate queries to refresh the book lists
      queryClient.invalidateQueries({ queryKey: ['admin-books'] });
      queryClient.invalidateQueries({ queryKey: ['books'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error Adding Book',
        description: error.message || 'Failed to add book. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.title || !formData.author || !formData.genre) {
      toast({
        title: 'Missing Required Fields',
        description: 'Please fill in title, author, and genre.',
        variant: 'destructive',
      });
      return;
    }

    addBookMutation.mutate(formData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleClearForm = () => {
    setFormData({
      title: '',
      author: '',
      author_id: '',
      genre: '',
      description: '',
      cover_url: '',
      audio_path: '',
      duration: '',
      guest_id: ''
    });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <h1 className="text-2xl font-bold text-gray-800">Add New Book</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Book Details</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Audio Upload Instructions */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">📁 Audio File Setup Instructions</h3>
            <ol className="text-sm text-blue-800 space-y-1">
              <li>1. Upload your MP3 file to the 'book-audios' storage bucket</li>
              <li>2. Copy the <strong>file name only</strong> (e.g., "alchemist.mp3")</li>
              <li>3. Paste the file name in the "Audio File Path" field below</li>
              <li>4. <strong>Don't paste the full URL</strong> - just the filename!</li>
            </ol>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="title">Book Title *</Label>
                <Input
                  id="title"
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  required
                  placeholder="Enter book title"
                />
              </div>

              <div>
                <Label htmlFor="author">Author Name *</Label>
                <Input
                  id="author"
                  type="text"
                  value={formData.author}
                  onChange={(e) => handleInputChange('author', e.target.value)}
                  required
                  placeholder="Enter author name"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="author_id">Select Author (Optional)</Label>
                <Select value={formData.author_id} onValueChange={(value) => handleInputChange('author_id', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Link to author profile" />
                  </SelectTrigger>
                  <SelectContent>
                    {authors.map((author) => (
                      <SelectItem key={author.id} value={author.id}>
                        {author.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="guest_id">Select Guest/Character (Optional)</Label>
                <Select value={formData.guest_id} onValueChange={(value) => handleInputChange('guest_id', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Link to guest/character" />
                  </SelectTrigger>
                  <SelectContent>
                    {guests.map((guest) => (
                      <SelectItem key={guest.id} value={guest.id}>
                        {guest.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="genre">Genre *</Label>
                <Select value={formData.genre} onValueChange={(value) => handleInputChange('genre', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select genre" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Romance">Romance</SelectItem>
                    <SelectItem value="Thriller">Thriller</SelectItem>
                    <SelectItem value="Mystery">Mystery</SelectItem>
                    <SelectItem value="Fiction">Fiction</SelectItem>
                    <SelectItem value="Biography">Biography</SelectItem>
                    <SelectItem value="Business">Business</SelectItem>
                    <SelectItem value="Self Help">Self Help</SelectItem>
                    <SelectItem value="Science Fiction">Science Fiction</SelectItem>
                    <SelectItem value="Fantasy">Fantasy</SelectItem>
                    <SelectItem value="History">History</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="duration">Duration</Label>
                <Input
                  id="duration"
                  type="text"
                  value={formData.duration}
                  onChange={(e) => handleInputChange('duration', e.target.value)}
                  placeholder="e.g., 5h 30m"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Enter book description"
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="cover_url">Cover Image URL</Label>
              <Input
                id="cover_url"
                type="url"
                value={formData.cover_url}
                onChange={(e) => handleInputChange('cover_url', e.target.value)}
                placeholder="https://example.com/book-cover.jpg"
              />
            </div>

            <div>
              <Label htmlFor="audio_path">Audio File Path *</Label>
              <Input
                id="audio_path"
                type="text"
                value={formData.audio_path}
                onChange={(e) => handleInputChange('audio_path', e.target.value)}
                placeholder="filename.mp3 (just the filename, not the full URL)"
              />
              <p className="text-sm text-gray-600 mt-1">
                Enter only the filename (e.g., "alchemist.mp3"), not the full URL
              </p>
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                className="bg-purple-600 hover:bg-purple-700 flex-1"
                disabled={addBookMutation.isPending}
              >
                {addBookMutation.isPending ? 'Adding Book...' : 'Add Book'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleClearForm}
                className="flex-1"
                disabled={addBookMutation.isPending}
              >
                Clear Form
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddBookPage;
