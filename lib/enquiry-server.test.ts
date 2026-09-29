import { test } from 'node:test';
import assert from 'node:assert/strict';
import { handleEnquiry, createRawEmail } from './enquiry-server';

const payload = { name: 'Test', email: 'visitor@example.com', message: 'Hello', color: 'rose', lang: 'de', website: '' };
function request(body: unknown = payload, origin = 'https://coilo.de') {
  return new Request('https://coilo.de/api/enquiry', { method: 'POST', headers: { origin, 'content-type': 'application/json' }, body: JSON.stringify(body) });
}
function setup(overrides = {}) {
  const sent: unknown[] = [];
  return { sent, dependencies: { ready: true, limit: async () => ({ success: true }), send: async (message: unknown) => { sent.push(message); }, ...overrides } };
}
test('sends selected color with visitor reply address, then confirms', async () => {
  const { sent, dependencies } = setup();
  const response = await handleEnquiry(request(), dependencies);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { ok: true });
  assert.equal(sent.length, 1);
  assert.match(JSON.stringify(sent[0]), /Rosé/);
  assert.match(JSON.stringify(sent[0]), /visitor@example.com/);
});
test('rejects invalid input and cross-origin requests without sending', async () => {
  for (const input of [{ ...payload, email: 'a@example.com\r\nBcc: x@example.com' }, { ...payload, color: 'invalid' }, { ...payload, message: 'x'.repeat(601) }, { ...payload, website: 'spam' }, null]) {
    const { sent, dependencies } = setup();
    assert.equal((await handleEnquiry(request(input), dependencies)).status, 400);
    assert.equal(sent.length, 0);
  }
  assert.equal((await handleEnquiry(request(payload, 'https://other.example'), setup().dependencies)).status, 403);
});
test('bounds payload size even without Content-Length', async () => {
  assert.equal((await handleEnquiry(request({ ...payload, message: 'x'.repeat(9000) }), setup().dependencies)).status, 413);
});
test('never claims success on missing configuration, rate limit, or provider failure', async () => {
  for (const [overrides, expected] of [
    [{ ready: false }, 503],
    [{ limit: async () => ({ success: false }) }, 429],
    [{ send: async () => { throw new Error('provider failed'); } }, 502],
  ] as const) {
    const result = await handleEnquiry(request(), setup(overrides).dependencies);
    assert.equal(result.status, expected);
    assert.equal((await result.json()).ok, undefined);
  }
});
test('MIME keeps Unicode text and uses the visitor only as Reply-To', () => {
  const text = 'Rosé — Grüße';
  const raw = createRawEmail('support@coilo.de', 'owner@example.com', { email: payload.email, subject: 'Coilo — Rosé', text });
  assert.match(raw, /From: Coilo <support@coilo.de>/);
  assert.match(raw, /Reply-To: visitor@example.com/);
  assert.equal(Buffer.from(raw.split('\r\n\r\n')[1].replace(/\r\n/g, ''), 'base64').toString('utf8'), text);
});
