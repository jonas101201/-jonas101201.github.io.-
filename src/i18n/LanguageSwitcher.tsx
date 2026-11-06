import { Languages } from 'lucide-react';
import { useI18n } from './context';
import { isLanguage } from './translate';
export function LanguageSwitcher() {
  const { language, setLanguage, tr } = useI18n();
  return <label className="language-switcher"><Languages size={17} aria-hidden="true"/><select aria-label={tr('Sprache wählen')} value={language} onChange={e => { if (isLanguage(e.target.value)) setLanguage(e.target.value); }}><option value="de" lang="de">Deutsch</option><option value="uk" lang="uk">Українська</option></select></label>;
}
