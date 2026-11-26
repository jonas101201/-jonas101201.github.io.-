import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../../i18n/context';
import { useProgression } from './store';
import { compatibleLook, cosmetics, slots, type Look, type Slot } from './cosmetics';
import { companionProgress } from './companions';
import { StudioPreview } from './StudioPreview';
import './studio.css';

export function Studio() {
  const { tr } = useI18n();
  const { state, enabled, dispatch, error } = useProgression();
  const [editing, setEditing] = useState<Look | null>(null);
  const [name, setName] = useState('');
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const [play, setPlay] = useState(0);
  const look = editing ?? compatibleLook(state.equipped, state.owned);
  const valid = compatibleLook(look, state.owned);
  const unowned = Object.keys(valid).length !== Object.keys(look).length;
  const themeChanged = (Object.keys(slots) as Slot[]).some(slot => look[slot] !== state.equipped[slot]);

  async function apply() {
    setBusy(true);
    try {
      const updated = await dispatch({ type: 'equip', equipped: valid });
      if (updated) {
        setEditing(null);
        setStatus('Design angewendet.');
      }
    } finally { setBusy(false); }
  }

  async function savePreset() {
    const trimmed = name.trim();
    if (!trimmed) return;
    const id = crypto.randomUUID();
    const updated = await dispatch({ type: 'preset-save', id, name: trimmed });
    if (updated?.presets.some(item => item.id === id)) {
      setName('');
      setStatus('Design gespeichert.');
    }
  }

  return <section className="progress-section">
    <h2>{tr('LernHub Studio')}</h2>
    <div className="studio-layout">
      <div className="glass dashboard-panel">
        <StudioPreview key={play} look={look} stage={look.companion ? companionProgress(state, look.companion).stage : 0}/>
        <div className="progress-actions">
          <button className="button secondary" type="button" onClick={() => setPlay(value => value + 1)}>{tr('Effekte in der Vorschau abspielen')}</button>
          <Link className="button secondary" to="/fortschritt/store">{tr('Reward Store')}</Link>
        </div>
      </div>
      <div className="glass dashboard-panel progress-status">
        <div className="studio-controls">
          {(Object.entries(slots) as [Slot, string][]).map(([slot, label]) => <label className="studio-field" key={slot}>
            {tr(label)}
            <select value={look[slot] ?? ''} onChange={event => {
              const next = { ...look };
              if (event.target.value) next[slot] = event.target.value;
              else delete next[slot];
              setStatus('');
              setEditing(next);
            }}>
              <option value="">{tr('Standarddesign')}</option>
              {cosmetics.filter(item => item.slot === slot).map(item => <option key={item.id} value={item.id}>
                {item.name}{state.owned.includes(item.id) ? '' : ' · ' + tr('Nur Vorschau')}
              </option>)}
            </select>
          </label>)}
        </div>
        {unowned && <p className="muted">{tr('Gesperrte Gegenstände bleiben in der Vorschau. Wähle freigeschaltete Gegenstände, um das Design anzuwenden.')}</p>}
        {!enabled && <p className="muted">{tr('Aktiviere LernHub Progress, um ein Design zu speichern.')}</p>}
        <div className="progress-actions">
          <button type="button" className="button primary" disabled={busy || !enabled || unowned || !themeChanged} onClick={() => void apply()}>{tr('Design anwenden')}</button>
          <button type="button" className="button secondary" onClick={() => { setEditing({}); setStatus(''); }}>{tr('Standarddesign')}</button>
          <button type="button" className="button secondary" disabled={editing === null} onClick={() => { setEditing(null); setStatus(''); }}>{tr('Änderungen verwerfen')}</button>
        </div>
        {(status || error) && <p role="status">{tr(error ?? status)}</p>}
      </div>
    </div>
    {enabled && <div className="glass dashboard-panel progress-status">
      <h3>{tr('Gespeicherte Designs')}</h3>
      <form className="progress-actions studio-preset-form" onSubmit={event => { event.preventDefault(); void savePreset(); }}>
        <label className="studio-field">{tr('Name des Designs')}<input value={name} maxLength={40} onChange={event => setName(event.target.value)}/></label>
        <button type="submit" className="button secondary" disabled={!name.trim() || themeChanged}>{tr('Aktives Design speichern')}</button>
      </form>
      {themeChanged && <p className="muted">{tr('Wende das Design an, bevor du es speicherst.')}</p>}
      <ul className="studio-preset-list">{state.presets.map(preset => <li key={preset.id}>
        <strong>{preset.name}</strong>
        <button type="button" className="button secondary" onClick={() => setEditing(compatibleLook(preset.equipped, state.owned))}>{tr('Vorschau')}</button>
        <button type="button" className="button secondary" aria-label={tr('Design {0} löschen', [preset.name])} onClick={() => void dispatch({ type: 'preset-delete', id: preset.id })}>{tr('Löschen')}</button>
      </li>)}</ul>
    </div>}
  </section>;
}
