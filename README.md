# Brave Search Scraper

<p align="center">
  <!-- PACKAGE INFO -->
  <a href="https://www.npmjs.com/package/gimirick-brave-search-scraper"><img src="https://img.shields.io/npm/v/gimirick-brave-search-scraper?logo=npm&logoColor=white" alt="npm version"></a>
  <a href="package.json"><img src="https://img.shields.io/badge/repo%20version-1.1.3-blue?logo=git&logoColor=white" alt="repo version"></a>
  <a href="https://www.npmjs.com/package/gimirick-brave-search-scraper"><img src="https://img.shields.io/npm/dm/gimirick-brave-search-scraper?logo=npm&logoColor=white" alt="npm downloads"></a>
  <a href="https://www.npmjs.com/package/gimirick-brave-search-scraper"><img src="https://img.shields.io/npm/dw/gimirick-brave-search-scraper" alt="npm downloads/week"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-CC%20BY--NC--ND%204.0-lightgrey?logo=creativecommons&logoColor=white" alt="license"></a>
  <a href="https://semver.org"><img src="https://img.shields.io/badge/semver-2.0.0-blue" alt="semver"></a>
  <br>
  <!-- CI / QUALITY -->
  <a href="https://github.com/GimiRick/Brave-Search-Scraper/actions/workflows/ci.yml"><img src="https://github.com/GimiRick/Brave-Search-Scraper/actions/workflows/ci.yml/badge.svg?branch=main" alt="CI"></a>
  <a href="https://github.com/GimiRick/Brave-Search-Scraper/actions/workflows/codeql.yml"><img src="https://github.com/GimiRick/Brave-Search-Scraper/actions/workflows/codeql.yml/badge.svg?branch=main" alt="CodeQL"></a>
  <a href="test/"><img src="https://img.shields.io/badge/tests-82%20node%3Atest-brightgreen?logo=node.js&logoColor=white" alt="tests"></a>
  <a href="package.json"><img src="https://img.shields.io/badge/coverage-93.57%25%20c8-brightgreen" alt="coverage"></a>
  <a href="SECURITY.md"><img src="https://img.shields.io/badge/security-policy-brightgreen?logo=github&logoColor=white" alt="security"></a>
  <a href="package.json"><img src="https://img.shields.io/badge/dependencies-4%20direct-brightgreen" alt="dependencies"></a>
  <br>
  <!-- REPO METRICS -->
  <a href="https://github.com/GimiRick/Brave-Search-Scraper/stargazers"><img src="https://img.shields.io/github/stars/GimiRick/Brave-Search-Scraper?logo=github&logoColor=white" alt="stars"></a>
  <a href="https://github.com/GimiRick/Brave-Search-Scraper/forks"><img src="https://img.shields.io/github/forks/GimiRick/Brave-Search-Scraper?logo=github&logoColor=white" alt="forks"></a>
  <a href="https://github.com/GimiRick/Brave-Search-Scraper/graphs/contributors"><img src="https://img.shields.io/github/contributors/GimiRick/Brave-Search-Scraper?logo=github&logoColor=white" alt="contributors"></a>
  <a href="https://github.com/GimiRick/Brave-Search-Scraper/issues"><img src="https://img.shields.io/github/issues/GimiRick/Brave-Search-Scraper?logo=github&logoColor=white" alt="issues"></a>
  <a href="https://github.com/GimiRick/Brave-Search-Scraper/pulls"><img src="https://img.shields.io/github/issues-pr/GimiRick/Brave-Search-Scraper?logo=github&logoColor=white" alt="pull requests"></a>
  <a href="https://github.com/GimiRick/Brave-Search-Scraper/commits/main"><img src="https://img.shields.io/github/last-commit/GimiRick/Brave-Search-Scraper?logo=github&logoColor=white" alt="last commit"></a>
  <br>
  <!-- PROJECT METADATA -->
  <a href="package.json"><img src="https://img.shields.io/badge/node-%3E%3D20.18.1-brightgreen?logo=node.js&logoColor=white" alt="node"></a>
  <a href="Dockerfile"><img src="https://img.shields.io/badge/platform-windows%20%7C%20macos%20%7C%20linux-lightgrey" alt="platform"></a>
  <a href="src/scraper.js"><img src="https://img.shields.io/badge/bundle%20size-~50%20kB-brightgreen" alt="bundle size"></a>
  <a href="src/scraper.js"><img src="https://img.shields.io/badge/total%20lines-~1.8k-blue" alt="total lines"></a>
  <a href="https://github.com/GimiRick/Brave-Search-Scraper/commits/main"><img src="https://img.shields.io/github/commit-activity/m/GimiRick/Brave-Search-Scraper?logo=github&logoColor=white" alt="commit activity"></a>
  <a href="https://github.com/GimiRick/Brave-Search-Scraper"><img src="https://img.shields.io/github/repo-size/GimiRick/Brave-Search-Scraper?logo=github&logoColor=white" alt="repo size"></a>
  <a href="https://github.com/GimiRick/Brave-Search-Scraper/graphs/contributors"><img src="https://img.shields.io/badge/maintained-yes-brightgreen" alt="maintained"></a>
</p>

Brave Search Scraper is a Node.js library for scraping Brave Search, easily. It uses axios and cheerio to fetch and parse Brave Search results, returning a clean array of external URLs. Features input validation with Zod, structured logging with Pino, multi-page pagination, and a built-in health check.

---

## npm

Install globally (CLI use):

```bash
npm i -g gimirick-brave-search-scraper
```

Install locally (programmatic use):

```bash
npm i gimirick-brave-search-scraper
```

[npm package](https://www.npmjs.com/package/gimirick-brave-search-scraper)

### Programmatic usage (npm)

```js
const { scrapeBraveSearch } = require('gimirick-brave-search-scraper');

const urls = await scrapeBraveSearch('machine learning');
console.log(urls);
```

Output:

```json
["https://en.wikipedia.org/wiki/Machine_learning", "https://www.ibm.com/topics/machine-learning"]
```

### CLI (npm)

```bash
brave-search-scraper "your search query"
```

Or via `npx` without installing:

```bash
npx brave-search-scraper "your search query"
```

With a `SEARCH_QUERY` environment variable:

```bash
SEARCH_QUERY="your search query" brave-search-scraper
```

---

## Git Clone

Clone and install locally:

```bash
git clone https://github.com/GimiRick/Brave-Search-Scraper.git
cd Brave-Search-Scraper
npm install
```

### Programmatic usage (git clone)

```js
const { scrapeBraveSearch } = require('./src/scraper');

const urls = await scrapeBraveSearch('machine learning');
console.log(urls);
```

### CLI (git clone)

```bash
node src/scraper.js "your search query"
```

With a `SEARCH_QUERY` environment variable:

```bash
SEARCH_QUERY="your search query" node src/scraper.js
```

---

## Additional options

All examples below use `require('gimirick-brave-search-scraper')` (npm). If using a git clone, replace with `require('./src/scraper')`.

### Import only what you need

```js
const {
  scrapeBraveSearch,
  extractUrls,
  extractCookies,
  fetchWithRetry,
  isBraveDomain,
  randomItem,
  sleep,
  main,
  validateSearchQuery,
  healthCheck,
} = require('gimirick-brave-search-scraper');
```

### Searching multiple queries

```js
const { scrapeBraveSearch } = require('gimirick-brave-search-scraper');

const queries = ['node.js tutorial', 'python vs javascript', 'rust programming'];

for (const query of queries) {
  const urls = await scrapeBraveSearch(query);
  console.log(`"${query}" → ${urls.length} results`);
  console.log(urls.join('\n'));
}
```

### Custom retry count

Default is 3 retries on failures or rate limits. Pass a custom count as the fourth argument:

```js
const { fetchWithRetry } = require('gimirick-brave-search-scraper');

const response = await fetchWithRetry(
  'https://search.brave.com/search',
  { q: 'artificial intelligence' },
  { 'User-Agent': 'Mozilla/5.0 ...' },
  5
);
```

### Parse HTML you already have

```js
const cheerio = require('cheerio');
const { extractUrls } = require('gimirick-brave-search-scraper');

const $ = cheerio.load(existingHtml);
const urls = extractUrls($);
console.log(urls);
```

### Extract cookies manually

```js
const axios = require('axios');
const { extractCookies } = require('gimirick-brave-search-scraper');

const response = await axios.get('https://search.brave.com/', {
  headers: { 'User-Agent': 'Mozilla/5.0 ...' },
});

const cookies = extractCookies(response.headers['set-cookie']);
console.log(cookies);
```

### Filter Brave domains from a URL list

```js
const { isBraveDomain } = require('gimirick-brave-search-scraper');

const urls = [
  'https://brave.com/download',
  'https://example.com/article',
  'https://support.brave.com/help',
  'https://en.wikipedia.org/wiki/Brave',
];

const external = urls.filter((url) => !isBraveDomain(new URL(url).hostname));
```

### Throttle requests

```js
const { sleep } = require('gimirick-brave-search-scraper');

await sleep(2000); // wait 2 seconds
```

### Rotate user agents

```js
const { randomItem } = require('gimirick-brave-search-scraper');

const agents = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/125.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) Safari/605.1',
];

const agent = randomItem(agents);
```

### Input validation with Zod

`scrapeBraveSearch` validates every query before making any network request:

```js
const { scrapeBraveSearch } = require('gimirick-brave-search-scraper');

await scrapeBraveSearch(''); // throws ZodError — empty
await scrapeBraveSearch('   '); // throws ZodError — only whitespace
await scrapeBraveSearch(null); // throws ZodError — not a string
await scrapeBraveSearch(42); // throws ZodError — not a string
await scrapeBraveSearch('hello'); // ✅ passes, returns trimmed 'hello'
```

The schema is configurable. Access it directly:

```js
const { validateSearchQuery, searchQuerySchema } = require('gimirick-brave-search-scraper');

validateSearchQuery('machine learning'); // 'machine learning'

// Use the schema with your own validation:
const result = searchQuerySchema.safeParse(userInput);
if (!result.success) {
  console.log(result.error.issues);
}
```

Rules:

- Must be a string (not null, undefined, number, object, array)
- Must be non-empty after trimming whitespace
- Maximum 500 characters

### Health check

Run diagnostics from the CLI or programmatically.

**CLI:**

```bash
brave-search-scraper --health
# or via git clone:
node src/scraper.js --health
```

Output:

```json
{
  "status": "ok",
  "version": "1.1.3",
  "timestamp": "2026-06-18T11:11:01.244Z",
  "checks": {
    "node": { "status": "ok", "version": "v24.15.0", "minRequired": ">=20.18.1" },
    "dependencies": { "status": "ok", "loaded": ["axios", "cheerio", "zod", "pino"], "missing": [] },
    "network": { "status": "ok", "reachable": true, "latencyMs": 128, "detail": "HTTP 200" }
  }
}
```

Exit codes: `0` if all checks pass, `1` if any check fails.

**Programmatic:**

```js
const { healthCheck } = require('gimirick-brave-search-scraper');

const status = await healthCheck();
console.log(status.status); // 'ok' | 'degraded' | 'fail'
console.log(status.checks.node.version);
console.log(status.checks.dependencies.loaded);
```

### Pagination

Scrape multiple pages of results by passing a `pages` argument:

```js
const { scrapeBraveSearch } = require('gimirick-brave-search-scraper');

// Single page (default):
const page1 = await scrapeBraveSearch('machine learning');

// Three pages — offset=10 per page, 1–3s delay between pages:
const pages = await scrapeBraveSearch('machine learning', 3);
console.log(`Got ${pages.length} results across 3 pages`);
```

The `pages` parameter is clamped between 1 and 5. URLs are deduplicated across pages.

### Coverage

Generate a test coverage report:

```bash
npm run coverage
```

Output includes a terminal summary and an `lcov` report under `coverage/`. Current coverage: **93.57%** (100% function coverage).

Tests cover retry paths via a local HTTP server, CLI behavior via child processes, and the `main()` entry point via in-process mocking of `process.exit`.

### Structured logging with Pino

All diagnostic messages are logged as structured JSON to stderr. No more parsing `console.error` output.

```bash
# JSON logs to stderr (human-readable stdout unaffected):
brave-search-scraper "machine learning"

# stderr output looks like:
# {"level":"info","time":...,"name":"brave-search-scraper","msg":"Search completed"}
# {"level":"warn","time":...,"name":"brave-search-scraper","retry":1,"maxRetries":3,"msg":"Rate limited..."}
```

**Log levels** (controlled by `LOG_LEVEL` or `DEBUG` env):
| Env | Effect |
| :-- | :----- |
| _(none)_ | `info` — normal operation |
| `LOG_LEVEL=debug` | Includes debug messages |
| `LOG_LEVEL=warn` | Suppresses info messages |
| `DEBUG=true` | Same as `LOG_LEVEL=debug` |
| `NODE_ENV=test` or `TEST=true` | Silent (no log output) |

```bash
DEBUG=true node src/scraper.js "rust programming"
```

---

## Docker

No Node.js installation required.

```bash
docker build -t brave-scraper .
docker run --rm brave-scraper "your search query"
```

With an environment variable:

```bash
docker run --rm -e SEARCH_QUERY="your query" brave-scraper
```

Docker also supports the health check:

```bash
docker run --rm brave-scraper --health
```

---

## How it works under the hood

1. Validates the search query (Zod) — fails fast on bad input, no network call made.
2. Visits the Brave Search homepage to collect session cookies.
3. Waits 1–3 seconds with random jitter to avoid detection.
4. Sends the search request with a rotated User-Agent and the collected cookies.
5. If Brave returns a `429 Too Many Requests`, waits with exponential backoff and retries (up to 3 times by default).
6. All retries, warnings, and errors are logged as structured JSON to stderr via Pino.
7. Repeats steps 4–6 for each additional page (if `pages > 1`), with 1–3s delay between pages.
8. Parses the HTML with cheerio, extracting URLs from `<a href>`, `[data-result-url]`, and `[data-url]` attributes.
9. Filters out all Brave-owned domains (`brave.com`, `brave.app` and subdomains).
10. Deduplicates across all pages and returns a clean array of external URLs.

## Architecture

```
User Input (argv / env)
       │
       ▼
┌─────────────────────────────┐
│  validateSearchQuery (Zod)  │────► ZodError on invalid input
└─────────────────────────────┘
       │ (validated query)
       ▼
┌──────────────────────────┐
│    scrapeBraveSearch     │
│        (query)           │
│                          │
│  1. GET homepage         │────► extractCookies()
│     (collect cookies)    │
│                          │
│  2. Sleep 1-3s (jitter)  │────► sleep()
│                          │
│  ┌─ Pagination loop ──── │
│  │ 3. GET search         │────► fetchWithRetry()
│  │    (UA rotation,      │       └── axios.get()
│  │     cookies)          │       └── exponential backoff
│  │                       │       └── logger.warn/error (Pino)
│  │ 4. Parse HTML         │────► cheerio.load()
│  │                       │
│  │ 5. Extract URLs       │────► extractUrls()
│  │      ├── a[href]      │       └── isBraveDomain()
│  │      ├── [data-       │
│  │      │   result-url]  │
│  │      └── [data-url]   │
│  │ 6. Sleep 1-3s         │────► (if more pages)
│  └────────────────────── │
│  7. Deduplicate + Return │────► logger.info + JSON array
└──────────────────────────┘

┌──────────────────────────┐
│     healthCheck()        │
│  ┌───────────────────┐   │
│  │ node version      │   │
│  │ dependencies      │   │
│  │ network reachable │   │
│  └───────────────────┘   │
│  Returns structured JSON │
└──────────────────────────┘
```

---

## Exit codes (CLI)

| Code | Meaning                                       |
| :--- | :-------------------------------------------- |
| `0`  | Success: results printed, or empty array `[]` |
| `0`  | Health check passed (`--health` flag)         |
| `1`  | Error: no query provided, or scraping failed  |
| `1`  | Health check failed (`--health` flag)         |

---

## Project structure

```text
brave-search-scraper/
  src/scraper.js        main scraper (also the module entry point)
  src/logger.js         Pino structured logger setup
  test/
    scraper.test.js     core unit and integration tests
    cli.test.js         CLI behavior tests via child process
    main.test.js        main() entry point tests via process mocking
    retry.test.js       fetchWithRetry retry tests via local HTTP server

  Dockerfile            production Docker image
  package.json          dependencies and scripts
  example/              usage examples for each feature
```

---

## About

Part of the GimiRick toolchain. We build open source LLMs and AI systems. Founded by Mohammad Faiz.

## License

CC BY-NC-ND 4.0: Attribution-NonCommercial-NoDerivatives 4.0 International.

Permission is granted to view and run this code. No modifications, alterations, or derivative works are permitted.

See the [LICENSE](LICENSE) file for the full legal text.
