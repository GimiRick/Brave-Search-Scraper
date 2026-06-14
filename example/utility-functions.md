# Utility Functions

Two small helpers that the scraper uses internally, also exported for your own use.

## sleep(ms)

Pause execution for a given number of milliseconds. Useful for throttling your own requests so you don't get rate limited.

```js
const { sleep } = require('./src/scraper');

async function main() {
  console.log('Before sleep');
  await sleep(2000);  // wait 2 seconds
  console.log('After sleep');
}

main();
```

Why not just use `setTimeout`? `sleep` wraps it in a promise so you can use it cleanly with `await`. No callback nesting.

## randomItem(arr)

Pick a random element from an array. The scraper uses this to pick a different user agent for each request.

```js
const { randomItem } = require('./src/scraper');

const userAgents = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/125.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) Safari/605.1',
  'Mozilla/5.0 (X11; Linux x86_64) Chrome/125.0',
];

// Each call might return a different agent
const agent = randomItem(userAgents);
console.log('Selected:', agent);
```

## Using them together

```js
const { randomItem, sleep } = require('./src/scraper');

const proxies = ['proxy1', 'proxy2', 'proxy3'];

async function rotateProxy() {
  const proxy = randomItem(proxies);
  console.log('Using:', proxy);
  await sleep(1000);
  // make request with this proxy
}
```
