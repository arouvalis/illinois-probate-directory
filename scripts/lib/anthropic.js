'use strict';
// One place that talks to the Claude API, through the official SDK.
// Credentials come from the environment (ANTHROPIC_API_KEY), as before.

const { WRITER_MODEL, REVIEWER_MODEL } = require('./config');

function getClient({ mock } = {}) {
  if (mock) return require('./mock-client').createMockClient();
  let sdk;
  try {
    sdk = require('@anthropic-ai/sdk');
  } catch {
    throw new Error('The Claude SDK is not installed. Run "npm install" in the project folder first.');
  }
  const Anthropic = sdk.default || sdk;
  return new Anthropic();
}

function textOf(response) {
  return response.content.filter((b) => b.type === 'text').map((b) => b.text).join('');
}

// Haiku writes the draft.
async function writeDraft(client, { system, prompt }) {
  const res = await client.messages.create({
    model: WRITER_MODEL,
    max_tokens: 16000,
    system,
    messages: [{ role: 'user', content: prompt }],
  });
  if (res.stop_reason !== 'end_turn') throw new Error(`The writer stopped early (${res.stop_reason}).`);
  return textOf(res).trim();
}

// Sonnet reviews it and must answer in the JSON shape given.
async function reviewDraft(client, { system, prompt, schema }) {
  const res = await client.messages.create({
    model: REVIEWER_MODEL,
    max_tokens: 16000,
    system,
    messages: [{ role: 'user', content: prompt }],
    output_config: { format: { type: 'json_schema', schema } },
  });
  // A refusal or a cut-off answer may not match the shape. The caller treats
  // any error here as "flagged", so nothing unreviewed can be published.
  if (res.stop_reason !== 'end_turn') throw new Error(`The reviewer stopped early (${res.stop_reason}).`);
  return { data: JSON.parse(textOf(res)), model: res.model };
}

module.exports = { getClient, writeDraft, reviewDraft };
