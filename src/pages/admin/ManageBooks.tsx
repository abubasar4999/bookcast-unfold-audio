
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Archive, ArchiveRestore, Search, Undo, ArrowLeft } from 'lucide-react';
import EditBookDialog from '@/components/admin/EditBookDialog';
import DeleteBookDialog from '@/components/admin/DeleteBookDialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useManageBooks } from '@/hooks/useManageBooks';

const ManageBooks = () => {
  const [editingBook, setEditingBook] = useState(null);
  const [deletingBook, setDeletingBook] = useState(null);
  const [showDeletedBooks, setShowDeletedBooks] = useState(false);
  const navigate = useNavigate();
  
  const {
    books,
    deletedBooks,
    genres,
    isLoading,
    tempSearchTerm,
    setTempSearchTerm,
    genreFilter,
    setGenreFilter,
    statusFilter,
    setStatusFilter,
    toggleArchiveMutation,
    deleteBookMutation,
    permanentDeleteMutation,
    restoreBookMutation,
    handleSearch,
    handleSearchKeyPress,
  } = useManageBooks();

  const handleToggleArchive = (book: any) => {
    toggleArchiveMutation.mutate({ id: book.id, currentStatus: book.status });
  };

  const handleDeleteBook = (book: any) => {
    deleteBookMutation.mutate(book);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/4 animate-pulse"></div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
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
            <h1 className="text-3xl font-bold text-gray-800">Manage Books</h1>
            <p className="text-gray-600">View, edit, and manage your book collection</p>
          </div>
        </div>
        <Button
          onClick={() => setShowDeletedBooks(!showDeletedBooks)}
          variant="outline"
        >
          {showDeletedBooks ? 'Show Active Books' : 'View Deleted Books'}
        </Button>
      </div>

      {!showDeletedBooks ? (
        <>
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
              <CardDescription>Filter books by search term, genre, or status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 flex-wrap">
                <div className="relative flex-1 min-w-64">
                  <Input
                    placeholder="Search books by title or author..."
                    value={tempSearchTerm}
                    onChange={(e) => setTempSearchTerm(e.target.value)}
                    onKeyPress={handleSearchKeyPress}
                    className="pr-10"
                  />
                  <Button
                    size="sm"
                    onClick={handleSearch}
                    className="absolute right-1 top-1 h-8 w-8 p-0"
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
                
                <Select value={genreFilter} onValueChange={setGenreFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by genre" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Genres</SelectItem>
                    {genres?.map((genre) => (
                      <SelectItem key={genre.name} value={genre.name}>
                        {genre.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Books Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Genre</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Audio</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {books?.map((book) => (
                    <TableRow key={book.id}>
                      <TableCell className="font-medium">{book.title}</TableCell>
                      <TableCell>{book.author}</TableCell>
                      <TableCell>{book.genre}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={book.status === 'active' ? 'default' : book.status === 'archived' ? 'secondary' : 'outline'}
                        >
                          {book.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={book.audio_path ? 'default' : 'outline'}>
                          {book.audio_path ? 'Available' : 'Missing'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingBook(book)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleArchive(book)}
                            disabled={toggleArchiveMutation.isPending}
                          >
                            {book.status === 'active' ? (
                              <Archive className="h-4 w-4" />
                            ) : (
                              <ArchiveRestore className="h-4 w-4" />
                            )}
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteBook(book)}
                            disabled={deleteBookMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      ) : (
        /* Deleted Books */
        <Card>
          <CardHeader>
            <CardTitle>Deleted Books</CardTitle>
            <CardDescription>Manage permanently deleted books</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Genre</TableHead>
                  <TableHead>Deleted At</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deletedBooks?.map((book) => (
                  <TableRow key={book.id}>
                    <TableCell className="font-medium">{book.title}</TableCell>
                    <TableCell>{book.author}</TableCell>
                    <TableCell>{book.genre}</TableCell>
                    <TableCell>{new Date(book.deleted_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => restoreBookMutation.mutate(book)}
                          disabled={restoreBookMutation.isPending}
                        >
                          <Undo className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => permanentDeleteMutation.mutate(book.id)}
                          disabled={permanentDeleteMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {books?.length === 0 && !showDeletedBooks && (
        <div className="text-center py-12">
          <p className="text-gray-500">No books found matching your criteria.</p>
        </div>
      )}

      {deletedBooks?.length === 0 && showDeletedBooks && (
        <div className="text-center py-12">
          <p className="text-gray-500">No deleted books found.</p>
        </div>
      )}

      {/* Edit Book Dialog */}
      {editingBook && (
        <EditBookDialog
          book={editingBook}
          open={!!editingBook}
          onOpenChange={(open) => !open && setEditingBook(null)}
        />
      )}

      {/* Delete Book Dialog */}
      {deletingBook && (
        <DeleteBookDialog
          book={deletingBook}
          open={!!deletingBook}
          onOpenChange={(open) => !open && setDeletingBook(null)}
        />
      )}
    </div>
  );
};

export default ManageBooks;
