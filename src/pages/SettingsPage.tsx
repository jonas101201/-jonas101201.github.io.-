import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Monitor, Moon, Sun } from 'lucide-react';
import { PageHeading } from '../components/ui';
import { useI18n } from '../i18n/context';
import { LanguageSwitcher } from '../i18n/LanguageSwitcher';
import { useCompanionVisibility, useBackgroundPreference, useThemePreference } from '../theme/preferences';

const themes = [
  { value: 'dark', label: 'Dunkel', Icon: Moon },
  { value: 'light', label: 'Hell', Icon: Sun },
  { value: 'system', label: 'Systemdarstellung', Icon: Monitor },
] as const;

export function SettingsPage() {
  const { tr } = useI18n();
  const [companionVisible, setCompanionVisible] = useCompanionVisibility();
  const { hash } = useLocation();
  useEffect(() => {
    const heading = document.getElementById(hash.slice(1));
    if (heading?.closest('.settings-grid')) heading.focus();
  }, [hash]);
  const { preference, setPreference } = useThemePreference();
  const [paused, setPaused] = useBackgroundPreference();
  return <>
    <PageHeading title={tr('Einstellungen')}/>
    <div className="settings-grid">
      <section className="glass prose" aria-labelledby="appearance-heading">
        <h2 id="appearance-heading" tabIndex={-1}>{tr('Erscheinungsbild')}</h2>
        <div className="button-row" role="group" aria-labelledby="appearance-heading">
          {themes.map(({ value, label, Icon }) => <button key={value} className={'button ' + (preference === value ? 'primary' : 'secondary')} aria-pressed={preference === value} onClick={() => setPreference(value)}><Icon size={17} aria-hidden="true"/>{tr(label)}</button>)}
        </div>
      </section>
      <section className="glass prose" aria-labelledby="animation-heading">
        <h2 id="animation-heading" tabIndex={-1}>{tr('Animationen')}</h2>
        <label className="settings-check"><input type="checkbox" checked={!paused} onChange={event => setPaused(!event.target.checked)}/>{tr('Animierter Hintergrund')}</label>
        <p>{tr('LernHub berücksichtigt die Einstellung „Bewegung reduzieren“ deines Geräts.')}</p>
      </section>
      <section className="glass prose" aria-labelledby="language-heading">
        <h2 id="language-heading" tabIndex={-1}>{tr('Sprache')}</h2>
        <LanguageSwitcher/>
      </section>
      <section className="glass prose" aria-labelledby="learning-progress-settings">
        <h2 id="learning-progress-settings">{tr('LernHub Progress')}</h2>
        <label className="settings-check"><input type="checkbox" checked={companionVisible} onChange={event => setCompanionVisible(event.target.checked)}/>{tr('Begleiter im LernHub anzeigen')}</label>
        <Link className="button secondary" to="/fortschritt/speicher">{tr('Progress-Speicher verwalten')}</Link>
      </section>
    </div>
  </>;
}
