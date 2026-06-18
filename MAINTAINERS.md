# Maintainer Guide

## Architecture Overview

This is a single-module CLI scraper. The entire scraping pipeline lives in `src/scraper.js` (327 lines). The dependency graph is flat:

```
src/scraper.js  ──►  src/logger.js
     │                  └── pino
     ├── axios
     ├── cheerio
     └── zod
```

### Pipeline

```
CLI args / SEARCH_QUERY env
        │
        ▼
  validateSearchQuery()     ← Zod schema (searchQuerySchema)
        │
        ▼
  scrapeBraveSearch()
        │
        ├── GET https://search.brave.com/   → acquires cookies
        ├── sleep(1-3s random delay)
        ├── fetchWithRetry() × N pages       ← exponential backoff on 429/errors
        └── extractUrls()                    ← parses <a>, [data-url], [data-result-url]
        │
        ▼
   JSON string[] → stdout
```

## Key Exports (`src/scraper.js`)

| Export                | Signature                                                    | Purpose                         |
| --------------------- | ------------------------------------------------------------ | ------------------------------- |
| `searchQuerySchema`   | `ZodString`                                                  | Zod schema for query validation |
| `validateSearchQuery` | `(query: unknown) => string`                                 | Parse & validate query          |
| `randomItem`          | `<T>(arr: T[]) => T`                                         | Pick random array element       |
| `sleep`               | `(ms: number) => Promise<void>`                              | Promise delay                   |
| `extractCookies`      | `(header: string\|string[]) => string`                       | Parse Set-Cookie header         |
| `isBraveDomain`       | `(hostname: string) => boolean`                              | Brave domain check              |
| `extractUrls`         | `($: CheerioAPI) => string[]`                                | Extract result URLs from HTML   |
| `fetchWithRetry`      | `(url, params, headers, retries?) => Promise<AxiosResponse>` | HTTP GET with backoff           |
| `scrapeBraveSearch`   | `(query: string, pages?: number) => Promise<string[]>`       | Main scraper entry              |
| `healthCheck`         | `() => Promise<HealthReport>`                                | Node/deps/network check         |
| `main`                | `() => Promise<void>`                                        | CLI entry point                 |

## Environment Variables

| Variable                       | Effect                                    |
| ------------------------------ | ----------------------------------------- |
| `SEARCH_QUERY`                 | Fallback query when no CLI argument given |
| `NODE_ENV=test` or `TEST=true` | Silences Pino logger                      |
| `DEBUG`                        | Sets logger to `debug` level              |
| `LOG_LEVEL`                    | Explicit log level (`fatal`–`silent`)     |

## Development

```bash
npm test          # 89 tests (node:test)
npm run lint      # ESLint flat config
npm run format    # Auto-format all files with Prettier
node src/scraper.js "query"    # Run directly
node src/scraper.js --health   # Health check
```

## Design Decisions

- **Cookie acquisition**: Scraper visits `https://search.brave.com/` before each search to obtain fresh cookies. No `.env` or cookie config is needed.
- **No config system**: CLI flags and env vars only. Keeps the package zero-config for consumers.
- **Cheerio over puppeteer**: Lighter, faster, no browser dependency. Only works because Brave Search renders results server-side in HTML.
- **Retry strategy**: Exponential backoff with jitter. 3 retries by default (configurable via `retries` param). Both 429 responses and transient network errors are retried.
- **Single-file scraper**: All logic in one module deliberately. Simplifies maintenance for a single developer. If the scraper grows beyond ~500 lines, consider splitting into `src/parse.js`, `src/network.js`, `src/cli.js`.

## Known Limitations

- No TypeScript — consumers must rely on JSDoc annotations for intellisense.
- No programmatic API other than calling the exported functions directly.
- Brave Search page structure changes can break `extractUrls()` — the most fragile part of the codebase.
- No caching layer — each scrape fetches fresh results.

## Publishing

```bash
npm publish       # publishes src/, package.json, README.md, LICENSE only
```

See `.npmignore` for the full publish allowlist.

## License

CC BY-NC-ND 4.0 — view and run only. No modifications or derivatives permitted.
