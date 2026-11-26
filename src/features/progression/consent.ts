// Lightweight opt-in check for the application shell and existing learning modules.
export const PROGRESSION_CONSENT = 'lernhub:learning-progress-consent:v1';
export const PROGRESSION_CONSENT_EVENT = 'lernhub:progression-consent';
export const REVOCATION_PENDING = 'revocation-pending';

function marker(): string | null {
  try { return window.localStorage.getItem(PROGRESSION_CONSENT); }
  catch { return null; }
}

export function readConsent(): string | null {
  const value = marker();
  return value && /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/.test(value) ? value : null;
}

export function deletionPending(): boolean {
  return marker() === REVOCATION_PENDING;
}
