const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { query } = require('../database/db');
const { authenticateToken, generateToken } = require('../middleware/auth');

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log("Login attempt for:", email);
        
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
        
        const result = await query(
            "SELECT id, name, email, password_hash, phone, centre_id, role, status, photo_url FROM users WHERE email = $1",
            [email]
        );
        
        console.log("Query result rows:", result.rows.length);
        
        if (result.rows.length === 0) {
            console.log("User not found:", email);
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        
        const user = result.rows[0];
        console.log("User found, role:", user.role, "status:", user.status);
        
        if (user.status !== 'active') {
            return res.status(403).json({ error: 'Account is not active. Please contact administrator.' });
        }
        
        const validPassword = await bcrypt.compare(password, user.password_hash);
        console.log("Password valid:", validPassword);
        
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        
        const token = generateToken(user);
        
        res.json({
            token,
            user: {
                id: user.id, name: user.name, email: user.email,
                phone: user.phone, centre_id: user.centre_id,
                role: user.role, photo_url: user.photo_url
            }
        });
    } catch (error) {
        console.error('=== LOGIN ERROR DETAILS ===');
        console.error('Message:', error.message);
        console.error('Stack:', error.stack);
        console.error('Code:', error.code);
        res.status(500).json({ 
            error: 'Internal server error', 
            details: error.message 
        });
    }
});

router.post('/register', async (req, res) => {
    try {
        const { name, email, password, phone, centre_id, role } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Name, email, and password are required' });
        }
        const existingUser = await query("SELECT id FROM users WHERE email = $1", [email]);
        if (existingUser.rows.length > 0) {
            return res.status(409).json({ error: 'Email already registered' });
        }
        const existingPending = await query("SELECT id FROM pending_registrations WHERE email = $1", [email]);
        if (existingPending.rows.length > 0) {
            return res.status(409).json({ error: 'Registration already pending approval' });
        }
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);
        const result = await query(
            "INSERT INTO pending_registrations (name, email, password_hash, phone, centre_id, role) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id",
            [name, email, password_hash, phone, centre_id, role || 'instructor']
        );
        res.status(201).json({ message: 'Registration submitted for approval', id: result.rows[0].id });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }
        const result = await query("SELECT id FROM users WHERE email = $1", [email]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Email not found' });
        }
        const token = crypto.randomBytes(32).toString('hex');
        const expires_at = new Date(Date.now() + 3600000);
        await query(
            "INSERT INTO password_resets (user_id, token, expires_at) VALUES ($1, $2, $3)",
            [result.rows[0].id, token, expires_at]
        );
        res.json({
            message: 'Password reset link generated',
            resetLink: 'https://cisco-trainer-portal-1.onrender.com/reset-password.html?token=' + token,
            token: token
        });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/reset-password', async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        if (!token || !newPassword) {
            return res.status(400).json({ error: 'Token and new password are required' });
        }
        const result = await query("SELECT user_id, expires_at, used FROM password_resets WHERE token = $1", [token]);
        if (result.rows.length === 0) {
            return res.status(400).json({ error: 'Invalid reset token' });
        }
        const reset = result.rows[0];
        if (reset.used) {
            return res.status(400).json({ error: 'Token already used' });
        }
        if (new Date() > new Date(reset.expires_at)) {
            return res.status(400).json({ error: 'Token expired' });
        }
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(newPassword, salt);
        await query("UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2", [password_hash, reset.user_id]);
        await query("UPDATE password_resets SET used = TRUE WHERE token = $1", [token]);
        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/me', authenticateToken, async (req, res) => {
    try {
        const result = await query(
            "SELECT id, name, email, phone, centre_id, role, status, photo_url, created_at FROM users WHERE id = $1",
            [req.user.id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.put('/me', authenticateToken, async (req, res) => {
    try {
        const { name, phone, photo_url } = req.body;
        const result = await query(
            "UPDATE users SET name = COALESCE($1, name), phone = COALESCE($2, phone), photo_url = COALESCE($3, photo_url), updated_at = NOW() WHERE id = $4 RETURNING id, name, email, phone, centre_id, role, photo_url",
            [name, phone, photo_url, req.user.id]
        );
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;


