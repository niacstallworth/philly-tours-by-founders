# Migrating Base44 Web App → Self-Hosted at philly-tours.com

## Architecture Overview

```
philly-tours.com          → Vite + React (this Base44 export)
api.philly-tours.com:4000 → server/sync-server.js  (Stripe, IAP, entitlements)
                          → Supabase (tours, hunts, sites, products, user data)
```

The sync-server handles ONLY payments/entitlements. All content data goes directly to Supabase.

---

## Step 1: Create a New Vite Project (or use GitHub sync)

Enable **Settings → GitHub Sync** in Base44 to push this source to your repo.

Then in the exported repo root, add a `vite.config.js` if missing:
```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
})
```

---

## Step 2: Replace `api/base44Client.js`

Create a new API client that talks to Supabase directly + your sync-server:

```js
// api/phillyToursClient.js
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY
const SYNC_SERVER_URL = import.meta.env.VITE_SYNC_SERVER_URL || 'https://api.philly-tours.com'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Entity CRUD — mirrors base44.entities.X.list() / .filter() / .create() / .update() / .delete()
function makeEntity(tableName) {
  return {
    list: (sort = '-created_at', limit = 100) =>
      supabase.from(tableName).select('*').order('created_at', { ascending: false }).limit(limit).then(r => r.data || []),

    filter: (filters, sort = '-created_at', limit = 100) =>
      supabase.from(tableName).select('*').match(filters).order('created_at', { ascending: false }).limit(limit).then(r => r.data || []),

    get: (id) =>
      supabase.from(tableName).select('*').eq('id', id).single().then(r => r.data),

    create: (data) =>
      supabase.from(tableName).insert(data).select().single().then(r => r.data),

    bulkCreate: (rows) =>
      supabase.from(tableName).insert(rows).select().then(r => r.data || []),

    update: (id, data) =>
      supabase.from(tableName).update(data).eq('id', id).select().single().then(r => r.data),

    delete: (id) =>
      supabase.from(tableName).delete().eq('id', id).then(() => {}),

    subscribe: (callback) => {
      const channel = supabase.channel(`${tableName}-changes`)
        .on('postgres_changes', { event: '*', schema: 'public', table: tableName }, payload => {
          callback({ type: payload.eventType, id: payload.new?.id || payload.old?.id, data: payload.new })
        })
        .subscribe()
      return () => supabase.removeChannel(channel)
    }
  }
}

// Auth — uses Supabase Auth (swap base44.auth.me() etc.)
export const phillyAuth = {
  me: async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null
    // Merge user_profiles data
    const { data: profile } = await supabase.from('users').select('*').eq('id', user.id).single()
    return { ...user, ...profile, email: user.email }
  },
  logout: (redirectUrl) => {
    supabase.auth.signOut().then(() => {
      window.location.href = redirectUrl || '/'
    })
  },
  redirectToLogin: (nextUrl) => {
    window.location.href = `/login?next=${encodeURIComponent(nextUrl || window.location.href)}`
  },
  isAuthenticated: async () => {
    const { data: { session } } = await supabase.auth.getSession()
    return !!session
  },
  updateMe: async (data) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')
    const { data: updated } = await supabase.from('users').upsert({ id: user.id, ...data }).select().single()
    return updated
  }
}

// Integrations — calls your sync-server or direct services
export const phillyIntegrations = {
  Core: {
    SendEmail: async ({ to, subject, body }) => {
      // Use your own email service (Resend, SendGrid, etc.)
      // Or proxy through sync-server: POST /api/send-email
      return fetch(`${SYNC_SERVER_URL}/api/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, subject, body })
      }).then(r => r.json())
    },
    UploadFile: async ({ file }) => {
      const fileName = `${Date.now()}-${file.name}`
      const { data } = await supabase.storage.from('uploads').upload(fileName, file)
      const { data: { publicUrl } } = supabase.storage.from('uploads').getPublicUrl(fileName)
      return { file_url: publicUrl }
    },
    InvokeLLM: async (params) => {
      // Proxy to your backend or call Anthropic directly
      return fetch(`${SYNC_SERVER_URL}/api/llm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      }).then(r => r.json())
    }
  }
}

// Checkout — proxies to sync-server (already built)
export const phillyCheckout = {
  createSession: async ({ amount, title, planId, successUrl, cancelUrl }) => {
    const { data: { session } } = await supabase.auth.getSession()
    return fetch(`${SYNC_SERVER_URL}/checkout/session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': session?.user?.id || 'guest'
      },
      body: JSON.stringify({ amount, title, planId, successUrl, cancelUrl })
    }).then(r => r.json())
  }
}

// Main client — drop-in replacement for base44
export const phillyCli = {
  entities: {
    Tour: makeEntity('tours'),
    ScavengerHunt: makeEntity('scavenger_hunts'),
    HeritageSite: makeEntity('heritage_sites'),
    Product: makeEntity('products'),
    HomePageSettings: makeEntity('homepage_settings'),
    UserProfile: makeEntity('user_profiles'),
    HuntProgress: makeEntity('hunt_progress'),
    TagScan: makeEntity('tag_scans'),
    LocationTag: makeEntity('location_tags'),
    Badge: makeEntity('badges'),
    UserBadge: makeEntity('user_badges'),
    Redemption: makeEntity('redemptions'),
    MultiplayerSession: makeEntity('multiplayer_sessions'),
    SessionPlayer: makeEntity('session_players'),
    User: makeEntity('users'),
  },
  auth: phillgyAuth,
  integrations: phillgIntegrations,
}
```

---

## Step 3: Supabase Table Names

Your Base44 entity names map to Supabase tables like this:

| Base44 Entity        | Supabase Table         |
|----------------------|------------------------|
| Tour                 | tours                  |
| ScavengerHunt        | scavenger_hunts        |
| HeritageSite         | heritage_sites         |
| Product              | products               |
| HomePageSettings     | homepage_settings      |
| UserProfile          | user_profiles          |
| HuntProgress         | hunt_progress          |
| TagScan              | tag_scans              |
| LocationTag          | location_tags          |
| Badge                | badges                 |
| UserBadge            | user_badges            |
| Redemption           | redemptions            |
| MultiplayerSession   | multiplayer_sessions   |
| SessionPlayer        | session_players        |

Create these tables in Supabase matching the entity JSON schemas in `entities/`.

---

## Step 4: Swap Imports

In every page/component, replace:
```js
import { base44 } from '@/api/base44Client'
// base44.entities.Tour.list()
// base44.auth.me()
```
With:
```js
import { phillyCli } from '@/api/phillyToursClient'
// phillyCli.entities.Tour.list()
// phillyCli.auth.me()
```

Or do a global find+replace: `base44` → `phillyCli`

---

## Step 5: Environment Variables (.env)

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_SYNC_SERVER_URL=https://api.philly-tours.com
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
```

---

## Step 6: Build & Deploy

```bash
npm install
npm run build
# Deploy /dist to Vercel, Netlify, Caddy, nginx, etc.
```

Your `server/sync-server.js` already has:
- `deploy/Caddyfile.api.example`
- `deploy/philly-tours-sync.service.example`
- Full Stripe checkout + webhook handling
- Apple IAP + Google Play verification

No changes needed to the sync-server for the web app.

---

## What Needs to Be Added to sync-server (optional)

The sync-server currently has NO content endpoints. If you want SSR or server-side data fetching, add:
- `GET /api/tours` → Supabase query
- `GET /api/hunts` → Supabase query
- etc.

But for a pure SPA (Vite build), the frontend queries Supabase directly — no server needed for content.