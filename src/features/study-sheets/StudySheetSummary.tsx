import { Link } from 'react-router-dom';
import { useI18n } from '../../i18n/context';
import { MaterialSources } from '../../components/MaterialSources';
import { topicPath, type StudySheet } from './data';

export function StudySheetSummary({ sheet }: { sheet: StudySheet }) {
  const { tr, language } = useI18n();
  const wordBreaks: Record<string, string> = {
    Entwicklungsstand: 'Entwicklungs\u00adstand', Vorstellungsvermögen: 'Vorstellungs\u00advermögen',
    Umwelterfahrungen: 'Umwelt\u00aderfahrungen', Spielmöglichkeiten: 'Spiel\u00admöglichkeiten', Umweltverträglichkeit: 'Umwelt\u00adverträglichkeit',
  };
  const tableTerm = (term: string) => tr(term).replace(/Entwicklungsstand|Vorstellungsvermögen|Umwelterfahrungen|Spielmöglichkeiten|Umweltverträglichkeit/g, word => wordBreaks[word]!);
  const summary = sheet.shortVersion;
  if (!summary) return null;
  const sources = [...new Set(summary.sections.flatMap(section => sheet.sections.find(topic => topic.id === section.topicId)!.materialIds))];
  return <div className="sheet-summary">
    {summary.sections.map(section => <section className="sheet-section glass" key={section.id}>
      <h2>{tr(section.title)}</h2>
      {section.points.map(point => <p key={point}>{tr(point)}</p>)}
      {section.tables?.map(table => <div className="summary-table-wrap" key={table.caption}>
        <table className="summary-table" lang={language}>
          <caption>{tr(table.caption)}</caption>
          <thead><tr>{table.headers.map(header => <th scope="col" key={header}>{tr(header)}</th>)}</tr></thead>
          <tbody>{table.rows.map(([term, meaning]) => <tr key={term}><th scope="row">{tableTerm(term)}</th><td>{tr(meaning)}</td></tr>)}</tbody>
        </table>
      </div>)}
      <Link className="text-link sheet-summary-detail" to={topicPath(sheet, { id: section.topicId })}>{tr("Ausführlich nachlesen")}</Link>
    </section>)}
    <MaterialSources ids={sources} title={tr("Grundlagen dieses Lernzettels")}/>
  </div>;
}
