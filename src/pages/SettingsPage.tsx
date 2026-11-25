import { Monitor, Moon, Sun } from 'lucide-react';
import { PageHeading } from '../components/ui';
import { useI18n } from '../i18n/context';
import { LanguageSwitcher } from '../i18n/LanguageSwitcher';
import { useBackgroundPreference, useThemePreference } from '../theme/preferences';

const themes = [
  { value: 'dark', label: 'Dunkel', Icon: Moon },
  { value: 'light', label: 'Hell', Icon: Sun },
  { value: 'system', label: 'Systemdarstellung', Icon: Monitor },
] as const;

export function SettingsPage() {
  const { tr } = useI18n();
  const { preference, setPreference } = useThemePreference();
  const [paused, setPaused] = useBackgroundPreference();
  return <>
    <PageHeading title={tr('Einstellungen')}/>
    <div className="settings-grid">
      <section className="glass prose" aria-labelledby="appearance-heading">
        <h2 id="appearance-heading">{tr('Erscheinungsbild')}</h2>
        <div className="button-row" role="group" aria-labelledby="appearance-heading">
          {themes.map(({ value, label, Icon }) => <button key={value} className={'button ' + (preference === value ? 'primary' : 'secondary')} aria-pressed={preference === value} onClick={() => setPreference(value)}><Icon size={17} aria-hidden="true"/>{tr(label)}</button>)}
        </div>
      </section>
      <section className="glass prose" aria-labelledby="animation-heading">
        <h2 id="animation-heading">{tr('Animationen')}</h2>
        <label className="settings-check"><input type="checkbox" checked={!paused} onChange={event => setPaused(!event.target.checked)}/>{tr('Animierter Hintergrund')}</label>
        <p>{tr('LernHub berücksichtigt die Einstellung „Bewegung reduzieren“ deines Geräts.')}</p>
      </section>
      <section className="glass prose" aria-labelledby="language-heading">
        <h2 id="language-heading">{tr('Sprache')}</h2>
        <LanguageSwitcher/>
      </section>
    </div>
  </>;
}
