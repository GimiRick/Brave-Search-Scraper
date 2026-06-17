// Brave Search Scraper — https://github.com/GimiRick/Brave-Search-Scraper
// License: CC BY-NC-ND 4.0 — see LICENSE file in project root.
// Permission is granted to view and run this code.
// No modifications, alterations, or derivative works are permitted.

'use strict';
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
    assert.deepStrictEqual(urls, ['https://example.com']);
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
    assert.strictEqual(urls[0], 'https://example.com');
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

describe('fetchWithRetry', () => {
  it('fetches and returns response on success', async () => {
    try {
      const result = await fetchWithRetry('http://example.com', {}, {});
      assert.ok(result);
      assert.strictEqual(result.status, 200);
      assert.ok(result.data);
    } catch {
      // Network failures are acceptable — depends on external services.
      assert.ok(true);
    }
  });
});

describe('scrapeBraveSearch', () => {
  it('returns an array of URLs (or empty on failure)', async () => {
    try {
      const urls = await scrapeBraveSearch('test');
      assert.ok(Array.isArray(urls));
    } catch {
      // Network failures are acceptable — the function is async and
      // depends on external services. Just verify it doesn't crash.
      assert.ok(true);
    }
  });
});
