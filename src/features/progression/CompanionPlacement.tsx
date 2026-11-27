import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { useI18n } from '../../i18n/context';
import { CompanionVisual } from './Companion';
import './companion-placement.css';
import { companionProgress, companions } from './companions';
import { useMissionRecommendations } from './useMissionRecommendations';
import { useCompanionGreeting } from './studioMotion';
import { useProgression } from './store';

export function CompanionPlacement({ context, encouraging = false, fallback, children }: { context: 'home' | 'completion'; encouraging?: boolean; fallback?: ReactNode; children?: ReactNode }) {
  const { tr } = useI18n();
  const { enabled, state } = useProgression();
  const [reaction, replay] = useCompanionGreeting(context === 'completion');
  const character = companions.find(item => item.id === state.activeCompanion);
  const development = character && companionProgress(state, character.id);
  const activeMission = state.missions.find(mission => mission.status === 'active');
  const recommendations = useMissionRecommendations(state, enabled && context === 'home');
  const suggestion = activeMission?.plan ?? recommendations[0];

  if (!enabled || !character || !development?.unlocked) return fallback;
  const look = state.equipped;

  if (context === 'home') {
    return <div className="glass active-companion-home">
      <button type="button" className="active-companion companion-greeting"
        aria-label={tr('Bewegung von {0} abspielen', [character.name])}
        onClick={replay}>
        <CompanionVisual key={reaction} id={character.id} stage={development.stage} look={look} motion={reaction ? 'greet' : 'idle'} interactive/>
        <span>{character.name}</span>
      </button>
      <div className="companion-speech companion-home-dialogue">
        <span className="companion-cloud" aria-hidden="true"/>
        {children}
        {suggestion && <Link className="text-link companion-mission-link" to="/fortschritt#missionen">
          {tr(activeMission ? 'Mission fortsetzen' : 'Lernmissionen')} <ArrowUpRight size={14} aria-hidden="true"/>
        </Link>}
      </div>
    </div>;
  }
  if (children) return <div className="glass active-companion-home">
    <button type="button" className="active-companion companion-greeting"
      aria-label={tr('Bewegung von {0} abspielen', [character.name])} onClick={replay}>
      <CompanionVisual key={reaction} id={character.id} stage={development.stage} look={look}
        motion={reaction ? encouraging ? 'greet' : 'celebrate' : 'idle'} interactive/>
      <span>{character.name}</span>
    </button>
    <div className="companion-speech companion-home-dialogue">
      <span className="companion-cloud" aria-hidden="true"/>
      {children}
    </div>
  </div>;
  return <div className="active-companion active-companion-completion" aria-hidden="true">
    <CompanionVisual id={character.id} stage={development.stage} look={look} motion={reaction ? encouraging ? 'greet' : 'celebrate' : 'still'} interactive/>
  </div>;
}
