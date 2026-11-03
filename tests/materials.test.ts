import { describe, expect, it } from 'vitest';
import { catalog } from '../src/data/catalog';
import { MaterialSchema } from '../src/types/content';
import { compareMaterials, formatFileSize, materialDetails } from '../src/features/materials/metadata';
const lf1 = catalog.materials.filter(m => m.learningFieldId === 'bk2-lf1' && !m.example);
const lf4 = catalog.materials.filter(m => m.learningFieldId === 'bk2-lf4' && !m.example);
describe('BK2-Unterrichtsmaterialien', () => {
  it('ordnet alle 41 Original-PDFs den übergebenen Lernfeldern zu', () => {
    expect(lf1).toHaveLength(10); expect(lf4).toHaveLength(31);
    for (const m of [...lf1, ...lf4]) { expect(m.subjectId).toBe('bk2');expect(m.fileType).toBe('PDF');expect(m.originalFilename).toMatch(/\.pdf$/);expect(m.sha256).toMatch(/^[a-f0-9]{64}$/);expect(m.pageCount).toBeGreaterThan(0);expect(m.sizeBytes).toBeGreaterThan(0); }
  });
  it('ordnet Spielformen-Quiz und Karten BK2 LF4 zu und erhält ihre IDs', () => {
    expect(catalog.quizzes.find(q=>q.id==='spielformen-quiz')).toMatchObject({subjectId:'bk2',learningFieldId:'bk2-lf4'});
    expect(catalog.flashcardSets.find(s=>s.id==='spielformen-karten')).toMatchObject({subjectId:'bk2',learningFieldId:'bk2-lf4'});
  });
  it('sortiert Unterrichtsnummern numerisch statt lexikografisch', () => {
    const sorted = [...lf4].sort((a,b) => compareMaterials(a,b,'title'));
    expect(sorted.map(m=>m.title.split(' · ')[0])).toEqual(Array.from({length:31},(_,i)=>`5.${i}`));
    expect([...lf4].sort((a,b)=>compareMaterials(a,b,'date')).map(m=>m.id)).toEqual(sorted.map(m=>m.id));
  });
  it('sortiert unterschiedliche Veröffentlichungstage weiterhin absteigend',()=>expect(compareMaterials({...lf1[0]!,publishedAt:'2026-11-03'},{...lf1[0]!,publishedAt:'2026-11-02'},'date')).toBeLessThan(0));
  it('zeigt Seitenzahl und Dateigröße ohne fehlende Werte an',()=>{
    expect(formatFileSize(30043059)).toBe('30 MB');
    expect(materialDetails({...lf1[0]!,pageCount:1,sizeBytes:120000})).toBe('1 Seite · 120 kB');
    expect(materialDetails({...lf1[0]!,pageCount:undefined,sizeBytes:undefined})).toBe('');
  });
  it.each(['../geheim.pdf','ordner/datei.pdf','datei\n.pdf'])('verhindert unsichere Originaldateinamen: %s',originalFilename=>expect(MaterialSchema.safeParse({...lf1[0],originalFilename}).success).toBe(false));
});
