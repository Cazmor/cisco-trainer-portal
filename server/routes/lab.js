const express = require('express');
const router = express.Router();
const { query } = require('../database/db');
const { authenticateToken, requireRole } = require('../middleware/auth');
router.use(authenticateToken);

router.get('/status', async (req, res) => {
    try {
        var sql = 'SELECT * FROM lab_workstations WHERE 1=1';
        var params = [];
        if (req.user.role === 'admin' || req.user.role === 'instructor') { sql += ' AND centre_id = $' + (params.length + 1); params.push(req.user.centre_id); }
        sql += ' ORDER BY workstation_number';
        var result = await query(sql, params);
        var total = result.rows.length;
        var functional = result.rows.filter(function(w){return w.status==='functional';}).length;
        var partial = result.rows.filter(function(w){return w.status==='partial';}).length;
        var down = result.rows.filter(function(w){return w.status==='down';}).length;
        res.json({ workstations: result.rows, summary: { total: total, functional: functional, partial: partial, down: down, health_percentage: total>0?Math.round((functional/total)*100):0 } });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

router.put('/workstation/:id', requireRole('admin', 'instructor', 'super_admin'), async (req, res) => {
    try {
        var result = await query('UPDATE lab_workstations SET status = COALESCE($1, status), cpu_status = COALESCE($2, cpu_status), monitor_status = COALESCE($3, monitor_status), keyboard_status = COALESCE($4, keyboard_status), mouse_status = COALESCE($5, mouse_status), network_status = COALESCE($6, network_status), notes = COALESCE($7, notes), last_checked = CURRENT_DATE WHERE id = $8 RETURNING *', [req.body.status, req.body.cpu_status, req.body.monitor_status, req.body.keyboard_status, req.body.mouse_status, req.body.network_status, req.body.notes, req.params.id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
        res.json(result.rows[0]);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

router.get('/laptops', async (req, res) => {
    try {
        var sql = 'SELECT l.*, s.first_name, s.last_name FROM lab_laptops l LEFT JOIN students s ON l.assigned_to = s.id WHERE 1=1';
        var params = [];
        if (req.user.role === 'admin' || req.user.role === 'instructor') { sql += ' AND l.centre_id = $' + (params.length + 1); params.push(req.user.centre_id); }
        sql += ' ORDER BY l.id';
        var result = await query(sql, params);
        res.json(result.rows);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/laptops', requireRole('admin', 'instructor', 'super_admin'), async (req, res) => {
    try {
        var brand = req.body.brand || 'Unknown';
        var model = req.body.model || '';
        var sn = req.body.serial_number || ('SN-' + Date.now());
        var status = req.body.status || 'available';
        var assignedTo = req.body.assigned_to || null;
        var notes = req.body.notes || '';
        var result = await query('INSERT INTO lab_laptops (brand, model, serial_number, centre_id, status, assigned_to, notes) VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT (serial_number) DO UPDATE SET brand = EXCLUDED.brand, model = EXCLUDED.model, status = EXCLUDED.status, assigned_to = EXCLUDED.assigned_to, notes = EXCLUDED.notes RETURNING *', [brand, model, sn, req.user.centre_id || req.body.centre_id, status, assignedTo, notes]);
        res.status(201).json(result.rows[0]);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

router.put('/laptops/:id', requireRole('admin', 'instructor', 'super_admin'), async (req, res) => {
    try {
        var result = await query('UPDATE lab_laptops SET status = COALESCE($1, status), notes = COALESCE($2, notes) WHERE id = $3 RETURNING *', [req.body.status, req.body.notes, req.params.id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
        res.json(result.rows[0]);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

router.delete('/laptops/:id', requireRole('admin', 'instructor', 'super_admin'), async (req, res) => {
    try { await query('DELETE FROM lab_laptops WHERE id = $1', [req.params.id]); res.json({ message: 'Deleted' }); } catch (error) { res.status(500).json({ error: error.message }); }
});

router.get('/equipment', async (req, res) => {
    try {
        var sql = 'SELECT * FROM lab_equipment WHERE 1=1';
        var params = [];
        if (req.user.role === 'admin' || req.user.role === 'instructor') { sql += ' AND centre_id = $' + (params.length + 1); params.push(req.user.centre_id); }
        sql += ' ORDER BY id';
        var result = await query(sql, params);
        res.json(result.rows);
    } catch (error) { console.error('Equipment GET error:', error.message); res.status(500).json({ error: error.message }); }
});

router.post('/equipment', requireRole('admin', 'instructor', 'super_admin'), async (req, res) => {
    try {
        var et = req.body.equipment_type || 'Unknown';
        var model = req.body.model || '';
        var sn = req.body.serial_number || ('EQ-' + Date.now() + '-' + Math.random().toString(36).substr(2,5));
        var location = req.body.location || '';
        var status = req.body.status || 'available';
        var notes = req.body.notes || '';
        var result = await query('INSERT INTO lab_equipment (equipment_type, brand, model, serial_number, centre_id, quantity, status, location, notes) VALUES ($1,$2,$3,$4,$5,1,$6,$7,$8) ON CONFLICT (serial_number) DO UPDATE SET equipment_type = EXCLUDED.equipment_type, brand = EXCLUDED.brand, model = EXCLUDED.model, status = EXCLUDED.status, location = EXCLUDED.location, notes = EXCLUDED.notes RETURNING *', [et, '', model, sn, req.user.centre_id || req.body.centre_id, status, location, notes]);
        res.status(201).json(result.rows[0]);
    } catch (error) { console.error('Equipment POST error:', error.message); res.status(500).json({ error: error.message }); }
});

router.put('/equipment/:id', requireRole('admin', 'instructor', 'super_admin'), async (req, res) => { try { var result = await query('UPDATE lab_equipment SET status = COALESCE($1, status), notes = COALESCE($2, notes) WHERE id = $3 RETURNING *', [req.body.status, req.body.notes, req.params.id]); if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' }); res.json(result.rows[0]); } catch (error) { res.status(500).json({ error: error.message }); } });

router.delete('/equipment/:id', requireRole('admin', 'instructor', 'super_admin'), async (req, res) => {
    try { await query('DELETE FROM lab_equipment WHERE id = $1', [req.params.id]); res.json({ message: 'Deleted' }); } catch (error) { res.status(500).json({ error: error.message }); }
});

router.get('/other-devices', async (req, res) => {
    try {
        var sql = 'SELECT * FROM lab_other_devices WHERE 1=1';
        var params = [];
        if (req.user.role === 'admin' || req.user.role === 'instructor') { sql += ' AND centre_id = $' + (params.length + 1); params.push(req.user.centre_id); }
        sql += ' ORDER BY id';
        var result = await query(sql, params);
        res.json(result.rows);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

router.delete('/other-devices/:id', requireRole('admin', 'instructor', 'super_admin'), async (req, res) => { try { await query('DELETE FROM lab_other_devices WHERE id = $1', [req.params.id]); res.json({ message: 'Deleted' }); } catch (error) { res.status(500).json({ error: error.message }); } });

router.post('/other-devices', requireRole('admin', 'instructor', 'super_admin'), async (req, res) => {
    try {
        var dt = req.body.device_type || 'Unknown';
        var model = req.body.model || '';
        var sn = req.body.serial_number || ('DEV-' + Date.now());
        var location = req.body.location || '';
        var status = req.body.status || 'available';
        var notes = req.body.notes || '';
        var result = await query('INSERT INTO lab_other_devices (device_type, brand, model, serial_number, centre_id, status, location, notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT (serial_number) DO UPDATE SET device_type = EXCLUDED.device_type, brand = EXCLUDED.brand, model = EXCLUDED.model, status = EXCLUDED.status, location = EXCLUDED.location, notes = EXCLUDED.notes RETURNING *', [dt, '', model, sn, req.user.centre_id || req.body.centre_id, status, location, notes]);
        res.status(201).json(result.rows[0]);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

router.get('/maintenance', async (req, res) => {
    try {
        var sql = 'SELECT ml.*, u.name as reported_by_name FROM maintenance_logs ml LEFT JOIN users u ON ml.reported_by = u.id WHERE 1=1';
        var params = [];
        if (req.user.role === 'admin' || req.user.role === 'instructor') { sql += ' AND ml.centre_id = $' + (params.length + 1); params.push(req.user.centre_id); }
        sql += ' ORDER BY ml.date_reported DESC';
        var result = await query(sql, params);
        res.json(result.rows);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/maintenance', requireRole('admin', 'instructor', 'super_admin'), async (req, res) => {
    try {
        var result = await query('INSERT INTO maintenance_logs (device_type, device_id, centre_id, issue_description, priority, reported_by) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *', [req.body.device_type, req.body.device_id || 1, req.user.centre_id, req.body.issue_description, req.body.priority || 'medium', req.user.id]);
        res.status(201).json(result.rows[0]);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

router.delete('/maintenance/:id', requireRole('admin', 'instructor', 'super_admin'), async (req, res) => { try { await query('DELETE FROM maintenance_logs WHERE id = $1', [req.params.id]); res.json({ message: 'Deleted' }); } catch (error) { res.status(500).json({ error: error.message }); } });

router.put('/maintenance/:id', requireRole('admin', 'instructor', 'super_admin'), async (req, res) => {
    try {
        var result = await query('UPDATE maintenance_logs SET status = COALESCE($1, status), date_resolved = CASE WHEN $1 = $4 THEN CURRENT_DATE ELSE date_resolved END WHERE id = $2 RETURNING *', [req.body.status, req.params.id, req.body.resolution_notes, 'resolved']);
        res.json(result.rows[0]);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

router.get('/preventive', async (req, res) => {
    try {
        var sql = 'SELECT * FROM preventive_maintenance WHERE 1=1';
        var params = [];
        if (req.user.role === 'admin' || req.user.role === 'instructor') { sql += ' AND centre_id = $' + (params.length + 1); params.push(req.user.centre_id); }
        sql += ' ORDER BY next_due ASC';
        var result = await query(sql, params);
        res.json(result.rows);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

router.delete('/preventive/:id', requireRole('admin', 'instructor', 'super_admin'), async (req, res) => { try { await query('DELETE FROM preventive_maintenance WHERE id = $1', [req.params.id]); res.json({ message: 'Deleted' }); } catch (error) { res.status(500).json({ error: error.message }); } });

router.post('/preventive', requireRole('admin', 'instructor', 'super_admin'), async (req, res) => {
    try {
        var result = await query('INSERT INTO preventive_maintenance (centre_id, device_type, device_id, task_description, frequency, next_due) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *', [req.user.centre_id, req.body.device_type, req.body.device_id || 0, req.body.task_description, req.body.frequency, req.body.next_due]);
        res.status(201).json(result.rows[0]);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

module.exports = router;
