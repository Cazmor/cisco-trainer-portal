require('dotenv').config();

const makeDbConfig = () => {
  // Use local PostgreSQL only
  const config = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
    database: process.env.DB_NAME || 'cisco_tracker',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres123',
    ssl: false,  // No SSL for local development
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 30000,
    max: 20
  };

  console.log('Database config:', { host: config.host, database: config.database, user: config.user });
  return config;
};

module.exports = { makeDbConfig };
