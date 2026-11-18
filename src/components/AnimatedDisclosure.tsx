import type { ReactNode } from 'react';

/** Grid interpolation animates intrinsic height; inert content cannot receive focus. */
export function AnimatedDisclosure({ open, id, children }: { open: boolean; id?: string; children: ReactNode }) {
  return <div id={id} className={`disclosure-panel ${open ? 'is-open' : ''}`} inert={!open} aria-hidden={!open}>
    <div className="disclosure-clip">{children}</div>
  </div>;
}
