import React from 'react';
import { motion } from 'framer-motion';
import { Glasses, MapPin, Mic, Eye, Cpu, Users, Award, ArrowRight, CheckCircle, Zap, Globe, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const stats = [
  { value: '300+', label: 'Years of Hidden History', icon: Globe },
  { value: '12', label: 'Tour Locations', icon: MapPin },
  { value: '100%', label: 'Hands-Free Navigation', icon: Glasses },
  { value: '2025', label: 'Grant Pilot Year', icon: Award },
];

const features = [
  {
    icon: Eye,
    title: 'Augmented Overlays',
    description: 'Historic photos and documents appear floating in space at exact locations — see the past layered over the present.'
  },
  {
    icon: Mic,
    title: 'Voice-Guided Narration',
    description: 'Spoken storytelling triggers automatically as you approach each site — no tapping, no scrolling, just listening.'
  },
  {
    icon: MapPin,
    title: 'GPS-Locked Content',
    description: 'Content unlocks only when you\'re physically standing at the right spot, creating a truly place-based experience.'
  },
  {
    icon: Cpu,
    title: 'AI-Powered Storytelling',
    description: 'Real-time AI generates contextual responses to visitor questions about each heritage site.'
  },
  {
    icon: Users,
    title: 'Group Sync',
    description: 'Up to 10 participants can share the same AR session — perfect for school groups and family tours.'
  },
  {
    icon: Heart,
    title: 'Accessibility First',
    description: 'Designed for all abilities — audio descriptions, adjustable text size, and wheelchair-friendly routes.'
  },
];

const timeline = [
  { phase: 'Phase 1', title: 'Digital Foundation', status: 'complete', desc: 'GPS scavenger hunts and mobile tour guides — live now.' },
  { phase: 'Phase 2', title: 'AR Pilot Program', status: 'active', desc: 'AR glasses loaner program at 3 anchor sites. Grant-funded.' },
  { phase: 'Phase 3', title: 'Full Deployment', status: 'upcoming', desc: 'City-wide rollout across all 12 heritage corridors.' },
  { phase: 'Phase 4', title: 'Curriculum Integration', status: 'upcoming', desc: 'Philadelphia school district partnership for field trips.' },
];

export default function ARExperience() {
  return (
    <div className="min-h-screen bg-white">

      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-950 via-indigo-900 to-purple-900 text-white">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1569761316261-9a8696fa2ca3?w=1600&q=80)', backgroundSize: 'cover', backgroundPosition: 'center' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-indigo-950/80" />

        <div className="relative z-10 max-w-5xl mx-auto px-6 py-24 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 text-sm font-medium mb-8">
              <Zap className="w-4 h-4 text-yellow-300" />
              Grant Demo — Philly Heritage Hands-Free
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Philadelphia History,<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-400">
                Seen Through Glass
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-white/75 max-w-3xl mx-auto mb-10 leading-relaxed">
              AR glasses that overlay historic photos, narrate untold stories, and guide visitors hands-free through Philadelphia's most significant heritage sites.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to={createPageUrl('Home')}>
                <Button size="lg" className="bg-white text-indigo-900 hover:bg-white/90 font-semibold px-8 rounded-full">
                  <MapPin className="w-5 h-5 mr-2" />
                  Try the GPS Tours Now
                </Button>
              </Link>
              <a href="mailto:info@foundersthread.org">
                <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/20 font-semibold px-8 rounded-full bg-white/10">
                  <ArrowRight className="w-5 h-5 mr-2" />
                  Contact for Grant Info
                </Button>
              </a>
            </div>
          </motion.div>
        </div>

        {/* Glasses illustration */}
        <div className="relative z-10 flex justify-center pb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="w-48 h-48 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm flex items-center justify-center"
          >
            <Glasses className="w-24 h-24 text-white/80" />
          </motion.div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-indigo-50 border-y border-indigo-100">
        <div className="max-w-5xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <div className="text-4xl font-bold text-indigo-700 mb-1">{s.value}</div>
              <div className="text-sm text-gray-600">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* What is it */}
      <div className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">What is Philly Heritage Hands-Free?</h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            A grant-funded initiative merging AR wearable technology with Philadelphia's Black and multicultural heritage sites — making history visible, accessible, and unforgettable.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-6 rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center mb-4">
                <f.icon className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.description}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Roadmap */}
      <div className="bg-gray-50 py-20 border-t border-gray-100">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-gray-900 text-center mb-14">Project Roadmap</h2>
          <div className="space-y-6">
            {timeline.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex gap-5 items-start"
              >
                <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm
                  ${t.status === 'complete' ? 'bg-green-100 text-green-700' :
                    t.status === 'active' ? 'bg-indigo-600 text-white' :
                    'bg-gray-200 text-gray-500'}`}>
                  {t.status === 'complete' ? <CheckCircle className="w-5 h-5" /> : i + 1}
                </div>
                <div className="flex-1 pb-6 border-b border-gray-200 last:border-0">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-xs font-semibold uppercase tracking-wide text-indigo-500">{t.phase}</span>
                    {t.status === 'active' && (
                      <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium">In Progress</span>
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-900 text-lg">{t.title}</h3>
                  <p className="text-gray-500 text-sm mt-1">{t.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-br from-indigo-900 to-purple-900 text-white py-20 text-center">
        <div className="max-w-2xl mx-auto px-6">
          <Glasses className="w-16 h-16 mx-auto mb-6 text-white/60" />
          <h2 className="text-4xl font-bold mb-4">Support This Vision</h2>
          <p className="text-white/70 text-lg mb-8">
            Help us bring AR heritage experiences to Philadelphia schools, tourists, and communities. We're actively seeking grant partners and sponsors.
          </p>
          <a href="mailto:info@foundersthread.org">
            <Button size="lg" className="bg-white text-indigo-900 hover:bg-white/90 font-semibold px-10 rounded-full">
              Get In Touch
            </Button>
          </a>
        </div>
      </div>

    </div>
  );
}