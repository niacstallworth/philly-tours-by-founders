import React from 'react';
import { Card } from '@/components/ui/card';
import LocationCard from './LocationCard';

export default function DaySchedule({ day, dayIndex }) {
  return (
    <div className="mb-12">
      <Card className="p-8 bg-gradient-to-br from-indigo-50 to-purple-50 border-none shadow-lg mb-6">
        <div className="flex items-center gap-4 mb-3">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center text-white text-xl font-bold shadow-lg">
            {day.day_number}
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">{day.title}</h3>
            {day.focus && (
              <p className="text-indigo-700 font-medium mt-1">Focus: {day.focus}</p>
            )}
          </div>
        </div>
      </Card>
      
      <div className="space-y-4">
        {day.locations?.map((location, idx) => (
          <LocationCard key={idx} location={location} index={idx} />
        ))}
      </div>
    </div>
  );
}