const ANALYTICS_HOST = 'jonas101201.github.io';
const ANALYTICS_PATH = '/-jonas101201.github.io.-/';
// Public beacon identifier supplied by Cloudflare, not an API credential.
const SITE_TOKEN = '69e13b7a80414317ade1aa5e3101dac2';

export function startWebAnalytics(production = import.meta.env.PROD, page: Pick<Location, 'hostname' | 'pathname'> = window.location): void {
  if (!production || page.hostname !== ANALYTICS_HOST || !page.pathname.startsWith(ANALYTICS_PATH)) return;
  if (document.querySelector('script[data-lernhub-analytics]')) return;
  const script = document.createElement('script');
  script.src = 'https://static.cloudflareinsights.com/beacon.min.js';
  script.async = true;
  script.dataset.cfBeacon = JSON.stringify({ token: SITE_TOKEN });
  script.dataset.lernhubAnalytics = 'true';
  document.body.append(script);
}
