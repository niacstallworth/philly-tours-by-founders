import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ChevronLeft } from 'lucide-react';

const DETAIL_PAGES = ['HuntDetail', 'TourDetail'];

export default function AppHeader({ currentPageName, themeColors, menuOpen, onMenuToggle, title }) {
  const navigate = useNavigate();
  const isDetailPage = DETAIL_PAGES.includes(currentPageName);
  // Use transparent until theme loads to avoid purple flash
  const primary = themeColors ? (themeColors.primary || '#4f46e5') : 'transparent';

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 flex items-center h-14 px-4 gap-3"
      style={{
        backgroundColor: primary,
        transition: themeColors ? 'none' : undefined,
        paddingTop: 'env(safe-area-inset-top)',
        WebkitUserSelect: 'none',
        userSelect: 'none',
        boxShadow: '0 1px 0 rgba(0,0,0,0.15)',
      }}
    >
      {isDetailPage ? (
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-white/90 hover:text-white transition-colors -ml-1 py-1 pr-2"
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="text-sm font-medium">Back</span>
        </button>
      ) : (
        <div className="w-16" /> /* spacer on mobile for centering */
      )}

      <Link
        to={createPageUrl('Home')}
        className="flex-1 text-center font-bold text-white text-base truncate"
        style={{ WebkitTapHighlightColor: 'transparent' }}
      >
        {title || 'Founders Threads'}
      </Link>

      <div className="w-16" />
    </header>
  );
}