import React, { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import TourCard from '../components/tours/TourCard';
import HuntCard from '../components/hunts/HuntCard';
import { Compass, Sparkles, Map, Trophy, MapPin, Facebook, Instagram, Twitter, Youtube, Mail, Globe } from 'lucide-react';
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
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {settings && (
            <div className="flex justify-center gap-4 mb-8">
              <a href="mailto:info@foundersthread.org" className="text-gray-600 hover:text-red-600 transition-colors">
                <Mail className="w-6 h-6" />
              </a>
              {settings.website_url && (
                <a href={settings.website_url} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-green-600 transition-colors">
                  <Globe className="w-6 h-6" />
                </a>
              )}
              {settings.facebook_url && (
                <a href={settings.facebook_url} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-blue-600 transition-colors">
                  <Facebook className="w-6 h-6" />
                </a>
              )}
              {settings.instagram_url && (
                <a href={settings.instagram_url} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-pink-600 transition-colors">
                  <Instagram className="w-6 h-6" />
                </a>
              )}
              {settings.twitter_url && (
                <a href={settings.twitter_url} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-blue-400 transition-colors">
                  <Twitter className="w-6 h-6" />
                </a>
              )}
              {settings.youtube_url && (
                <a href={settings.youtube_url} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-red-600 transition-colors">
                  <Youtube className="w-6 h-6" />
                </a>
              )}
              {settings.tiktok_url && (
                <a href={settings.tiktok_url} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-black transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1.04-.1z"/>
                  </svg>
                </a>
              )}
            </div>
          )}
          <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-3 mb-8">
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

            <TabsContent value="map">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 text-center">
                Interactive Tour Map
              </h2>
              <p className="text-gray-600 text-center mb-8 max-w-2xl mx-auto">
                Explore all tour locations on our interactive map
              </p>
            </motion.div>

            <div className="w-full rounded-xl overflow-hidden shadow-lg border border-gray-200">
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