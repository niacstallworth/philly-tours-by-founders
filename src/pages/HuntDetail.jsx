import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

import { MapPin, Clock, Trophy, CheckCircle2, Circle, Navigation, Lock, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { AnimatePresence } from 'framer-motion';
import ShareHuntModal from '../components/hunts/ShareHuntModal';

export default function HuntDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const huntId = urlParams.get('id');
  const [user, setUser] = useState(null);
  const [checkingLocation, setCheckingLocation] = useState(null);
  const [showShare, setShowShare] = useState(false);
  // Optimistic: track locally-completed stops before server confirms
  const [optimisticCompleted, setOptimisticCompleted] = useState([]);
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
    onSuccess: async (_, { stopNumber }) => {
      queryClient.invalidateQueries({ queryKey: ['hunt-progress', huntId] });
      setCheckingLocation(null);
      // Remove from optimistic once server confirms (server state takes over)
      setOptimisticCompleted(prev => prev.filter(n => n !== stopNumber));
      toast.success('Stop verified!');

      // Check if hunt is now complete and update stats
      const newCompleted = [...(progress.completed_stops || []), stopNumber];
      if (newCompleted.length === hunt.stops.length && user?.email) {
        try {
          await base44.functions.invoke('updateUserStats', {
            points_earned: 0,
            hunt_completed: true,
          });
          toast.success('🏆 Hunt recorded to leaderboard!');
        } catch (error) {
          console.error('Failed to update stats:', error);
        }
      }
    },
    onError: (_, { stopNumber }) => {
      // Roll back optimistic update on failure
      setOptimisticCompleted(prev => prev.filter(n => n !== stopNumber));
      setCheckingLocation(null);
      toast.error('Check-in failed. Please try again.');
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
        // Optimistic update — instantly mark as complete in UI
        setOptimisticCompleted(prev => [...prev, stop.stop_number]);
        toast.success('🎉 Success! You found the location!');
        updateProgressMutation.mutate({ stopNumber: stop.stop_number });
        setCheckingLocation(null);
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
    return progress?.completed_stops?.includes(stopNumber) || optimisticCompleted.includes(stopNumber);
  };

  const isStopUnlocked = (stopNumber) => {
    const allCompleted = [...(progress?.completed_stops || []), ...optimisticCompleted];
    if (!progress && optimisticCompleted.length === 0) return stopNumber <= 2;
    if (stopNumber <= 2) return true;
    return allCompleted.includes(stopNumber - 1);
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

  const allCompleted = [...new Set([...(progress?.completed_stops || []), ...optimisticCompleted])];
  const completedCount = allCompleted.length;
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
            <div className="flex-1">
              <h3 className="font-bold text-green-900 text-lg">Hunt Completed! 🎉</h3>
              <p className="text-sm text-green-700">Congratulations on finishing this scavenger hunt!</p>
            </div>
            <button
              onClick={() => setShowShare(true)}
              className="flex-shrink-0 flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-3 py-2 rounded-xl"
            >
              <Share2 className="w-4 h-4" /> Share
            </button>
          </div>
        )}
        <AnimatePresence>
          {showShare && hunt && <ShareHuntModal hunt={hunt} onClose={() => setShowShare(false)} />}
        </AnimatePresence>

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
        <div className="space-y-3">
          {hunt.stops?.map((stop) => {
            const completed = isStopCompleted(stop.stop_number);
            const unlocked = isStopUnlocked(stop.stop_number);
            const isChecking = checkingLocation === stop.stop_number;
            const needsAuth = stop.stop_number > 2 && !user;

            return (
              <Card
                key={stop.stop_number}
                className={`transition-all duration-300 ${
                  completed ? 'bg-green-50 border-green-200 shadow-sm' :
                  unlocked ? 'bg-white shadow-sm' :
                  'bg-gray-50 border-gray-200 opacity-60'
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm
                      ${completed ? 'bg-green-500 text-white' : unlocked ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-200 text-gray-500'}`}>
                      {completed ? <CheckCircle2 className="w-5 h-5" /> : unlocked ? stop.stop_number : <Lock className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-base leading-tight">
                        {unlocked || completed ? stop.name : `Stop ${stop.stop_number}`}
                      </h3>
                      {(unlocked || completed) && stop.address && (
                        <p className="text-xs text-gray-500 mt-0.5 truncate">{stop.address}</p>
                      )}
                      {!unlocked && !completed && (
                        <p className="text-xs text-gray-400 italic mt-0.5">Complete previous stop to unlock</p>
                      )}
                    </div>
                    {completed && <Badge className="bg-green-100 text-green-700 flex-shrink-0">Done</Badge>}
                  </div>
                </CardHeader>

                {(unlocked || completed) && (
                  <CardContent className="pt-0 space-y-3">
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                      <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-1.5">🔍 Clue</p>
                      <p className="text-sm text-amber-900 leading-relaxed">{stop.clue}</p>
                    </div>

                    {completed && stop.description && (
                      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
                        <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide mb-1.5">📖 About this spot</p>
                        <p className="text-sm text-gray-700 leading-relaxed">{stop.description}</p>
                      </div>
                    )}

                    {needsAuth && !completed && (
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                        <Lock className="w-6 h-6 mx-auto text-blue-500 mb-2" />
                        <p className="text-sm text-blue-900 font-medium mb-2">Sign in to check in here</p>
                        <Button size="sm" onClick={() => base44.auth.redirectToLogin(window.location.href)}>
                          Sign In
                        </Button>
                      </div>
                    )}

                    {!needsAuth && !completed && (
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleCheckIn(stop)}
                          disabled={isChecking}
                          className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                        >
                          <Navigation className="w-4 h-4 mr-2" />
                          {isChecking ? 'Verifying GPS...' : 'Check In Here'}
                        </Button>
                        {stop.latitude && stop.longitude && (
                          <Button
                            variant="outline"
                            onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${stop.latitude},${stop.longitude}`, '_blank')}
                          >
                            <MapPin className="w-4 h-4" />
                          </Button>
                        )}
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