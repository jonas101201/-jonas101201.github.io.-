import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../../i18n/context';
import { enchantedGarden } from './worlds';

export function ShopSpotlight() {
  const { tr, locale } = useI18n();
  const track = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  function slide(index: number) {
    const rail = track.current;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    rail?.scrollTo({ left: rail.clientWidth * index, behavior: reduce ? 'instant' : 'smooth' });
  }

  return <section className="shop-spotlight" aria-label={tr('Im Shop entdecken')}>
    <div ref={track} className="shop-spotlight-track" onScroll={event => {
      const rail = event.currentTarget;
      setActive(Math.min(1, Math.round(rail.scrollLeft / rail.clientWidth)));
    }}>
      <article className="collection-shop-hero" data-active={active === 0 || undefined} inert={active !== 0} aria-hidden={active !== 0}>
        <div>
          <h2>Pflanziska</h2>
          <p>{tr('Unsere Klassenpflanze. Jetzt auch digital.')}</p>
          <Link className="button primary" to="/fortschritt/begleiter">{tr('Pflanziska entdecken')}</Link>
        </div>
        <img src={import.meta.env.BASE_URL + 'worlds/pflanziska.webp'} alt="" width="440" height="660" decoding="async"/>
      </article>
      <article className="collection-shop-hero shop-spotlight-garden" data-active={active === 1 || undefined} inert={active !== 1} aria-hidden={active !== 1}>
        <div>
          <h2>{enchantedGarden.name}</h2>
          <p>{tr('{0} HUB Credits', [new Intl.NumberFormat(locale).format(enchantedGarden.price)])}</p>
          <Link className="button primary" to="?welt=enchanted-garden">{tr('Welt ansehen')}</Link>
        </div>
        <picture>
          <source media="(max-width: 600px)" srcSet={import.meta.env.BASE_URL + 'worlds/enchanted-garden-small.webp'}/>
          <img src={import.meta.env.BASE_URL + 'worlds/enchanted-garden.webp'} alt="" width="1440" height="810" decoding="async"/>
        </picture>
      </article>
    </div>
    <div className="shop-spotlight-indicators">
      {['Pflanziska', enchantedGarden.name].map((name, index) => <button key={name} type="button" aria-label={name} aria-pressed={active === index} onClick={() => slide(index)}/>)}
    </div>
  </section>;
}
