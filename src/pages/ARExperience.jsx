import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, MapPin, Glasses, Mail, CheckCircle, X, Info, Navigation, AlertCircle, Lock, Crown, Compass, Scan } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

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
  const [mode, setMode] = useState('home'); // home | ar
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [signedUp, setSignedUp] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [userPos, setUserPos] = useState(null);
  const [nearbySite, setNearbySite] = useState(null);
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [heading, setHeading] = useState(null);
  const [user, setUser] = useState(undefined);
  const [scanPulse, setScanPulse] = useState(false);
  const [nearestSite, setNearestSite] = useState(null); // closest site even if not in range
  const [nearestDistance, setNearestDistance] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);

  const { data: sites = [] } = useQuery({
    queryKey: ['heritage-sites'],
    queryFn: () => base44.entities.HeritageSite.list(),
  });

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  const isElite = user?.role === 'admin' || user?.membership === 'elite';

  const canAccessSite = (site) => site.is_free || isElite;

  // Start camera
  const startAR = async (demo = false) => {
    setCameraError(null);
    if (demo) {
      setIsDemoMode(true);
      setMode('ar');
      // Simulate being at the first site (or first free site)
      const demoSite = sites.find(s => s.is_free) || sites[0];
      if (demoSite) {
        setTimeout(() => {
          setNearbySite(demoSite);
          setOverlayVisible(true);
        }, 1200);
      }
      return;
    }
    setIsDemoMode(false);
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

  const stopAR = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setMode('home');
    setNearbySite(null);
    setOverlayVisible(false);
    setIsDemoMode(false);
  };

  // Demo: cycle through sites every 6 seconds
  useEffect(() => {
    if (mode !== 'ar' || !isDemoMode || sites.length === 0) return;
    const demoSites = sites.filter(s => canAccessSite(s));
    if (demoSites.length === 0) return;
    let idx = 0;
    const interval = setInterval(() => {
      idx = (idx + 1) % demoSites.length;
      setNearbySite(demoSites[idx]);
      setOverlayVisible(true);
    }, 6000);
    return () => clearInterval(interval);
  }, [mode, isDemoMode, sites]);

  // Canvas AR overlay renderer
  const drawAROverlay = useCallback(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video || isDemoMode) return;
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw scanning grid lines (subtle AR effect)
    ctx.strokeStyle = 'rgba(99,102,241,0.15)';
    ctx.lineWidth = 1;
    const gridSize = 60;
    for (let x = 0; x < canvas.width; x += gridSize) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += gridSize) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
    }

    // Draw corner brackets (AR frame indicator)
    const bSize = 28;
    const bGap = 44;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2 - 40;
    ctx.strokeStyle = nearbySite ? 'rgba(99,255,160,0.85)' : 'rgba(99,102,241,0.6)';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    // TL
    ctx.beginPath(); ctx.moveTo(cx - bGap, cy - bGap + bSize); ctx.lineTo(cx - bGap, cy - bGap); ctx.lineTo(cx - bGap + bSize, cy - bGap); ctx.stroke();
    // TR
    ctx.beginPath(); ctx.moveTo(cx + bGap - bSize, cy - bGap); ctx.lineTo(cx + bGap, cy - bGap); ctx.lineTo(cx + bGap, cy - bGap + bSize); ctx.stroke();
    // BL
    ctx.beginPath(); ctx.moveTo(cx - bGap, cy + bGap - bSize); ctx.lineTo(cx - bGap, cy + bGap); ctx.lineTo(cx - bGap + bSize, cy + bGap); ctx.stroke();
    // BR
    ctx.beginPath(); ctx.moveTo(cx + bGap - bSize, cy + bGap); ctx.lineTo(cx + bGap, cy + bGap); ctx.lineTo(cx + bGap, cy + bGap - bSize); ctx.stroke();

    // Draw nearest-site direction indicator if outside range
    if (!nearbySite && nearestSite && heading !== null && userPos) {
      const dLat = nearestSite.latitude - userPos.lat;
      const dLng = nearestSite.longitude - userPos.lng;
      const bearingRad = Math.atan2(dLng, dLat);
      const bearingDeg = (bearingRad * 180) / Math.PI;
      const relAngle = ((bearingDeg - heading + 360) % 360) * (Math.PI / 180);
      const arrowX = cx + Math.sin(relAngle) * 70;
      const arrowY = cy - Math.cos(relAngle) * 70;
      ctx.beginPath();
      ctx.arc(arrowX, arrowY, 14, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(99,102,241,0.4)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(99,102,241,0.9)';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.save();
      ctx.translate(arrowX, arrowY);
      ctx.rotate(relAngle);
      ctx.beginPath();
      ctx.moveTo(0, -8); ctx.lineTo(5, 4); ctx.lineTo(-5, 4);
      ctx.closePath();
      ctx.fillStyle = 'white';
      ctx.fill();
      ctx.restore();
    }

    animFrameRef.current = requestAnimationFrame(drawAROverlay);
  }, [isDemoMode, nearbySite, nearestSite, heading, userPos]);

  useEffect(() => {
    if (mode !== 'ar') { cancelAnimationFrame(animFrameRef.current); return; }
    animFrameRef.current = requestAnimationFrame(drawAROverlay);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [mode, drawAROverlay]);

  // GPS watch
  useEffect(() => {
    if (mode !== 'ar' || isDemoMode) return;
    const watchId = navigator.geolocation.watchPosition(
      pos => {
        const { latitude, longitude } = pos.coords;
        setUserPos({ lat: latitude, lng: longitude });

        // Find site within radius
        const nearby = sites.find(
          site => distance(latitude, longitude, site.latitude, site.longitude) <= (site.radius || 200)
        );

        // Find absolute nearest site for direction arrow
        let minDist = Infinity, nearest = null;
        sites.forEach(site => {
          const d = distance(latitude, longitude, site.latitude, site.longitude);
          if (d < minDist) { minDist = d; nearest = site; }
        });
        setNearestSite(nearest);
        setNearestDistance(Math.round(minDist));

        if (nearby && nearby.id !== nearbySite?.id) {
          setNearbySite(nearby);
          setOverlayVisible(true);
          setScanPulse(true);
          setTimeout(() => setScanPulse(false), 1500);
        } else if (!nearby) {
          setNearbySite(null);
          setOverlayVisible(false);
        }
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 2000 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, [mode, nearbySite?.id, sites]);

  // Compass heading
  useEffect(() => {
    if (mode !== 'ar' || isDemoMode) return;
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
        {/* Live camera feed */}
        {!isDemoMode && (
          <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" playsInline muted autoPlay />
        )}
        {isDemoMode && (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900" />
        )}

        {/* Canvas AR overlay — drawn on top of camera */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full z-10 pointer-events-none"
        />

        {/* Scan pulse ring when site detected */}
        <AnimatePresence>
          {scanPulse && (
            <motion.div
              className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none"
              initial={{ opacity: 0.8 }} animate={{ opacity: 0 }} exit={{ opacity: 0 }}
              transition={{ duration: 1.2 }}
            >
              <div className="w-64 h-64 rounded-full border-4 border-green-400 opacity-60" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Close */}
        <button
          onClick={stopAR}
          className="absolute top-4 right-4 z-20 w-11 h-11 rounded-full bg-black/50 backdrop-blur flex items-center justify-center text-white"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Compass */}
        {heading !== null && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-black/40 backdrop-blur-sm rounded-full px-4 py-2 text-white text-sm">
            <Compass className="w-4 h-4" style={{ transform: `rotate(${-heading}deg)`, transition: 'transform 0.3s ease' }} />
            {heading}°
          </div>
        )}

        {/* Status / Distance indicator */}
        <div className="absolute bottom-24 left-0 right-0 z-20 flex justify-center px-4">
          {!userPos ? (
            <div className="bg-black/50 backdrop-blur-sm rounded-full px-5 py-2.5 text-white/80 text-sm flex items-center gap-2">
              <MapPin className="w-4 h-4 animate-pulse" />Acquiring GPS…
            </div>
          ) : !nearbySite && nearestSite ? (
            <div className="bg-black/50 backdrop-blur-sm rounded-full px-5 py-2.5 text-white/80 text-sm flex items-center gap-2">
              <Navigation className="w-4 h-4 text-indigo-300" />
              {nearestDistance < 1000
                ? `${nearestDistance}m to ${nearestSite.name}`
                : `${(nearestDistance / 1000).toFixed(1)}km to ${nearestSite.name}`}
            </div>
          ) : !nearbySite ? (
            <div className="bg-black/50 backdrop-blur-sm rounded-full px-5 py-2.5 text-white/80 text-sm flex items-center gap-2">
              <MapPin className="w-4 h-4" />Walk to a heritage site to unlock content
            </div>
          ) : null}
        </div>

        {/* AR Overlay Card */}
        <AnimatePresence>
          {overlayVisible && nearbySite && (
            <motion.div
              key={nearbySite.id}
              initial={{ opacity: 0, y: 50, scale: 0.93 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.93 }}
              transition={{ type: 'spring', damping: 22, stiffness: 300 }}
              className="absolute bottom-28 left-4 right-4 z-20"
            >
              {canAccessSite(nearbySite) ? (
                <div
                  className="rounded-2xl overflow-hidden shadow-2xl"
                  style={{ border: `1.5px solid ${nearbySite.color || '#4f46e5'}80` }}
                >
                  {/* Top accent bar */}
                  <div className="h-1 w-full" style={{ backgroundColor: nearbySite.color || '#4f46e5' }} />
                  <div className="p-5 backdrop-blur-xl" style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}>
                    {/* Site image */}
                    {nearbySite.image_url && (
                      <div className="w-full h-28 rounded-xl overflow-hidden mb-4">
                        <img src={nearbySite.image_url} alt={nearbySite.name} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: nearbySite.color || '#4f46e5' }} />
                          <div className="text-white/60 text-xs font-semibold uppercase tracking-widest">
                            SITE DETECTED · Est. {nearbySite.year_established}
                          </div>
                        </div>
                        <h2 className="text-white text-xl font-bold mb-2 leading-tight">{nearbySite.name}</h2>
                        <p className="text-white/85 text-sm leading-relaxed">{nearbySite.ar_fact}</p>
                        <div className="flex items-center gap-2 mt-3">
                          <MapPin className="w-3.5 h-3.5 text-white/40" />
                          <div className="text-white/50 text-xs truncate">{nearbySite.address}</div>
                          {nearbySite.is_free && (
                            <span className="ml-auto text-xs bg-green-500/30 border border-green-400/30 px-2 py-0.5 rounded-full text-green-300 font-medium whitespace-nowrap">
                              ✓ Free
                            </span>
                          )}
                        </div>
                      </div>
                      <button onClick={() => setOverlayVisible(false)} className="text-white/40 hover:text-white mt-1 flex-shrink-0">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl overflow-hidden shadow-2xl border border-amber-400/30">
                  <div className="h-1 w-full bg-amber-500" />
                  <div className="p-5 backdrop-blur-xl bg-black/80">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                        <Lock className="w-5 h-5 text-amber-400" />
                      </div>
                      <div className="flex-1">
                        <div className="text-white/50 text-xs uppercase tracking-widest mb-1">Site Detected</div>
                        <h2 className="text-white text-lg font-bold mb-1">{nearbySite.name}</h2>
                        <p className="text-white/60 text-sm mb-3">Elite membership required to unlock this site's history.</p>
                        <button
                          onClick={() => { stopAR(); base44.auth.redirectToLogin(window.location.href); }}
                          className="inline-flex items-center gap-2 bg-amber-500 text-white text-sm font-semibold px-4 py-2 rounded-full"
                        >
                          <Crown className="w-4 h-4" />Upgrade to Elite
                        </button>
                      </div>
                      <button onClick={() => setOverlayVisible(false)} className="text-white/40 hover:text-white">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mode badge */}
        <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-black/40 backdrop-blur-sm rounded-full px-3 py-1.5 text-white/80 text-xs font-semibold">
          <Scan className="w-3.5 h-3.5 text-indigo-300" />{isDemoMode ? 'Demo Mode' : 'AR Live'}
        </div>

        {/* Demo mode banner */}
        {isDemoMode && (
          <div className="absolute top-14 left-0 right-0 z-20 flex justify-center px-4">
            <div className="bg-amber-500/80 backdrop-blur-sm rounded-full px-5 py-2 text-white text-xs font-semibold flex items-center gap-2">
              ✨ Demo — simulating GPS location at heritage sites
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      {/* Hero */}
      <div className="relative bg-gradient-to-br from-indigo-950 via-indigo-900 to-purple-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10"
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
            <p className="text-white/75 text-lg mb-4 leading-relaxed">
              Point your camera at heritage sites across Philadelphia to unlock historic facts layered live over the real world.
            </p>

            {/* Membership badge */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8 text-sm">
              <div className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-white/80">Masonic Temple — <strong className="text-white">Free</strong></span>
              </div>
              <div className="flex items-center gap-2 bg-amber-500/20 border border-amber-400/30 rounded-full px-4 py-2">
                <Crown className="w-4 h-4 text-amber-400" />
                <span className="text-white/80">All other sites — <strong className="text-amber-300">Elite</strong></span>
              </div>
            </div>

            {cameraError && (
              <div className="flex items-center gap-2 bg-red-500/20 border border-red-400/30 rounded-xl px-4 py-3 mb-6 text-red-200 text-sm text-left">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />{cameraError}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={() => startAR(false)}
                size="lg"
                className="bg-white text-indigo-900 hover:bg-white/90 font-bold px-10 rounded-full text-base"
              >
                <Camera className="w-5 h-5 mr-2" />Launch AR Camera
              </Button>
              <Button
                onClick={() => startAR(true)}
                size="lg"
                variant="outline"
                className="border-white/40 text-white bg-white/10 hover:bg-white/20 px-8 rounded-full text-base"
                disabled={sites.length === 0}
              >
                Try Demo Mode
              </Button>
            </div>

            {!user && (
              <p className="mt-4 text-white/50 text-sm">
                <button onClick={() => base44.auth.redirectToLogin(window.location.href)} className="underline text-white/70 hover:text-white">Sign in</button> for Elite access to all sites
              </p>
            )}
            {user && !isElite && (
              <p className="mt-4 text-amber-300/80 text-sm flex items-center justify-center gap-1">
                <Crown className="w-3.5 h-3.5" />
                Contact us to upgrade to Elite membership
              </p>
            )}
            {isElite && (
              <p className="mt-4 text-green-300 text-sm flex items-center justify-center gap-1">
                <Crown className="w-3.5 h-3.5" />Elite — All {sites.length} sites unlocked
              </p>
            )}
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
        {sites.length === 0 ? (
          <div className="space-y-3">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="h-16 rounded-xl bg-gray-100 dark:bg-slate-800 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {sites.map(site => (
              <div key={site.id} className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: (site.color || '#4f46e5') + '20' }}>
                  <MapPin className="w-5 h-5" style={{ color: site.color || '#4f46e5' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900 dark:text-white text-sm">{site.name}</div>
                  <div className="text-xs text-gray-400 truncate">{site.address}</div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs text-gray-400">Est. {site.year_established}</span>
                  {site.is_free ? (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Free</span>
                  ) : (
                    <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                      <Crown className="w-3 h-3" />Elite
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Email sign-up */}
      <div className="bg-gradient-to-br from-indigo-900 to-purple-900 text-white py-16 px-6">
        <div className="max-w-md mx-auto text-center">
          <Glasses className="w-12 h-12 mx-auto mb-4 text-white/60" />
          <h2 className="text-2xl font-bold mb-2">Full AR Glasses Experience</h2>
          <p className="text-white/70 text-sm mb-6 leading-relaxed">
            A hands-free AR glasses program is coming to Philadelphia heritage sites. Sign up to get early access.
          </p>
          <div className="mb-6 text-left bg-white/10 border border-white/20 rounded-xl p-4 text-sm text-white/70">
            <p className="font-semibold text-white mb-1">📌 Planned Feature Note</p>
            <p>A dedicated native app for AR glasses (e.g., Meta Ray-Bans, Apple Vision Pro) is on the roadmap. This would enable a true hands-free heritage tour experience with Google Earth–style spatial overlays. Web-based AR cannot run on glasses hardware — a native app per glasses platform would be required.</p>
          </div>
          {signedUp ? (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-3">
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
              <Button type="submit" disabled={submitting} className="bg-white text-indigo-900 hover:bg-white/90 font-semibold rounded-lg whitespace-nowrap">
                <Mail className="w-4 h-4 mr-2" />{submitting ? 'Sending…' : 'Get Early Access'}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}