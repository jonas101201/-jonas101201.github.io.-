import { useI18n } from '../../i18n/context';

export function CompletionReward({ reward }: { reward: { xp: number; credits: number } | null }) {
  const { tr } = useI18n();
  return reward ? <p className="notice" data-motion-success role="status">
    {tr('{0} XP und {1} HUB Credits erhalten.', [reward.xp, reward.credits])}
  </p> : null;
}
