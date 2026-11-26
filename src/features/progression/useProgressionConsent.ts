import { useSyncExternalStore } from 'react';
import { PROGRESSION_CONSENT, PROGRESSION_CONSENT_EVENT, readConsent } from './consent';

function subscribe(listener: () => void) {
  const sync = (event: StorageEvent) => {
    if (event.key === null || event.key === PROGRESSION_CONSENT) listener();
  };
  window.addEventListener('storage', sync);
  window.addEventListener(PROGRESSION_CONSENT_EVENT, listener);
  return () => {
    window.removeEventListener('storage', sync);
    window.removeEventListener(PROGRESSION_CONSENT_EVENT, listener);
  };
}

export function useProgressionConsent() {
  return useSyncExternalStore(subscribe, readConsent);
}
