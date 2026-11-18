import { useEffect, useId, useState, type ReactNode } from 'react';
import { ChevronDown, SlidersHorizontal } from 'lucide-react';
import { useI18n } from '../i18n/context';
import { AnimatedDisclosure } from './AnimatedDisclosure';

/** Desktop filters stay visible; mobile disclosure preserves values while closed. */
export function MobileFilters({ activeCount, children }: { activeCount: number; children: ReactNode }) {
  const { tr } = useI18n();
  const id = useId();
  const [mobile, setMobile] = useState(() => window.matchMedia('(max-width: 820px)').matches);
  const [expanded, setExpanded] = useState(false);
  useEffect(() => {
    const media = window.matchMedia('(max-width: 820px)');
    const update = () => setMobile(media.matches);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  return <div className="filter-disclosure">
    {mobile && <button className="filter-disclosure-trigger" aria-expanded={expanded} aria-controls={id} onClick={() => setExpanded(value => !value)}>
      <SlidersHorizontal size={18} aria-hidden="true"/>
      <span>{tr('Filter und Sortierung')}</span>
      {activeCount > 0 && <span className="filter-active-count">{tr('{0} aktiv', [activeCount])}</span>}
      <ChevronDown size={18} aria-hidden="true"/>
    </button>}
    <AnimatedDisclosure id={id} open={!mobile || expanded}><div className="filter-controls">{children}</div></AnimatedDisclosure>
  </div>;
}
