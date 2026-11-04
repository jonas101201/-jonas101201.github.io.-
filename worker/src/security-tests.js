import { test, before, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import gateway from './index.js';
import catalog from '../../src/data/catalog.json' with { type: 'json' };
const path = catalog.materials[0].path;
const env = { ACCESS_TEAM_DOMAIN: 'https://test.cloudflareaccess.com', ACCESS_AUD: 'audience', ALLOWED_EMAILS: 'allowed@example.test', GITHUB_TOKEN: 'test-secret', GITHUB_OWNER: 'owner', GITHUB_REPO: 'private', GITHUB_REF: 'main' };
let pair, jwk;
const realFetch = globalThis.fetch;
before(async () => {
  pair = await crypto.subtle.generateKey({ name: 'RSASSA-PKCS1-v1_5', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' }, true, ['sign', 'verify']);
  jwk = { ...await crypto.subtle.exportKey('jwk', pair.publicKey), kid: 'test-key', alg: 'RS256', use: 'sig' };
});
afterEach(() => { globalThis.fetch = realFetch; });
async function token(overrides = {}, headerOverrides = {}) {
  const encode = obj => Buffer.from(JSON.stringify(obj)).toString('base64url');
  const h = encode({ alg: 'RS256', kid: 'test-key', ...headerOverrides });
  const p = encode({ aud: ['audience'], iss: env.ACCESS_TEAM_DOMAIN, iat: Math.floor(Date.now()/1000)-5, exp: Math.floor(Date.now()/1000)+3600, type: 'app', sub: 'user', email: 'allowed@example.test', ...overrides });
  const sig = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', pair.privateKey, new TextEncoder().encode(h+'.'+p));
  return h+'.'+p+'.'+Buffer.from(sig).toString('base64url');
}
function mock(upstream = () => new Response('private-file', { headers: { 'content-type': 'application/json' } })) {
  const calls = [];
  globalThis.fetch = async (url, options) => { calls.push({url, options}); return url.endsWith('/cdn-cgi/access/certs') ? Response.json({keys:[jwk]}) : upstream(url, options); };
  return calls;
}
function request(jwt, suffix = '', method = 'GET') {
  return new Request('https://materials.example.test/'+path+suffix, { method, headers: jwt ? {'Cf-Access-Jwt-Assertion': jwt} : {} });
}
test('missing, malformed and forged assertions never reach GitHub', async () => {
  const calls = mock();
  for (const jwt of [null, 'a.b.c', 'a.b.c.d', '%%%%.abc.def', (await token()).slice(0,-10)+'AAAA']) assert.equal((await gateway.fetch(request(jwt),env)).status,401);
  assert.equal(calls.filter(c=>c.url.startsWith('https://api.github.com')).length,0);
});
test('rejects signed tokens with unauthorized claims', async () => {
  const calls = mock();
  for (const overrides of [{exp:0},{aud:['wrong']},{iss:'https://evil.test'},{iat:Date.now()/1000+100},{nbf:Date.now()/1000+100},{email:'other@example.test'},{email:undefined},{sub:''},{type:'service'},{exp:'forever'}]) assert.equal((await gateway.fetch(request(await token(overrides)),env)).status,401);
  assert.equal((await gateway.fetch(request(await token({}, {alg:'HS256'})),env)).status,401);
  assert.equal(calls.filter(c=>c.url.startsWith('https://api.github.com')).length,0);
});
test('missing configuration and unavailable signing keys fail closed', async () => {
  for (const key of ['ACCESS_TEAM_DOMAIN','ACCESS_AUD','ALLOWED_EMAILS']) assert.equal((await gateway.fetch(request(await token()),{...env,[key]:''})).status,401);
  globalThis.fetch = async () => { throw new Error('network'); };
  assert.equal((await gateway.fetch(request(await token({}, {kid:'unknown'})),env)).status,401);
  assert.equal((await gateway.fetch(request(await token()),{...env,GITHUB_TOKEN:''})).status,503);
});
test('rejects traversal, encoded paths, uncatalogued files and write methods', async () => {
  const calls = mock();
  for (const p of ['materials/%252e%252e/secret.pdf','materials/%61.pdf','materials/not-in-catalog.pdf','materials/a.pdf/extra','materials/a%00.pdf','materials//a.pdf']) assert.equal((await gateway.fetch(new Request('https://materials.example.test/'+p),env)).status,404);
  assert.equal((await gateway.fetch(request(null,'','POST'),env)).status,405);
  assert.equal(calls.length,0);
});
test('authorized preview and download return controlled MIME, names and no-store', async () => {
  const calls = mock(); const jwt = await token();
  for (const suffix of ['', '?download=1']) {
    const result = await gateway.fetch(request(jwt,suffix),env);
    assert.equal(result.status,200); assert.equal(await result.text(),'private-file');
    assert.match(result.headers.get('content-type'), /^(application\/pdf|text\/plain|image\/png|application\/)/);
    assert.notEqual(result.headers.get('content-type'),'application/json');
    assert.match(result.headers.get('content-disposition'),suffix ? /^attachment;/ : /^inline;/);
    assert.match(result.headers.get('cache-control'),/no-store/);
    assert.equal(result.headers.get('x-content-type-options'),'nosniff');
    assert.equal(result.headers.get('access-control-allow-origin'),null);
    assert.ok(!JSON.stringify([...result.headers]).includes(env.GITHUB_TOKEN));
  }
  assert.equal(calls.at(-1).options.headers.Authorization,'Bearer test-secret');
  assert.equal(calls.at(-1).options.redirect,'manual');
});
test('HEAD is bodyless and forwards HEAD upstream', async () => {
  const calls = mock(() => new Response(null, {headers:{'content-length':'123'}}));
  const result = await gateway.fetch(request(await token(),'','HEAD'),env);
  assert.equal(result.status,200); assert.equal(await result.text(),''); assert.equal(result.headers.get('content-length'),'123'); assert.equal(calls.at(-1).options.method,'HEAD');
});
test('upstream failures and redirects never leak content or credentials', async () => {
  const jwt = await token();
  for (const status of [301,302,403,404,429,500]) {
    mock(() => new Response('secret error', {status,headers:{location:'https://evil.test'}}));
    const result = await gateway.fetch(request(jwt),env);
    assert.equal(result.status,status===404?404:502); assert.ok(!(await result.text()).includes('secret')); assert.equal(result.headers.get('location'),null);
  }
  mock(() => {throw new Error('secret');});
  assert.equal((await gateway.fetch(request(jwt),env)).status,502);
});

test('native Worker Access context binds audience and email without trusting headers', async () => {
  const calls = mock();
  const context = (aud, email) => ({ access: { aud, async getIdentity() { return { email }; } } });
  const accepted = await gateway.fetch(request(null), env, context('audience', 'ALLOWED@example.test'));
  assert.equal(accepted.status, 200);
  assert.equal(await accepted.text(), 'private-file');
  const before = calls.length;
  for (const ctx of [context('wrong', 'allowed@example.test'), context('audience', 'other@example.test'), context('audience', undefined), { access: { aud: 'audience', getIdentity() { throw new Error('unavailable'); } } }]) {
    assert.equal((await gateway.fetch(request(await token()), env, ctx)).status, 401);
  }
  assert.equal(calls.length, before);
  assert.equal((await gateway.fetch(request(null), { ...env, ALLOWED_EMAILS: '' }, context('audience', 'allowed@example.test'))).status, 401);
  assert.equal((await gateway.fetch(request(null), env, {})).status, 401);
});
