import { describe, expect, it } from 'vitest';
import { catalog } from '../src/data/catalog';
import { sheetSearchText, studySheets, studyTopics, topicPath, validateStudySheets } from '../src/features/study-sheets/data';

describe('Lernzettel aus den Unterrichtsunterlagen', () => {
  it('verknüpft bestehende Lernzettel nur mit belegten BK-Lernfeldern', () => {
    const available = new Set(catalog.materials.filter(m => ['bk1', 'bk2'].includes(m.subjectId) && !m.example).map(m => m.learningFieldId));
    expect(studySheets).toHaveLength(6);
    for (const sheet of studySheets) expect(available.has(sheet.learningFieldId)).toBe(true);
    expect(studySheets.every(s => s.sections.length >= 4)).toBe(true);
  });
  it('weist fehlende, fremde und fachfremde Unterrichtsquellen zurück', () => {
    for (const ref of ['fehlt', 'bk2-lf1-1-0-zusammenhang-selbstbild-fremdbild']) {
      const changed = structuredClone(studySheets);
      changed[0]!.sections[0]!.materialIds = [ref];
      expect(() => validateStudySheets(changed)).toThrow('Ungültige Lernzettelquelle');
    }
  });
  it('weist doppelte Lernfelder und beschädigte Tabellen zurück', () => {
    expect(() => validateStudySheets([...studySheets, studySheets[0]])).toThrow('Doppelter Lernzettel');
    const changed = structuredClone(studySheets);
    const table = changed.flatMap(s => s.sections).find(s => s.table)!.table!;
    table.rows[0]!.pop();
    expect(() => validateStudySheets(changed)).toThrow('Ungültige Tabelle');
  });
  it('findet auch Begriffe aus Tabellen und Erklärungen', () => {
    expect(sheetSearchText(studySheets.find(s => s.id === 'bk2-lf2')!)).toContain('reliabilität');
    expect(sheetSearchText(studySheets.find(s => s.id === 'bk1-lf2')!)).toContain('intraindividuelle');
  });
});

// Curriculum regressions identified by the November source audit. These checks
// protect topic coverage; they do not replace a specialist editorial review.
describe('Ausgearbeitete Themen aus dem Quellenabgleich', () => {
  const requiredTopics: [string, string[]][] = [
    ['bk1-lf1', ['hilfen zur erziehung', 'jugendarbeit', 'aufsicht', 'schutzauftrag', 'vertraulichkeit', 'lernkompetenz']],
    ['bk1-lf2', ['irreversibilität', 'lebensalterbezogenheit', 'zentralisation', 'retardation', 'sensible phasen', 'evidenz']],
    ['bk2-lf1', ['selbstkonzept', 'selbstwert', 'selbstverantwortung', 'integrität', 'biografie', 'praxisanleitung', 'fachberatung']],
    ['bk2-lf2', ['erwartungseffekt', 'subjektivismus', 'logischer fehler', 'selbst / fremd', 'gerichtet / ungerichtet', 'lerngemeinschaft']],
    ['bk2-lf3', ['sender-botschaft-empfänger', 'paraverbale', 'aktives zuhören', 'suggestivfragen', 'aufnahmegespräch']],
    ['bk2-lf4', ['untersuchen', 'gleichgewicht', 'wettbewerb', 'schieß-', 'resilienz', 'selbstwirksamkeit', 'inklusion', 'akustik']],
  ];
  it.each(requiredTopics)('%s erhält die zuvor fehlenden Unterrichtsthemen', (id, topics) => {
    const sheet = studySheets.find(s => s.id === id)!;
    const text = sheetSearchText(sheet);
    for (const topic of topics) expect(text, `${id}: ${topic}`).toContain(topic);
    expect(sheet).not.toHaveProperty('review');
    expect(sheet.sections.every(topic => topic.intro && topic.caseStudy.scenario && topic.caseStudy.analysis && topic.caseStudy.action)).toBe(true);
  });
  it('vergleicht alle acht Beobachtungsverfahren mit Zweck und Grenze', () => {
    const sheet = studySheets.find(s => s.id === 'bk2-lf2')!;
    const comparison = sheet.sections.find(s => s.id === 'verfahren')!.table!;
    const procedures = ['Beller', 'Grenzsteine', 'SISMIK', 'SELDAK', 'BaSiK', 'PERIK', 'Bildungs- und Lerngeschichten', 'Leuvener Engagiertheitsskala'];
    expect(comparison.headers).toHaveLength(3);
    expect(comparison.rows).toHaveLength(procedures.length);
    for (const procedure of procedures) {
      const row = comparison.rows.find(r => r[0]!.includes(procedure));
      expect(row, procedure).toBeDefined();
      expect(row!.slice(1).every(cell => cell.trim().length > 0)).toBe(true);
    }
  });
  it('erklärt jeden Entwicklungsbereich und jeden Resilienzfaktor einzeln', () => {
    const development = studySheets.find(s => s.id === 'bk1-lf2')!.sections.find(s => s.id === 'entwicklungsbereiche')!;
    const areas = ['Körperliche', 'Motorische', 'Wahrnehmungsentwicklung', 'Kognitive', 'Sprachlich-kommunikative', 'Soziale', 'Emotionale', 'Moralische', 'Sexuelle'];
    for (const area of areas) expect(development.points!.some(p => p.startsWith(area)), area).toBe(true);
    const resilience = studySheets.find(s => s.id === 'bk2-lf4')!.sections.find(s => s.id === 'resilienz')!;
    for (const factor of ['Selbstwahrnehmung', 'Selbstregulation', 'Selbstwirksamkeit', 'Soziale Kompetenz', 'Aktive Bewältigung', 'Problemlösen']) {
      expect(resilience.points!.some(p => p.startsWith(`${factor}:`)), factor).toBe(true);
    }
  });
  it('erhält die bestehenden Abschnittsziele trotz redaktioneller Erweiterung', () => {
    const originalAnchors: [string, string[]][] = [
      ['bk1-lf1', ['auftrag', 'kompetenzen', 'haltung', 'reflexion']],
      ['bk1-lf2', ['gegenstand', 'prozesse', 'unterschiede', 'faktoren', 'praxis']],
      ['bk2-lf1', ['bilder', 'johari', 'haltung', 'beruf']],
      ['bk2-lf2', ['trennen', 'formen', 'qualitaet', 'verfahren', 'auswertung']],
      ['bk2-lf3', ['grundlagen', 'vorbereiten', 'beschwerden', 'team']],
      ['bk2-lf4', ['spiel', 'formen', 'schemata', 'begleitung', 'raeume', 'besondere-spiele']],
    ];
    for (const [id, anchors] of originalAnchors) {
      const sectionIds = studySheets.find(s => s.id === id)!.sections.map(s => s.id);
      expect(sectionIds).toEqual(expect.arrayContaining(anchors));
    }
  });
});


describe('Eigenständige Unterthemen ohne Check-up', () => {
  it('ordnet jeden Lernzettel genau einem Oberthema und einer eindeutigen Route zu', () => {
    expect(studyTopics).toHaveLength(studySheets.reduce((sum, sheet) => sum + sheet.sections.length, 0));
    expect(new Set(studyTopics.map(t => t.to)).size).toBe(studyTopics.length);
    for (const topic of studyTopics) {
      const parent = studySheets.find(s => s.id === topic.parentId)!;
      expect(parent.sections).toContain(topic.topic);
      expect(topic.to).toBe(topicPath(parent, topic.topic));
      expect(topic.learningFieldId).toBe(parent.learningFieldId);
    }
  });
  it('weist das alte Check-up-Format zurück statt es nur zu verstecken', () => {
    const legacy = studySheets.map(s => ({ ...s, review: [{ question: 'Check-up', answer: 'Antwort' }] }));
    expect(() => validateStudySheets(legacy)).toThrow();
  });
  it('ergänzt die zentralen Beobachtungsbegriffe der PDF-Vorlage', () => {
    const sheet = studySheets.find(s => s.id === 'bk2-lf2')!;
    for (const term of ['operationalisierung', 'indikatoren', 'zeitstichprobe', 'ereignisstichprobe', 'narrative', 'erleben', 'ebene a', 'ebene b', 'ebene c']) {
      expect(sheetSearchText(sheet), term).toContain(term);
    }
  });
});

it('erstellt für BK1 LF3 trotz neuer Materialien noch keinen Lernzettel', () => {
  expect(catalog.materials.some(m => m.learningFieldId === 'bk1-lf3')).toBe(true);
  expect(studySheets.some(s => s.learningFieldId === 'bk1-lf3')).toBe(false);
});
