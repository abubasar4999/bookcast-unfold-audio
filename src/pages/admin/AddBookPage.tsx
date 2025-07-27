
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
import { ArrowLeft, Plus } from 'lucide-react';
import { useAuthors, useGuests, useGenres } from '@/hooks/useBooks';

const AddBookPage = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { data: authors = [] } = useAuthors();
  const { data: guests = [] } = useGuests();
  const { data: genres = [] } = useGenres();
  
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    author_id: '',
    guest_id: '',
    genre: '',
    description: '',
    cover_url: '',
    audio_path: '',
    duration: '',
    // New fields
    author_description: '',
    author_image_url: '',
    guest_name: '',
    guest_description: '',
    guest_image_url: '',
    podcast_description: '',
    new_genre_name: ''
  });

  const [createNewAuthor, setCreateNewAuthor] = useState(false);
  const [createNewGuest, setCreateNewGuest] = useState(false);
  const [createNewGenre, setCreateNewGenre] = useState(false);

  const addBookMutation = useMutation({
    mutationFn: async (bookData: typeof formData) => {
      let authorId = bookData.author_id;
      let guestId = bookData.guest_id;
      let genreName = bookData.genre;

      // Create new author if needed
      if (createNewAuthor && bookData.author) {
        const { data: newAuthor, error: authorError } = await supabase
          .from('authors')
          .insert({
            name: bookData.author,
            bio: bookData.author_description,
            avatar_url: bookData.author_image_url
          })
          .select()
          .single();
        
        if (authorError) throw authorError;
        authorId = newAuthor.id;
      }

      // Create new guest if needed
      if (createNewGuest && bookData.guest_name) {
        const { data: newGuest, error: guestError } = await supabase
          .from('guests')
          .insert({
            name: bookData.guest_name,
            bio: bookData.guest_description,
            avatar_url: bookData.guest_image_url
          })
          .select()
          .single();
        
        if (guestError) throw guestError;
        guestId = newGuest.id;
      }

      // Create new genre if needed
      if (createNewGenre && bookData.new_genre_name) {
        const { error: genreError } = await supabase
          .from('genres')
          .insert({
            name: bookData.new_genre_name,
            color: '#6366f1',
            gradient: 'from-blue-500 to-purple-600'
          });
        
        if (genreError) throw genreError;
        genreName = bookData.new_genre_name;
      }

      // Insert the book with proper description
      const finalDescription = bookData.podcast_description || bookData.description;
      
      const { data, error } = await supabase
        .from('books')
        .insert({
          title: bookData.title,
          author: bookData.author,
          author_id: authorId,
          guest_id: guestId,
          genre: genreName,
          description: finalDescription,
          cover_url: bookData.cover_url,
          audio_path: bookData.audio_path,
          duration: bookData.duration,
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
        guest_id: '',
        genre: '',
        description: '',
        cover_url: '',
        audio_path: '',
        duration: '',
        author_description: '',
        author_image_url: '',
        guest_name: '',
        guest_description: '',
        guest_image_url: '',
        podcast_description: '',
        new_genre_name: ''
      });
      setCreateNewAuthor(false);
      setCreateNewGuest(false);
      setCreateNewGenre(false);
      
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
    if (!formData.title || !formData.author || (!formData.genre && !formData.new_genre_name)) {
      toast({
        title: 'Missing Required Fields',
        description: 'Please fill in title, author, and genre.',
        variant: 'destructive',
      });
      return;
    }

    if (createNewGenre && !formData.new_genre_name) {
      toast({
        title: 'Missing Genre Name',
        description: 'Please enter a name for the new genre.',
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
      guest_id: '',
      genre: '',
      description: '',
      cover_url: '',
      audio_path: '',
      duration: '',
      author_description: '',
      author_image_url: '',
      guest_name: '',
      guest_description: '',
      guest_image_url: '',
      podcast_description: '',
      new_genre_name: ''
    });
    setCreateNewAuthor(false);
    setCreateNewGuest(false);
    setCreateNewGenre(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">Add New Book</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Book Details</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Audio Upload Instructions */}
          <div className="mb-6 p-4 bg-muted border border-border rounded-lg">
            <h3 className="font-semibold text-foreground mb-2">📁 Audio File Setup Instructions</h3>
            <ol className="text-sm text-muted-foreground space-y-1">
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

            {/* Author Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Label>Author Information</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setCreateNewAuthor(!createNewAuthor)}
                  className="flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  {createNewAuthor ? 'Use Existing' : 'Create New'}
                </Button>
              </div>
              
              {!createNewAuthor ? (
                <div>
                  <Label htmlFor="author_id">Select Existing Author</Label>
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
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="author_description">Author Description</Label>
                    <Textarea
                      id="author_description"
                      value={formData.author_description}
                      onChange={(e) => handleInputChange('author_description', e.target.value)}
                      placeholder="Enter author bio/description"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="author_image_url">Author Image URL</Label>
                    <Input
                      id="author_image_url"
                      type="url"
                      value={formData.author_image_url}
                      onChange={(e) => handleInputChange('author_image_url', e.target.value)}
                      placeholder="https://example.com/author-image.jpg"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Guest Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Label>Guest Information (Optional)</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setCreateNewGuest(!createNewGuest)}
                  className="flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  {createNewGuest ? 'Use Existing' : 'Create New'}
                </Button>
              </div>
              
              {!createNewGuest ? (
                <div>
                  <Label htmlFor="guest_id">Select Existing Guest</Label>
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
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="guest_name">Guest Name</Label>
                    <Input
                      id="guest_name"
                      type="text"
                      value={formData.guest_name}
                      onChange={(e) => handleInputChange('guest_name', e.target.value)}
                      placeholder="Enter guest name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="guest_description">Guest Description</Label>
                    <Textarea
                      id="guest_description"
                      value={formData.guest_description}
                      onChange={(e) => handleInputChange('guest_description', e.target.value)}
                      placeholder="Enter guest bio/description"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="guest_image_url">Guest Image URL</Label>
                    <Input
                      id="guest_image_url"
                      type="url"
                      value={formData.guest_image_url}
                      onChange={(e) => handleInputChange('guest_image_url', e.target.value)}
                      placeholder="https://example.com/guest-image.jpg"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Genre Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Label>Genre *</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setCreateNewGenre(!createNewGenre)}
                  className="flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  {createNewGenre ? 'Use Existing' : 'Create New'}
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  {!createNewGenre ? (
                    <>
                      <Label htmlFor="genre">Select Existing Genre</Label>
                      <Select value={formData.genre} onValueChange={(value) => handleInputChange('genre', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select genre" />
                        </SelectTrigger>
                        <SelectContent>
                          {genres.map((genre) => (
                            <SelectItem key={genre.id} value={genre.name}>
                              {genre.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </>
                  ) : (
                    <>
                      <Label htmlFor="new_genre_name">New Genre Name</Label>
                      <Input
                        id="new_genre_name"
                        type="text"
                        value={formData.new_genre_name}
                        onChange={(e) => handleInputChange('new_genre_name', e.target.value)}
                        placeholder="Enter new genre name"
                      />
                    </>
                  )}
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
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="description">Book Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Enter book description"
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="podcast_description">Podcast Description</Label>
                <Textarea
                  id="podcast_description"
                  value={formData.podcast_description}
                  onChange={(e) => handleInputChange('podcast_description', e.target.value)}
                  placeholder="Enter podcast-specific description (this will override book description if provided)"
                  rows={3}
                />
              </div>
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

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button
                type="submit"
                className="bg-primary hover:bg-primary/90 flex-1 order-2 sm:order-1"
                disabled={addBookMutation.isPending}
              >
                {addBookMutation.isPending ? 'Adding Book...' : 'Add Book'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleClearForm}
                className="flex-1 order-1 sm:order-2"
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
