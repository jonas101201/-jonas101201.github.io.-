import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../../i18n/context';
import { ownsWorld } from './engine';
import { cosmeticById } from './cosmetics';
import { CosmeticArtwork } from './StudioPreview';
import { useStudioMotionPaused } from './studioMotion';
import { useProgression } from './store';
import { enchantedGarden } from './worlds';
import './worlds.css';

export function WorldShowcase({ detail }: { detail: boolean }) {
  const world = enchantedGarden;
  const { locale } = useI18n();
  const { state, enabled, dispatch, error } = useProgression();
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [reveal, setReveal] = useState<'preview' | 'owned' | null>(null);
  const [tryOn, setTryOn] = useState(false);
  const [equipped, setEquipped] = useState(false);
  const paused = useStudioMotionPaused() || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const owned = ownsWorld(state, world.id);
  const remaining = Math.max(0, world.price - state.credits);
  const format = new Intl.NumberFormat(locale);
  const price = format.format(world.price);

  async function buy() {
    if (busy || owned || remaining || !enabled) return;
    setBusy(true);
    try {
      const updated = await dispatch({ type: 'world-buy', id: world.id, at: new Date().toISOString() });
      if (updated && ownsWorld(updated, world.id)) {
        setConfirm(false);
        setReveal('owned');
      }
    } finally { setBusy(false); }
  }

  return <article className="garden-world">
    <div className="garden-hero">
      <picture><source media="(max-width: 600px)" srcSet={import.meta.env.BASE_URL + 'worlds/enchanted-garden-small.webp'}/><img src={import.meta.env.BASE_URL + 'worlds/enchanted-garden.webp'} alt="" width="1440" height="810" decoding="async"/></picture>
      <div className="garden-hero-copy">
        <p>Legendär · 6 Cosmetics</p>
        <h3>{world.name}</h3>
        <p>{owned ? 'In deiner Sammlung' : price + ' HUB Credits'}</p>
        {!detail && <Link className="button secondary" to="?welt=enchanted-garden">Welt ansehen</Link>}
      </div>
    </div>
    {detail && <div className="garden-detail glass dashboard-panel">
      <p>{world.description}</p>
      <p>{format.format(state.credits)} HUB Credits verfügbar{!owned && remaining > 0 && ' · Noch ' + format.format(remaining) + ' bis zur Welt'}</p>
      {!owned && <progress max={world.price} value={Math.min(state.credits, world.price)} aria-label="Fortschritt bis Enchanted Garden"/>}
      <div className="progress-actions">
        <button type="button" className="button secondary" aria-expanded={tryOn} onClick={() => setTryOn(value => !value)}>{tryOn ? 'Anprobe beenden' : 'Welt anprobieren'}</button>
        <button type="button" className="button secondary" onClick={() => setReveal('preview')}>Enthüllung ansehen</button>
        {enabled && !owned && <button type="button" className="button secondary" aria-pressed={state.wishlist.includes(world.id)} onClick={() => void dispatch({ type: 'world-wishlist', id: world.id })}>Wunschliste</button>}
        {owned ? <>
          <button type="button" className="button primary" onClick={async () => setEquipped(Boolean(await dispatch({ type: 'world-equip', id: world.id })))}>Komplettes Set ausrüsten</button>
          <Link className="button secondary" to="/fortschritt/studio">Im Studio anpassen</Link>
        </> : <button type="button" className="button primary" disabled={!enabled || remaining > 0 || busy} onClick={() => setConfirm(true)}>Set eintauschen</button>}
      </div>
      {equipped && <p role="status">Enchanted Garden ausgerüstet.</p>}
      {error && <p className="notice" role="alert">{error}</p>}
      {confirm && <div className="notice">
        <p>{price} HUB Credits gegen alle sechs Bestandteile eintauschen?</p>
        <div className="progress-actions">
          <button type="button" className="button primary" disabled={busy} onClick={() => void buy()}>Eintausch bestätigen</button>
          <button type="button" className="button secondary" disabled={busy} onClick={() => setConfirm(false)}>Abbrechen</button>
        </div>
      </div>}
      {reveal && <div className="garden-reveal" data-cosmetic-scene="garden-forest" data-animate={!paused || undefined}>
        <div className="garden-reveal-canopy" aria-hidden="true">
          <i className="garden-reveal-light"/><i className="garden-reveal-ground"/>
          <i className="garden-reveal-roots"/><i className="garden-reveal-ivy"/><i className="garden-reveal-sparks"/>
        </div>
        <div className="garden-reveal-copy">
          <p role="status">{reveal === 'owned' ? 'Enchanted Garden freigeschaltet' : 'Vorschau der Enthüllung'}</p>
          <button type="button" className="button secondary" onClick={() => setReveal(null)}>Schließen</button>
        </div>
      </div>}
      {tryOn && <div className="garden-try-on garden-live-frame" role="group" aria-label="Designvorschau">
        <p>Temporäre Anprobe</p>
        <iframe title="Enchanted Garden auf der LernHub-Startseite" src={window.location.href.split('#')[0] + '#/?anprobe=enchanted-garden'} tabIndex={-1} />
      </div>}
      <div className="garden-parts">
        {world.cosmeticIds.map(id => {
          const item = cosmeticById(id);
          return item && <div key={id}><CosmeticArtwork item={item}/><strong>{item.name}</strong></div>;
        })}
      </div>
    </div>}
  </article>;
}
