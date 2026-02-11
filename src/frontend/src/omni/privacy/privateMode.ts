// Local-only Private Mode state management

import { useState, useEffect } from 'react';

const PRIVATE_MODE_KEY = 'omnitrace_private_mode';

export function usePrivateMode() {
  const [isPrivate, setIsPrivate] = useState(() => {
    const stored = localStorage.getItem(PRIVATE_MODE_KEY);
    return stored === 'true';
  });

  useEffect(() => {
    localStorage.setItem(PRIVATE_MODE_KEY, isPrivate.toString());
  }, [isPrivate]);

  const toggle = () => setIsPrivate(prev => !prev);

  return {
    isPrivate,
    toggle,
    enable: () => setIsPrivate(true),
    disable: () => setIsPrivate(false),
  };
}
