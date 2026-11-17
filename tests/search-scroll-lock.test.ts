// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest';
import { lockPageScroll } from '../src/utils/scrollLock';

afterEach(() => { document.body.removeAttribute('style'); document.documentElement.removeAttribute('style'); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

function scrolledPage() {
  vi.stubGlobal('scrollY', 640); vi.stubGlobal('scrollX', 0); vi.stubGlobal('innerWidth', 375);
  vi.spyOn(document.documentElement, 'clientWidth', 'get').mockReturnValue(360);
  return vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
}

it('freezes a scrolled page and restores its position and exact inline styles without changing unrelated styles', () => {
  const scroll = scrolledPage();
  document.body.style.paddingRight = '12px';
  document.body.style.setProperty('position', 'relative', 'important');
  document.documentElement.style.scrollBehavior = 'smooth';
  const unlock = lockPageScroll();
  expect(document.body.style.position).toBe('fixed'); expect(document.body.style.top).toBe('-640px');
  expect(document.body.style.paddingRight).toBe('27px'); expect(document.documentElement.style.overflow).toBe('hidden');
  document.body.style.backgroundColor = 'red'; vi.stubGlobal('scrollY', 0);
  unlock(); unlock();
  expect(scroll).toHaveBeenCalledExactlyOnceWith(0, 640);
  expect(document.body.style.position).toBe('relative'); expect(document.body.style.getPropertyPriority('position')).toBe('important');
  expect(document.body.style.top).toBe(''); expect(document.body.style.paddingRight).toBe('12px'); expect(document.body.style.backgroundColor).toBe('red');
  expect(document.documentElement.style.overflow).toBe(''); expect(document.documentElement.style.scrollBehavior).toBe('smooth');
});

it('unlocks without restoring the previous route scroll position when a search result opens', () => {
  const scroll = scrolledPage(); const unlock = lockPageScroll();
  unlock(false);
  expect(scroll).toHaveBeenCalledExactlyOnceWith(0, 0); expect(document.body.style.position).toBe(''); expect(document.documentElement.style.overflow).toBe('');
});
