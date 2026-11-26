import { useEffect, useId, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../../i18n/context';
import { useStudioMotionPaused } from './studioMotion';
import { companionProgress, companions, type CompanionId } from './companions';
import { cosmeticById, type Look } from './cosmetics';
import { recommendMissions } from './missions';
import { useProgression } from './store';
import './studio.css';

const silhouettes: Record<CompanionId, string> = {
  orbit: 'M65 35a30 30 0 1 1 0 60 30 30 0 1 1 0-60Z',
  ember: 'M66 28c3 18 28 25 28 44a29 29 0 0 1-58 0c0-14 12-26 30-44Z',
  spectre: 'M65 30c20 0 26 17 38 36-18 5-24 27-38 35-14-8-20-30-38-35 12-19 18-36 38-36Z',
  bloom: 'M65 32c16-8 30 9 26 20 17 6 17 28 2 35-3 15-24 21-28 10-11 11-28 5-30-10-16-7-16-29 1-35-3-15 11-28 29-20Z',
  glitch: 'M48 35h31l17 17v29L80 98H46L33 82V51Z',
  cosmo: 'M65 30l12 18 24 3-13 19 6 24-23-8-18 17-4-24-23-9 20-14 1-24Z',
};

export function CompanionVisual({ id, stage = 0, look = {} }: { id: CompanionId; stage?: number; look?: Look }) {
  const gradient = useId();
  const node = useRef<SVGSVGElement>(null);
  const [visible, setVisible] = useState(false);
  const paused = useStudioMotionPaused();
  useEffect(() => {
    const observer = typeof IntersectionObserver === 'function' ? new IntersectionObserver(entries => setVisible(entries.some(entry => entry.isIntersecting))) : null;
    if (node.current) observer?.observe(node.current);
    return () => observer?.disconnect();
  }, []);
  const palette = cosmeticById(look['companion-color'] ?? id)?.visual.palette;
  const body = look.body ? '#b9c7d4' : palette?.[0] ?? '#99cfee';
  const rings = stage >= 1 || Boolean(look.rings);
  return <svg ref={node} className="studio-companion" viewBox="0 0 130 130" aria-hidden="true" focusable="false" data-playing={visible && !paused} style={{ color: body }}>
    <defs><radialGradient id={gradient} cx="32%" cy="24%">
      <stop offset="0" stopColor="#fff" stopOpacity=".85"/>
      <stop offset=".38" stopColor={body}/>
      <stop offset="1" stopColor={palette?.[1] ?? '#31599c'}/>
    </radialGradient></defs>
    <g className="studio-companion-float">
      {rings && <ellipse cx="65" cy="65" rx="50" ry="18" transform="rotate(-26 65 65)" fill="none" stroke="currentColor" strokeWidth="1.5"/>}
      {stage >= 2 && <ellipse cx="65" cy="65" rx="47" ry="31" transform="rotate(39 65 65)" fill="none" stroke="currentColor" opacity=".45"/>}
      <path d={silhouettes[id]} fill={`url(#${gradient})`} stroke="currentColor" strokeWidth={stage >= 3 ? 3 : 1.5}/>
      {stage >= 2 && <path d={silhouettes[id]} transform="translate(13 13) scale(.8)" fill="none" stroke="#fff" opacity=".55"/>}
      <g fill="#162236">
        {look.eyes ? <><rect x="50" y="61" width="10" height="4" rx="2"/><rect x="70" y="61" width="10" height="4" rx="2"/></>
          : <><circle cx="54" cy="63" r="3"/><circle cx="75" cy="63" r="3"/></>}
      </g>
      {look.expression && <path d="M59 74q6 7 12 0" fill="none" stroke="#162236" strokeWidth="2" strokeLinecap="round"/>}
      {(stage >= 2 || look.crystals) && <path d="M22 34l4 7-4 7-4-7Z M105 83l5 8-5 8-5-8Z" fill="currentColor"/>}
      {(stage >= 3 || look.crown) && <path d="M49 19l7 4 9-12 9 12 7-4-4 13H53Z" fill="currentColor" stroke="#fff" strokeWidth=".7"/>}
      {(stage >= 3 || look.particles) && <path d="M16 64h4 M18 62v4 M106 31h6 M109 28v6 M82 111h6 M85 108v6" fill="none" stroke="currentColor" strokeWidth="2"/>}
    </g>
  </svg>;
}

export function Companion() {
  const { tr } = useI18n();
  const { state, enabled, dispatch } = useProgression();
  const [previewStage, setPreviewStage] = useState<number | null>(null);
  const active = companions.find(item => item.id === state.activeCompanion) ?? companions[0];
  const recommendation = enabled ? recommendMissions(state, new Date().toISOString())[0] : undefined;
  return <section className="progress-section">
    <div className="glass dashboard-panel">
      <h2>{tr('Lernbegleiter')}</h2>
      <p>{tr(active.role)} · {tr(active.description)}</p>
      {recommendation && <p>{tr('Vorschlag: {0}', [tr(recommendation.title)])} · <Link className="text-link" to="/fortschritt#missionen">{tr('Lernmissionen')}</Link></p>}
      <p><Link className="text-link" to="/fortschritt/studio">{tr('LernHub Studio')}</Link></p>
      <label className="studio-field">{tr('Entwicklungsstufe ansehen')}
        <select value={previewStage ?? ''} onChange={event => setPreviewStage(event.target.value === '' ? null : Number(event.target.value))}>
          <option value="">{tr('Aktuelle Stufe')}</option>
          {['Origin','Awakened','Ascended','Celestial'].map((name, index) => <option value={index} key={name}>{name}</option>)}
        </select>
      </label>
    </div>
    <div className="progress-tile-grid">
      {companions.map(item => {
        const progress = companionProgress(state, item.id);
        return <article className="glass dashboard-panel studio-companion-card" key={item.id}>
          <CompanionVisual id={item.id} stage={previewStage ?? progress.stage} look={state.equipped}/>
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
