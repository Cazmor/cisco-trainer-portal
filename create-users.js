const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'cisco_tracker',
    user: 'postgres',
    password: 'postgres123'
});

async function createUsers() {
    const adminHash = bcrypt.hashSync('admin123', 10);
    const kiamHash = bcrypt.hashSync('kiam123', 10);
    
    await pool.query("DELETE FROM users");
    
    await pool.query(
        "INSERT INTO users (name, email, password_hash, role, status) VALUES ($1, $2, $3, $4, $5)",
        ['Admin User', 'admin@cisco.com', adminHash, 'super_admin', 'active']
    );
    
    await pool.query(
        "INSERT INTO users (name, email, password_hash, role, status) VALUES ($1, $2, $3, $4, $5)",
        ['Kiam User', 'kiam@cisco.com', kiamHash, 'instructor', 'active']
    );
    
    console.log('Users created successfully!');
    console.log('Admin hash:', adminHash);
    console.log('Kiam hash:', kiamHash);
    await pool.end();
}

createUsers();
