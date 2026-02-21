import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

import { MapPin, Clock, Trophy, CheckCircle2, Circle, Navigation, Lock } from 'lucide-react';
import { toast } from 'sonner';

export default function HuntDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const huntId = urlParams.get('id');
  const [user, setUser] = useState(null);
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
      const progressList = await base44.entities.HuntProgress.filter({ 
        hunt_id: huntId,
        user_email: user.email 
      });
      return progressList[0] || null;
    },
    enabled: !!huntId && !!user
  });

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  const createProgressMutation = useMutation({
    mutationFn: async () => {
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
    if (!user) {
      base44.auth.redirectToLogin(window.location.href);
      return;
    }

    if (!progress) {
      try {
        await createProgressMutation.mutateAsync();
      } catch (error) {
        toast.error('Failed to start hunt');
        return;
      }
    }

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
      const distanceInMiles = (distance * 0.000621371).toFixed(2);
      
      if (distance <= radius) {
        await updateProgressMutation.mutateAsync({ stopNumber: stop.stop_number });
        toast.success('🎉 Success! You found the location!');
      } else {
        toast.error(`You're ${distanceInMiles} miles away from this location. Get closer to check in!`);
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

  const isStopUnlocked = (stopNumber) => {
    if (!progress) return stopNumber <= 2;
    if (stopNumber <= 2) return true;
    return progress.completed_stops?.includes(stopNumber - 1);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading hunt...</p>
        </div>
      </div>
    );
  }

  if (!hunt) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Trophy className="w-12 h-12 mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Hunt not found</h2>
          <p className="text-gray-400">This hunt may have been removed.</p>
        </div>
      </div>
    );
  }

  const completedCount = progress?.completed_stops?.length || 0;
  const totalStops = hunt.stops?.length || 0;
  const isComplete = completedCount === totalStops && totalStops > 0;

  const difficultyColor = {
    easy: 'bg-green-100 text-green-800',
    moderate: 'bg-amber-100 text-amber-800',
    challenging: 'bg-red-100 text-red-800'
  }[hunt.difficulty] || 'bg-gray-100 text-gray-800';

  const progressPct = totalStops > 0 ? (completedCount / totalStops) * 100 : 0;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Hero */}
      <div className="relative h-80 md:h-[440px] overflow-hidden">
        {hunt.image_url ? (
          <img src={hunt.image_url} alt={hunt.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-indigo-900 to-purple-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 text-white">
          <div className="max-w-4xl mx-auto">
            <Badge className={`mb-3 capitalize ${difficultyColor}`}>{hunt.difficulty}</Badge>
            <h1 className="text-3xl md:text-5xl font-bold mb-2 leading-tight">{hunt.title}</h1>
            {hunt.subtitle && <p className="text-lg text-white/80 mb-4">{hunt.subtitle}</p>}
            <div className="flex flex-wrap gap-4 text-sm text-white/80">
              {hunt.duration && (
                <div className="flex items-center gap-1.5"><Clock className="w-4 h-4" />{hunt.duration}</div>
              )}
              <div className="flex items-center gap-1.5"><MapPin className="w-4 h-4" />{totalStops} stops</div>
              <div className="flex items-center gap-1.5"><Trophy className="w-4 h-4" />GPS Verified</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 space-y-5">
        {isComplete && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
              <Trophy className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-bold text-green-900 text-lg">Hunt Completed! 🎉</h3>
              <p className="text-sm text-green-700">Congratulations on finishing this scavenger hunt!</p>
            </div>
          </div>
        )}

        {/* Progress */}
        <Card>
          <CardContent className="pt-5 pb-5">
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold text-gray-900">Your Progress</span>
              <span className="text-sm font-medium text-gray-500">{completedCount} of {totalStops} stops</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-indigo-500 to-green-500 h-3 rounded-full transition-all duration-700"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-2 text-right">{Math.round(progressPct)}% complete</p>
          </CardContent>
        </Card>

        {/* About */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">About This Hunt</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 leading-relaxed">{hunt.description}</p>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Hunt Stops</h2>
          {!user && (
            <Button size="sm" variant="outline" onClick={() => base44.auth.redirectToLogin(window.location.href)}>
              Sign In to Track
            </Button>
          )}
        </div>
        <div className="space-y-4">
          {hunt.stops?.map((stop, index) => {
            const completed = isStopCompleted(stop.stop_number);
            const unlocked = isStopUnlocked(stop.stop_number);
            const isChecking = checkingLocation === stop.stop_number;
            const needsAuth = stop.stop_number > 2 && !user;
            
            return (
              <Card key={stop.stop_number} className={completed ? 'bg-green-50 border-green-200' : unlocked ? '' : 'opacity-50'}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      {completed ? (
                        <CheckCircle2 className="w-6 h-6 text-green-600 mt-1" />
                      ) : unlocked ? (
                        <Circle className="w-6 h-6 text-gray-400 mt-1" />
                      ) : (
                        <Lock className="w-6 h-6 text-gray-400 mt-1" />
                      )}
                      <div>
                        <h3 className="font-bold text-lg">Stop {stop.stop_number}: {unlocked || completed ? stop.name : '???'}</h3>
                        {(unlocked || completed) && <p className="text-sm text-gray-600">{stop.address}</p>}
                        {!unlocked && !completed && (
                          <p className="text-sm text-gray-500 italic">Complete the previous stop to unlock</p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                {(unlocked || completed) && (
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

                    {needsAuth && !completed && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                        <Lock className="w-8 h-8 mx-auto text-blue-600 mb-2" />
                        <p className="text-sm text-blue-900 font-medium mb-2">Sign in required</p>
                        <Button size="sm" onClick={() => base44.auth.redirectToLogin(window.location.href)}>
                          Sign In to Continue
                        </Button>
                      </div>
                    )}

                    {!needsAuth && !completed && (
                      <div className="flex gap-2 flex-col">
                        <Button
                          onClick={() => handleCheckIn(stop)}
                          disabled={isChecking}
                          className="w-full"
                        >
                          <Navigation className="w-4 h-4 mr-2" />
                          {isChecking ? 'Verifying GPS...' : 'Check In'}
                        </Button>
                        
                        <Button
                          variant="outline"
                          onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${stop.latitude},${stop.longitude}`, '_blank')}
                          className="w-full"
                        >
                          <MapPin className="w-4 h-4 mr-2" />
                          Get Directions
                        </Button>
                      </div>
                    )}

                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}