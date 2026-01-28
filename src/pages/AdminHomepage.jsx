import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Save, Video } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminHomepage() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    hero_video_url: '',
    hero_title: 'Founders Threads',
    hero_subtitle: "Discover Philadelphia's rich tapestry of history, culture, and heritage through curated tours"
  });

  const { data: settings, isLoading } = useQuery({
    queryKey: ['homepage-settings'],
    queryFn: async () => {
      const list = await base44.entities.HomePageSettings.list();
      if (list[0]) {
        setFormData(list[0]);
        return list[0];
      }
      return null;
    }
  });

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (settings?.id) {
        return await base44.entities.HomePageSettings.update(settings.id, data);
      } else {
        return await base44.entities.HomePageSettings.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homepage-settings'] });
      toast.success('Homepage settings saved!');
    },
    onError: (error) => {
      toast.error('Failed to save settings');
      console.error(error);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Homepage Settings</h1>
          <p className="text-gray-600 mt-2">Customize the homepage hero section</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="w-5 h-5" />
              Hero Section
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="hero_video_url">Background Video URL</Label>
                <Input
                  id="hero_video_url"
                  type="url"
                  placeholder="https://example.com/video.mp4"
                  value={formData.hero_video_url}
                  onChange={(e) => setFormData({...formData, hero_video_url: e.target.value})}
                  className="mt-2"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Enter a direct link to a video file (MP4 or WebM format). Make sure the URL is publicly accessible. Leave empty to use the default image.
                </p>
              </div>

              <div>
                <Label htmlFor="hero_title">Hero Title</Label>
                <Input
                  id="hero_title"
                  value={formData.hero_title}
                  onChange={(e) => setFormData({...formData, hero_title: e.target.value})}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="hero_subtitle">Hero Subtitle</Label>
                <Textarea
                  id="hero_subtitle"
                  value={formData.hero_subtitle}
                  onChange={(e) => setFormData({...formData, hero_subtitle: e.target.value})}
                  className="mt-2"
                  rows={3}
                />
              </div>

              {formData.hero_video_url && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                  <video
                    key={formData.hero_video_url}
                    src={formData.hero_video_url}
                    className="w-full h-48 object-cover rounded"
                    autoPlay
                    loop
                    muted
                    playsInline
                    controls
                    onError={(e) => {
                      toast.error('Video failed to load. Check the URL or try a different format.');
                    }}
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    If the video doesn't play, check that the URL is correct and publicly accessible.
                  </p>
                </div>
              )}

              <Button
                type="submit"
                disabled={saveMutation.isPending}
                className="w-full"
              >
                <Save className="w-4 h-4 mr-2" />
                {saveMutation.isPending ? 'Saving...' : 'Save Settings'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}