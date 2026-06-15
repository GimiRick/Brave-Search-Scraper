#!/usr/bin/env node

// Brave Search Scraper — https://github.com/GimiRick/Brave-Search-Scraper
// License: CC BY-NC-ND 4.0 — see LICENSE file.
// Permission is granted to view and run this code.
// No modifications, alterations, or derivative works are permitted.

'use strict';

const axios = require('axios');
const cheerio = require('cheerio');

const BRAVE_SEARCH_URL = 'https://search.brave.com/search';

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:127.0) Gecko/20100101 Firefox/127.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
];

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function extractCookies(setCookieHeader) {
  if (!setCookieHeader) return '';
  const cookies = Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader];
  return cookies.map(c => c.split(';')[0]).join('; ');
}

function isBraveDomain(hostname) {
  if (!hostname) return false;
  return hostname === 'brave.com' || hostname === 'brave.app' ||
    hostname.endsWith('.brave.com') || hostname.endsWith('.brave.app');
}

function extractUrls($) {
  const urls = new Set();

  $('a[href]').each((_, el) => {
    const href = $(el).attr('href');
    if (!href || href.startsWith('/') || href.startsWith('#') || /^\s*(?:javascript|data|vbscript):/i.test(href)) return;
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
          console.error(`Rate limited (429). Retrying in ${Math.round(wait / 1000)}s... (attempt ${attempt}/${retries})`);
          await sleep(wait);
        }
        continue;
      }

      return response;
    } catch (err) {
      if (attempt === retries + 1) throw err;
      const wait = Math.min(1000 * Math.pow(2, attempt) + Math.random() * 1000, 10000);
      console.error(`Request failed (${err.message}). Retrying in ${Math.round(wait / 1000)}s... (attempt ${attempt}/${retries})`);
      await sleep(wait);
    }
  }
  throw new Error(`Failed after ${retries} retries`);
}

async function scrapeBraveSearch(query) {
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
      console.error('Homepage rate limited, proceeding without cookies');
    } else {
      cookieString = extractCookies(homeResponse.headers['set-cookie']);
    }
  } catch (err) {
    console.error('Homepage request failed:', err.message);
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

  const response = await fetchWithRetry(BRAVE_SEARCH_URL, { q: query }, searchHeaders, 3);

  const $ = cheerio.load(response.data);
  const urls = extractUrls($);

  return urls;
}

async function main() {
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
    console.error('Scraping failed:', err.message);
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
};
