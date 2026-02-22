import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Map, Trophy, ShoppingBag, MapPin, ChevronRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const steps = [
  {
    icon: <Map className="w-10 h-10 text-indigo-400" />,
    bg: 'bg-indigo-50',
    title: 'Explore Tours',
    description: 'Walk through Philadelphia\'s rich history with guided tours that bring forgotten stories to life.',
  },
  {
    icon: <Trophy className="w-10 h-10 text-amber-400" />,
    bg: 'bg-amber-50',
    title: 'GPS Scavenger Hunts',
    description: 'Visit real locations across the city, check in via GPS, and unlock clues as you go.',
  },
  {
    icon: <ShoppingBag className="w-10 h-10 text-purple-400" />,
    bg: 'bg-purple-50',
    title: 'Shop Merchandise',
    description: 'Support Founders Threads with apparel and accessories that celebrate Philadelphia heritage.',
  },
  {
    icon: <MapPin className="w-10 h-10 text-rose-400" />,
    bg: 'bg-rose-50',
    title: 'Interactive Map',
    description: 'See all tour stops and hunt locations plotted on a live map — plan your adventure before you go.',
  },
];

export default function OnboardingModal({ onClose }) {
  const [step, setStep] = useState(0);
  const isLast = step === steps.length - 1;

  const handleNext = () => {
    if (isLast) {
      onClose();
    } else {
      setStep(s => s + 1);
    }
  };

  const current = steps[step];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={onClose}
      />

      {/* Sheet */}
      <motion.div
        className="relative w-full sm:max-w-sm mx-auto bg-white dark:bg-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl px-8 pt-8 pb-10 z-10"
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', damping: 22, stiffness: 280 }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Step indicator */}
        <div className="flex gap-1.5 justify-center mb-7">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === step ? 'w-6 bg-indigo-500' : 'w-1.5 bg-gray-200 dark:bg-slate-600'
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col items-center text-center"
          >
            <div className={`w-20 h-20 rounded-2xl ${current.bg} flex items-center justify-center mb-6`}>
              {current.icon}
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{current.title}</h2>
            <p className="text-gray-500 dark:text-slate-400 leading-relaxed mb-8">{current.description}</p>
          </motion.div>
        </AnimatePresence>

        <Button
          onClick={handleNext}
          className="w-full h-12 rounded-2xl text-base font-semibold bg-indigo-600 hover:bg-indigo-700"
        >
          {isLast ? 'Get Started' : (
            <span className="flex items-center gap-2">Next <ChevronRight className="w-4 h-4" /></span>
          )}
        </Button>

        {!isLast && (
          <button
            onClick={onClose}
            className="w-full mt-3 text-sm text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 transition-colors"
          >
            Skip
          </button>
        )}
      </motion.div>
    </div>
  );
}