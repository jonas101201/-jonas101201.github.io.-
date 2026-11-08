import { Check } from 'lucide-react';
/** Keep a stable polite live region; confirmation never steals focus. */
export function ActionFeedback({ message }: { message: string }) {
  return <p className="action-feedback" role="status" aria-atomic="true">{message && <><Check size={16} aria-hidden="true"/><span>{message}</span></>}</p>;
}
