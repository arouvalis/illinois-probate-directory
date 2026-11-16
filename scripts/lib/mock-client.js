'use strict';
// Canned answers that stand in for Claude, for testing the pipeline's plumbing
// without API calls or cost. Only reachable with --dry-run --mock. A review
// produced here is marked "mock", and the publish step refuses mock reviews.
//
// Fixtures live in scripts/test-fixtures/:
//   <slug>.draft.md      what "Haiku" returns for that topic
//   <slug>.review.json   what "Sonnet" returns for that draft

const fs = require('fs');
const path = require('path');
const { slugify } = require('./topic-guard');

const FIXTURES = path.join(__dirname, '..', 'test-fixtures');
const reply = (text) => ({ model: 'mock', stop_reason: 'end_turn', content: [{ type: 'text', text }] });

function createMockClient() {
  return {
    messages: {
      async create(params) {
        const prompt = params.messages[0].content;
        if (params.output_config) {
          // Reviewer: find the fixture whose draft is in the prompt.
          for (const f of fs.readdirSync(FIXTURES).filter((f) => f.endsWith('.draft.md'))) {
            const draft = fs.readFileSync(path.join(FIXTURES, f), 'utf8').trim();
            if (prompt.includes(draft)) return reply(fs.readFileSync(path.join(FIXTURES, f.replace('.draft.md', '.review.json')), 'utf8'));
          }
          return reply(JSON.stringify({ claims: [], named_parties: [] }));
        }
        // Writer: the fixture for this topic, or a plain stub.
        const topic = (prompt.match(/TOPIC: "([^"]+)"/) || [])[1] || 'topic';
        const file = path.join(FIXTURES, `${slugify(topic)}.draft.md`);
        if (fs.existsSync(file)) return reply(fs.readFileSync(file, 'utf8'));
        return reply(`# ${topic}\n\nThis is a stand-in draft for testing. It makes no legal statements.\n`);
      },
    },
  };
}

module.exports = { createMockClient };
