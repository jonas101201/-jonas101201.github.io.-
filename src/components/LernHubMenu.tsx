import { useEffect, useId, useRef, type MouseEvent, type RefObject } from 'react';
import { ArrowDownToLine, BarChart3, Bell, Database, Flag, Heart, Info, Languages, Palette, Settings, ShieldCheck, Sparkles, Trophy, Users, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useI18n } from '../i18n/context';
import { lockPageScroll } from '../utils/scrollLock';

const groups = [
  { label: 'Mein LernHub', links: [
    { label: 'Fortschritt', to: '/fortschritt', Icon: BarChart3 },
    { label: 'Lernmissionen', to: '/fortschritt#missionen', Icon: Flag },
    { label: 'Erfolge', to: '/fortschritt#erfolge', Icon: Trophy },
    { label: 'LernHub Studio', to: '/fortschritt/studio', Icon: Palette },
    { label: 'Sammlung', to: '/fortschritt/store?auswahl=owned', Icon: Sparkles },
    { label: 'Wunschliste', to: '/fortschritt/store?auswahl=wishlist', Icon: Heart },
  ] },
  { label: 'Einstellungen', links: [
    { label: 'Erscheinungsbild', to: '/einstellungen#appearance-heading', Icon: Settings },
    { label: 'Animationen', to: '/einstellungen#animation-heading', Icon: Sparkles },
    { label: 'Sprache', to: '/einstellungen#language-heading', Icon: Languages },
    { label: 'Datenschutz', to: '/datenschutz', Icon: ShieldCheck },
    { label: 'Speicher', to: '/speicher', Icon: Database },
    { label: 'Sicherung und Import', to: '/fortschritt/speicher', Icon: ArrowDownToLine },
  ] },
  { label: 'Organisation', links: [
    { label: 'Klasse', to: '/klasse', Icon: Users },
    { label: 'Termine', to: '/termine', Icon: Bell },
  ] },
  { label: 'Informationen', links: [
    { label: 'Über LernHub', to: '/ueber', Icon: Info },
  ] },
];

export function LernHubMenu({ anchor, onClose }: { anchor: RefObject<HTMLButtonElement | null>; onClose: () => void }) {
  const { tr } = useI18n();
  const title = useId();
  const dialog = useRef<HTMLDialogElement>(null);
  const close = useRef<HTMLButtonElement>(null);
  const navigating = useRef(false);

  useEffect(() => {
    const element = dialog.current!;
    const button = anchor.current;
    const unlock = lockPageScroll();
    element.showModal();
    close.current?.focus({ preventScroll: true });
    return () => {
      element.close();
      unlock(!navigating.current);
      if (!navigating.current) button?.focus({ preventScroll: true });
    };
  }, [anchor]);

  function closeOnBackdrop(event: MouseEvent<HTMLDialogElement>) {
    if (event.target !== event.currentTarget) return;
    const { top, bottom, left, right } = event.currentTarget.getBoundingClientRect();
    if (event.clientX < left || event.clientX > right || event.clientY < top || event.clientY > bottom) onClose();
  }

  return <dialog ref={dialog} id="lernhub-menu" className="lernhub-menu" aria-labelledby={title}
    onCancel={event => { event.preventDefault(); onClose(); }} onClick={closeOnBackdrop}>
    <div className="lernhub-menu-header">
      <h2 id={title}>{tr('LernHub-Menü')}</h2>
      <button ref={close} className="icon-button" aria-label={tr('Menü schließen')} onClick={onClose}><X size={20} aria-hidden="true"/></button>
    </div>
    <nav className="lernhub-menu-groups" aria-label={tr('LernHub-Menü')}>
      {groups.map(({ label, links }) => <section key={label}>
        <h3>{tr(label)}</h3>
        <ul>{links.map(({ to, label, Icon }) => <li key={to}>
          <Link to={to} onClick={event => {
            if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
            navigating.current = true;
            onClose();
          }}><Icon size={18} aria-hidden="true"/><span>{tr(label)}</span></Link>
        </li>)}</ul>
      </section>)}
    </nav>
  </dialog>;
}
