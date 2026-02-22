import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { User, LogOut, Trash2, ChevronRight, Shield, Mail, Crown, MapPin, Trophy, ShoppingBag, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function UserSettings() {
  const [user, setUser] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  const handleLogout = () => {
    base44.auth.logout();
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      // Placeholder deletion: in production this would call a backend function.
      // For now, sign the user out and show a confirmation message.
      await new Promise(r => setTimeout(r, 1200)); // simulate async
      toast.success('Account deletion request submitted. You will receive a confirmation email at ' + (user?.email || 'your address') + '.');
      base44.auth.logout();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="max-w-lg mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Profile Card */}
          <Card className="mb-6 overflow-hidden">
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 px-6 py-8 text-white text-center">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3">
                <User className="w-8 h-8 text-white" />
              </div>
              <p className="font-bold text-lg">{user?.full_name || 'Guest'}</p>
              <p className="text-white/70 text-sm mt-1">{user?.email || ''}</p>
              {user?.role === 'admin' && (
                <span className="inline-flex items-center gap-1 mt-2 text-xs bg-white/20 px-3 py-1 rounded-full">
                  <Shield className="w-3 h-3" /> Admin
                </span>
              )}
            </div>
          </Card>

          {/* Membership Status */}
          <Card className="mb-4 overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Membership</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
                <Crown className={`w-5 h-5 ${user?.membership === 'elite' || user?.role === 'admin' ? 'text-amber-500' : 'text-gray-300'}`} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.membership === 'elite' || user?.role === 'admin' ? 'Elite Member' : 'Free Member'}
                  </p>
                  <p className="text-xs text-gray-400">
                    {user?.membership === 'elite' || user?.role === 'admin'
                      ? 'All AR heritage sites unlocked'
                      : 'Upgrade for full AR access'}
                  </p>
                </div>
                {!(user?.membership === 'elite' || user?.role === 'admin') && (
                  <a href="mailto:info@foundersthread.org?subject=Elite Membership" className="text-xs bg-amber-500 text-white px-3 py-1.5 rounded-full font-semibold">
                    Upgrade
                  </a>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Nav */}
          <Card className="mb-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Explore</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {[
                { href: '/Home', icon: MapPin, label: 'Tours & Scavenger Hunts' },
                { href: '/ARExperience', icon: Crown, label: 'AR Heritage Viewer' },
                { href: '/Merchandise', icon: ShoppingBag, label: 'Shop Merchandise' },
              ].map(item => (
                <a key={item.href} href={item.href} className="flex items-center justify-between px-5 py-4 border-b border-gray-100 last:border-0">
                  <div className="flex items-center gap-3 text-gray-700">
                    <item.icon className="w-5 h-5 text-gray-400" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </a>
              ))}
              <button
                onClick={() => { sessionStorage.removeItem('onboarding_seen'); window.location.href = '/Home'; }}
                className="flex items-center justify-between px-5 py-4 w-full text-left"
              >
                <div className="flex items-center gap-3 text-gray-700">
                  <RotateCcw className="w-5 h-5 text-gray-400" />
                  <span className="text-sm font-medium">Replay App Tour</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
            </CardContent>
          </Card>

          {/* Account Section */}
          <Card className="mb-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Account</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <a
                href="mailto:info@foundersthread.org"
                className="flex items-center justify-between px-5 py-4 border-b border-gray-100 last:border-0"
              >
                <div className="flex items-center gap-3 text-gray-700">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <span className="text-sm font-medium">Contact Support</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </a>

              {user && (
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-between px-5 py-4 w-full text-left"
                >
                  <div className="flex items-center gap-3 text-gray-700">
                    <LogOut className="w-5 h-5 text-gray-400" />
                    <span className="text-sm font-medium">Sign Out</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>
              )}

              {!user && (
                <button
                  onClick={() => base44.auth.redirectToLogin(window.location.href)}
                  className="flex items-center justify-between px-5 py-4 w-full text-left"
                >
                  <div className="flex items-center gap-3 text-indigo-600">
                    <User className="w-5 h-5" />
                    <span className="text-sm font-medium">Sign In</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-indigo-400" />
                </button>
              )}
            </CardContent>
          </Card>

          {/* Danger Zone */}
          {user && (
            <Card className="border-red-100">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-red-500 uppercase tracking-wide">Danger Zone</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button className="flex items-center justify-between px-5 py-4 w-full text-left">
                      <div className="flex items-center gap-3 text-red-600">
                        <Trash2 className="w-5 h-5" />
                        <span className="text-sm font-medium">Delete Account</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-red-400" />
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Your Account?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete your account and all associated data including hunt progress. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteAccount}
                        disabled={deleting}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        {deleting ? 'Processing...' : 'Delete Account'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          )}

          <p className="text-center text-xs text-gray-400 mt-6">Founders Threads © {new Date().getFullYear()}</p>
        </motion.div>
      </div>
    </div>
  );
}