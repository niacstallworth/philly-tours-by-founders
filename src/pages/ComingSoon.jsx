import React from 'react';
import { motion } from 'framer-motion';
import { Map, Trophy, ShoppingBag, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

const features = [
  { icon: <Map className="w-5 h-5 text-indigo-500" />, bg: 'bg-indigo-50', title: 'Guided Tours', desc: "Walk through Philadelphia's rich history." },
  { icon: <Trophy className="w-5 h-5 text-amber-500" />, bg: 'bg-amber-50', title: 'GPS Scavenger Hunts', desc: 'Check in at real locations and unlock clues.' },
  { icon: <ShoppingBag className="w-5 h-5 text-purple-500" />, bg: 'bg-purple-50', title: 'Merchandise', desc: 'Support Founders Threads with our apparel.' },
  { icon: <MapPin className="w-5 h-5 text-rose-500" />, bg: 'bg-rose-50', title: 'Interactive Map', desc: 'See all stops and plan your adventure.' },
];

export default function ComingSoon() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-gradient-to-br from-indigo-950 via-indigo-900 to-purple-900">
      <motion.div
        className="relative w-full max-w-sm mx-auto bg-white dark:bg-slate-800 rounded-3xl shadow-2xl px-6 pt-7 pb-8"
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', damping: 22, stiffness: 280 }}
      >
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Welcome to Founders Threads</h2>
        <p className="text-sm text-gray-500 dark:text-slate-400 mb-5">Explore Philadelphia's heritage through:</p>

        <div className="flex flex-col gap-2 mb-5">
          {features.map((f) => (
            <div key={f.title} className={`${f.bg} rounded-xl px-3 py-2.5 flex items-center gap-3`}>
              <div className="w-8 h-8 rounded-lg bg-white/70 flex items-center justify-center shrink-0">
                {f.icon}
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-800">{f.title}</div>
                <div className="text-xs text-gray-500 leading-snug">{f.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <a href="https://www.philly-tours.com/" target="_blank" rel="noopener noreferrer" className="block w-full">
          <Button className="w-full h-11 rounded-2xl text-base font-semibold bg-indigo-600 hover:bg-indigo-700">
            Get Started
          </Button>
        </a>
      </motion.div>
    </div>
  );
}