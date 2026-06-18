'use strict';

process.env.NODE_ENV = 'test';

const { describe, it } = require('node:test');
const assert = require('node:assert');
const http = require('http');
const { fetchWithRetry } = require('../src/scraper.js');

function respond(statusCode) {
  return (req, res) => {
    res.writeHead(statusCode, { 'Content-Type': 'text/html' });
    res.end('<html><body>OK</body></html>');
  };
}

function destroySocket() {
  return (req, res) => {
    res.destroy();
  };
}

function withServer(behaviors, fn) {
  const remaining = [...behaviors];
  const server = http.createServer((req, res) => {
    const b = remaining.shift();
    if (typeof b === 'function') {
      b(req, res);
    } else {
      respond(200)(req, res);
    }
  });
  server.on('clientError', () => {});
  return new Promise((resolve, reject) => {
    server.on('error', reject);
    server.listen(0, () => {
      const port = server.address().port;
      fn(port)
        .finally(() => {
          server.close();
        })
        .then(resolve, reject);
    });
  });
}

describe('fetchWithRetry retry behavior', () => {
  it('succeeds after 429 retries', async () => {
    await withServer([respond(429), respond(429), respond(200)], async (port) => {
      const result = await fetchWithRetry(`http://localhost:${port}`, {}, {}, 3);
      assert.strictEqual(result.status, 200);
    });
  });

  it('throws after all 429 retries exhausted', async () => {
    await withServer([respond(429), respond(429), respond(429), respond(429)], async (port) => {
      await assert.rejects(() => fetchWithRetry(`http://localhost:${port}`, {}, {}, 3), { message: /rate limited/i });
    });
  });

  it('recovers after temporary network failures', async () => {
    await withServer([destroySocket(), destroySocket(), respond(200)], async (port) => {
      const result = await fetchWithRetry(`http://localhost:${port}`, {}, {}, 3);
      assert.strictEqual(result.status, 200);
    });
  });

  it('throws after exhausting retries with network failures', async () => {
    await withServer([destroySocket(), destroySocket(), destroySocket(), destroySocket()], async (port) => {
      await assert.rejects(() => fetchWithRetry(`http://localhost:${port}`, {}, {}, 3));
    });
  });
});
