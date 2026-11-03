import { createHash } from 'node:crypto';
import { copyFile, lstat, mkdir, readFile, realpath } from 'node:fs/promises';
import { dirname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const project = fileURLToPath(new URL('../', import.meta.url));
const args = process.argv.slice(2);
function option(name, fallback) {
  const i = args.indexOf(name);
  if (i < 0) return fallback;
  if (!args[i + 1] || args[i + 1].startsWith('--')) throw Error(`Wert fehlt: ${name}`);
  return args[i + 1];
}
const source = await realpath(resolve(option('--source', process.env.MATERIALS_SOURCE_DIR || resolve(project, '.material-source'))));
const destination = resolve(option('--destination', resolve(project, 'public')));
const catalogPath = resolve(option('--catalog', resolve(project, 'src/data/catalog.json')));
const { materials } = JSON.parse(await readFile(catalogPath, 'utf8'));
const files = new Map();
for (const material of materials) {
  for (const file of [material, material.preview].filter(Boolean)) {
    if (!/^materials\/(?:[a-zA-Z0-9_-]+\/)*[a-zA-Z0-9_-]+\.(pdf|txt|pptx|docx|zip|png)$/.test(file.path)) throw Error(`Unsicherer Materialpfad: ${file.path}`);
    if (!/^[a-f0-9]{64}$/.test(file.sha256 || '') || !Number.isSafeInteger(file.sizeBytes) || file.sizeBytes <= 0) throw Error(`Integritätsdaten fehlen: ${file.path}`);
    const existing = files.get(file.path);
    if (existing && (existing.sha256 !== file.sha256 || existing.sizeBytes !== file.sizeBytes)) throw Error(`Widersprüchliche Materialdaten: ${file.path}`);
    files.set(file.path, file);
  }
}
// Check every expected file before copying anything into the public build directory.
for (const [path, expected] of files) {
  const from = resolve(source, path);
  const canonical = await realpath(from);
  if (!canonical.startsWith(source + sep) || (await lstat(from)).isSymbolicLink()) throw Error(`Unzulässige Materialquelle: ${path}`);
  const stat = await lstat(canonical);
  if (!stat.isFile() || stat.size !== expected.sizeBytes) throw Error(`Dateigröße stimmt nicht: ${path}`);
  const bytes = await readFile(canonical);
  if (createHash('sha256').update(bytes).digest('hex') !== expected.sha256) throw Error(`Prüfsumme stimmt nicht: ${path}`);
}
await mkdir(destination, { recursive: true });
const destinationRoot = await realpath(destination);
for (const [path] of files) {
  const to = resolve(destinationRoot, path);
  await mkdir(dirname(to), { recursive: true });
  if (!(await realpath(dirname(to))).startsWith(destinationRoot + sep)) throw Error(`Unzulässiges Materialziel: ${path}`);
  try { if ((await lstat(to)).isSymbolicLink()) throw Error(`Symlink als Materialziel: ${path}`); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
  await copyFile(resolve(source, path), to);
}
console.log(`${files.size} geprüfte Materialdateien für die Veröffentlichung bereitgestellt.`);
