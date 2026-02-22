import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, MapPin, Glasses, Mail, CheckCircle, X, Info, Navigation, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

// Heritage sites with GPS coords and AR overlay content
const HERITAGE_SITES = [
  {
    id: 1,
    name: 'Mother Bethel AME Church',
    address: '419 Richard Allen Ave, Philadelphia',
    lat: 39.9434,
    lng: -75.1467,
    radius: 200,
    year: '1794',
    fact: 'Founded by Richard Allen — the first African Methodist Episcopal church in the world.',
    color: '#7c3aed',
  },
  {
    id: 2,
    name: 'Independence Hall',
    address: '520 Chestnut St, Philadelphia',
    lat: 39.9489,
    lng: -75.1500,
    radius: 200,
    year: '1776',
    fact: 'Where both the Declaration of Independence and U.S. Constitution were debated and adopted.',
    color: '#1d4ed8',
  },
  {
    id: 3,
    name: 'The Octavius Catto Memorial',
    address: 'City Hall, Philadelphia',
    lat: 39.9527,
    lng: -75.1635,
    radius: 200,
    year: '1871',
    fact: 'Octavius Catto fought for Black suffrage and was assassinated on Election Day, 1871.',
    color: '#b45309',
  },
  {
    id: 4,
    name: "Johnson House Historic Site",
    address: '6306 Germantown Ave, Philadelphia',
    lat: 40.0376,
    lng: -75.1724,
    radius: 200,
    year: '1768',
    fact: 'A documented Underground Railroad station that sheltered freedom seekers heading north.',
    color: '#065f46',
  },
];

function distance(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function ARExperience() {
  const [mode, setMode] = useState('home'); // home | ar | signup-success
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [signedUp, setSignedUp] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [userPos, setUserPos] = useState(null);
  const [nearbySite, setNearbySite] = useState(null);
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [heading, setHeading] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Start camera
  const startAR = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      setMode('ar');
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      }, 100);
    } catch (err) {
      setCameraError('Camera access was denied. Please allow camera access and try again.');
    }
  };

  // Stop camera
  const stopAR = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setMode('home');
    setNearbySite(null);
    setOverlayVisible(false);
  };

  // GPS watch
  useEffect(() => {
    if (mode !== 'ar') return;
    const watchId = navigator.geolocation.watchPosition(
      pos => {
        const { latitude, longitude } = pos.coords;
        setUserPos({ lat: latitude, lng: longitude });
        const nearby = HERITAGE_SITES.find(
          site => distance(latitude, longitude, site.lat, site.lng) <= site.radius
        );
        if (nearby && nearby.id !== nearbySite?.id) {
          setNearbySite(nearby);
          setOverlayVisible(true);
        } else if (!nearby) {
          setNearbySite(null);
          setOverlayVisible(false);
        }
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 3000 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, [mode, nearbySite?.id]);

  // Device orientation for compass heading
  useEffect(() => {
    if (mode !== 'ar') return;
    const handler = e => setHeading(Math.round(e.alpha || 0));
    window.addEventListener('deviceorientationabsolute', handler, true);
    window.addEventListener('deviceorientation', handler, true);
    return () => {
      window.removeEventListener('deviceorientationabsolute', handler, true);
      window.removeEventListener('deviceorientation', handler, true);
    };
  }, [mode]);

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!email) return;
    setSubmitting(true);
    await base44.integrations.Core.SendEmail({
      to: 'info@foundersthread.org',
      subject: 'AR Experience Early Access Sign-Up',
      body: `New AR early access sign-up: ${email}`,
    });
    setSubmitting(false);
    setSignedUp(true);
    setEmail('');
  };

  if (mode === 'ar') {
    return (
      <div className="fixed inset-0 bg-black z-50">
        {/* Camera feed */}
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          playsInline
          muted
          autoPlay
        />

        {/* Close button */}
        <button
          onClick={stopAR}
          className="absolute top-4 right-4 z-20 w-11 h-11 rounded-full bg-black/50 backdrop-blur flex items-center justify-center text-white"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Compass / heading */}
        {heading !== null && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-black/40 backdrop-blur-sm rounded-full px-4 py-2 text-white text-sm">
            <Navigation className="w-4 h-4" style={{ transform: `rotate(${heading}deg)` }} />
            {heading}°
          </div>
        )}

        {/* Status bar */}
        <div className="absolute bottom-24 left-0 right-0 z-20 flex justify-center px-4">
          {!userPos ? (
            <div className="bg-black/50 backdrop-blur-sm rounded-full px-5 py-2.5 text-white/80 text-sm flex items-center gap-2">
              <MapPin className="w-4 h-4 animate-pulse" />
              Acquiring GPS…
            </div>
          ) : !nearbySite ? (
            <div className="bg-black/50 backdrop-blur-sm rounded-full px-5 py-2.5 text-white/80 text-sm flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Walk to a heritage site to unlock content
            </div>
          ) : null}
        </div>

        {/* AR Overlay — appears when near a site */}
        <AnimatePresence>
          {overlayVisible && nearbySite && (
            <motion.div
              key={nearbySite.id}
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.95 }}
              transition={{ type: 'spring', damping: 20 }}
              className="absolute bottom-28 left-4 right-4 z-20"
            >
              <div
                className="rounded-2xl p-5 backdrop-blur-md border border-white/20 shadow-2xl"
                style={{ backgroundColor: nearbySite.color + 'cc' }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="text-white/70 text-xs font-semibold uppercase tracking-widest mb-1">
                      📍 You're here · Est. {nearbySite.year}
                    </div>
                    <h2 className="text-white text-xl font-bold mb-2">{nearbySite.name}</h2>
                    <p className="text-white/85 text-sm leading-relaxed">{nearbySite.fact}</p>
                    <div className="text-white/60 text-xs mt-2">{nearbySite.address}</div>
                  </div>
                  <button
                    onClick={() => setOverlayVisible(false)}
                    className="text-white/60 hover:text-white mt-1 flex-shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Corner label */}
        <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-black/40 backdrop-blur-sm rounded-full px-3 py-1.5 text-white/80 text-xs font-semibold">
          <Glasses className="w-3.5 h-3.5" />
          AR Mode
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      {/* Hero */}
      <div className="relative bg-gradient-to-br from-indigo-950 via-indigo-900 to-purple-900 text-white overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1569761316261-9a8696fa2ca3?w=1600&q=80)', backgroundSize: 'cover', backgroundPosition: 'center' }}
        />
        <div className="relative z-10 max-w-2xl mx-auto px-6 py-20 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="w-20 h-20 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mx-auto mb-6">
              <Camera className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Philadelphia AR<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-400">
                Heritage Viewer
              </span>
            </h1>
            <p className="text-white/75 text-lg mb-8 leading-relaxed">
              Point your camera at heritage sites across Philadelphia to unlock historic facts, photos, and stories — all layered live over the real world.
            </p>

            {cameraError && (
              <div className="flex items-center gap-2 bg-red-500/20 border border-red-400/30 rounded-xl px-4 py-3 mb-6 text-red-200 text-sm text-left">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {cameraError}
              </div>
            )}

            <Button
              onClick={startAR}
              size="lg"
              className="bg-white text-indigo-900 hover:bg-white/90 font-bold px-10 rounded-full text-base"
            >
              <Camera className="w-5 h-5 mr-2" />
              Launch AR Camera
            </Button>
          </motion.div>
        </div>
      </div>

      {/* How it works */}
      <div className="max-w-2xl mx-auto px-6 py-14">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">How It Works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { icon: Camera, step: '1', title: 'Open Camera', desc: 'Tap "Launch AR Camera" and allow camera & location access.' },
            { icon: MapPin, step: '2', title: 'Visit a Site', desc: 'Walk to any of our heritage sites across Philadelphia.' },
            { icon: Info, step: '3', title: 'See the Story', desc: 'An AR overlay appears with facts and history of that exact location.' },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex flex-col items-center text-center p-5 rounded-2xl bg-indigo-50 dark:bg-slate-800"
            >
              <div className="w-11 h-11 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-lg mb-3">
                {item.step}
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{item.title}</h3>
              <p className="text-sm text-gray-500 dark:text-slate-400">{item.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Sites list */}
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-14 mb-6">Heritage Sites</h2>
        <div className="space-y-3">
          {HERITAGE_SITES.map(site => (
            <div key={site.id} className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: site.color + '20' }}>
                <MapPin className="w-5 h-5" style={{ color: site.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-900 dark:text-white text-sm">{site.name}</div>
                <div className="text-xs text-gray-400 truncate">{site.address}</div>
              </div>
              <div className="text-xs font-medium text-gray-400">Est. {site.year}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Email sign-up — Coming Soon for full AR */}
      <div className="bg-gradient-to-br from-indigo-900 to-purple-900 text-white py-16 px-6">
        <div className="max-w-md mx-auto text-center">
          <Glasses className="w-12 h-12 mx-auto mb-4 text-white/60" />
          <h2 className="text-2xl font-bold mb-2">Full AR Glasses Experience</h2>
          <p className="text-white/70 text-sm mb-6 leading-relaxed">
            A hands-free AR glasses program is coming to Philadelphia heritage sites in 2025. Sign up to get early access and grant updates.
          </p>

          {signedUp ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-3"
            >
              <CheckCircle className="w-10 h-10 text-green-400" />
              <p className="text-white font-semibold">You're on the list!</p>
              <p className="text-white/60 text-sm">We'll be in touch when the glasses program launches.</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSignUp} className="flex flex-col sm:flex-row gap-3">
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus-visible:ring-white/40"
              />
              <Button
                type="submit"
                disabled={submitting}
                className="bg-white text-indigo-900 hover:bg-white/90 font-semibold rounded-lg whitespace-nowrap"
              >
                <Mail className="w-4 h-4 mr-2" />
                {submitting ? 'Sending…' : 'Get Early Access'}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}