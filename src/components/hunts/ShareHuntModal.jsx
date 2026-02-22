import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Share2, Copy, Check, Twitter, Facebook, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function ShareHuntModal({ hunt, onClose }) {
  const [copied, setCopied] = useState(false);

  const shareText = `🏆 I just completed "${hunt.title}" on the Founders Threads app! Explore Philadelphia's hidden history. #FoundersThreads #Philadelphia #History`;
  const shareUrl = window.location.href;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: `I completed ${hunt.title}!`, text: shareText, url: shareUrl });
    }
  };

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;
  const smsUrl = `sms:?body=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4">
      <motion.div className="absolute inset-0 bg-black/50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose} />
      <motion.div
        className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6 z-10"
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: 'spring', damping: 22 }}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-5">
          <div className="text-4xl mb-2">🏆</div>
          <h2 className="text-xl font-bold text-gray-900">Share Your Achievement!</h2>
          <p className="text-sm text-gray-500 mt-1">You completed <strong>{hunt.title}</strong></p>
        </div>

        {/* Preview */}
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 rounded-xl p-4 mb-5">
          <p className="text-sm text-gray-700 leading-relaxed">{shareText}</p>
        </div>

        {/* Share buttons */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <a href={twitterUrl} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" className="w-full gap-2 text-sky-600 border-sky-200 hover:bg-sky-50">
              <Twitter className="w-4 h-4" /> Twitter / X
            </Button>
          </a>
          <a href={facebookUrl} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" className="w-full gap-2 text-blue-700 border-blue-200 hover:bg-blue-50">
              <Facebook className="w-4 h-4" /> Facebook
            </Button>
          </a>
          <a href={smsUrl}>
            <Button variant="outline" className="w-full gap-2 text-green-600 border-green-200 hover:bg-green-50">
              <MessageCircle className="w-4 h-4" /> Text
            </Button>
          </a>
          <Button variant="outline" className="w-full gap-2" onClick={handleCopy}>
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy Link'}
          </Button>
        </div>

        {navigator.share && (
          <Button onClick={handleNativeShare} className="w-full bg-indigo-600 hover:bg-indigo-700 gap-2">
            <Share2 className="w-4 h-4" /> Share via Phone
          </Button>
        )}
      </motion.div>
    </div>
  );
}