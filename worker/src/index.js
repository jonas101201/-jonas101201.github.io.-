// Access protects the hostname; verify its signed identity again at the origin.
import catalog from '../../src/data/catalog.json' with { type: 'json' };
const files = new Map(catalog.materials.flatMap(m => [[m.path, m.originalFilename ?? m.path.split('/').pop()], ...(m.preview ? [[m.preview.path, m.preview.path.split('/').pop()]] : [])]));
const types = { pdf: 'application/pdf', png: 'image/png', txt: 'text/plain; charset=utf-8', docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', zip: 'application/zip' };
const security = { 'cache-control': 'private, no-store', 'x-content-type-options': 'nosniff', 'referrer-policy': 'no-referrer', 'content-security-policy': "default-src 'none'; sandbox; frame-ancestors 'none'" };
function response(message, status) {
  return new Response(message, { status, headers: { ...security, 'content-type': 'text/plain; charset=utf-8' } });
}
const keyCache = new Map();
function bytes(value) {
  if (!/^[A-Za-z0-9_-]+$/.test(value)) throw new Error('Invalid base64url');
  return Uint8Array.from(atob(value.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(value.length / 4) * 4, '=')), c => c.charCodeAt(0));
}
async function verifyAccess(request, env) {
  try {
    const jwt = request.headers.get('Cf-Access-Jwt-Assertion');
    if (!jwt || jwt.length > 16384 || !/^https:\/\/[a-z0-9-]+\.cloudflareaccess\.com$/.test(env.ACCESS_TEAM_DOMAIN ?? '') || !env.ACCESS_AUD) return false;
    const allowed = (env.ALLOWED_EMAILS ?? '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
    if (!allowed.length) return false;
    const parts = jwt.split('.');
    if (parts.length !== 3) return false;
    const [h, p, s] = parts;
    const decode = value => JSON.parse(new TextDecoder().decode(bytes(value)));
    const header = decode(h), payload = decode(p), now = Date.now() / 1000;
    if (header.alg !== 'RS256' || typeof header.kid !== 'string' || !Array.isArray(payload.aud) || !payload.aud.includes(env.ACCESS_AUD)) return false;
    if (payload.iss !== env.ACCESS_TEAM_DOMAIN || !Number.isFinite(payload.exp) || payload.exp <= now || !Number.isFinite(payload.iat) || payload.iat > now || (payload.nbf !== undefined && (!Number.isFinite(payload.nbf) || payload.nbf > now))) return false;
    if (payload.type !== 'app' || typeof payload.sub !== 'string' || !payload.sub || typeof payload.email !== 'string' || !allowed.includes(payload.email.toLowerCase())) return false;
    let cached = keyCache.get(env.ACCESS_TEAM_DOMAIN);
    if (!cached || cached.expires <= Date.now() || !cached.keys.some(k => k.kid === header.kid)) {
      const jwks = await fetch(env.ACCESS_TEAM_DOMAIN + '/cdn-cgi/access/certs', { redirect: 'error', signal: AbortSignal.timeout(10000) });
      if (!jwks.ok) return false;
      const { keys } = await jwks.json();
      if (!Array.isArray(keys)) return false;
      cached = { keys, expires: Date.now() + 300000 };
      keyCache.set(env.ACCESS_TEAM_DOMAIN, cached);
    }
    const jwk = cached.keys.find(k => k.kid === header.kid && k.kty === 'RSA' && (!k.alg || k.alg === 'RS256') && (!k.use || k.use === 'sig'));
    if (!jwk) return false;
    const key = await crypto.subtle.importKey('jwk', jwk, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
    return await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, bytes(s), new TextEncoder().encode(h + '.' + p));
  } catch { return false; }
}
export default {
  async fetch(request, env) {
    const url = new URL(request.url), path = url.pathname.slice(1);
    if (!/^materials\/(?:[a-zA-Z0-9_-]+\/)*[a-zA-Z0-9_-]+\.(pdf|txt|pptx|docx|zip|png)$/.test(path) || !files.has(path)) return response('Not found', 404);
    if (!['GET', 'HEAD'].includes(request.method)) return response('Method not allowed', 405);
    if (!await verifyAccess(request, env)) return response('Unauthorized', 401);
    if (!env.GITHUB_TOKEN || !env.GITHUB_OWNER || !env.GITHUB_REPO || !env.GITHUB_REF) return response('Server configuration missing', 503);
    try {
      const upstream = await fetch('https://api.github.com/repos/' + encodeURIComponent(env.GITHUB_OWNER) + '/' + encodeURIComponent(env.GITHUB_REPO) + '/contents/' + path.split('/').map(encodeURIComponent).join('/') + '?ref=' + encodeURIComponent(env.GITHUB_REF), {
        method: request.method,
        headers: { Authorization: 'Bearer ' + env.GITHUB_TOKEN, Accept: 'application/vnd.github.raw+json', 'User-Agent': 'LernHub-Private-Materials', 'X-GitHub-Api-Version': '2022-11-28' },
        redirect: 'manual', signal: AbortSignal.timeout(15000)
      });
      if (!upstream.ok || upstream.status !== 200) return response(upstream.status === 404 ? 'Not found' : 'Material unavailable', upstream.status === 404 ? 404 : 502);
      const filename = files.get(path);
      const disposition = url.searchParams.get('download') === '1' ? 'attachment' : 'inline';
      const headers = new Headers({ ...security, 'content-type': types[path.split('.').pop()], 'content-disposition': disposition + '; filename="' + filename.replace(/[^a-zA-Z0-9._-]/g, '_') + '"; filename*=UTF-8\'\'' + encodeURIComponent(filename).replace(/['()*]/g, c => '%' + c.charCodeAt(0).toString(16).toUpperCase()) });
      const length = upstream.headers.get('content-length');
      if (length) headers.set('content-length', length);
      return new Response(request.method === 'HEAD' ? null : upstream.body, { status: 200, headers });
    } catch { return response('Material unavailable', 502); }
  }
};
