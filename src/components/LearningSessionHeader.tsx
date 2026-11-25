import { ContextBackLink } from './ContextLinks';
import { ArrowLeft } from 'lucide-react';
import type { ReactNode } from 'react';
import { useI18n } from '../i18n/context';
import { PageHeading } from './ui';
/** Shared session framing; quiz and card engines keep their existing state/behavior. */
export function LearningSessionHeader({ title, context, description, backTo, backLabel, current, total, positionLabel, progressLabel, children }: {
  title: string; context: string; description: string; backTo: string; backLabel: string;
  current: number; total: number; positionLabel: string; progressLabel: string; children?: ReactNode;
}) {
  const { tr } = useI18n();
  const percent = total ? Math.round(current / total * 100) : 0;
  return <header className="learning-session-header"><ContextBackLink className="back-link" originLabel={tr('Zurück zur vorherigen Übersicht')} to={backTo}><ArrowLeft size={16}/>{backLabel}</ContextBackLink><PageHeading eyebrow={context} title={title} description={description}>{children}</PageHeading><div className="quiz-progress"><span>{positionLabel}</span><span>{tr('{0} % abgeschlossen', [percent])}</span></div><progress value={current} max={Math.max(total, 1)} aria-label={progressLabel}/></header>;
}
