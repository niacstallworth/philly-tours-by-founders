import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import TourCard from '../components/tours/TourCard';
import ScavengerHuntCard from '../components/scavenger/ScavengerHuntCard';
import { Compass, Sparkles, Map, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Home() {
  const { data: tours, isLoading: toursLoading } = useQuery({
    queryKey: ['tours'],
    queryFn: () => base44.entities.Tour.list(),
    initialData: []
  });

  const { data: scavengerStops, isLoading: stopsLoading } = useQuery({
    queryKey: ['allScavengerStops'],
    queryFn: () => base44.entities.ScavengerHuntStop.list(),
    initialData: []
  });

  // Group stops by hunt name to get unique hunts
  const scavengerHunts = Object.entries(
    scavengerStops.reduce((acc, stop) => {
      if (!acc[stop.hunt_name]) {
        acc[stop.hunt_name] = { name: stop.hunt_name, stops: [] };
      }
      acc[stop.hunt_name].stops.push(stop);
      return acc;
    }, {})
  ).map(([name, data]) => data);

  const isLoading = toursLoading || stopsLoading;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50/30 to-purple-50/30">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 text-white">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1600')] bg-cover bg-center opacity-10" />
        
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
              Founders Threads
            </h1>
            
            <p className="text-xl md:text-2xl text-indigo-200 max-w-3xl mx-auto mb-8 leading-relaxed">
              Discover Philadelphia's rich tapestry of history, culture, and heritage through curated tours
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

      {/* Content Section with Tabs */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <Tabs defaultValue="tours" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-12">
            <TabsTrigger value="tours" className="flex items-center gap-2">
              <Map className="w-4 h-4" />
              Tours
            </TabsTrigger>
            <TabsTrigger value="hunts" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Scavenger Hunts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tours">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
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
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 text-center">
                Scavenger Hunts
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                GPS-enabled adventures that unlock secrets as you explore Philadelphia
              </p>
            </motion.div>

            {stopsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[1, 2].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-96 bg-gray-200 rounded-2xl" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {scavengerHunts.map((hunt) => (
                  <ScavengerHuntCard key={hunt.name} hunt={hunt} />
                ))}
              </div>
            )}
            
            {!stopsLoading && scavengerHunts.length === 0 && (
              <div className="text-center py-20">
                <MapPin className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 text-lg">No scavenger hunts available yet</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}