# Brave Search Scraper

Brave Search Scraper is a Node.js library for scraping Brave Search, easily. It uses axios and cheerio to fetch and parse Brave Search results, returning a clean array of external URLs.

## Installation

Install globally (recommended for CLI use):

```bash
npm i -g gimirick-brave-search-scraper
```

Or install locally in your project:

```bash
npm i gimirick-brave-search-scraper
```

[npm package](https://www.npmjs.com/package/gimirick-brave-search-scraper)

Or clone and install locally:

```bash
git clone https://github.com/GimiRick/Brave-Search-Scraper.git
cd Brave-Search-Scraper
npm install
```

## Usage

To get results for a search query, use the `scrapeBraveSearch` function:

```js
const { scrapeBraveSearch } = require('gimirick-brave-search-scraper');

const urls = await scrapeBraveSearch('machine learning');
console.log(urls);
```

Output is a JSON array of URL strings:

```json
[
 "https://en.wikipedia.org/wiki/Machine_learning",
 "https://www.ibm.com/topics/machine-learning"
]
```

## CLI Usage

You can also run it directly from the terminal without writing any code:

```bash
node src/scraper.js "your search query"
```

Or set the `SEARCH_QUERY` environment variable instead:

```bash
SEARCH_QUERY="your search query" node src/scraper.js
```

## Additional options

### Programmatic usage

Import only what you need. All internal functions are exported:

```js
const {
 scrapeBraveSearch,
 extractUrls,
 extractCookies,
 fetchWithRetry,
 isBraveDomain,
 randomItem,
 sleep,
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

By default the scraper retries up to 3 times on failures or rate limits. Pass a custom count as the fourth argument to `fetchWithRetry`:

```js
const { fetchWithRetry } = require('gimirick-brave-search-scraper');

// Retry up to 5 times
const response = await fetchWithRetry(
 'https://search.brave.com/search',
 { q: 'artificial intelligence' },
 { 'User-Agent': 'Mozilla/5.0 ...' },
 5
);
```

### Parse HTML you already have

If you already fetched the page yourself, use `extractUrls` directly with a Cheerio instance:

```js
const cheerio = require('cheerio');
const { extractUrls } = require('gimirick-brave-search-scraper');

const $ = cheerio.load(existingHtml);
const urls = extractUrls($);
console.log(urls);
```

### Extract cookies manually

If you want to handle session cookies yourself:

```js
const axios = require('axios');
const { extractCookies } = require('gimirick-brave-search-scraper');

const response = await axios.get('https://search.brave.com/', {
 headers: { 'User-Agent': 'Mozilla/5.0 ...' },
});

const cookies = extractCookies(response.headers['set-cookie']);
console.log(cookies); // "session=abc123; token=xyz"
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

const external = urls.filter(url => !isBraveDomain(new URL(url).hostname));
// ['https://example.com/article', 'https://en.wikipedia.org/wiki/Brave']
```

### Throttle requests with sleep

```js
const { sleep } = require('gimirick-brave-search-scraper');

await sleep(2000); // wait 2 seconds before next request
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

## Docker

No Node.js installation required. Build and run with Docker:

```bash
docker build -t brave-scraper .
docker run --rm brave-scraper "your search query"
```

With an environment variable:

```bash
docker run --rm -e SEARCH_QUERY="your query" brave-scraper
```

## How it works under the hood

1. Visits the Brave Search homepage to collect session cookies.
2. Waits 1–3 seconds with random jitter to avoid detection.
3. Sends the search request with a rotated User-Agent and the collected cookies.
4. If Brave returns a `429 Too Many Requests`, waits with exponential backoff and retries (up to 3 times by default).
5. Parses the HTML with cheerio, extracting URLs from `<a href>`, `[data-result-url]`, and `[data-url]` attributes.
6. Filters out all Brave-owned domains (`brave.com`, `brave.app` and subdomains).
7. Deduplicates and returns a clean array of external URLs.

## Exit codes (CLI)

| Code | Meaning |
| :--- | :--- |
| `0` | Success: results printed, or empty array `[]` |
| `1` | Error: no query provided, or scraping failed |

## Project structure

```text
brave-search-scraper/
  src/scraper.js      main scraper (also the module entry point)
  test/scraper.test.js  unit and integration tests
  Dockerfile          production Docker image
  package.json        dependencies and scripts
  example/            usage examples for each feature
```

## About

Part of the GimiRick toolchain. We build open source LLMs and AI systems. Founded by Mohammad Faiz.

## License

CC BY-NC-ND 4.0: Attribution-NonCommercial-NoDerivatives 4.0 International.

Permission is granted to view and run this code. No modifications, alterations, or derivative works are permitted.

See the [LICENSE](LICENSE) file for the full legal text.
