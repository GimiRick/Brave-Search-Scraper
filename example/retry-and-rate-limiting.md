# Retry & Rate Limiting

Brave blocks automated requests. The scraper handles this with automatic retries and exponential backoff.

**Note on imports:** The examples below use `require('gimirick-brave-search-scraper')` (npm install). If you're using a git clone, replace with `require('./src/scraper')`.

## How it works

When Brave returns a `429` (Too Many Requests) or the request fails, `fetchWithRetry` waits and tries again:

- **After 1st attempt:** waits ~2 seconds
- **After 2nd attempt:** waits ~4 seconds
- **After 3rd attempt:** waits ~8 seconds (if `retries > 3`)

Each wait has a random jitter so requests don't pile up in sync. Maximum wait is 15 seconds for rate limits, 10 seconds for other errors.

## Using fetchWithRetry directly

```js
const { fetchWithRetry } = require('gimirick-brave-search-scraper');

async function example() {
  try {
    const response = await fetchWithRetry(
      'https://search.brave.com/search',
      { q: 'artificial intelligence' },
      { 'User-Agent': 'Mozilla/5.0 ...' },
      5, // custom retry count (default is 3)
    );
    console.log('Got response:', response.status);
  } catch (err) {
    console.error('All retries exhausted:', err.message);
  }
}
```

## Custom retry count

The fourth argument is the number of retries. Default is 3. Bump it up to 5 if you're running on a slow connection or hitting rate limits often:

```js
const response = await fetchWithRetry(url, params, headers, 5);
```

## What gets printed during retries

The scraper logs to stderr so it doesn't interfere with the JSON output:

```bash
Rate limited (429). Retrying in 2s... (attempt 1/3)
Request failed (socket hang up). Retrying in 4s... (attempt 2/3)
```

If all retries are exhausted, it throws an error with the message `"Failed after N retries"`.
