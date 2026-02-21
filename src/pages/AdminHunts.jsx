import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Pencil, Trash2, Trophy } from 'lucide-react';
import { toast } from 'sonner';
import AdminGuard from '../components/AdminGuard';

export default function AdminHunts() {
  const [editingHunt, setEditingHunt] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoEmbed, setVideoEmbed] = useState('');

  const queryClient = useQueryClient();

  const { data: hunts, isLoading } = useQuery({
    queryKey: ['hunts'],
    queryFn: () => base44.entities.ScavengerHunt.list(),
    initialData: []
  });

  const updateHuntMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ScavengerHunt.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hunts'] });
      setEditingHunt(null);
      setImageUrl('');
      setVideoUrl('');
      setVideoEmbed('');
      toast.success('Hunt updated!');
    }
  });

  const deleteHuntMutation = useMutation({
    mutationFn: (id) => base44.entities.ScavengerHunt.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hunts'] });
      toast.success('Hunt deleted!');
    }
  });

  const handleEdit = (hunt) => {
    setEditingHunt(hunt);
    setImageUrl(hunt.image_url || '');
    setVideoUrl(hunt.video_url || '');
    setVideoEmbed(hunt.video_embed || '');
  };

  const handleSave = () => {
    if (editingHunt) {
      updateHuntMutation.mutate({
        id: editingHunt.id,
        data: { 
          image_url: imageUrl,
          video_url: videoUrl,
          video_embed: videoEmbed
        }
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading hunts...</div>
      </div>
    );
  }

  return (
    <AdminGuard>
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Manage Scavenger Hunts</h1>
          <p className="text-gray-600 mt-2">Edit images and videos for scavenger hunts</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hunts.map((hunt) => (
            <Card key={hunt.id} className="overflow-hidden">
              <div className="relative h-48 bg-gray-200">
                {hunt.image_url ? (
                  <img
                    src={hunt.image_url}
                    alt={hunt.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Trophy className="w-12 h-12 text-gray-400" />
                  </div>
                )}
              </div>
              
              <CardHeader>
                <CardTitle className="text-lg line-clamp-2">{hunt.title}</CardTitle>
                <p className="text-sm text-gray-500">{hunt.duration} • {hunt.stops?.length || 0} stops</p>
              </CardHeader>
              
              <CardContent className="space-y-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      onClick={() => handleEdit(hunt)}
                      className="w-full"
                      variant="outline"
                    >
                      <Pencil className="w-4 h-4 mr-2" />
                      Edit Hunt
                    </Button>
                  </DialogTrigger>
                  
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Edit Hunt Media</DialogTitle>
                    </DialogHeader>
                    
                    <div className="space-y-4 mt-4">
                      <div>
                        <h3 className="font-semibold text-lg mb-2">{hunt.title}</h3>
                        <p className="text-sm text-gray-600">{hunt.subtitle}</p>
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
                      </div>

                      <div className="space-y-4 border-t pt-4">
                        <h3 className="font-semibold">Video Background (Optional)</h3>
                        
                        <div className="space-y-2">
                          <Label htmlFor="videoUrl">Direct Video URL</Label>
                          <Input
                            id="videoUrl"
                            value={videoUrl}
                            onChange={(e) => {
                              setVideoUrl(e.target.value);
                              setVideoEmbed('');
                            }}
                            placeholder="https://example.com/video.mp4"
                          />
                        </div>

                        <div className="text-center text-sm text-gray-500">— OR —</div>

                        <div className="space-y-2">
                          <Label htmlFor="videoEmbed">YouTube/Vimeo Embed</Label>
                          <Textarea
                            id="videoEmbed"
                            value={videoEmbed}
                            onChange={(e) => {
                              setVideoEmbed(e.target.value);
                              setVideoUrl('');
                            }}
                            placeholder="<iframe src=...>"
                            className="font-mono text-xs"
                            rows={3}
                          />
                        </div>
                      </div>
                      
                      <div className="flex justify-end gap-3 pt-4">
                        <DialogTrigger asChild>
                          <Button variant="outline" onClick={() => setEditingHunt(null)}>
                            Cancel
                          </Button>
                        </DialogTrigger>
                        <Button 
                          onClick={handleSave}
                          disabled={updateHuntMutation.isPending}
                        >
                          {updateHuntMutation.isPending ? 'Saving...' : 'Save Changes'}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button className="w-full" variant="destructive" disabled={deleteHuntMutation.isPending}>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Hunt
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Hunt?</AlertDialogTitle>
                      <AlertDialogDescription>This will permanently delete "{hunt.title}". This cannot be undone.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => deleteHuntMutation.mutate(hunt.id)} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
    </AdminGuard>
  );
}