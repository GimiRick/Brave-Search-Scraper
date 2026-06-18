'use strict';

process.env.NODE_ENV = 'test';

const { describe, it, beforeEach, afterEach } = require('node:test');
const { main } = require('../src/scraper.js');

describe('main', () => {
  let origArgv;
  let origExit;
  let origSearchQuery;

  beforeEach(() => {
    origArgv = process.argv;
    origExit = process.exit;
    origSearchQuery = process.env.SEARCH_QUERY;
    process.exit = () => {};
    process.env.SEARCH_QUERY = '';
  });

  afterEach(() => {
    process.argv = origArgv;
    process.exit = origExit;
    if (origSearchQuery === undefined) {
      delete process.env.SEARCH_QUERY;
    } else {
      process.env.SEARCH_QUERY = origSearchQuery;
    }
  });

  it('shows usage and exits when no query is provided', async () => {
    process.argv = ['node', 'scraper.js'];
    await main();
  });

  it('handles --version flag', async () => {
    process.argv = ['node', 'scraper.js', '--version'];
    await main();
  });

  it('handles --health flag', async () => {
    process.argv = ['node', 'scraper.js', '--health'];
    await main();
  });

  it('handles validation error for long query', async () => {
    process.argv = ['node', 'scraper.js', 'a'.repeat(501)];
    await main();
  });
});
