import { useI18n } from '../i18n/context';
export function ErrorScreen({ content = false }: { content?: boolean }) {
  const { tr } = useI18n();
  return <div className="fatal-error"><h1>{tr(content ? 'Inhalte gerade nicht verfügbar' : 'Die Anwendung konnte nicht geladen werden.')}</h1><p>{tr(content ? 'Der Inhaltskatalog konnte nicht geladen werden. Bitte informiere die Administration. Die Dateien und Beziehungen im Katalog müssen geprüft werden.' : 'Die Anwendung konnte nicht geladen werden. Bitte lade die Seite neu oder melde den Fehler der Administration.')}</p><button className="button primary" onClick={() => window.location.reload()}>{tr('Neu laden')}</button></div>;
}
