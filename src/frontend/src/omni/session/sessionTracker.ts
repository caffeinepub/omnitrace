// Session lifecycle tracking using visibility/focus signals

import { storage } from '../storage/idb';
import { appendEvent } from '../storage/ledger';
import { Session, EventType, Confidence, OmniEvent } from '../types';

class SessionTracker {
  private currentSession: Session | null = null;
  private isVisible = true;

  async startSession(): Promise<void> {
    const now = Date.now();
    this.currentSession = {
      id: `session-${now}`,
      startTime: now,
    };

    await storage.addSession(this.currentSession);
    
    const event: OmniEvent = {
      id: `event-session-start-${now}`,
      type: EventType.SESSION_START,
      timestamp: now,
      context: { state: { sessionId: this.currentSession.id } },
      confidence: Confidence.AUTO,
    };
    
    await appendEvent(event);
  }

  async endSession(): Promise<void> {
    if (!this.currentSession) return;

    const now = Date.now();
    this.currentSession.endTime = now;
    await storage.updateSession(this.currentSession);

    const event: OmniEvent = {
      id: `event-session-end-${now}`,
      type: EventType.SESSION_END,
      timestamp: now,
      context: { state: { sessionId: this.currentSession.id } },
      confidence: Confidence.AUTO,
    };
    
    await appendEvent(event);
    this.currentSession = null;
  }

  async handleVisibilityChange(): Promise<void> {
    const now = Date.now();
    const isVisible = document.visibilityState === 'visible';

    if (isVisible && !this.isVisible) {
      // Foreground
      const event: OmniEvent = {
        id: `event-foreground-${now}`,
        type: EventType.FOREGROUND,
        timestamp: now,
        context: {},
        confidence: Confidence.AUTO,
      };
      await appendEvent(event);
    } else if (!isVisible && this.isVisible) {
      // Background
      const event: OmniEvent = {
        id: `event-background-${now}`,
        type: EventType.BACKGROUND,
        timestamp: now,
        context: {},
        confidence: Confidence.AUTO,
      };
      await appendEvent(event);
    }

    this.isVisible = isVisible;
  }

  init(): void {
    document.addEventListener('visibilitychange', () => this.handleVisibilityChange());
    
    window.addEventListener('beforeunload', () => {
      if (this.currentSession) {
        this.endSession();
      }
    });
  }
}

export const sessionTracker = new SessionTracker();
