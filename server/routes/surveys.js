const express = require('express');
const router = express.Router();
const { query } = require('../database/db');
const { authenticateToken, requireRole } = require('../middleware/auth');
router.use(authenticateToken);

router.get('/', async (req, res) => {
    try {
        let sql = "SELECT s.*, u.name as created_by_name, c.name as centre_name FROM surveys s LEFT JOIN users u ON s.created_by = u.id LEFT JOIN centres c ON s.centre_id = c.id WHERE 1=1";
        const params = [];
        if (req.user.role === 'admin' || req.user.role === 'instructor') { sql += " AND s.centre_id = $1"; params.push(req.user.centre_id); }
        sql += " ORDER BY s.created_at DESC";
        const result = await query(sql, params);
        res.json(result.rows);
    } catch (error) { res.status(500).json({ error: 'Internal server error' }); }
});

router.post('/', requireRole('admin', 'instructor', 'super_admin'), async (req, res) => {
    try {
        const { title, questions } = req.body;
        const surveyResult = await query("INSERT INTO surveys (centre_id, title, created_by) VALUES ($1, $2, $3) RETURNING id", [req.user.centre_id || req.body.centre_id, title, req.user.id]);
        const surveyId = surveyResult.rows[0].id;
        if (questions && Array.isArray(questions)) {
            for (let i = 0; i < questions.length; i++) {
                await query("INSERT INTO survey_questions (survey_id, question_text, question_order) VALUES ($1, $2, $3)", [surveyId, questions[i], i + 1]);
            }
        }
        res.status(201).json({ id: surveyId, message: 'Survey created' });
    } catch (error) { res.status(500).json({ error: 'Internal server error' }); }
});

router.get('/stats', async (req, res) => {
    try {
        let sql = "SELECT s.id, s.title, COUNT(DISTINCT sq.id) as question_count, COUNT(DISTINCT sr.student_id) as respondent_count FROM surveys s LEFT JOIN survey_questions sq ON s.id = sq.survey_id LEFT JOIN survey_responses sr ON sq.id = sr.question_id WHERE 1=1";
        const params = [];
        if (req.user.role === 'admin' || req.user.role === 'instructor') { sql += " AND s.centre_id = $1"; params.push(req.user.centre_id); }
        sql += " GROUP BY s.id, s.title ORDER BY s.created_at DESC";
        const result = await query(sql, params);
        res.json(result.rows);
    } catch (error) { res.status(500).json({ error: 'Internal server error' }); }
});

module.exports = router;
