import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../../i18n/context';
import { CompanionVisual } from './Companion';
import { companionProgress, type CompanionId } from './companions';
import { CosmeticArtwork, StudioPreview } from './StudioPreview';
import { LookPreviewFrame } from './LookPreviewFrame';
import { isCompanionSlot, isEffectSlot, slots, type Cosmetic, type Look } from './cosmetics';
import type { State } from './engine';

export function CosmeticTryOn({ item, state, condition, close }: { item: Cosmetic; state: State; condition: string; close: () => void }) {
  const { tr } = useI18n();
  const [mode, setMode] = useState<'try' | 'art'>('try');
  const [replay, setReplay] = useState(0);
  const look: Look = { ...state.equipped, [item.slot]: item.id };
  const companion = isCompanionSlot(item.slot);
  const effect = isEffectSlot(item.slot);
  const character = (look.companion ?? state.activeCompanion) as CompanionId;
  return <section className="glass dashboard-panel item-try-on" id="store-preview" aria-labelledby="store-preview-heading">
    <header className="item-try-on-header">
      <div>
        <p className="muted">{tr(slots[item.slot])}</p>
        <h3 id="store-preview-heading" tabIndex={-1}>{item.name} · {tr('Vorschau')}</h3>
      </div>
      <button className="button secondary" type="button" onClick={close}>{tr('Vorschau schließen')}</button>
    </header>
    <div className="item-try-on-body">
      <div>
        <div className="progress-actions" role="group" aria-label={tr('Vorschau')}>
          <button type="button" className="button secondary" aria-pressed={mode === 'try'} onClick={() => setMode('try')}>{tr('Anprobe')}</button>
          <button type="button" className="button secondary" aria-pressed={mode === 'art'} onClick={() => setMode('art')}>{tr('Produktansicht')}</button>
        </div>
        {mode === 'art' ? <CosmeticArtwork item={item}/> :
          companion ? <div className="studio-character-preview">
            <CompanionVisual key={replay} id={character} look={look} stage={companionProgress(state, character).stage} motion={replay ? 'greet' : 'idle'} interactive/>
          </div> : effect ? <StudioPreview key={replay} look={look}/> : <LookPreviewFrame look={look}/>}
      </div>
      <div className="item-try-on-info">
        <p>{tr(item.description)}</p>
        <p>{state.owned.includes(item.id) ? tr('Freigeschaltet') : condition}</p>
        <p className="muted">{tr('Diese Ansicht ändert dein aktives Design nicht.')}</p>
        <div className="progress-actions">
          {mode === 'try' && (companion || effect) && <button type="button" className="button secondary" onClick={() => setReplay(value => value + 1)}>{tr('Effekte in der Vorschau abspielen')}</button>}
          <Link className="button primary" to={'/fortschritt/studio?vorschau=' + encodeURIComponent(item.id)}>{tr('Im Studio kombinieren')}</Link>
        </div>
      </div>
    </div>
  </section>;
}
