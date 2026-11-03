import { Download, ArrowUpRight, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Material } from '../../types/content';
import { materialDetails } from './metadata';
import { subjectName, fieldName } from '../../data/catalog';
import { formatDate, isNew, materialUrl } from '../../utils/paths';
export function MaterialCard({ material: m }: { material: Material }) {
  return <article className="material-card glass"><div className="material-card-head"><span className={`file-icon ${m.fileType === 'PDF' ? 'pdf' : ''}`}><FileText size={22}/></span><span className="eyebrow">{subjectName(m.subjectId)}{m.learningFieldId && ` · ${fieldName(m.learningFieldId)}`} · {m.kind}</span>{isNew(m.publishedAt) && <span className="badge new">NEU</span>}</div>
    <Link className="material-title" to={`/materialien/${m.id}`}><h3>{m.title}</h3><ArrowUpRight size={18}/></Link><p className="material-description">{m.description}</p>
    <div className="tags">{m.tags.map(t => <span key={t}>{t}</span>)}</div>
    <div className="material-footer"><span>{m.fileType} <i/> {formatDate(m.publishedAt)}</span><a className="icon-button" href={materialUrl(m.path)} download={m.originalFilename ?? true} aria-label={`${m.title} herunterladen`}><Download size={17}/></a></div>{materialDetails(m) && <p className="file-details">{materialDetails(m)}</p>}{m.example && <span className="example-note">Beispielinhalt</span>}
  </article>;
}
