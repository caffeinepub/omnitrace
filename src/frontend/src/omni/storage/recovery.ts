// Startup recovery checks for unclosed sessions and intervals

import { storage } from './idb';
import { EventType, Confidence, OmniEvent } from '../types';

export async function performRecovery(): Promise<void> {
  const lastSession = await storage.getLastSession();
  
  if (lastSession && !lastSession.endTime) {
    // Unclosed session detected
    const recoveryTime = Date.now();
    
    // Close the session
    lastSession.endTime = recoveryTime;
    lastSession.recovered = true;
    await storage.updateSession(lastSession);

    // Add recovery event
    const recoveryEvent: OmniEvent = {
      id: `recovery-${recoveryTime}`,
      type: EventType.RECOVERY,
      timestamp: recoveryTime,
      context: {
        state: { reason: 'unclosed_session', sessionId: lastSession.id }
      },
      confidence: Confidence.AUTO,
      title: 'Session recovered',
    };
    
    await storage.addEvent(recoveryEvent);
  }
}
