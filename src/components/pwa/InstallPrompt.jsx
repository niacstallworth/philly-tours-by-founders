import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, Download } from 'lucide-react';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if already installed or dismissed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowPrompt(false);
      return;
    }

    const isDismissed = sessionStorage.getItem('pwa_install_dismissed');
    if (isDismissed) {
      setShowPrompt(false);
      return;
    }

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Show prompt after 3 seconds of interaction
      setTimeout(() => {
        if (!dismissed) setShowPrompt(true);
      }, 3000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [dismissed]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setShowPrompt(false);
      sessionStorage.setItem('pwa_install_dismissed', 'true');
    }

    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setDismissed(true);
    sessionStorage.setItem('pwa_install_dismissed', 'true');
  };

  return (
    <AnimatePresence>
      {showPrompt && deferredPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-24 left-4 right-4 z-40 max-w-sm mx-auto"
        >
          <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl shadow-xl p-4 text-white">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <Download className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Install App</h3>
                  <p className="text-xs text-white/80">Native-like experience</p>
                </div>
              </div>
              <button
                onClick={handleDismiss}
                className="p-1 hover:bg-white/20 rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleInstall}
                className="flex-1 bg-white text-indigo-600 hover:bg-white/90 text-xs h-8 font-semibold"
              >
                Install
              </Button>
              <Button
                onClick={handleDismiss}
                variant="ghost"
                className="flex-1 text-white hover:bg-white/20 text-xs h-8"
              >
                Not Now
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}