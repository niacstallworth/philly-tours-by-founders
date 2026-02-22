import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Share2, Lock } from 'lucide-react';
import BadgeEarnedModal from './BadgeEarnedModal';

export default function BadgeCard({ badge, user, earned = false }) {
  const [showShare, setShowShare] = useState(false);

  const rarityColors = {
    common: 'from-gray-400 to-gray-600',
    rare: 'from-blue-400 to-blue-600',
    epic: 'from-purple-400 to-purple-600',
    legendary: 'from-amber-400 to-amber-600',
  };

  const borderColors = {
    common: 'border-gray-400',
    rare: 'border-blue-400',
    epic: 'border-purple-400',
    legendary: 'border-amber-400',
  };

  return (
    <>
      <div
        className={`relative p-4 rounded-xl border-2 transition-all ${
          earned
            ? `bg-gradient-to-br ${rarityColors[badge.rarity] || rarityColors.common} ${borderColors[badge.rarity] || borderColors.common}`
            : 'bg-gray-100 border-gray-300 opacity-50'
        }`}
      >
        <div className="text-center">
          <div className="text-5xl mb-3">{badge.icon_emoji}</div>
          <h3 className={`font-bold text-sm mb-1 ${earned ? 'text-white' : 'text-gray-700'}`}>
            {badge.name}
          </h3>
          <p className={`text-xs mb-3 ${earned ? 'text-white/90' : 'text-gray-600'}`}>
            {badge.description}
          </p>
          {earned && (
            <Button
              onClick={() => setShowShare(true)}
              size="sm"
              variant={earned ? 'secondary' : 'outline'}
              className="gap-1 text-xs"
            >
              <Share2 className="w-3 h-3" />
              Share
            </Button>
          )}
          {!earned && (
            <div className="flex items-center justify-center gap-1 text-xs text-gray-600">
              <Lock className="w-3 h-3" />
              Locked
            </div>
          )}
        </div>
      </div>
      <BadgeEarnedModal badge={badge} user={user} isOpen={showShare} onClose={() => setShowShare(false)} />
    </>
  );
}