import { useI18n } from '../../i18n/context';
import { levelFor } from './rules';
import { useProgression } from './store';

export function ProgressHomeStats() {
  const { state, enabled } = useProgression();
  const { tr, locale } = useI18n();
  if (!enabled) return null;
  const number = new Intl.NumberFormat(locale);
  const level = levelFor(state.xp);
  return <p className="panel-footnote">{tr('Level {0}', [level.level])} · {number.format(state.xp)} XP · {number.format(state.credits)} HUB Credits</p>;
}
