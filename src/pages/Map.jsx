import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin } from 'lucide-react';

export default function Map() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50/30 to-purple-50/30 py-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <MapPin className="w-8 h-8 text-indigo-600" />
            <h1 className="text-4xl font-bold text-gray-900">Tour Locations Map</h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Explore all tour and scavenger hunt locations on the map below
          </p>
        </div>

        <Card className="overflow-hidden shadow-xl">
          <CardHeader>
            <CardTitle>Philadelphia Tours & Hunts</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="w-full" style={{ minHeight: '600px' }}>
              <iframe 
                src="https://www.google.com/maps/d/u/0/embed?mid=1D6Vybgyc5M3djbHgX-mYM6j-ukSRV-k&ehbc=2E312F" 
                width="100%" 
                height="600"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                title="Philadelphia Tour Locations"
              />
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Click on markers to view location details and navigate to specific stops
          </p>
        </div>
      </div>
    </div>
  );
}