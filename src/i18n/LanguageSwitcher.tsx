import { Languages } from 'lucide-react';
import { useI18n } from './context';
import { isLanguage } from './translate';

export function LanguageSwitcher() {
  const { language, languageRequest, setLanguage, tr } = useI18n();
  const pending = languageRequest?.status === 'loading';
  return <div>
    <label className="language-switcher">
      <Languages size={17} aria-hidden="true"/>
      <select aria-label={tr('Sprache wählen')} value={pending ? languageRequest.language : language}
        onChange={event => { if (isLanguage(event.target.value)) setLanguage(event.target.value); }}>
        <option value="de" lang="de">Deutsch</option>
        <option value="uk" lang="uk">Українська</option>
      </select>
    </label>
    {pending && <small className="muted" role="status">{tr('Sprache wird geladen …')}</small>}
    {languageRequest?.status === 'failed' &&
      <small className="muted" role="status">{tr('Die Sprache konnte nicht geladen werden. Lade die Seite neu und wähle sie erneut aus.')}</small>}
  </div>;
}
