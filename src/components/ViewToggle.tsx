import { LayoutGrid, List } from 'lucide-react';
import { useI18n } from '../i18n/context';
export type MaterialView = 'cards' | 'list';
/** Native buttons preserve the existing liquid-glass pill and keyboard semantics. */
export function ViewToggle({ value, onChange }: { value: MaterialView; onChange: (view: MaterialView) => void }) {
  const { tr } = useI18n();
  return <div className="segmented view-toggle" role="group" aria-label={tr('Materialansicht')}>
    <button type="button" className={value === 'cards' ? 'active' : ''} aria-pressed={value === 'cards'} onClick={() => onChange('cards')}><LayoutGrid size={17}/>{tr('Karten')}</button>
    <button type="button" className={value === 'list' ? 'active' : ''} aria-pressed={value === 'list'} onClick={() => onChange('list')}><List size={17}/>{tr('Liste')}</button>
  </div>;
}
