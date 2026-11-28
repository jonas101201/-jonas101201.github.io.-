// Runs against an isolated local Vite server, without a live Access session.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

const { chromium, webkit } = await import(process.env.PLAYWRIGHT_MODULE
  ? pathToFileURL(process.env.PLAYWRIGHT_MODULE).href : 'playwright');
const base = process.env.LERNHUB_TEST_URL ?? 'http://127.0.0.1:5198/';
const catalog = JSON.parse(await readFile(new URL('../src/data/catalog.json', import.meta.url), 'utf8'));
const material = catalog.materials[0];
const routes = [
  '/', '/lernen', '/faecher/bk1/lernfelder/bk1-lf3', '/lernzettel/bk1-lf3/feinfuehligkeit',
  '/materialien', '/materialien/' + material.id, '/suche?q=Bindung', '/quizze', '/pruefungstraining',
  '/karteikarten', '/blurting/bk1-lf3-bindung', '/termine', '/klasse', '/einstellungen', '/datenschutz',
  '/fortschritt#missionen', '/fortschritt/store', '/fortschritt/store?auswahl=owned',
  '/fortschritt/studio', '/fortschritt/begleiter', '/fortschritt/speicher',
];
const widths = [320, 375, 390, 430, 768, 1024, 1440, 1920];
const safari = process.env.TEST_WEBKIT === '1';
const browser = await (safari ? webkit : chromium).launch({
  executablePath: process.env.BROWSER_EXECUTABLE,
  ...(safari ? {} : { args: ['--no-sandbox'] }),
});
try {
  const page = await browser.newPage({ reducedMotion: 'reduce', hasTouch: true });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(base + '#/fortschritt/speicher');
  await page.getByRole('button', { name: 'Progress freiwillig aktivieren', exact: true }).click();
  await page.getByText('Progress ist aktiviert.', { exact: true }).waitFor();
  for (const route of routes) {
    await page.goto(base + '#' + route);
    await page.getByRole('main').waitFor();
    await page.getByRole('heading', { level: 1 }).first().waitFor();
    await page.waitForFunction(() => !Array.from(globalThis.document.querySelectorAll('main [role="status"]'))
      .some(element => element.textContent.trim() === 'LernHub wird geladen'));
    assert.equal(await page.getByRole('heading', { name: /Seite nicht gefunden|Lernzettel nicht gefunden|Material nicht gefunden/i }).count(), 0, route);
    for (const width of widths) {
      await page.setViewportSize({ width, height: 900 });
      const overflow = await page.evaluate(() => globalThis.document.documentElement.scrollWidth - globalThis.innerWidth);
      assert.ok(overflow <= 1, `${route}, ${width}px: ${overflow}px horizontal overflow`);
      if (route === '/' && width <= 430) {
        const groups = page.locator('.home-bk-group');
        assert.equal(await groups.count(), 2);
        const [left, right] = await Promise.all([groups.nth(0).boundingBox(), groups.nth(1).boundingBox()]);
        assert.ok(left && right && left.x < right.x && Math.abs(left.y - right.y) <= 1);
        assert.equal(await page.locator('.home-bk-group .home-bk-fields a').count(), 16);
      }
    }
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(async () => {
    const { importProgress } = await import('/src/features/progression/storage.ts');
    const { emptyState } = await import('/src/features/progression/engine.ts');
    const at = new Date().toISOString();
    await importProgress({ format: 'lernhub-progress', version: 1, exportedAt: at, state: {
      ...emptyState(), xp: 1, credits: 250,
      transactions: [{ id: 'collection:polish-fixture', kind: 'collection', title: 'Testguthaben', at, xp: 1, credits: 250 }],
    } });
  });
  await page.goto(base + '#/fortschritt/store?q=Crystal');
  await page.reload();
  const product = page.locator('article').filter({ has: page.getByRole('heading', { name: 'Crystal', exact: true }) });
  await product.getByRole('button', { name: 'Vorschau für Crystal', exact: true }).click();
  await page.getByRole('button', { name: 'Vorschau schließen', exact: true }).click();
  await product.getByRole('button', { name: 'Eintauschen', exact: true }).click();
  await product.getByRole('button', { name: 'Für 200 Credits bestätigen', exact: true }).click();
  await product.getByRole('link', { name: 'LernHub Studio', exact: true }).click();
  await page.getByRole('button', { name: 'Design anwenden', exact: true }).click();
  await page.getByText('Design angewendet.', { exact: true }).waitFor();
  await page.reload();
  const equipped = await page.evaluate(async () => {
    const { readProgressSnapshot } = await import('/src/features/progression/storage.ts');
    const { state } = await readProgressSnapshot();
    return { glass: state.equipped.glass, credits: state.credits, owned: state.owned.includes('crystal-glass') };
  });
  assert.deepEqual(equipped, { glass: 'crystal-glass', credits: 50, owned: true });
  await page.goto(base + '#/einstellungen');
  const language = page.locator('select').filter({ has: page.locator('option[value="uk"]') });
  await language.first().selectOption('uk');
  await page.locator('html[lang="uk"]').waitFor();
  await page.reload();
  await page.locator('html[lang="uk"]').waitFor();
  await language.first().selectOption('de');
  await page.locator('html[lang="de"]').waitFor();
  if (process.env.TEST_CATALOG === '1') {
    const sheets = JSON.parse(await readFile(new URL('../src/data/study-sheets.json', import.meta.url), 'utf8'));
    let pages = 0;
    for (const sheet of sheets) {
      const root = '/lernzettel/' + sheet.id;
      for (const [route, title] of [[root, sheet.title], ...sheet.sections.map(section => [root + '/' + section.id, section.title])]) {
        await page.goto(base + '#' + route);
        await page.getByRole('heading', { name: title, exact: true, level: 1 }).waitFor();
        assert.ok(await page.evaluate(() => globalThis.document.documentElement.scrollWidth <= globalThis.innerWidth + 1), route);
        pages++;
      }
    }
    await page.goto(base + '#/fortschritt/store');
    const products = page.locator('.cosmetic-product');
    await products.first().waitFor();
    const keys = await products.getByRole('button', { name: /^Vorschau für / }).evaluateAll(buttons => buttons.map(button => button.id));
    for (const key of keys) {
      await page.locator('#' + key).click();
      await page.locator('#store-preview-heading').waitFor();
      await page.getByRole('button', { name: 'Vorschau schließen', exact: true }).click();
    }
    console.log(`${pages} Lernzettel-Einstiege, ${keys.length} Shop-Vorschauen geöffnet.`);
  }
  assert.deepEqual(errors, []);
  console.log(`${safari ? 'WebKit' : 'Chromium'}: ${routes.length} routes × ${widths.length} widths`);
} finally {
  await browser.close();
}
