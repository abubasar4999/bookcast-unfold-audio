
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, Download, Check, X, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BookData {
  title: string;
  author: string;
  genre: string;
  description?: string;
  cover_url?: string;
  audio_path?: string;
  duration?: string;
}

const BulkUpload = () => {
  const [csvData, setCsvData] = useState<BookData[]>([]);
  const [previewMode, setPreviewMode] = useState(false);
  const [uploadResults, setUploadResults] = useState<{ success: number; errors: string[] }>({ success: 0, errors: [] });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const parseCSV = (csvText: string): BookData[] => {
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''));
    const books: BookData[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      const book: any = {};

      headers.forEach((header, index) => {
        const value = values[index] || '';
        switch (header) {
          case 'title':
            book.title = value;
            break;
          case 'author':
            book.author = value;
            break;
          case 'genre':
            book.genre = value;
            break;
          case 'description':
            book.description = value;
            break;
          case 'cover_url':
            book.cover_url = value;
            break;
          case 'audio_path':
            book.audio_path = value;
            break;
          case 'duration':
            book.duration = value;
            break;
        }
      });

      if (book.title && book.author && book.genre) {
        books.push(book);
      }
    }

    return books;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const csvText = e.target?.result as string;
      const parsedData = parseCSV(csvText);
      setCsvData(parsedData);
      setPreviewMode(true);
      setUploadResults({ success: 0, errors: [] });
    };
    reader.readAsText(file);
  };

  const bulkUploadMutation = useMutation({
    mutationFn: async (books: BookData[]) => {
      const results = { success: 0, errors: [] as string[] };
      
      for (const book of books) {
        try {
          const { error } = await supabase
            .from('books')
            .insert({
              ...book,
              status: 'active',
              is_trending: false,
              popularity_score: 0,
            });

          if (error) {
            results.errors.push(`${book.title}: ${error.message}`);
          } else {
            results.success++;
          }
        } catch (err) {
          results.errors.push(`${book.title}: Unexpected error`);
        }
      }
      
      return results;
    },
    onSuccess: (results) => {
      setUploadResults(results);
      queryClient.invalidateQueries({ queryKey: ['admin-books'] });
      queryClient.invalidateQueries({ queryKey: ['books'] });
      
      if (results.success > 0) {
        toast({
          title: 'Upload Complete',
          description: `Successfully uploaded ${results.success} books.`,
        });
      }
      
      if (results.errors.length > 0) {
        toast({
          title: 'Some uploads failed',
          description: `${results.errors.length} books failed to upload.`,
          variant: 'destructive',
        });
      }
      
      // Clear the form
      setCsvData([]);
      setPreviewMode(false);
      // Reset the file input
      const fileInput = document.getElementById('csv-upload') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
    },
    onError: () => {
      toast({
        title: 'Upload Failed',
        description: 'Failed to upload books. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleUpload = () => {
    if (csvData.length === 0) return;
    bulkUploadMutation.mutate(csvData);
  };

  const downloadTemplate = () => {
    const csvContent = 'title,author,genre,description,cover_url,audio_path,duration\n' +
      '"The Great Gatsby","F. Scott Fitzgerald","Fiction","A classic American novel","https://example.com/cover.jpg","audio/gatsby.mp3","8h 30m"';
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'book_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Bulk Upload Books</h1>
          <p className="text-gray-600">Upload multiple books at once using a CSV file</p>
        </div>
      </div>

      {/* Upload Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Instructions</CardTitle>
          <CardDescription>Follow these steps to upload books in bulk</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Required CSV Format</h3>
              <p className="text-sm text-gray-600 mb-4">
                Your CSV file must include these columns (in any order):
              </p>
              <ul className="text-sm space-y-1">
                <li><code className="bg-gray-100 px-1 rounded">title</code> - Book title (required)</li>
                <li><code className="bg-gray-100 px-1 rounded">author</code> - Author name (required)</li>
                <li><code className="bg-gray-100 px-1 rounded">genre</code> - Book genre (required)</li>
                <li><code className="bg-gray-100 px-1 rounded">description</code> - Book description (optional)</li>
                <li><code className="bg-gray-100 px-1 rounded">cover_url</code> - Cover image URL (optional)</li>
                <li><code className="bg-gray-100 px-1 rounded">audio_path</code> - Audio file path (optional)</li>
                <li><code className="bg-gray-100 px-1 rounded">duration</code> - Audio duration (optional)</li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <Button onClick={downloadTemplate} variant="outline" className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Download CSV Template
              </Button>
              
              <div>
                <label htmlFor="csv-upload" className="block text-sm font-medium mb-2">
                  Upload CSV File
                </label>
                <input
                  id="csv-upload"
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      {previewMode && csvData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Preview ({csvData.length} books)</CardTitle>
            <CardDescription>Review the books before uploading</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-h-96 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Genre</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Audio</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {csvData.map((book, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{book.title}</TableCell>
                      <TableCell>{book.author}</TableCell>
                      <TableCell>{book.genre}</TableCell>
                      <TableCell className="max-w-48 truncate">{book.description || '-'}</TableCell>
                      <TableCell>{book.audio_path ? 'Yes' : 'No'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            <div className="flex justify-end gap-2 mt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setCsvData([]);
                  setPreviewMode(false);
                  setUploadResults({ success: 0, errors: [] });
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpload}
                disabled={bulkUploadMutation.isPending}
              >
                <Upload className="w-4 h-4 mr-2" />
                {bulkUploadMutation.isPending ? 'Uploading...' : `Upload ${csvData.length} Books`}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Results */}
      {uploadResults.success > 0 || uploadResults.errors.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Upload Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {uploadResults.success > 0 && (
              <Alert>
                <Check className="h-4 w-4" />
                <AlertDescription>
                  Successfully uploaded {uploadResults.success} books.
                </AlertDescription>
              </Alert>
            )}
            
            {uploadResults.errors.length > 0 && (
              <Alert variant="destructive">
                <X className="h-4 w-4" />
                <AlertDescription>
                  <div>
                    <p className="font-medium mb-2">{uploadResults.errors.length} books failed to upload:</p>
                    <ul className="text-sm space-y-1 max-h-32 overflow-y-auto">
                      {uploadResults.errors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
};

export default BulkUpload;
