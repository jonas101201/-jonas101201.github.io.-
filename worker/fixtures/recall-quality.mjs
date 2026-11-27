import sheets from '../../src/data/study-sheets.json' with { type: 'json' };
import index from '../src/recall-index.json' with { type: 'json' };
import fixture from './recall-quality-cases.json' with { type: 'json' };

export const recallQualityCases = fixture.cases;

// Keep the exact regression question out of the shipped route's task registry.
const spec = fixture.testOnlyTask;
const sheet = sheets.find(item => item.id === spec.sheetId);
const section = sheet?.sections.find(item => item.id === spec.sectionId);
if (section?.table?.rows.length !== spec.criteriaByTableRow.length) {
  throw new Error('Die Regressionstestfrage referenziert eine geänderte Tabelle.');
}
const sourceId = spec.sheetId + '/' + spec.sectionId;
const developmentTask = {
  version: 'qa-v1:' + index.tasks[spec.productionTaskId].version,
  taskId: spec.taskId,
  subjectId: sheet.subjectId,
  learningFieldId: sheet.learningFieldId,
  title: section.title,
  prompt: spec.prompt,
  criteria: section.table.rows.map(([title, explanation], position) => ({
    id: spec.criteriaByTableRow[position], title, explanation, weight: 1,
  })),
  sources: [{
    id: sourceId, sheetId: spec.sheetId, sectionId: spec.sectionId, title: section.title,
    to: '/lernzettel/' + sourceId,
    text: [section.title, section.intro, ...section.points, ...section.table.rows.map(row => row.join(' | ')), section.takeaway].join('\n'),
    materialIds: section.materialIds,
  }],
};

export function qualityTask(taskId) {
  return taskId === spec.taskId ? developmentTask : index.tasks[taskId];
}

export function checkQualityCase(example, result) {
  const statuses = new Map(result.criteria.map(criterion => [criterion.id, criterion.status]));
  const failures = Object.entries(example.expected.criteria ?? {}).flatMap(([criterion, allowed]) =>
    allowed.includes(statuses.get(criterion)) ? [] : [criterion + '=' + statuses.get(criterion) + ', erwartet ' + allowed.join('/')]);
  for (const criterion of example.expected.noCredit ?? []) {
    // Unknown criteria and uncertainty here fail the release test. Even the
    // optimistic boundary of a strict no-credit case must stay at zero.
    if (!['wrong', 'missing', 'incomplete'].includes(statuses.get(criterion))) {
      failures.push(criterion + '=' + statuses.get(criterion) + ', keine Punkte erwartet');
    }
  }
  return failures;
}
