// Startup initialization with storage readiness check

import { storage } from '../storage/idb';
import { performRecovery } from '../storage/recovery';
import { sessionTracker } from './sessionTracker';

export async function initializeSession(): Promise<void> {
  // Ensure storage is initialized before any operations
  await storage.init();
  
  // Perform recovery checks
  await performRecovery();
  
  // Start new session
  await sessionTracker.startSession();
  
  // Initialize session tracker
  sessionTracker.init();
}
