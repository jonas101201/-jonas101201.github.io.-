import { createHash } from 'node:crypto';
import { readFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, extname } from 'node:path';
const root = fileURLToPath(new URL('../', import.meta.url));
const { materials } = JSON.parse(await readFile(resolve(root,'src/data/catalog.json'),'utf8'));
async function checkFile(file, fileType, label) {
  if (!/^materials\/(?:[a-zA-Z0-9_-]+\/)*[a-zA-Z0-9_-]+\.(pdf|txt|pptx|docx|zip|png)$/.test(file.path)) throw Error(`Unsicherer Pfad: ${label}`);
  const path=resolve(root,'public',file.path);
  const info=await stat(path);
  if(!info.isFile() || !info.size) throw Error(`Datei fehlt oder ist leer: ${label}`);
  if(extname(path).slice(1).toUpperCase()!==fileType) throw Error(`Dateityp stimmt nicht: ${label}`);
  if(file.sizeBytes && info.size !== file.sizeBytes) throw Error(`Dateigröße stimmt nicht: ${label}`);
  const buffer=await readFile(path);
  if(file.sha256 && createHash('sha256').update(buffer).digest('hex')!==file.sha256) throw Error(`Datei verändert: ${label}`);
  if(fileType==='PDF' && buffer.subarray(0,5).toString()!=='%PDF-') throw Error(`Keine PDF: ${label}`);
  if(fileType==='PNG' && buffer.subarray(0,8).toString('hex')!=='89504e470d0a1a0a') throw Error(`Keine PNG: ${label}`);
  if(fileType==='DOCX' && buffer.subarray(0,4).toString('hex')!=='504b0304') throw Error(`Keine DOCX: ${label}`);
}
let previews=0;
for (const material of materials) {
  await checkFile(material,material.fileType,material.id);
  if(material.preview) { await checkFile(material.preview,'PDF',`${material.id} (Vorschau)`);previews++; }
}
console.log(`${materials.length} Materialdateien und ${previews} PDF-Vorschauen erfolgreich geprüft.`);
