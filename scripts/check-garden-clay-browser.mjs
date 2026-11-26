// Run with Vite in development mode, using an installed Playwright.
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import { pathToFileURL } from 'node:url';

const { chromium, webkit } = await import(process.env.PLAYWRIGHT_MODULE
  ? pathToFileURL(process.env.PLAYWRIGHT_MODULE).href : 'playwright');
const useWebKit = process.env.TEST_WEBKIT === '1';
const browser = await (useWebKit ? webkit : chromium).launch({
  executablePath: process.env.BROWSER_EXECUTABLE,
  ...(useWebKit ? {} : { args: ['--no-sandbox'] }),
});
const url = process.env.LERNHUB_TEST_URL ?? 'http://127.0.0.1:5194/';
const fullGarden = process.env.GARDEN_FULL_SET === '1';
const output = process.env.GARDEN_SCREENSHOT_DIR;
const withLogo = process.env.GARDEN_LOGO === '1';
const selectors = ['.home-heading', '.home-heading h1', '.home-date', '.brand-mark', '.home-bk-group', '.home-bk-heading', '.home-bk-heading h2', '.home-bk-fields', '.home-bk-fields a', '.topbar', '.mobile-dock', '.home-resume-card'];

async function layout(page) {
  return page.evaluate(items => items.flatMap(selector => Array.from(globalThis.document.querySelectorAll(selector), element => {
    const { x, y, width, height } = element.getBoundingClientRect();
    const style = globalThis.getComputedStyle(element);
    return [selector, element.textContent, x, y, width, height, style.fontSize, style.padding, style.margin];
  })), selectors);
}
async function equip(page, apply) {
  await page.evaluate(async ({ on, full, logo }) => {
    const { enableProgress, importProgress, commitAction } = await import('/src/features/progression/storage.ts');
    const { emptyState } = await import('/src/features/progression/engine.ts');
    const { cosmeticById } = await import('/src/features/progression/cosmetics.ts');
    const { enchantedGarden } = await import('/src/features/progression/worlds.ts');
    const at = new Date().toISOString();
    const emblem = cosmeticById('logo-herbarium');
    const credits = enchantedGarden.price + (logo && emblem?.condition.type === 'credits' ? emblem.condition.price : 0);
    if (on) {
      await enableProgress();
      await importProgress({ format: 'lernhub-progress', version: 1, exportedAt: at, state: {
        ...emptyState(), xp: 500, credits,
        transactions: [{ id: 'collection:browser-fixture', kind: 'collection', title: 'Browser fixture', at, xp: 500, credits }],
      } });
      await commitAction({ type: 'world-buy', id: enchantedGarden.id, at });
      if (logo) await commitAction({ type: 'cosmetic-buy', id: 'logo-herbarium', at });
    }
    const equipped = on ? { ...(full ? enchantedGarden.look : { glass: 'garden-clay' }), ...(logo ? { logo: 'logo-herbarium' } : {}) } : {};
    await commitAction({ type: 'equip', equipped });
  }, { on: apply, full: fullGarden, logo: withLogo });
  await page.reload();
  await page.locator(apply ? 'html[data-living-clay="garden-clay"]' : 'html:not([data-living-clay])').waitFor();
  await page.locator('.home-bk-group[data-subject="bk1"]').waitFor();
  await page.evaluate(() => globalThis.document.fonts.ready.then(() => undefined));
}
try {
  for (const width of [320, 390, 1440]) {
    for (const theme of ['dark', 'light']) {
      const context = await browser.newContext({ viewport: { width, height: 880 }, reducedMotion: 'reduce', deviceScaleFactor: 1 });
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.addInitScript(mode => { localStorage.setItem('lernhub:theme:v1', mode); }, theme);
      await page.goto(url);
      await page.locator('.home-bk-group[data-subject="bk1"]').waitFor();
      await page.evaluate(() => globalThis.document.fonts.ready.then(() => undefined));
      const baseline = await layout(page);
      const bk2 = page.locator('.home-bk-group[data-subject="bk2"]');
      const unchanged = await bk2.evaluate(node => globalThis.getComputedStyle(node).background);
      const card = page.locator('.home-bk-groups');
      const path = stage => output + '/' + width + '-' + theme + '-' + stage + '.png';
      if (output) {
        await mkdir(dirname(path('before')), { recursive: true });
        await card.screenshot({ path: path('before'), animations: 'disabled' });
      }
      const forest = fullGarden ? page.waitForResponse(response => /\/worlds\/enchanted-garden(?:-small)?\.webp$/.test(response.url())) : null;
      const logo = withLogo ? page.waitForResponse(response => response.url().endsWith('/worlds/logo-herbarium.webp')) : null;
      const asset = page.waitForResponse(response => response.url().endsWith('/worlds/garden-bk1-ivy.webp'));
      await equip(page, true);
      assert.equal((await asset).status(), 200);
      if (forest) assert.equal((await forest).status(), 200);
      assert.match(await page.locator('.home-resume-card').evaluate(node => globalThis.getComputedStyle(node).backgroundImage), /garden-relief/);
      assert.deepEqual(await layout(page), baseline, width + ' ' + theme);
      assert.notEqual(await bk2.evaluate(node => globalThis.getComputedStyle(node).background), unchanged);
      assert.equal(await page.locator('html').getAttribute('data-studio-glass'), null);
      if (logo) {
        assert.equal((await logo).status(), 200);
        assert.equal(await page.locator('html').getAttribute('data-studio-logo'), 'logo-herbarium');
        const mark = page.locator('.home-mobile-brand .brand-mark').first();
        assert.match(await mark.evaluate(node => globalThis.getComputedStyle(node).content), /logo-herbarium\.webp/);
      }
      if (output) {
        await page.screenshot({ path: path('overview'), animations: 'disabled' });
        await card.screenshot({ path: path('after'), animations: 'disabled' });
      }
      await equip(page, false);
      if (logo) assert.equal(await page.locator('html').getAttribute('data-studio-logo'), null);
      assert.equal(await bk2.evaluate(node => globalThis.getComputedStyle(node).background), unchanged);
      assert.deepEqual(await layout(page), baseline);
      assert.deepEqual(errors, []);
      await context.close();
    }
  }
  console.log('BK1: same bounds, type, padding and margins before/equipped/reset at three widths in both themes.');
} finally {
  await browser.close();
}
