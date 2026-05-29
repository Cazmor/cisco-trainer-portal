const express = require('express');
const router = express.Router();
const { query } = require('../database/db');
const { authenticateToken, requireRole } = require('../middleware/auth');
router.use(authenticateToken);

router.get('/', async (req, res) => {
    try {
        const { date, stream } = req.query;
        const attendanceDate = date || new Date().toISOString().split('T')[0];
        let sql = "SELECT ar.*, s.first_name, s.last_name, s.stream FROM attendance_records ar JOIN students s ON ar.student_id = s.id WHERE ar.date = $1";
        const params = [attendanceDate];
        if (req.user.role === 'admin' || req.user.role === 'instructor') { sql += " AND s.centre_id = $" + (params.length + 1); params.push(req.user.centre_id); }
        if (stream && stream.trim()) { sql += " AND s.stream = $" + (params.length + 1); params.push(stream); }
        sql += " ORDER BY s.first_name, s.last_name";
        const result = await query(sql, params);
        res.json(result.rows);
    } catch (error) { console.error('GET attendance error:', error); res.status(500).json({ error: error.message }); }
});

router.get('/matrix', async (req, res) => {
    try {
        const { start_date, end_date, stream } = req.query;
        let sql = "SELECT s.id, s.first_name, s.last_name, s.stream, ar.date, ar.status FROM students s LEFT JOIN attendance_records ar ON s.id = ar.student_id AND ar.date BETWEEN $1 AND $2 WHERE s.status = 'active'";
        const params = [start_date, end_date];
        if (req.user.role === 'admin' || req.user.role === 'instructor') { sql += " AND s.centre_id = $" + (params.length + 1); params.push(req.user.centre_id); }
        if (stream && stream.trim()) { sql += " AND s.stream = $" + (params.length + 1); params.push(stream); }
        sql += " ORDER BY s.first_name, s.last_name, ar.date";
        const result = await query(sql, params);
        res.json(result.rows);
    } catch (error) { console.error('GET matrix error:', error); res.status(500).json({ error: error.message }); }
});

router.post('/', requireRole('admin', 'instructor', 'super_admin'), async (req, res) => {
    try {
        const { student_id, date, status, absence_reason, notes } = req.body;
        if (!student_id || !date || !status) return res.status(400).json({ error: 'student_id, date, and status required' });
        
        const timeIn = status === 'P' ? new Date().toTimeString().split(' ')[0] : null;
        
        const result = await query(
            "INSERT INTO attendance_records (student_id, date, status, absence_reason, time_in, notes, marked_by) VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (student_id, date) DO UPDATE SET status = $3, absence_reason = $4, time_in = $5, notes = $6, marked_by = $7 RETURNING *",
            [student_id, date, status, absence_reason || null, timeIn, notes || null, req.user.id]
        );
        res.json(result.rows[0]);
    } catch (error) { console.error('POST attendance error:', error); res.status(500).json({ error: error.message }); }
});

router.post('/bulk', requireRole('admin', 'instructor', 'super_admin'), async (req, res) => {
    try {
        const { date, stream } = req.body;
        if (!date) return res.status(400).json({ error: 'Date is required' });
        
        let studentsQuery = "SELECT id FROM students WHERE status = 'active'";
        const params = [];
        if (req.user.role === 'admin' || req.user.role === 'instructor') { studentsQuery += " AND centre_id = $" + (params.length + 1); params.push(req.user.centre_id); }
        if (stream && stream.trim()) { studentsQuery += " AND stream = $" + (params.length + 1); params.push(stream); }
        
        const students = await query(studentsQuery, params);
        const timeIn = new Date().toTimeString().split(' ')[0];
        let marked = 0;
        for (const student of students.rows) {
            await query(
                "INSERT INTO attendance_records (student_id, date, status, time_in, marked_by) VALUES ($1, $2, 'P', $3, $4) ON CONFLICT (student_id, date) DO UPDATE SET status = 'P', time_in = $3, marked_by = $4",
                [student.id, date, timeIn, req.user.id]
            );
            marked++;
        }
        res.json({ message: 'All marked present', count: marked });
    } catch (error) { console.error('BULK error:', error); res.status(500).json({ error: error.message }); }
});

router.get('/stats', async (req, res) => {
    try {
        const { start_date, end_date } = req.query;
        let sql = "SELECT s.stream, COUNT(*) as total, COUNT(CASE WHEN ar.status = 'P' THEN 1 END) as present, ROUND(COUNT(CASE WHEN ar.status = 'P' THEN 1 END)::DECIMAL / COUNT(*) * 100, 2) as percentage FROM attendance_records ar JOIN students s ON ar.student_id = s.id WHERE ar.date BETWEEN $1 AND $2";
        const params = [start_date, end_date];
        if (req.user.role === 'admin' || req.user.role === 'instructor') { sql += " AND s.centre_id = $" + (params.length + 1); params.push(req.user.centre_id); }
        sql += " GROUP BY s.stream ORDER BY s.stream";
        const result = await query(sql, params);
        res.json(result.rows);
    } catch (error) { console.error('STATS error:', error); res.status(500).json({ error: error.message }); }
});

module.exports = router;
