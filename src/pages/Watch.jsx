import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Camera, X, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function Watch() {
  const [user, setUser] = useState(null);
  const [scanMode, setScanMode] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [scanResult, setScanResult] = useState(null);
  const [scanning, setScanning] = useState(false);
  const videoRef = useRef(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  const { data: userProfile } = useQuery({
    queryKey: ['user-profile'],
    queryFn: () => {
      if (!user?.email) return null;
      return base44.entities.UserProfile.filter({ user_email: user.email }).then(p => p[0]);
    },
    enabled: !!user?.email,
  });

  const scanTagMutation = useMutation({
    mutationFn: async (tagId) => {
      const tag = await base44.entities.LocationTag.filter({ tag_id: tagId }).then(t => t[0]);
      if (!tag) throw new Error('Tag not found');
      
      if (!user) {
        base44.auth.redirectToLogin(window.location.href);
        throw new Error('Not authenticated');
      }

      await base44.entities.TagScan.create({
        tag_id: tagId,
        user_email: user.email,
        site_name: tag.site_name,
        points_earned: tag.reward_points || 10,
      });

      return tag;
    },
    onSuccess: (tag) => {
      setScanResult({ success: true, tag });
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      setTimeout(() => {
        setScanResult(null);
        setScanMode(false);
        setManualInput('');
      }, 2000);
    },
    onError: (error) => {
      setScanResult({ success: false, error: error.message });
    }
  });

  const startCamera = async () => {
    try {
      setScanning(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      toast.error('Camera access denied');
      setScanning(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(t => t.stop());
    }
    setScanning(false);
  };

  const handleManualScan = async () => {
    if (!manualInput.trim()) return;
    scanTagMutation.mutate(manualInput.trim());
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col p-4 max-w-sm mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-bold">Heritage Scanner</h1>
        <a href="/" className="text-xs text-gray-400">← Back</a>
      </div>

      {/* Points Display */}
      {user && userProfile && (
        <div className="bg-indigo-900 rounded-lg p-4 mb-6 text-center border border-indigo-700">
          <div className="text-sm text-indigo-300 mb-1">Your Points</div>
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <span className="text-3xl font-bold">{userProfile.total_points || 0}</span>
          </div>
        </div>
      )}

      {!user && (
        <div className="bg-red-900/50 rounded-lg p-3 mb-6 text-center border border-red-700 text-sm">
          <button
            onClick={() => base44.auth.redirectToLogin(window.location.href)}
            className="underline text-red-300 font-semibold"
          >
            Sign in to scan
          </button>
        </div>
      )}

      {/* Scan Result */}
      {scanResult && (
        <div className={`rounded-lg p-4 mb-6 text-center text-sm ${
          scanResult.success ? 'bg-green-900/50 border border-green-700' : 'bg-red-900/50 border border-red-700'
        }`}>
          {scanResult.success ? (
            <>
              <CheckCircle className="w-6 h-6 mx-auto mb-2 text-green-400" />
              <div className="font-semibold">{scanResult.tag.site_name}</div>
              <div className="text-xs text-green-300 mt-1">+{scanResult.tag.reward_points || 10} points!</div>
            </>
          ) : (
            <>
              <AlertCircle className="w-6 h-6 mx-auto mb-2 text-red-400" />
              <div className="text-red-300">{scanResult.error}</div>
            </>
          )}
        </div>
      )}

      {/* Camera View */}
      {scanning ? (
        <div className="mb-6 flex-1 flex flex-col rounded-lg overflow-hidden bg-gray-900 border border-gray-700">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 border-2 border-indigo-500 rounded-lg pointer-events-none m-4" />
        </div>
      ) : null}

      {/* Manual Input */}
      {scanMode && !scanning && (
        <div className="space-y-3 mb-6">
          <Input
            placeholder="Enter tag ID"
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            className="text-base h-12 bg-gray-900 border-gray-700"
            onKeyPress={(e) => e.key === 'Enter' && handleManualScan()}
          />
          <Button
            onClick={handleManualScan}
            disabled={!user || !manualInput.trim() || scanTagMutation.isPending}
            className="w-full h-12 bg-green-600 hover:bg-green-700 text-base font-bold"
          >
            {scanTagMutation.isPending ? 'Scanning...' : 'Scan Tag'}
          </Button>
        </div>
      )}

      {/* Control Buttons */}
      <div className="flex gap-2">
        {!scanMode ? (
          <>
            <Button
              onClick={() => {
                setScanMode(true);
                startCamera();
              }}
              disabled={!user}
              className="flex-1 h-14 bg-indigo-600 hover:bg-indigo-700 text-base font-bold"
            >
              <Camera className="w-5 h-5 mr-2" />
              Camera
            </Button>
            <Button
              onClick={() => setScanMode(true)}
              className="flex-1 h-14 bg-indigo-600 hover:bg-indigo-700 text-base font-bold"
            >
              Manual
            </Button>
          </>
        ) : (
          <Button
            onClick={() => {
              stopCamera();
              setScanMode(false);
              setManualInput('');
            }}
            className="w-full h-14 bg-gray-700 hover:bg-gray-600 text-base font-bold"
          >
            <X className="w-5 h-5 mr-2" />
            Cancel
          </Button>
        )}
      </div>

      {/* Footer */}
      {!scanMode && (
        <div className="mt-auto pt-6 text-center text-xs text-gray-500 border-t border-gray-800">
          <p>Tap Camera or Manual to scan heritage sites</p>
        </div>
      )}
    </div>
  );
}