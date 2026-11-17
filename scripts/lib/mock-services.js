'use strict';
// A stand-in for the three things the campaign sender talks to, for tests only:
// the Upstash database, Resend, and the site's unsubscribe check. Nothing here
// reaches the internet. Run by itself (node scripts/lib/mock-services.js 4010)
// to click through the site locally with KV_REST_API_URL=http://localhost:4010.
const http = require('http');

function startMock({ port = 0, failEmailsTo = [], siteKnowsTokens = true } = {}) {
  const data = new Map();
  const emails = [];
  const redis = ([name, ...args]) => {
    switch (String(name).toUpperCase()) {
      case 'GET': return data.get(args[0]) ?? null;
      case 'MGET': return args.map((k) => data.get(k) ?? null);
      case 'SET': {
        if (args.slice(2).map(String).includes('NX') && data.has(args[0])) return null;
        data.set(args[0], String(args[1]));
        return 'OK';
      }
      case 'DEL': return data.delete(args[0]) ? 1 : 0;
      case 'INCR': { const n = Number(data.get(args[0]) ?? 0) + 1; data.set(args[0], String(n)); return n; }
      case 'EXPIRE': return 1;
      default: throw new Error(`mock store: unsupported command ${name}`);
    }
  };
  const server = http.createServer((req, res) => {
    let body = '';
    req.on('data', (d) => { body += d; });
    req.on('end', () => {
      const send = (status, obj) => { res.writeHead(status, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(obj)); };
      const url = new URL(req.url, 'http://mock');
      try {
        if (req.method === 'GET' && url.pathname === '/api/unsubscribe') {
          const known = siteKnowsTokens && [...data.keys()].some((k) => k.endsWith(`:unsubtoken:${url.searchParams.get('t')}`));
          return send(200, { valid: known });
        }
        if (req.method === 'POST' && url.pathname === '/emails') {
          const email = JSON.parse(body);
          if (failEmailsTo.includes(email.to[0])) return send(422, { message: 'mock refusal' });
          emails.push({ ...email, idempotencyKey: req.headers['idempotency-key'] ?? null });
          return send(200, { id: `mock-${emails.length}` });
        }
        if (req.method === 'POST' && url.pathname === '/') return send(200, { result: redis(JSON.parse(body)) });
        send(404, { error: 'not found' });
      } catch (err) {
        send(500, { error: err.message });
      }
    });
  });
  return new Promise((resolve) => {
    server.listen(port, '127.0.0.1', () => resolve({ url: `http://127.0.0.1:${server.address().port}`, data, emails, close: () => new Promise((r) => server.close(r)) }));
  });
}

module.exports = { startMock };

if (require.main === module) {
  startMock({ port: Number(process.argv[2] || 4010) }).then((m) => console.log(`Mock database, Resend and site check listening on ${m.url}`));
}
