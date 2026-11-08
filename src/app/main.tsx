import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { StrictMode, Component, type ErrorInfo, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { LanguageProvider } from '../i18n/LanguageProvider';
import { ErrorScreen } from '../components/ErrorScreen';
import '../styles/index.css';
import '../styles/tokens.css';
import '../styles/liquid-glass.css';
import '../styles/reference-glass.css';
import '../styles/motion.css';
import '../styles/ux.css';
class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error('LernHub konnte nicht angezeigt werden.', error, info); }
  render() { return this.state.failed ? <ErrorScreen/> : this.props.children; }
}
async function start() {
  const root = createRoot(document.getElementById('root')!);
  root.render(<LanguageProvider><LoadingSkeleton/></LanguageProvider>);
  try { const { App } = await import('./App'); root.render(<StrictMode><LanguageProvider><ErrorBoundary><App/></ErrorBoundary></LanguageProvider></StrictMode>); }
  catch (error) { console.error('Inhaltsdaten konnten nicht geladen werden.', error); root.render(<LanguageProvider><ErrorScreen content/></LanguageProvider>); }
}
void start();
