const app = require('../server/index');
const { pool } = require('../server/database/db');

const adminEmail = process.env.ADMIN_EMAIL || 'admin@cisco.com';
const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

function listen() {
  return new Promise(resolve => {
    const server = app.listen(0, '127.0.0.1', () => resolve(server));
  });
}

async function request(baseUrl, path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const text = await response.text();
  const body = text ? JSON.parse(text) : {};

  if (!response.ok) {
    throw new Error(`${path} failed with ${response.status}: ${body.error || text}`);
  }

  return body;
}

async function main() {
  const server = await listen();

  try {
    const { port } = server.address();
    const baseUrl = `http://127.0.0.1:${port}`;
    const login = await request(baseUrl, '/api/auth/login', {
      method: 'POST',
      body: { email: adminEmail, password: adminPassword },
    });

    if (!login.token || login.user.role !== 'super_admin') {
      throw new Error('Admin login did not return a super admin session.');
    }

    const token = login.token;
    const checks = [
      ['/api/admin/dashboard', body => Number.isInteger(body.total_centres)],
      ['/api/admin/centres', body => Array.isArray(body)],
      ['/api/admin/users', body => Array.isArray(body)],
      ['/api/kpi/scorecard', body => typeof body.overall_score !== 'undefined'],
      ['/api/students', body => Array.isArray(body)],
    ];

    for (const [path, validate] of checks) {
      const body = await request(baseUrl, path, { token });
      if (!validate(body)) {
        throw new Error(`${path} returned an unexpected response shape.`);
      }
    }

    console.log(`Admin login verified: ${login.user.email}`);
    console.log('Dashboard API smoke tests passed.');
  } finally {
    await new Promise(resolve => server.close(resolve));
    await pool.end();
  }
}

main().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});
