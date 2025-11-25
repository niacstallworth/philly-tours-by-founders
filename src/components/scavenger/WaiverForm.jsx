import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertTriangle, FileText } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export default function WaiverForm({ huntName, userEmail, onComplete }) {
  const [formData, setFormData] = useState({
    full_name: '',
    age: '',
    email: userEmail || '',
    agreed_to_terms: false
  });
  const [errors, setErrors] = useState({});
  const queryClient = useQueryClient();

  const signWaiverMutation = useMutation({
    mutationFn: (data) => base44.entities.HuntWaiver.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['waiver'] });
      onComplete();
    }
  });

  const validate = () => {
    const newErrors = {};
    if (!formData.full_name.trim()) newErrors.full_name = 'Full name is required';
    if (!formData.age || parseInt(formData.age) < 1) newErrors.age = 'Valid age is required';
    if (parseInt(formData.age) < 18) newErrors.age = 'Must be 18 or older to participate';
    if (!formData.email.trim() || !formData.email.includes('@')) newErrors.email = 'Valid email is required';
    if (!formData.agreed_to_terms) newErrors.agreed_to_terms = 'You must agree to the terms';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    signWaiverMutation.mutate({
      user_email: formData.email,
      full_name: formData.full_name,
      age: parseInt(formData.age),
      hunt_name: huntName,
      signed_date: new Date().toISOString(),
      agreed_to_terms: true
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-900 via-orange-800 to-red-900 p-6 flex items-center justify-center">
      <Card className="max-w-2xl w-full">
        <CardHeader className="text-center border-b">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
              <FileText className="w-8 h-8 text-amber-600" />
            </div>
          </div>
          <CardTitle className="text-2xl">Participation Waiver</CardTitle>
          <p className="text-gray-600 mt-2">Please read and sign before continuing</p>
        </CardHeader>
        
        <CardContent className="p-6">
          <ScrollArea className="h-48 mb-6 p-4 bg-gray-50 rounded-lg border">
            <div className="text-sm text-gray-700 space-y-4">
              <h3 className="font-bold text-gray-900">RELEASE AND WAIVER OF LIABILITY</h3>
              
              <p>In consideration of being permitted to participate in the <strong>{huntName}</strong> Scavenger Hunt organized by Founders Threads, I hereby agree to the following:</p>
              
              <p><strong>1. ASSUMPTION OF RISK:</strong> I acknowledge that participation in this scavenger hunt involves walking through urban environments, which may include uneven surfaces, traffic, crowds, and other potential hazards. I voluntarily assume all risks associated with my participation.</p>
              
              <p><strong>2. RELEASE OF LIABILITY:</strong> I hereby release, waive, and discharge Founders Threads, its officers, employees, agents, and representatives from any and all liability, claims, demands, and causes of action arising out of or related to any loss, damage, or injury that may be sustained by me during my participation.</p>
              
              <p><strong>3. MEDICAL ACKNOWLEDGMENT:</strong> I certify that I am physically fit and have no medical condition that would prevent my participation. I agree to seek appropriate medical attention if needed at my own expense.</p>
              
              <p><strong>4. PHOTO/VIDEO CONSENT:</strong> I grant permission for any photos or videos taken during the event to be used for promotional purposes.</p>
              
              <p><strong>5. CONDUCT:</strong> I agree to follow all local laws, respect private property, and conduct myself in a safe and responsible manner throughout the hunt.</p>
              
              <p><strong>6. AGE REQUIREMENT:</strong> I confirm that I am at least 18 years of age or have parental/guardian consent to participate.</p>
              
              <p className="text-xs text-gray-500 mt-4">By signing below, I acknowledge that I have read this waiver, understand its contents, and agree to be bound by its terms.</p>
            </div>
          </ScrollArea>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Legal Name *</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                  placeholder="Enter your full name"
                  className={errors.full_name ? 'border-red-500' : ''}
                />
                {errors.full_name && <p className="text-xs text-red-500">{errors.full_name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="age">Age *</Label>
                <Input
                  id="age"
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({...formData, age: e.target.value})}
                  placeholder="Your age"
                  min="1"
                  max="120"
                  className={errors.age ? 'border-red-500' : ''}
                />
                {errors.age && <p className="text-xs text-red-500">{errors.age}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="your@email.com"
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
            </div>

            <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-lg border border-amber-200">
              <Checkbox
                id="agreed_to_terms"
                checked={formData.agreed_to_terms}
                onCheckedChange={(checked) => setFormData({...formData, agreed_to_terms: checked})}
                className={errors.agreed_to_terms ? 'border-red-500' : ''}
              />
              <div>
                <Label htmlFor="agreed_to_terms" className="cursor-pointer font-medium">
                  I have read and agree to the waiver terms above *
                </Label>
                <p className="text-xs text-gray-600 mt-1">
                  By checking this box, I acknowledge this is a legally binding agreement
                </p>
                {errors.agreed_to_terms && <p className="text-xs text-red-500 mt-1">{errors.agreed_to_terms}</p>}
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium">Safety First!</p>
                <p>Always be aware of your surroundings, follow traffic laws, and stay in public areas.</p>
              </div>
            </div>

            <Button
              type="submit"
              disabled={signWaiverMutation.isPending}
              className="w-full bg-amber-600 hover:bg-amber-700"
              size="lg"
            >
              {signWaiverMutation.isPending ? 'Signing...' : 'Sign Waiver & Continue'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}