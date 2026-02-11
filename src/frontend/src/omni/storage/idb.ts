// IndexedDB persistence layer with idempotent initialization and crash-safe operations

import { OmniEvent, Session, StorageMetadata, SCHEMA_VERSION } from '../types';

const DB_NAME = 'omnitrace';
const DB_VERSION = 1;

const STORES = {
  EVENTS: 'events',
  SESSIONS: 'sessions',
  METADATA: 'metadata',
};

class IDBStorage {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<void> | null = null;

  async init(): Promise<void> {
    // Idempotent initialization - return existing promise if already initializing
    if (this.initPromise) {
      return this.initPromise;
    }

    // If already initialized, return immediately
    if (this.db) {
      return Promise.resolve();
    }

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        this.initPromise = null;
        reject(request.error);
      };
      
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Events store with time index
        if (!db.objectStoreNames.contains(STORES.EVENTS)) {
          const eventStore = db.createObjectStore(STORES.EVENTS, { keyPath: 'id' });
          eventStore.createIndex('timestamp', 'timestamp', { unique: false });
          eventStore.createIndex('type', 'type', { unique: false });
          eventStore.createIndex('category', 'category', { unique: false });
        }

        // Sessions store
        if (!db.objectStoreNames.contains(STORES.SESSIONS)) {
          const sessionStore = db.createObjectStore(STORES.SESSIONS, { keyPath: 'id' });
          sessionStore.createIndex('startTime', 'startTime', { unique: false });
        }

        // Metadata store
        if (!db.objectStoreNames.contains(STORES.METADATA)) {
          db.createObjectStore(STORES.METADATA, { keyPath: 'key' });
        }
      };
    });

    return this.initPromise;
  }

  async deleteDatabase(): Promise<void> {
    // Close existing connection
    if (this.db) {
      this.db.close();
      this.db = null;
    }
    
    // Reset init promise
    this.initPromise = null;

    return new Promise((resolve, reject) => {
      const request = indexedDB.deleteDatabase(DB_NAME);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
      request.onblocked = () => {
        console.warn('Database deletion blocked');
        // Resolve anyway to allow retry
        resolve();
      };
    });
  }

  async addEvent(event: OmniEvent): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction([STORES.EVENTS, STORES.METADATA], 'readwrite');
      
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);

      const eventStore = tx.objectStore(STORES.EVENTS);
      eventStore.add(event);

      // Update metadata
      const metaStore = tx.objectStore(STORES.METADATA);
      const metaRequest = metaStore.get('main');
      metaRequest.onsuccess = () => {
        const meta: StorageMetadata = metaRequest.result || {
          schemaVersion: SCHEMA_VERSION,
          eventCount: 0,
        };
        meta.eventCount++;
        metaStore.put({ key: 'main', ...meta });
      };
    });
  }

  async addEvents(events: OmniEvent[]): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction([STORES.EVENTS, STORES.METADATA], 'readwrite');
      
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);

      const eventStore = tx.objectStore(STORES.EVENTS);
      events.forEach(event => eventStore.add(event));

      const metaStore = tx.objectStore(STORES.METADATA);
      const metaRequest = metaStore.get('main');
      metaRequest.onsuccess = () => {
        const meta: StorageMetadata = metaRequest.result || {
          schemaVersion: SCHEMA_VERSION,
          eventCount: 0,
        };
        meta.eventCount += events.length;
        metaStore.put({ key: 'main', ...meta });
      };
    });
  }

  async getEventsByTimeRange(startTime: number, endTime: number): Promise<OmniEvent[]> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(STORES.EVENTS, 'readonly');
      const store = tx.objectStore(STORES.EVENTS);
      const index = store.index('timestamp');
      const range = IDBKeyRange.bound(startTime, endTime);
      const request = index.getAll(range);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllEvents(): Promise<OmniEvent[]> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(STORES.EVENTS, 'readonly');
      const store = tx.objectStore(STORES.EVENTS);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async addSession(session: Session): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(STORES.SESSIONS, 'readwrite');
      const store = tx.objectStore(STORES.SESSIONS);
      const request = store.add(session);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async updateSession(session: Session): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(STORES.SESSIONS, 'readwrite');
      const store = tx.objectStore(STORES.SESSIONS);
      const request = store.put(session);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getLastSession(): Promise<Session | null> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(STORES.SESSIONS, 'readonly');
      const store = tx.objectStore(STORES.SESSIONS);
      const index = store.index('startTime');
      const request = index.openCursor(null, 'prev');

      request.onsuccess = () => {
        const cursor = request.result;
        resolve(cursor ? cursor.value : null);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getAllSessions(): Promise<Session[]> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(STORES.SESSIONS, 'readonly');
      const store = tx.objectStore(STORES.SESSIONS);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getMetadata(): Promise<StorageMetadata> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(STORES.METADATA, 'readonly');
      const store = tx.objectStore(STORES.METADATA);
      const request = store.get('main');

      request.onsuccess = () => {
        resolve(request.result || {
          schemaVersion: SCHEMA_VERSION,
          eventCount: 0,
        });
      };
      request.onerror = () => reject(request.error);
    });
  }

  async wipeAll(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction([STORES.EVENTS, STORES.SESSIONS, STORES.METADATA], 'readwrite');
      
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);

      tx.objectStore(STORES.EVENTS).clear();
      tx.objectStore(STORES.SESSIONS).clear();
      tx.objectStore(STORES.METADATA).clear();
    });
  }
}

export const storage = new IDBStorage();
