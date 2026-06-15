const { Pool } = require('pg');
const { makeDbConfig } = require('./poolConfig');
require('dotenv').config();

const pool = new Pool(makeDbConfig());

pool.on('error', (err, client) => {
    console.error('Unexpected error on idle client', err);
});

pool.on('connect', () => {
    console.log('Connected to PostgreSQL database');
});

const query = async (text, params) => {
    const start = Date.now();
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    if (process.env.NODE_ENV !== 'production') {
        console.log('Executed query', { text: text.substring(0, 50), duration, rows: res.rowCount });
    }
    return res;
};

const testConnection = async () => {
    const client = await pool.connect();
    try {
        await client.query('SELECT 1');
        return true;
    } catch (err) {
        console.error('Database connection test failed:', err.message);
        return false;
    } finally {
        client.release();
    }
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
    pool,
    testConnection
};
