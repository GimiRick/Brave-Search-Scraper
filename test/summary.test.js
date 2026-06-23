'use strict';

process.env.NODE_ENV = 'test';

const { describe, it } = require('node:test');
const assert = require('node:assert');
const http = require('http');
const { fetchSummary } = require('../src/scraper.js');

function createServer(responseData, statusCode) {
  const code = statusCode || 200;
  return http.createServer((req, res) => {
    res.writeHead(code, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(responseData));
  });
}

function withServer(server, fn) {
  server.on('clientError', () => {});
  return new Promise((resolve, reject) => {
    server.on('error', reject);
    server.listen(0, () => {
      const port = server.address().port;
      fn(port)
        .finally(() => {
          server.close();
        })
        .then(resolve, reject);
    });
  });
}

describe('fetchSummary', () => {
  it('rejects empty query with validation error', async () => {
    try {
      await fetchSummary('');
      assert.fail('Should have thrown');
    } catch (err) {
      assert.strictEqual(err.name, 'ZodError');
      assert.ok(err.issues.length > 0);
    }
  });

  it('rejects whitespace-only query with validation error', async () => {
    try {
      await fetchSummary('   ');
      assert.fail('Should have thrown');
    } catch (err) {
      assert.strictEqual(err.name, 'ZodError');
    }
  });

  it('rejects null query with validation error', async () => {
    try {
      await fetchSummary(null);
      assert.fail('Should have thrown');
    } catch (err) {
      assert.strictEqual(err.name, 'ZodError');
    }
  });

  it('rejects undefined query', async () => {
    try {
      await fetchSummary(undefined);
      assert.fail('Should have thrown');
    } catch (err) {
      assert.strictEqual(err.name, 'ZodError');
    }
  });

  it('rejects non-string query (number)', async () => {
    try {
      await fetchSummary(42);
      assert.fail('Should have thrown');
    } catch (err) {
      assert.strictEqual(err.name, 'ZodError');
    }
  });

  it('returns structured summary with abstract fields', async () => {
    const apiResponse = {
      AbstractText: 'Machine learning (ML) is a field of study in artificial intelligence',
      AbstractSource: 'Wikipedia',
      AbstractURL: 'https://en.wikipedia.org/wiki/Machine_learning',
      Heading: 'Machine learning',
      Answer: '',
      AnswerType: '',
      Definition: '',
      DefinitionSource: '',
      DefinitionURL: '',
      Image: '/some/image.jpg',
      Type: 'A',
      RelatedTopics: [],
      Results: [],
    };

    const server = createServer(apiResponse);
    await withServer(server, async (port) => {
      const result = await fetchSummary('machine learning', `http://localhost:${port}`);

      assert.strictEqual(result.query, 'machine learning');
      assert.strictEqual(result.heading, 'Machine learning');
      assert.strictEqual(result.abstract, 'Machine learning (ML) is a field of study in artificial intelligence');
      assert.strictEqual(result.source, 'Wikipedia');
      assert.strictEqual(result.sourceUrl, 'https://en.wikipedia.org/wiki/Machine_learning');
      assert.strictEqual(result.imageUrl, 'https://duckduckgo.com/some/image.jpg');
      assert.strictEqual(result.type, 'A');
      assert.strictEqual(result.hasAbstract, true);
      assert.strictEqual(result.hasAnswer, false);
      assert.strictEqual(result.hasDefinition, false);
      assert.strictEqual(result.answer, null);
      assert.strictEqual(result.answerType, null);
      assert.strictEqual(result.definition, null);
      assert.strictEqual(result.definitionSource, null);
      assert.strictEqual(result.definitionUrl, null);
    });
  });

  it('returns answer when API provides direct answer', async () => {
    const apiResponse = {
      AbstractText: '',
      AbstractSource: '',
      AbstractURL: '',
      Heading: '',
      Answer: '42',
      AnswerType: 'number',
      Definition: '',
      DefinitionSource: '',
      DefinitionURL: '',
      Image: null,
      Type: 'A',
      RelatedTopics: [],
    };

    const server = createServer(apiResponse);
    await withServer(server, async (port) => {
      const result = await fetchSummary('life the universe and everything', `http://localhost:${port}`);

      assert.strictEqual(result.answer, '42');
      assert.strictEqual(result.answerType, 'number');
      assert.strictEqual(result.hasAnswer, true);
      assert.strictEqual(result.hasAbstract, false);
      assert.strictEqual(result.hasDefinition, false);
      assert.strictEqual(result.abstract, null);
      assert.strictEqual(result.heading, null);
      assert.strictEqual(result.imageUrl, null);
    });
  });

  it('returns definition when API provides definition', async () => {
    const apiResponse = {
      AbstractText: '',
      AbstractSource: '',
      AbstractURL: '',
      Heading: '',
      Answer: '',
      AnswerType: '',
      Definition: 'A type of programming language',
      DefinitionSource: 'Wikipedia',
      DefinitionURL: 'https://en.wikipedia.org/wiki/Programming_language',
      Image: null,
      Type: 'A',
      RelatedTopics: [],
    };

    const server = createServer(apiResponse);
    await withServer(server, async (port) => {
      const result = await fetchSummary('programming language', `http://localhost:${port}`);

      assert.strictEqual(result.definition, 'A type of programming language');
      assert.strictEqual(result.definitionSource, 'Wikipedia');
      assert.strictEqual(result.definitionUrl, 'https://en.wikipedia.org/wiki/Programming_language');
      assert.strictEqual(result.hasDefinition, true);
      assert.strictEqual(result.hasAbstract, false);
      assert.strictEqual(result.hasAnswer, false);
    });
  });

  it('handles empty API response gracefully (no info found)', async () => {
    const apiResponse = {
      AbstractText: '',
      AbstractSource: '',
      AbstractURL: '',
      Heading: '',
      Answer: '',
      AnswerType: '',
      Definition: '',
      DefinitionSource: '',
      DefinitionURL: '',
      Image: null,
      Type: 'A',
      RelatedTopics: [],
    };

    const server = createServer(apiResponse);
    await withServer(server, async (port) => {
      const result = await fetchSummary('asdfghjklqwertyuiop', `http://localhost:${port}`);

      assert.strictEqual(result.heading, null);
      assert.strictEqual(result.abstract, null);
      assert.strictEqual(result.answer, null);
      assert.strictEqual(result.definition, null);
      assert.strictEqual(result.type, 'A');
      assert.strictEqual(result.hasAbstract, false);
      assert.strictEqual(result.hasAnswer, false);
      assert.strictEqual(result.hasDefinition, false);
      assert.strictEqual(result.imageUrl, null);
    });
  });

  it('handles disambiguation type response', async () => {
    const apiResponse = {
      AbstractText: '',
      AbstractSource: '',
      AbstractURL: '',
      Heading: 'Apple',
      Answer: '',
      AnswerType: '',
      Definition: '',
      DefinitionSource: '',
      DefinitionURL: '',
      Image: null,
      Type: 'D',
      RelatedTopics: [],
    };

    const server = createServer(apiResponse);
    await withServer(server, async (port) => {
      const result = await fetchSummary('apple', `http://localhost:${port}`);
      assert.strictEqual(result.type, 'D');
      assert.strictEqual(result.heading, 'Apple');
      assert.strictEqual(result.hasAbstract, false);
    });
  });

  it('handles server error (500) by throwing', async () => {
    const server = createServer({ error: 'Internal Server Error' }, 500);
    await withServer(server, async (port) => {
      try {
        await fetchSummary('test', `http://localhost:${port}`);
        assert.fail('Should have thrown');
      } catch (err) {
        assert.ok(err);
        assert.ok(err.message);
      }
    });
  });

  it('handles API with image as empty string', async () => {
    const apiResponse = {
      AbstractText: 'Some text',
      AbstractSource: 'Source',
      AbstractURL: 'https://example.com',
      Heading: 'Test',
      Answer: '',
      AnswerType: '',
      Definition: '',
      DefinitionSource: '',
      DefinitionURL: '',
      Image: '',
      Type: 'A',
      RelatedTopics: [],
    };

    const server = createServer(apiResponse);
    await withServer(server, async (port) => {
      const result = await fetchSummary('test', `http://localhost:${port}`);
      assert.strictEqual(result.imageUrl, null);
      assert.strictEqual(result.abstract, 'Some text');
    });
  });

  it('handles query with special characters', async () => {
    const apiResponse = {
      AbstractText: 'Node.js is a JavaScript runtime',
      AbstractSource: 'Wikipedia',
      AbstractURL: 'https://en.wikipedia.org/wiki/Node.js',
      Heading: 'Node.js',
      Answer: '',
      AnswerType: '',
      Definition: '',
      DefinitionSource: '',
      DefinitionURL: '',
      Image: null,
      Type: 'A',
      RelatedTopics: [],
    };

    const server = createServer(apiResponse);
    await withServer(server, async (port) => {
      const result = await fetchSummary('node.js & npm', `http://localhost:${port}`);
      assert.strictEqual(result.query, 'node.js & npm');
      assert.strictEqual(result.heading, 'Node.js');
      assert.strictEqual(result.abstract, 'Node.js is a JavaScript runtime');
    });
  });

  it('trims whitespace from query', async () => {
    const apiResponse = {
      AbstractText: 'JavaScript is a programming language',
      AbstractSource: 'Wikipedia',
      AbstractURL: 'https://en.wikipedia.org/wiki/JavaScript',
      Heading: 'JavaScript',
      Answer: '',
      AnswerType: '',
      Definition: '',
      DefinitionSource: '',
      DefinitionURL: '',
      Image: null,
      Type: 'A',
      RelatedTopics: [],
    };

    const server = createServer(apiResponse);
    await withServer(server, async (port) => {
      const result = await fetchSummary('  javascript  ', `http://localhost:${port}`);
      assert.strictEqual(result.query, 'javascript');
      assert.strictEqual(result.abstract, 'JavaScript is a programming language');
    });
  });

  it('sends request with correct query parameter', async () => {
    const server = http.createServer((req, res) => {
      const url = new URL(req.url, 'http://localhost');
      assert.strictEqual(url.searchParams.get('q'), 'validation test');
      assert.strictEqual(url.searchParams.get('format'), 'json');
      assert.strictEqual(url.searchParams.get('no_html'), '1');
      assert.strictEqual(url.searchParams.get('skip_disambig'), '1');

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        AbstractText: 'Validated',
        AbstractSource: 'Test',
        AbstractURL: 'https://example.com',
        Heading: 'Validation Test',
        Answer: '',
        AnswerType: '',
        Definition: '',
        DefinitionSource: '',
        DefinitionURL: '',
        Image: null,
        Type: 'A',
      }));
    });

    await withServer(server, async (port) => {
      const result = await fetchSummary('validation test', `http://localhost:${port}`);
      assert.strictEqual(result.abstract, 'Validated');
    });
  });
});
