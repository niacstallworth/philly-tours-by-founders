import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Pencil, Image as ImageIcon } from 'lucide-react';

export default function AdminTours() {
  const [editingTour, setEditingTour] = useState(null);
  const [imageUrl, setImageUrl] = useState('');

  const queryClient = useQueryClient();

  const { data: tours, isLoading } = useQuery({
    queryKey: ['tours'],
    queryFn: () => base44.entities.Tour.list(),
    initialData: []
  });

  const updateTourMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Tour.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tours'] });
      setEditingTour(null);
      setImageUrl('');
    }
  });

  const handleEdit = (tour) => {
    setEditingTour(tour);
    setImageUrl(tour.image_url || '');
  };

  const handleSave = () => {
    if (editingTour) {
      updateTourMutation.mutate({
        id: editingTour.id,
        data: { image_url: imageUrl }
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading tours...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Manage Tour Images</h1>
          <p className="text-gray-600 mt-2">Edit the cover images for each tour</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tours.map((tour) => (
            <Card key={tour.id} className="overflow-hidden">
              <div className="relative h-48 bg-gray-200">
                {tour.image_url ? (
                  <img
                    src={tour.image_url}
                    alt={tour.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-12 h-12 text-gray-400" />
                  </div>
                )}
              </div>
              
              <CardHeader>
                <CardTitle className="text-lg line-clamp-2">{tour.title}</CardTitle>
                <p className="text-sm text-gray-500">{tour.duration}</p>
              </CardHeader>
              
              <CardContent>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      onClick={() => handleEdit(tour)}
                      className="w-full"
                      variant="outline"
                    >
                      <Pencil className="w-4 h-4 mr-2" />
                      Edit Image
                    </Button>
                  </DialogTrigger>
                  
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Edit Tour Image</DialogTitle>
                    </DialogHeader>
                    
                    <div className="space-y-4 mt-4">
                      <div>
                        <h3 className="font-semibold text-lg mb-2">{tour.title}</h3>
                        <p className="text-sm text-gray-600">{tour.subtitle}</p>
                      </div>
                      
                      {imageUrl && (
                        <div className="border rounded-lg overflow-hidden">
                          <img
                            src={imageUrl}
                            alt="Preview"
                            className="w-full h-64 object-cover"
                            onError={(e) => {
                              e.target.src = '';
                              e.target.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                      
                      <div className="space-y-2">
                        <Label htmlFor="imageUrl">Image URL</Label>
                        <Input
                          id="imageUrl"
                          value={imageUrl}
                          onChange={(e) => setImageUrl(e.target.value)}
                          placeholder="https://images.unsplash.com/..."
                        />
                        <p className="text-xs text-gray-500">
                          Tip: Use Unsplash for high-quality images. Search on unsplash.com and copy the image URL.
                        </p>
                      </div>
                      
                      <div className="flex justify-end gap-3 pt-4">
                        <DialogTrigger asChild>
                          <Button variant="outline" onClick={() => setEditingTour(null)}>
                            Cancel
                          </Button>
                        </DialogTrigger>
                        <Button 
                          onClick={handleSave}
                          disabled={updateTourMutation.isPending}
                        >
                          {updateTourMutation.isPending ? 'Saving...' : 'Save Image'}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}