const { after, test } = require('node:test');
const assert = require('node:assert/strict');
const app = require('../server/index');
const { pool } = require('../server/database/db');

async function request(path) {
  const server = await new Promise(resolve => {
    const instance = app.listen(0, '127.0.0.1', () => resolve(instance));
  });

  try {
    const { port } = server.address();
    const response = await fetch(`http://127.0.0.1:${port}${path}`);
    const body = await response.json();
    return { response, body };
  } finally {
    await new Promise(resolve => server.close(resolve));
  }
}

after(async () => {
  await pool.end();
});

test('health endpoint returns application status', async () => {
  const { response, body } = await request('/api/health');

  assert.equal(response.status, 200);
  assert.equal(body.status, 'ok');
  assert.match(body.timestamp, /^\d{4}-\d{2}-\d{2}T/);
  assert.equal(typeof body.uptime, 'number');
});

test('unknown routes return a JSON 404', async () => {
  const { response, body } = await request('/missing-route');

  assert.equal(response.status, 404);
  assert.deepEqual(body, { error: 'Route not found' });
});
