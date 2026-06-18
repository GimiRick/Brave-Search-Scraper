'use strict';

const pino = require('pino');

const LEVELS = { fatal: 0, error: 1, warn: 2, info: 3, debug: 4, trace: 5, silent: 6 };

/**
 * Resolve the effective log level from environment variables.
 * Priority: `LOG_LEVEL` env > `DEBUG` env > `NODE_ENV=test` or `TEST` env > `'info'`.
 * @returns {'fatal'|'error'|'warn'|'info'|'debug'|'trace'|'silent'} The resolved log level.
 */
function resolveLogLevel() {
  if (process.env.LOG_LEVEL && LEVELS[process.env.LOG_LEVEL] !== undefined) {
    return process.env.LOG_LEVEL;
  }
  if (process.env.DEBUG) return 'debug';
  if (process.env.NODE_ENV === 'test' || process.env.TEST) return 'silent';
  return 'info';
}

/**
 * Structured logger instance using Pino.
 * Log level is auto-resolved from environment at import time.
 * @type {import('pino').Logger}
 */
const logger = pino({
  level: resolveLogLevel(),
  name: 'brave-search-scraper',
  formatters: {
    level(label) {
      return { level: label };
    },
  },
  serializers: {
    err: pino.stdSerializers.err,
  },
}, pino.destination(2));

module.exports = logger;
