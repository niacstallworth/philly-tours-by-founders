import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Users, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function JoinSessionModal({ isOpen, onClose, onSessionJoined }) {
  const [sessionCode, setSessionCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleJoin = async () => {
    if (!sessionCode.trim()) {
      setError('Enter a session code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const user = await base44.auth.me();
      if (!user) {
        setError('You must be signed in');
        setLoading(false);
        return;
      }

      // Find session by code
      const sessions = await base44.entities.MultiplayerSession.filter({
        session_code: sessionCode.toUpperCase()
      });

      if (!sessions || sessions.length === 0) {
        setError('Session not found');
        setLoading(false);
        return;
      }

      const session = sessions[0];

      if (session.status !== 'active') {
        setError('This session is no longer active');
        setLoading(false);
        return;
      }

      if (session.player_count >= session.max_players) {
        setError('This session is full');
        setLoading(false);
        return;
      }

      // Check if already in session
      const existing = await base44.entities.SessionPlayer.filter({
        session_id: session.id,
        user_email: user.email
      });

      if (existing && existing.length > 0) {
        // Already joined, just navigate
        onSessionJoined(session);
        setLoading(false);
        return;
      }

      // Add player to session
      await base44.entities.SessionPlayer.create({
        session_id: session.id,
        user_email: user.email,
        user_name: user.full_name || user.email.split('@')[0],
        joined_at: new Date().toISOString()
      });

      // Update player count
      await base44.entities.MultiplayerSession.update(session.id, {
        player_count: (session.player_count || 1) + 1
      });

      toast.success('Joined multiplayer hunt!');
      onSessionJoined(session);
      setSessionCode('');
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to join session');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-600" />
            Join Hunt
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-gray-600 text-sm mb-6">
          Ask your friends for their session code to join a multiplayer hunt.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Session Code
            </label>
            <Input
              placeholder="e.g., HJ7K2M"
              value={sessionCode}
              onChange={(e) => {
                setSessionCode(e.target.value.toUpperCase());
                setError('');
              }}
              maxLength={6}
              className="text-center text-lg font-mono tracking-widest"
              disabled={loading}
            />
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleJoin}
              disabled={loading || !sessionCode.trim()}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Joining...
                </>
              ) : (
                'Join Hunt'
              )}
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}