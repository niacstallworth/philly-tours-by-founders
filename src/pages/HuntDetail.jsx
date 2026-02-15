import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { MapPin, Clock, Trophy, CheckCircle2, Circle, Navigation, Lock, Upload, Camera } from 'lucide-react';
import { toast } from 'sonner';

export default function HuntDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const huntId = urlParams.get('id');
  const [user, setUser] = useState(null);
  const [waiverAccepted, setWaiverAccepted] = useState(false);
  const [checkingWaiver, setCheckingWaiver] = useState(true);
  const [showWaiverForm, setShowWaiverForm] = useState(false);
  const [waiverForm, setWaiverForm] = useState({ fullName: '', agreed: false });
  const [userLocation, setUserLocation] = useState(null);
  const [checkingLocation, setCheckingLocation] = useState(null);
  const [photoUploads, setPhotoUploads] = useState({});
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
    const checkAuth = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        
        const waivers = await base44.entities.Waiver.filter({ 
          user_email: currentUser.email 
        });
        setWaiverAccepted(waivers.length > 0);
      } catch (error) {
        setUser(null);
        setWaiverAccepted(false);
      } finally {
        setCheckingWaiver(false);
      }
    };
    checkAuth();
  }, []);

  const acceptWaiverMutation = useMutation({
    mutationFn: async () => {
      return await base44.entities.Waiver.create({
        user_email: user.email,
        full_name: waiverForm.fullName,
        accepted_at: new Date().toISOString()
      });
    },
    onSuccess: () => {
      setWaiverAccepted(true);
      setShowWaiverForm(false);
      toast.success('Waiver accepted');
    }
  });

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

  const isStopUnlocked = (stopNumber) => {
    if (!progress) return stopNumber <= 2;
    if (stopNumber <= 2) return true;
    return progress.completed_stops?.includes(stopNumber - 1);
  };

  const handlePhotoUpload = async (stopNumber, file) => {
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setPhotoUploads(prev => ({ ...prev, [stopNumber]: file_url }));
      
      await updateProgressMutation.mutateAsync({ stopNumber });
      toast.success('Photo verified!');
    } catch (error) {
      toast.error('Failed to upload photo');
    }
  };

  const handleStartHunt = async () => {
    if (!user) {
      base44.auth.redirectToLogin(window.location.href);
      return;
    }
    if (!waiverAccepted) {
      setShowWaiverForm(true);
      return;
    }
    await createProgressMutation.mutateAsync();
  };

  const handleWaiverSubmit = async () => {
    if (!waiverForm.fullName || !waiverForm.agreed) {
      toast.error('Please fill in all fields');
      return;
    }
    await acceptWaiverMutation.mutateAsync();
    createProgressMutation.mutate();
  };

  if (isLoading || checkingWaiver) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!hunt) {
    return <div className="min-h-screen flex items-center justify-center">Hunt not found</div>;
  }

  if (showWaiverForm) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-6">
          <Card>
            <CardHeader>
              <CardTitle>Participation Waiver</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-900 font-medium mb-2">⚠️ Important Notice</p>
                <p className="text-sm text-yellow-800">
                  By participating in this scavenger hunt, you acknowledge the risks involved in traveling to various locations.
                </p>
              </div>

              <div className="space-y-4 text-sm text-gray-600">
                <p>I understand and agree that:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>I will obey all traffic laws and pedestrian rules while participating in this hunt</li>
                  <li>I am responsible for my own safety and well-being throughout the activity</li>
                  <li>I will respect private property and public spaces</li>
                  <li>The organizers are not liable for any injuries, accidents, or incidents that occur during participation</li>
                  <li>I am physically capable of completing this activity</li>
                </ul>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    value={waiverForm.fullName}
                    onChange={(e) => setWaiverForm(prev => ({ ...prev, fullName: e.target.value }))}
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="flex items-start gap-3">
                  <Checkbox
                    id="agreed"
                    checked={waiverForm.agreed}
                    onCheckedChange={(checked) => setWaiverForm(prev => ({ ...prev, agreed: checked }))}
                  />
                  <Label htmlFor="agreed" className="text-sm cursor-pointer">
                    I have read and agree to the terms above. I accept full responsibility for my participation in this scavenger hunt.
                  </Label>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowWaiverForm(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleWaiverSubmit}
                  disabled={!waiverForm.fullName || !waiverForm.agreed || acceptWaiverMutation.isPending}
                  className="flex-1"
                >
                  {acceptWaiverMutation.isPending ? 'Accepting...' : 'Accept & Continue'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
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
                onClick={handleStartHunt}
                disabled={createProgressMutation.isPending}
                className="w-full mt-4"
              >
                {!user ? 'Sign In to Start' : !waiverAccepted ? 'Accept Waiver to Start' : 'Start Hunt'}
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

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Hunt Stops</h2>
          {!user && (
            <Button size="sm" onClick={() => base44.auth.redirectToLogin(window.location.href)}>
              Sign In
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
                          disabled={isChecking || !progress}
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