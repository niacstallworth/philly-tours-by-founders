import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Crown, Lock, Trophy, Zap, Target, Medal } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Leaderboard() {
  const [user, setUser] = useState(null);
  const [timeframe, setTimeframe] = useState('all-time');

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  const isElite = user?.role === 'admin' || user?.membership === 'elite';

  const { data: profiles = [] } = useQuery({
    queryKey: ['leaderboard-profiles'],
    queryFn: () => base44.entities.UserProfile.list(),
    enabled: isElite,
  });

  const { data: badges = [] } = useQuery({
    queryKey: ['badges'],
    queryFn: () => base44.entities.Badge.list(),
    enabled: isElite,
  });

  const { data: userBadges = [] } = useQuery({
    queryKey: ['user-badges'],
    queryFn: () => {
      if (!user?.email) return [];
      return base44.entities.UserBadge.filter({ user_email: user.email });
    },
    enabled: isElite && !!user?.email,
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center px-4">
        <div className="text-center">
          <Lock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Sign In Required</h1>
          <p className="text-gray-600 dark:text-slate-400 mb-6">Sign in to view the leaderboard and earn badges.</p>
          <Button onClick={() => base44.auth.redirectToLogin(window.location.href)} className="bg-indigo-600 hover:bg-indigo-700">
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  if (!isElite) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center px-4">
        <div className="text-center">
          <Crown className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Elite Membership Required</h1>
          <p className="text-gray-600 dark:text-slate-400 mb-6">Unlock the leaderboard and exclusive badges with Elite membership.</p>
          <Button onClick={() => (window.location.href = '/UserSettings')} className="bg-amber-500 hover:bg-amber-600">
            Upgrade to Elite
          </Button>
        </div>
      </div>
    );
  }

  const sorted = [...profiles].sort((a, b) => (b.score || 0) - (a.score || 0));
  const userRank = sorted.findIndex(p => p.user_email === user?.email) + 1;
  const userProfile = sorted.find(p => p.user_email === user?.email);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-slate-900 dark:to-slate-800 pb-24">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <Trophy className="w-12 h-12 text-amber-500 mx-auto mb-3" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Heritage Explorer Leaderboard</h1>
          <p className="text-gray-600 dark:text-slate-400">Compete for the top spot by exploring sites and collecting badges.</p>
        </motion.div>

        {/* User Stats Card */}
        {userProfile && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <Card className="border-2 border-indigo-200 dark:border-indigo-900 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-slate-800 dark:to-slate-800">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-5xl font-bold text-amber-500 mb-2">#{userRank}</div>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{userProfile.display_name || user.full_name}</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-slate-700 rounded-lg p-3">
                      <Zap className="w-5 h-5 text-amber-500 mx-auto mb-1" />
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">{userProfile.total_points || 0}</div>
                      <div className="text-xs text-gray-500 dark:text-slate-400">Points</div>
                    </div>
                    <div className="bg-white dark:bg-slate-700 rounded-lg p-3">
                      <Target className="w-5 h-5 text-indigo-500 mx-auto mb-1" />
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">{userProfile.hunts_completed || 0}</div>
                      <div className="text-xs text-gray-500 dark:text-slate-400">Hunts Done</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Tabs */}
        <Tabs defaultValue="rankings" className="mb-8">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="rankings">Rankings</TabsTrigger>
            <TabsTrigger value="badges">My Badges</TabsTrigger>
          </TabsList>

          <TabsContent value="rankings" className="space-y-3">
            {sorted.length === 0 ? (
              <Card className="text-center py-12">
                <p className="text-gray-500 dark:text-slate-400">No explorers yet. Be the first!</p>
              </Card>
            ) : (
              sorted.map((profile, idx) => {
                const isCurrentUser = profile.user_email === user?.email;
                const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '';
                return (
                  <motion.div
                    key={profile.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Card className={isCurrentUser ? 'border-2 border-indigo-400 dark:border-indigo-600' : ''}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                            {medal ? medal.charCodeAt(0) % 10 : idx + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 dark:text-white truncate">
                              {medal} {profile.display_name || 'Explorer'}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-slate-400 truncate">{profile.hunts_completed} hunts • {profile.total_points} points</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{profile.score || 0}</div>
                            <div className="text-xs text-gray-500 dark:text-slate-400">score</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })
            )}
          </TabsContent>

          <TabsContent value="badges" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Your Badges ({userBadges.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {userBadges.length === 0 ? (
                  <p className="text-gray-500 dark:text-slate-400 text-sm">Explore more to earn badges!</p>
                ) : (
                  <div className="grid grid-cols-4 gap-4">
                    {userBadges.map((userBadge, idx) => {
                      const badge = badges.find(b => b.id === userBadge.badge_id);
                      return (
                        <motion.div
                          key={userBadge.id}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: idx * 0.05 }}
                          className="flex flex-col items-center"
                        >
                          <div className="text-4xl mb-2">{badge?.icon_emoji || '🏆'}</div>
                          <p className="text-xs font-medium text-gray-900 dark:text-white text-center">{badge?.name}</p>
                          <p className="text-[10px] text-gray-500 dark:text-slate-400 text-center capitalize">{badge?.rarity}</p>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Available Badges</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {badges.map(badge => {
                  const earned = userBadges.some(ub => ub.badge_id === badge.id);
                  return (
                    <div key={badge.id} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                      <div className={`text-2xl ${earned ? '' : 'opacity-30'}`}>{badge.icon_emoji}</div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">{badge.name}</p>
                        <p className="text-xs text-gray-600 dark:text-slate-400">{badge.description}</p>
                      </div>
                      {earned && <Medal className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}