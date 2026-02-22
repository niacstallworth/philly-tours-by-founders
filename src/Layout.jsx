import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Toaster } from '@/components/ui/sonner';
import { AnimatePresence, motion } from 'framer-motion';
import AppHeader from './components/layout/AppHeader';
import BottomTabBar from './components/layout/BottomTabBar';
import AdminDrawer from './components/layout/AdminDrawer';

// Pages that show the bottom tab bar
const TAB_PAGES = ['Home', 'ARExperience', 'Merchandise', 'UserSettings'];
// Pages that are detail/deep pages (show Back button)
const DETAIL_PAGES = ['HuntDetail', 'TourDetail'];
// Pages that hide the bottom tab bar (admin)
const ADMIN_PAGES = ['AdminTours', 'AdminHunts', 'AdminImport', 'AdminImportGPS', 'AdminMerchandise', 'AdminSettings'];

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 },
};

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [themeColors, setThemeColors] = useState(null);
  const location = useLocation();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
    base44.entities.HomePageSettings.list().then(list => {
      if (list[0]) {
        setThemeColors({
          primary: list[0].primary_color || '#4f46e5',
          primaryHover: list[0].primary_hover || '#4338ca',
          secondary: list[0].secondary_color || '#7c3aed',
          accent: list[0].accent_color || '#6366f1',
        });
      }
    });
  }, []);

  const isAdmin = user?.role === 'admin';
  const showBottomBar = TAB_PAGES.includes(currentPageName) || DETAIL_PAGES.includes(currentPageName);
  const showAdminHamburger = isAdmin && !ADMIN_PAGES.includes(currentPageName);
  const primary = themeColors?.primary || '#4f46e5';

  return (
    <div
      className="min-h-screen flex flex-col bg-gray-50"
      style={{ overscrollBehavior: 'none', WebkitOverflowScrolling: 'touch' }}
    >
      {/* Global CSS injections */}
      <style>{`
        * { -webkit-tap-highlight-color: transparent; }
        body { overscroll-behavior: none; }
        nav button, nav a { user-select: none; -webkit-user-select: none; }

        :root {
          --theme-primary: ${primary};
          --theme-primary-hover: ${themeColors?.primaryHover || '#4338ca'};
          --theme-secondary: ${themeColors?.secondary || '#7c3aed'};
          --theme-accent: ${themeColors?.accent || '#6366f1'};
        }
        .bg-theme-primary { background-color: var(--theme-primary) !important; }
        .text-theme-primary { color: var(--theme-primary) !important; }
        .text-theme-secondary { color: var(--theme-secondary) !important; }
        .text-theme-accent { color: var(--theme-accent) !important; }
        .border-theme-primary { border-color: var(--theme-primary) !important; }
      `}</style>

      {/* Top Header */}
      <AppHeader
        currentPageName={currentPageName}
        themeColors={themeColors}
        menuOpen={menuOpen}
        onMenuToggle={() => setMenuOpen(v => !v)}
      />

      {/* Admin slide-in drawer (hamburger) */}
      {isAdmin && (
        <AdminDrawer
          open={menuOpen}
          onClose={() => setMenuOpen(false)}
          themeColors={themeColors}
          currentPageName={currentPageName}
          onLogout={() => base44.auth.logout()}
        />
      )}

      {/* Desktop top nav for admin pages */}
      {ADMIN_PAGES.includes(currentPageName) && (
        <div
          className="hidden md:flex sticky top-0 z-40 items-center gap-1 px-4 py-2 text-white text-sm"
          style={{ backgroundColor: primary, marginTop: 0 }}
        >
          {/* admin breadcrumb hint */}
          <span className="opacity-70">Admin</span>
          <span className="opacity-40 mx-1">/</span>
          <span className="font-semibold">{currentPageName.replace('Admin', '')}</span>
        </div>
      )}

      {/* Page Content with safe-area + header offset */}
      <main
        className="flex-1 overflow-y-auto"
        style={{
          paddingTop: 'calc(56px + env(safe-area-inset-top))',
          paddingBottom: showBottomBar ? 'calc(64px + env(safe-area-inset-bottom))' : 'env(safe-area-inset-bottom)',
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPageName}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Tab Bar — mobile only, shown on main + detail pages */}
      {showBottomBar && (
        <BottomTabBar currentPageName={currentPageName} themeColors={themeColors} />
      )}

      <Toaster position="top-center" richColors />
    </div>
  );
}