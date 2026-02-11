// Idle/active detection based on user interaction signals

import { appendEvent } from '../storage/ledger';
import { EventType, Confidence, OmniEvent } from '../types';

class IdleDetector {
  private idleTimeout = 60000; // 1 minute
  private idleTimer: NodeJS.Timeout | null = null;
  private isIdle = false;

  private resetIdleTimer(): void {
    if (this.idleTimer) {
      clearTimeout(this.idleTimer);
    }

    if (this.isIdle) {
      this.markActive();
    }

    this.idleTimer = setTimeout(() => {
      this.markIdle();
    }, this.idleTimeout);
  }

  private async markIdle(): Promise<void> {
    if (this.isIdle) return;
    
    this.isIdle = true;
    const now = Date.now();
    
    const event: OmniEvent = {
      id: `event-idle-start-${now}`,
      type: EventType.IDLE_START,
      timestamp: now,
      context: {},
      confidence: Confidence.AUTO,
    };
    
    await appendEvent(event);
  }

  private async markActive(): Promise<void> {
    if (!this.isIdle) return;
    
    this.isIdle = false;
    const now = Date.now();
    
    const event: OmniEvent = {
      id: `event-idle-end-${now}`,
      type: EventType.IDLE_END,
      timestamp: now,
      context: {},
      confidence: Confidence.AUTO,
    };
    
    await appendEvent(event);
  }

  init(): void {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, () => this.resetIdleTimer(), true);
    });

    this.resetIdleTimer();
  }
}

export const idleDetector = new IdleDetector();
