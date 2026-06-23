// Brave Search Scraper — https://github.com/GimiRick/Brave-Search-Scraper
// License: CC BY-NC-ND 4.0 — see LICENSE file in project root.
// Permission is granted to view and run this code.
// No modifications, alterations, or derivative works are permitted.

'use strict';

process.env.NODE_ENV = 'test';

const { describe, it } = require('node:test');
const assert = require('node:assert');
const cheerio = require('cheerio');
const {
  randomItem,
  sleep,
  extractCookies,
  isBraveDomain,
  extractUrls,
  fetchWithRetry,
  scrapeBraveSearch,
  main,
  validateSearchQuery,
  searchQuerySchema,
  healthCheck,
} = require('../src/scraper.js');

describe('module exports', () => {
  it('exports all expected functions', () => {
    assert.strictEqual(typeof randomItem, 'function');
    assert.strictEqual(typeof sleep, 'function');
    assert.strictEqual(typeof extractCookies, 'function');
    assert.strictEqual(typeof isBraveDomain, 'function');
    assert.strictEqual(typeof extractUrls, 'function');
    assert.strictEqual(typeof fetchWithRetry, 'function');
    assert.strictEqual(typeof scrapeBraveSearch, 'function');
    assert.strictEqual(typeof main, 'function');
    assert.strictEqual(typeof validateSearchQuery, 'function');
    assert.strictEqual(typeof healthCheck, 'function');
  });

  it('exports the searchQuerySchema', () => {
    assert.ok(searchQuerySchema);
    assert.strictEqual(typeof searchQuerySchema.parse, 'function');
    assert.strictEqual(typeof searchQuerySchema.safeParse, 'function');
  });
});

describe('validateSearchQuery', () => {
  it('accepts a valid non-empty string', () => {
    const result = validateSearchQuery('machine learning');
    assert.strictEqual(result, 'machine learning');
  });

  it('accepts a string with special characters', () => {
    const result = validateSearchQuery('node.js & react + "hooks"');
    assert.strictEqual(result, 'node.js & react + "hooks"');
  });

  it('rejects empty string', () => {
    assert.throws(() => validateSearchQuery(''), {
      name: 'ZodError',
    });
  });

  it('rejects string with only whitespace', () => {
    assert.throws(() => validateSearchQuery('   '), {
      name: 'ZodError',
    });
  });

  it('rejects null', () => {
    assert.throws(() => validateSearchQuery(null), {
      name: 'ZodError',
    });
  });

  it('rejects undefined', () => {
    assert.throws(() => validateSearchQuery(undefined), {
      name: 'ZodError',
    });
  });

  it('rejects number', () => {
    assert.throws(() => validateSearchQuery(42), {
      name: 'ZodError',
    });
  });

  it('rejects object', () => {
    assert.throws(() => validateSearchQuery({}), {
      name: 'ZodError',
    });
  });

  it('rejects array', () => {
    assert.throws(() => validateSearchQuery([]), {
      name: 'ZodError',
    });
  });

  it('rejects excessively long string (>500 chars)', () => {
    const long = 'a'.repeat(501);
    assert.throws(() => validateSearchQuery(long), {
      name: 'ZodError',
    });
  });

  it('accepts maximum length string (500 chars)', () => {
    const max = 'a'.repeat(500);
    const result = validateSearchQuery(max);
    assert.strictEqual(result, max);
  });
});

describe('randomItem', () => {
  it('returns a value from the array', () => {
    const arr = [10, 20, 30];
    for (let i = 0; i < 100; i++) {
      const val = randomItem(arr);
      assert.ok(arr.includes(val), `unexpected value: ${val}`);
    }
  });

  it('handles single-element arrays', () => {
    assert.strictEqual(randomItem([42]), 42);
  });

  it('handles empty array (returns undefined)', () => {
    assert.strictEqual(randomItem([]), undefined);
  });
});

describe('sleep', () => {
  it('resolves after approximately the given time', async () => {
    const start = Date.now();
    await sleep(100);
    const elapsed = Date.now() - start;
    assert.ok(elapsed >= 90, `expected >= 90ms, got ${elapsed}ms`);
  });

  it('resolves with undefined', async () => {
    const result = await sleep(10);
    assert.strictEqual(result, undefined);
  });
});

describe('extractCookies', () => {
  it('returns empty string for null/undefined', () => {
    assert.strictEqual(extractCookies(null), '');
    assert.strictEqual(extractCookies(undefined), '');
  });

  it('parses single set-cookie header string', () => {
    const result = extractCookies('session=abc123; Path=/; HttpOnly');
    assert.strictEqual(result, 'session=abc123');
  });

  it('parses array of set-cookie headers', () => {
    const headers = ['session=abc123; Path=/', 'token=xyz; Domain=.example.com'];
    const result = extractCookies(headers);
    assert.strictEqual(result, 'session=abc123; token=xyz');
  });

  it('handles cookies with special characters in value', () => {
    const result = extractCookies('name=hello%20world; Path=/');
    assert.strictEqual(result, 'name=hello%20world');
  });
});

describe('isBraveDomain', () => {
  const brave = [
    'brave.com',
    'brave.app',
    'www.brave.com',
    'search.brave.com',
    'www.brave.app',
    'api.brave.com',
    'deep.sub.brave.com',
    'deep.sub.brave.app',
  ];
  brave.forEach((domain) => {
    it(`identifies ${domain} as a Brave domain`, () => {
      assert.strictEqual(isBraveDomain(domain), true);
    });
  });

  const nonBrave = [
    'google.com',
    'example.com',
    'brave.com.evil.com',
    'brave.app.evil.com',
    'evilbrave.com',
    'evilbrave.app',
    'notbrave.app',
    'mybrave.com',
    '',
    'localhost',
  ];
  nonBrave.forEach((domain) => {
    it(`does NOT identify ${domain || '(empty)'} as a Brave domain`, () => {
      assert.strictEqual(isBraveDomain(domain), false);
    });
  });

  it('handles null hostname without crashing', () => {
    assert.strictEqual(isBraveDomain(null), false);
  });

  it('handles undefined hostname without crashing', () => {
    assert.strictEqual(isBraveDomain(undefined), false);
  });
});

describe('extractUrls', () => {
  function makeCheerio(html) {
    return cheerio.load(html);
  }

  it('extracts external a[href] URLs', () => {
    const $ = makeCheerio('<a href="https://example.com">link</a>');
    const urls = extractUrls($);
    assert.deepStrictEqual(urls, ['https://example.com/']);
  });

  it('filters out brave.com a[href]', () => {
    const $ = makeCheerio('<a href="https://brave.com">brave</a>');
    assert.deepStrictEqual(extractUrls($), []);
  });

  it('filters out brave.app a[href]', () => {
    const $ = makeCheerio('<a href="https://brave.app">brave app</a>');
    assert.deepStrictEqual(extractUrls($), []);
  });

  it('filters out subdomains of brave.com and brave.app', () => {
    const html =
      '<a href="https://search.brave.com">s1</a>' +
      '<a href="https://www.brave.app">s2</a>' +
      '<a href="https://api.brave.com">s3</a>';
    assert.deepStrictEqual(extractUrls(makeCheerio(html)), []);
  });

  it('allows phishing-like domains (brave.com.evil.com)', () => {
    const html = '<a href="https://brave.com.evil.com/phish">phish</a>';
    const urls = extractUrls(makeCheerio(html));
    assert.deepStrictEqual(urls, ['https://brave.com.evil.com/phish']);
  });

  it('filters out relative, hash, and dangerous scheme hrefs', () => {
    const html =
      '<a href="/relative">r</a>' +
      '<a href="#hash">h</a>' +
      '<a href="javascript:void">j</a>' +
      '<a href="JAVASCRIPT:alert(1)">j2</a>' +
      '<a href="data:text/html,<script>alert(1)</script>">d</a>' +
      '<a href="vbscript:msgbox(1)">v</a>';
    assert.deepStrictEqual(extractUrls(makeCheerio(html)), []);
  });

  it('handles elements with no href attribute', () => {
    const $ = makeCheerio('<a>no href</a>');
    assert.deepStrictEqual(extractUrls($), []);
  });

  it('extracts [data-result-url] URLs', () => {
    const $ = makeCheerio('<div data-result-url="https://example.com/r">r</div>');
    assert.deepStrictEqual(extractUrls($), ['https://example.com/r']);
  });

  it('filters Brave domains from [data-result-url]', () => {
    const html =
      '<div data-result-url="https://brave.com/r">b1</div>' + '<div data-result-url="https://brave.app/r">b2</div>';
    assert.deepStrictEqual(extractUrls(makeCheerio(html)), []);
  });

  it('rejects invalid URLs in [data-result-url]', () => {
    const $ = makeCheerio('<div data-result-url="not-a-valid-url">bad</div>');
    assert.deepStrictEqual(extractUrls($), []);
  });

  it('rejects dangerous schemes in [data-result-url]', () => {
    const html =
      '<div data-result-url="javascript:alert(1)">j</div>' +
      '<div data-result-url="data:text/html,<script>alert(1)</script>">d</div>' +
      '<div data-result-url="vbscript:msgbox(1)">v</div>';
    assert.deepStrictEqual(extractUrls(makeCheerio(html)), []);
  });

  it('extracts [data-url] with http/https scheme', () => {
    const html = '<div data-url="https://example.com/d1">d1</div>' + '<div data-url="http://example.com/d2">d2</div>';
    const urls = extractUrls(makeCheerio(html));
    assert.deepStrictEqual(urls, ['https://example.com/d1', 'http://example.com/d2']);
  });

  it('rejects non-http schemes in [data-url]', () => {
    const html = '<div data-url="ftp://example.com">f</div>' + '<div data-url="file:///etc/passwd">file</div>';
    assert.deepStrictEqual(extractUrls(makeCheerio(html)), []);
  });

  it('filters Brave domains from [data-url]', () => {
    const html = '<div data-url="https://brave.com/d">b1</div>' + '<div data-url="http://brave.app/d">b2</div>';
    assert.deepStrictEqual(extractUrls(makeCheerio(html)), []);
  });

  it('deduplicates URLs using all extraction methods', () => {
    const html =
      '<a href="https://example.com">a</a>' +
      '<div data-result-url="https://example.com">d1</div>' +
      '<div data-url="https://example.com">d2</div>';
    const urls = extractUrls(makeCheerio(html));
    assert.strictEqual(urls.length, 1);
    assert.strictEqual(urls[0], 'https://example.com/');
  });

  it('handles empty HTML gracefully', () => {
    assert.deepStrictEqual(extractUrls(makeCheerio('')), []);
  });

  it('handles HTML with no links', () => {
    const $ = makeCheerio('<html><body><p>no links here</p></body></html>');
    assert.deepStrictEqual(extractUrls($), []);
  });

  it('handles uppercase hostnames (case-insensitive filtering)', () => {
    const html =
      '<a href="HTTPS://BRAVE.COM/PAGE">uc</a>' +
      '<div data-result-url="HTTP://BRAVE.APP/RESULT">dr</div>' +
      '<div data-url="https://BRAVE.COM/data">du</div>';
    assert.deepStrictEqual(extractUrls(makeCheerio(html)), []);
  });

  it('handles malformed URLs gracefully without crashing', () => {
    const html =
      '<a href="http://">empty-host</a>' +
      '<div data-result-url="://missing-scheme">ms</div>' +
      '<div data-url="http://">empty-data</div>';
    assert.deepStrictEqual(extractUrls(makeCheerio(html)), []);
  });
});

describe('fetchWithRetry — local server', () => {
  const http = require('http');

  function respond(statusCode) {
    return (req, res) => {
      res.writeHead(statusCode, { 'Content-Type': 'text/html' });
      res.end('<html><body>OK</body></html>');
    };
  }

  function withServer(behaviors, fn) {
    const remaining = [...behaviors];
    const server = http.createServer((req, res) => {
      const b = remaining.shift();
      if (typeof b === 'function') b(req, res);
      else respond(200)(req, res);
    });
    server.on('clientError', () => {});
    return new Promise((resolve, reject) => {
      server.on('error', reject);
      server.listen(0, () => {
        const port = server.address().port;
        fn(port)
          .finally(() => server.close())
          .then(resolve, reject);
      });
    });
  }

  it('succeeds on first try with status 200', async () => {
    await withServer([respond(200)], async (port) => {
      const result = await fetchWithRetry(`http://localhost:${port}`, {}, {}, 1);
      assert.strictEqual(result.status, 200);
      assert.ok(result.data);
    });
  });
});

describe('scrapeBraveSearch', () => {
  it('rejects empty query with validation error', async () => {
    try {
      await scrapeBraveSearch('');
      assert.fail('Should have thrown');
    } catch (err) {
      assert.strictEqual(err.name, 'ZodError');
      assert.ok(err.issues.length > 0);
    }
  });

  it('rejects null query with validation error', async () => {
    try {
      await scrapeBraveSearch(null);
      assert.fail('Should have thrown');
    } catch (err) {
      assert.strictEqual(err.name, 'ZodError');
    }
  });
});

describe('healthCheck', () => {
  it('returns a health check result object with correct structure', async () => {
    const result = await healthCheck();

    assert.ok(result);
    assert.strictEqual(typeof result, 'object');
    assert.ok(['ok', 'degraded', 'fail'].includes(result.status));
    assert.strictEqual(typeof result.version, 'string');
    assert.strictEqual(typeof result.timestamp, 'string');
    assert.ok(!isNaN(Date.parse(result.timestamp)));

    assert.ok(result.checks);
    assert.ok(result.checks.node);
    assert.ok(result.checks.dependencies);
    assert.ok(result.checks.network);

    assert.ok(['ok', 'fail'].includes(result.checks.node.status));
    assert.ok(['ok', 'fail'].includes(result.checks.dependencies.status));
  });

  it('reports all required dependencies as loaded', async () => {
    const result = await healthCheck();
    const deps = result.checks.dependencies;
    assert.strictEqual(deps.status, 'ok');
    assert.ok(deps.loaded.includes('axios'));
    assert.ok(deps.loaded.includes('cheerio'));
    assert.ok(deps.loaded.includes('zod'));
    assert.ok(deps.loaded.includes('pino'));
    assert.strictEqual(deps.missing.length, 0);
  });

  it('reports correct node version', async () => {
    const result = await healthCheck();
    assert.strictEqual(result.checks.node.version, process.version);
  });
});
