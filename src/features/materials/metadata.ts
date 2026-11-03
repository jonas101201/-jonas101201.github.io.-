import type { Material } from '../../types/content';
const titleOrder = new Intl.Collator('de', { numeric: true, sensitivity: 'base' });
export function compareMaterials(a: Material, b: Material, sort: 'date' | 'title') {
  return (sort === 'date' ? b.publishedAt.localeCompare(a.publishedAt) : 0) || titleOrder.compare(a.title, b.title);
}
export function formatFileSize(bytes: number) {
  const units = ['B', 'kB', 'MB', 'GB'];
  const unit = Math.min(Math.floor(Math.log10(Math.max(bytes, 1)) / 3), units.length - 1);
  return `${new Intl.NumberFormat('de-DE', { maximumFractionDigits: 1 }).format(bytes / 1000 ** unit)} ${units[unit]}`;
}
export function materialDetails(material: Material) {
  return [material.pageCount ? `${material.pageCount} ${material.pageCount === 1 ? 'Seite' : 'Seiten'}` : '', material.sizeBytes ? formatFileSize(material.sizeBytes) : ''].filter(Boolean).join(' · ');
}
