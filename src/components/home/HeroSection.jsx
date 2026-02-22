import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Map, Trophy, ArrowDown, MapPin } from 'lucide-react';

export default function HeroSection({ settings, onExplore }) {
  const title = settings?.hero_title || 'Founders Threads';
  const subtitle = settings?.hero_subtitle || "Discover Philadelphia's untold stories through immersive tours and GPS scavenger hunts";
  const bgImage = settings?.hero_image_url || 'https://images.unsplash.com/photo-1569761316261-9a8696fa2ca3?w=1600&q=80';
  const videoUrl = settings?.hero_video_url;
  const opacity = (settings?.video_opacity ?? 20) / 100;
  // Wait for settings to load before using primary color to avoid flash
  const primaryColor = settings ? (settings.primary_color || '#4f46e5') : null;

  return (
    <div className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
      {/* Background video */}
      {videoUrl && (
        <video
          autoPlay muted loop playsInline
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity }}
        >
          <source src={videoUrl} />
        </video>
      )}

      {/* Background image */}
      {bgImage && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${bgImage})`, opacity: videoUrl ? 0.3 : 0.6 }}
        />
      )}

      {/* Gradient overlay — only render once we have the real color */}
      {primaryColor && (
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, ${primaryColor}ee 0%, #1e1b4b 100%)`
          }}
        />
      )}
      {/* Dark fallback overlay while loading */}
      {!primaryColor && (
        <div className="absolute inset-0 bg-slate-900/80" />
      )}

      {/* Content */}
      <div className="relative z-10 text-center text-white px-6 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <img 
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69227c15039c9c847b675240/08e68c1d2_304bfa31-6011-4657-bfd8-42771fa596c0.png"
            alt={title}
            className="max-w-xs md:max-w-2xl mx-auto mb-6 h-auto"
          />

          <p className="text-xl md:text-2xl text-white/80 mb-10 max-w-2xl mx-auto leading-relaxed">
            {subtitle}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => onExplore('tours')}
              className="bg-white text-indigo-900 hover:bg-white/90 font-semibold px-8 py-6 text-base rounded-full shadow-xl"
            >
              <Map className="w-5 h-5 mr-2" />
              Explore Tours
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => onExplore('hunts')}
              className="border-2 border-white text-white hover:bg-white/20 font-semibold px-8 py-6 text-base rounded-full backdrop-blur-sm bg-white/10"
            >
              <Trophy className="w-5 h-5 mr-2" />
              Start a Hunt
            </Button>
          </div>
        </motion.div>

        <motion.div
          className="mt-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          <ArrowDown className="w-6 h-6 mx-auto text-white/50 animate-bounce" />
        </motion.div>
      </div>
    </div>
  );
}