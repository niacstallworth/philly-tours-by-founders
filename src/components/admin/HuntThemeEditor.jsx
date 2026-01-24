import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function HuntThemeEditor({ hunt, isOpen, onClose, onSave }) {
  const [theme, setTheme] = useState({
    hunt_name: hunt?.hunt_name || '',
    display_title: hunt?.display_title || '',
    tagline: hunt?.tagline || 'GPS-Enabled Scavenger Hunt',
    hero_gradient_from: hunt?.hero_gradient_from || '#854d0e',
    hero_gradient_to: hunt?.hero_gradient_to || '#991b1b',
    background_color: hunt?.background_color || '#f9fafb',
    card_background: hunt?.card_background || '#ffffff',
    primary_color: hunt?.primary_color || '#d97706',
    text_color: hunt?.text_color || '#111827',
    hero_image_url: hunt?.hero_image_url || '',
    card_image_url: hunt?.card_image_url || '',
    header_gradient_from: hunt?.header_gradient_from || '#92400e',
    header_gradient_to: hunt?.header_gradient_to || '#c2410c',
    stop_card_accent: hunt?.stop_card_accent || '#f59e0b'
  });

  const handleSave = () => {
    onSave(theme);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Customize Hunt Theme & Colors</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="display_title">Display Title</Label>
            <Input
              id="display_title"
              value={theme.display_title}
              onChange={(e) => setTheme({...theme, display_title: e.target.value})}
              placeholder="Main title shown on the hunt page"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tagline">Tagline</Label>
            <Input
              id="tagline"
              value={theme.tagline}
              onChange={(e) => setTheme({...theme, tagline: e.target.value})}
              placeholder="Subtitle or description"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="hero_image_url">Hero Image URL (Welcome Screen)</Label>
            <Input
              id="hero_image_url"
              value={theme.hero_image_url}
              onChange={(e) => setTheme({...theme, hero_image_url: e.target.value})}
              placeholder="https://example.com/hero-image.jpg"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="card_image_url">Card Image URL (Home Page Box)</Label>
            <Input
              id="card_image_url"
              value={theme.card_image_url}
              onChange={(e) => setTheme({...theme, card_image_url: e.target.value})}
              placeholder="https://example.com/card-image.jpg"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hero_gradient_from">Hero Gradient From</Label>
              <div className="flex gap-2">
                <Input
                  id="hero_gradient_from"
                  type="color"
                  value={theme.hero_gradient_from}
                  onChange={(e) => setTheme({...theme, hero_gradient_from: e.target.value})}
                  className="w-16 h-10"
                />
                <Input
                  value={theme.hero_gradient_from}
                  onChange={(e) => setTheme({...theme, hero_gradient_from: e.target.value})}
                  placeholder="#854d0e"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hero_gradient_to">Hero Gradient To</Label>
              <div className="flex gap-2">
                <Input
                  id="hero_gradient_to"
                  type="color"
                  value={theme.hero_gradient_to}
                  onChange={(e) => setTheme({...theme, hero_gradient_to: e.target.value})}
                  className="w-16 h-10"
                />
                <Input
                  value={theme.hero_gradient_to}
                  onChange={(e) => setTheme({...theme, hero_gradient_to: e.target.value})}
                  placeholder="#991b1b"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="background_color">Background Color</Label>
              <div className="flex gap-2">
                <Input
                  id="background_color"
                  type="color"
                  value={theme.background_color}
                  onChange={(e) => setTheme({...theme, background_color: e.target.value})}
                  className="w-16 h-10"
                />
                <Input
                  value={theme.background_color}
                  onChange={(e) => setTheme({...theme, background_color: e.target.value})}
                  placeholder="#f9fafb"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="card_background">Card Background</Label>
              <div className="flex gap-2">
                <Input
                  id="card_background"
                  type="color"
                  value={theme.card_background}
                  onChange={(e) => setTheme({...theme, card_background: e.target.value})}
                  className="w-16 h-10"
                />
                <Input
                  value={theme.card_background}
                  onChange={(e) => setTheme({...theme, card_background: e.target.value})}
                  placeholder="#ffffff"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="primary_color">Primary/Accent Color</Label>
              <div className="flex gap-2">
                <Input
                  id="primary_color"
                  type="color"
                  value={theme.primary_color}
                  onChange={(e) => setTheme({...theme, primary_color: e.target.value})}
                  className="w-16 h-10"
                />
                <Input
                  value={theme.primary_color}
                  onChange={(e) => setTheme({...theme, primary_color: e.target.value})}
                  placeholder="#d97706"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="text_color">Text Color</Label>
              <div className="flex gap-2">
                <Input
                  id="text_color"
                  type="color"
                  value={theme.text_color}
                  onChange={(e) => setTheme({...theme, text_color: e.target.value})}
                  className="w-16 h-10"
                />
                <Input
                  value={theme.text_color}
                  onChange={(e) => setTheme({...theme, text_color: e.target.value})}
                  placeholder="#111827"
                />
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Preview:</p>
            <div 
              className="h-32 rounded-lg flex items-center justify-center text-white font-bold text-lg"
              style={{
                background: `linear-gradient(135deg, ${theme.hero_gradient_from}, ${theme.hero_gradient_to})`,
                color: theme.text_color
              }}
            >
              {theme.display_title || 'Your Hunt Title'}
            </div>
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Theme
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}