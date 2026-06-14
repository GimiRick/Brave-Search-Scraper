# Docker Usage

Run the scraper inside a Docker container — no Node.js needed on your machine.

## Build the image

```bash
docker build -t brave-scraper .
```

## Run with a search query

```bash
docker run --rm brave-scraper "your search query"
```

## Run with an environment variable

```bash
docker run --rm -e SEARCH_QUERY="your query" brave-scraper
```

## How it works

The Dockerfile:

- Uses `node:24-alpine` (lightweight, secure)
- Installs only production dependencies (`npm ci --omit=dev`)
- Runs as a non-root user (`node` user)
- Default command is `node src/scraper.js`

So when you pass a query as the last argument, Docker appends it to the entrypoint, and the scraper picks it up from `process.argv`.
