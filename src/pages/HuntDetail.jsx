import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, Trophy, CheckCircle2, Circle, Navigation } from 'lucide-react';
import { toast } from 'sonner';

export default function HuntDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const huntId = urlParams.get('id');
  const [userLocation, setUserLocation] = useState(null);
  const [checkingLocation, setCheckingLocation] = useState(null);
  const queryClient = useQueryClient();

  const { data: hunt, isLoading } = useQuery({
    queryKey: ['hunt', huntId],
    queryFn: async () => {
      const hunts = await base44.entities.ScavengerHunt.list();
      return hunts.find(h => h.id === huntId);
    },
    enabled: !!huntId
  });

  const { data: progress } = useQuery({
    queryKey: ['hunt-progress', huntId],
    queryFn: async () => {
      const user = await base44.auth.me();
      const progressList = await base44.entities.HuntProgress.filter({ 
        hunt_id: huntId,
        user_email: user.email 
      });
      return progressList[0] || null;
    },
    enabled: !!huntId
  });

  const createProgressMutation = useMutation({
    mutationFn: async () => {
      const user = await base44.auth.me();
      return await base44.entities.HuntProgress.create({
        hunt_id: huntId,
        user_email: user.email,
        started_at: new Date().toISOString(),
        completed_stops: []
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hunt-progress', huntId] });
      toast.success('Hunt started!');
    }
  });

  const updateProgressMutation = useMutation({
    mutationFn: async ({ stopNumber }) => {
      const newCompletedStops = [...(progress.completed_stops || []), stopNumber];
      const isComplete = newCompletedStops.length === hunt.stops.length;
      
      return await base44.entities.HuntProgress.update(progress.id, {
        completed_stops: newCompletedStops,
        ...(isComplete && { completed_at: new Date().toISOString() })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hunt-progress', huntId] });
      setCheckingLocation(null);
      toast.success('Stop verified!');
    }
  });

  const getUserLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => reject(error),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  const handleCheckIn = async (stop) => {
    setCheckingLocation(stop.stop_number);
    try {
      const location = await getUserLocation();
      const distance = calculateDistance(
        location.latitude,
        location.longitude,
        stop.latitude,
        stop.longitude
      );

      const radius = stop.verification_radius || 50;
      
      if (distance <= radius) {
        await updateProgressMutation.mutateAsync({ stopNumber: stop.stop_number });
      } else {
        toast.error(`You're ${Math.round(distance)}m away. Get within ${radius}m to check in.`);
        setCheckingLocation(null);
      }
    } catch (error) {
      toast.error('Could not verify location. Please enable GPS.');
      setCheckingLocation(null);
    }
  };

  const isStopCompleted = (stopNumber) => {
    return progress?.completed_stops?.includes(stopNumber);
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!hunt) {
    return <div className="min-h-screen flex items-center justify-center">Hunt not found</div>;
  }

  const completedCount = progress?.completed_stops?.length || 0;
  const totalStops = hunt.stops?.length || 0;
  const isComplete = completedCount === totalStops && totalStops > 0;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="relative h-96 overflow-hidden">
        <img
          src={hunt.image_url}
          alt={hunt.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
          <div className="max-w-4xl mx-auto">
            <Badge className="mb-4 bg-white/20 backdrop-blur-sm border-none">
              {hunt.difficulty}
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-3">{hunt.title}</h1>
            <p className="text-xl mb-4">{hunt.subtitle}</p>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{hunt.duration}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>{totalStops} stops</span>
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                <span>GPS Verified</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 -mt-8">
        {isComplete && (
          <Card className="mb-6 bg-green-50 border-green-200">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Trophy className="w-8 h-8 text-green-600" />
                <div>
                  <h3 className="font-bold text-green-900">Hunt Completed!</h3>
                  <p className="text-sm text-green-700">Congratulations on finishing this scavenger hunt!</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Progress</span>
              <span className="text-lg font-normal">{completedCount} / {totalStops}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-green-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${totalStops > 0 ? (completedCount / totalStops) * 100 : 0}%` }}
              />
            </div>
            {!progress && (
              <Button
                onClick={() => createProgressMutation.mutate()}
                disabled={createProgressMutation.isPending}
                className="w-full mt-4"
              >
                Start Hunt
              </Button>
            )}
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>About This Hunt</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 leading-relaxed">{hunt.description}</p>
          </CardContent>
        </Card>

        <h2 className="text-2xl font-bold mb-4">Hunt Stops</h2>
        <div className="space-y-4">
          {hunt.stops?.map((stop) => {
            const completed = isStopCompleted(stop.stop_number);
            const isChecking = checkingLocation === stop.stop_number;
            
            return (
              <Card key={stop.stop_number} className={completed ? 'bg-green-50 border-green-200' : ''}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      {completed ? (
                        <CheckCircle2 className="w-6 h-6 text-green-600 mt-1" />
                      ) : (
                        <Circle className="w-6 h-6 text-gray-400 mt-1" />
                      )}
                      <div>
                        <h3 className="font-bold text-lg">Stop {stop.stop_number}: {stop.name}</h3>
                        <p className="text-sm text-gray-600">{stop.address}</p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm font-medium text-yellow-900 mb-1">🔍 Clue:</p>
                    <p className="text-yellow-800">{stop.clue}</p>
                  </div>
                  
                  {completed && stop.description && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-700">{stop.description}</p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    {!completed && progress && (
                      <Button
                        onClick={() => handleCheckIn(stop)}
                        disabled={isChecking}
                        className="flex-1"
                      >
                        <Navigation className="w-4 h-4 mr-2" />
                        {isChecking ? 'Verifying...' : 'Check In'}
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${stop.latitude},${stop.longitude}`, '_blank')}
                    >
                      <MapPin className="w-4 h-4 mr-2" />
                      Directions
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}