import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function WaiverModal({ open, onAccept }) {
  const [fullName, setFullName] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAccept = async () => {
    if (!fullName.trim()) {
      toast.error('Please enter your full name');
      return;
    }
    if (!agreed) {
      toast.error('Please accept the terms');
      return;
    }

    setLoading(true);
    try {
      const user = await base44.auth.me();
      await base44.entities.Waiver.create({
        user_email: user.email,
        full_name: fullName,
        accepted_at: new Date().toISOString()
      });
      toast.success('Waiver accepted!');
      onAccept();
    } catch (error) {
      toast.error('Failed to accept waiver');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Participation Waiver</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="bg-gray-50 p-4 rounded-lg text-sm space-y-3">
            <p className="font-semibold">Release of Liability and Assumption of Risk</p>
            <p>
              By participating in GPS-enabled scavenger hunts provided by Founders Threads, you acknowledge and agree to the following:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>You will be walking in public areas and near traffic. You are responsible for your own safety.</li>
              <li>You assume all risks associated with participation, including but not limited to: trips, falls, contact with other participants, weather conditions, and traffic.</li>
              <li>You agree to follow all traffic laws and safety regulations.</li>
              <li>You release Founders Threads, its organizers, and affiliates from any liability for injuries or damages.</li>
              <li>You permit the use of GPS tracking for verification purposes during the hunt.</li>
              <li>You are physically capable of walking the duration of the hunt.</li>
            </ul>
            <p className="text-xs text-gray-600 mt-4">
              This waiver is legally binding. By accepting, you waive certain legal rights including the right to sue.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fullName">Full Legal Name</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
            />
          </div>

          <div className="flex items-start gap-3">
            <Checkbox
              id="agreed"
              checked={agreed}
              onCheckedChange={setAgreed}
            />
            <label htmlFor="agreed" className="text-sm leading-relaxed cursor-pointer">
              I have read and understand this waiver. I accept all terms and conditions and acknowledge the risks involved in participating in scavenger hunts.
            </label>
          </div>

          <Button
            onClick={handleAccept}
            disabled={loading || !fullName.trim() || !agreed}
            className="w-full"
          >
            {loading ? 'Processing...' : 'Accept Waiver and Continue'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}