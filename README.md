# Brave Search Scraper

A Node.js scraper that searches Brave Search and returns result URLs. Built with axios and cheerio. Runs in Docker.

Part of the GimiRick toolchain. We build open source LLMs and AI systems. Nothing fancy, just solid work on performance and research that actually helps people.

Founded by Mohammad Faiz.

## How it works

The scraper visits Brave Search, grabs the HTML, and pulls out URLs. Brave blocks automated requests pretty aggressively so there is some retry logic built in. It rotates through a few different user agents and grabs cookies from the homepage before hitting search. If it gets rate limited it waits and tries again with exponential backoff.

## Usage

### Local

```bash
npm install
node src/scraper.js "your search query"
```

You can also use the SEARCH_QUERY environment variable.

```bash
SEARCH_QUERY="node.js scraping" node src/scraper.js
```

### Docker

```bash
docker build -t brave-scraper .
docker run --rm brave-scraper "your search query"
```

With an environment variable instead.

```bash
docker run --rm -e SEARCH_QUERY="your query" brave-scraper
```

## Output

Prints a JSON array of URLs to stdout.

```json
[
  "https://example.com/page1",
  "https://example.com/page2"
]
```

If something goes wrong it prints an error message to stderr and exits with code 1.

## How it works under the hood

1. Visits the Brave homepage to pick up any cookies the server wants to set.
2. Waits 1 to 3 seconds so it doesn't look like a bot.
3. Sends the actual search request with a different user agent.
4. If Brave returns a 429 (rate limited) it waits longer each time and retries up to 3 times.
5. Parses the HTML with cheerio and pulls out every relevant link.
6. Filters out Brave's own domains (brave.com, brave.app) so you only get external results.

## Project structure

```text
brave-search-scraper/
  src/scraper.js    the scraper
  Dockerfile        builds a production image
  package.json      dependencies (axios, cheerio)
```

## About GimiRick

We build open source LLMs and AI systems. Nothing fancy, just solid work on performance and research that actually helps people. Founded by Mohammad Faiz.

## License

CC BY-ND 4.0 — Attribution-NoDerivatives 4.0 International.

Permission is granted to view and run this code. No modifications, alterations, or derivative works are permitted.

See the [LICENSE](LICENSE) file for the full legal text.
