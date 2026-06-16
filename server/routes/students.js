const express = require('express');
const router = express.Router();
const { query } = require('../database/db');
const { authenticateToken, requireRole } = require('../middleware/auth');
const upload = require('../middleware/upload');
const fs = require('fs');

router.use(authenticateToken);

router.get('/', async (req, res) => {
    try {
        var stream = req.query.stream, search = req.query.search, status = req.query.status;
        var sql = "SELECT s.*, c.name as centre_name, (SELECT AVG(total_score) FROM performance_scores WHERE student_id = s.id) as avg_score, (SELECT (COUNT(*) FILTER (WHERE status = 'P') * 100.0 / NULLIF(COUNT(*), 0)) FROM attendance_records WHERE student_id = s.id) as attendance_rate FROM students s LEFT JOIN centres c ON s.centre_id = c.id WHERE 1=1";
        var params = [], pc = 0;
        if (req.user.role === 'admin' || req.user.role === 'instructor') { pc++; sql += " AND s.centre_id = $" + pc; params.push(req.user.centre_id); }
        if (stream) { pc++; sql += " AND s.stream = $" + pc; params.push(stream); }
        if (status) { pc++; sql += " AND s.status = $" + pc; params.push(status); }
        if (search) { pc++; sql += " AND (s.first_name ILIKE $" + pc + " OR s.last_name ILIKE $" + pc + " OR s.email ILIKE $" + pc + ")"; params.push('%' + search + '%'); }
        sql += " ORDER BY s.first_name, s.last_name";
        var result = await query(sql, params);
        res.json(result.rows);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/:id', async (req, res) => {
    try {
        var result = await query("SELECT s.*, c.name as centre_name, (SELECT AVG(total_score) FROM performance_scores WHERE student_id = s.id) as avg_score, (SELECT (COUNT(*) FILTER (WHERE status = 'P') * 100.0 / NULLIF(COUNT(*), 0)) FROM attendance_records WHERE student_id = s.id) as attendance_rate FROM students s LEFT JOIN centres c ON s.centre_id = c.id WHERE s.id = $1", [req.params.id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
        var student = result.rows[0];
        var att = await query("SELECT * FROM attendance_records WHERE student_id = $1 ORDER BY date DESC LIMIT 30", [req.params.id]);
        var perf = await query("SELECT * FROM performance_scores WHERE student_id = $1 ORDER BY module_number", [req.params.id]);
        student.attendance = att.rows;
        student.performance = perf.rows;
        res.json(student);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/', requireRole('admin', 'instructor', 'super_admin'), async (req, res) => {
    try {
        var d = req.body;
        if (!d.first_name || !d.last_name) return res.status(400).json({ error: 'First and last name required' });
        var cid = req.user.centre_id || d.centre_id;
        var result = await query("INSERT INTO students (first_name,last_name,email,phone,stream,centre_id,emergency_contact,notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *", [d.first_name, d.last_name, d.email, d.phone, d.stream, cid, d.emergency_contact, d.notes]);
        res.status(201).json(result.rows[0]);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/:id', requireRole('admin', 'instructor', 'super_admin'), async (req, res) => {
    try {
        var d = req.body;
        var result = await query("UPDATE students SET first_name=COALESCE($1,first_name),last_name=COALESCE($2,last_name),email=COALESCE($3,email),phone=COALESCE($4,phone),stream=COALESCE($5,stream),status=COALESCE($6,status),emergency_contact=COALESCE($7,emergency_contact),notes=COALESCE($8,notes),updated_at=NOW() WHERE id=$9 RETURNING *", [d.first_name, d.last_name, d.email, d.phone, d.stream, d.status, d.emergency_contact, d.notes, req.params.id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
        res.json(result.rows[0]);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/:id', requireRole('admin', 'super_admin'), async (req, res) => {
    try { await query("DELETE FROM students WHERE id=$1", [req.params.id]); res.json({ message: 'Deleted' }); } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/bulk-import', requireRole('admin', 'instructor', 'super_admin'), upload.single('csv'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'CSV file required' });
        var content = fs.readFileSync(req.file.path, 'utf8');
        if (content.charCodeAt(0) === 0xFEFF) content = content.slice(1);
        
        var lines = content.split(/\r?\n/).filter(function(l) { return l.trim().length > 0; });
        if (lines.length < 2) return res.status(400).json({ error: 'Need header + data' });
        
        var headers = lines[0].split(',').map(function(h) { return h.trim().toLowerCase().replace(/["']/g,'').replace(/\s+/g,'_'); });
        
        var idxFirst = -1, idxLast = -1, idxEmail = -1, idxPhone = -1, idxStream = -1;
        for (var i = 0; i < headers.length; i++) {
            var h = headers[i];
            if (h.includes('first') && h.includes('name')) idxFirst = i;
            if (h.includes('last') && h.includes('name')) idxLast = i;
            if (h.includes('email')) idxEmail = i;
            if (h.includes('phone')) idxPhone = i;
            if (h.includes('stream')) idxStream = i;
        }
        
        if (idxFirst < 0 || idxLast < 0) {
            return res.status(400).json({ error: 'Need first_name and last_name columns. Found: ' + headers.join(', ') });
        }
        
        var imported = 0, errors = [];
        var cid = req.user.centre_id || req.body.centre_id;
        
        for (var j = 1; j < lines.length; j++) {
            var cols = lines[j].split(',');
            if (cols.length < 2) continue;
            
            var fn = String(cols[idxFirst] || '').trim().replace(/["']/g, '');
            var ln = String(cols[idxLast] || '').trim().replace(/["']/g, '');
            var em = idxEmail >= 0 ? String(cols[idxEmail] || '').trim().replace(/["']/g, '') : '';
            var ph = idxPhone >= 0 ? String(cols[idxPhone] || '').trim().replace(/["']/g, '') : '';
            var st = idxStream >= 0 ? String(cols[idxStream] || '').trim().replace(/["']/g, '') : '';
            
            if (!fn || !ln) continue;
            if (em && !em.includes('@')) em = '';
            
            try {
                await query("INSERT INTO students (first_name,last_name,email,phone,stream,centre_id,status) VALUES ($1,$2,$3,$4,$5,$6,'active') ON CONFLICT DO NOTHING", [fn, ln, em || null, ph || null, st || null, cid]);
                imported++;
            } catch (err) {
                errors.push({ row: j, error: err.message, data: fn + ' ' + ln });
            }
        }
        res.json({ message: 'Import done', imported: imported, errors: errors.slice(0, 5), total_errors: errors.length });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
