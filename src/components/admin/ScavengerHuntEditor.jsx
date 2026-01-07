import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';

export default function ScavengerHuntEditor({ stop, isOpen, onClose, onSave }) {
  const [editedStop, setEditedStop] = useState(stop || {
    hunt_name: '',
    stop_number: 1,
    title: '',
    clue: '',
    location: { latitude: 39.9526, longitude: -75.1652, address: '' },
    radius: 50,
    fact: '',
    image_url: '',
    is_bonus: false
  });

  const handleSave = () => {
    onSave(editedStop);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {stop ? 'Edit Stop' : 'Create New Stop'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="hunt_name">Hunt Name</Label>
            <Input
              id="hunt_name"
              value={editedStop.hunt_name}
              onChange={(e) => setEditedStop({...editedStop, hunt_name: e.target.value})}
              placeholder="e.g., Philadelphia Music History Scavenger Hunt"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="stop_number">Stop Number</Label>
            <Input
              id="stop_number"
              type="number"
              value={editedStop.stop_number}
              onChange={(e) => setEditedStop({...editedStop, stop_number: parseInt(e.target.value)})}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={editedStop.title}
              onChange={(e) => setEditedStop({...editedStop, title: e.target.value})}
              placeholder="Stop title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="clue">Clue</Label>
            <Textarea
              id="clue"
              value={editedStop.clue}
              onChange={(e) => setEditedStop({...editedStop, clue: e.target.value})}
              placeholder="The clue for this stop"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="latitude">Latitude</Label>
              <Input
                id="latitude"
                type="number"
                step="0.0001"
                value={editedStop.location?.latitude || ''}
                onChange={(e) => setEditedStop({
                  ...editedStop, 
                  location: {...editedStop.location, latitude: parseFloat(e.target.value)}
                })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="longitude">Longitude</Label>
              <Input
                id="longitude"
                type="number"
                step="0.0001"
                value={editedStop.location?.longitude || ''}
                onChange={(e) => setEditedStop({
                  ...editedStop, 
                  location: {...editedStop.location, longitude: parseFloat(e.target.value)}
                })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={editedStop.location?.address || ''}
              onChange={(e) => setEditedStop({
                ...editedStop, 
                location: {...editedStop.location, address: e.target.value}
              })}
              placeholder="Street address or location description"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="radius">Check-in Radius (meters)</Label>
            <Input
              id="radius"
              type="number"
              value={editedStop.radius}
              onChange={(e) => setEditedStop({...editedStop, radius: parseFloat(e.target.value)})}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fact">Historical Fact</Label>
            <Textarea
              id="fact"
              value={editedStop.fact}
              onChange={(e) => setEditedStop({...editedStop, fact: e.target.value})}
              placeholder="Interesting fact revealed after check-in"
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image_url">Image URL</Label>
            <Input
              id="image_url"
              value={editedStop.image_url || ''}
              onChange={(e) => setEditedStop({...editedStop, image_url: e.target.value})}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="is_bonus">Bonus Stop</Label>
            <Switch
              id="is_bonus"
              checked={editedStop.is_bonus}
              onCheckedChange={(checked) => setEditedStop({...editedStop, is_bonus: checked})}
            />
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}