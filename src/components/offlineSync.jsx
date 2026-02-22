/**
 * Offline caching using IndexedDB
 * Caches heritage sites, scan history, and syncs when online
 */

class OfflineDB {
  constructor() {
    this.db = null;
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('HeritageAR', 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        if (!db.objectStoreNames.contains('heritage_sites')) {
          db.createObjectStore('heritage_sites', { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains('scan_history')) {
          const scansStore = db.createObjectStore('scan_history', { keyPath: 'id', autoIncrement: true });
          scansStore.createIndex('synced', 'synced', { unique: false });
        }

        if (!db.objectStoreNames.contains('ar_overlays')) {
          db.createObjectStore('ar_overlays', { keyPath: 'site_id' });
        }
      };
    });
  }

  async addHeritageSites(sites) {
    const tx = this.db.transaction('heritage_sites', 'readwrite');
    const store = tx.objectStore('heritage_sites');
    
    sites.forEach(site => store.put(site));

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async getHeritageSites() {
    const tx = this.db.transaction('heritage_sites', 'readonly');
    return new Promise((resolve, reject) => {
      const request = tx.objectStore('heritage_sites').getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async addScan(scan) {
    const tx = this.db.transaction('scan_history', 'readwrite');
    const scanRecord = { ...scan, timestamp: Date.now(), synced: false };

    return new Promise((resolve, reject) => {
      const request = tx.objectStore('scan_history').add(scanRecord);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getPendingScans() {
    const tx = this.db.transaction('scan_history', 'readonly');
    return new Promise((resolve, reject) => {
      const request = tx.objectStore('scan_history').index('synced').getAll(false);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async markScanSynced(scanId) {
    const tx = this.db.transaction('scan_history', 'readwrite');
    const store = tx.objectStore('scan_history');

    return new Promise((resolve, reject) => {
      const getRequest = store.get(scanId);
      getRequest.onsuccess = () => {
        const scan = getRequest.result;
        if (scan) {
          scan.synced = true;
          store.put(scan);
          resolve();
        }
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async getScanHistory() {
    const tx = this.db.transaction('scan_history', 'readonly');
    return new Promise((resolve, reject) => {
      const request = tx.objectStore('scan_history').getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
}

let offlineDB = null;

export async function getOfflineDB() {
  if (!offlineDB) {
    offlineDB = new OfflineDB();
    await offlineDB.init();
  }
  return offlineDB;
}

export function isOnline() {
  return navigator.onLine;
}

export function onOnline(callback) {
  window.addEventListener('online', callback);
  return () => window.removeEventListener('online', callback);
}

export function onOffline(callback) {
  window.addEventListener('offline', callback);
  return () => window.removeEventListener('offline', callback);
}

export async function syncPendingScans(syncFunction) {
  const db = await getOfflineDB();
  const pendingScans = await db.getPendingScans();

  if (pendingScans.length === 0) return { synced: 0, failed: 0 };

  let synced = 0;
  let failed = 0;

  for (const scan of pendingScans) {
    try {
      await syncFunction(scan);
      await db.markScanSynced(scan.id);
      synced++;
    } catch (error) {
      console.error('Sync failed:', error);
      failed++;
    }
  }

  return { synced, failed };
}

export async function preloadHeritageSites(sites) {
  const db = await getOfflineDB();
  await db.addHeritageSites(sites);
}

export async function getCachedHeritageSites() {
  try {
    const db = await getOfflineDB();
    return await db.getHeritageSites();
  } catch (error) {
    console.error('Cache read failed:', error);
    return [];
  }
}