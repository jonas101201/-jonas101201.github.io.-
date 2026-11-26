import { z } from 'zod';
import { parseDraft } from '../blurting/analysis';
import { blurtingTaskById } from '../blurting/tasks';
import { applyAction, emptyState, stateSchema, type Action } from './engine';
import { deletionPending, PROGRESSION_CONSENT, readConsent, REVOCATION_PENDING } from './consent';

export const PROGRESSION_DB = 'lernhub-learning-progress';
export const MAX_BACKUP_BYTES = 20 * 1024 * 1024;
const DATABASE_VERSION = 1;
const PROGRESS_STORE = 'progress';
const DRAFT_STORE = 'drafts';
const CURRENT = 'current';
const TEXT_ACCESS = 'text-access';
const completedDraftKey = (topic: string) => 'finished:' + topic;
const epochSchema = z.uuid();
const topicSchema = z.string().regex(/^[A-Za-z0-9][A-Za-z0-9_.:/-]{0,159}$/);
const draftSchema = z.object({ topic: topicSchema, text: z.string().min(1).max(65_536) }).strict().refine(entry => {
  const task = blurtingTaskById.get(entry.topic.replace(/^completed:/, ''));
  const draft = task && parseDraft(entry.text, task.concepts);
  return Boolean(draft && (!entry.topic.startsWith('completed:') || draft.phase === 'compare'));
});
const draftLimit = 100;

const snapshotSchema = z.object({
  version: z.literal(1),
  epoch: epochSchema,
  revision: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER),
  allowTexts: z.boolean(),
  textGeneration: epochSchema,
  state: stateSchema,
}).strict();
export type ProgressSnapshot = z.infer<typeof snapshotSchema>;
export type SavedDraft = z.infer<typeof draftSchema>;

const backupSchema = z.object({
  format: z.literal('lernhub-progress'),
  version: z.literal(1),
  exportedAt: z.iso.datetime(),
  state: stateSchema,
  drafts: z.array(draftSchema).max(draftLimit).optional(),
}).strict().refine(backup => !backup.drafts || new Set(backup.drafts.map(draft => draft.topic)).size === backup.drafts.length);

export type ProgressBackup = z.infer<typeof backupSchema>;

export function parseProgressBackup(source: string): ProgressBackup {
  if (source.length > MAX_BACKUP_BYTES || new Blob([source]).size > MAX_BACKUP_BYTES) throw new Error('backup-size');
  const json: unknown = JSON.parse(source);
  return backupSchema.parse(json);
}

let databasePromise: Promise<IDBDatabase> | undefined;
function database(): Promise<IDBDatabase> {
  if (databasePromise) return databasePromise;
  const opened = new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(PROGRESSION_DB, DATABASE_VERSION);
    let blocked = false;
    request.onupgradeneeded = event => {
      if (event.oldVersion < 1) {
        request.result.createObjectStore(PROGRESS_STORE);
        request.result.createObjectStore(DRAFT_STORE, { keyPath: 'topic' });
      }
    };
    request.onblocked = () => { blocked = true; reject(new Error('database-blocked')); };
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      if (blocked) { db.close(); return; }
      const close = () => {
        if (databasePromise === opened) databasePromise = undefined;
        db.close();
      };
      db.onversionchange = close;
      db.onclose = close;
      resolve(db);
    };
  });
  databasePromise = opened;
  void opened.catch(() => { if (databasePromise === opened) databasePromise = undefined; });
  return opened;
}

function requestResult<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/** Keep every read, validation and write in one IndexedDB transaction. */
async function transact<T>(mode: IDBTransactionMode, run: (progress: IDBObjectStore, drafts: IDBObjectStore) => Promise<T>): Promise<T> {
  const db = await database();
  const tx = db.transaction([PROGRESS_STORE, DRAFT_STORE], mode);
  const settled = new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onabort = () => reject(tx.error ?? new Error('database-aborted'));
    tx.onerror = () => reject(tx.error ?? new Error('database-error'));
  });
  void settled.catch(() => {});
  try {
    const value = await run(tx.objectStore(PROGRESS_STORE), tx.objectStore(DRAFT_STORE));
    await settled;
    return value;
  } catch (error) {
    try { tx.abort(); } catch { /* The transaction may already have aborted. */ }
    throw error;
  }
}

async function current(store: IDBObjectStore, epoch: string): Promise<ProgressSnapshot | null> {
  if (readConsent() !== epoch) return null;
  const row: unknown = await requestResult(store.get(CURRENT));
  if (!row || readConsent() !== epoch) return null;
  const snapshot = snapshotSchema.parse(row);
  return snapshot.epoch === epoch ? snapshot : null;
}

export async function enableProgress(): Promise<ProgressSnapshot | null> {
  if (deletionPending()) throw new Error('retry-revocation');
  const previous = readConsent();
  const epoch = previous ?? crypto.randomUUID();
  if (!previous) localStorage.setItem(PROGRESSION_CONSENT, epoch);
  try {
    return await transact('readwrite', async (progress, drafts) => {
      const existing = await current(progress, epoch);
      if (existing) return existing;
      if (readConsent() !== epoch) return null;
      const snapshot: ProgressSnapshot = { version: 1, epoch, revision: 0, allowTexts: false, textGeneration: crypto.randomUUID(), state: emptyState() };
      await Promise.all([
        requestResult(drafts.clear()),
        requestResult(progress.put(snapshot, CURRENT)),
        requestResult(progress.put({ epoch, allowed: false, generation: snapshot.textGeneration }, TEXT_ACCESS)),
      ]);
      return snapshot;
    });
  } catch (error) {
    if (!previous && readConsent() === epoch) localStorage.removeItem(PROGRESSION_CONSENT);
    throw error;
  }
}

export function readProgressSnapshot(): Promise<ProgressSnapshot | null> {
  const epoch = readConsent();
  return epoch ? transact('readonly', progress => current(progress, epoch)) : Promise.resolve(null);
}

export async function revokeProgress(): Promise<void> {
  if (!readConsent() && !deletionPending()) return;
  localStorage.setItem(PROGRESSION_CONSENT, REVOCATION_PENDING);
  await transact('readwrite', async (progress, drafts) => {
    if (!deletionPending()) return;
    await Promise.all([requestResult(drafts.clear()), requestResult(progress.clear())]);
  });
  if (deletionPending()) localStorage.removeItem(PROGRESSION_CONSENT);
}

async function updateSnapshot(epoch: string | null, change: (snapshot: ProgressSnapshot, drafts: IDBObjectStore) => Promise<ProgressSnapshot>): Promise<ProgressSnapshot | null> {
  if (!epoch || readConsent() !== epoch) return null;
  return transact('readwrite', async (progress, drafts) => {
    const snapshot = await current(progress, epoch);
    if (!snapshot) return null;
    const changed = await change(snapshot, drafts);
    if (readConsent() !== epoch) throw new Error('consent-changed');
    if (changed === snapshot) return snapshot;
    const next = snapshotSchema.parse({ ...changed, revision: snapshot.revision + 1 });
    await requestResult(progress.put(next, CURRENT));
    if (changed.textGeneration !== snapshot.textGeneration) {
      const keys = await requestResult(progress.getAllKeys());
      for (const key of keys) {
        if (typeof key === 'string' && key.startsWith('finished:')) await requestResult(progress.delete(key));
      }
      await requestResult(progress.put({ epoch, allowed: changed.allowTexts, generation: changed.textGeneration }, TEXT_ACCESS));
    }
    return next;
  });
}

export function commitAction(action: Action, epoch = readConsent()): Promise<ProgressSnapshot | null> {
  return updateSnapshot(epoch, async snapshot => {
    const state = applyAction(snapshot.state, action);
    return state === snapshot.state ? snapshot : { ...snapshot, state };
  });
}

export function commitTextPreference(allowTexts: boolean, epoch = readConsent()): Promise<ProgressSnapshot | null> {
  return updateSnapshot(epoch, async (snapshot, drafts) => {
    if (!allowTexts) await requestResult(drafts.clear());
    return snapshot.allowTexts === allowTexts ? snapshot : { ...snapshot, allowTexts, textGeneration: crypto.randomUUID() };
  });
}

async function canAccessTexts(progress: IDBObjectStore, epoch: string, generation: string | null): Promise<boolean> {
  if (!generation || readConsent() !== epoch) return false;
  const permission: unknown = await requestResult(progress.get(TEXT_ACCESS));
  return readConsent() === epoch && Boolean(permission && typeof permission === 'object'
    && 'epoch' in permission && permission.epoch === epoch && 'generation' in permission && permission.generation === generation && 'allowed' in permission && permission.allowed === true);
}

export async function loadDraft(topic: string, epoch: string | null, generation: string | null): Promise<string | null> {
  if (!epoch || !topicSchema.safeParse(topic).success || readConsent() !== epoch) return null;
  return transact('readonly', async (progress, drafts) => {
    if (!await canAccessTexts(progress, epoch, generation)) return null;
    const draft = draftSchema.safeParse(await requestResult(drafts.get(topic)));
    return draft.success && readConsent() === epoch ? draft.data.text : null;
  });
}

export async function commitDraft(topic: string, text: string | null, epoch: string | null, generation: string | null): Promise<boolean> {
  if (!epoch || readConsent() !== epoch) return false;
  topicSchema.parse(topic);
  const entry = text ? draftSchema.parse({ topic, text }) : null;
  return transact('readwrite', async (progress, drafts) => {
    if (!await canAccessTexts(progress, epoch, generation)) return false;
    if (!entry) { await requestResult(drafts.delete(topic)); return true; }
    const task = blurtingTaskById.get(topic);
    const incomingId = task && parseDraft(entry.text, task.concepts)?.id;
    if (!incomingId) return false;
    const finishedIds: string[] | undefined = await requestResult(progress.get(completedDraftKey(topic)));
    if (finishedIds?.includes(incomingId)) return false;
    const existing = await requestResult(drafts.getKey(topic));
    if (!existing && await requestResult(drafts.count()) >= draftLimit) throw new Error('draft-limit');
    if (readConsent() !== epoch) return false;
    await requestResult(drafts.put(entry));
    return true;
  });
}

export async function finishDraft(topic: string, draftId: string, completedText: string | null, epoch: string | null, generation: string | null): Promise<boolean> {
  if (!epoch || readConsent() !== epoch) return false;
  const task = blurtingTaskById.get(topic);
  if (!task) return false;
  const entry = completedText === null ? null : draftSchema.parse({ topic: 'completed:' + topic, text: completedText });
  return transact('readwrite', async (progress, drafts) => {
    if (!await canAccessTexts(progress, epoch, generation)) return false;
    const old = draftSchema.safeParse(await requestResult(drafts.get(topic)));
    if (readConsent() !== epoch) return false;
    if (!old.success || parseDraft(old.data.text, task.concepts)?.id === draftId) {
      await requestResult(drafts.delete(topic));
    }
    if (entry) await requestResult(drafts.put(entry));
    const key = completedDraftKey(topic);
    const finishedIds: string[] = await requestResult(progress.get(key)) ?? [];
    if (!finishedIds.includes(draftId)) await requestResult(progress.put([...finishedIds, draftId], key));
    return true;
  });
}

export async function exportProgress(includeTexts = false, epoch = readConsent()): Promise<ProgressBackup | null> {
  if (!epoch || readConsent() !== epoch) return null;
  return transact('readonly', async (progress, drafts) => {
    const snapshot = await current(progress, epoch);
    if (!snapshot) return null;
    const entries = includeTexts && snapshot.allowTexts ? await requestResult(drafts.getAll()) : undefined;
    if (readConsent() !== epoch) return null;
    return backupSchema.parse({ format: 'lernhub-progress', version: 1, exportedAt: new Date().toISOString(), state: snapshot.state, drafts: entries });
  });
}

export async function importProgress(input: ProgressBackup, epoch = readConsent()): Promise<ProgressSnapshot | null> {
  const backup = backupSchema.parse(input);
  return updateSnapshot(epoch, async (snapshot, drafts) => {
    if (backup.drafts?.length && !snapshot.allowTexts) throw new Error('text-consent-required');
    await requestResult(drafts.clear());
    for (const entry of backup.drafts ?? []) await requestResult(drafts.put(entry));
    return { ...snapshot, state: backup.state, textGeneration: crypto.randomUUID() };
  });
}

export type PersistenceStatus = 'unsupported' | 'granted' | 'denied';
export async function requestBrowserPersistence(): Promise<PersistenceStatus> {
  if (!readConsent() || !navigator.storage?.persist || !navigator.storage?.persisted) return 'unsupported';
  if (await navigator.storage.persisted() || await navigator.storage.persist()) return 'granted';
  return 'denied';
}

export function sameProgress(a: ProgressSnapshot | null, b: ProgressSnapshot | null) {
  return a === b || Boolean(a && b && a.epoch === b.epoch && a.revision === b.revision);
}

