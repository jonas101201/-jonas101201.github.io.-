import { describe, it, expect } from 'vitest';
import raw from '../src/data/catalog.json';
import { validateCatalog } from '../src/utils/validate';
import { isNew, isSafeMaterialPath, materialUrl } from '../src/utils/paths';
describe('Inhaltsvalidierung', () => {
  it('validiert den ausgelieferten Katalog',()=>expect(validateCatalog(raw).subjects).toHaveLength(7));
  it('enthält acht unabhängige Lernfelder pro BK-Fach',()=>{for(const id of ['bk1','bk2'])expect(validateCatalog(raw).learningFields.filter(f=>f.subjectId===id)).toHaveLength(8);});
  it('lehnt strukturell fehlerhafte Daten ab',()=>expect(()=>validateCatalog({subjects:[]})).toThrow());
  it('lehnt doppelte IDs ab',()=>{const d=structuredClone(raw);d.materials.push(d.materials[0]!);expect(()=>validateCatalog(d)).toThrow('Doppelte ID');});
  it('lehnt unbekannte Fachbeziehungen ab',()=>{const d=structuredClone(raw);d.materials[0]!.subjectId='fehlt';expect(()=>validateCatalog(d)).toThrow('Fach');});
  it('lehnt fachfremde Lernfelder ab',()=>{const d=structuredClone(raw);d.materials[0]!.learningFieldId=d.materials[0]!.subjectId==='bk1'?'bk2-lf1':'bk1-lf1';expect(()=>validateCatalog(d)).toThrow('Lernfeld');});
  it('lehnt fachfremde Themen ab',()=>{const d=structuredClone(raw);d.materials[1]!.topicId='spielformen';expect(()=>validateCatalog(d)).toThrow('Thema');});
  it('lehnt fehlende Antwort-IDs ab',()=>{const d=structuredClone(raw);d.quizzes[0]!.questions[0]!.correctOptionIds=['fehlt'];expect(()=>validateCatalog(d)).toThrow('Antwort');});
  it('lehnt mehrere korrekte Single-Choice-Antworten ab',()=>{const d=structuredClone(raw);d.quizzes[0]!.questions[0]!.correctOptionIds=['a1','a2'];expect(()=>validateCatalog(d)).toThrow();});
  it('prüft das Veröffentlichungsdatum',()=>{const d=structuredClone(raw);d.materials[0]!.publishedAt='2026-02-31';expect(()=>validateCatalog(d)).toThrow();});
  it('prüft Übereinstimmung von Dateityp und Endung',()=>{const d=structuredClone(raw);d.materials[0]!.fileType='TXT';expect(()=>validateCatalog(d)).toThrow('Dateipfad');});
  it('lehnt unsichere Quellen ab',()=>{const d=structuredClone(raw);d.quizzes[0]!.sources=['javascript:alert(1)'];expect(()=>validateCatalog(d)).toThrow();});
});
describe('Dateipfade und Basispfad',()=>{
  it.each(['../secret.pdf','materials/../secret.pdf','/materials/test.pdf','https://evil.test/a.pdf','javascript:alert(1)','materials/%2e%2e/x.pdf','materials/a\\b.pdf','materials/test.pdf?x=1','materials//test.pdf'])('blockiert %s',path=>expect(isSafeMaterialPath(path)).toBe(false));
  it('erzeugt ausschließlich HTTPS-API-URLs',()=>expect(materialUrl('materials/bk1/a.pdf','https://materials.example.test/')).toBe('https://materials.example.test/materials/bk1/a.pdf'));
  it.each(['', '/', './', 'http://api.test', 'https://api.test/path', 'https://user:pass@api.test', 'https://api.test?x'])('bleibt bei ungültiger API-Konfiguration geschlossen: %s',origin=>expect(materialUrl('materials/bk1/a.pdf',origin)).toBeNull());
  it('wirft bei ungültigem Pfad',()=>expect(()=>materialUrl('../a.pdf','/')).toThrow());
  it('kennzeichnet neue Dateien nur innerhalb von 14 Tagen',()=>{const now=Date.parse('2026-11-03');expect(isNew('2026-11-02',now)).toBe(true);expect(isNew('2026-10-01',now)).toBe(false);expect(isNew('2026-12-01',now)).toBe(false);});
});
