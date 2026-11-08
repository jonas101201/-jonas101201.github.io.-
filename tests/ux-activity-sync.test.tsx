// @vitest-environment jsdom
import { beforeEach, afterEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProgressProvider } from '../src/hooks/ProgressProvider';
import { useProgress } from '../src/hooks/useProgress';
import { ACTIVITY_KEY } from '../src/features/activity/storage';
import { STORAGE_KEY } from '../src/utils/storage';
function Session() {
  const p = useProgress();
  return <><button onClick={p.enablePersistence}>enable</button><button onClick={() => {
    p.saveQuiz({ id: 'pending-result', quizId: 'spielformen-quiz', date: '2026-11-08T12:00:00.000Z', mode: 'learn', score: 1, total: 1, wrongQuestionIds: [] });
    p.markCard('test-set', 'test-card', 'known');
    p.trackActivity('/quizze/spielformen-quiz');
  }}>learn</button><output data-testid="quiz-count">{p.progress.quizResults.length}</output><output data-testid="card-count">{Object.keys(p.progress.cards).length}</output><output data-testid="activities">{p.activities.map(a => a.to).join(',')}</output><p data-testid="warning">{p.warning}</p><p data-testid="activity-warning">{p.activityWarning}</p></>;
}
beforeEach(() => localStorage.clear());
afterEach(() => { cleanup(); vi.restoreAllMocks(); });
it.each([1, 99])('preserves unsaved quiz/card progress and its warning when another tab writes activity schema v%s', async version => {
  const user = userEvent.setup(); render(<ProgressProvider><Session/></ProgressProvider>);
  await user.click(screen.getByText('enable'));
  const nativeSet = Storage.prototype.setItem;
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function (this: Storage, key, value) {
    if (key === STORAGE_KEY) throw Error('quota'); nativeSet.call(this, key, value);
  });
  await user.click(screen.getByText('learn'));
  const warning = screen.getByTestId('warning').textContent; expect(warning).toContain('Speichern fehlgeschlagen');
  localStorage.setItem(ACTIVITY_KEY, JSON.stringify({ version, entries: [{ to: '/materialien/remote-content', visitedAt: '2026-11-08T12:01:00.000Z' }] }));
  fireEvent(window, new StorageEvent('storage', { key: ACTIVITY_KEY }));
  expect(screen.getByTestId('quiz-count').textContent).toBe('1'); expect(screen.getByTestId('card-count').textContent).toBe('1');
  expect(screen.getByTestId('warning').textContent).toBe(warning);
  if (version === 1) expect(screen.getByTestId('activities').textContent).toBe('/materialien/remote-content');
  else expect(screen.getByTestId('activity-warning').textContent).not.toBe('');
});
it('ignores activity storage events without consent and retains the current tab session', async () => {
  const user = userEvent.setup(); render(<ProgressProvider><Session/></ProgressProvider>); await user.click(screen.getByText('learn'));
  localStorage.setItem(ACTIVITY_KEY, '{"version":1,"entries":[]}'); fireEvent(window, new StorageEvent('storage', { key: ACTIVITY_KEY }));
  expect(screen.getByTestId('quiz-count').textContent).toBe('1'); expect(screen.getByTestId('card-count').textContent).toBe('1');
  expect(screen.getByTestId('activities').textContent).toBe('/quizze/spielformen-quiz');
});
