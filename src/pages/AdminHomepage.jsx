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
    hero_video_embed: '',
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
                <Label htmlFor="hero_video_url">Background Video URL (Direct File)</Label>
                <Input
                  id="hero_video_url"
                  type="url"
                  placeholder="https://example.com/video.mp4"
                  value={formData.hero_video_url}
                  onChange={(e) => setFormData({...formData, hero_video_url: e.target.value, hero_video_embed: ''})}
                  className="mt-2"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Direct link to MP4 or WebM file. OR use embed code below.
                </p>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">Or</span>
                </div>
              </div>

              <div>
                <Label htmlFor="hero_video_embed">YouTube/Vimeo Embed Code</Label>
                <Textarea
                  id="hero_video_embed"
                  placeholder='<iframe src="https://www.youtube.com/embed/VIDEO_ID?autoplay=1&mute=1&loop=1&controls=0" ...></iframe>'
                  value={formData.hero_video_embed}
                  onChange={(e) => setFormData({...formData, hero_video_embed: e.target.value, hero_video_url: ''})}
                  className="mt-2 font-mono text-xs"
                  rows={4}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Paste the full iframe embed code from YouTube or Vimeo. Make sure to add autoplay=1&mute=1&loop=1&controls=0 to the URL.
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

              {(formData.hero_video_url || formData.hero_video_embed) && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                  {formData.hero_video_embed ? (
                    <div 
                      className="w-full h-48 rounded overflow-hidden"
                      dangerouslySetInnerHTML={{ __html: formData.hero_video_embed }}
                    />
                  ) : (
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
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    Preview may not be exact. Check the actual homepage to see the final result.
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