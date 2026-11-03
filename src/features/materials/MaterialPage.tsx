import { materialDetails } from './metadata';
import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Download, ExternalLink, Maximize, Minimize, FileText } from 'lucide-react';
import { catalog, subjectName, fieldName } from '../../data/catalog';
import { PageHeading, ExampleBadge, EmptyState } from '../../components/ui';
import { materialUrl, formatDate } from '../../utils/paths';
export function MaterialPage() {
  const { id } = useParams(); const m = catalog.materials.find(x => x.id === id);
  const viewer = useRef<HTMLDivElement>(null); const [full, setFull] = useState(false); const [message, setMessage] = useState('');
  useEffect(() => { const change = () => setFull(Boolean(document.fullscreenElement)); document.addEventListener('fullscreenchange', change); return () => document.removeEventListener('fullscreenchange', change); }, []);
  if (!m) return <EmptyState title="Material nicht gefunden"><Link to="/materialien">Zur Materialbibliothek</Link></EmptyState>;
  const url = materialUrl(m.path);
  const previewUrl = materialUrl(m.preview?.path ?? m.path);
  const isPdf = m.fileType === 'PDF' || Boolean(m.preview);
  const isImage = m.fileType === 'PNG';
  async function fullscreen() { try { if (document.fullscreenElement) await document.exitFullscreen(); else await viewer.current?.requestFullscreen(); } catch { setMessage('Vollbild wird hier nicht unterstützt. Öffne die Datei über „Separat öffnen“.'); } }
  return <><Link className="back-link" to="/materialien"><ArrowLeft size={16}/>Zur Materialbibliothek</Link><PageHeading eyebrow={`${subjectName(m.subjectId)}${fieldName(m.learningFieldId) ? ` / ${fieldName(m.learningFieldId)}` : ''}`} title={m.title} description={m.description}>{m.example && <ExampleBadge/>}</PageHeading>
    <div className="viewer-meta"><span>{m.kind} · {m.fileType} · {formatDate(m.publishedAt)}{materialDetails(m) && ` · ${materialDetails(m)}`}</span><div className="button-row"><a href={previewUrl} target="_blank" rel="noopener noreferrer" className="button secondary"><ExternalLink size={16}/>{m.preview ? 'PDF-Vorschau öffnen' : 'Separat öffnen'}</a><a href={url} download={m.originalFilename ?? true} className="button primary"><Download size={16}/>{m.preview ? 'Original herunterladen' : 'Herunterladen'}</a></div></div>
    {isPdf ? <div ref={viewer} className="pdf-viewer glass"><div className="viewer-toolbar"><span><FileText size={17}/>{m.preview ? 'PDF-Vorschau der Word-Datei' : 'PDF-Vorschau'}</span><button className="button secondary" onClick={() => void fullscreen()}>{full ? <Minimize size={16}/> : <Maximize size={16}/>} {full ? 'Vollbild verlassen' : 'Vollbild'}</button></div><iframe src={previewUrl} title={`PDF: ${m.title}`}/></div> : isImage ? <div ref={viewer} className="image-viewer glass"><div className="viewer-toolbar"><span><FileText size={17}/>Schaubild</span><button className="button secondary" onClick={() => void fullscreen()}>{full ? <Minimize size={16}/> : <Maximize size={16}/>} {full ? 'Vollbild verlassen' : 'Vollbild'}</button></div><a href={url} target="_blank" rel="noopener noreferrer" aria-label={`${m.title} in Originalgröße öffnen`}><img src={url} alt={m.title}/></a></div> : <div className="empty-state glass"><FileText size={40}/><h3>Datei herunterladen</h3><p>Diese {m.fileType}-Datei kannst du separat öffnen oder herunterladen.</p><a className="button primary" href={url} download><Download size={16}/>Datei herunterladen</a></div>}
    <p className="muted viewer-note">{message || (isImage ? 'Klicke auf das Schaubild, um es in Originalgröße zu öffnen.' : m.preview ? 'Die PDF-Vorschau dient zum Lesen im Browser. Über „Original herunterladen“ erhältst du die unveränderte Word-Datei.' : 'Falls dein Browser keine PDF-Vorschau unterstützt, verwende „Separat öffnen“ oder lade die Datei herunter. Auf Smartphones ist die separate Anzeige oft komfortabler.')}</p>
    <div className="tags">{m.tags.map(t => <span key={t}>{t}</span>)}</div>
  </>;
}
