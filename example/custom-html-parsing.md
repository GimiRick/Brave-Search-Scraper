# Custom HTML Parsing

Don't want the scraper to fetch the page for you? Maybe you already have the HTML saved, or you want to parse it differently. Use `extractUrls` directly with your own HTML.

## Parse HTML you already fetched

```js
const cheerio = require('cheerio');
const { extractUrls } = require('./src/scraper');

const html = `...some HTML from Brave Search...`;
const $ = cheerio.load(html);
const urls = extractUrls($);

console.log(urls);
```

## Combine with your own HTTP request

```js
const axios = require('axios');
const cheerio = require('cheerio');
const { extractUrls } = require('./src/scraper');

async function customSearch(query) {
  const response = await axios.get('https://search.brave.com/search', {
    params: { q: query },
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    },
  });

  const $ = cheerio.load(response.data);
  return extractUrls($);
}

customSearch('climate technology').then(urls => console.log(urls));
```

## How extractUrls works

It looks for links in three places on the page:

1. **`<a href="...">`** — standard anchor tags
2. **`[data-result-url]`** — Brave's data attribute for result URLs
3. **`[data-url]`** — another data attribute Brave uses

It skips:

- Relative links (`/search`, `#section`)
- Dangerous schemes (`javascript:`, `data:`, `vbscript:`)
- Brave-owned domains (`brave.com`, `brave.app` and subdomains)

Returns a deduplicated array of URL strings.
