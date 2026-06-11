const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const { makeDbConfig } = require('./poolConfig');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const pool = new Pool(makeDbConfig());

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
