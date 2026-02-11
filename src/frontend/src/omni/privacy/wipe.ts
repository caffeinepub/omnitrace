// One-tap full wipe with startup recovery support

import { storage } from '../storage/idb';
import { appendEvent } from '../storage/ledger';
import { EventType, Confidence } from '../types';

export async function wipeAllData(): Promise<void> {
  const now = Date.now();
  
  // Log wipe event before wiping
  await appendEvent({
    id: `event-wipe-${now}`,
    type: EventType.WIPE,
    timestamp: now,
    context: {},
    confidence: Confidence.AUTO,
  });

  // Wipe everything
  await storage.wipeAll();
}

export async function wipeAllDataForRecovery(): Promise<void> {
  try {
    // Try normal wipe if storage is initialized
    await storage.wipeAll();
  } catch (error) {
    console.warn('Normal wipe failed, attempting database deletion:', error);
    
    // If storage is corrupted or not initialized, delete the database
    try {
      await storage.deleteDatabase();
    } catch (deleteError) {
      console.error('Database deletion failed:', deleteError);
      throw new Error('Failed to wipe data. Please try refreshing the page.');
    }
  }
}
