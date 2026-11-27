import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const root = fileURLToPath(new URL('../', import.meta.url));
const destination = new URL('../worker/src/recall-index.json', import.meta.url);
const maxContextBytes = 11_000;

// Compile the same data modules that the browser uses. No private material
// repository, PDF downloads or OCR inputs are part of this build.
const bundle = await build({
  absWorkingDir: root,
  stdin: {
    resolveDir: root,
    contents: `export { tasks } from './src/features/blurting/tasks.ts';
export { studyTopics } from './src/features/study-sheets/data.ts';`,
  },
  bundle: true,
  platform: 'node',
  format: 'esm',
  write: false,
});
const { tasks, studyTopics } = await import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].contents).toString('base64')}`);

function sectionText(topic) {
  const lines = [topic.title, topic.intro];
  for (const point of topic.points ?? []) lines.push('- ' + point);
  for (const { term, definition } of topic.terms ?? []) lines.push(term + ': ' + definition);
  if (topic.table) {
    const { caption, headers, rows, totals } = topic.table;
    if (caption) lines.push(caption);
    lines.push(headers.join(' | '));
    for (const row of rows) lines.push(row.join(' | '));
    if (totals) lines.push(totals.join(' | '));
  }
  if (topic.context) lines.push(topic.context.title, topic.context.text);
  lines.push('Merksatz: ' + topic.takeaway);
  lines.push('Beispiel: ' + topic.caseStudy.scenario, 'Analyse: ' + topic.caseStudy.analysis, 'Handlung: ' + topic.caseStudy.action);
  for (const { label, latex, note } of topic.formulas ?? []) {
    lines.push(label + ': ' + latex);
    if (note) lines.push(note);
  }
  for (const calculation of topic.calculations ?? []) {
    lines.push(calculation.title, calculation.goal, ...calculation.givens, 'Formel: ' + calculation.formula);
    for (const { label, expressions, note } of calculation.steps) {
      lines.push(label, ...expressions);
      if (note) lines.push(note);
    }
    lines.push('Ergebnis: ' + calculation.result, calculation.interpretation);
    if (calculation.check) lines.push('Probe:', ...calculation.check.expressions, calculation.check.note);
  }
  return lines.join('\n');
}

const topicByPath = new Map(studyTopics.map(topic => [topic.to, topic]));
const available = {};
const unavailable = {};
let largestBytes = 0;
for (const task of tasks) {
  const source = topicByPath.get(task.sourcePath);
  if (!source || source.subjectId !== task.subjectId || source.learningFieldId !== task.learningFieldId ||
      !task.concepts.length || task.concepts.some(concept => !source.topic.points?.includes(concept.explanation))) {
    unavailable[task.id] = 'missing_source';
    continue;
  }

  const context = {
    taskId: task.id,
    subjectId: task.subjectId,
    learningFieldId: task.learningFieldId,
    title: task.title,
    prompt: task.prompt,
    criteria: task.concepts.map(({ id, title, explanation, weight }) => ({ id, title, explanation, weight })),
    sources: [{
      id: source.id,
      sheetId: source.parentId,
      sectionId: source.topic.id,
      title: source.title,
      to: source.to,
      text: sectionText(source.topic),
      materialIds: source.topic.materialIds,
    }],
  };
  const canonical = JSON.stringify(context);
  const version = 'sha256:' + createHash('sha256').update(canonical).digest('hex');
  const record = { version, ...context };
  const bytes = Buffer.byteLength(JSON.stringify(record));
  if (bytes > maxContextBytes) {
    unavailable[task.id] = 'context_too_large';
    continue;
  }
  largestBytes = Math.max(largestBytes, bytes);
  available[task.id] = record;
}
const json = JSON.stringify({ schemaVersion: 1, tasks: available, unavailable }, null, 2) + '\n';
if (process.argv.includes('--check')) {
  if ((await readFile(destination, 'utf8')) !== json) throw new Error('Wissensindex veraltet. Erneut scripts/build-recall-index.mjs ausführen.');
} else {
  await writeFile(destination, json);
}
console.log(`Smart Recall: ${Object.keys(available).length}/${tasks.length} Aufgaben, größter Kontext ${largestBytes} Bytes.`);
