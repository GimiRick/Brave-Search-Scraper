#!/usr/bin/env node

// Brave Search Scraper — https://github.com/GimiRick/Brave-Search-Scraper
// License: CC BY-NC-ND 4.0 — see LICENSE file.
// Permission is granted to view and run this code.
// No modifications, alterations, or derivative works are permitted.

'use strict';

const axios = require('axios');
const cheerio = require('cheerio');
const { z, ZodError } = require('zod');
const logger = require('./logger');

const BRAVE_SEARCH_URL = 'https://search.brave.com/search';

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:127.0) Gecko/20100101 Firefox/127.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
];

const searchQuerySchema = z
  .string({
    required_error: 'Search query is required',
    invalid_type_error: 'Search query must be a string',
  })
  .trim()
  .min(1, 'Search query cannot be empty')
  .max(500, 'Search query is too long');

function validateSearchQuery(query) {
  return searchQuerySchema.parse(query);
}

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function extractCookies(setCookieHeader) {
  if (!setCookieHeader) return '';
  const cookies = Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader];
  return cookies.map((c) => c.split(';')[0]).join('; ');
}

function isBraveDomain(hostname) {
  if (!hostname) return false;
  const h = hostname.toLowerCase();
  return h === 'brave.com' || h === 'brave.app' || h.endsWith('.brave.com') || h.endsWith('.brave.app');
}

function extractUrls($) {
  const urls = new Set();

  $('a[href]').each((_, el) => {
    const href = $(el).attr('href');
    if (!href || href.startsWith('/') || href.startsWith('#') || /^\s*(?:javascript|data|vbscript):/i.test(href))
      return;
    try {
      const parsed = new URL(href);
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return;
      if (isBraveDomain(parsed.hostname)) return;
    } catch {
      return;
    }
    urls.add(href);
  });

  $('[data-result-url]').each((_, el) => {
    const url = $(el).attr('data-result-url');
    if (!url) return;
    try {
      const parsed = new URL(url);
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return;
      if (!isBraveDomain(parsed.hostname)) urls.add(url);
    } catch {
      return;
    }
  });

  $('[data-url]').each((_, el) => {
    const url = $(el).attr('data-url');
    if (!url) return;
    try {
      const parsed = new URL(url);
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return;
      if (!isBraveDomain(parsed.hostname)) urls.add(url);
    } catch {
      return;
    }
  });

  return [...urls];
}

async function fetchWithRetry(url, params, headers, retries = 3) {
  for (let attempt = 1; attempt <= retries + 1; attempt++) {
    try {
      const response = await axios.get(url, {
        params,
        headers,
        timeout: 20000,
        maxRedirects: 5,
        validateStatus: (status) => status < 400 || status === 429,
      });

      if (response.status === 429) {
        if (attempt <= retries) {
          const wait = Math.min(1000 * Math.pow(2, attempt) + Math.random() * 1000, 15000);
          logger.warn(
            { retry: attempt, maxRetries: retries, waitMs: Math.round(wait) },
            `Rate limited (429). Retrying in ${Math.round(wait / 1000)}s...`,
          );
          await sleep(wait);
          continue;
        }
        logger.error({ retries }, 'Rate limited (429) — all retries exhausted.');
        throw new Error(`Rate limited after ${retries} retries`);
      }

      return response;
    } catch (err) {
      if (attempt === retries + 1) throw err;
      const wait = Math.min(1000 * Math.pow(2, attempt) + Math.random() * 1000, 10000);
      logger.warn(
        { retry: attempt, maxRetries: retries, waitMs: Math.round(wait), err: err.message },
        `Request failed. Retrying in ${Math.round(wait / 1000)}s...`,
      );
      await sleep(wait);
    }
  }
}

async function scrapeBraveSearch(query, pages = 1) {
  const validatedQuery = validateSearchQuery(query);
  const pageCount = Math.max(1, Math.min(5, Math.floor(pages)));

  const homeHeaders = {
    'User-Agent': randomItem(USER_AGENTS),
    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
  };

  let cookieString = '';
  try {
    const homeResponse = await axios.get('https://search.brave.com/', {
      headers: homeHeaders,
      timeout: 15000,
      maxRedirects: 5,
      validateStatus: (status) => status < 400 || status === 429,
    });
    if (homeResponse.status === 429) {
      logger.warn({}, 'Homepage rate limited, proceeding without cookies');
    } else {
      cookieString = extractCookies(homeResponse.headers['set-cookie']);
    }
  } catch (err) {
    logger.error({ err: err.message }, 'Homepage request failed');
  }

  await sleep(1000 + Math.random() * 2000);

  const searchHeaders = {
    'User-Agent': randomItem(USER_AGENTS),
    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    Referer: 'https://search.brave.com/',
  };
  if (cookieString) {
    searchHeaders['Cookie'] = cookieString;
  }

  const allUrls = new Set();
  for (let page = 0; page < pageCount; page++) {
    const params = { q: validatedQuery };
    if (page > 0) params.offset = page * 10;

    const response = await fetchWithRetry(BRAVE_SEARCH_URL, params, searchHeaders, 3);
    const $ = cheerio.load(response.data);
    extractUrls($).forEach((u) => allUrls.add(u));

    if (page < pageCount - 1) {
      await sleep(1000 + Math.random() * 2000);
    }
  }

  const urls = [...allUrls];
  logger.info({ query: validatedQuery, pages: pageCount, resultCount: urls.length }, 'Search completed');

  return urls;
}

async function healthCheck() {
  const pkg = require('../package.json');
  const checks = {
    node: {
      status: 'ok',
      version: process.version,
      minRequired: pkg.engines.node,
    },
    dependencies: {
      status: 'ok',
      loaded: [],
      missing: [],
    },
    network: {
      status: 'ok',
      reachable: true,
      latencyMs: null,
      detail: '',
    },
  };

  const requiredDeps = ['axios', 'cheerio', 'zod', 'pino'];
  for (const dep of requiredDeps) {
    try {
      require.resolve(dep, { paths: [__dirname] });
      checks.dependencies.loaded.push(dep);
    } catch {
      checks.dependencies.status = 'fail';
      checks.dependencies.missing.push(dep);
    }
  }

  const nodeMajor = parseInt(process.version.slice(1).split('.')[0], 10);
  const requiredMajor = parseInt((pkg.engines.node.match(/\d+/) || ['0'])[0], 10);
  if (nodeMajor < requiredMajor) {
    checks.node.status = 'fail';
  }

  try {
    const start = Date.now();
    const resp = await axios.get('https://search.brave.com/', {
      timeout: 10000,
      validateStatus: () => true,
    });
    checks.network.latencyMs = Date.now() - start;
    if (resp.status >= 400) {
      checks.network.status = 'degraded';
      checks.network.detail = `HTTP ${resp.status}`;
    } else {
      checks.network.detail = `HTTP ${resp.status}`;
    }
  } catch (err) {
    checks.network.status = 'fail';
    checks.network.reachable = false;
    checks.network.detail = err.message;
  }

  const allOk = Object.values(checks).every((c) => c.status === 'ok');
  const degraded =
    Object.values(checks).some((c) => c.status === 'degraded') &&
    !Object.values(checks).some((c) => c.status === 'fail');

  return {
    status: allOk ? 'ok' : degraded ? 'degraded' : 'fail',
    version: pkg.version,
    timestamp: new Date().toISOString(),
    checks,
  };
}

async function main() {
  if (process.argv.includes('--health')) {
    try {
      const result = await healthCheck();
      console.log(JSON.stringify(result, null, 2));
      process.exit(result.status === 'ok' ? 0 : 1);
    } catch (err) {
      logger.error({ err: err.message }, 'Health check failed');
      process.exit(1);
    }
  }

  const query = process.argv[2] || process.env.SEARCH_QUERY;

  if (!query) {
    console.error('Usage: node src/scraper.js "<search-query>"');
    console.error('   or: brave-search-scraper "<search-query>"  (when installed via npm)');
    console.error('   or: npx brave-search-scraper "<search-query>"');
    console.error('Or set the SEARCH_QUERY environment variable.');
    process.exit(1);
  }

  try {
    const urls = await scrapeBraveSearch(query);

    if (urls.length === 0) {
      console.log('[]');
      process.exit(0);
    }

    console.log(JSON.stringify(urls, null, 2));
  } catch (err) {
    if (err instanceof ZodError) {
      logger.error({ issues: err.issues }, 'Validation failed');
    } else {
      logger.error({ err: err.message }, 'Scraping failed');
    }
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
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
};
