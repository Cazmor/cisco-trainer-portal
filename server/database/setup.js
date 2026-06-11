const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const { makeDbConfig } = require('./poolConfig');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const pool = new Pool(makeDbConfig());

async function setupDatabase() {
    const client = await pool.connect();
    
    try {
        console.log('Starting database setup...');
        console.log('Connected to PostgreSQL on', process.env.DB_HOST, ':', process.env.DB_PORT);
        
        console.log('Reading schema.sql...');
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
        
        console.log('Creating database schema...');
        await client.query(schemaSQL);
        console.log('Schema created successfully!');
        
        console.log('Reading seed.sql...');
        const seedPath = path.join(__dirname, 'seed.sql');
        const seedSQL = fs.readFileSync(seedPath, 'utf8');
        
        console.log('Inserting seed data...');
        await client.query(seedSQL);
        console.log('Seed data inserted successfully!');
        
        console.log('Updating user passwords with proper hashes...');
        
        const passwords = {
            'admin@cisco.com': 'admin123',
            'nairobi.admin@cisco.com': 'admin123',
            'mombasa.admin@cisco.com': 'admin123',
            'kisumu.admin@cisco.com': 'admin123',
            'instructor1.nairobi@cisco.com': 'instructor123',
            'instructor2.nairobi@cisco.com': 'instructor123',
            'instructor1.mombasa@cisco.com': 'instructor123',
            'instructor1.kisumu@cisco.com': 'instructor123'
        };
        
        const keys = Object.keys(passwords);
        for (let i = 0; i < keys.length; i++) {
            const email = keys[i];
            const password = passwords[email];
            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(password, salt);
            await client.query("UPDATE users SET password_hash = $1 WHERE email = $2", [hash, email]);
            console.log('Updated password for:', email);
        }
        
        console.log('');
        console.log('========================================');
        console.log('  DATABASE SETUP COMPLETED SUCCESSFULLY');
        console.log('========================================');
        console.log('');
        console.log('Default Login Credentials:');
        console.log('---------------------------');
        console.log('Super Admin: admin@cisco.com / admin123');
        console.log('Nairobi Admin: nairobi.admin@cisco.com / admin123');
        console.log('Instructor: instructor1.nairobi@cisco.com / instructor123');
        console.log('');
        
    } catch (error) {
        console.error('Error setting up database:', error.message);
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
}

setupDatabase();
