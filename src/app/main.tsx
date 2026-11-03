import { StrictMode, Component, type ErrorInfo, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import '../styles/index.css';
class ErrorBoundary extends Component<{children: ReactNode}, {failed: boolean}> {
  state = {failed: false};
  static getDerivedStateFromError() { return {failed:true}; }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error('LernHub konnte nicht angezeigt werden.', error, info); }
  render() { return this.state.failed ? <div className="fatal-error"><h1>Die Anwendung konnte nicht geladen werden.</h1><p>Die Anwendung konnte nicht geladen werden. Bitte lade die Seite neu oder melde den Fehler der Administration.</p><button className="button primary" onClick={()=>window.location.reload()}>Neu laden</button></div> : this.props.children; }
}
// Dynamic import also catches malformed JSON/content validation errors before rendering.
async function start() {
  const root = createRoot(document.getElementById('root')!);
  try { const { App } = await import('./App'); root.render(<StrictMode><ErrorBoundary><App/></ErrorBoundary></StrictMode>); }
  catch (error) { console.error('Inhaltsdaten konnten nicht geladen werden.', error); root.render(<div className="fatal-error"><h1>Inhalte gerade nicht verfügbar</h1><p>Der Inhaltskatalog konnte nicht geladen werden. Bitte informiere die Administration. Die Dateien und Beziehungen im Katalog müssen geprüft werden.</p><button className="button primary" onClick={()=>window.location.reload()}>Erneut laden</button></div>); }
}
void start();
