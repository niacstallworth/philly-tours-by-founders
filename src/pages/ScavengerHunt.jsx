import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { MapPin, Lock, CheckCircle, Camera, Trophy, Navigation, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import StopCard from '../components/scavenger/StopCard';
import LocationChecker from '../components/scavenger/LocationChecker';
import ProgressMap from '../components/scavenger/ProgressMap';
import WaiverForm from '../components/scavenger/WaiverForm';

export default function ScavengerHunt() {
  const [user, setUser] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [huntStarted, setHuntStarted] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [waiverSigned, setWaiverSigned] = useState(false);

  const queryClient = useQueryClient();
  
  // Get hunt name from URL or default
  const urlParams = new URLSearchParams(window.location.search);
  const huntName = urlParams.get('hunt') || "Philadelphia Music History Scavenger Hunt";

  // Fetch user
  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  // Get user's current location
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setCurrentLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
        setLocationError(null);
      },
      (error) => {
        setLocationError("Unable to retrieve your location. Please enable GPS.");
      },
      { enableHighAccuracy: true, maximumAge: 10000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // Fetch all hunt stops
  const { data: stops, isLoading: stopsLoading } = useQuery({
    queryKey: ['scavengerStops', huntName],
    queryFn: () => base44.entities.ScavengerHuntStop.filter({ hunt_name: huntName }, 'stop_number'),
    initialData: []
  });

  // Fetch hunt theme
  const { data: themeList } = useQuery({
    queryKey: ['huntTheme', huntName],
    queryFn: () => base44.entities.HuntTheme.filter({ hunt_name: huntName }),
    initialData: []
  });

  const theme = themeList?.[0];

  // Fetch user progress
  const { data: progressList } = useQuery({
    queryKey: ['huntProgress', user?.email, huntName],
    queryFn: () => base44.entities.UserHuntProgress.filter({ 
      hunt_name: huntName, 
      user_email: user?.email 
    }),
    enabled: !!user,
    initialData: []
  });

  // Check for signed waiver
  const { data: waiverList } = useQuery({
    queryKey: ['waiver', user?.email, huntName],
    queryFn: () => base44.entities.HuntWaiver.filter({
      hunt_name: huntName,
      user_email: user?.email
    }),
    enabled: !!user,
    initialData: []
  });

  const progress = progressList?.[0];
  const hasSignedWaiver = waiverList?.length > 0 || waiverSigned;

  // Create/update progress
  const startHuntMutation = useMutation({
    mutationFn: () => base44.entities.UserHuntProgress.create({
      hunt_name: huntName,
      user_email: user.email,
      current_stop: 1,
      completed_stops: [],
      start_time: new Date().toISOString(),
      hidden_symbols_found: 0
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['huntProgress'] });
      setHuntStarted(true);
    }
  });

  const updateProgressMutation = useMutation({
    mutationFn: (data) => base44.entities.UserHuntProgress.update(progress.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['huntProgress'] });
    }
  });

  const handleStopComplete = (stopNumber) => {
    if (!progress) return;
    
    const newCompleted = [...(progress.completed_stops || []), stopNumber];
    const isComplete = newCompleted.length === stops.filter(s => !s.is_bonus).length;
    
    updateProgressMutation.mutate({
      completed_stops: newCompleted,
      current_stop: stopNumber + 1,
      ...(isComplete && { completion_time: new Date().toISOString() })
    });
  };

  const handleStartHunt = () => {
    if (!user) {
      base44.auth.redirectToLogin();
      return;
    }
    startHuntMutation.mutate();
  };

  const completedCount = progress?.completed_stops?.length || 0;
  const totalStops = stops.filter(s => !s.is_bonus).length;
  const progressPercent = totalStops > 0 ? (completedCount / totalStops) * 100 : 0;
  const isComplete = completedCount === totalStops;

  // Show waiver form after first stop if not signed
  const needsWaiver = progress && completedCount >= 1 && !hasSignedWaiver;

  if (needsWaiver) {
    return (
      <WaiverForm 
        huntName={huntName} 
        userEmail={user?.email}
        onComplete={() => setWaiverSigned(true)}
      />
    );
  }

  if (stopsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-amber-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading adventure...</p>
        </div>
      </div>
    );
  }

  // Hero / Welcome Screen
  if (!progress || !huntStarted) {
    const heroGradientFrom = theme?.hero_gradient_from || '#92400e';
    const heroGradientTo = theme?.hero_gradient_to || '#991b1b';
    
    return (
      <div 
        className="min-h-screen"
        style={{ background: `linear-gradient(135deg, ${heroGradientFrom}, ${heroGradientTo})` }}
      >
        <div className="relative overflow-hidden">
          {theme?.hero_image_url && (
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-20"
              style={{ backgroundImage: `url(${theme.hero_image_url})` }}
            />
          )}
          <div className="relative max-w-5xl mx-auto px-6 py-16">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center text-white mb-12"
            >
              <div className="flex justify-center mb-6">
                <div className="w-32 h-32 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <MapPin className="w-16 h-16" />
                </div>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold mb-4">
                {theme?.display_title || huntName}
              </h1>
              <p className="text-2xl text-amber-200 mb-8">
                {theme?.tagline || 'Discover the sounds that shaped a city'}
              </p>
              
              <div className="flex flex-wrap gap-4 justify-center mb-12">
                <Badge className="bg-white/20 text-white px-4 py-2 text-lg">
                  <Navigation className="w-4 h-4 mr-2" />
                  4.8 Miles
                </Badge>
                <Badge className="bg-white/20 text-white px-4 py-2 text-lg">
                  <Clock className="w-4 h-4 mr-2" />
                  2.5 - 4 Hours
                </Badge>
                <Badge className="bg-white/20 text-white px-4 py-2 text-lg">
                  <Trophy className="w-4 h-4 mr-2" />
                  {totalStops} Stops
                </Badge>
              </div>

              {locationError && (
                <div className="bg-red-500/20 backdrop-blur-sm border border-red-300 rounded-lg p-4 mb-8 max-w-2xl mx-auto">
                  <p className="text-white">{locationError}</p>
                  <p className="text-sm text-red-200 mt-2">Please enable location services to play</p>
                </div>
              )}

              <Button
                onClick={handleStartHunt}
                disabled={!currentLocation || startHuntMutation.isPending}
                className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-6 text-xl"
                size="lg"
              >
                {startHuntMutation.isPending ? 'Starting...' : 'Begin Your Quest'}
              </Button>
            </motion.div>

            {/* Features */}
            <div className="grid md:grid-cols-3 gap-6 mt-16">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    GPS Unlocked
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-amber-100">Clues unlock automatically as you reach each location</p>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Camera className="w-5 h-5" />
                    Selfie Verified
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-amber-100">Capture your journey with geo-verified selfies</p>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="w-5 h-5" />
                    Secret Rewards
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-amber-100">Unlock bonus locations and exclusive digital content</p>
                </CardContent>
              </Card>
            </div>

            {/* The 15 Stops Preview */}
            <Card className="mt-12 bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-white text-2xl">The {totalStops} Secret Stops</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-3">
                  {stops.filter(s => !s.is_bonus).map((stop) => (
                    <div key={stop.id} className="flex items-center gap-3 text-amber-100">
                      <span className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-500/30 flex items-center justify-center text-sm font-bold">
                        {stop.stop_number}
                      </span>
                      <span className="text-sm">{stop.title}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Active Hunt View
  const bgColor = theme?.background_color || '#fef3c7';
  const headerFrom = theme?.header_gradient_from || '#92400e';
  const headerTo = theme?.header_gradient_to || '#c2410c';
  
  return (
    <div className="min-h-screen pb-20" style={{ backgroundColor: bgColor }}>
      {/* Header */}
      <div 
        className="text-white p-6 sticky top-0 z-10 shadow-lg"
        style={{ background: `linear-gradient(to right, ${headerFrom}, ${headerTo})` }}
      >
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold">{theme?.display_title || huntName}</h1>
              <p className="text-amber-200 text-sm">{theme?.tagline || 'Philadelphia Adventure'}</p>
            </div>
            <Button
              onClick={() => setShowMap(!showMap)}
              variant="outline"
              className="bg-white/10 border-white/30 text-white hover:bg-white/20"
            >
              <MapPin className="w-4 h-4 mr-2" />
              {showMap ? 'Hide Map' : 'Show Map'}
            </Button>
          </div>

          {/* Welcome Back Message */}
          {completedCount > 0 && !isComplete && huntStarted && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 bg-blue-500/20 backdrop-blur-sm rounded-lg p-3 border border-blue-300/30"
            >
              <p className="text-sm font-medium">
                👋 Welcome back! You've completed {completedCount} stop{completedCount !== 1 ? 's' : ''}. 
                {progress?.current_stop <= totalStops && ` Continue to Stop ${progress.current_stop}.`}
              </p>
            </motion.div>
          )}
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress: {completedCount} / {totalStops} stops</span>
              <span>{Math.round(progressPercent)}%</span>
            </div>
            <Progress value={progressPercent} className="h-2 bg-white/20" />
          </div>

          {isComplete && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-4 bg-green-500/20 backdrop-blur-sm rounded-lg p-4 flex items-center gap-3"
            >
              <Trophy className="w-6 h-6" />
              <div>
                <p className="font-bold">Quest Complete!</p>
                <p className="text-sm text-amber-100">You've unlocked the secret 16th location!</p>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Map View */}
      {showMap && (
        <ProgressMap 
          stops={stops} 
          completedStops={progress.completed_stops || []}
          currentLocation={currentLocation}
        />
      )}

      {/* Stops List */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="space-y-6">
          {stops.map((stop) => {
            const isCompleted = progress.completed_stops?.includes(stop.stop_number);
            const isCurrent = progress.current_stop === stop.stop_number;
            const isLocked = !isCompleted && !isCurrent;
            const isBonusLocked = stop.is_bonus && !isComplete;

            return (
              <StopCard
                key={stop.id}
                stop={stop}
                isCompleted={isCompleted}
                isCurrent={isCurrent}
                isLocked={isLocked || isBonusLocked}
                currentLocation={currentLocation}
                onComplete={handleStopComplete}
                accentColor={theme?.stop_card_accent}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}