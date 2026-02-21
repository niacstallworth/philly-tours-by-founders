import React, { useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import TourCard from '../components/tours/TourCard';
import HuntCard from '../components/hunts/HuntCard';
import HeroSection from '../components/home/HeroSection';
import { Compass, Map, Trophy, MapPin, Facebook, Instagram, Twitter, Youtube, Mail, Globe, Search, Filter } from 'lucide-react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function Home() {
  const [activeTab, setActiveTab] = useState('tours');
  const [tourSearch, setTourSearch] = useState('');
  const [huntSearch, setHuntSearch] = useState('');
  const [huntDifficulty, setHuntDifficulty] = useState('all');
  const [tourCategory, setTourCategory] = useState('all');
  const contentRef = useRef(null);

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

  const handleExplore = (tab) => {
    setActiveTab(tab);
    setTimeout(() => {
      contentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <HeroSection settings={settings} onExplore={handleExplore} />

      {/* Social Links */}
      {settings && (
        <div className="flex justify-center gap-5 py-5 bg-gray-50 border-b border-gray-100">
          <a href="mailto:info@foundersthread.org" className="text-gray-500 hover:text-red-600 transition-colors">
            <Mail className="w-5 h-5" />
          </a>
          {settings.website_url && (
            <a href={settings.website_url} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-green-600 transition-colors">
              <Globe className="w-5 h-5" />
            </a>
          )}
          {settings.facebook_url && (
            <a href={settings.facebook_url} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-blue-600 transition-colors">
              <Facebook className="w-5 h-5" />
            </a>
          )}
          {settings.instagram_url && (
            <a href={settings.instagram_url} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-pink-600 transition-colors">
              <Instagram className="w-5 h-5" />
            </a>
          )}
          {settings.twitter_url && (
            <a href={settings.twitter_url} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-blue-400 transition-colors">
              <Twitter className="w-5 h-5" />
            </a>
          )}
          {settings.youtube_url && (
            <a href={settings.youtube_url} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-red-600 transition-colors">
              <Youtube className="w-5 h-5" />
            </a>
          )}
          {settings.tiktok_url && (
            <a href={settings.tiktok_url} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-black transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1.04-.1z"/>
              </svg>
            </a>
          )}
        </div>
      )}

      {/* Content */}
      <div ref={contentRef} className="max-w-7xl mx-auto px-6 py-14">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-3 mb-10">
            <TabsTrigger value="tours" className="flex items-center gap-2">
              <Map className="w-4 h-4" />
              Tours
            </TabsTrigger>
            <TabsTrigger value="hunts" className="flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              Scavenger Hunts
            </TabsTrigger>
            <TabsTrigger value="map" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Tour Map
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tours">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 text-center">Available Tours</h2>
              <p className="text-gray-500 text-center mb-12 max-w-2xl mx-auto">
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
            ) : tours.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {tours.map((tour) => <TourCard key={tour.id} tour={tour} />)}
              </div>
            ) : (
              <div className="text-center py-24">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-indigo-50 flex items-center justify-center">
                  <Compass className="w-12 h-12 text-indigo-300" />
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No tours yet</h3>
                <p className="text-gray-400 max-w-sm mx-auto">Tours will appear here once they're added by the team. Check back soon!</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="hunts">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 text-center">GPS Scavenger Hunts</h2>
              <p className="text-gray-500 text-center mb-12 max-w-2xl mx-auto">
                Explore Philadelphia through GPS-verified scavenger hunts — track your progress and discover hidden gems!
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
            ) : hunts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {hunts.map((hunt) => <HuntCard key={hunt.id} hunt={hunt} />)}
              </div>
            ) : (
              <div className="text-center py-24">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-amber-50 flex items-center justify-center">
                  <Trophy className="w-12 h-12 text-amber-300" />
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No hunts yet</h3>
                <p className="text-gray-400 max-w-sm mx-auto">Scavenger hunts will appear here once they're published. Stay tuned!</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="map">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 text-center">Interactive Tour Map</h2>
              <p className="text-gray-500 text-center mb-8 max-w-2xl mx-auto">
                Explore all tour locations on our interactive map
              </p>
            </motion.div>

            <div className="w-full rounded-2xl overflow-hidden shadow-xl border border-gray-200">
              <iframe
                src="https://www.google.com/maps/d/embed?mid=1ea-gv-cbR6gROsZXeYitu86fokfFGsw&ehbc=2E312F"
                width="100%"
                height="600"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}