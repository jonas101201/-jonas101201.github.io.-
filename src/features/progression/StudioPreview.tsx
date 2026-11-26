import { BookOpen, CalendarDays, House, Search, Settings, ShoppingBag, Sun } from 'lucide-react';
import { useStudioMotionPaused } from './studioMotion';
import { LogoMark } from '../../components/LogoMark';
import { useI18n } from '../../i18n/context';
import { CompanionVisual } from './Companion';
import { lookVariables, type Cosmetic, type Look, type LookStyle } from './cosmetics';
import './item-artwork.css';
import type { CompanionId } from './companions';

export function StudioPreview({ look, stage = 0, dashboard = false }: { look: Look; stage?: number; dashboard?: boolean }) {
  const { tr } = useI18n();
  const pause = useStudioMotionPaused();
  return <div className="studio-preview" role="group" data-studio="" data-studio-logo={look.logo} data-studio-glass={look.glass} data-studio-progress={look.progress} data-cosmetic-scene={look.background} data-living-clay={look.glass} data-garden-growth={look.progress === 'garden-growth' ? '' : undefined} data-garden-fireflies={look.environment === 'garden-fireflies' ? '' : undefined} data-studio-preview-background={look.background ? '' : undefined} data-studio-paused={pause ? '' : undefined} style={lookVariables(look)} aria-label={tr('Designvorschau')}>
    <div className="studio-preview-orbs" aria-hidden="true"><i/><i/><i/></div>
    <div className="studio-preview-card">
      <div className="studio-preview-header"><LogoMark/><strong>LernHub</strong>{dashboard && <span className="world-preview-header-controls" aria-hidden="true"><Sun/><Settings/></span>}</div>
      {look.companion && <CompanionVisual id={look.companion as CompanionId} stage={stage} look={look} interactive/>}
      {dashboard && <div className="world-dashboard-preview" aria-label="Beispiel der LernHub-Startseite">
        {['BK1', 'BK2'].map(subject => <div key={subject}><strong>{subject}</strong><div className="world-field-grid">{Array.from({ length: 8 }, (_, index) => <span key={index}>LF {index + 1}</span>)}</div></div>)}
        <div>{tr('Weiterlernen')}</div>
      </div>}
      {look.progress === 'garden-growth' ? <GardenStem value={64} label={tr('Beispiel für einen Fortschrittsbalken')}/> :
        <progress max={100} value={64} aria-label={tr('Beispiel für einen Fortschrittsbalken')}/>}
      {dashboard ? <div className="studio-preview-icons world-preview-dock" aria-hidden="true">
        {([[House, 'Start'], [BookOpen, 'Lernen'], [Search, 'Suche'], [CalendarDays, 'Termine'], [ShoppingBag, 'Shop']] as const).map(([Icon, label]) =>
          <span key={label}><Icon/>{tr(label)}</span>)}
      </div> : <div className="studio-preview-icons" aria-hidden="true"><House/><BookOpen/><CalendarDays/></div>}
    </div>
  </div>;
}

export function CosmeticArtwork({ item }: { item: Cosmetic }) {
  const { slot, id, visual } = item;
  const companion = slot === 'companion' || ['body', 'eyes', 'expression', 'crystals', 'rings', 'crown', 'particles', 'companion-color'].includes(slot);
  const artStyle: LookStyle = {
    ...lookVariables({ [slot]: id }),
    '--studio-art-color': visual.palette?.[0] ?? '#85a9ce',
    '--studio-art-light': visual.glow?.[0] ?? visual.palette?.[1] ?? '#c5d6ed',
  };
  return <div className="cosmetic-art" data-item-art={id} data-art-slot={companion ? 'companion' : slot} data-cosmetic-scene={slot === 'background' ? id : undefined}
    data-studio="" data-studio-logo={slot === 'logo' ? id : undefined} aria-hidden="true" style={artStyle}>
    {id === 'garden-growth' ? <GardenStem label={item.name} value={66}/>
      : companion ? <CompanionVisual id={slot === 'companion' ? id as CompanionId : 'orbit'} stage={slot === 'companion' ? 0 : 1} look={{ [slot]: id }} accessoryPreview={slot === 'companion' ? undefined : id}/>
      : slot === 'logo' ? <LogoMark/>
        : slot === 'icons' ? <div className="studio-preview-icons"><span><House/></span><span><BookOpen/></span><span><CalendarDays/></span></div>
          : <><i/><i/><i/></>}
  </div>;
}

export function GardenStem({ value, label }: { value: number; label: string }) {
  const stem = 'M8 37C60 15 73 38 117 23S206 31 290 11';
  return <div className="garden-stem" role="progressbar" aria-label={label} aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
    <svg viewBox="0 0 300 44" aria-hidden="true">
      <path className="garden-stem-track" d={stem}/>
      {value > 0 && <path className="garden-stem-live" pathLength={100} strokeDasharray={value + ' 100'} d={stem}/>}
      {[{ x: 36, y: 28 }, { x: 83, y: 29 }, { x: 131, y: 21 }, { x: 177, y: 22 }, { x: 225, y: 22 }, { x: 278, y: 14 }].map(({ x, y }, index) =>
        <g key={x} transform={'translate(' + x + ' ' + y + ')'} className={value >= x / 3 ? 'garden-leaf-grown' : 'garden-leaf-dormant'}>
          <path d={index % 2 ? 'M0 0C0 -7 7 -15 19 -14C17 -4 11 1 0 0Z' : 'M0 0C-9 -1 -17 -8 -16 -17C-4 -17 0 -8 0 0Z'}/>
        </g>)}
    </svg>
  </div>;
}
