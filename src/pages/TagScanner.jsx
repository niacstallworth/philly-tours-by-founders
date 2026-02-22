import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QrCode, Camera, X, CheckCircle, AlertCircle, MapPin, Star, ScanLine } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

export default function TagScanner() {
  const [mode, setMode] = useState('home'); // home | camera | manual | result
  const [manualInput, setManualInput] = useState('');
  const [scannedTag, setScannedTag] = useState(null);
  const [alreadyScanned, setAlreadyScanned] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(undefined);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const barcodeDetectorRef = useRef(null);
  const scanIntervalRef = useRef(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  const { data: userScans = [] } = useQuery({
    queryKey: ['tag-scans', user?.email],
    queryFn: () => base44.entities.TagScan.filter({ user_email: user?.email }),
    enabled: !!user?.email,
  });

  const scannedTagIds = new Set(userScans.map(s => s.tag_id));
  const totalPoints = userScans.reduce((sum, s) => sum + (s.points_earned || 0), 0);

  const lookupTag = async (tagId) => {
    setError(null);
    const trimmed = tagId.trim();
    if (!trimmed) return;
    try {
      const tags = await base44.entities.LocationTag.filter({ tag_id: trimmed, is_active: true });
      if (!tags || tags.length === 0) {
        setError(`No active tag found with ID: "${trimmed}"`);
        setMode('result');
        return;
      }
      const tag = tags[0];
      const wasAlreadyScanned = scannedTagIds.has(trimmed);
      setAlreadyScanned(wasAlreadyScanned);
      setScannedTag(tag);

      // Record scan if new
      if (!wasAlreadyScanned) {
        await base44.entities.TagScan.create({
          tag_id: trimmed,
          user_email: user?.email || 'anonymous',
          site_name: tag.site_name,
          points_earned: tag.reward_points || 10,
        });
        // Update user leaderboard stats
        if (user?.email) {
          await base44.functions.invoke('updateUserStats', {
            points_earned: tag.reward_points || 10,
            hunt_completed: false,
          });
        }
      }
      setMode('result');
    } catch (e) {
      setError('Something went wrong. Please try again.');
      setMode('result');
    }
  };

  const startCamera = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      setMode('camera');
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      }, 100);

      // Use BarcodeDetector API if available
      if ('BarcodeDetector' in window) {
        barcodeDetectorRef.current = new window.BarcodeDetector({ formats: ['qr_code', 'code_128', 'ean_13', 'ean_8', 'code_39'] });
        scanIntervalRef.current = setInterval(async () => {
          if (!videoRef.current || videoRef.current.readyState < 2) return;
          try {
            const barcodes = await barcodeDetectorRef.current.detect(videoRef.current);
            if (barcodes.length > 0) {
              stopCamera();
              await lookupTag(barcodes[0].rawValue);
            }
          } catch (_) {}
        }, 600);
      }
    } catch (_) {
      setError('Camera access denied. Use manual entry instead.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    setMode('home');
  };

  const reset = () => {
    setMode('home');
    setScannedTag(null);
    setAlreadyScanned(false);
    setError(null);
    setManualInput('');
  };

  // Camera view
  if (mode === 'camera') {
    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col">
        <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" playsInline muted autoPlay />

        {/* Scan frame */}
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <div className="relative w-64 h-64">
            <div className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-white rounded-tl-lg" />
            <div className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-white rounded-tr-lg" />
            <div className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-white rounded-bl-lg" />
            <div className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-white rounded-br-lg" />
            <motion.div
              className="absolute left-2 right-2 h-0.5 bg-indigo-400 opacity-80"
              animate={{ top: ['10%', '90%', '10%'] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
            />
          </div>
        </div>

        <button onClick={stopCamera} className="absolute top-4 right-4 z-20 w-11 h-11 rounded-full bg-black/60 flex items-center justify-center text-white">
          <X className="w-5 h-5" />
        </button>

        <div className="absolute bottom-24 left-0 right-0 z-20 flex flex-col items-center gap-3 px-6">
          <div className="bg-black/60 backdrop-blur-sm rounded-full px-5 py-2.5 text-white/80 text-sm flex items-center gap-2">
            <ScanLine className="w-4 h-4 text-indigo-300" />
            {'BarcodeDetector' in window ? 'Point camera at QR code or barcode' : 'Auto-scan not supported — use manual entry'}
          </div>
          <button
            onClick={() => { stopCamera(); setMode('manual'); }}
            className="text-white/60 text-sm underline"
          >
            Enter ID manually instead
          </button>
        </div>
      </div>
    );
  }

  // Result view
  if (mode === 'result') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-sm"
        >
          {error ? (
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Tag Not Found</h2>
              <p className="text-gray-500 text-sm mb-6">{error}</p>
              <Button onClick={reset} className="w-full rounded-2xl">Try Again</Button>
            </div>
          ) : scannedTag ? (
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl overflow-hidden">
              {scannedTag.image_url && (
                <img src={scannedTag.image_url} alt={scannedTag.site_name} className="w-full h-44 object-cover" />
              )}
              <div className="p-7 text-center">
                {alreadyScanned ? (
                  <div className="inline-flex items-center gap-1.5 text-xs bg-amber-100 text-amber-700 px-3 py-1 rounded-full font-medium mb-3">
                    Already scanned
                  </div>
                ) : (
                  <motion.div
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    className="inline-flex items-center gap-1.5 text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium mb-3"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />+{scannedTag.reward_points || 10} pts earned!
                  </motion.div>
                )}
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{scannedTag.site_name}</h2>
                {scannedTag.address && (
                  <div className="flex items-center justify-center gap-1.5 text-gray-400 text-xs mb-4">
                    <MapPin className="w-3.5 h-3.5" />{scannedTag.address}
                  </div>
                )}
                {scannedTag.description && (
                  <p className="text-gray-600 dark:text-slate-300 text-sm leading-relaxed mb-6">{scannedTag.description}</p>
                )}
                <Button onClick={reset} className="w-full rounded-2xl bg-indigo-600 hover:bg-indigo-700">
                  Scan Another
                </Button>
              </div>
            </div>
          ) : null}
        </motion.div>
      </div>
    );
  }

  // Manual entry
  if (mode === 'manual') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Enter Tag ID</h2>
            <p className="text-gray-400 text-sm mb-5">Type or paste the ID from the tag or barcode label.</p>
            <form onSubmit={(e) => { e.preventDefault(); lookupTag(manualInput); }}>
              <Input
                autoFocus
                placeholder="e.g. FT-0042"
                value={manualInput}
                onChange={e => setManualInput(e.target.value)}
                className="mb-4"
              />
              <Button type="submit" disabled={!manualInput.trim()} className="w-full rounded-2xl bg-indigo-600 hover:bg-indigo-700 mb-3">
                Look Up Tag
              </Button>
              <button type="button" onClick={() => setMode('home')} className="w-full text-center text-sm text-gray-400 hover:text-gray-600">
                Cancel
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    );
  }

  // Home
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      {/* Hero */}
      <div className="relative bg-gradient-to-br from-indigo-950 via-indigo-900 to-purple-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1569761316261-9a8696fa2ca3?w=1600&q=80)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
        <div className="relative z-10 max-w-2xl mx-auto px-6 py-16 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="w-20 h-20 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mx-auto mb-5">
              <QrCode className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-3">Scan & Discover</h1>
            <p className="text-white/70 text-base mb-8 leading-relaxed">
              Find AirTags and barcodes placed throughout Philadelphia. Scan them to unlock hidden history and earn points.
            </p>

            {user && (
              <div className="flex items-center justify-center gap-2 bg-white/10 border border-white/20 rounded-2xl px-5 py-3 mb-6 w-fit mx-auto">
                <Star className="w-4 h-4 text-yellow-400" />
                <span className="text-white font-semibold">{totalPoints} pts</span>
                <span className="text-white/50 text-sm">· {userScans.length} tags found</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={startCamera}
                size="lg"
                className="bg-white text-indigo-900 hover:bg-white/90 font-bold px-8 rounded-full"
              >
                <Camera className="w-5 h-5 mr-2" />Scan with Camera
              </Button>
              <Button
                onClick={() => setMode('manual')}
                size="lg"
                variant="outline"
                className="border-white/40 text-white bg-white/10 hover:bg-white/20 px-8 rounded-full"
              >
                Enter ID Manually
              </Button>
            </div>

            {!user && (
              <p className="mt-4 text-white/50 text-sm">
                <button onClick={() => base44.auth.redirectToLogin(window.location.href)} className="underline text-white/70 hover:text-white">Sign in</button> to track your scans & earn points
              </p>
            )}
          </motion.div>
        </div>
      </div>

      {/* Recent scans */}
      {user && userScans.length > 0 && (
        <div className="max-w-2xl mx-auto px-6 py-12">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Your Scans</h2>
          <div className="space-y-3">
            {userScans.slice().reverse().map(scan => (
              <div key={scan.id} className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800">
                <div className="w-9 h-9 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center flex-shrink-0">
                  <QrCode className="w-4 h-4 text-indigo-600 dark:text-indigo-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900 dark:text-white text-sm truncate">{scan.site_name}</div>
                  <div className="text-xs text-gray-400">{scan.tag_id}</div>
                </div>
                <div className="text-sm font-semibold text-indigo-600 dark:text-indigo-300 flex-shrink-0">
                  +{scan.points_earned || 10} pts
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* How it works */}
      <div className="max-w-2xl mx-auto px-6 py-12 border-t border-gray-100 dark:border-slate-800">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 text-center">How It Works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { step: '1', title: 'Find a Tag', desc: 'Look for AirTags or barcodes at Philadelphia heritage sites.' },
            { step: '2', title: 'Scan It', desc: 'Use your camera or enter the ID manually.' },
            { step: '3', title: 'Earn Points', desc: 'Unlock history and collect points for every new discovery.' },
          ].map((item, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="flex flex-col items-center text-center p-5 rounded-2xl bg-indigo-50 dark:bg-slate-800">
              <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-lg mb-3">{item.step}</div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{item.title}</h3>
              <p className="text-sm text-gray-500 dark:text-slate-400">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}