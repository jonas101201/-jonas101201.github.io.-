import { useI18n } from "../../i18n/context";
import { materialDetails } from './metadata';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Download, ExternalLink, FileText } from 'lucide-react';
import { catalog, subjectName, fieldName } from '../../data/catalog';
import { PageHeading, ExampleBadge, EmptyState } from '../../components/ui';
import { materialUrl, formatDate } from '../../utils/paths';
export function MaterialPage() {
    const { tr, locale, language } = useI18n();
    const { id } = useParams();
    const m = catalog.materials.find(x => x.id === id);
    if (!m)
        return <EmptyState title={tr("Material nicht gefunden")}><Link to="/materialien">{tr("Zur Materialbibliothek")}</Link></EmptyState>;
    const url = materialUrl(m.path);
    const previewUrl = materialUrl(m.preview?.path ?? m.path);
    return <><Link className="back-link" to="/materialien"><ArrowLeft size={16}/>{tr("Zur Materialbibliothek")}</Link><PageHeading eyebrow={`${tr(subjectName(m.subjectId))}${tr(fieldName(m.learningFieldId)) ? ` / ${tr(fieldName(m.learningFieldId))}` : ''}`} title={tr(m.title)} description={tr(m.description)}>{m.example && <ExampleBadge />}</PageHeading>
    {language === 'uk' && <p className="notice">{tr('Die Originaldateien bleiben auf Deutsch.')}</p>}<div className="viewer-meta"><span>{tr(m.kind)} · {m.fileType} · {formatDate(m.publishedAt, locale)}{materialDetails(m, locale) && ` · ${materialDetails(m, locale)}`}</span></div>
    <div className="empty-state glass"><FileText size={40}/><h3>{tr("Gesch\u00FCtztes Material")}</h3>{url && previewUrl ? <><p>{tr("Melde dich mit deiner freigegebenen E-Mail-Adresse und dem Einmalcode an. Die Datei \u00F6ffnet sich in einem neuen Tab. Wie deine Anmeldedaten verarbeitet werden, steht in der ")}<Link className="text-link" to="/datenschutz">{tr("Datenschutzerkl\u00E4rung")}</Link>.</p><div className="button-row"><a className="button secondary" href={previewUrl} target="_blank" rel="noopener noreferrer"><ExternalLink size={16}/>{m.preview ? tr('PDF-Vorschau öffnen') : tr('Material öffnen')}</a><a className="button primary" href={`${url}?download=1`} target="_blank" rel="noopener noreferrer"><Download size={16}/>{m.preview ? tr('Original herunterladen') : tr('Herunterladen')}</a></div></> : <p>{tr("Der gesch\u00FCtzte Materialzugriff ist noch nicht eingerichtet. Bitte versuche es sp\u00E4ter erneut.")}</p>}</div>
    <div className="tags">{m.tags.map(t => <span key={t}>{t}</span>)}</div>
  </>;
}
