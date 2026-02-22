import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Trophy, CheckCircle2, Clock, ChevronRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format } from 'date-fns';

export default function HuntHistory({ user }) {
  const { data: progressList = [] } = useQuery({
    queryKey: ['all-hunt-progress', user?.email],
    queryFn: () => base44.entities.HuntProgress.filter({ user_email: user.email }),
    enabled: !!user?.email,
  });

  const { data: hunts = [] } = useQuery({
    queryKey: ['hunts'],
    queryFn: () => base44.entities.ScavengerHunt.list(),
    enabled: progressList.length > 0,
  });

  if (!user) return null;

  const completed = progressList.filter(p => !!p.completed_at);
  const inProgress = progressList.filter(p => !p.completed_at);

  const getHunt = (huntId) => hunts.find(h => h.id === huntId);

  const BADGES = [
    { id: 'first', label: 'First Hunt', icon: '🏆', desc: 'Completed your first hunt', unlocked: completed.length >= 1 },
    { id: 'three', label: 'Explorer', icon: '🗺️', desc: 'Completed 3 hunts', unlocked: completed.length >= 3 },
    { id: 'five', label: 'Pathfinder', icon: '🧭', desc: 'Completed 5 hunts', unlocked: completed.length >= 5 },
    { id: 'started', label: 'Adventurer', icon: '🚀', desc: 'Started your first hunt', unlocked: progressList.length >= 1 },
  ];

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-2">
          <Trophy className="w-4 h-4" /> Hunt History & Badges
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {/* Badges */}
        <div className="grid grid-cols-4 gap-2">
          {BADGES.map(badge => (
            <div key={badge.id} className={`flex flex-col items-center gap-1 p-2 rounded-xl text-center transition-all ${badge.unlocked ? 'bg-amber-50' : 'bg-gray-50 opacity-40'}`}>
              <span className="text-2xl">{badge.icon}</span>
              <span className="text-xs font-medium text-gray-700 leading-tight">{badge.label}</span>
            </div>
          ))}
        </div>

        {/* Completed */}
        {completed.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Completed ({completed.length})</p>
            <div className="space-y-2">
              {completed.map(p => {
                const hunt = getHunt(p.hunt_id);
                return (
                  <Link
                    key={p.id}
                    to={`${createPageUrl('HuntDetail')}?id=${p.hunt_id}`}
                    className="flex items-center gap-3 p-3 rounded-lg bg-green-50 border border-green-100"
                  >
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{hunt?.title || 'Hunt'}</p>
                      {p.completed_at && (
                        <p className="text-xs text-gray-400">{format(new Date(p.completed_at), 'MMM d, yyyy')}</p>
                      )}
                    </div>
                    <Badge className="bg-green-100 text-green-700 text-xs flex-shrink-0">Done</Badge>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* In Progress */}
        {inProgress.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">In Progress ({inProgress.length})</p>
            <div className="space-y-2">
              {inProgress.map(p => {
                const hunt = getHunt(p.hunt_id);
                const total = hunt?.stops?.length || 0;
                const done = p.completed_stops?.length || 0;
                return (
                  <Link
                    key={p.id}
                    to={`${createPageUrl('HuntDetail')}?id=${p.hunt_id}`}
                    className="flex items-center gap-3 p-3 rounded-lg bg-indigo-50 border border-indigo-100"
                  >
                    <Clock className="w-5 h-5 text-indigo-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{hunt?.title || 'Hunt'}</p>
                      <p className="text-xs text-gray-400">{done}/{total} stops</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {progressList.length === 0 && (
          <div className="text-center py-4">
            <Trophy className="w-8 h-8 mx-auto text-gray-200 mb-2" />
            <p className="text-sm text-gray-400">No hunts started yet. Explore the hunts tab!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}