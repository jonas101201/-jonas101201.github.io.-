import { useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useI18n } from '../../i18n/context';
import { useProgression } from './store';
import { compatibleLook, cosmeticById, cosmetics, isCompanionSlot, isEffectSlot, slots, type Look, type Slot } from './cosmetics';
import { companionProgress, companions } from './companions';
import { StudioPreview } from './StudioPreview';
import { CompanionVisual } from './Companion';
import { LookPreviewFrame } from './LookPreviewFrame';
import './studio.css';

export function Studio() {
  const { tr } = useI18n();
  const { state, enabled, dispatch, error } = useProgression();
  const [params, setParams] = useSearchParams();
  const incoming = cosmeticById(params.get('vorschau') ?? undefined);
  const [area, setArea] = useState<'surface' | 'companion' | 'presets'>(() => incoming && isCompanionSlot(incoming.slot) ? 'companion' : 'surface');
  const [surfaceView, setSurfaceView] = useState<'home' | 'effects'>(() => incoming && isEffectSlot(incoming.slot) ? 'effects' : 'home');
  const [stagePreview, setStagePreview] = useState<number | null>(null);
  const [presetEdit, setPresetEdit] = useState<{ id: string; name: string } | null>(null);
  const [editing, setEditing] = useState<Look | null>(null);
  const [name, setName] = useState('');
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const [play, setPlay] = useState(0);
  const previewPane = useRef<HTMLDivElement>(null);
  const editPane = useRef<HTMLDivElement>(null);
  const equipped = compatibleLook(state.equipped, state.owned);
  const look = editing ?? (incoming ? { ...equipped, [incoming.slot]: incoming.id } : equipped);
  const character = companions.find(companion => companion.id === look.companion) ?? companions[0];
  const development = companionProgress(state, character.id);
  const stage = stagePreview ?? development.stage;
  const valid = compatibleLook(look, state.owned);
  const unowned = Object.keys(valid).length !== Object.keys(look).length;
  const themeChanged = (Object.keys(slots) as Slot[]).some(slot => look[slot] !== state.equipped[slot]);

  function revealPane(pane: HTMLDivElement | null) {
    pane?.focus({ preventScroll: true });
    pane?.scrollIntoView({ block: 'start' });
  }

  function discard() {
    setEditing(null);
    setStatus('');
    if (incoming) {
      const next = new URLSearchParams(params);
      next.delete('vorschau');
      setParams(next, { replace: true });
    }
  }

  async function apply() {
    setBusy(true);
    try {
      const updated = await dispatch({ type: 'equip', equipped: valid });
      if (updated) {
        discard();
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

  return <section className="progress-section studio-workspace">
    <header className="studio-heading">
      <div>
        <h2>{tr('LernHub Studio')}</h2>
        <p className="muted">{tr('Probiere einen Look aus und wende ihn an, wenn er dir gefällt.')}</p>
      </div>
      <Link className="button secondary" to="/fortschritt/store">{tr('Reward Store')}</Link>
    </header>
    <div className="progress-actions studio-areas" role="group" aria-label={tr('Studio-Bereiche')}>
      {([['surface', 'Oberfläche'], ['companion', 'Begleiter'], ['presets', 'Presets']] as const).map(([id, label]) =>
        <button type="button" key={id} className={'button ' + (area === id ? 'primary' : 'secondary')} aria-pressed={area === id} onClick={() => setArea(id)}>{tr(label)}</button>)}
    </div>
    <div className="studio-layout">
      <div ref={previewPane} tabIndex={-1} className="glass dashboard-panel studio-preview-pane">
        <header className="studio-heading">
          <h3>{tr('Vorschau')}</h3>
          <span className="studio-preview-status">{tr(unowned ? 'Nur Vorschau' : themeChanged ? 'Ungespeicherte Änderungen' : 'Aktives Design')}</span>
        </header>
        <button type="button" className="button secondary studio-area-jump" onClick={() => revealPane(editPane.current)}>{tr('Design bearbeiten')}</button>
        {area === 'companion' ? <>
          <div className="studio-character-preview">
            <CompanionVisual key={play} id={character.id} look={look} stage={stage} motion={play ? 'greet' : 'idle'} interactive/>
            <strong>{character.name}</strong>
          </div>
          <div className="studio-character-tools">
            <label className="studio-field">{tr('Entwicklungsstufe')}
              <select value={stagePreview ?? ''} onChange={event => setStagePreview(event.target.value ? Number(event.target.value) : null)}>
                <option value="">{tr('Aktuelle Stufe')}</option>
                {development.labels.map((label, index) => <option key={label} value={index}>{label}</option>)}
              </select>
            </label>
            <button className="button secondary" type="button" onClick={() => setPlay(value => value + 1)}>{tr('Bewegung abspielen')}</button>
          </div>
        </> : <>
          <div className="progress-actions" role="group" aria-label={tr('Designvorschau')}>
            <button type="button" className="button secondary" aria-pressed={surfaceView === 'home'} onClick={() => setSurfaceView('home')}>{tr('Startseite')}</button>
            <button type="button" className="button secondary" aria-pressed={surfaceView === 'effects'} onClick={() => setSurfaceView('effects')}>{tr('Effekte')}</button>
          </div>
          {surfaceView === 'home' ? <LookPreviewFrame look={look}/> : <>
            <StudioPreview key={play} look={look}/>
            <button className="button secondary" type="button" onClick={() => setPlay(value => value + 1)}>{tr('Effekte in der Vorschau abspielen')}</button>
          </>}
        </>}
      </div>
      <div ref={editPane} tabIndex={-1} className="glass dashboard-panel progress-status studio-edit-pane">
        {area !== 'presets' && <h3>{tr(area === 'surface' ? 'Oberfläche' : 'Begleiter')}</h3>}
        <button type="button" className="button secondary studio-area-jump" onClick={() => revealPane(previewPane.current)}>{tr('Vorschau ansehen')}</button>
        <div className="studio-controls" hidden={area === 'presets'}>
          {(Object.entries(slots) as [Slot, string][]).filter(([slot]) => isCompanionSlot(slot) === (area === 'companion')).map(([slot, label]) => <label className="studio-field" key={slot}>
            {tr(label)}
            <select value={look[slot] ?? ''} onChange={event => {
              const next = { ...look };
              if (event.target.value) next[slot] = event.target.value;
              else delete next[slot];
              setStatus('');
              setEditing(next);
              if (isEffectSlot(slot)) setSurfaceView('effects');
              if (slot === 'companion') setStagePreview(null);
            }}>
              <option value="">{tr('Standarddesign')}</option>
              {cosmetics.filter(item => item.slot === slot).map(item => <option key={item.id} value={item.id}>
                {item.name}{state.owned.includes(item.id) ? '' : ' · ' + tr('Nur Vorschau')}
              </option>)}
            </select>
          </label>)}
        </div>
        {enabled && area === 'presets' && <div className="studio-presets">
          <h3>{tr('Gespeicherte Designs')}</h3>
          <form className="progress-actions studio-preset-form" onSubmit={event => { event.preventDefault(); void savePreset(); }}>
            <label className="studio-field">{tr('Name des Designs')}<input value={name} maxLength={40} onChange={event => setName(event.target.value)}/></label>
            <button type="submit" className="button secondary" disabled={!name.trim() || themeChanged}>{tr('Aktives Design speichern')}</button>
          </form>
          {themeChanged && <p className="muted">{tr('Wende das Design an, bevor du es speicherst.')}</p>}
          {state.presets.length === 0 && <p className="muted">{tr('Du hast noch keine Designs gespeichert.')}</p>}
          <ul className="studio-preset-list">{state.presets.map(preset => <li key={preset.id}>
            {presetEdit?.id === preset.id ? <form className="progress-actions" onSubmit={async event => {
              event.preventDefault();
              if (presetEdit.name.trim() && await dispatch({ type: 'preset-rename', id: preset.id, name: presetEdit.name })) setPresetEdit(null);
            }}>
              <label>{tr('Name des Designs')}<input maxLength={40} value={presetEdit.name} onChange={event => setPresetEdit({ id: preset.id, name: event.target.value })}/></label>
              <button type="submit" className="button secondary">{tr('Speichern')}</button>
              <button type="button" className="button secondary" onClick={() => setPresetEdit(null)}>{tr('Abbrechen')}</button>
            </form> : <strong>{preset.name}</strong>}
            <button type="button" className="button secondary" onClick={() => setPresetEdit({ id: preset.id, name: preset.name })}>{tr('Umbenennen')}</button>
            <button type="button" className="button secondary" onClick={() => setEditing(compatibleLook(preset.equipped, state.owned))}>{tr('Vorschau')}</button>
            <button type="button" className="button secondary" aria-label={tr('Design {0} löschen', [preset.name])} onClick={() => void dispatch({ type: 'preset-delete', id: preset.id })}>{tr('Löschen')}</button>
          </li>)}</ul>
        </div>}
        {unowned && <p className="muted">{tr('Gesperrte Gegenstände bleiben in der Vorschau. Wähle freigeschaltete Gegenstände, um das Design anzuwenden.')}</p>}
        {!enabled && <p className="muted">{tr('Aktiviere LernHub Progress, um ein Design zu speichern.')}</p>}
        <div className="progress-actions">
          <button type="button" className="button primary" disabled={busy || !enabled || unowned || !themeChanged} onClick={() => void apply()}>{tr('Design anwenden')}</button>
          <button type="button" className="button secondary" onClick={() => { setEditing({}); setStatus(''); }}>{tr('Standarddesign')}</button>
          <button type="button" className="button secondary" disabled={editing === null && !incoming} onClick={discard}>{tr('Änderungen verwerfen')}</button>
        </div>
        {(status || error) && <p role="status">{tr(error ?? status)}</p>}
      </div>
    </div>
  </section>;
}
