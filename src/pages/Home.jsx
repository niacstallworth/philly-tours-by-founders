import React, { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import TourCard from '../components/tours/TourCard';
import HuntCard from '../components/hunts/HuntCard';
import { Compass, Sparkles, Map, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Home() {
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef(null);
  const [activeTab, setActiveTab] = useState('tours');
  
  const { data: tours, isLoading: toursLoading } = useQuery({
    queryKey: ['tours'],
    queryFn: () => base44.entities.Tour.list(),
    initialData: []
  });

  const { data: hunts, isLoading: huntsLoading } = useQuery({
    queryKey: ['hunts'],
    queryFn: () => base44.entities.ScavengerHunt.list(),
    initialData: []
  });

  const { data: settings } = useQuery({
    queryKey: ['homepage-settings'],
    queryFn: async () => {
      const list = await base44.entities.HomePageSettings.list();
      return list[0] || null;
    }
  });

  useEffect(() => {
    if (videoRef.current && settings?.hero_video_url) {
      const playVideo = async () => {
        try {
          videoRef.current.muted = true;
          await videoRef.current.load();
          await videoRef.current.play();
        } catch (error) {
          console.error('Video autoplay failed:', error);
          setVideoError(true);
        }
      };
      playVideo();
    }
  }, [settings?.hero_video_url]);



  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50/30 to-purple-50/30">
      {/* Hero Section */}
      <div 
        className="relative overflow-hidden text-white"
        style={{
          background: `linear-gradient(to bottom right, rgb(var(--tw-color-${settings?.gradient_from || 'indigo-900'})), rgb(var(--tw-color-${settings?.gradient_via || 'indigo-800'})), rgb(var(--tw-color-${settings?.gradient_to || 'purple-900'})))`
        }}
      >
        <style jsx>{`
          :root {
            --tw-color-indigo-900: 49 46 129;
            --tw-color-indigo-800: 55 48 163;
            --tw-color-purple-900: 88 28 135;
            --tw-color-blue-900: 30 58 138;
            --tw-color-slate-900: 15 23 42;
            --tw-color-emerald-900: 6 78 59;
          }
        `}</style>
        {settings?.hero_video_embed ? (
          <div 
            className="absolute inset-0 overflow-hidden pointer-events-none"
            style={{ opacity: (settings?.video_opacity || 20) / 100 }}
            dangerouslySetInnerHTML={{ __html: settings.hero_video_embed }}
          />
        ) : settings?.hero_video_url && !videoError ? (
          <div className="absolute inset-0 overflow-hidden">
            <video
              ref={videoRef}
              key={settings.hero_video_url}
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
              style={{ opacity: (settings?.video_opacity || 20) / 100 }}
              onError={() => setVideoError(true)}
            >
              <source src={settings.hero_video_url} type="video/mp4" />
            </video>
          </div>
        ) : settings?.hero_image_url ? (
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ 
              backgroundImage: `url(${settings.hero_image_url})`,
              opacity: (settings?.fallback_opacity || 10) / 100 
            }}
          />
        ) : (
          <div 
            className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1600')] bg-cover bg-center"
            style={{ opacity: (settings?.fallback_opacity || 10) / 100 }}
          />
        )}
        
        <div className="relative max-w-7xl mx-auto px-6 py-24 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="flex items-center justify-center gap-3 mb-6">
              <Compass className="w-12 h-12" />
              <Sparkles className="w-8 h-8" />
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
              {settings?.hero_title || 'Founders Threads'}
            </h1>
            
            <p className="text-xl md:text-2xl text-indigo-200 max-w-3xl mx-auto mb-8 leading-relaxed">
              {settings?.hero_subtitle || "Discover Philadelphia's rich tapestry of history, culture, and heritage through curated tours"}
            </p>
            
            <div className="flex flex-wrap gap-4 justify-center text-sm">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                <span>🏛️</span>
                <span>Historic Landmarks</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                <span>🎨</span>
                <span>Cultural Experiences</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                <span>📍</span>
                <span>Hidden Gems</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
            <TabsTrigger value="tours" className="flex items-center gap-2">
              <Map className="w-4 h-4" />
              Tours
            </TabsTrigger>
            <TabsTrigger value="hunts" className="flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              Scavenger Hunts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tours">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 text-center">
                Available Tours
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                Choose from our carefully crafted tours that bring Philadelphia's stories to life
              </p>
            </motion.div>

            {toursLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[1, 2].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-96 bg-gray-200 rounded-2xl" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {tours.map((tour) => (
                  <TourCard key={tour.id} tour={tour} />
                ))}
              </div>
            )}

            {!toursLoading && tours.length === 0 && (
              <div className="text-center py-20">
                <Compass className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 text-lg">No tours available yet</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="hunts">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 text-center">
                GPS Scavenger Hunts
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                Explore Philadelphia through GPS-verified scavenger hunts. Track your progress and discover hidden gems!
              </p>
            </motion.div>

            {huntsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[1, 2].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-96 bg-gray-200 rounded-2xl" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {hunts.map((hunt) => (
                  <HuntCard key={hunt.id} hunt={hunt} />
                ))}
              </div>
            )}

            {!huntsLoading && hunts.length === 0 && (
              <div className="text-center py-20">
                <Trophy className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 text-lg">No hunts available yet</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

    </div>
  );
}