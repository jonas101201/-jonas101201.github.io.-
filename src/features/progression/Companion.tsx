import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../../i18n/context';
import { useStudioMotionPaused } from './studioMotion';
import { companionProgress, companions, type CompanionId } from './companions';
import type { Look } from './cosmetics';
import { recommendMissions } from './missions';
import { useProgression } from './store';
import './studio.css';

export type CompanionMotion = 'idle' | 'greet' | 'celebrate' | 'still';
export type CompanionExpression = 'neutral' | 'happy' | 'excited' | 'curious' | 'focused' | 'surprised' | 'proud' | 'thoughtful';
const modelRoot = import.meta.env.BASE_URL + 'worlds/models/';
const spriteDurations: Record<CompanionId, Record<Exclude<CompanionMotion, 'still'>, string>> = {
  orbit: { idle: '3s', greet: '.95s', celebrate: '1.2s' },
  ember: { idle: '1.9s', greet: '.68s', celebrate: '1.18s' },
  spectre: { idle: '3.8s', greet: '1.22s', celebrate: '1.48s' },
  bloom: { idle: '3.2s', greet: '1.08s', celebrate: '1.43s' },
  glitch: { idle: '2.1s', greet: '.75s', celebrate: '1s' },
  cosmo: { idle: '3.5s', greet: '1.17s', celebrate: '1.49s' },
  pflanziska: { idle: '3.6s', greet: '1.16s', celebrate: '1.4s' },
};

export function CompanionVisual({ id, stage = 0, look = {}, motion = 'idle', expression, interactive = false, accessoryPreview }: {
  id: CompanionId; stage?: number; look?: Look; motion?: CompanionMotion; expression?: CompanionExpression; interactive?: boolean; accessoryPreview?: string;
}) {
  const node = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [loaded, setLoaded] = useState('');
  const paused = useStudioMotionPaused();
  const layers = [look.rings, look.crystals, look.particles, look.crown].filter(Boolean);
  const eyes = look.eyes === 'eyes-dual';
  const face = expression ?? (look.expression === 'expression-smile' ? 'happy' : 'neutral');
  const expressionSuffix = (eyes ? '-dual' : '') + (face === 'neutral' ? '' : face === 'happy' ? '-smile' : '-' + face);
  const poster = accessoryPreview && id === 'orbit' ? accessoryPreview + '-accessory.webp'
    : stage || expressionSuffix ? id + '-stage-' + stage + expressionSuffix + '.webp' : id + '-poster.webp';
  const canAnimate = !accessoryPreview && !expressionSuffix && !layers.length;
  const sprite = interactive && visible && !paused && canAnimate && motion !== 'still' ? modelRoot + id + (stage ? '-stage-' + stage : '') + '-' + motion + '-sprite.webp' : '';
  useEffect(() => {
    if (!interactive) return;
    if (typeof IntersectionObserver !== 'function') { setVisible(true); return; }
    const observer = new IntersectionObserver(entries => setVisible(entries.some(entry => entry.isIntersecting)));
    if (node.current) observer.observe(node.current);
    return () => observer.disconnect();
  }, [interactive]);
  useEffect(() => {
    if (!sprite || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const image = new Image();
    image.onload = () => setLoaded(sprite);
    image.src = sprite;
    return () => { image.onload = null; };
  }, [sprite]);
  const animated = Boolean(sprite && loaded === sprite);
  const duration = motion === 'still' ? '.8s' : spriteDurations[id][motion];
  return <div ref={node} className="companion-model companion-figure" data-character={id} data-motion={motion} data-visible={interactive && visible && !paused}
      data-sprite={animated || undefined} data-body={look.body} data-companion-color={look['companion-color']}>
    <div className="companion-figure-art">
      <img className="companion-poster" src={modelRoot + poster} width="400" height="400" decoding="async" loading="lazy" alt=""/>
      {!accessoryPreview && layers.map(layer =>
        <img key={layer} className="companion-accessory" src={modelRoot + id + '-' + layer + '.webp'}
          width="176" height="176" decoding="async" loading="lazy" alt=""/>)}
      {animated && <span key={sprite} className="companion-sprite" aria-hidden="true" style={{ backgroundImage: `url("${sprite}")`, '--companion-duration': duration } as CSSProperties}/>}
    </div>
  </div>;
}

export function Companion() {
  const { tr } = useI18n();
  const { state, enabled, dispatch } = useProgression();
  const [previewStage, setPreviewStage] = useState<number | null>(null);
  const [testMotion, setTestMotion] = useState<'idle' | 'greet' | 'celebrate'>('greet');
  const [replay, setReplay] = useState<{ id: CompanionId; motion: 'idle' | 'greet' | 'celebrate'; count: number }>();
  const [previewExpression, setPreviewExpression] = useState<CompanionExpression | undefined>();
  useEffect(() => {
    if (!replay) return;
    const duration = Number.parseFloat(spriteDurations[replay.id][replay.motion]) * 1000;
    const timer = window.setTimeout(() => setReplay(undefined), duration + 450);
    return () => window.clearTimeout(timer);
  }, [replay]);
  const expressions: readonly [CompanionExpression, string][] = [
    ['neutral','Neutral'], ['happy','Glücklich'], ['excited','Begeistert'], ['curious','Neugierig'],
    ['focused','Konzentriert'], ['surprised','Überrascht'], ['proud','Stolz'], ['thoughtful','Nachdenklich'],
  ];
  const active = companions.find(item => item.id === state.activeCompanion) ?? companions[0];
  const recommendation = enabled ? recommendMissions(state, new Date().toISOString())[0] : undefined;
  return <section className="progress-section">
    <div className="glass dashboard-panel">
      <h2>{tr('Lernbegleiter')}</h2>
      <p>{tr(active.role)} · {tr(active.description)}</p>
      {recommendation && <p>{tr('Vorschlag: {0}', [tr(recommendation.title)])} · <Link className="text-link" to="/fortschritt#missionen">{tr('Lernmissionen')}</Link></p>}
      <p><Link className="text-link" to="/fortschritt/studio">{tr('LernHub Studio')}</Link></p>
      <label className="studio-field">{tr('Entwicklungsstufe ansehen')}
        <select value={previewStage ?? ''} onChange={event => { setReplay(undefined); setPreviewStage(event.target.value === '' ? null : Number(event.target.value)); }}>
          <option value="">{tr('Aktuelle Stufe')}</option>
          {['Origin','Awakened','Ascended','Celestial'].map((name, index) => <option value={index} key={name}>{name}</option>)}
        </select>
      </label>
      <label className="studio-field">{tr('Gesichtsausdruck ansehen')}
        <select value={previewExpression ?? ''} onChange={event => { setReplay(undefined); setPreviewExpression(expressions.find(([value]) => value === event.target.value)?.[0]); }}>
          <option value="">{tr('Automatisch')}</option>
          {expressions.map(([value, label]) => <option key={value} value={value}>{tr(label)}</option>)}
        </select>
      </label>
      <label className="studio-field">{tr('Bewegung testen')}
        <select value={testMotion} onChange={event => {
          const value = event.target.value;
          if (value === 'idle' || value === 'greet' || value === 'celebrate') {
            setTestMotion(value);
            setReplay(undefined);
          }
        }}>
          <option value="idle">{tr('Ruhebewegung')}</option>
          <option value="greet">{tr('Begrüßung')}</option>
          <option value="celebrate">{tr('Lernabschluss')}</option>
        </select>
      </label>
    </div>
    <div className="progress-tile-grid">
      {companions.map(item => {
        const progress = companionProgress(state, item.id);
        const rehearsing = replay?.id === item.id ? replay : undefined;
        return <article className="glass dashboard-panel studio-companion-card" key={item.id}>
          <button type="button" className="companion-motion-preview" aria-label={tr('Bewegung von {0} abspielen', [item.name])}
            onClick={() => setReplay(previous => ({ id: item.id, motion: testMotion, count: (previous?.count ?? 0) + 1 }))}>
            <CompanionVisual key={rehearsing?.count ?? 0} id={item.id}
              stage={previewStage ?? progress.stage} look={rehearsing ? undefined : state.equipped}
              expression={rehearsing ? undefined : previewExpression} interactive={Boolean(rehearsing) || state.activeCompanion === item.id}
              motion={rehearsing?.motion ?? 'idle'}/>
          </button>
          <h3>{item.name} · {tr(item.role)}</h3>
          <p>{tr(item.description)}</p>
          <p>{progress.unlocked ? progress.stageName : tr(item.requirement)}</p>
          {progress.unlocked && progress.next && <p>{tr('{0} von {1} Lernleistungen bis {2}', [progress.points, progress.next.required, progress.next.label])}</p>}
          {progress.unlocked ? <button type="button" className="button secondary" disabled={!enabled || state.activeCompanion === item.id} onClick={() => void dispatch({ type: 'companion-select', id: item.id })}>
            {tr(state.activeCompanion === item.id && enabled ? 'Aktiver Begleiter' : 'Als Begleiter auswählen')}
          </button> : <Link className="button secondary" to={item.id === 'ember' ? '/fortschritt/store' : '/fortschritt'}>{tr(item.id === 'ember' ? 'Reward Store' : 'Fortschritt')}</Link>}
        </article>;
      })}
    </div>
  </section>;
}
