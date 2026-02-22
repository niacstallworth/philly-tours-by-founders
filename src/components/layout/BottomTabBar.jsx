import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Home, Glasses, ShoppingBag, Settings, QrCode } from 'lucide-react';

const tabs = [
  { name: 'Home', icon: Home, page: 'Home', label: 'Home' },
  { name: 'AR', icon: Glasses, page: 'ARExperience', label: 'AR' },
  { name: 'Scan', icon: QrCode, page: 'TagScanner', label: 'Scan' },
  { name: 'Shop', icon: ShoppingBag, page: 'Merchandise', label: 'Shop' },
  { name: 'Settings', icon: Settings, page: 'UserSettings', label: 'Settings' },
];

export default function BottomTabBar({ currentPageName, themeColors }) {
  // Wait for theme to load before applying color to avoid flash
  const primary = themeColors ? (themeColors.primary || '#4f46e5') : '#9ca3af';

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom)',
        WebkitUserSelect: 'none',
        userSelect: 'none',
      }}
    >
      <div className="flex items-stretch">
        {tabs.map((tab) => {
          const isActive = currentPageName === tab.page;
          return (
            <Link
              key={tab.page}
              to={createPageUrl(tab.page)}
              className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5 relative"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              {isActive && (
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-8 rounded-full"
                  style={{ backgroundColor: primary }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <tab.icon
                className="w-5 h-5"
                style={{ color: isActive ? primary : '#9ca3af' }}
              />
              <span
                className="text-[10px] font-medium"
                style={{ color: isActive ? primary : '#9ca3af' }}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}