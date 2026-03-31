/**
 * phillyToursClient.js
 * Drop-in replacement for base44Client when self-hosting at philly-tours.com
 *
 * Dependencies:
 *   npm install @supabase/supabase-js
 *
 * Env vars needed:
 *   VITE_SUPABASE_URL
 *   VITE_SUPABASE_ANON_KEY
 *   VITE_SYNC_SERVER_URL  (default: https://api.philly-tours.com)
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const SYNC_SERVER_URL =
  import.meta.env.VITE_SYNC_SERVER_URL || 'https://api.philly-tours.com';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ─── Entity CRUD ─────────────────────────────────────────────────────────────
// Mirrors: base44.entities.X.list() / .filter() / .get() / .create() / .update() / .delete() / .subscribe()

function makeEntity(tableName) {
  return {
    list: async (_sort = '-created_at', limit = 100) => {
      const { data } = await supabase
        .from(tableName)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);
      return data || [];
    },

    filter: async (filters, _sort = '-created_at', limit = 100) => {
      const { data } = await supabase
        .from(tableName)
        .select('*')
        .match(filters)
        .order('created_at', { ascending: false })
        .limit(limit);
      return data || [];
    },

    get: async (id) => {
      const { data } = await supabase
        .from(tableName)
        .select('*')
        .eq('id', id)
        .single();
      return data;
    },

    create: async (row) => {
      const { data } = await supabase
        .from(tableName)
        .insert(row)
        .select()
        .single();
      return data;
    },

    bulkCreate: async (rows) => {
      const { data } = await supabase
        .from(tableName)
        .insert(rows)
        .select();
      return data || [];
    },

    update: async (id, updates) => {
      const { data } = await supabase
        .from(tableName)
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      return data;
    },

    delete: async (id) => {
      await supabase.from(tableName).delete().eq('id', id);
    },

    subscribe: (callback) => {
      const channel = supabase
        .channel(`${tableName}-realtime`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: tableName },
          (payload) => {
            const type =
              payload.eventType === 'INSERT'
                ? 'create'
                : payload.eventType === 'UPDATE'
                ? 'update'
                : 'delete';
            callback({
              type,
              id: payload.new?.id || payload.old?.id,
              data: payload.new || null,
            });
          }
        )
        .subscribe();
      return () => supabase.removeChannel(channel);
    },

    schema: () => {
      // Returns empty schema — used by JsonSchemaForm; override per entity if needed
      return {};
    },
  };
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
// Mirrors: base44.auth.me() / .logout() / .redirectToLogin() / .updateMe() / .isAuthenticated()

const auth = {
  me: async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();
    return { id: user.id, email: user.email, ...profile };
  },

  logout: (redirectUrl) => {
    supabase.auth.signOut().then(() => {
      window.location.href = redirectUrl || '/';
    });
  },

  redirectToLogin: (nextUrl) => {
    window.location.href = `/login?next=${encodeURIComponent(
      nextUrl || window.location.href
    )}`;
  },

  isAuthenticated: async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return !!session;
  },

  updateMe: async (updates) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    const { data } = await supabase
      .from('users')
      .upsert({ id: user.id, ...updates })
      .select()
      .single();
    return data;
  },
};

// ─── Integrations ─────────────────────────────────────────────────────────────
// Mirrors: base44.integrations.Core.SendEmail / UploadFile / InvokeLLM

const integrations = {
  Core: {
    SendEmail: async ({ to, subject, body, from_name }) => {
      const res = await fetch(`${SYNC_SERVER_URL}/api/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, subject, body, from_name }),
      });
      return res.json();
    },

    UploadFile: async ({ file }) => {
      const ext = file.name?.split('.').pop() || 'bin';
      const path = `uploads/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      await supabase.storage.from('public').upload(path, file);
      const { data: { publicUrl } } = supabase.storage
        .from('public')
        .getPublicUrl(path);
      return { file_url: publicUrl };
    },

    InvokeLLM: async (params) => {
      // Proxied through your sync-server → Anthropic
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const res = await fetch(`${SYNC_SERVER_URL}/api/llm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token
            ? { Authorization: `Bearer ${session.access_token}` }
            : {}),
        },
        body: JSON.stringify(params),
      });
      return res.json();
    },

    GenerateImage: async (params) => {
      const res = await fetch(`${SYNC_SERVER_URL}/api/generate-image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      return res.json();
    },
  },
};

// ─── Checkout (sync-server already handles this) ──────────────────────────────

const checkout = {
  createSession: async ({ amount, title, planId, successUrl, cancelUrl }) => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const res = await fetch(`${SYNC_SERVER_URL}/checkout/session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': session?.user?.id || 'guest',
      },
      body: JSON.stringify({ amount, title, planId, successUrl, cancelUrl }),
    });
    return res.json();
  },
};

// ─── Analytics ────────────────────────────────────────────────────────────────

const analytics = {
  track: ({ eventName, properties }) => {
    // Fire-and-forget to your sync-server or a third-party
    fetch(`${SYNC_SERVER_URL}/api/analytics`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event: eventName, properties }),
    }).catch(() => {});
  },
};

// ─── Main export — mirrors `base44` from base44Client.js ─────────────────────

export const phillyCli = {
  auth,
  integrations,
  analytics,
  checkout,
  entities: {
    Tour:                makeEntity('tours'),
    ScavengerHunt:       makeEntity('scavenger_hunts'),
    HeritageSite:        makeEntity('heritage_sites'),
    Product:             makeEntity('products'),
    HomePageSettings:    makeEntity('homepage_settings'),
    UserProfile:         makeEntity('user_profiles'),
    HuntProgress:        makeEntity('hunt_progress'),
    TagScan:             makeEntity('tag_scans'),
    LocationTag:         makeEntity('location_tags'),
    Badge:               makeEntity('badges'),
    UserBadge:           makeEntity('user_badges'),
    Redemption:          makeEntity('redemptions'),
    MultiplayerSession:  makeEntity('multiplayer_sessions'),
    SessionPlayer:       makeEntity('session_players'),
    User:                makeEntity('users'),
  },
};