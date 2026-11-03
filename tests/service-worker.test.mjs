import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const source = await readFile(new URL('../service-worker.js', import.meta.url), 'utf8');
const listeners = {};
let cacheWriteFinished = false;
let waitUntilPromise;
const response = { ok: true, clone() { return { cached: true }; } };
const cache = {
  async put(request, value) {
    assert.equal(request.url, 'https://example.test/game.js');
    assert.deepEqual(value, { cached: true });
    await Promise.resolve();
    cacheWriteFinished = true;
  }
};
const context = {
  URL,
  caches: {
    async match() { return undefined; },
    async open(name) {
      assert.equal(name, 'kmg-v0.8.0');
      return cache;
    },
    async keys() { return []; },
    async delete() { return true; }
  },
  fetch: async () => response,
  self: {
    location: { origin: 'https://example.test' },
    addEventListener(name, callback) { listeners[name] = callback; },
    skipWaiting: async () => {},
    clients: { claim: async () => {} }
  }
};
vm.runInNewContext(source, context, { filename: 'service-worker.js' });

const event = {
  request: { method: 'GET', url: 'https://example.test/game.js', mode: 'cors' },
  waitUntil(promise) { waitUntilPromise = promise; },
  respondWith(promise) { this.responsePromise = promise; }
};
listeners.fetch(event);
assert.ok(waitUntilPromise, 'fetch handler must extend the worker lifetime synchronously');
assert.equal(await event.responsePromise, response, 'network response must be returned');
await waitUntilPromise;
assert.equal(cacheWriteFinished, true, 'worker lifetime must include the cache write');

console.log('PASS service worker: cache refresh is covered by waitUntil');
