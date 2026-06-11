require('dotenv').config();

const makeDbConfig = () => {
  const useConnectionString = Boolean(process.env.DATABASE_URL);
  
  let config;
  
  if (useConnectionString) {
    // For Supabase, always require SSL
    config = { 
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 10000,
      idleTimeoutMillis: 30000
    };
  } else {
    config = {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
      database: process.env.DB_NAME || 'cisco_tracker',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres123',
      ssl: process.env.DB_SSL === 'require' ? { rejectUnauthorized: false } : false,
      connectionTimeoutMillis: 10000,
      idleTimeoutMillis: 30000
    };
  }

  config.max = 20;
  return config;
};

module.exports = { makeDbConfig };
