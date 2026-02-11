// OMNIBRAIN instrumentation helpers

import { logEvent } from '../instrumentation/logger';
import { EventType } from '../types';
import { getCurrentContext } from '../instrumentation/context';
import { IntelligenceMode } from './modes';
import { ContextScope } from './contextScope';

export async function logOmniBrainOpen(): Promise<void> {
  const context = getCurrentContext();
  await logEvent(EventType.NAVIGATION, {
    ...context,
    toScreen: 'omnibrain',
  });
}

export async function logOmniBrainSubmit(
  query: string,
  scope: ContextScope,
  mode: IntelligenceMode
): Promise<void> {
  const context = getCurrentContext();
  await logEvent(EventType.BUTTON_CLICK, {
    ...context,
    state: {
      action: 'omnibrain_submit',
      query: query.substring(0, 100), // Truncate for storage
      scope,
      mode,
    },
  });
}
