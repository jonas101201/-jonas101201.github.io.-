import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { test } from 'node:test';
import sheets from '../../src/data/study-sheets.json' with { type: 'json' };
import knowledge from './recall-index.json' with { type: 'json' };
import { recallQualityCases, qualityTask, checkQualityCase } from '../fixtures/recall-quality.mjs';

test('recall index versions content and references intact public study sheet sections', () => {
  assert.equal(knowledge.schemaVersion, 1);
  assert.ok(Object.keys(knowledge.tasks).length >= 19);
  for (const [id, { version, ...task }] of Object.entries(knowledge.tasks)) {
    assert.equal(id, task.taskId);
    assert.equal(version, 'sha256:' + createHash('sha256').update(JSON.stringify(task)).digest('hex'));
    assert.ok(Buffer.byteLength(JSON.stringify({ version, ...task })) <= 11_000);
    assert.ok(task.criteria.length > 0);
    for (const source of task.sources) {
      const sheet = sheets.find(sheet => sheet.id === source.sheetId);
      const section = sheet?.sections.find(section => section.id === source.sectionId);
      assert.ok(section);
      assert.equal(sheet.subjectId, task.subjectId);
      assert.equal(sheet.learningFieldId, task.learningFieldId);
      assert.equal(source.id, source.sheetId + '/' + source.sectionId);
      assert.equal(source.to, '/lernzettel/' + source.id);
      assert.deepEqual(source.materialIds, section.materialIds);
      assert.ok(source.text.includes(section.intro));
      assert.ok(source.text.includes(section.takeaway));
      assert.ok(!source.text.includes('/materials/'));
    }
    const section = sheets.find(sheet => sheet.id === task.sources[0].sheetId)
      .sections.find(section => section.id === task.sources[0].sectionId);
    assert.ok(task.criteria.every(({ explanation }) => section.points.includes(explanation)));
  }
});

test('manual quality cases resolve to real criteria and isolate the regression question', () => {
  const exact = qualityTask('qa-spiel-entwicklungsbereiche');
  assert.equal(exact.prompt, 'Welche Entwicklungsbereiche werden durch kindliches Spielen gefördert?');
  assert.equal(knowledge.tasks[exact.taskId], undefined);
  assert.equal(exact.sources[0].to, '/lernzettel/bk2-lf4/entwicklung');
  const expectedCases = [
    'Beim gemeinsamen Spielen entwickeln Kinder soziale Kompetenzen, indem sie Konflikte lösen und Regeln aushandeln.',
    'Kindliches Spielen verhindert die soziale Entwicklung.',
    'Penis wickeln verbessern die motorische Entwicklung.',
  ];
  assert.ok(expectedCases.every(answer => recallQualityCases.some(item => item.taskId === exact.taskId && item.answer === answer)));
  assert.equal(new Set(recallQualityCases.map(item => item.id)).size, recallQualityCases.length);
  for (const example of recallQualityCases) {
    const task = qualityTask(example.taskId);
    assert.ok(task, example.id);
    const known = new Set(task.criteria.map(criterion => criterion.id));
    for (const id of [...Object.keys(example.expected.criteria ?? {}), ...(example.expected.noCredit ?? [])]) {
      assert.ok(known.has(id), example.id + '/' + id);
    }
  }
});

test('quality runner flags optimistic credit for off-topic responses', () => {
  const example = recallQualityCases.find(item => item.id === 'spiel-unsinn-mit-fachwort');
  const criteria = qualityTask(example.taskId).criteria.map(({ id }) => ({ id, status: 'missing' }));
  assert.deepEqual(checkQualityCase(example, { criteria }), []);
  criteria.find(criterion => criterion.id === 'motorik').status = 'correct';
  assert.match(checkQualityCase(example, { criteria })[0], /motorik=correct/);
});
