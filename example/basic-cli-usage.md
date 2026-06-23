# Basic CLI Usage

## Via npm (global install)

```bash
brave-search-scraper "what is machine learning"
```

## Via npx (no install)

```bash
npx brave-search-scraper "what is machine learning"
```

## Via git clone

```bash
node src/scraper.js "what is machine learning"
```

All three produce a JSON array of URLs:

```json
["https://en.wikipedia.org/wiki/Machine_learning", "https://www.ibm.com/topics/machine-learning"]
```

## Using an environment variable

Set `SEARCH_QUERY` instead of passing the query as an argument:

```bash
# via npm global install:
export SEARCH_QUERY="rust programming"
brave-search-scraper
# or via npx:
export SEARCH_QUERY="rust programming"
npx brave-search-scraper
# or via git clone:
export SEARCH_QUERY="rust programming"
node src/scraper.js
```

Or in one line:

```bash
SEARCH_QUERY="climate change" brave-search-scraper
SEARCH_QUERY="climate change" npx brave-search-scraper
SEARCH_QUERY="climate change" node src/scraper.js
```

## Health check

Run diagnostics to verify the scraper is working:

```bash
# via npm global install:
brave-search-scraper --health
# or via npx (no install):
npx brave-search-scraper --health
# or via git clone:
node src/scraper.js --health
```

Output:

```json
{
  "status": "ok",
  "version": "1.1.4",
  "timestamp": "2026-06-18T11:11:01.244Z",
  "checks": {
    "node": { "status": "ok", "version": "v24.15.0", "minRequired": ">=20.18.1" },
    "dependencies": { "status": "ok", "loaded": ["axios", "cheerio", "zod", "pino"], "missing": [] },
    "network": { "status": "ok", "reachable": true, "latencyMs": 128, "detail": "HTTP 200" }
  }
}
```

## Version check

Print the installed version:

```bash
# via npm global install:
brave-search-scraper --version
# or via npx (no install):
npx brave-search-scraper --version
# or via git clone:
node src/scraper.js --version
```

Output: `1.1.4`

## Using the `main()` function programmatically

The `main` entry point is also exported for programmatic use (e.g., for custom CLI wrappers):

```js
const { main } = require('gimirick-brave-search-scraper');

process.argv = ['node', 'wrapper.js', '--health'];
await main(); // runs the health check and exits
```

You can also check the version programmatically:

```js
process.argv = ['node', 'wrapper.js', '--version'];
await main(); // prints the version and exits
```

## Summary / Abstract (--summary flag)

Fetch a plain-text summary, answer, or definition from DuckDuckGo's knowledge graph:

```bash
# via npm global install:
brave-search-scraper --summary "machine learning"
# or via npx (no install):
npx brave-search-scraper --summary "machine learning"
# or via git clone:
node src/scraper.js --summary "machine learning"
```

With an environment variable (works with all three methods):

```bash
SEARCH_QUERY="quantum computing" brave-search-scraper --summary
SEARCH_QUERY="quantum computing" npx brave-search-scraper --summary
SEARCH_QUERY="quantum computing" node src/scraper.js --summary
```

Output:

```json
{
  "query": "machine learning",
  "heading": "Machine learning",
  "abstract": "Machine learning (ML) is a field of study in artificial intelligence...",
  "source": "Wikipedia",
  "sourceUrl": "https://en.wikipedia.org/wiki/Machine_learning",
  "answer": null,
  "answerType": null,
  "definition": null,
  "definitionSource": null,
  "definitionUrl": null,
  "imageUrl": null,
  "type": "A",
  "hasAbstract": true,
  "hasAnswer": false,
  "hasDefinition": false
}
```

## What happens if you don't provide a query

The scraper prints a usage message and exits:

```text
Usage: node src/scraper.js "<search-query>"
   or: brave-search-scraper "<search-query>"  (when installed via npm)
   or: npx brave-search-scraper "<search-query>"
Or set the SEARCH_QUERY environment variable.
```

## Exit codes

- `0`: success (results printed, or empty array `[]`)
- `0`: summary printed (`--summary` flag)
- `0`: health check passed (`--health` flag)
- `0`: version printed (`--version` flag)
- `1`: error (no query given, scraping failed, or health check failed)
- `1`: summary fetch failed (`--summary` flag)
