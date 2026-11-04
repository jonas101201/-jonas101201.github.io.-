import { materialDetails } from './metadata';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Download, ExternalLink, FileText } from 'lucide-react';
import { catalog, subjectName, fieldName } from '../../data/catalog';
import { PageHeading, ExampleBadge, EmptyState } from '../../components/ui';
import { materialUrl, formatDate } from '../../utils/paths';
export function MaterialPage() {
  const { id } = useParams(); const m = catalog.materials.find(x => x.id === id);
  if (!m) return <EmptyState title="Material nicht gefunden"><Link to="/materialien">Zur Materialbibliothek</Link></EmptyState>;
  const url = materialUrl(m.path);
  const previewUrl = materialUrl(m.preview?.path ?? m.path);
  return <><Link className="back-link" to="/materialien"><ArrowLeft size={16}/>Zur Materialbibliothek</Link><PageHeading eyebrow={`${subjectName(m.subjectId)}${fieldName(m.learningFieldId) ? ` / ${fieldName(m.learningFieldId)}` : ''}`} title={m.title} description={m.description}>{m.example && <ExampleBadge/>}</PageHeading>
    <div className="viewer-meta"><span>{m.kind} · {m.fileType} · {formatDate(m.publishedAt)}{materialDetails(m) && ` · ${materialDetails(m)}`}</span></div>
    <div className="empty-state glass"><FileText size={40}/><h3>Geschütztes Material</h3>{url && previewUrl ? <><p>Melde dich mit deiner freigegebenen E-Mail-Adresse und dem Einmalcode an. Die Datei öffnet sich in einem neuen Tab. Wie deine Anmeldedaten verarbeitet werden, steht in der <Link className="text-link" to="/datenschutz">Datenschutzerklärung</Link>.</p><div className="button-row"><a className="button secondary" href={previewUrl} target="_blank" rel="noopener noreferrer"><ExternalLink size={16}/>{m.preview ? 'PDF-Vorschau öffnen' : 'Material öffnen'}</a><a className="button primary" href={`${url}?download=1`} target="_blank" rel="noopener noreferrer"><Download size={16}/>{m.preview ? 'Original herunterladen' : 'Herunterladen'}</a></div></> : <p>Der geschützte Materialzugriff ist noch nicht eingerichtet. Bitte versuche es später erneut.</p>}</div>
    <div className="tags">{m.tags.map(t => <span key={t}>{t}</span>)}</div>
  </>;
}
