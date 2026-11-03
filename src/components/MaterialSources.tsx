import { Link } from 'react-router-dom';
import { catalog } from '../data/catalog';
export function MaterialSources({ ids, title = 'In der Unterlage nachlesen' }: { ids?: string[]; title?: string }) {
  if (!ids?.length) return null;
  return <details className="sources material-sources"><summary>{title}</summary><ul>{ids.map(id => {
    const material = catalog.materials.find(m => m.id === id);
    return material && <li key={id}><Link to={`/materialien/${id}`}>{material.title}</Link></li>;
  })}</ul></details>;
}
