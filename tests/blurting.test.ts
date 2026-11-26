import { describe, expect, it } from 'vitest';
import { matchedKeywords, parseDraft, summarizeRatings, words } from '../src/features/blurting/analysis';
import { tasks } from '../src/features/blurting/tasks';
import { studyTopics } from '../src/features/study-sheets/data';
import { catalog } from '../src/data/catalog';

describe('Freier Wissensabruf', () => {
  it('matches words and phrases, including umlauts and documented alternatives, without substring matches', () => {
    const concept = { keywords: ['Feinfühligkeit', 'sichere Basis', 'Trost', 'soziale Unterstützung'] };
    expect(matchedKeywords(words('FEINFUEHLIGKEIT und eine sichere Basis; Trostlosigkeit. Soziale Unterstützung.'), concept))
      .toEqual(['Feinfühligkeit','sichere Basis','soziale Unterstützung']);
    expect(matchedKeywords(words('unsichere Basis, Feinfühligkeitsmodell'), concept)).toEqual([]);
  });

  it('maps rubrics only to existing source text and real catalog destinations', () => {
    expect(tasks.length).toBeGreaterThan(10);
    expect(new Set(tasks.map(task => task.id)).size).toBe(tasks.length);
    for (const task of tasks) {
      const source = studyTopics.find(topic => topic.to === task.sourcePath);
      expect(source?.subjectId).toBe(task.subjectId);
      expect(source?.learningFieldId).toBe(task.learningFieldId);
      expect(task.related.some(link => link.to === source?.to)).toBe(true);
      for (const concept of task.concepts) expect(source?.topic.points).toContain(concept.explanation);
      for (const link of task.related.filter(link => link.kind === 'Unterrichtsmaterialien')) {
        expect(catalog.materials.some(material => link.to === '/materialien/' + material.id)).toBe(true);
      }
    }
  });

  it('retains all four ratings distinctly and validates saved draft references', () => {
    expect(summarizeRatings(['remembered','partial','missing','misunderstood','partial']))
      .toEqual({ remembered:1, partial:2, missing:1, misunderstood:1 });
    const draft = {
      version: 1, id: 'c176f1dc-7c47-41bc-a949-1c9404b1e318', phase:'compare',
      answer:'Eigene Antwort', ratings:{close:'partial'}, showTimer:false, startedAt:0,
    };
    expect(parseDraft(JSON.stringify(draft), [{ id:'close' }])).toEqual(draft);
    expect(parseDraft(JSON.stringify(draft), [{ id:'different' }])).toBeNull();
    expect(parseDraft(JSON.stringify({ ...draft, version:2 }), [{ id:'close' }])).toBeNull();
  });
});
