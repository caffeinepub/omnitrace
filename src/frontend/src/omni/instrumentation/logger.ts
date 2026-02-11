// Centralized event logging API

import { appendEvent } from '../storage/ledger';
import { OmniEvent, EventType, Confidence, EventContext } from '../types';

export async function logEvent(
  type: EventType,
  context: EventContext,
  additional?: Partial<OmniEvent>
): Promise<void> {
  const now = Date.now();
  const event: OmniEvent = {
    id: `event-${type}-${now}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    timestamp: now,
    context,
    confidence: Confidence.AUTO,
    ...additional,
  };

  await appendEvent(event);
}
