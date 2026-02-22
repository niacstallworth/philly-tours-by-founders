import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, BellOff, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function PushNotificationPrompt() {
  const [show, setShow] = useState(false);
  const [permission, setPermission] = useState('default');

  useEffect(() => {
    if (!('Notification' in window)) return;
    const perm = Notification.permission;
    setPermission(perm);
    // Show prompt if not yet decided and user hasn't dismissed it
    if (perm === 'default' && !sessionStorage.getItem('push_prompt_dismissed')) {
      // Small delay so it doesn't flash on load
      const t = setTimeout(() => setShow(true), 3000);
      return () => clearTimeout(t);
    }
  }, []);

  const handleAllow = async () => {
    const perm = await Notification.requestPermission();
    setPermission(perm);
    setShow(false);
    if (perm === 'granted') {
      toast.success('Notifications enabled! We\'ll alert you when new hunts drop.');
      // Show a welcome notification immediately
      new Notification('Founders Threads', {
        body: 'You\'ll now get notified when new hunts & heritage sites are added!',
        icon: '/favicon.ico',
      });
    }
  };

  const handleDismiss = () => {
    sessionStorage.setItem('push_prompt_dismissed', '1');
    setShow(false);
  };

  if (!('Notification' in window) || permission !== 'default') return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 80 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 80 }}
          transition={{ type: 'spring', damping: 22 }}
          className="fixed bottom-20 left-4 right-4 z-40 max-w-sm mx-auto"
        >
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
              <Bell className="w-5 h-5 text-indigo-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900">Stay in the loop</p>
              <p className="text-xs text-gray-500">Get notified when new hunts & AR sites drop</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button size="sm" onClick={handleAllow} className="bg-indigo-600 hover:bg-indigo-700 text-xs h-8 px-3">
                Allow
              </Button>
              <button onClick={handleDismiss} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}