const express = require('express');
const router = express.Router();
const { query } = require('../database/db');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.use(authenticateToken);
router.use(requireRole('super_admin'));

// Get instructor intel with risk scores
router.get('/instructors', async (req, res) => {
    try {
        const result = await query(
            "SELECT u.id, u.name, u.email, u.centre_id, c.name as centre_name, im.kpi_out_of_50, im.risk_score_0_100, im.evidence_age_days_max, im.risk_factors FROM users u LEFT JOIN centres c ON u.centre_id = c.id LEFT JOIN instructor_metrics_daily im ON u.id = im.instructor_id AND im.date = CURRENT_DATE WHERE u.role = 'instructor' ORDER BY im.risk_score_0_100 DESC NULLS LAST"
        );
        res.json(result.rows);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

// Get active alerts
router.get('/alerts', async (req, res) => {
    try {
        const result = await query("SELECT * FROM surveillance_alerts WHERE status != 'resolved' ORDER BY created_at DESC LIMIT 50");
        res.json(result.rows);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

// Get centre metrics
router.get('/centres', async (req, res) => {
    try {
        const result = await query("SELECT c.*, cm.centre_health_0_100, cm.avg_kpi_out_of_50 FROM centres c LEFT JOIN centre_metrics_daily cm ON c.id = cm.centre_id AND cm.date = CURRENT_DATE");
        res.json(result.rows);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

// Get forensic events
router.get('/forensics', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const result = await query("SELECT * FROM forensic_events ORDER BY event_time DESC LIMIT $1", [limit]);
        res.json(result.rows);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

// Resolve alert
router.put('/alerts/:id', async (req, res) => {
    try {
        const result = await query(
            "UPDATE surveillance_alerts SET status = $1, resolved_at = CASE WHEN $1 = 'resolved' THEN NOW() ELSE resolved_at END WHERE id = $2 RETURNING *",
            [req.body.status || 'resolved', req.params.id]
        );
        res.json(result.rows[0]);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

// Create alert
router.post('/alerts', async (req, res) => {
    try {
        const result = await query(
            "INSERT INTO surveillance_alerts (alert_type, category, message, instructor_id, centre_id) VALUES ($1, $2, $3, $4, $5) RETURNING *",
            [req.body.alert_type, req.body.category, req.body.message, req.body.instructor_id, req.body.centre_id]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

module.exports = router;
