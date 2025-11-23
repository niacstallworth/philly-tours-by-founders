import React from 'react';
import { Card } from '@/components/ui/card';
import { MapPin, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LocationCard({ location, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="p-5 bg-white border-l-4 border-l-indigo-500 hover:shadow-md transition-all duration-300">
        <div className="flex gap-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
              {index + 1}
            </div>
          </div>
          
          <div className="flex-1">
            {location.time && (
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                <Clock className="w-4 h-4" />
                <span>{location.time}</span>
              </div>
            )}
            
            <h4 className="text-lg font-bold text-gray-900 mb-1">
              {location.name}
            </h4>
            
            {location.address && (
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                <MapPin className="w-4 h-4" />
                <span>{location.address}</span>
              </div>
            )}
            
            <p className="text-gray-700 leading-relaxed">
              {location.description}
            </p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}