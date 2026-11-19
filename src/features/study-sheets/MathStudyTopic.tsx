import { catalog } from '../../data/catalog';
import { MaterialSources } from '../../components/MaterialSources';
import { useI18n } from '../../i18n/context';
import { MathFormula, MathText } from './MathText';
import type { StudyTopic } from './data';

export default function MathStudyTopic({ topic, collection = false }: { topic: StudyTopic; collection?: boolean }) {
  const { tr } = useI18n();
  const Heading = collection ? 'h3' : 'h2';
  const Subheading = collection ? 'h4' : 'h3';
  const StepHeading = collection ? 'h5' : 'h4';
  const text = (value: string) => <MathText>{tr(value)}</MathText>;
  return <section className="sheet-topic math-topic" aria-label={tr(topic.title)}>
    {collection && <h2 className="sheet-topic-title" id={`sheet-${topic.id}`}>{tr(topic.title)}</h2>}
    <aside className="sheet-core glass" aria-label={tr('Kern des Themas')}><strong>{tr('Kern des Themas')}</strong><p>{text(topic.takeaway)}</p></aside>
    <section className="sheet-section glass"><Heading>{tr('Begriff und Bedeutung')}</Heading><p>{text(topic.intro)}</p></section>
    {topic.formulas && <section className="sheet-section glass math-formulas">
      <Heading>{tr('Allgemeine Formeln')}</Heading>
      <p>{tr('Die Formel vor dem Einsetzen der gegebenen Werte.')}</p>
      <dl>{topic.formulas.map(formula => <div key={formula.label}>
        <dt>{tr(formula.label)}</dt><dd><MathFormula latex={formula.latex} display/>{formula.note && <p>{text(formula.note)}</p>}</dd>
      </div>)}</dl>
    </section>}
    {topic.calculations && <section className="math-calculations" aria-label={tr('Rechnungen Schritt für Schritt')}>
      <Heading>{tr('Rechnungen Schritt für Schritt')}</Heading>
      {topic.calculations.map(calculation => <article className="sheet-section glass math-calculation" aria-label={tr(calculation.title)} key={calculation.title}>
        <header><p className="eyebrow">{tr('Durchgerechnetes Beispiel')}</p><Subheading>{tr(calculation.title)}</Subheading></header>
        <p className="math-goal"><strong>{tr('Gesucht:')}</strong> {text(calculation.goal)}</p>
        <div className="math-givens"><strong>{tr('Gegeben')}</strong><div>{calculation.givens.map(given => <MathFormula key={given} latex={given}/>)}</div></div>
        <div className="math-start-formula"><strong>{tr('Allgemeine Formel')}</strong><MathFormula latex={calculation.formula} display/></div>
        <ol className="math-steps">{calculation.steps.map((step, index) => <li key={step.label}>
          <span className="math-step-number" aria-hidden="true">{index + 1}</span>
          <div><StepHeading>{tr(step.label)}</StepHeading>
            {step.expressions.map((expression, i) => <MathFormula key={i} latex={expression} display/>)}
            {step.note && <p>{text(step.note)}</p>}
          </div>
        </li>)}</ol>
        <div className="math-result"><strong>{tr('Ergebnis')}</strong><MathFormula latex={calculation.result} display/><p>{text(calculation.interpretation)}</p></div>
        {calculation.check && <div className="math-check"><strong>{tr('Probe')}</strong>{calculation.check.expressions.map((expression, i) => <MathFormula key={i} latex={expression} display/>)}<p>{text(calculation.check.note)}</p></div>}
      </article>)}
    </section>}
    {topic.table && <section className="sheet-section glass"><Heading>{tr('Vergleich und Übersicht')}</Heading>
      <div className="sheet-table-wrap" role="region" tabIndex={0} aria-label={tr('Tabelle: {0}', [tr(topic.title)])}>
        <table role="table"><caption className="sr-only">{tr(topic.title)}</caption>
          <thead role="rowgroup"><tr role="row">{topic.table.headers.map(header => <th role="columnheader" scope="col" key={header}>{text(header)}</th>)}</tr></thead>
          <tbody role="rowgroup">{topic.table.rows.map((row, i) => <tr role="row" key={i}>{row.map((cell, j) => j === 0
            ? <th role="rowheader" scope="row" key={j}>{text(cell)}</th>
            : <td role="cell" key={j}><span className="sheet-cell-label" aria-hidden="true">{text(topic.table!.headers[j]!)}</span>{text(cell)}</td>)}</tr>)}</tbody>
        </table>
      </div>
    </section>}
    {topic.points && <section className="sheet-section glass"><Heading>{tr('Zusammenhänge und Einordnung')}</Heading><ul className="sheet-points">{topic.points.map(point => <li key={point}>{text(point)}</li>)}</ul></section>}
    <section className="sheet-section sheet-at-glance glass"><Heading>{tr('Auf einen Blick')}</Heading><p>{text(topic.takeaway)}</p>
      <MaterialSources ids={topic.materialIds} title={tr('Grundlagen dieses Lernzettels')}/>
      <div className="sheet-print-sources"><p><strong>{tr('Grundlagen dieses Lernzettels')}</strong></p><ul>{topic.materialIds.map(id => <li key={id}>{tr(catalog.materials.find(m => m.id === id)!.title)}</li>)}</ul></div>
    </section>
  </section>;
}
