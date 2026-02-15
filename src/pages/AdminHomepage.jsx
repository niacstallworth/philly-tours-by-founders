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
    hero_image_url: '',
    hero_title: 'Founders Threads',
    hero_subtitle: "Discover Philadelphia's rich tapestry of history, culture, and heritage through curated tours",
    gradient_from: 'indigo-900',
    gradient_via: 'indigo-800',
    gradient_to: 'purple-900',
    video_opacity: 20,
    fallback_opacity: 10,
    primary_color: '#4f46e5',
    primary_hover: '#4338ca',
    secondary_color: '#7c3aed',
    accent_color: '#6366f1'
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
                <Label htmlFor="hero_image_url">Fallback Background Image URL</Label>
                <Input
                  id="hero_image_url"
                  type="url"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={formData.hero_image_url}
                  onChange={(e) => setFormData({...formData, hero_image_url: e.target.value})}
                  className="mt-2"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Used when no video is set or if video fails to load
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

              <div className="space-y-4 border-t pt-4">
                <h3 className="font-semibold text-gray-900">Background Theme</h3>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="gradient_from">Gradient Start</Label>
                    <Input
                      id="gradient_from"
                      placeholder="indigo-900"
                      value={formData.gradient_from}
                      onChange={(e) => setFormData({...formData, gradient_from: e.target.value})}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="gradient_via">Gradient Middle</Label>
                    <Input
                      id="gradient_via"
                      placeholder="indigo-800"
                      value={formData.gradient_via}
                      onChange={(e) => setFormData({...formData, gradient_via: e.target.value})}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="gradient_to">Gradient End</Label>
                    <Input
                      id="gradient_to"
                      placeholder="purple-900"
                      value={formData.gradient_to}
                      onChange={(e) => setFormData({...formData, gradient_to: e.target.value})}
                      className="mt-2"
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  Use Tailwind color classes (e.g., blue-900, slate-800, emerald-700)
                </p>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="video_opacity">Video Opacity ({formData.video_opacity}%)</Label>
                    <Input
                      id="video_opacity"
                      type="range"
                      min="0"
                      max="100"
                      value={formData.video_opacity}
                      onChange={(e) => setFormData({...formData, video_opacity: parseInt(e.target.value)})}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="fallback_opacity">Fallback Image Opacity ({formData.fallback_opacity}%)</Label>
                    <Input
                      id="fallback_opacity"
                      type="range"
                      min="0"
                      max="100"
                      value={formData.fallback_opacity}
                      onChange={(e) => setFormData({...formData, fallback_opacity: parseInt(e.target.value)})}
                      className="mt-2"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4 border-t pt-4">
                <h3 className="font-semibold text-gray-900">Global Theme Colors</h3>
                <p className="text-sm text-gray-500">These colors will be applied throughout the entire app</p>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="primary_color">Primary Color</Label>
                    <div className="flex gap-2 items-center mt-2">
                      <Input
                        id="primary_color"
                        type="color"
                        value={formData.primary_color}
                        onChange={(e) => setFormData({...formData, primary_color: e.target.value})}
                        className="w-20 h-10 cursor-pointer"
                      />
                      <Input
                        type="text"
                        value={formData.primary_color}
                        onChange={(e) => setFormData({...formData, primary_color: e.target.value})}
                        className="font-mono text-sm"
                        placeholder="#4f46e5"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="primary_hover">Primary Hover</Label>
                    <div className="flex gap-2 items-center mt-2">
                      <Input
                        id="primary_hover"
                        type="color"
                        value={formData.primary_hover}
                        onChange={(e) => setFormData({...formData, primary_hover: e.target.value})}
                        className="w-20 h-10 cursor-pointer"
                      />
                      <Input
                        type="text"
                        value={formData.primary_hover}
                        onChange={(e) => setFormData({...formData, primary_hover: e.target.value})}
                        className="font-mono text-sm"
                        placeholder="#4338ca"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="secondary_color">Secondary Color</Label>
                    <div className="flex gap-2 items-center mt-2">
                      <Input
                        id="secondary_color"
                        type="color"
                        value={formData.secondary_color}
                        onChange={(e) => setFormData({...formData, secondary_color: e.target.value})}
                        className="w-20 h-10 cursor-pointer"
                      />
                      <Input
                        type="text"
                        value={formData.secondary_color}
                        onChange={(e) => setFormData({...formData, secondary_color: e.target.value})}
                        className="font-mono text-sm"
                        placeholder="#7c3aed"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="accent_color">Accent Color</Label>
                    <div className="flex gap-2 items-center mt-2">
                      <Input
                        id="accent_color"
                        type="color"
                        value={formData.accent_color}
                        onChange={(e) => setFormData({...formData, accent_color: e.target.value})}
                        className="w-20 h-10 cursor-pointer"
                      />
                      <Input
                        type="text"
                        value={formData.accent_color}
                        onChange={(e) => setFormData({...formData, accent_color: e.target.value})}
                        className="font-mono text-sm"
                        placeholder="#6366f1"
                      />
                    </div>
                  </div>
                </div>
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