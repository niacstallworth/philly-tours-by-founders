import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock, CheckCircle, MapPin, Navigation, Camera } from 'lucide-react';
import { motion } from 'framer-motion';
import LocationChecker from './LocationChecker';

export default function StopCard({ stop, isCompleted, isCurrent, isLocked, currentLocation, onComplete }) {
  const [showChecker, setShowChecker] = useState(false);

  const calculateDistance = () => {
    if (!currentLocation || !stop.location) return null;

    const R = 6371e3; // Earth radius in meters
    const φ1 = currentLocation.latitude * Math.PI / 180;
    const φ2 = stop.location.latitude * Math.PI / 180;
    const Δφ = (stop.location.latitude - currentLocation.latitude) * Math.PI / 180;
    const Δλ = (stop.location.longitude - currentLocation.longitude) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance in meters
  };

  const distance = calculateDistance();
  const isNearby = distance && distance < (stop.radius || 50);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: stop.stop_number * 0.05 }}
    >
      <Card className={`overflow-hidden ${
        isCompleted ? 'border-green-500 bg-green-50' : 
        isCurrent ? 'border-amber-500 bg-white shadow-lg' : 
        'border-gray-200 bg-gray-50'
      }`}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                isCompleted ? 'bg-green-500 text-white' :
                isCurrent ? 'bg-amber-500 text-white' :
                'bg-gray-300 text-gray-600'
              }`}>
                {isCompleted ? <CheckCircle className="w-6 h-6" /> : stop.stop_number}
              </div>
              
              <div className="flex-1">
                <CardTitle className={`text-lg ${isLocked ? 'text-gray-400' : 'text-gray-900'}`}>
                  {isLocked ? <Lock className="w-4 h-4 inline mr-2" /> : null}
                  {stop.title}
                </CardTitle>
                {stop.location?.address && !isLocked && (
                  <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {stop.location.address}
                  </p>
                )}
              </div>
            </div>

            {stop.is_bonus && (
              <Badge className="bg-purple-500 text-white">Bonus</Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {!isLocked && (
            <>
              {stop.clue && (
                <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded">
                  <p className="text-sm font-medium text-amber-900">Clue:</p>
                  <p className="text-gray-700 mt-1">{stop.clue}</p>
                </div>
              )}

              {stop.image_url && (
                <img 
                  src={stop.image_url} 
                  alt={stop.title}
                  className="w-full h-48 object-cover rounded-lg"
                />
              )}

              {isCompleted && stop.fact && (
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                  <p className="text-sm font-medium text-blue-900">Historical Fact:</p>
                  <p className="text-gray-700 mt-1">{stop.fact}</p>
                </div>
              )}

              {isCurrent && (
                <div className="space-y-3">
                  {distance && (
                    <div className="flex items-center gap-2 text-sm">
                      <Navigation className="w-4 h-4 text-amber-600" />
                      <span className={isNearby ? 'text-green-600 font-medium' : 'text-gray-600'}>
                        {distance < 1000 
                          ? `${Math.round(distance)}m away` 
                          : `${(distance / 1000).toFixed(1)}km away`}
                      </span>
                      {isNearby && (
                        <Badge className="bg-green-500 text-white ml-2">You're here!</Badge>
                      )}
                    </div>
                  )}

                  {isNearby && !showChecker && (
                    <Button 
                      onClick={() => setShowChecker(true)}
                      className="w-full bg-amber-600 hover:bg-amber-700"
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      Check In & Take Selfie
                    </Button>
                  )}

                  {showChecker && (
                    <LocationChecker
                      stop={stop}
                      onComplete={() => {
                        onComplete(stop.stop_number);
                        setShowChecker(false);
                      }}
                      onCancel={() => setShowChecker(false)}
                    />
                  )}
                </div>
              )}

              {isCompleted && (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Completed!</span>
                </div>
              )}
            </>
          )}

          {isLocked && (
            <div className="text-center py-8 text-gray-400">
              <Lock className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Complete previous stops to unlock</p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}