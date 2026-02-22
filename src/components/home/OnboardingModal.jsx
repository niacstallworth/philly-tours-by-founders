import React from 'react';
import { motion } from 'framer-motion';
import { Map, Trophy, ShoppingBag, MapPin, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const features = [
  { icon: <Map className="w-5 h-5 text-indigo-500" />, bg: 'bg-indigo-50', title: 'Guided Tours', desc: 'Walk through Philadelphia\'s rich history.' },
  { icon: <Trophy className="w-5 h-5 text-amber-500" />, bg: 'bg-amber-50', title: 'GPS Scavenger Hunts', desc: 'Check in at real locations and unlock clues.' },
  { icon: <ShoppingBag className="w-5 h-5 text-purple-500" />, bg: 'bg-purple-50', title: 'Merchandise', desc: 'Support Founders Threads with our apparel.' },
  { icon: <MapPin className="w-5 h-5 text-rose-500" />, bg: 'bg-rose-50', title: 'Interactive Map', desc: 'See all stops and plan your adventure.' },
];

export default function OnboardingModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <motion.div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={onClose}
      />
      <motion.div
        className="relative w-full sm:max-w-sm mx-auto bg-white dark:bg-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl px-6 pt-7 pb-7 z-10 max-h-[90dvh] overflow-y-auto"
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', damping: 22, stiffness: 280 }}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors">
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Welcome to Founders Threads</h2>
        <p className="text-sm text-gray-500 dark:text-slate-400 mb-5">Explore Philadelphia's heritage through:</p>

        <div className="grid grid-cols-2 gap-3 mb-6">
          {features.map((f) => (
            <div key={f.title} className={`${f.bg} rounded-2xl p-3.5 flex flex-col gap-2`}>
              <div className="w-8 h-8 rounded-xl bg-white/70 flex items-center justify-center">
                {f.icon}
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-800">{f.title}</div>
                <div className="text-xs text-gray-500 leading-snug mt-0.5">{f.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <Button onClick={onClose} className="w-full h-11 rounded-2xl text-base font-semibold bg-indigo-600 hover:bg-indigo-700">
          Get Started
        </Button>
      </motion.div>
    </div>
  );
}