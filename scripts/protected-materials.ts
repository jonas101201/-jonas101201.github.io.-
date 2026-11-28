import { lstat, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';

export async function assertNoProtectedMaterialAssets(publicDir: string) {
  const materials = resolve(publicDir, 'materials');
  const info = await lstat(materials).catch((error: unknown) => {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') return null;
    throw error;
  });
  if (!info) return;
  if (!info.isDirectory() ||
      (await readdir(materials, { recursive: true, withFileTypes: true })).some(entry => !entry.isDirectory())) {
    throw new Error('Geschützte Materialien befinden sich im öffentlichen Vite-Verzeichnis. Verwende .material-check zur lokalen Prüfung.');
  }
}
