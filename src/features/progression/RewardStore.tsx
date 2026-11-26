import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../../i18n/context';
import { cosmetics, rarityLabels, slots, type Cosmetic } from './cosmetics';
import { useProgression } from './store';
import { StudioPreview } from './StudioPreview';
import { companions } from './companions';
import './studio.css';

const conditions: Record<string, string> = {
  memory: 'Gedächtnis-Kollektion',
  exams: 'Prüfungsvorbereitungs-Kollektion',
  'expert-mission': 'Eine Expert Mission abschließen',
  'companion-celestial': 'Einen Begleiter bis Celestial entwickeln',
  'first-review': 'Eine zeitversetzte Wiederholung abschließen',
};
function conditionLabel(item: Cosmetic, tr: ReturnType<typeof useI18n>['tr']) {
  const rule = item.condition;
  if (rule.type === 'credits') return tr('{0} HUB Credits', [rule.price]);
  if (rule.type === 'level') return tr('Ab Level {0}', [rule.level]);
  if (rule.type === 'companion') return tr(companions.find(entry => entry.id === rule.id)?.requirement ?? '');
  return tr(conditions[rule.id] ?? rule.id);
}

export function RewardStore() {
  const { tr } = useI18n();
  const { state, enabled, dispatch, error } = useProgression();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [rarity, setRarity] = useState('');
  const [scope, setScope] = useState('all');
  const [selected, setSelected] = useState<Cosmetic | null>(null);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const owned = useMemo(() => new Set(state.owned), [state.owned]);
  const wishlist = useMemo(() => new Set(state.wishlist), [state.wishlist]);
  const filtered = cosmetics.filter(item => (!category || category === item.slot) && (!rarity || rarity === item.rarity)
    && (scope === 'all' || (scope === 'owned' ? owned.has(item.id) : wishlist.has(item.id)))
    && [item.name, tr(item.description), tr(slots[item.slot])].some(text => text.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())));

  async function buy(item: Cosmetic) {
    setBusy(true);
    try {
      const next = await dispatch({ type: 'cosmetic-buy', id: item.id, at: new Date().toISOString() });
      if (next?.owned.includes(item.id)) setMessage(tr('Freigeschaltet: {0}', [item.name]));
      setConfirmId(null);
    } finally { setBusy(false); }
  }

  return <section className="progress-section">
    <h2>{tr('Reward Store')}</h2>
    <div className="glass dashboard-panel progress-status">
      <p>{enabled ? tr('{0} HUB Credits verfügbar', [state.credits]) : tr('Alle Gegenstände sind in der Vorschau verfügbar. Eintauschen und Wunschliste benötigen LernHub Progress.')}</p>
      <div className="studio-controls">
        <label className="studio-field">{tr('Gegenstände suchen')}<input type="search" value={query} onChange={event => setQuery(event.target.value)}/></label>
        <label className="studio-field">{tr('Kategorie')}
          <select value={category} onChange={event => setCategory(event.target.value)}>
            <option value="">{tr('Alle Kategorien')}</option>
            {Object.entries(slots).map(([key, label]) => <option key={key} value={key}>{tr(label)}</option>)}
          </select>
        </label>
        <label className="studio-field">{tr('Seltenheit')}
          <select value={rarity} onChange={event => setRarity(event.target.value)}>
            <option value="">{tr('Alle Seltenheiten')}</option>
            {Object.entries(rarityLabels).map(([key, label]) => <option key={key} value={key}>{tr(label)}</option>)}
          </select>
        </label>
        <label className="studio-field">{tr('Auswahl')}
          <select value={scope} onChange={event => setScope(event.target.value)}>
            <option value="all">{tr('Alle Gegenstände')}</option>
            <option value="owned">{tr('Inventar')}</option>
            <option value="wishlist">{tr('Wunschliste')}</option>
          </select>
        </label>
      </div>
      <p role="status">{tr('{0} Gegenstände', [filtered.length])}</p>
    </div>
    {selected && <div className="glass dashboard-panel studio-layout" id="store-preview">
      <StudioPreview key={selected.id} look={['body','eyes','expression','crystals','rings','crown','particles','companion-color'].includes(selected.slot)
        ? { companion: 'orbit', [selected.slot]: selected.id } : { [selected.slot]: selected.id }}/>
      <div>
        <h3 id="store-preview-heading" tabIndex={-1}>{selected.name} · {tr('Vorschau')}</h3>
        <p>{tr(selected.description)}</p>
        <p>{conditionLabel(selected, tr)}</p>
        <button className="button secondary" type="button" onClick={() => {
          document.getElementById(`preview-${selected.id}`)?.focus();
          setSelected(null);
        }}>{tr('Vorschau schließen')}</button>
      </div>
    </div>}
    {(message || error) && <p role="status" className="notice">{tr(error ?? message)}</p>}
    <div className="progress-tile-grid">
      {filtered.map(item => {
        const got = owned.has(item.id);
        const wishing = wishlist.has(item.id);
        const price = item.condition.type === 'credits' ? item.condition.price : null;
        const affordable = enabled && price !== null && state.credits >= price;
        return <article key={item.id} className="glass dashboard-panel progress-status">
          <h3>{item.name}</h3>
          <p className="muted">{tr(slots[item.slot])} · {tr(rarityLabels[item.rarity])}</p>
          <p>{tr(item.description)}</p>
          <p>{got ? tr('Freigeschaltet') : conditionLabel(item, tr)}</p>
          {wishing && !got && price !== null && <div>
            <progress max={price} value={Math.min(state.credits, price)} aria-label={tr('Fortschritt zum Freischaltziel')}/>
            <p>{tr('{0} HUB Credits bis zum Ziel', [Math.max(0, price - state.credits)])}</p>
          </div>}
          <div className="progress-actions">
            <button id={`preview-${item.id}`} type="button" className="button secondary" aria-label={tr('Vorschau für {0}', [item.name])} aria-expanded={selected?.id === item.id} aria-controls={selected?.id === item.id ? 'store-preview' : undefined}
              onClick={() => {
                setSelected(item);
                requestAnimationFrame(() => {
                  document.getElementById('store-preview')?.scrollIntoView({ block: 'nearest' });
                  document.getElementById('store-preview-heading')?.focus({ preventScroll: true });
                });
              }}>{tr('Vorschau')}</button>
            {enabled && !got && <button type="button" className="button secondary" aria-pressed={wishing}
              onClick={() => void dispatch({ type: 'cosmetic-wishlist', id: item.id })}>{tr(wishing ? 'Auf der Wunschliste' : 'Auf die Wunschliste')}</button>}
            {got && <Link className="button secondary" to="/fortschritt/studio">{tr('LernHub Studio')}</Link>}
            {!got && price !== null && confirmId !== item.id
              && <button type="button" className="button primary" disabled={!affordable || busy} onClick={() => setConfirmId(item.id)}>{tr('Eintauschen')}</button>}
            {confirmId === item.id && <>
              <button className="button primary" type="button" disabled={!affordable || busy || got} onClick={() => void buy(item)}>{tr('Für {0} Credits bestätigen', [price])}</button>
              <button className="button secondary" type="button" disabled={busy} onClick={() => setConfirmId(null)}>{tr('Abbrechen')}</button>
            </>}
          </div>
        </article>;
      })}
    </div>
  </section>;
}
