import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, Navigation, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function ScavengerHuntCard({ hunt, theme }) {
  const stopCount = hunt.stops?.filter(s => !s.is_bonus).length || 0;
  const bonusCount = hunt.stops?.filter(s => s.is_bonus).length || 0;

  const gradientFrom = theme?.hero_gradient_from || '#1a1a1a';
  const gradientTo = theme?.hero_gradient_to || '#2d2d2d';

  return (
    <Link to={createPageUrl('ScavengerHunt') + `?hunt=${encodeURIComponent(hunt.name)}`}>
      <motion.div
        whileHover={{ y: -8 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        <Card className="overflow-hidden bg-white border-none shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer group">
          <div 
            className="relative h-64 overflow-hidden"
            style={{ background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})` }}
          >
            {theme?.card_image_url ? (
              <img 
                src={theme.card_image_url} 
                alt={hunt.name}
                className="absolute inset-0 w-full h-full object-cover opacity-50"
              />
            ) : hunt.hero_image_url ? (
              <div 
                className="absolute inset-0 bg-cover bg-center opacity-40" 
                style={{ backgroundImage: `url(${hunt.hero_image_url})` }}
              />
            ) : null}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white">
                <MapPin className="w-16 h-16 mx-auto mb-3" />
                <p className="text-lg font-medium">GPS Adventure</p>
              </div>
            </div>
            <Badge 
              className="absolute top-4 right-4 border-none px-4 py-1.5 font-medium text-white"
              style={{ backgroundColor: theme?.primary_color || '#D4AF37' }}
            >
              Interactive
            </Badge>
          </div>
          
          <div className="p-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-amber-700 transition-colors">
              {hunt.name}
            </h3>
            <p className="text-sm text-amber-600 font-medium mb-3">GPS-Enabled Scavenger Hunt</p>
            <p className="text-gray-600 mb-4 line-clamp-2 leading-relaxed">
              Unlock secrets and discover hidden history as you explore Philadelphia's historic landmarks.
            </p>
            
            <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
              <div className="flex items-center gap-1.5">
                <Navigation className="w-4 h-4" />
                <span>{stopCount} stops</span>
              </div>
              {bonusCount > 0 && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  <span>+{bonusCount} bonus</span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                <span>2-4 hours</span>
              </div>
            </div>
            
            <div className="flex items-center text-amber-600 font-medium group-hover:text-amber-700 transition-colors">
              <span>Start Adventure</span>
              <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-2" />
            </div>
          </div>
        </Card>
      </motion.div>
    </Link>
  );
}