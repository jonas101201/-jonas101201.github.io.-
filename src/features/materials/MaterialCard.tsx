import { useI18n } from "../../i18n/context";
import { Download, ArrowUpRight, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Material } from '../../types/content';
import { materialDetails } from './metadata';
import { subjectName, fieldName } from '../../data/catalog';
import { formatDate, isNew, materialUrl } from '../../utils/paths';
export function MaterialCard({ material: m }: {
    material: Material;
}) {
    const { tr, locale } = useI18n();
    const url = materialUrl(m.path);
    return <article className="material-card glass"><div className="material-card-head"><span className={`file-icon ${m.fileType === 'PDF' ? 'pdf' : ''}`}><FileText size={22}/></span><span className="eyebrow">{tr(subjectName(m.subjectId))}{m.learningFieldId && ` · ${tr(fieldName(m.learningFieldId))}`} · {tr(m.kind)}</span>{isNew(m.publishedAt) && <span className="badge new">{tr("NEU")}</span>}</div>
    <Link className="material-title" to={`/materialien/${m.id}`}><h3>{tr(m.title)}</h3><ArrowUpRight size={18}/></Link><p className="material-description">{tr(m.description)}</p>
    <div className="tags">{m.tags.map(t => <span key={t}>{t}</span>)}</div>
    <div className="material-footer"><span>{m.fileType} <i /> {formatDate(m.publishedAt, locale)}</span>{url && <a className="icon-button" href={`${url}?download=1`} target="_blank" rel="noopener noreferrer" aria-label={tr("{0} herunterladen", [tr(m.title)])}><Download size={17}/></a>}</div>{materialDetails(m, locale) && <p className="file-details">{materialDetails(m, locale)}</p>}{m.example && <span className="example-note">{tr("Beispielinhalt")}</span>}
  </article>;
}
