# Programmatic Usage (Using as a Module)

You can import the scraper into your own Node.js project instead of using the CLI.

**Note on imports:** The examples below use `require('gimirick-brave-search-scraper')` (npm install). If you're using a git clone, replace with `require('./src/scraper')`.

## Basic example

```js
const { scrapeBraveSearch } = require('gimirick-brave-search-scraper');

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

## What you get back

`scrapeBraveSearch` returns a promise that resolves to an array of URL strings. All Brave-owned domains (`brave.com`, `brave.app`) are filtered out, you only get external result links.
