import { useMemo, useSyncExternalStore } from 'react';
import { emptyState, type Action } from './engine';
import { deletionPending, PROGRESSION_CONSENT, PROGRESSION_CONSENT_EVENT, readConsent } from './consent';
import {
  commitAction, commitDraft, commitTextPreference, enableProgress, exportProgress, finishDraft,
  importProgress, loadDraft, readProgressSnapshot, requestBrowserPersistence, revokeProgress,
  sameProgress, type ProgressBackup, type ProgressSnapshot,
} from './storage';

type View = {
  record: ProgressSnapshot | null;
  ready: boolean;
  deletionPending: boolean;
  error: string | null;
};

const blank = emptyState();
const initial: View = { record: null, ready: false, deletionPending: false, error: null };
let view = initial;
let loadId = 0;
let broadcast: BroadcastChannel | null = null;
const listeners = new Set<() => void>();

function publish(next: View) {
  if (sameProgress(view.record, next.record) && view.ready === next.ready
    && view.deletionPending === next.deletionPending && view.error === next.error) return;
  view = next;
  for (const listener of listeners) listener();
}

function report(error: unknown) {
  const reason = error instanceof Error ? error.message : '';
  const message = reason === 'draft-limit' ? 'Es sind bereits 100 Abruftexte gespeichert.'
    : reason === 'text-consent-required' ? 'Für diese Sicherung muss die separate Textspeicherung aktiviert sein.'
      : error instanceof DOMException && error.name === 'QuotaExceededError' ? 'Der lokale Speicher ist voll.'
        : deletionPending() ? 'Die Speicherung ist aus. Das Löschen konnte nicht abgeschlossen werden.'
          : 'Der lokale Fortschrittsspeicher ist gerade nicht verfügbar.';
  publish({ ...view, error: message, deletionPending: deletionPending() });
}

async function refresh(clearError = false) {
  const id = ++loadId;
  const epoch = readConsent();
  try {
    const record = epoch ? await readProgressSnapshot() : null;
    if (id !== loadId || epoch !== readConsent()) return;
    publish({ record, ready: true, error: clearError ? null : view.error, deletionPending: deletionPending() });
  } catch (error) {
    if (id !== loadId || epoch !== readConsent()) return;
    publish({ ...view, record: view.record?.epoch === epoch ? view.record : null, ready: true });
    report(error);
  }
}

function announce() {
  window.dispatchEvent(new Event(PROGRESSION_CONSENT_EVENT));
  if (broadcast) broadcast.postMessage('changed');
  else if (typeof BroadcastChannel !== 'undefined') {
    try {
      const channel = new BroadcastChannel('lernhub-progress');
      channel.postMessage('changed');
      channel.close();
    } catch { /* The other tab can still refresh when it becomes visible. */ }
  }
}

function visibility() {
  if (document.visibilityState === 'visible') void refresh();
}

function storageChanged(event: StorageEvent) {
  if (event.key === PROGRESSION_CONSENT || event.key === null) void refresh(true);
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (listeners.size === 1) {
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        broadcast = new BroadcastChannel('lernhub-progress');
        broadcast.onmessage = () => { void refresh(); };
      } catch { /* Fall back to visibility and storage events. */ }
    }
    window.addEventListener('storage', storageChanged);
    document.addEventListener('visibilitychange', visibility);
    void refresh();
  }
  return () => {
    listeners.delete(listener);
    if (!listeners.size) {
      broadcast?.close();
      broadcast = null;
      window.removeEventListener('storage', storageChanged);
      document.removeEventListener('visibilitychange', visibility);
    }
  };
}

async function mutate<T>(operation: () => Promise<T>, notify = true): Promise<T | null> {
  try {
    const value = await operation();
    if (notify) {
      announce();
      await refresh(true);
    }
    return value;
  } catch (error) {
    await refresh();
    report(error);
    return null;
  }
}

export async function dispatchProgression(action: Action, epoch = readConsent()) {
  if (!epoch) return null;
  return (await mutate(() => commitAction(action, epoch)))?.state ?? null;
}

async function enable() {
  const result = await mutate(enableProgress);
  return result !== null;
}

async function revoke() {
  // Remove the active consent marker synchronously, before awaiting deletion.
  const deletion = revokeProgress();
  publish({ ...view, record: null, deletionPending: deletionPending() });
  window.dispatchEvent(new Event(PROGRESSION_CONSENT_EVENT));
  return (await mutate(async () => { await deletion; return true; })) ?? false;
}

export function useProgression() {
  const snapshot = useSyncExternalStore(subscribe, () => view, () => initial);
  const epoch = snapshot.record?.epoch ?? null;
  const textGeneration = snapshot.record?.allowTexts ? snapshot.record.textGeneration : null;
  const controls = useMemo(() => ({
    dispatch: (action: Action) => dispatchProgression(action, epoch),
    setAllowTexts: async (allowed: boolean) => Boolean(await mutate(() => commitTextPreference(allowed, epoch))),
    readDraft: (topic: string) => mutate(() => loadDraft(topic, epoch, textGeneration), false),
    saveDraft: async (topic: string, text: string | null) => (await mutate(() => commitDraft(topic, text, epoch, textGeneration), false)) ?? false,
    finishDraft: async (topic: string, id: string, completed: string | null) => (await mutate(() => finishDraft(topic, id, completed, epoch, textGeneration), false)) ?? false,
    makeBackup: (includeTexts = false) => mutate(() => exportProgress(includeTexts, epoch), false),
    restoreBackup: async (backup: ProgressBackup) => Boolean(await mutate(() => importProgress(backup, epoch))),
  }), [epoch, textGeneration]);
  return {
    state: snapshot.record?.state ?? blank,
    enabled: snapshot.record !== null,
    ready: snapshot.ready,
    error: snapshot.error,
    allowTexts: textGeneration !== null,
    textGeneration,
    deletionPending: snapshot.deletionPending,
    enable,
    revoke,
    requestPersistence: () => mutate(requestBrowserPersistence, false),
    ...controls,
  };
}
