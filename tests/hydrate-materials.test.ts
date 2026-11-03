import { afterEach, describe, expect, it } from 'vitest';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
const temporary: string[] = [];
afterEach(() => { for (const path of temporary.splice(0)) rmSync(path, { recursive: true, force: true }); });
function fixture() {
  const root = mkdtempSync(join(tmpdir(), 'lernhub-materials-')); temporary.push(root);
  const source = join(root,'source'); const destination = join(root,'public'); const catalogPath = join(root,'catalog.json');
  mkdirSync(join(source,'materials/bk1'),{recursive:true});
  const bytes = Buffer.from('%PDF-1.4\nUnterrichtsdatei\n');
  writeFileSync(join(source,'materials/bk1/test.pdf'), bytes);
  const file = { path:'materials/bk1/test.pdf', sizeBytes:bytes.length, sha256:createHash('sha256').update(bytes).digest('hex') };
  function run(materials: unknown[] = [file]) {
    writeFileSync(catalogPath,JSON.stringify({materials}));
    return execFileSync(process.execPath,[resolve('scripts/hydrate-materials.mjs'),'--source',source,'--destination',destination,'--catalog',catalogPath],{encoding:'utf8',stdio:'pipe'});
  }
  return {root,source,destination,file,bytes,run};
}
describe('Bereitstellung aus privater Materialablage', () => {
  it('kopiert nur katalogisierte Dateien samt Vorschauen und erhält ihre Bytes', () => {
    const f=fixture(); writeFileSync(join(f.source,'privat.txt'),'nicht veröffentlichen');
    expect(f.run([{...f.file,preview:f.file}])).toContain('1 geprüfte Materialdateien');
    expect(readFileSync(join(f.destination,f.file.path))).toEqual(f.bytes);
    expect(existsSync(join(f.destination,'privat.txt'))).toBe(false);
  });
  it('bricht vor dem Kopieren ab, wenn eine erwartete Datei fehlt', () => {
    const f=fixture(); expect(()=>f.run([f.file,{...f.file,path:'materials/fehlt.pdf'}])).toThrow();
    expect(existsSync(f.destination)).toBe(false);
  });
  it('weist veränderte Bytes trotz gleicher Dateigröße zurück', () => {
    const f=fixture(); const changed=Buffer.from(f.bytes); changed[changed.length-2]=65; writeFileSync(join(f.source,f.file.path),changed);
    expect(()=>f.run()).toThrow(); expect(existsSync(f.destination)).toBe(false);
  });
  it('weist Traversierung und fehlende Integritätsdaten zurück', () => {
    const f=fixture(); expect(()=>f.run([{...f.file,path:'../privat.txt'}])).toThrow();
    expect(()=>f.run([{...f.file,sha256:undefined}])).toThrow();
    expect(existsSync(f.destination)).toBe(false);
  });
});
