'use strict';

process.env.NODE_ENV = 'test';

const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert');
const { main } = require('../src/scraper.js');

describe('main', () => {
  let origArgv;
  let origExit;
  let origLog;
  let origError;
  let origSearchQuery;

  beforeEach(() => {
    origArgv = process.argv;
    origExit = process.exit;
    origLog = console.log;
    origError = console.error;
    origSearchQuery = process.env.SEARCH_QUERY;
    process.exit = () => {};
    process.env.SEARCH_QUERY = '';
  });

  afterEach(() => {
    process.argv = origArgv;
    process.exit = origExit;
    console.log = origLog;
    console.error = origError;
    if (origSearchQuery === undefined) {
      delete process.env.SEARCH_QUERY;
    } else {
      process.env.SEARCH_QUERY = origSearchQuery;
    }
  });

  it('shows usage and exits when no query is provided', async () => {
    const lines = [];
    console.error = (msg) => lines.push(msg);
    process.argv = ['node', 'scraper.js'];
    await main();
    assert.ok(lines.length > 0);
    assert.ok(lines.some((l) => l.includes('Usage')));
  });

  it('handles --version flag', async () => {
    let output = '';
    console.log = (msg) => {
      output = msg;
    };
    process.argv = ['node', 'scraper.js', '--version'];
    await main();
    assert.match(output, /^\d+\.\d+\.\d+/);
  });

  it('handles --health flag', async () => {
    let output = '';
    console.log = (msg) => {
      output = msg;
    };
    process.argv = ['node', 'scraper.js', '--health'];
    await main();
    const parsed = JSON.parse(output);
    assert.ok(['ok', 'degraded', 'fail'].includes(parsed.status));
  });

  it('handles validation error for long query', async () => {
    let output = '';
    console.log = (msg) => { output += msg; };
    process.argv = ['node', 'scraper.js', 'a'.repeat(501)];
    await main();
    assert.strictEqual(output, '', 'should not produce any stdout output on validation error');
  });
});
