import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/sonner';
import { 
  Home, 
  Map, 
  MapPin, 
  Settings, 
  Menu, 
  X, 
  Upload,
  Image,
  LogOut,
  ShoppingBag,
  Trophy,
  Wrench
} from 'lucide-react';

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [themeColors, setThemeColors] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
    
    base44.entities.HomePageSettings.list().then(list => {
      if (list[0]) {
        setThemeColors({
          primary: list[0].primary_color || '#4f46e5',
          primaryHover: list[0].primary_hover || '#4338ca',
          secondary: list[0].secondary_color || '#7c3aed',
          accent: list[0].accent_color || '#6366f1'
        });
      }
    });
  }, []);

  const isAdmin = user?.role === 'admin';

  const navItems = [
    { name: 'Home', icon: Home, page: 'Home' },
    { name: 'Merchandise', icon: ShoppingBag, page: 'Merchandise' },
  ];

  const adminItems = [
    { name: 'Manage Tours', icon: Image, page: 'AdminTours' },
    { name: 'Manage Hunts', icon: Trophy, page: 'AdminHunts' },
    { name: 'Import Tours', icon: Upload, page: 'AdminImport' },
    { name: 'Import GPS Tours', icon: MapPin, page: 'AdminImportGPS' },
    { name: 'Merchandise', icon: ShoppingBag, page: 'AdminMerchandise' },
    { name: 'Settings', icon: Settings, page: 'AdminSettings' },
  ];

  return (
    <div className="min-h-screen">
      {themeColors && (
        <style>{`
          :root {
            --theme-primary: ${themeColors.primary};
            --theme-primary-hover: ${themeColors.primaryHover};
            --theme-secondary: ${themeColors.secondary};
            --theme-accent: ${themeColors.accent};
          }
          .bg-theme-primary { background-color: var(--theme-primary) !important; }
          .bg-theme-primary-hover:hover { background-color: var(--theme-primary-hover) !important; }
          .text-theme-primary { color: var(--theme-primary) !important; }
          .text-theme-secondary { color: var(--theme-secondary) !important; }
          .text-theme-accent { color: var(--theme-accent) !important; }
          .border-theme-primary { border-color: var(--theme-primary) !important; }
          .text-theme-admin { color: var(--theme-accent) !important; }
        `}</style>
      )}
      {/* Top Navigation */}
      <nav className="bg-theme-primary text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to={createPageUrl('Home')} className="flex items-center gap-2">
              <span className="font-bold text-lg">Founders Threads</span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-6">
              {navItems.map((item) => (
                <Link
                  key={item.page}
                  to={createPageUrl(item.page)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                    currentPageName === item.page 
                      ? 'bg-white/20' 
                      : 'hover:bg-white/10'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </Link>
              ))}

              {isAdmin && (
                <>
                  <div className="w-px h-6 bg-white/30" />
                  {adminItems.map((item) => (
                    <Link
                      key={item.page}
                      to={createPageUrl(item.page)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                        currentPageName === item.page 
                          ? 'bg-white/20' 
                          : 'hover:bg-white/10'
                      }`}
                      style={{color: themeColors?.accent}}
                    >
                      <item.icon className="w-4 h-4" />
                      {item.name}
                    </Link>
                  ))}
                </>
              )}

              {user && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => base44.auth.logout()}
                  className="text-white hover:bg-white/10"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden bg-theme-primary border-t border-white/10" style={{backgroundColor: themeColors?.primary}}>
            <div className="px-4 py-4 space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.page}
                  to={createPageUrl(item.page)}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg ${
                    currentPageName === item.page 
                      ? 'bg-white/20' 
                      : 'hover:bg-white/10'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </Link>
              ))}

              {isAdmin && (
                <>
                  <div className="border-t border-white/20 my-2 pt-2">
                    <p className="px-4 text-xs uppercase font-medium mb-2" style={{color: themeColors?.accent}}>Admin</p>
                  </div>
                  {adminItems.map((item) => (
                    <Link
                      key={item.page}
                      to={createPageUrl(item.page)}
                      onClick={() => setMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg ${
                        currentPageName === item.page 
                          ? 'bg-white/20' 
                          : 'hover:bg-white/10'
                      }`}
                      style={{color: themeColors?.accent}}
                    >
                      <item.icon className="w-5 h-5" />
                      {item.name}
                    </Link>
                  ))}
                </>
              )}

              {user && (
                <button
                  onClick={() => base44.auth.logout()}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 w-full text-left"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Page Content */}
      <main>{children}</main>
      <Toaster position="top-center" richColors />
    </div>
  );
}