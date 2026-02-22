import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge, Trophy, Zap } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import BadgeCard from './BadgeCard';

export default function BadgeShowcase({ userEmail, user }) {
  const [badges, setBadges] = useState([]);
  const [userBadges, setUserBadges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBadges();
  }, [userEmail]);

  const loadBadges = async () => {
    try {
      const allBadges = await base44.entities.Badge.list();
      setBadges(allBadges || []);

      if (userEmail) {
        const earned = await base44.entities.UserBadge.filter({
          user_email: userEmail
        });
        setUserBadges(earned || []);
      }
    } catch (error) {
      console.error('Failed to load badges:', error);
    } finally {
      setLoading(false);
    }
  };

  const earnedIds = new Set(userBadges.map(b => b.badge_id));

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const earnedCount = userBadges.length;
  const totalCount = badges.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-500" />
          Achievements
        </CardTitle>
        <p className="text-sm text-gray-600 mt-2">
          <Zap className="w-4 h-4 inline mr-1 text-amber-500" />
          {earnedCount} of {totalCount} badges earned
        </p>
      </CardHeader>
      <CardContent>
        {badges.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Badge className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No badges yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {badges.map((badge) => (
              <BadgeCard
                key={badge.id}
                badge={badge}
                user={user}
                earned={earnedIds.has(badge.id)}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}