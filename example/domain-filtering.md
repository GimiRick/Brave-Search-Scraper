# Domain Filtering

The scraper filters out Brave-owned domains so you only get external search results. No `brave.com` or `brave.app` URLs in your output.

**Note on imports:** The examples below use `require('gimirick-brave-search-scraper')` (npm install). If you're using a git clone, replace with `require('./src/scraper')`.

## What gets filtered

These domains are excluded:

- `brave.com`
- `brave.app`
- `*.brave.com` (e.g. `search.brave.com`, `support.brave.com`)
- `*.brave.app` (e.g. `publishers.brave.app`)

## Using isBraveDomain directly

```js
const { isBraveDomain } = require('gimirick-brave-search-scraper');

console.log(isBraveDomain('brave.com'));        // true
console.log(isBraveDomain('search.brave.com')); // true
console.log(isBraveDomain('brave.app'));        // true
console.log(isBraveDomain('example.com'));      // false
console.log(isBraveDomain('google.com'));       // false
```

## Filter a list of URLs yourself

```js
const { isBraveDomain } = require('gimirick-brave-search-scraper');

const urls = [
  'https://brave.com/download',
  'https://example.com/article',
  'https://support.brave.com/help',
  'https://en.wikipedia.org/wiki/Brave',
];

const externalUrls = urls.filter(url => !isBraveDomain(new URL(url).hostname));
console.log(externalUrls);
// ['https://example.com/article', 'https://en.wikipedia.org/wiki/Brave']
```

## Why this matters

Brave search pages include links to Brave's own properties (settings, ads, promotions). Without filtering, you'd get a bunch of Brave URLs mixed in with your real search results. This keeps the output clean and useful.
