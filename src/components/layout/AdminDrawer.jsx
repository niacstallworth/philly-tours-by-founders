import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Image, Trophy, Upload, MapPin, ShoppingBag, Wrench, LogOut, X, Glasses, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const adminItems = [
  { name: 'Manage Tours', icon: Image, page: 'AdminTours' },
  { name: 'Manage Hunts', icon: Trophy, page: 'AdminHunts' },
  { name: 'Import Tours', icon: Upload, page: 'AdminImport' },
  { name: 'Import GPS Tours', icon: MapPin, page: 'AdminImportGPS' },
  { name: 'Heritage Sites (AR)', icon: Glasses, page: 'AdminHeritageSites' },
  { name: 'Merchandise', icon: ShoppingBag, page: 'AdminMerchandise' },
  { name: 'Site Settings', icon: Wrench, page: 'AdminSettings' },
];

export default function AdminDrawer({ open, onClose, themeColors, currentPageName, onLogout }) {
  const primary = themeColors?.primary || '#4f46e5';

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 350, damping: 35 }}
            className="fixed top-0 right-0 bottom-0 w-72 bg-white z-50 shadow-2xl flex flex-col"
            style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b" style={{ backgroundColor: primary }}>
              <span className="text-white font-bold text-lg">Admin Menu</span>
              <button onClick={onClose} className="text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto py-3">
              {adminItems.map((item) => (
                <Link
                  key={item.page}
                  to={createPageUrl(item.page)}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-5 py-3.5 text-sm font-medium transition-colors ${
                    currentPageName === item.page ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <item.icon className="w-5 h-5 opacity-70" />
                  {item.name}
                </Link>
              ))}
            </div>
            <div className="border-t px-5 py-4">
              <button
                onClick={onLogout}
                className="flex items-center gap-3 text-sm font-medium text-red-600 hover:text-red-700 w-full"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}