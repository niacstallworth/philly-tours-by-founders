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
  const primaryColor = settings?.primary_color || '#4f46e5';

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

      {/* Gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg, ${primaryColor}ee 0%, #1e1b4b 100%)`
        }}
      />

      {/* Content */}
      <div className="relative z-10 text-center text-white px-6 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 text-sm font-medium mb-6">
            <MapPin className="w-4 h-4" />
            Philadelphia, PA
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight tracking-tight">
            {title}
          </h1>

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
              className="border-white/40 text-white hover:bg-white/10 font-semibold px-8 py-6 text-base rounded-full backdrop-blur-sm"
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