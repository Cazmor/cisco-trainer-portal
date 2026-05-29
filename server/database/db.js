const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

pool.on('error', (err, client) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

pool.on('connect', () => {
    console.log('Connected to PostgreSQL database');
});

const query = async (text, params) => {
    const start = Date.now();
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text: text.substring(0, 50), duration, rows: res.rowCount });
    return res;
};

const getClient = async () => {
    const client = await pool.connect();
    const query = client.query.bind(client);
    const release = client.release.bind(client);
    
    client.query = async (...args) => {
        client.lastQuery = args;
        return query(...args);
    };
    
    const timeout = setTimeout(() => {
        console.error('A client has been checked out for more than 5 seconds!');
        console.error('Last query:', client.lastQuery);
    }, 5000);
    
    const originalRelease = client.release;
    client.release = () => {
        clearTimeout(timeout);
        client.query = query;
        client.release = originalRelease;
        return release();
    };
    
    return client;
};

module.exports = {
    query,
    getClient,
    pool
};
