// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, expect, it, vi } from 'vitest';
import { LanguageProvider } from '../src/i18n/LanguageProvider';
import { SmartRecall } from '../src/features/blurting/SmartRecall';
import { parseSmartRecallResult, requestSmartRecall, type SmartRecallResult } from '../src/features/blurting/smartRecall';
import { blurtingTaskById } from '../src/features/blurting/tasks';
import { studyTopics } from '../src/features/study-sheets/data';

vi.mock('../src/features/progression/ActiveCompanion', () => ({
  ActiveCompanion: ({ children }: { children: React.ReactNode }) => <aside>{children}</aside>,
}));

afterEach(() => { cleanup(); vi.restoreAllMocks(); });

const task = blurtingTaskById.get('bk2-lf4-spiel')!;
const topic = studyTopics.find(item => item.to === task.sourcePath)!;
const [sheetId, sectionId] = topic.id.split('/');
const answer = 'Beim Spielen verhandeln Kinder Regeln und lösen Konflikte.';
const example: SmartRecallResult = {
  status: 'uncertain', taskId: task.id, version: 'test-version',
  sources: [{ id: topic.id, sheetId: sheetId!, sectionId: sectionId!, title: topic.title, to: topic.to }],
  score: { earned: 0, maxEarned: task.concepts.length - 1, possible: task.concepts.length },
  feedback: 'Prüfe die Beispiele im zugeordneten Lernzettel.',
  criteria: task.concepts.map((concept, index) => ({
    id: concept.id, status: index === 0 ? 'wrong' : 'uncertain', sourceId: topic.id,
    reason: 'Prüfe den Zusammenhang.', sourceQuote: 'Spielen fördert die Entwicklung.', excerpt: 'verhandeln Kinder Regeln', correction: 'Vergleiche das Beispiel.',
  })),
};

function show() {
  const applyRatings = vi.fn();
  const showManual = vi.fn();
  const onEvaluated = vi.fn();
  render(<MemoryRouter><LanguageProvider><SmartRecall task={task} answer={answer} attemptId="recall-ui-test"
    complete={false} manual={false} companion="orbit" edit={vi.fn()} showManual={showManual}
    applyRatings={applyRatings} onEvaluated={onEvaluated}/></LanguageProvider></MemoryRouter>);
  return { applyRatings, showManual, onEvaluated };
}

it('accepts the canonical source target and rejects invented excerpts, paths and scores', () => {
  expect(parseSmartRecallResult(example, task, answer)).toEqual(example);
  const other = studyTopics.find(item => item.id !== topic.id)!;
  expect(parseSmartRecallResult({ ...example, sources: [{ id: other.id, sheetId: other.parentId,
    sectionId: other.topic.id, title: other.title, to: other.to }],
    criteria: example.criteria.map(row => ({ ...row, sourceId: other.id })) }, task, answer)).toBeNull();
  expect(parseSmartRecallResult({ ...example, score: { ...example.score, earned: 1 } }, task, answer)).toBeNull();
  expect(parseSmartRecallResult({ ...example, sources: [{ ...example.sources[0], to: 'https://example.org' }] }, task, answer)).toBeNull();
  expect(parseSmartRecallResult({ ...example, criteria: example.criteria.map(criterion => ({ ...criterion, excerpt: 'Erfundener Ausschnitt' })) }, task, answer)).toBeNull();
  expect(parseSmartRecallResult({ ...example, score: { earned: 4, maxEarned: 3, possible: 5 } }, task, answer)).toBeNull();
});

it('sends only after disclosure and transfers ratings only after the learner checks them', async () => {
  const user = userEvent.setup();
  const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(Response.json(example));
  const { applyRatings, onEvaluated } = show();
  await user.click(screen.getByRole('button', { name: 'KI-Auswertung starten' }));
  expect(fetchMock).not.toHaveBeenCalled();
  expect(screen.getByText(/passende Auszüge aus den Lernzetteln zur Bewertung/)).toBeTruthy();
  await user.click(screen.getByRole('button', { name: 'Antwort senden und bewerten' }));
  await screen.findByText('Vorläufige Bewertung');
  expect(fetchMock).toHaveBeenCalledTimes(1);
  expect(fetchMock.mock.calls[0]![1]).toMatchObject({ credentials: 'include', redirect: 'error', cache: 'no-store' });
  expect(JSON.parse(fetchMock.mock.calls[0]![1]!.body as string)).toEqual({ taskId: task.id, answer, attemptId: 'recall-ui-test', language: 'de' });
  expect(onEvaluated).toHaveBeenCalledOnce();
  const excerpt = screen.getAllByText('verhandeln Kinder Regeln')[0]!;
  const criterion = excerpt.closest('details')!;
  expect(criterion.open).toBe(false);
  expect(criterion.querySelector('summary')?.textContent).toContain('Fachlich falsch');
  await user.click(criterion.querySelector('summary')!);
  expect(criterion.open).toBe(true);
  expect(excerpt.tagName).toBe('MARK');
  expect(screen.getAllByText('Beleg aus dem Lernzettel')).toHaveLength(task.concepts.length);
  expect(applyRatings).not.toHaveBeenCalled();
  await user.click(screen.getByRole('button', { name: 'Bewertungsvorschläge prüfen und übernehmen' }));
  expect(applyRatings).toHaveBeenCalledWith({ [task.concepts[0]!.id]: 'misunderstood' });
});

it('reports the budget error and keeps manual review available', async () => {
  const user = userEvent.setup();
  vi.spyOn(globalThis, 'fetch').mockImplementation(async () => Response.json({ error: 'budget' }, { status: 429 }));
  const { showManual } = show();
  await user.click(screen.getByRole('button', { name: 'KI-Auswertung starten' }));
  await user.click(screen.getByRole('button', { name: 'Antwort senden und bewerten' }));
  const alert = await screen.findByRole('alert');
  expect(alert.textContent).toContain('KI-Kontingent');
  expect(alert.textContent).toContain('SR-DAY-LIMIT');
  await user.click(screen.getByRole('button', { name: 'Selbst kontrollieren' }));
  expect(showManual).toHaveBeenCalledOnce();
});

it('handles denied sessions without parsing an HTML login form as a result', async () => {
  vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('<html></html>', { status: 401 }));
  await expect(requestSmartRecall(task, answer, 'recall-ui-test', 'de', new AbortController().signal)).rejects.toThrow('unauthorized');
});
