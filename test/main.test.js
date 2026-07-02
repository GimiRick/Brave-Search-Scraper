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
  let exitCode;

  beforeEach(() => {
    exitCode = undefined;
    origArgv = process.argv;
    origExit = process.exit;
    origLog = console.log;
    origError = console.error;
    origSearchQuery = process.env.SEARCH_QUERY;
    process.exit = (code) => { exitCode = code; };
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

  it('shows usage and exits 1 when no query is provided', async () => {
    const lines = [];
    console.error = (msg) => lines.push(msg);
    process.argv = ['node', 'scraper.js'];
    await main();
    assert.ok(lines.length > 0);
    assert.ok(lines.some((l) => l.includes('Usage')));
    assert.strictEqual(exitCode, 1);
  });

  it('handles --version flag and exits 0', async () => {
    let output = '';
    console.log = (msg) => {
      output = msg;
    };
    process.argv = ['node', 'scraper.js', '--version'];
    await main();
    assert.match(output, /^\d+\.\d+\.\d+/);
    assert.strictEqual(exitCode, 0);
  });

  it('handles --health flag and exits with code', async () => {
    let output = '';
    console.log = (msg) => {
      output = msg;
    };
    process.argv = ['node', 'scraper.js', '--health'];
    await main();
    const parsed = JSON.parse(output);
    assert.ok(['ok', 'degraded', 'fail'].includes(parsed.status));
    assert.ok(exitCode === 0 || exitCode === 1, `expected exit 0 or 1, got ${exitCode}`);
  });

  it('handles validation error for long query and exits 1', async () => {
    let output = '';
    console.log = (msg) => { output += msg; };
    process.argv = ['node', 'scraper.js', 'a'.repeat(501)];
    await main();
    assert.strictEqual(output, '', 'should not produce any stdout output on validation error');
    assert.strictEqual(exitCode, 1);
  });
});
