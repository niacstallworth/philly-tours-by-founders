import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import DaySchedule from '../components/tours/DaySchedule';
import { Calendar, MapPin, Info } from 'lucide-react';

export default function TourDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const tourId = urlParams.get('id');

  const { data: tours, isLoading } = useQuery({
    queryKey: ['tours'],
    queryFn: () => base44.entities.Tour.list(),
    initialData: []
  });

  const tour = tours.find(t => t.id === tourId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading tour details...</p>
        </div>
      </div>
    );
  }

  if (!tour) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Tour not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50/20 to-purple-50/20">
      {/* Hero Section */}
      <div className="relative h-96 overflow-hidden">
        <img
          src={tour.image_url}
          alt={tour.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />
        
        <div className="absolute inset-0 flex items-end">
          <div className="max-w-7xl mx-auto px-6 pb-12 w-full">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-3">
              {tour.title}
            </h1>
            <p className="text-xl text-indigo-200 mb-4">{tour.subtitle}</p>
            
            <div className="flex flex-wrap gap-4 text-white">
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                <Calendar className="w-4 h-4" />
                <span>{tour.duration}</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                <MapPin className="w-4 h-4" />
                <span>Philadelphia</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Overview */}
        <Card className="p-8 mb-12 bg-white shadow-lg border-none">
          <div className="flex items-start gap-3 mb-4">
            <Info className="w-6 h-6 text-indigo-600 flex-shrink-0 mt-1" />
            <div className="w-full">
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Tour Overview</h2>
              <p className="text-gray-700 leading-relaxed mb-4">{tour.description}</p>
              <a 
                href="https://book.squareup.com/appointments/4l5p1y4tx8ni0p/location/LAQNH4PPWSX4N/services" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center text-indigo-600 hover:text-indigo-700 font-medium underline"
              >
                Purchase tour or inquire via email →
              </a>
            </div>
          </div>
        </Card>

        {/* Daily Itinerary */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Daily Itinerary</h2>
          {tour.days?.map((day, index) => (
            <DaySchedule key={index} day={day} dayIndex={index} />
          ))}
        </div>

        {/* Practical Notes */}
        {tour.practical_notes && tour.practical_notes.length > 0 && (
          <Card className="p-8 bg-gradient-to-br from-amber-50 to-orange-50 border-none shadow-lg mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Practical Notes</h3>
            <ul className="space-y-2">
              {tour.practical_notes.map((note, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="text-amber-600 text-lg">•</span>
                  <span className="text-gray-700">{note}</span>
                </li>
              ))}
            </ul>
          </Card>
        )}

        {/* Purchase Button */}
        <div className="text-center">
          <a 
            href="https://book.squareup.com/appointments/4l5p1y4tx8ni0p/location/LAQNH4PPWSX4N/services" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-6 text-lg">
              Purchase Here
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}