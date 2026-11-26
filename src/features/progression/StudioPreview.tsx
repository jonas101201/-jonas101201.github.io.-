import { BookOpen, CalendarDays, House } from 'lucide-react';
import { useStudioMotionPaused } from './studioMotion';
import { LogoMark } from '../../components/LogoMark';
import { useI18n } from '../../i18n/context';
import { CompanionVisual } from './Companion';
import { lookVariables, type Look } from './cosmetics';
import type { CompanionId } from './companions';

export function StudioPreview({ look, stage = 0 }: { look: Look; stage?: number }) {
  const { tr } = useI18n();
  const pause = useStudioMotionPaused();
  return <div className="studio-preview" role="group" data-studio="" data-studio-preview-background={look.background ? '' : undefined} data-studio-paused={pause ? '' : undefined} style={lookVariables(look)} aria-label={tr('Designvorschau')}>
    <div className="studio-preview-orbs" aria-hidden="true"><i/><i/><i/></div>
    <div className="studio-preview-card">
      <div className="studio-preview-header"><LogoMark/><strong>LernHub</strong></div>
      {look.companion && <CompanionVisual id={look.companion as CompanionId} stage={stage} look={look}/>}
      <progress max={100} value={64} aria-label={tr('Beispiel für einen Fortschrittsbalken')}/>
      <div className="studio-preview-icons" aria-hidden="true"><House/><BookOpen/><CalendarDays/></div>
    </div>
  </div>;
}
