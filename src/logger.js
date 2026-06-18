'use strict';

const pino = require('pino');

const LEVELS = { fatal: 0, error: 1, warn: 2, info: 3, debug: 4, trace: 5, silent: 6 };

function resolveLogLevel() {
  if (process.env.LOG_LEVEL && LEVELS[process.env.LOG_LEVEL] !== undefined) {
    return process.env.LOG_LEVEL;
  }
  if (process.env.DEBUG) return 'debug';
  if (process.env.NODE_ENV === 'test' || process.env.TEST) return 'silent';
  return 'info';
}

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
});

module.exports = logger;
