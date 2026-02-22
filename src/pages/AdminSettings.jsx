import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Settings, Save, Palette, Video, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import AdminGuard from '../components/AdminGuard';

export default function AdminSettings() {
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['homepage-settings'],
    queryFn: async () => {
      const list = await base44.entities.HomePageSettings.list();
      return list[0] || {};
    }
  });

  const [form, setForm] = useState(null);

  React.useEffect(() => {
   if (settings && !form) {
     setForm({
       hero_title: settings.hero_title || 'Founders Threads',
       hero_subtitle: settings.hero_subtitle || '',
       hero_image_url: settings.hero_image_url || '',
       hero_video_url: settings.hero_video_url || '',
       hero_video_embed: settings.hero_video_embed || '',
       merchandise_hero_title: settings.merchandise_hero_title || 'Merchandise',
       merchandise_hero_subtitle: settings.merchandise_hero_subtitle || '',
       merchandise_hero_image_url: settings.merchandise_hero_image_url || '',
       merchandise_hero_video_url: settings.merchandise_hero_video_url || '',
       merchandise_hero_video_embed: settings.merchandise_hero_video_embed || '',
       primary_color: settings.primary_color || '#4f46e5',
       primary_hover: settings.primary_hover || '#4338ca',
       secondary_color: settings.secondary_color || '#7c3aed',
       accent_color: settings.accent_color || '#6366f1',
       video_opacity: settings.video_opacity ?? 20,
       merchandise_video_opacity: settings.merchandise_video_opacity ?? 20,
       facebook_url: settings.facebook_url || '',
       instagram_url: settings.instagram_url || '',
       twitter_url: settings.twitter_url || '',
       youtube_url: settings.youtube_url || '',
       tiktok_url: settings.tiktok_url || '',
       website_url: settings.website_url || 'https://founderstory.square.site/',
     });
   }
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      const list = await base44.entities.HomePageSettings.list();
      if (list[0]) {
        return base44.entities.HomePageSettings.update(list[0].id, data);
      } else {
        return base44.entities.HomePageSettings.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homepage-settings'] });
      toast.success('Settings saved!');
    },
    onError: () => toast.error('Failed to save settings')
  });

  const set = (key, value) => setForm(f => ({ ...f, [key]: value }));

  if (isLoading || !form) return (
    <div className="min-h-screen flex items-center justify-center text-gray-500">Loading...</div>
  );

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8 flex items-center gap-3">
            <Settings className="w-8 h-8 text-indigo-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Site Settings</h1>
              <p className="text-gray-600 mt-1">Manage hero section, colors, and social links</p>
            </div>
          </div>

          {/* Home Hero Section */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="w-5 h-5" /> Home Hero Section
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Hero Title</Label>
                  <Input value={form.hero_title} onChange={e => set('hero_title', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Hero Subtitle</Label>
                  <Input value={form.hero_subtitle} onChange={e => set('hero_subtitle', e.target.value)} placeholder="Discover Philadelphia's untold stories" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Background Image URL</Label>
                <Input value={form.hero_image_url} onChange={e => set('hero_image_url', e.target.value)} placeholder="https://images.unsplash.com/..." />
                {form.hero_image_url && (
                  <img src={form.hero_image_url} alt="preview" className="w-full h-32 object-cover rounded-lg mt-2" onError={e => e.target.style.display='none'} />
                )}
              </div>
              <div className="space-y-2">
                <Label>Background Video URL (MP4/WebM)</Label>
                <Input value={form.hero_video_url} onChange={e => set('hero_video_url', e.target.value)} placeholder="https://example.com/video.mp4" />
              </div>
              <div className="space-y-2">
                <Label>Video Opacity (%)</Label>
                <Input type="number" min="0" max="100" value={form.video_opacity} onChange={e => set('video_opacity', Number(e.target.value))} className="w-32" />
              </div>
            </CardContent>
          </Card>

          {/* Merchandise Hero Section */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="w-5 h-5" /> Merchandise Hero Section
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input value={form.merchandise_hero_title} onChange={e => set('merchandise_hero_title', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Subtitle</Label>
                  <Input value={form.merchandise_hero_subtitle} onChange={e => set('merchandise_hero_subtitle', e.target.value)} placeholder="Explore our collection..." />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Background Image URL</Label>
                <Input value={form.merchandise_hero_image_url} onChange={e => set('merchandise_hero_image_url', e.target.value)} placeholder="https://images.unsplash.com/..." />
                {form.merchandise_hero_image_url && (
                  <img src={form.merchandise_hero_image_url} alt="preview" className="w-full h-32 object-cover rounded-lg mt-2" onError={e => e.target.style.display='none'} />
                )}
              </div>
              <div className="space-y-2">
                <Label>Background Video URL (MP4/WebM)</Label>
                <Input value={form.merchandise_hero_video_url} onChange={e => set('merchandise_hero_video_url', e.target.value)} placeholder="https://example.com/video.mp4" />
              </div>
              <div className="space-y-2">
                <Label>Video Embed Code (YouTube/Vimeo)</Label>
                <Textarea value={form.merchandise_hero_video_embed} onChange={e => set('merchandise_hero_video_embed', e.target.value)} placeholder="Paste YouTube embed code here" rows="3" />
              </div>
              <div className="space-y-2">
                <Label>Video Opacity (%)</Label>
                <Input type="number" min="0" max="100" value={form.merchandise_video_opacity} onChange={e => set('merchandise_video_opacity', Number(e.target.value))} className="w-32" />
              </div>
            </CardContent>
          </Card>

          {/* Colors */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" /> Brand Colors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { key: 'primary_color', label: 'Primary' },
                  { key: 'primary_hover', label: 'Primary Hover' },
                  { key: 'secondary_color', label: 'Secondary' },
                  { key: 'accent_color', label: 'Accent' },
                ].map(({ key, label }) => (
                  <div key={key} className="space-y-2">
                    <Label>{label}</Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={form[key]}
                        onChange={e => set(key, e.target.value)}
                        className="w-10 h-10 rounded cursor-pointer border border-gray-200"
                      />
                      <Input value={form[key]} onChange={e => set(key, e.target.value)} className="font-mono text-sm" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Social Links */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="w-5 h-5" /> Social Links
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { key: 'website_url', label: 'Website URL' },
                { key: 'facebook_url', label: 'Facebook URL' },
                { key: 'instagram_url', label: 'Instagram URL' },
                { key: 'twitter_url', label: 'Twitter/X URL' },
                { key: 'youtube_url', label: 'YouTube URL' },
                { key: 'tiktok_url', label: 'TikTok URL' },
              ].map(({ key, label }) => (
                <div key={key} className="space-y-1">
                  <Label>{label}</Label>
                  <Input value={form[key]} onChange={e => set(key, e.target.value)} placeholder="https://..." />
                </div>
              ))}
            </CardContent>
          </Card>

          <Button
            className="w-full"
            size="lg"
            onClick={() => saveMutation.mutate(form)}
            disabled={saveMutation.isPending}
          >
            <Save className="w-4 h-4 mr-2" />
            {saveMutation.isPending ? 'Saving...' : 'Save All Settings'}
          </Button>
        </div>
      </div>
    </AdminGuard>
  );
}