export function ClayBackground({ paused = false }: { paused?: boolean }) {
  return <div className="clay-background" data-paused={paused} aria-hidden="true">
    <span className="clay-orb clay-orb-one"/>
    <span className="clay-orb clay-orb-two"/>
    <span className="clay-orb clay-orb-three"/>
  </div>;
}
