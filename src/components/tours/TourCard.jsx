import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function TourCard({ tour }) {
  const [videoError, setVideoError] = React.useState(false);

  return (
    <Link to={createPageUrl('TourDetail') + `?id=${tour.id}`}>
      <motion.div
        whileHover={{ y: -8 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        <Card className="overflow-hidden bg-white border-none shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer group">
          <div className="relative h-64 overflow-hidden">
            {tour.video_embed ? (
              <div 
                className="absolute inset-0 pointer-events-none"
                dangerouslySetInnerHTML={{ __html: tour.video_embed }}
              />
            ) : tour.video_url && !videoError ? (
              <video
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                onError={() => setVideoError(true)}
              >
                <source src={tour.video_url} type="video/mp4" />
                <source src={tour.video_url} type="video/webm" />
              </video>
            ) : (
              <img
                src={tour.image_url}
                alt={tour.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <Badge className="absolute top-4 right-4 bg-white/90 text-indigo-900 border-none px-4 py-1.5 font-medium">
              {tour.category}
            </Badge>
          </div>
          
          <div className="p-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-indigo-700 transition-colors">
              {tour.title}
            </h3>
            <p className="text-sm text-indigo-600 font-medium mb-3">{tour.subtitle}</p>
            <p className="text-gray-600 mb-4 line-clamp-3 leading-relaxed">
              {tour.description}
            </p>
            
            <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                <span>{tour.duration}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                <span>Philadelphia</span>
              </div>
            </div>
            
            <div className="flex items-center text-indigo-600 font-medium group-hover:text-indigo-700 transition-colors">
              <span>Explore Tour</span>
              <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-2" />
            </div>
          </div>
        </Card>
      </motion.div>
    </Link>
  );
}