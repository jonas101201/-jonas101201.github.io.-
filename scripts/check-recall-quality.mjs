import { parseArgs } from 'node:util';
import { recallQualityCases, qualityTask, checkQualityCase } from '../worker/fixtures/recall-quality.mjs';
import { recallModel, modelInput, validateRecallResult } from '../worker/src/recall.js';

const { values } = parseArgs({ options: {
  case: { type: 'string', multiple: true },
  'confirm-workers-free': { type: 'boolean' },
  list: { type: 'boolean' },
} });
if (values.list) {
  for (const entry of recallQualityCases) console.log(entry.id);
} else {
  const ids = values.case ?? [];
  if (!values['confirm-workers-free'] || !ids.length || ids.length > 5) {
    throw new Error('1 bis 5 Fälle mit --case <ID> und --confirm-workers-free angeben. Ohne Auswahl wird keine Anfrage gesendet.');
  }
  const cases = ids.map(id => recallQualityCases.find(entry => entry.id === id));
  if (cases.some(entry => !entry)) throw new Error('Unbekannter Testfall. Nutze --list für die verfügbaren IDs.');
  const account = process.env.CLOUDFLARE_ACCOUNT_ID;
  const token = process.env.CLOUDFLARE_API_TOKEN;
  if (!/^[a-f0-9]{32}$/.test(account ?? '') || !token) {
    throw new Error('CLOUDFLARE_ACCOUNT_ID und CLOUDFLARE_API_TOKEN aus einem autorisierten Workers-Free-Konto setzen.');
  }

  for (const example of cases) {
    try {
      const task = qualityTask(example.taskId);
      const input = modelInput(task, example.answer, 'de');
      if (!input) throw new Error('Kontextlimit überschritten.');
      const response = await fetch('https://api.cloudflare.com/client/v4/accounts/' + account + '/ai/run/' + recallModel, {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization: 'Bearer ' + token },
        body: JSON.stringify(input),
        signal: AbortSignal.timeout(45_000),
      });
      if (!response.ok) throw new Error('Cloudflare HTTP ' + response.status);
      const payload = await response.json();
      const result = validateRecallResult(task, example.answer, payload.result);
      if (!result) throw new Error('Ungültige Modellantwort.');
      const failures = checkQualityCase(example, result);
      const statuses = result.criteria.map(({ id, status }) => id + '=' + status).join(', ');
      console.log(example.id + ' · ' + (failures.length ? 'abweichend' : 'bestanden') + ' · ' + statuses);
      if (failures.length) {
        console.error(failures.join('\n'));
        process.exitCode = 1;
      }
    } catch (error) {
      // Print bounded status errors only. Prompts, responses and tokens stay out of logs.
      const message = error instanceof Error && /^(Cloudflare HTTP \d{3}|Ungültige Modellantwort\.)$/.test(error.message)
        ? error.message : 'Modellaufruf oder Ergebnisprüfung fehlgeschlagen.';
      console.error(example.id + ' · ' + message);
      process.exitCode = 1;
      break;
    }
  }
}
