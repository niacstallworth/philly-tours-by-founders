import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, Share2, Twitter, Copy, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function BadgeEarnedModal({ badge, user, isOpen, onClose }) {
  const [sharing, setSharing] = useState(false);

  if (!isOpen || !badge) return null;

  const shareUrl = `${window.location.origin}?shared_badge=${badge.id}&user=${user?.email}`;
  const rarityColors = {
    common: 'from-gray-400 to-gray-600',
    rare: 'from-blue-400 to-blue-600',
    epic: 'from-purple-400 to-purple-600',
    legendary: 'from-amber-400 to-amber-600',
  };

  const handleShare = async (platform) => {
    setSharing(true);
    const text = `🏆 I just earned the "${badge.name}" badge! ${badge.description} #HeritageAdventure`;

    try {
      if (platform === 'twitter') {
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`,
          '_blank',
          'width=550,height=420'
        );
      } else if (platform === 'facebook') {
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
          '_blank',
          'width=550,height=420'
        );
      } else if (platform === 'whatsapp') {
        window.open(
          `https://wa.me/?text=${encodeURIComponent(text + ' ' + shareUrl)}`,
          '_blank'
        );
      } else if (platform === 'copy') {
        await navigator.clipboard.writeText(`${text}\n${shareUrl}`);
        toast.success('Badge link copied to clipboard!');
      }
    } catch (error) {
      toast.error('Failed to share');
    } finally {
      setSharing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 hover:bg-gray-100 rounded-full transition"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        {/* Background gradient */}
        <div className={`h-32 bg-gradient-to-br ${rarityColors[badge.rarity] || rarityColors.common}`} />

        {/* Badge display */}
        <div className="px-6 pb-6">
          <div className="flex flex-col items-center -mt-16 mb-6">
            <div className={`w-32 h-32 rounded-full bg-gradient-to-br ${rarityColors[badge.rarity] || rarityColors.common} flex items-center justify-center shadow-lg border-4 border-white text-6xl`}>
              {badge.icon_emoji}
            </div>
          </div>

          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{badge.name}</h2>
            <p className="text-sm text-gray-600 mb-3">{badge.description}</p>
            <div className="inline-block px-3 py-1 bg-gray-100 rounded-full text-xs font-semibold text-gray-700 capitalize">
              {badge.rarity} Badge
            </div>
          </div>

          {/* Share buttons */}
          <div className="space-y-3 mb-4">
            <p className="text-xs font-semibold text-gray-600 text-center uppercase tracking-wide">Share Your Achievement</p>
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={() => handleShare('twitter')}
                disabled={sharing}
                className="gap-2 bg-blue-500 hover:bg-blue-600 text-white"
                size="sm"
              >
                {sharing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Twitter className="w-4 h-4" />}
                Tweet
              </Button>
              <Button
                onClick={() => handleShare('facebook')}
                disabled={sharing}
                className="gap-2 bg-blue-700 hover:bg-blue-800 text-white"
                size="sm"
              >
                {sharing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />}
                Share
              </Button>
              <Button
                onClick={() => handleShare('whatsapp')}
                disabled={sharing}
                className="gap-2 bg-green-500 hover:bg-green-600 text-white"
                size="sm"
              >
                {sharing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />}
                WhatsApp
              </Button>
              <Button
                onClick={() => handleShare('copy')}
                disabled={sharing}
                variant="outline"
                className="gap-2"
                size="sm"
              >
                {sharing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Copy className="w-4 h-4" />}
                Copy Link
              </Button>
            </div>
          </div>

          <Button
            onClick={onClose}
            className="w-full bg-gray-900 hover:bg-gray-800 text-white"
          >
            Continue
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}