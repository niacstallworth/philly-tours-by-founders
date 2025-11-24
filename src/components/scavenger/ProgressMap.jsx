import React from 'react';
import { Card } from '@/components/ui/card';
import { MapPin, CheckCircle, Navigation } from 'lucide-react';

export default function ProgressMap({ stops, completedStops, currentLocation }) {
  // Simple visual map representation
  // In a real app, you'd integrate with a maps library like Mapbox or Leaflet
  
  return (
    <Card className="mx-6 my-6">
      <div className="p-6">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Hunt Progress Map
        </h3>
        
        <div className="bg-gray-100 rounded-lg p-8 min-h-[300px] relative">
          {/* Placeholder for map */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <MapPin className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Map visualization coming soon</p>
              <p className="text-xs mt-2">Use the navigation in each stop card to get directions</p>
            </div>
          </div>

          {/* Current location indicator */}
          {currentLocation && (
            <div className="absolute top-4 right-4 bg-blue-500 text-white px-3 py-2 rounded-full text-sm flex items-center gap-2">
              <Navigation className="w-4 h-4" />
              Your Location
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-500" />
            <span>Completed ({completedStops?.length || 0})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-amber-500" />
            <span>Current Stop</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-gray-300" />
            <span>Locked</span>
          </div>
        </div>
      </div>
    </Card>
  );
}