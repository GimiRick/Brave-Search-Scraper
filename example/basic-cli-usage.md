# Basic CLI Usage

Run the scraper straight from your terminal with a search query:

```bash
node src/scraper.js "what is machine learning"
```

It prints a JSON array of URLs to your terminal:

```json
[
 "https://en.wikipedia.org/wiki/Machine_learning",
 "https://www.ibm.com/topics/machine-learning"
]
```

## Using an environment variable

If you prefer, set the `SEARCH_QUERY` environment variable instead:

```bash
export SEARCH_QUERY="rust programming"
node src/scraper.js
```

Or in one line:

```bash
SEARCH_QUERY="climate change" node src/scraper.js
```

## What happens if you don't provide a query

The scraper prints a usage message and exits:

```text
Usage: node src/scraper.js "<search-query>"
Or set the SEARCH_QUERY environment variable.
```

## Exit codes

- `0`: success (results printed, or empty array `[]`)
- `1`: error (no query given, or scraping failed)
