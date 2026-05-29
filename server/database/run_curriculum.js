const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

async function run() {
    try {
        const sql = fs.readFileSync(path.join(__dirname, 'add_curriculum.sql'), 'utf8');
        await pool.query(sql);
        console.log('Full curriculum inserted successfully!');
        console.log('Modules 1-14 with all sections added.');
    } catch (e) {
        console.error('Error:', e.message);
    } finally {
        await pool.end();
    }
}
run();
