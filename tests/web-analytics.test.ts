// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { startWebAnalytics } from '../src/utils/webAnalytics';
const live = { hostname: 'jonas101201.github.io', pathname: '/-jonas101201.github.io.-/' };
afterEach(() => { document.body.replaceChildren(); });
describe('Cloudflare Web Analytics', () => {
  it('lädt nur auf der vorgesehenen Produktionswebsite und nur einmal', () => {
    startWebAnalytics(true, live); startWebAnalytics(true, live);
    const scripts = document.querySelectorAll<HTMLScriptElement>('script');
    expect(scripts).toHaveLength(1);
    expect(scripts[0]!.src).toBe('https://static.cloudflareinsights.com/beacon.min.js');
    expect(scripts[0]!.async).toBe(true);
    expect(JSON.parse(scripts[0]!.dataset.cfBeacon!)).toEqual({ token: '69e13b7a80414317ade1aa5e3101dac2' });
  });
  it('zählt lokale Entwicklung, Vorschauen und andere GitHub-Projekte nicht mit', () => {
    startWebAnalytics(false, live);
    for (const page of [
      { ...live, hostname: 'localhost' }, { ...live, hostname: 'preview.example.com' },
      { ...live, pathname: '/anderes-projekt/' }, { ...live, pathname: '/-jonas101201.github.io.-anderes/' },
    ]) startWebAnalytics(true, page);
    expect(document.querySelector('script')).toBeNull();
  });
});
