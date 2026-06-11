const express = require('express');
const router = express.Router();
const { query } = require('../database/db');
const { authenticateToken, requireRole } = require('../middleware/auth');
const bcrypt = require('bcryptjs');

router.use(authenticateToken);
router.use(requireRole('super_admin', 'admin'));

router.get('/centres', async (req, res) => {
    try {
        const result = await query("SELECT c.*, COUNT(DISTINCT s.id) as student_count, COUNT(DISTINCT u.id) as user_count FROM centres c LEFT JOIN students s ON c.id = s.centre_id LEFT JOIN users u ON c.id = u.centre_id GROUP BY c.id ORDER BY c.name");
        res.json(result.rows);
    } catch (error) {
        console.error('Get centres error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/centres', async (req, res) => {
    try {
        const { name, location, admin_name, admin_email, admin_password } = req.body;
        if (!name || !location) {
            return res.status(400).json({ error: 'Centre name and location are required' });
        }
        const centreResult = await query("INSERT INTO centres (name, location, status) VALUES ($1, $2, $3) RETURNING id", [name, location, 'active']);
        const centreId = centreResult.rows[0].id;
        if (admin_email && admin_password) {
            const salt = await bcrypt.genSalt(10);
            const password_hash = await bcrypt.hash(admin_password, salt);
            await query("INSERT INTO users (name, email, password_hash, phone, centre_id, role, status) VALUES ($1, $2, $3, $4, $5, $6, $7)", [admin_name || name + ' Admin', admin_email, password_hash, null, centreId, 'admin', 'active']);
        }
        res.status(201).json({ message: 'Centre created successfully', centre: centreResult.rows[0] });
    } catch (error) {
        console.error('Create centre error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.delete('/centres/:id', async (req, res) => {
    try {
        await query("DELETE FROM centres WHERE id = $1", [req.params.id]);
        res.json({ message: 'Centre deleted successfully' });
    } catch (error) {
        console.error('Delete centre error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/centres/:id', async (req, res) => {
    try {
        const centreResult = await query("SELECT * FROM centres WHERE id = $1", [req.params.id]);
        if (centreResult.rows.length === 0) {
            return res.status(404).json({ error: 'Centre not found' });
        }
        const centre = centreResult.rows[0];
        const studentsResult = await query("SELECT COUNT(*) as count FROM students WHERE centre_id = $1", [req.params.id]);
        const usersResult = await query("SELECT COUNT(*) as count FROM users WHERE centre_id = $1", [req.params.id]);
        centre.student_count = parseInt(studentsResult.rows[0].count);
        centre.user_count = parseInt(usersResult.rows[0].count);
        res.json(centre);
    } catch (error) {
        console.error('Get centre details error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/users', async (req, res) => {
    try {
        const result = await query("SELECT u.*, c.name as centre_name FROM users u LEFT JOIN centres c ON u.centre_id = c.id ORDER BY u.created_at DESC");
        res.json(result.rows);
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/pending-registrations', async (req, res) => {
    try {
        const result = await query("SELECT pr.*, c.name as centre_name FROM pending_registrations pr LEFT JOIN centres c ON pr.centre_id = c.id ORDER BY pr.created_at DESC");
        res.json(result.rows);
    } catch (error) {
        console.error('Get pending registrations error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/approve-registration/:id', async (req, res) => {
    try {
        const pendingResult = await query("SELECT * FROM pending_registrations WHERE id = $1", [req.params.id]);
        if (pendingResult.rows.length === 0) {
            return res.status(404).json({ error: 'Registration not found' });
        }
        const pending = pendingResult.rows[0];
        await query("INSERT INTO users (name, email, password_hash, phone, centre_id, role, status) VALUES ($1, $2, $3, $4, $5, $6, $7)", [pending.name, pending.email, pending.password_hash, pending.phone, pending.centre_id, pending.role, 'active']);
        await query("DELETE FROM pending_registrations WHERE id = $1", [req.params.id]);
        res.json({ message: 'Registration approved successfully' });
    } catch (error) {
        console.error('Approve registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.delete('/reject-registration/:id', async (req, res) => {
    try {
        await query("DELETE FROM pending_registrations WHERE id = $1", [req.params.id]);
        res.json({ message: 'Registration rejected' });
    } catch (error) {
        console.error('Reject registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/dashboard', async (req, res) => {
    try {
        const totalCentres = await query("SELECT COUNT(*) as count FROM centres");
        const totalStudents = await query("SELECT COUNT(*) as count FROM students");
        const totalUsers = await query("SELECT COUNT(*) as count FROM users");
        const pendingRegistrations = await query("SELECT COUNT(*) as count FROM pending_registrations");
        res.json({
            total_centres: parseInt(totalCentres.rows[0].count),
            total_students: parseInt(totalStudents.rows[0].count),
            total_users: parseInt(totalUsers.rows[0].count),
            pending_registrations: parseInt(pendingRegistrations.rows[0].count)
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


router.get('/intel', async (req, res) => {
    try {
        const type = req.query.type;
        if (type === 'instructors') {
            const result = await query(
                "SELECT u.id, u.name, u.email, u.centre_id, c.name as centre_name, im.kpi_out_of_50, im.risk_score_0_100, im.evidence_age_days_max, im.risk_factors FROM users u LEFT JOIN centres c ON u.centre_id = c.id LEFT JOIN instructor_metrics_daily im ON u.id = im.instructor_id AND im.date = CURRENT_DATE WHERE u.role = $1 ORDER BY im.risk_score_0_100 DESC NULLS LAST",
                ['instructor']
            );
            res.json(result.rows);
        } else if (type === 'alerts') {
            const result = await query("SELECT * FROM surveillance_alerts WHERE status != 'resolved' ORDER BY created_at DESC LIMIT 50");
            res.json(result.rows);
        } else if (type === 'centres') {
            const result = await query("SELECT c.*, cm.centre_health_0_100, cm.avg_kpi_out_of_50 FROM centres c LEFT JOIN centre_metrics_daily cm ON c.id = cm.centre_id AND cm.date = CURRENT_DATE");
            res.json(result.rows);
        } else {
            res.json([]);
        }
    } catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/intel/alerts', requireRole('super_admin'), async (req, res) => {
    try {
        const result = await query("INSERT INTO surveillance_alerts (alert_type, category, message, instructor_id, centre_id) VALUES ($1, $2, $3, $4, $5) RETURNING *", [req.body.alert_type, req.body.category, req.body.message, req.body.instructor_id, req.body.centre_id]);
        res.status(201).json(result.rows[0]);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

router.put('/intel/alerts/:id', requireRole('super_admin'), async (req, res) => {
    try {
        const result = await query("UPDATE surveillance_alerts SET status = $1, resolved_at = CASE WHEN $1 = 'resolved' THEN NOW() ELSE resolved_at END WHERE id = $2 RETURNING *", [req.body.status, req.params.id]);
        res.json(result.rows[0]);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

router.delete('/users/:id', requireRole('super_admin'), async (req, res) => {
    try {
        await query('DELETE FROM users WHERE id = $1', [req.params.id]);
        res.json({ message: 'User deleted' });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

module.exports = router;
