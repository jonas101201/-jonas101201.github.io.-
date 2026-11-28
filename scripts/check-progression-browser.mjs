// Start Vite on localhost. Set PLAYWRIGHT_MODULE to an installed Playwright
// entry point. No test runner dependency is added to the production project.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

const { chromium, webkit, devices } = await import(process.env.PLAYWRIGHT_MODULE
  ? pathToFileURL(process.env.PLAYWRIGHT_MODULE).href : 'playwright');
const url = process.env.LERNHUB_TEST_URL ?? 'http://127.0.0.1:5198/';
const safari = process.env.TEST_WEBKIT === '1';
const browser = await (safari ? webkit : chromium).launch({
  executablePath: process.env.BROWSER_EXECUTABLE,
  ...(safari ? {} : { args: ['--no-sandbox'] }),
});
const source = JSON.parse(await readFile(new URL('../src/data/catalog.json', import.meta.url), 'utf8'));

// The fake clock drives the progression rules. It can freeze WebKit's
// animation-based click stability check, so validate enabled state and invoke
// these two completion controls directly after actual input interactions.
async function finishClick(locator) {
  await locator.evaluate(button => {
    if (button.disabled) throw new Error('Completion control is disabled');
    button.click();
  });
}

async function completedRecall(page) {
  await page.getByRole('button', { name: 'Wissen abrufen', exact: true }).click();
  assert.equal(await page.getByRole('heading', { name: 'Erwartungshorizont und Selbsteinschätzung' }).count(), 0);
  await page.getByRole('textbox', { name: 'Deine Antwort', exact: true })
    .fill('Sicherheit und Nähe helfen dem Kind, sich bei Belastung zu beruhigen und die Umgebung selbstständig zu erkunden.');
  await page.clock.fastForward(30_000);
  await page.getByRole('button', { name: 'Antwort absenden und vergleichen', exact: true }).click();
  await page.getByRole('heading', { name: 'Erwartungshorizont und Selbsteinschätzung' }).waitFor();
  for (const radio of await page.getByRole('radio', { name: 'Teilweise erinnert', exact: true }).all()) await radio.click({force:true});
  await finishClick(page.getByRole('button', { name: 'Selbsteinschätzung abschließen', exact: true }));
  await page.getByRole('heading', { name: 'Wissensabruf abgeschlossen', exact: true }).waitFor();
}

async function completeQuiz(page) {
  const id = page.url().match(/\/quizze\/([^?]+)/)?.[1];
  const quiz = source.quizzes.find(item => item.id === id);
  assert(quiz);
  await page.getByRole('heading', { name: quiz.title, exact: true }).waitFor();
  // An honest attempt can earn the first activity reward even if wrong.
  await page.clock.fastForward(2_000 * quiz.questions.length + 4_000);
  for (let index = 0; index < quiz.questions.length; index++) {
    const card = page.locator('.question-card');
    // React renders only the current question, including the shuffled answer order.
    const prompt = await card.getByRole('heading').innerText();
    const model = quiz.questions.find(item => item.prompt === prompt);
    assert(model, prompt);
    if (model.type === 'matching') {
      const controls = await card.getByRole('combobox').all();
      for (const [offset, field] of controls.entries()) await field.selectOption(model.pairs[offset].id);
    } else {
      const first = card.getByRole(model.type === 'multiple' ? 'checkbox' : 'radio').first();
      await first.check({force:true});
    }
    const check = card.getByRole('button', { name: 'Antwort prüfen', exact: true });
    if (await check.count()) await finishClick(check);
    await card.getByRole('button', { name: /^(Nächste Frage|Ergebnis anzeigen)$/ }).evaluate(button => button.click());
  }
  await page.locator('.quiz-result').waitFor();
}

async function completeCards(page) {
  const set = source.flashcardSets.find(item => page.url().endsWith('/karteikarten/' + item.id));
  assert(set);
  await page.getByRole('heading', { name: set.title, exact: true }).waitFor();
  await page.clock.fastForward(2_000 * set.cards.length + 4_000);
  for (const card of set.cards) {
    assert(card.id);
    await page.locator('button.flashcard').click();
    await page.getByRole('button', { name: 'Gewusst', exact: true }).click();
  }
  await page.getByRole('heading', { name: 'Lernrunde abgeschlossen', exact: true }).waitFor();
}

try {
  const context = await browser.newContext({ ...(safari ? devices['iPhone 13'] : {}), reducedMotion: 'reduce', acceptDownloads: true });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.clock.install();
  const recall = '#/blurting/bk1-lf3-bindung';
  await page.goto(url + recall);
  await completedRecall(page);
  const key = 'lernhub:learning-progress-consent:v1';
  assert.equal(await page.evaluate(key => globalThis.localStorage.getItem(key), key), null);
  assert.equal(await page.getByText(/HUB Credits erhalten/).count(), 0);

  await page.goto(url + '#/fortschritt');
  await page.getByRole('button', { name: 'Progress freiwillig aktivieren', exact: true }).click();
  await page.getByRole('heading', { name: 'Level 1', exact: true }).waitFor();
  await page.goto(url + recall);
  await completedRecall(page);
  await page.getByText('80 XP und 35 HUB Credits erhalten.', { exact: true }).waitFor();

  {
    await page.goto(url + '#/fortschritt');
    const goal = page.locator('select').filter({ has: page.locator('option[value="bk1-lf3"]') });
    await goal.selectOption('bk1-lf3');
    const quick = page.locator('article.glass').filter({ hasText: 'Quick Mission' }).first();
    await quick.getByRole('button', { name: 'Mission starten', exact: true }).click();
    await page.waitForFunction(async () => {
      const { readProgressSnapshot } = await import('/src/features/progression/storage.ts');
      return (await readProgressSnapshot()).state.missions.some(item => item.status === 'active');
    });
    const plan = await page.evaluate(async () => {
      const { readProgressSnapshot } = await import('/src/features/progression/storage.ts');
      return (await readProgressSnapshot()).state.missions.find(item => item.status === 'active').plan;
    });
    for (const step of plan.steps) {
      await page.goto(url + '#' + step.to);
      if (step.kind === 'blurting') await completedRecall(page);
      else if (step.kind === 'cards') await completeCards(page);
      else await completeQuiz(page);
    }
    await page.goto(url + '#/fortschritt');
    await page.waitForFunction(async id => {
      const { readProgressSnapshot } = await import('/src/features/progression/storage.ts');
      return (await readProgressSnapshot()).state.missions.some(item => item.id === id && item.status === 'completed');
    }, plan.id);
  }

  await page.goto(url + '#/fortschritt/speicher');
  await page.getByRole('checkbox', { name: 'Abruftexte und Entwürfe separat speichern' }).click();
  await page.getByText('Textspeicherung aktiviert.', { exact: true }).waitFor();
  const integrity = await page.evaluate(async () => {
    const storage = await import('/src/features/progression/storage.ts');
    const topic = 'bk1-lf3-bindung';
    const snapshot = await storage.readProgressSnapshot();
    const { epoch, textGeneration } = snapshot;
    const draft = { version: 1, id: crypto.randomUUID(), phase: 'write', answer: 'Lokaler Testentwurf', ratings: {}, showTimer: false, startedAt: Date.now() };
    const text = JSON.stringify(draft);
    const wrote = await storage.commitDraft(topic, text, epoch, textGeneration);
    const restored = await storage.loadDraft(topic, epoch, textGeneration);
    const finished = await storage.finishDraft(topic, draft.id, JSON.stringify({ ...draft, phase: 'compare' }), epoch, textGeneration);
    const resurrected = await storage.commitDraft(topic, text, epoch, textGeneration);
    const backup = await storage.exportProgress(true);
    const imported = await storage.importProgress(backup, epoch);
    const staleWrite = await storage.commitDraft(topic, text, epoch, textGeneration);
    const importedText = await storage.loadDraft('completed:' + topic, epoch, imported.textGeneration);
    return { wrote, restored: restored === text, finished, resurrected, staleWrite, importedText: Boolean(importedText) };
  });
  assert.deepEqual(integrity, { wrote: true, restored: true, finished: true, resurrected: false, staleWrite: false, importedText: true });
  await page.locator('summary').filter({ hasText: 'Sicherung und Import' }).click();
  const downloaded = page.waitForEvent('download');
  await page.getByRole('button', { name: 'JSON-Sicherung herunterladen', exact: true }).click();
  const path = await (await downloaded).path();
  const backup = JSON.parse(await readFile(path, 'utf8'));
  assert(backup.state.xp >= 80 && !backup.drafts);
  const file = { name:'lernhub-progress.json', mimeType:'application/json', buffer:Buffer.from(JSON.stringify(backup)) };
  await page.locator('input[type=file]').setInputFiles(file);
  await page.getByRole('button', { name: 'Progress überschreiben und importieren' }).waitFor();
  await page.getByRole('button', { name: 'Progress überschreiben und importieren' }).click();
  await page.getByText('Progress aus der Sicherung wiederhergestellt.', { exact:true }).waitFor();

  const second = await context.newPage();
  await second.goto(url + '#/fortschritt/speicher');
  await second.getByText('Progress ist aktiviert.', { exact:true }).waitFor();
  await page.getByRole('button', { name: 'Progress deaktivieren und löschen', exact:true }).click();
  await page.getByRole('button', { name: 'Jetzt löschen und deaktivieren', exact:true }).click();
  await second.getByRole('button', { name: 'Progress freiwillig aktivieren', exact:true }).waitFor();

  await page.goto(url + '#/einstellungen');
  for (const [name, theme] of [['Hell', 'light'], ['Dunkel', 'dark']]) {
    await page.getByRole('button', { name, exact: true }).click();
    await page.locator(`html[data-theme="${theme}"]`).waitFor();
    await page.reload();
    await page.locator(`html[data-theme="${theme}"]`).waitFor();
  }

  const widths = [320,375,390,430,768,1024,1440,1920];
  for (const width of widths) {
    await page.setViewportSize({width,height:850});
    for (const route of ['fortschritt','fortschritt/store','fortschritt/studio','fortschritt/begleiter','blurting']) {
      await page.goto(url + '#/' + route);
      await page.locator('main h1').waitFor();
      assert(await page.evaluate(() => globalThis.document.documentElement.scrollWidth <= globalThis.innerWidth + 1), route + ' overflow at ' + width);
    }
  }
  assert.deepEqual(errors, []);
  console.log(JSON.stringify({ browser: safari ? 'WebKit' : 'Chromium', recall: true, award: true, mission: true, backup: true, textIntegrity: true, revokeAcrossTabs: true, themes: true, widths }));
} finally { await browser.close(); }
