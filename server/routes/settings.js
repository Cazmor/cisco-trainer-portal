const express = require('express');
const router = express.Router();
const { query } = require('../database/db');
const { authenticateToken, requireRole } = require('../middleware/auth');
const archiver = require('archiver');
const { stringify } = require('csv-stringify/sync');
router.use(authenticateToken);

router.get('/profile', async (req, res) => {
    try {
        const result = await query("SELECT id, name, email, phone, centre_id, role, status, photo_url, created_at FROM users WHERE id = $1", [req.user.id]);
        if (result.rows.length === 0) { return res.status(404).json({ error: 'User not found' }); }
        res.json(result.rows[0]);
    } catch (error) { res.status(500).json({ error: 'Internal server error' }); }
});

router.put('/profile', async (req, res) => {
    try {
        const { name, phone, photo_url } = req.body;
        const result = await query("UPDATE users SET name = COALESCE($1, name), phone = COALESCE($2, phone), photo_url = COALESCE($3, photo_url), updated_at = NOW() WHERE id = $4 RETURNING id, name, email, phone, centre_id, role, photo_url", [name, phone, photo_url, req.user.id]);
        res.json(result.rows[0]);
    } catch (error) { res.status(500).json({ error: 'Internal server error' }); }
});

router.get('/notifications', async (req, res) => {
    try {
        let result = await query("SELECT * FROM notification_preferences WHERE user_id = $1", [req.user.id]);
        if (result.rows.length === 0) { result = await query("INSERT INTO notification_preferences (user_id) VALUES ($1) RETURNING *", [req.user.id]); }
        res.json(result.rows[0]);
    } catch (error) { res.status(500).json({ error: 'Internal server error' }); }
});

router.put('/notifications', async (req, res) => {
    try {
        const { email_reminders, weekly_report_reminder, maintenance_alerts, uaf_expiry_reminders, student_at_risk_alerts } = req.body;
        const result = await query("UPDATE notification_preferences SET email_reminders = COALESCE($1, email_reminders), weekly_report_reminder = COALESCE($2, weekly_report_reminder), maintenance_alerts = COALESCE($3, maintenance_alerts), uaf_expiry_reminders = COALESCE($4, uaf_expiry_reminders), student_at_risk_alerts = COALESCE($5, student_at_risk_alerts) WHERE user_id = $6 RETURNING *", [email_reminders, weekly_report_reminder, maintenance_alerts, uaf_expiry_reminders, student_at_risk_alerts, req.user.id]);
        if (result.rows.length === 0) { const insertResult = await query("INSERT INTO notification_preferences (user_id, email_reminders, weekly_report_reminder, maintenance_alerts, uaf_expiry_reminders, student_at_risk_alerts) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *", [req.user.id, email_reminders, weekly_report_reminder, maintenance_alerts, uaf_expiry_reminders, student_at_risk_alerts]); return res.json(insertResult.rows[0]); }
        res.json(result.rows[0]);
    } catch (error) { res.status(500).json({ error: 'Internal server error' }); }
});

router.get('/system', async (req, res) => {
    try {
        let result = await query("SELECT * FROM system_settings WHERE user_id = $1", [req.user.id]);
        if (result.rows.length === 0) { result = await query("INSERT INTO system_settings (user_id) VALUES ($1) RETURNING *", [req.user.id]); }
        res.json(result.rows[0]);
    } catch (error) { res.status(500).json({ error: 'Internal server error' }); }
});

router.put('/system', async (req, res) => {
    try {
        const { language, theme, timezone } = req.body;
        const result = await query("UPDATE system_settings SET language = COALESCE($1, language), theme = COALESCE($2, theme), timezone = COALESCE($3, timezone) WHERE user_id = $4 RETURNING *", [language, theme, timezone, req.user.id]);
        if (result.rows.length === 0) { const insertResult = await query("INSERT INTO system_settings (user_id, language, theme, timezone) VALUES ($1, $2, $3, $4) RETURNING *", [req.user.id, language || 'en', theme || 'light', timezone || 'Africa/Nairobi']); return res.json(insertResult.rows[0]); }
        res.json(result.rows[0]);
    } catch (error) { res.status(500).json({ error: 'Internal server error' }); }
});

router.get('/export', requireRole('admin', 'super_admin'), async (req, res) => {
    try {
        const archive = archiver('zip', { zlib: { level: 9 } });
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', 'attachment; filename=cisco-data-export.zip');
        archive.pipe(res);
        const centreId = req.user.centre_id;
        const students = await query(centreId ? "SELECT * FROM students WHERE centre_id = $1" : "SELECT * FROM students", centreId ? [centreId] : []);
        archive.append(stringify(students.rows, { header: true }), { name: 'students.csv' });
        await archive.finalize();
    } catch (error) { res.status(500).json({ error: 'Internal server error' }); }
});

router.get('/development', async (req, res) => {
    try {
        const result = await query("SELECT * FROM professional_development WHERE user_id = $1 ORDER BY completion_date DESC", [req.user.id]);
        res.json(result.rows);
    } catch (error) { res.status(500).json({ error: 'Internal server error' }); }
});

router.post('/development', async (req, res) => {
    try {
        const { course_name, provider, hours_completed, status, certificate_url, start_date, completion_date, notes } = req.body;
        const result = await query("INSERT INTO professional_development (user_id, course_name, provider, hours_completed, status, certificate_url, start_date, completion_date, notes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *", [req.user.id, course_name, provider, hours_completed, status || 'in-progress', certificate_url, start_date, completion_date, notes]);
        res.status(201).json(result.rows[0]);
    } catch (error) { res.status(500).json({ error: 'Internal server error' }); }
});

router.delete('/development/:id', async (req, res) => {
    try { await query("DELETE FROM professional_development WHERE id = $1 AND user_id = $2", [req.params.id, req.user.id]); res.json({ message: 'Deleted' }); } catch (error) { res.status(500).json({ error: 'Internal server error' }); }
});

router.post('/import', requireRole('admin', 'super_admin'), async (req, res) => {
    try {
        const { students } = req.body;
        const centreId = req.user.centre_id;
        
        if (students && Array.isArray(students)) {
            for (const s of students) {
                if (!s.first_name || !s.last_name || !s.email) continue;
                
                // Insert or update
                await query(`
                    INSERT INTO students (first_name, last_name, email, phone, stream, status, centre_id)
                    VALUES ($1, $2, $3, $4, $5, $6, $7)
                    ON CONFLICT (email) DO UPDATE 
                    SET first_name = $1, last_name = $2, phone = $4, stream = $5, status = $6
                `, [s.first_name, s.last_name, s.email, s.phone, s.stream, s.status || 'active', centreId]);
            }
        }
        res.json({ message: 'Data imported successfully' });
    } catch (error) {
        console.error('Import error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.delete('/reset', requireRole('admin', 'super_admin'), async (req, res) => {
    try {
        const centreId = req.user.role === 'super_admin' ? null : req.user.centre_id;
        
        if (centreId) {
            await query("DELETE FROM performance_scores WHERE student_id IN (SELECT id FROM students WHERE centre_id = $1)", [centreId]);
            await query("DELETE FROM attendance_records WHERE student_id IN (SELECT id FROM students WHERE centre_id = $1)", [centreId]);
            await query("DELETE FROM student_feedback WHERE student_id IN (SELECT id FROM students WHERE centre_id = $1)", [centreId]);
            await query("DELETE FROM students WHERE centre_id = $1", [centreId]);
            
            await query("DELETE FROM weekly_reports WHERE centre_id = $1", [centreId]);
            await query("DELETE FROM innovation_log WHERE user_id IN (SELECT id FROM users WHERE centre_id = $1)", [centreId]);
            await query("DELETE FROM professional_development WHERE user_id IN (SELECT id FROM users WHERE centre_id = $1)", [centreId]);
        } else {
            await query("TRUNCATE TABLE performance_scores, attendance_records, student_feedback, students, weekly_reports, innovation_log, professional_development CASCADE");
        }

        res.json({ message: 'System data reset successfully' });
    } catch (error) {
        console.error('Reset error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
