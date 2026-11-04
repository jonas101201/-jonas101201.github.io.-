// LernHub private materials gateway. Authentication is delegated to Cloudflare Access.
// IMPORTANT: Access must protect this Worker hostname and validate email allowlisting.
// Do not deploy without configuring Access and removing public materials from Pages.
const decoder = new TextDecoder();
function response(message, status = 400) {
  return new Response(message, { status, headers: { "cache-control": "no-store", "content-type": "text/plain; charset=utf-8" } });
}
function parsePath(pathname) {
  if (!pathname.startsWith("/materials/")) return null;
  const path = pathname.slice(1);
  if (!/^materials\/(?:[a-zA-Z0-9_-]+\/)*[a-zA-Z0-9_-]+\.(pdf|txt|pptx|docx|zip|png)$/.test(path)) return null;
  return path;
}
async function verifyAccess(request, env) {
  const jwt = request.headers.get("Cf-Access-Jwt-Assertion");
  if (!jwt || !env.ACCESS_TEAM_DOMAIN || !env.ACCESS_AUD) return false;
  // Cloudflare Access validates JWT at the edge when Access is configured.
  // Validate the signed JWT again here to avoid trusting spoofed headers.
  const { hostname } = new URL(env.ACCESS_TEAM_DOMAIN);
  const jwks = await fetch("https://" + hostname + "/cdn-cgi/access/certs");
  if (!jwks.ok) return false;
  const { keys } = await jwks.json();
  const [h, p, s] = jwt.split(".");
  if (!h || !p || !s) return false;
  const decode = (v) => JSON.parse(decoder.decode(Uint8Array.from(atob(v.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(v.length / 4) * 4, "=")), c => c.charCodeAt(0))));
  let header, payload;
  try { header = decode(h); payload = decode(p); } catch { return false; }
  if (header.alg !== "RS256" || !header.kid || !Array.isArray(payload.aud) || !payload.aud.includes(env.ACCESS_AUD)) return false;
  if (payload.iss !== "https://" + hostname || !Number.isFinite(payload.exp) || payload.exp <= Date.now() / 1000) return false;
  const jwk = keys.find(k => k.kid === header.kid && k.kty === "RSA");
  if (!jwk) return false;
  try {
    const key = await crypto.subtle.importKey("jwk", jwk, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["verify"]);
    const signature = Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(s.length / 4) * 4, "=")), c => c.charCodeAt(0));
    return await crypto.subtle.verify("RSASSA-PKCS1-v1_5", key, signature, new TextEncoder().encode(h + "." + p));
  } catch { return false; }
}
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = parsePath(url.pathname);
    if (!path) return response("Not found", 404);
    if (!["GET", "HEAD"].includes(request.method)) return response("Method not allowed", 405);
    if (!await verifyAccess(request, env)) return response("Unauthorized", 401);
    if (!env.GITHUB_TOKEN) return response("Server configuration missing", 503);
    const upstream = await fetch("https://api.github.com/repos/" + encodeURIComponent(env.GITHUB_OWNER) + "/" + encodeURIComponent(env.GITHUB_REPO) + "/contents/" + path.split("/").map(encodeURIComponent).join("/") + "?ref=" + encodeURIComponent(env.GITHUB_REF), {
      headers: { Authorization: "Bearer " + env.GITHUB_TOKEN, Accept: "application/vnd.github.raw+json", "User-Agent": "LernHub-Private-Materials", "X-GitHub-Api-Version": "2022-11-28" },
      redirect: "manual"
    });
    if (!upstream.ok) return response(upstream.status === 404 ? "Not found" : "Material unavailable", upstream.status === 404 ? 404 : 502);
    const headers = new Headers({ "cache-control": "private, no-store", "x-content-type-options": "nosniff", "content-security-policy": "default-src 'none'; sandbox" });
    const type = upstream.headers.get("content-type");
    if (type) headers.set("content-type", type);
    const length = upstream.headers.get("content-length");
    if (length) headers.set("content-length", length);
    return new Response(request.method === "HEAD" ? null : upstream.body, { status: 200, headers });
  }
};
