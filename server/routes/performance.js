const express = require('express');
const router = express.Router();
const { query } = require('../database/db');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', async (req, res) => {
    try {
        const { module_number, stream } = req.query;
        let sql = "SELECT ps.*, s.first_name, s.last_name, s.stream FROM performance_scores ps JOIN students s ON ps.student_id = s.id WHERE 1=1";
        const params = [];
        let paramCount = 0;
        if (module_number) {
            paramCount++;
            sql += " AND ps.module_number = $" + paramCount;
            params.push(module_number);
        }
        if (stream) {
            paramCount++;
            sql += " AND s.stream = $" + paramCount;
            params.push(stream);
        }
        if (req.user.role === 'admin' || req.user.role === 'instructor') {
            paramCount++;
            sql += " AND s.centre_id = $" + paramCount;
            params.push(req.user.centre_id);
        }
        sql += " ORDER BY s.first_name, s.last_name, ps.module_number";
        const result = await query(sql, params);
        res.json(result.rows);
    } catch (error) {
        console.error('Get performance error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/', requireRole('admin', 'instructor', 'super_admin'), async (req, res) => {
    try {
        const { student_id, module_number, module_name, quiz_score, practical_score, exam_score } = req.body;
        if (!student_id || !module_number) {
            return res.status(400).json({ error: 'Student ID and module number are required' });
        }
        const result = await query(
            "INSERT INTO performance_scores (student_id, module_number, module_name, quiz_score, practical_score, exam_score) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (student_id, module_number) DO UPDATE SET module_name = $3, quiz_score = $4, practical_score = $5, exam_score = $6, updated_at = NOW() RETURNING *",
            [student_id, module_number, module_name, quiz_score, practical_score, exam_score]
        );
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Save score error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/bulk', requireRole('admin', 'instructor', 'super_admin'), async (req, res) => {
    try {
        const { scores } = req.body;
        if (!scores || !Array.isArray(scores)) {
            return res.status(400).json({ error: 'Scores array is required' });
        }
        let saved = 0;
        for (const score of scores) {
            await query(
                "INSERT INTO performance_scores (student_id, module_number, module_name, quiz_score, practical_score, exam_score) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (student_id, module_number) DO UPDATE SET quiz_score = $4, practical_score = $5, exam_score = $6, updated_at = NOW()",
                [score.student_id, score.module_number, score.module_name, score.quiz_score, score.practical_score, score.exam_score]
            );
            saved++;
        }
        res.json({ message: 'Scores saved successfully', count: saved });
    } catch (error) {
        console.error('Bulk save error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/summary', async (req, res) => {
    try {
        let sql = "SELECT s.stream, AVG(ps.total_score) as avg_score, MIN(ps.total_score) as min_score, MAX(ps.total_score) as max_score, COUNT(*) as total_entries FROM performance_scores ps JOIN students s ON ps.student_id = s.id WHERE 1=1";
        const params = [];
        if (req.user.role === 'admin' || req.user.role === 'instructor') {
            sql += " AND s.centre_id = $1";
            params.push(req.user.centre_id);
        }
        sql += " GROUP BY s.stream ORDER BY s.stream";
        const result = await query(sql, params);
        res.json(result.rows);
    } catch (error) {
        console.error('Performance summary error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/struggling', async (req, res) => {
    try {
        let sql = "SELECT s.id, s.first_name, s.last_name, s.stream, AVG(ps.total_score) as avg_score FROM performance_scores ps JOIN students s ON ps.student_id = s.id WHERE 1=1";
        const params = [];
        if (req.user.role === 'admin' || req.user.role === 'instructor') {
            sql += " AND s.centre_id = $1";
            params.push(req.user.centre_id);
        }
        sql += " GROUP BY s.id, s.first_name, s.last_name, s.stream HAVING AVG(ps.total_score) < 50 ORDER BY avg_score ASC";
        const result = await query(sql, params);
        res.json(result.rows);
    } catch (error) {
        console.error('Struggling students error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/rankings', async (req, res) => {
    try {
        let sql = "SELECT s.id, s.first_name, s.last_name, s.stream, AVG(ps.total_score) as avg_score, RANK() OVER (ORDER BY AVG(ps.total_score) DESC) as rank FROM performance_scores ps JOIN students s ON ps.student_id = s.id WHERE 1=1";
        const params = [];
        if (req.user.role === 'admin' || req.user.role === 'instructor') {
            sql += " AND s.centre_id = $1";
            params.push(req.user.centre_id);
        }
        sql += " GROUP BY s.id, s.first_name, s.last_name, s.stream ORDER BY avg_score DESC LIMIT 20";
        const result = await query(sql, params);
        res.json(result.rows);
    } catch (error) {
        console.error('Rankings error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/interventions', async (req, res) => {
    try {
        let sql = "SELECT i.*, s.first_name, s.last_name, s.stream FROM interventions i JOIN students s ON i.student_id = s.id WHERE 1=1";
        const params = [];
        if (req.user.role === 'admin' || req.user.role === 'instructor') {
            sql += " AND s.centre_id = $1";
            params.push(req.user.centre_id);
        }
        sql += " ORDER BY i.date_initiated DESC";
        const result = await query(sql, params);
        res.json(result.rows);
    } catch (error) {
        console.error('Get interventions error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/interventions', requireRole('admin', 'instructor', 'super_admin'), async (req, res) => {
    try {
        const { student_id, type, description, priority } = req.body;
        const result = await query(
            "INSERT INTO interventions (student_id, type, description, priority, created_by) VALUES ($1, $2, $3, $4, $5) RETURNING *",
            [student_id, type, description, priority || 'medium', req.user.id]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Create intervention error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.put('/interventions/:id', requireRole('admin', 'instructor', 'super_admin'), async (req, res) => {
    try {
        const { status, resolution_notes } = req.body;
        const result = await query(
            "UPDATE interventions SET status = COALESCE($1, status), resolution_notes = COALESCE($2, resolution_notes), date_resolved = CASE WHEN $1 = 'resolved' THEN CURRENT_DATE ELSE date_resolved END WHERE id = $3 RETURNING *",
            [status, resolution_notes, req.params.id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Intervention not found' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Update intervention error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/feedback', async (req, res) => {
    try {
        let sql = "SELECT sf.*, s.first_name, s.last_name, s.stream, u.name as given_by_name FROM student_feedback sf JOIN students s ON sf.student_id = s.id LEFT JOIN users u ON sf.given_by = u.id WHERE 1=1";
        const params = [];
        if (req.user.role === 'admin' || req.user.role === 'instructor') {
            sql += " AND s.centre_id = $1";
            params.push(req.user.centre_id);
        }
        sql += " ORDER BY sf.date_given DESC";
        const result = await query(sql, params);
        res.json(result.rows);
    } catch (error) {
        console.error('Get feedback error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/feedback', requireRole('admin', 'instructor', 'super_admin'), async (req, res) => {
    try {
        const { student_id, category, feedback_text } = req.body;
        const result = await query(
            "INSERT INTO student_feedback (student_id, category, feedback_text, given_by) VALUES ($1, $2, $3, $4) RETURNING *",
            [student_id, category, feedback_text, req.user.id]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Add feedback error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
