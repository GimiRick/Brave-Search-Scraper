'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert');
const { spawn } = require('child_process');
const path = require('path');

const SCRIPT = path.resolve(__dirname, '..', 'src', 'scraper.js');

function run(args = []) {
  return new Promise((resolve, reject) => {
    const proc = spawn(process.execPath, [SCRIPT, ...args], {
      env: { ...process.env, SEARCH_QUERY: '' },
    });
    let stdout = '';
    let stderr = '';
    proc.stdout.on('data', (d) => {
      stdout += d;
    });
    proc.stderr.on('data', (d) => {
      stderr += d;
    });
    proc.on('error', reject);
    proc.on('exit', (code) => resolve({ code, stdout, stderr }));
  });
}

describe('CLI', () => {
  it('--health outputs valid JSON with status field', async () => {
    const { stdout } = await run(['--health']);
    assert.ok(stdout.length > 0);
    let parsed;
    try {
      parsed = JSON.parse(stdout);
    } catch {
      assert.fail(`stdout must be valid JSON, got: ${stdout}`);
    }
    assert.ok(['ok', 'degraded', 'fail'].includes(parsed.status));
    assert.strictEqual(typeof parsed.version, 'string');
    assert.ok(parsed.checks);
    assert.ok(parsed.checks.node);
    assert.ok(parsed.checks.dependencies);
    assert.ok(parsed.checks.network);
  });

  it('no arguments prints usage and exits 1', async () => {
    const { code, stderr } = await run([]);
    assert.strictEqual(code, 1);
    assert.ok(stderr.includes('Usage'), `stderr should contain "Usage": ${stderr}`);
  });

  it('empty query string exits 1', async () => {
    const { code } = await run(['']);
    assert.strictEqual(code, 1);
  });

  it('--version outputs the current version and exits 0', async () => {
    const { code, stdout } = await run(['--version']);
    assert.strictEqual(code, 0);
    assert.match(stdout, /^\d+\.\d+\.\d+/);
  });
});
