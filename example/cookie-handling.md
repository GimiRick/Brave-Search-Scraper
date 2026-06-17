# Cookie Handling

Brave Search sets cookies on the homepage that are needed for the actual search request. The scraper handles this automatically, but you can use `extractCookies` yourself if you want more control.

**Note on imports:** The examples below use `require('gimirick-brave-search-scraper')` (npm install). If you're using a git clone, replace with `require('./src/scraper')`.

## How the default flow works

1. Hit `https://search.brave.com/` to get the homepage
2. Extract cookies from the `set-cookie` response header
3. Pass those cookies with the search request

## Using extractCookies directly

```js
const axios = require('axios');
const { extractCookies } = require('gimirick-brave-search-scraper');

async function getCookies() {
  const response = await axios.get('https://search.brave.com/', {
    headers: { 'User-Agent': 'Mozilla/5.0 ...' },
  });

  const cookieString = extractCookies(response.headers['set-cookie']);
  console.log('Extracted cookies:', cookieString);
  return cookieString;
}
```

## What extractCookies does

It takes the raw `set-cookie` header (or array of headers) and:

1. Picks just the cookie name and value (drops `path=`, `domain=`, `expires=`, etc.)
2. Joins multiple cookies with `;`

So this:

```text
foo=abc; Path=/; Domain=brave.com
bar=xyz; Path=/; Secure
```

Becomes:

```text
foo=abc; bar=xyz
```

## Use cookies in your own requests

```js
const cookies = await getCookies();

const searchResponse = await axios.get('https://search.brave.com/search', {
  params: { q: 'my query' },
  headers: {
    'User-Agent': 'Mozilla/5.0 ...',
    Cookie: cookies,
  },
});
```
