import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, MapPin, Copy, Share2, Lock, Crown, AlertCircle, Loader2, MapPinOff, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import SessionLeaderboard from '../components/multiplayer/SessionLeaderboard';

export default function MultiplayerHunt() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionCode = searchParams.get('code');

  const [session, setSession] = useState(null);
  const [hunt, setHunt] = useState(null);
  const [user, setUser] = useState(null);
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [userPos, setUserPos] = useState(null);
  const [currentStop, setCurrentStop] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [nearbyStop, setNearbyStop] = useState(null);

  useEffect(() => {
    loadSessionData();
  }, [sessionCode]);

  const loadSessionData = async () => {
    try {
      if (!sessionCode) {
        setError('No session code provided');
        setLoading(false);
        return;
      }

      const user = await base44.auth.me();
      if (!user) {
        base44.auth.redirectToLogin(window.location.href);
        return;
      }
      setUser(user);

      // Load session
      const sessions = await base44.entities.MultiplayerSession.filter({
        session_code: sessionCode.toUpperCase()
      });

      if (!sessions || sessions.length === 0) {
        setError('Session not found');
        setLoading(false);
        return;
      }

      const sess = sessions[0];
      setSession(sess);

      // Load hunt
      const hunts = await base44.entities.ScavengerHunt.filter({ id: sess.hunt_id });
      if (hunts && hunts.length > 0) {
        setHunt(hunts[0]);
      }

      // Load current player
      const players = await base44.entities.SessionPlayer.filter({
        session_id: sess.id,
        user_email: user.email
      });

      if (players && players.length > 0) {
        setCurrentPlayer(players[0]);
        setCurrentStop(players[0].stops_completed?.length || 0);
      } else {
        setError('You are not part of this session');
      }

      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  // GPS tracking for stop detection
  useEffect(() => {
    if (!hunt || !currentPlayer) return;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserPos({ lat: latitude, lng: longitude });

        // Check for nearby stops
        const stops = hunt.stops || [];
        const uncompletedStops = stops.filter(
          (s) => !(currentPlayer.stops_completed || []).includes(s.stop_number)
        );

        const nearby = uncompletedStops.find((stop) => {
          const dist = distance(
            latitude,
            longitude,
            stop.latitude,
            stop.longitude
          );
          return dist <= (stop.verification_radius || 50);
        });

        setNearbyStop(nearby);
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 2000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [hunt, currentPlayer]);

  const handleCheckIn = async () => {
    if (!nearbyStop || !currentPlayer || !session) return;

    try {
      const newStops = [...(currentPlayer.stops_completed || []), nearbyStop.stop_number];
      const pointsForStop = 25; // Points per stop

      await base44.entities.SessionPlayer.update(currentPlayer.id, {
        stops_completed: newStops,
        points_earned: (currentPlayer.points_earned || 0) + pointsForStop,
        last_action_at: new Date().toISOString()
      });

      setCurrentPlayer({
        ...currentPlayer,
        stops_completed: newStops,
        points_earned: (currentPlayer.points_earned || 0) + pointsForStop
      });

      setCurrentStop(newStops.length);
      toast.success(`${nearbyStop.name} unlocked! +${pointsForStop} pts`);

      if (newStops.length === (hunt.stops || []).length) {
        toast.success('Hunt completed! 🎉');
      }
    } catch (error) {
      toast.error('Check-in failed');
      console.error(error);
    }
  };

  const handleShareSession = async () => {
    const shareUrl = `${window.location.origin}/MultiplayerHunt?code=${session.session_code}`;
    
    if (navigator.share) {
      navigator.share({
        title: `Join my ${hunt?.title} multiplayer hunt!`,
        text: `Session code: ${session.session_code}`,
        url: shareUrl
      });
    } else {
      navigator.clipboard.writeText(`Session code: ${session.session_code}`);
      toast.success('Session code copied!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <Card className="max-w-md w-full border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-900 mb-2">{error}</p>
                <Button onClick={() => navigate('/Home')} className="w-full">
                  Back to Home
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!session || !hunt || !currentPlayer || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 pb-24">
      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Hunt Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 px-6 py-8 text-white">
              <h1 className="text-2xl font-bold mb-1">{hunt.title}</h1>
              <p className="text-white/80 text-sm mb-4">{hunt.description}</p>
              <div className="flex items-center gap-2 text-sm">
                <Users className="w-4 h-4" />
                <span>Multiplayer Session</span>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Session Code Share */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Invite Friends</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-4 py-3">
                <span className="font-mono font-bold text-lg text-indigo-600 flex-1">
                  {session.session_code}
                </span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(session.session_code);
                    toast.success('Code copied!');
                  }}
                  className="p-2 hover:bg-white rounded transition-colors"
                >
                  <Copy className="w-4 h-4 text-gray-600" />
                </button>
              </div>
              <Button onClick={handleShareSession} className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700">
                <Share2 className="w-4 h-4" />
                Share Session
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Live Leaderboard */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <SessionLeaderboard sessionId={session.id} user={user} />
        </motion.div>

        {/* Hunt Progress */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <MapPin className="w-4 h-4 text-indigo-600" />
                Your Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">
                  {currentStop} / {hunt.stops?.length || 0} stops
                </span>
                <span className="font-bold text-lg text-indigo-600">{currentPlayer.points_earned || 0} pts</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all"
                  style={{
                    width: `${((currentStop / (hunt.stops?.length || 1)) * 100)}%`
                  }}
                />
              </div>

              {/* Stops */}
              <div className="space-y-2 mt-4">
                {(hunt.stops || []).map((stop) => {
                  const isCompleted = (currentPlayer.stops_completed || []).includes(stop.stop_number);
                  const isNearby = nearbyStop?.stop_number === stop.stop_number;

                  return (
                    <div
                      key={stop.stop_number}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        isCompleted
                          ? 'bg-green-50 border-green-300'
                          : isNearby
                          ? 'bg-amber-50 border-amber-400'
                          : 'bg-white border-gray-200'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {isCompleted ? (
                          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        ) : isNearby ? (
                          <MapPin className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5 animate-pulse" />
                        ) : (
                          <MapPinOff className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 text-sm">{stop.name}</p>
                          <p className="text-xs text-gray-500 mb-2">{stop.clue}</p>
                          {!isCompleted && isNearby && (
                            <Button
                              onClick={handleCheckIn}
                              size="sm"
                              className="bg-amber-500 hover:bg-amber-600 text-white text-xs"
                            >
                              Check In
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

function distance(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}