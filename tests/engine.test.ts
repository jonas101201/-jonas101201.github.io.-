import { describe, it, expect } from 'vitest';
import { catalog } from '../src/data/catalog';
import { evaluate, isComplete, isCorrect, prepareQuestions, shuffle } from '../src/features/quizzes/engine';
import type { Question } from '../src/types/content';
const questions = catalog.quizzes[0]!.questions;
const single = questions.find(q => q.type === 'single')!;
const multi = questions.find(q => q.type === 'multiple')!;
const boolean = questions.find(q => q.type === 'boolean')!;
const matching = questions.find(q => q.type === 'matching')!;
function correct(q: Question) { return q.type === 'matching' ? Object.fromEntries(q.pairs.map(p => [p.id,p.id])) : q.correctOptionIds; }
describe('Quiz-Engine', () => {
  it.each(questions.map(q=>[q.id,q] as const))('wertet korrekte Antwort aus: %s', (_id,q) => expect(isCorrect(q,correct(q))).toBe(true));
  it('verlangt bei Mehrfachauswahl die exakte Menge', () => {
    expect(isCorrect(multi,multi.correctOptionIds.slice(1))).toBe(false);
    expect(isCorrect(multi,[...multi.correctOptionIds,'unbekannt'])).toBe(false);
    expect(isCorrect(multi,[...multi.correctOptionIds,multi.correctOptionIds[0]!])).toBe(false);
    expect(isCorrect(multi,[...multi.correctOptionIds].reverse())).toBe(true);
  });
  it('wertet falsche Single- und Boolean-Antworten aus', () => { for (const q of [single,boolean]) expect(isCorrect(q,[q.options.find(o=>!q.correctOptionIds.includes(o.id))!.id])).toBe(false); });
  it('lehnt fehlende und falsche Antwortformen ab', () => { expect(isCorrect(single)).toBe(false);expect(isComplete(single,[])).toBe(false);expect(isCorrect(single,{})).toBe(false);expect(isCorrect(matching,['a'])).toBe(false); });
  it('erkennt unvollständige und falsche Zuordnungen', () => {expect(isComplete(matching,{})).toBe(false);expect(isCorrect(matching,Object.fromEntries(matching.pairs.map(p=>[p.id,'funktion'])))).toBe(false);});
  it('berechnet Punkte und Fehler-IDs', () => { const result=evaluate(questions,{[single.id]:correct(single)}); expect(result.score).toBe(1); expect(result.total).toBe(8);expect(result.wrongQuestionIds).toHaveLength(7);expect(result.wrongQuestionIds).not.toContain(single.id); });
  it('verändert Ausgangsdaten beim Mischen nicht', () => {const snapshot=JSON.stringify(questions);const prepared=prepareQuestions(questions);expect(JSON.stringify(questions)).toBe(snapshot);expect(new Set(prepared.map(q=>q.id))).toEqual(new Set(questions.map(q=>q.id)));for(const q of prepared)expect(isCorrect(q,correct(q))).toBe(true);});
  it('mischt auch leere und einelementige Listen sicher',()=>{expect(shuffle([])).toEqual([]);expect(shuffle([1])).toEqual([1]);expect(shuffle([1,2,3],()=>0)).toEqual([2,3,1]);});
});
