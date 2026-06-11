require('dotenv').config();

const makeDbConfig = () => {
  const useConnectionString = Boolean(process.env.DATABASE_URL);
  const sslMode = (process.env.DB_SSL || '').toLowerCase();
  const hostForSsl = process.env.DATABASE_URL || process.env.DB_HOST || '';
  
  const config = useConnectionString
    ? { connectionString: process.env.DATABASE_URL }
    : {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
        database: process.env.DB_NAME || 'cisco_tracker',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres123',
      };

  config.max = 20;
  config.idleTimeoutMillis = 30000;
  config.connectionTimeoutMillis = 5000;

  const isRender = hostForSsl.includes('render.com') || 
                   hostForSsl.includes('onrender.com') ||
                   process.env.NODE_ENV === 'production';
  
  if (
    sslMode === 'true' ||
    sslMode === 'require' ||
    sslMode === '1' ||
    isRender
  ) {
    console.log('SSL enabled for database connection');
    config.ssl = { rejectUnauthorized: false };
  }

  return config;
};

module.exports = { makeDbConfig };
