// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { LanguageProvider } from '../src/i18n/LanguageProvider';
import { ProgressProvider } from '../src/hooks/ProgressProvider';
import { useProgress } from '../src/hooks/useProgress';
import { FlashcardPage } from '../src/features/flashcards/FlashcardPages';
import { QuizPage } from '../src/features/quizzes/QuizPages';
import { catalog } from '../src/data/catalog';
const pending = vi.hoisted(() => [] as (() => void)[]);
vi.mock('../src/utils/motion', () => ({ changeWithMotion: (update: () => void) => { pending.push(update); } }));
beforeEach(() => { localStorage.clear(); pending.length = 0; vi.spyOn(Math,'random').mockReturnValue(.42); });
afterEach(() => { cleanup(); vi.restoreAllMocks(); });
function Reviews() { const { progress } = useProgress(); return <output data-testid="reviews">{Object.values(progress.cards).reduce((total,card) => total + card.reviews,0)}</output>; }
function show(path: string) {
  return render(<MemoryRouter initialEntries={[path]}><LanguageProvider><ProgressProvider><Routes><Route path="/karteikarten/:id" element={<FlashcardPage/>}/><Route path="/quizze/:id" element={<QuizPage/>}/></Routes><Reviews/></ProgressProvider></LanguageProvider></MemoryRouter>);
}
it('accepts only one card assessment while the state-swap callback is pending and ignores a flip of the old card', () => {
  const set = catalog.flashcardSets.find(value => value.cards.length > 2)!;
  const { container } = show(`/karteikarten/${set.id}`);
  fireEvent.click(container.querySelector('.flashcard')!); act(() => pending.shift()!());
  const button = screen.getByRole('button',{name:'Gewusst'});
  fireEvent.click(button); fireEvent.click(button); fireEvent.click(container.querySelector('.flashcard')!);
  expect(pending).toHaveLength(1); expect(screen.getByTestId('reviews').textContent).toBe('1');
  act(() => pending.shift()!());
  expect(container.querySelector('.flash-navigation span')?.textContent).toBe(`2 / ${set.cards.length}`);
  expect(container.querySelector('.flash-back')).toBeNull();
});
it('does not skip a quiz question on two fast next activations before the snapshot callback', () => {
  const { container } = show('/quizze/bk1-lf3-bindung-quiz?modus=lernen');
  fireEvent.click(container.querySelector('.answer-option input')!);
  fireEvent.click(screen.getByRole('button',{name:'Antwort prüfen'}));
  const next = screen.getByRole('button',{name:'Nächste Frage'});
  fireEvent.click(next); fireEvent.click(next);
  expect(pending).toHaveLength(1); act(() => pending.shift()!());
  expect(container.querySelector('.quiz-progress span')?.textContent).toContain('Frage 2 von');
});
