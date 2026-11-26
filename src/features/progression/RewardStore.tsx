import { useMemo, useState } from 'react';
import { Diamond } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { useI18n } from '../../i18n/context';
import { cosmetics, rarityLabels, slots, type Cosmetic } from './cosmetics';
import { useProgression } from './store';
import { CosmeticArtwork, StudioPreview } from './StudioPreview';
import { companions } from './companions';
import { ShopSpotlight } from './ShopSpotlight';
import { WorldShowcase } from './WorldShowcase';
import './studio.css';
import './shop.css';

const filterGroups = [
  { id: 'materials', label: 'Material', slots: ['glass', 'accent'] },
  { id: 'backgrounds', label: 'Hintergrund', slots: ['background'] },
  { id: 'accessories', label: 'Accessoire', slots: ['body', 'eyes', 'expression', 'crystals', 'rings', 'crown', 'companion-color'] },
  { id: 'companions', label: 'Begleiter', slots: ['companion'] },
  { id: 'effects', label: 'Effekt', slots: ['particles', 'environment', 'celebration', 'navigation'] },
  { id: 'design', label: 'UI-Design', slots: ['logo', 'icons', 'progress'] },
];

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
  if (rule.type === 'world') return tr('Premium-Set');
  if (rule.type === 'level') return tr('Ab Level {0}', [rule.level]);
  if (rule.type === 'companion') return tr(companions.find(entry => entry.id === rule.id)?.requirement ?? '');
  return tr(conditions[rule.id] ?? rule.id);
}

export function RewardStore() {
  const { tr, locale } = useI18n();
  const { state, enabled, dispatch, error } = useProgression();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [rarity, setRarity] = useState('');
  const [params, setParams] = useSearchParams();
  const detail = params.get('welt') === 'enchanted-garden';
  const tab = params.get('bereich') ?? 'discover';
  const scope = params.get('auswahl') ?? 'all';
  const discovering = !detail && scope === 'all' && tab === 'discover';
  const groupSlots = filterGroups.find(group => group.id === category)?.slots;
  const creditBalance = new Intl.NumberFormat(locale).format(state.credits);
  function filterBy(key: string, value: string) {
    setParams(previous => {
      const next = new URLSearchParams(previous);
      next.delete('welt');
      if (value) next.set(key, value);
      else next.delete(key);
      return next;
    });
    setSelected(null);
  }
  const [selected, setSelected] = useState<Cosmetic | null>(null);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const owned = useMemo(() => new Set(state.owned), [state.owned]);
  const wishlist = useMemo(() => new Set(state.wishlist), [state.wishlist]);
  const filtered = cosmetics.filter(item => item.condition.type !== 'world' && (tab !== 'companions' || item.slot === 'companion') && (!groupSlots || groupSlots.includes(item.slot)) && (!rarity || rarity === item.rarity)
    && (scope === 'all' || (scope === 'owned' ? owned.has(item.id) : wishlist.has(item.id)))
    && [item.name, tr(item.description), tr(slots[item.slot])].some(text => text.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())));
  if (discovering && !category && !query.trim()) {
    const featured = ['crystal-glass', 'event-horizon'];
    filtered.sort((a, b) => (featured.indexOf(a.id) + 1 || 3) - (featured.indexOf(b.id) + 1 || 3));
  }

  function resetCatalog() {
    setCategory('');
    setRarity('');
    setQuery('');
    setSelected(null);
    setConfirmId(null);
  }

  async function buy(item: Cosmetic) {
    setBusy(true);
    try {
      const next = await dispatch({ type: 'cosmetic-buy', id: item.id, at: new Date().toISOString() });
      if (next?.owned.includes(item.id)) setMessage(tr('Freigeschaltet: {0}', [item.name]));
      setConfirmId(null);
    } finally { setBusy(false); }
  }

  return <section className="progress-section collection-shop">
    <div className="collection-shop-heading">
      <div><h1>{tr('Deine Welt.')}</h1><p>{tr('Lernen. Freischalten. Individualisieren.')}</p></div>
      {enabled && <p className="collection-shop-balance" aria-label={tr('{0} HUB Credits verfügbar', [state.credits])}><Diamond size={15} aria-hidden="true"/> {creditBalance}</p>}
    </div>
    <nav className="collection-shop-links" aria-label="Shop">
      <Link aria-current={discovering ? 'page' : undefined} className="button secondary" to="/fortschritt/store" onClick={resetCatalog}>{tr('Entdecken')}</Link>
      <Link className="button secondary" to="/fortschritt/studio">Studio</Link>
      <Link aria-current={!detail && scope === 'owned' ? 'page' : undefined} className="button secondary" to="?auswahl=owned" onClick={resetCatalog}>{tr('Sammlung')}</Link>
      <Link aria-current={!detail && scope === 'wishlist' ? 'page' : undefined} className="button secondary" to="?auswahl=wishlist" onClick={resetCatalog}>{tr('Wunschliste')}</Link>
    </nav>
    {discovering && <ShopSpotlight/>}
    {detail ? <Link className="text-link" to="?bereich=worlds">{tr('Zu den Premium-Sets')}</Link> : <div className="collection-shop-filters" role="group" aria-label={tr('Kategorie')}>
      <button className="button secondary" type="button" aria-pressed={!category && tab !== 'worlds' && tab !== 'companions'} onClick={() => { setCategory(''); filterBy('bereich', ''); }}>{tr('Alle')}</button>
      {filterGroups.map(group => <button className="button secondary" type="button" key={group.id} aria-pressed={category === group.id || (tab === 'companions' && group.id === 'companions')} onClick={() => {
        setCategory(group.id);
        filterBy('bereich', '');
      }}>{tr(group.label)}</button>)}
      <button className="button secondary" type="button" aria-pressed={tab === 'worlds'} onClick={() => { setCategory(''); filterBy('bereich', 'worlds'); }}>{tr('Premium-Sets')}</button>
    </div>}
    {(detail || (tab === 'worlds' && scope === 'all') || (scope === 'owned' ? owned.has('garden-clay') : scope === 'wishlist' && wishlist.has('enchanted-garden'))) &&
      <WorldShowcase key={String(detail)} detail={detail}/>}
    {!detail && tab !== 'worlds' && <>
    <header className="collection-shop-catalog">
      <h2>{tr(scope === 'owned' ? 'Sammlung' : scope === 'wishlist' ? 'Wunschliste' : 'Entdecke die Kollektion')}</h2>
      <p role="status">{tr('{0} Gegenstände', [filtered.length])}</p>
    </header>
    <div className="collection-shop-tools">
      <label className="studio-field"><span className="sr-only">{tr('Gegenstände suchen')}</span><input type="search" placeholder={tr('Gegenstände suchen')} value={query} onChange={event => setQuery(event.target.value)}/></label>
      <label className="studio-field"><span className="sr-only">{tr('Seltenheit')}</span>
        <select value={rarity} onChange={event => setRarity(event.target.value)}>
          <option value="">{tr('Alle Seltenheiten')}</option>
          {Object.entries(rarityLabels).map(([key, label]) => <option key={key} value={key}>{tr(label)}</option>)}
        </select>
      </label>
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
    {filtered.length === 0 && <p className="muted">{tr('Keine passenden Gegenstände.')}{!enabled && scope !== 'all' && <> · <Link className="text-link" to="/fortschritt/speicher">{tr('Progress freiwillig aktivieren')}</Link></>}</p>}
    <div className="progress-tile-grid collection-shop-grid">
      {filtered.map(item => {
        const got = owned.has(item.id);
        const wishing = wishlist.has(item.id);
        const price = item.condition.type === 'credits' ? item.condition.price : null;
        const affordable = enabled && price !== null && state.credits >= price;
        return <article key={item.id} className="glass dashboard-panel progress-status cosmetic-product">
          <CosmeticArtwork item={item}/>
          <p className="collection-item-rarity" data-rarity={item.rarity}>{tr(rarityLabels[item.rarity])}</p>
          <h3>{item.name}</h3>
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
    </>}
  </section>;
}
