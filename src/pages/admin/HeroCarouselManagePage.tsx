import { useState } from 'react';
import { ArrowLeft, Plus, Edit, Trash2, MoveUp, MoveDown, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  useAdminHeroCarousel,
  useCreateHeroCarousel,
  useUpdateHeroCarousel,
  useDeleteHeroCarousel,
  useReorderHeroCarousel,
  type HeroCarouselItem,
  type CreateHeroCarouselItem,
} from '@/hooks/useHeroCarousel';
import { useBooks } from '@/hooks/useBooks';

const HeroCarouselManagePage = () => {
  const navigate = useNavigate();
  const { data: carouselItems = [], isLoading } = useAdminHeroCarousel();
  const { data: books = [] } = useBooks();
  const createMutation = useCreateHeroCarousel();
  const updateMutation = useUpdateHeroCarousel();
  const deleteMutation = useDeleteHeroCarousel();
  const reorderMutation = useReorderHeroCarousel();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<HeroCarouselItem | null>(null);
  const [formData, setFormData] = useState<CreateHeroCarouselItem>({
    title: '',
    subtitle: '',
    description: '',
    background_image_url: '',
    cta_text: 'Start Listening',
    cta_link: '',
    book_id: '',
    display_order: 0,
    is_active: true,
  });

  const resetForm = () => {
    setFormData({
      title: '',
      subtitle: '',
      description: '',
      background_image_url: '',
      cta_text: 'Start Listening',
      cta_link: '',
      book_id: '',
      display_order: carouselItems.length,
      is_active: true,
    });
  };

  const handleCreate = () => {
    setEditingItem(null);
    resetForm();
    setIsCreateDialogOpen(true);
  };

  const handleEdit = (item: HeroCarouselItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      subtitle: item.subtitle || '',
      description: item.description || '',
      background_image_url: item.background_image_url || '',
      cta_text: item.cta_text,
      cta_link: item.cta_link || '',
      book_id: item.book_id || '',
      display_order: item.display_order,
      is_active: item.is_active,
    });
    setIsCreateDialogOpen(true);
  };

  const handleSave = async () => {
    if (editingItem) {
      await updateMutation.mutateAsync({
        id: editingItem.id,
        ...formData,
      });
    } else {
      await createMutation.mutateAsync(formData);
    }
    setIsCreateDialogOpen(false);
    resetForm();
    setEditingItem(null);
  };

  const handleDelete = async (id: string) => {
    await deleteMutation.mutateAsync(id);
  };

  const handleReorder = async (id: string, direction: 'up' | 'down') => {
    const currentIndex = carouselItems.findIndex(item => item.id === id);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= carouselItems.length) return;

    const updates = carouselItems.map((item, index) => {
      if (index === currentIndex) {
        return { id: item.id, display_order: newIndex };
      } else if (index === newIndex) {
        return { id: item.id, display_order: currentIndex };
      } else {
        return { id: item.id, display_order: index };
      }
    });

    await reorderMutation.mutateAsync(updates);
  };

  const toggleActive = async (item: HeroCarouselItem) => {
    await updateMutation.mutateAsync({
      id: item.id,
      is_active: !item.is_active,
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">Hero Carousel Management</h1>
          <p className="text-muted-foreground">Manage homepage hero carousel items</p>
        </div>
        <Button onClick={handleCreate} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add New Item
        </Button>
      </div>

      {/* Carousel Items Table */}
      <Card>
        <CardHeader>
          <CardTitle>Carousel Items</CardTitle>
        </CardHeader>
        <CardContent>
          {carouselItems.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No carousel items found</p>
              <Button onClick={handleCreate}>
                <Plus className="w-4 h-4 mr-2" />
                Create First Item
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Linked Book</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>CTA Text</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {carouselItems.map((item, index) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{item.display_order + 1}</span>
                          <div className="flex flex-col gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleReorder(item.id, 'up')}
                              disabled={index === 0}
                              className="h-6 w-6 p-0"
                            >
                              <MoveUp className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleReorder(item.id, 'down')}
                              disabled={index === carouselItems.length - 1}
                              className="h-6 w-6 p-0"
                            >
                              <MoveDown className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{item.title}</p>
                          {item.subtitle && (
                            <p className="text-sm text-muted-foreground">{item.subtitle}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {item.books ? (
                          <div>
                            <p className="font-medium">{item.books.title}</p>
                            <p className="text-sm text-muted-foreground">by {item.books.author}</p>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">No book linked</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant={item.is_active ? 'default' : 'secondary'}>
                            {item.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleActive(item)}
                            className="h-6 w-6 p-0"
                          >
                            {item.is_active ? (
                              <EyeOff className="w-3 h-3" />
                            ) : (
                              <Eye className="w-3 h-3" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>{item.cta_text}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(item)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Carousel Item</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{item.title}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(item.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Edit Carousel Item' : 'Create New Carousel Item'}
            </DialogTitle>
            <DialogDescription>
              {editingItem ? 'Update the carousel item details.' : 'Add a new item to the hero carousel.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter carousel title"
                />
              </div>
              <div>
                <Label htmlFor="subtitle">Subtitle</Label>
                <Input
                  id="subtitle"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  placeholder="Enter subtitle (optional)"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter description (optional)"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="background_image_url">Background Image URL</Label>
              <Input
                id="background_image_url"
                type="url"
                value={formData.background_image_url}
                onChange={(e) => setFormData({ ...formData, background_image_url: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cta_text">Call-to-Action Text</Label>
                <Input
                  id="cta_text"
                  value={formData.cta_text}
                  onChange={(e) => setFormData({ ...formData, cta_text: e.target.value })}
                  placeholder="Start Listening"
                />
              </div>
              <div>
                <Label htmlFor="cta_link">CTA Link (Optional)</Label>
                <Input
                  id="cta_link"
                  value={formData.cta_link}
                  onChange={(e) => setFormData({ ...formData, cta_link: e.target.value })}
                  placeholder="/player/book-id or external URL"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="book_id">Linked Book (Optional)</Label>
                <Select
                  value={formData.book_id || "none"}
                  onValueChange={(value) => setFormData({ ...formData, book_id: value === "none" ? "" : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a book" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No book linked</SelectItem>
                    {books.map((book) => (
                      <SelectItem key={book.id} value={book.id}>
                        {book.title} - {book.author}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="display_order">Display Order</Label>
                <Input
                  id="display_order"
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                  min="0"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor="is_active">Active</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!formData.title || createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending
                ? 'Saving...'
                : editingItem
                ? 'Update Item'
                : 'Create Item'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HeroCarouselManagePage;