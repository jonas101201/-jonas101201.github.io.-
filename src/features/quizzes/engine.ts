import type { Question } from '../../types/content';
export type Answer = string[] | Record<string, string>;
export function shuffle<T>(items: readonly T[], random = Math.random): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    const a = result[i]; const b = result[j];
    if (a !== undefined && b !== undefined) { result[i] = b; result[j] = a; }
  }
  return result;
}
export function prepareQuestions(questions: Question[]): Question[] {
  return shuffle(questions).map(q => q.type === 'matching' || q.type === 'boolean' ? q : { ...q, options: shuffle(q.options) });
}
export function isComplete(question: Question, answer?: Answer): boolean {
  if (!answer) return false;
  return question.type === 'matching'
    ? !Array.isArray(answer) && question.pairs.every(p => Boolean(answer[p.id]))
    : Array.isArray(answer) && answer.length > 0;
}
export function isCorrect(question: Question, answer?: Answer): boolean {
  if (!isComplete(question, answer) || !answer) return false;
  if (question.type === 'matching') {
    if (Array.isArray(answer)) return false;
    return Object.keys(answer).length === question.pairs.length && question.pairs.every(p => answer[p.id] === p.id);
  }
  return Array.isArray(answer) && new Set(answer).size === answer.length && answer.length === question.correctOptionIds.length && answer.every(id => question.correctOptionIds.includes(id));
}
export function evaluate(questions: Question[], answers: Record<string, Answer>) {
  const wrongQuestionIds = questions.filter(q => !isCorrect(q, answers[q.id])).map(q => q.id);
  return { score: questions.length - wrongQuestionIds.length, total: questions.length, wrongQuestionIds };
}
export function solution(question: Question, tr: (text: string) => string = text => text): string {
  return question.type === 'matching' ? question.pairs.map(p => `${tr(p.left)} → ${tr(p.right)}`).join(' · ') : question.options.filter(o => question.correctOptionIds.includes(o.id)).map(o => tr(o.text)).join(' · ');
}
export function describeAnswer(question: Question, answer?: Answer, tr: (text: string) => string = text => text): string {
  if (!answer) return tr('Nicht beantwortet');
  if (question.type === 'matching' && !Array.isArray(answer)) return question.pairs.map(p => `${tr(p.left)} → ${tr(question.pairs.find(x => x.id === answer[p.id])?.right ?? 'Keine Zuordnung')}`).join(' · ');
  if (question.type !== 'matching' && Array.isArray(answer)) return question.options.filter(o => answer.includes(o.id)).map(o => tr(o.text)).join(' · ');
  return tr('Ungültige Antwort');
}
