# Maintainer Guide

## Architecture Overview

This is a single-module CLI tool. The entire pipeline lives in `src/scraper.js` (487 lines). The dependency graph is flat:

```
src/scraper.js  ──►  src/logger.js
     │                  └── pino
     ├── axios
     ├── cheerio
     └── zod
```

### Scraper pipeline

```
CLI args / SEARCH_QUERY env
        │
        ▼
  validateSearchQuery()     ← Zod schema (searchQuerySchema)
        │
        ├── (default) ──► scrapeBraveSearch()
        │                    ├── GET https://search.brave.com/   → cookies
        │                    ├── sleep(1-3s random delay)
        │                    ├── fetchWithRetry() × N pages      ← backoff
        │                    └── extractUrls()                   ← cheerio
        │                    │
        │                    ▼
        │              JSON string[] → stdout
        │
        └── --summary ──► fetchSummary()
                             ├── fetchWithRetry()
                             │    └── DuckDuckGo Instant Answer API
                             └── structured JSON → stdout
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
| `fetchSummary`        | `(query: string, apiUrl?: string) => Promise<SummaryResult>` | DuckDuckGo instant summary      |
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
npm test          # 95 tests (node:test)
npm run lint      # ESLint flat config
npm run format    # Auto-format all files with Prettier
node src/scraper.js "query"             # Run directly
node src/scraper.js --health            # Health check
node src/scraper.js --version           # Print version
node src/scraper.js --summary "query"   # DuckDuckGo summary
```

## Design Decisions

- **Cookie acquisition**: Scraper visits `https://search.brave.com/` before each search to obtain fresh cookies. No `.env` or cookie config is needed.
- **No config system**: CLI flags and env vars only. Keeps the package zero-config for consumers.
- **Cheerio over puppeteer**: Lighter, faster, no browser dependency. Only works because Brave Search renders results server-side in HTML.
- **Retry strategy**: Exponential backoff with jitter. 3 retries by default (configurable via `retries` param). Both 429 responses and transient network errors are retried.
- **Single-file module**: All logic in one module deliberately. Simplifies maintenance for a single developer. If the module grows beyond ~600 lines, consider splitting into `src/scrape.js`, `src/summary.js`, `src/network.js`, `src/cli.js`.

## Known Limitations

- No TypeScript — consumers must rely on JSDoc annotations for intellisense.
- No programmatic API other than calling the exported functions directly.
- Brave Search page structure changes can break `extractUrls()` — the most fragile part of the codebase.
- No caching layer — each scrape fetches fresh results.

## License

CC BY-NC-ND 4.0 — view and run only. No modifications or derivatives permitted.
