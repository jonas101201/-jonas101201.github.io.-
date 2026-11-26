import { describe, expect, it } from 'vitest';
import { emptyState } from '../src/features/progression/engine';
import { MAX_BACKUP_BYTES, parseProgressBackup } from '../src/features/progression/storage';

describe('Local Progress backup', () => {
  const backup = { format: 'lernhub-progress', version: 1, exportedAt: '2026-11-26T12:00:00.000Z', state: emptyState() };
  it('accepts the versioned archive and does not require an answer text', () => {
    expect(parseProgressBackup(JSON.stringify(backup))).toEqual(backup);
  });
  it('rejects unknown versions, malformed JSON, extra fields, large files and a forged balance', () => {
    for (const input of [
      '{"broken":', JSON.stringify({ ...backup, version: 2 }),
      JSON.stringify({ ...backup, state: { ...backup.state, credits: 1000 } }),
      JSON.stringify({ ...backup, executable: 'alert(1)' }),
      ' '.repeat(MAX_BACKUP_BYTES + 1),
    ]) expect(() => parseProgressBackup(input)).toThrow();
  });
});
