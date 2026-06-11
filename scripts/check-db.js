const { pool, testConnection } = require('../server/database/db');

async function main() {
  const connected = await testConnection();

  if (!connected) {
    throw new Error('Database connection failed');
  }

  const [metadata, tables, adminUser] = await Promise.all([
    pool.query('SELECT current_database() AS database, current_user AS user'),
    pool.query("SELECT COUNT(*)::int AS count FROM information_schema.tables WHERE table_schema = 'public'"),
    pool.query("SELECT id, email, role, status FROM users WHERE email = $1", [
      process.env.ADMIN_EMAIL || 'admin@cisco.com',
    ]),
  ]);

  if (tables.rows[0].count === 0) {
    throw new Error('Connected database has no public tables. Run npm run db-setup first.');
  }

  if (adminUser.rows.length === 0) {
    throw new Error('Admin user was not found in the configured database.');
  }

  const admin = adminUser.rows[0];
  if (admin.role !== 'super_admin' || admin.status !== 'active') {
    throw new Error('Admin user exists but is not an active super admin.');
  }

  console.log(`Database connected: ${metadata.rows[0].database} as ${metadata.rows[0].user}`);
  console.log(`Public tables: ${tables.rows[0].count}`);
  console.log(`Admin user verified: ${admin.email}`);
}

main()
  .catch(error => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
