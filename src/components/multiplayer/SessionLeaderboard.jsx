import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SessionLeaderboard({ sessionId, user }) {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial load
    const loadPlayers = async () => {
      try {
        const sessionPlayers = await base44.entities.SessionPlayer.filter({
          session_id: sessionId
        });
        setPlayers(
          sessionPlayers.sort((a, b) => (b.points_earned || 0) - (a.points_earned || 0))
        );
      } catch (error) {
        console.error('Failed to load players:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPlayers();

    // Real-time subscription
    const unsubscribe = base44.entities.SessionPlayer.subscribe((event) => {
      if (event.type === 'update') {
        setPlayers((prev) => {
          const updated = prev.map((p) =>
            p.id === event.id ? event.data : p
          );
          return updated.sort((a, b) => (b.points_earned || 0) - (a.points_earned || 0));
        });
      } else if (event.type === 'create') {
        if (event.data.session_id === sessionId) {
          setPlayers((prev) => {
            const updated = [...prev, event.data];
            return updated.sort((a, b) => (b.points_earned || 0) - (a.points_earned || 0));
          });
        }
      }
    });

    return () => unsubscribe();
  }, [sessionId]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            Live Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-amber-200 bg-amber-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-amber-900">
          <Trophy className="w-5 h-5 text-amber-500" />
          Live Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {players.map((player, idx) => {
            const isCurrentUser = user?.email === player.user_email;
            return (
              <motion.div
                key={player.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`flex items-center gap-3 p-3 rounded-lg ${
                  isCurrentUser
                    ? 'bg-indigo-100 border-2 border-indigo-400'
                    : 'bg-white border border-gray-200'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    idx === 0
                      ? 'bg-amber-400 text-white'
                      : idx === 1
                      ? 'bg-gray-400 text-white'
                      : idx === 2
                      ? 'bg-orange-400 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">
                    {player.user_name}
                    {isCurrentUser && <span className="text-xs text-indigo-600 ml-1">(You)</span>}
                  </p>
                  <p className="text-xs text-gray-500">
                    {player.stops_completed?.length || 0} stops · {player.points_earned || 0} pts
                  </p>
                </div>
                {idx < 3 && (
                  <Zap className="w-4 h-4 text-amber-500" />
                )}
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}