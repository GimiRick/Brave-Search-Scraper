# Programmatic Usage (Using as a Module)

You can import the scraper into your own Node.js project instead of using the CLI.

**Note on imports:** The examples below use `require('gimirick-brave-search-scraper')` (npm install). If you're using a git clone, replace with `require('./src/scraper')`.

## Basic example

```js
const { scrapeBraveSearch, healthCheck } = require('gimirick-brave-search-scraper');

async function main() {
  try {
    const urls = await scrapeBraveSearch('quantum computing');
    console.log(`Found ${urls.length} results`);
    urls.forEach((url, i) => console.log(`${i + 1}. ${url}`));
  } catch (err) {
    console.error('Scraping failed:', err.message);
  }
}

main();
```

## Searching multiple queries

```js
const { scrapeBraveSearch } = require('gimirick-brave-search-scraper');

async function searchAll(queries) {
  for (const q of queries) {
    console.log(`\n--- "${q}" ---`);
    try {
      const urls = await scrapeBraveSearch(q);
      console.log(urls.join('\n'));
    } catch (err) {
      console.error(`Failed "${q}":`, err.message);
    }
  }
}

searchAll(['node.js tutorial', 'python vs javascript']);
```

## Input validation

`scrapeBraveSearch` validates the query before making any network request:

```js
const { scrapeBraveSearch, validateSearchQuery } = require('gimirick-brave-search-scraper');

// These throw ZodError synchronously (no network call made):
await scrapeBraveSearch(''); // empty
await scrapeBraveSearch('   '); // whitespace only
await scrapeBraveSearch(null); // not a string
await scrapeBraveSearch(42); // not a string

// This passes — query is trimmed:
await scrapeBraveSearch('  hello  '); // sends "hello"
```

Use `validateSearchQuery` directly:

```js
const { validateSearchQuery } = require('gimirick-brave-search-scraper');

validateSearchQuery('machine learning'); // 'machine learning'
validateSearchQuery(''); // throws ZodError
```

## Pagination

`scrapeBraveSearch` accepts a second argument for the number of result pages:

```js
const { scrapeBraveSearch } = require('gimirick-brave-search-scraper');

const urls = await scrapeBraveSearch('machine learning', 3);
console.log(`Found ${urls.length} results across 3 pages`);
```

- Defaults to `1` (single page, same as before).
- Clamped between `1` and `5`.
- Uses `?offset=N` parameter (10 results per page).
- Adds 1–3s delay between pages to avoid rate limiting.
- URLs are deduplicated across pages.

## Health check

```js
const { healthCheck } = require('gimirick-brave-search-scraper');

const result = await healthCheck();
console.log(result.status); // 'ok', 'degraded', or 'fail'
console.log(result.checks.dependencies.loaded);
console.log(result.checks.network.latencyMs);
```

## Coverage

The test suite includes **89 tests** across 4 test files. Generate a coverage report:

```bash
npm run coverage
```

Current coverage: **93.57%** (100% function coverage).

Output includes a terminal summary and an `lcov` report under `coverage/`.

## Semantic release

This project uses [semantic-release](https://semantic-release.gitbook.io/) for automated versioning. Releases are triggered manually via GitHub Actions workflow dispatch. Commit messages must follow [Conventional Commits](https://www.conventionalcommits.org/):

| Prefix             | Effect             |
| :----------------- | :----------------- |
| `fix:`             | Patch bump (1.0.x) |
| `feat:`            | Minor bump (1.x.0) |
| `BREAKING CHANGE:` | Major bump (2.0.0) |
| `docs:`            | No release         |

## What you get back

`scrapeBraveSearch` returns a promise that resolves to an array of URL strings. All Brave-owned domains (`brave.com`, `brave.app`) are filtered out, you only get external result links.
