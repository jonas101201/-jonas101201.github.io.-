/** Repository-relative files only; reject URL schemes, traversal and encoded paths. */
export function isSafeMaterialPath(path: string): boolean {
  return /^materials\/(?:[a-zA-Z0-9_-]+\/)*[a-zA-Z0-9_-]+\.(pdf|txt|pptx|docx|zip|png)$/.test(path);
}
export function materialUrl(path: string, base = import.meta.env.BASE_URL): string {
  if (!isSafeMaterialPath(path)) throw new Error('Unsicherer Materialpfad');
  const api = import.meta.env.VITE_MATERIALS_API_ORIGIN?.replace(/\/$/, '');
  if (api) return `${api}/${path}`;
  return `${base.endsWith('/') ? base : `${base}/`}${path}`;
}
export function isNew(date: string, now = Date.now()): boolean {
  const age = now - Date.parse(date);
  return age >= 0 && age <= 14 * 86400000;
}
export const formatDate = (date: string) => new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(date));
