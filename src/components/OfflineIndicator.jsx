import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setSyncing(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="fixed top-16 left-0 right-0 z-40 flex justify-center px-4"
        >
          <div className="bg-slate-900 border border-slate-700 text-white px-4 py-2.5 rounded-full flex items-center gap-2 text-xs font-semibold shadow-lg">
            <WifiOff className="w-3.5 h-3.5 text-red-400" />
            {syncing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Syncing offline changes...
              </>
            ) : (
              'You are offline — data will sync when back online'
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}