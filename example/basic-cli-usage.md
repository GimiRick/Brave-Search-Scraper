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
[
  "https://en.wikipedia.org/wiki/Machine_learning",
  "https://www.ibm.com/topics/machine-learning"
]
```

## Using an environment variable

Set `SEARCH_QUERY` instead of passing the query as an argument:

```bash
export SEARCH_QUERY="rust programming"
brave-search-scraper
```

Or in one line:

```bash
SEARCH_QUERY="climate change" node src/scraper.js
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
- `1`: error (no query given, or scraping failed)
