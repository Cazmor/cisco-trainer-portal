const express = require('express');
const router = express.Router();
const { query } = require('../database/db');
const { authenticateToken, requireRole } = require('../middleware/auth');
const upload = require('../middleware/upload');
router.use(authenticateToken);

router.get('/scheduled', async (req, res) => {
    try {
        const { date, stream } = req.query;
        let sql = "SELECT cs.*, u.name as instructor_name FROM classes_scheduled cs LEFT JOIN users u ON cs.instructor_id = u.id WHERE 1=1";
        const params = [];
        if (date) { sql += " AND cs.date = $" + (params.length + 1); params.push(date); }
        if (stream) { sql += " AND cs.stream = $" + (params.length + 1); params.push(stream); }
        if (req.user.role === 'admin' || req.user.role === 'instructor') { sql += " AND cs.centre_id = $" + (params.length + 1); params.push(req.user.centre_id); }
        sql += " ORDER BY cs.date DESC, cs.start_time";
        const result = await query(sql, params);
        res.json(result.rows);
    } catch (error) { res.status(500).json({ error: 'Internal server error' }); }
});

router.post('/scheduled', requireRole('admin', 'instructor', 'super_admin'), async (req, res) => {
    try {
        const { class_type, extra_type, stream, date, start_time, end_time, module_number, module_name, topics, instructor_id, notes, status } = req.body;
        const result = await query("INSERT INTO classes_scheduled (class_type, extra_type, stream, centre_id, date, start_time, end_time, module_number, module_name, topics, instructor_id, notes, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *", [class_type || 'cisco', extra_type, stream, req.user.centre_id || req.body.centre_id, date, start_time, end_time, module_number, module_name, topics, instructor_id || req.user.id, notes, status || 'scheduled']);
        res.status(201).json(result.rows[0]);
    } catch (error) { res.status(500).json({ error: 'Internal server error' }); }
});

router.put('/scheduled/:id', requireRole('admin', 'instructor', 'super_admin'), async (req, res) => {
    try {
        const { status, notes } = req.body;
        const result = await query("UPDATE classes_scheduled SET status = COALESCE($1, status), notes = COALESCE($2, notes) WHERE id = $3 RETURNING *", [status, notes, req.params.id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Class not found' });
        res.json(result.rows[0]);
    } catch (error) { res.status(500).json({ error: 'Internal server error' }); }
});

router.delete('/scheduled/:id', requireRole('admin', 'instructor', 'super_admin'), async (req, res) => {
    try { await query("DELETE FROM classes_scheduled WHERE id = $1", [req.params.id]); res.json({ message: 'Class deleted' }); } catch (error) { res.status(500).json({ error: 'Internal server error' }); }
});

router.get('/timetable', async (req, res) => {
    try {
        let sql = "SELECT * FROM timetable_config WHERE is_active = TRUE";
        const params = [];
        if (req.user.role === 'admin' || req.user.role === 'instructor') { sql += " AND centre_id = $" + (params.length + 1); params.push(req.user.centre_id); }
        sql += " ORDER BY CASE day_of_week WHEN 'Monday' THEN 1 WHEN 'Tuesday' THEN 2 WHEN 'Wednesday' THEN 3 WHEN 'Thursday' THEN 4 WHEN 'Friday' THEN 5 WHEN 'Saturday' THEN 6 WHEN 'Sunday' THEN 7 END, start_time";
        const result = await query(sql, params);
        res.json(result.rows);
    } catch (error) { res.status(500).json({ error: 'Internal server error' }); }
});

router.post('/timetable', requireRole('admin', 'instructor', 'super_admin'), async (req, res) => {
    try {
        const { day_of_week, stream, start_time, end_time, session_type } = req.body;
        const result = await query("INSERT INTO timetable_config (day_of_week, stream, centre_id, start_time, end_time, session_type) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *", [day_of_week, stream, req.user.centre_id || req.body.centre_id, start_time, end_time, session_type]);
        res.status(201).json(result.rows[0]);
    } catch (error) { res.status(500).json({ error: 'Internal server error' }); }
});

router.put('/timetable/:id', requireRole('admin', 'instructor', 'super_admin'), async (req, res) => {
    try {
        const { start_time, end_time, session_type, is_active } = req.body;
        const result = await query("UPDATE timetable_config SET start_time = COALESCE($1, start_time), end_time = COALESCE($2, end_time), session_type = COALESCE($3, session_type), is_active = COALESCE($4, is_active) WHERE id = $5 RETURNING *", [start_time, end_time, session_type, is_active, req.params.id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
        res.json(result.rows[0]);
    } catch (error) { res.status(500).json({ error: 'Internal server error' }); }
});

router.get('/delivery-plan', async (req, res) => {
    try {
        const { term, stream } = req.query;
        let sql = "SELECT * FROM delivery_plans WHERE 1=1";
        const params = [];
        if (term) { sql += " AND term = $" + (params.length + 1); params.push(term); }
        if (stream) { sql += " AND stream = $" + (params.length + 1); params.push(stream); }
        if (req.user.role === 'admin' || req.user.role === 'instructor') { sql += " AND centre_id = $" + (params.length + 1); params.push(req.user.centre_id); }
        sql += " ORDER BY term, stream";
        const result = await query(sql, params);
        res.json(result.rows);
    } catch (error) { res.status(500).json({ error: 'Internal server error' }); }
});

router.put('/delivery-plan/:id', requireRole('admin', 'instructor', 'super_admin'), async (req, res) => {
    try {
        const { completed_hours, modules_completed, saturday_intensives, status, notes } = req.body;
        const result = await query("UPDATE delivery_plans SET completed_hours = COALESCE($1, completed_hours), modules_completed = COALESCE($2, modules_completed), saturday_intensives = COALESCE($3, saturday_intensives), status = COALESCE($4, status), notes = COALESCE($5, notes) WHERE id = $6 RETURNING *", [completed_hours, modules_completed, saturday_intensives, status, notes, req.params.id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
        res.json(result.rows[0]);
    } catch (error) { res.status(500).json({ error: 'Internal server error' }); }
});

router.get('/innovation', async (req, res) => {
    try {
        let sql = "SELECT il.*, u.name as created_by_name FROM innovation_log il LEFT JOIN users u ON il.created_by = u.id WHERE 1=1";
        const params = [];
        if (req.user.role === 'admin' || req.user.role === 'instructor') { sql += " AND il.centre_id = $" + (params.length + 1); params.push(req.user.centre_id); }
        sql += " ORDER BY il.created_at DESC";
        const result = await query(sql, params);
        res.json(result.rows);
    } catch (error) { res.status(500).json({ error: 'Internal server error' }); }
});

router.post('/innovation', requireRole('admin', 'instructor', 'super_admin'), async (req, res) => {
    try {
        const { term, methodology_name, description, documented_impact, performance_before, performance_after, shared_with_manager, endorsement_received } = req.body;
        const result = await query("INSERT INTO innovation_log (centre_id, term, methodology_name, description, documented_impact, performance_before, performance_after, shared_with_manager, endorsement_received, created_by) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *", [req.user.centre_id || req.body.centre_id, term, methodology_name, description, documented_impact, performance_before, performance_after, shared_with_manager, endorsement_received, req.user.id]);
        res.status(201).json(result.rows[0]);
    } catch (error) { res.status(500).json({ error: 'Internal server error' }); }
});

router.get('/evidence', async (req, res) => {
    try {
        const { class_id } = req.query;
        let sql = "SELECT * FROM class_evidence_photos WHERE 1=1";
        const params = [];
        if (class_id) { sql += " AND class_id = $" + (params.length + 1); params.push(class_id); }
        sql += " ORDER BY uploaded_at DESC";
        const result = await query(sql, params);
        res.json(result.rows);
    } catch (error) { res.status(500).json({ error: 'Internal server error' }); }
});

router.post('/evidence', requireRole('admin', 'instructor', 'super_admin'), upload.single('evidence'), async (req, res) => {
    try {
        const { class_id, photo_type, caption } = req.body;
        if (!req.file) return res.status(400).json({ error: 'Photo required' });
        const photo_url = '/uploads/evidence/' + req.file.filename;
        const result = await query("INSERT INTO class_evidence_photos (class_id, photo_type, photo_url, caption) VALUES ($1, $2, $3, $4) RETURNING *", [class_id, photo_type || 'during', photo_url, caption]);
        res.status(201).json(result.rows[0]);
    } catch (error) { res.status(500).json({ error: 'Internal server error' }); }
});

module.exports = router;

