import React, { useRef, useState, useCallback } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { RefreshCw } from 'lucide-react';

const THRESHOLD = 72;

export default function PullToRefresh({ onRefresh, children }) {
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(null);
  const pullY = useMotionValue(0);
  const iconOpacity = useTransform(pullY, [0, THRESHOLD * 0.5, THRESHOLD], [0, 0.5, 1]);
  const iconRotate = useTransform(pullY, [0, THRESHOLD], [0, 180]);
  const contentY = useTransform(pullY, [0, THRESHOLD], [0, THRESHOLD]);

  const handleTouchStart = useCallback((e) => {
    const el = e.currentTarget;
    if (el.scrollTop === 0) {
      startY.current = e.touches[0].clientY;
    }
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (startY.current === null || refreshing) return;
    const delta = e.touches[0].clientY - startY.current;
    if (delta > 0) {
      const resistance = Math.min(delta * 0.45, THRESHOLD + 20);
      pullY.set(resistance);
    }
  }, [refreshing, pullY]);

  const handleTouchEnd = useCallback(async () => {
    if (startY.current === null) return;
    startY.current = null;
    if (pullY.get() >= THRESHOLD && !refreshing) {
      setRefreshing(true);
      pullY.set(THRESHOLD * 0.6);
      await onRefresh();
      setRefreshing(false);
    }
    pullY.set(0);
  }, [refreshing, pullY, onRefresh]);

  return (
    <div
      className="relative overflow-hidden h-full"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull indicator */}
      <motion.div
        className="absolute top-0 left-0 right-0 flex items-center justify-center z-10 pointer-events-none"
        style={{ height: THRESHOLD, y: useTransform(pullY, v => v - THRESHOLD), opacity: iconOpacity }}
      >
        <motion.div style={{ rotate: iconRotate }}>
          <RefreshCw className={`w-5 h-5 text-indigo-500 ${refreshing ? 'animate-spin' : ''}`} />
        </motion.div>
      </motion.div>

      {/* Content shifts down when pulling */}
      <motion.div style={{ y: contentY }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}>
        {children}
      </motion.div>
    </div>
  );
}