const express = require('express');
const router = express.Router();
const { query } = require('../database/db');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Removed router.use(authenticateToken) to allow public routes

router.get('/', authenticateToken, async (req, res) => {
    try {
        let sql = "SELECT s.*, u.name as created_by_name, c.name as centre_name FROM surveys s LEFT JOIN users u ON s.created_by = u.id LEFT JOIN centres c ON s.centre_id = c.id WHERE 1=1";
        const params = [];
        if (req.user.role === 'admin' || req.user.role === 'instructor') { sql += " AND s.centre_id = $1"; params.push(req.user.centre_id); }
        sql += " ORDER BY s.created_at DESC";
        const result = await query(sql, params);
        res.json(result.rows);
    } catch (error) { res.status(500).json({ error: 'Internal server error' }); }
});

router.post('/', authenticateToken, requireRole('admin', 'instructor', 'super_admin'), async (req, res) => {
    try {
        const { title, questions } = req.body;
        const surveyResult = await query("INSERT INTO surveys (centre_id, title, created_by) VALUES ($1, $2, $3) RETURNING id", [req.user.centre_id || req.body.centre_id, title, req.user.id]);
        const surveyId = surveyResult.rows[0].id;
        if (questions && Array.isArray(questions)) {
            for (let i = 0; i < questions.length; i++) {
                const q = questions[i];
                if (typeof q === 'string') {
                    await query("INSERT INTO survey_questions (survey_id, question_text, question_order) VALUES ($1, $2, $3)", [surveyId, q, i + 1]);
                } else {
                    await query("INSERT INTO survey_questions (survey_id, question_text, question_order, question_type, options) VALUES ($1, $2, $3, $4, $5)", 
                        [surveyId, q.question_text, i + 1, q.question_type || 'rating', q.options ? JSON.stringify(q.options) : null]);
                }
            }
        }
        res.status(201).json({ id: surveyId, message: 'Survey created' });
    } catch (error) { res.status(500).json({ error: 'Internal server error' }); }
});

router.get('/stats', authenticateToken, async (req, res) => {
    try {
        let sql = "SELECT s.id, s.title, COUNT(DISTINCT sq.id) as question_count, COUNT(DISTINCT sr.student_id) as respondent_count FROM surveys s LEFT JOIN survey_questions sq ON s.id = sq.survey_id LEFT JOIN survey_responses sr ON sq.id = sr.question_id WHERE 1=1";
        const params = [];
        if (req.user.role === 'admin' || req.user.role === 'instructor') { sql += " AND s.centre_id = $1"; params.push(req.user.centre_id); }
        sql += " GROUP BY s.id, s.title ORDER BY s.created_at DESC";
        const result = await query(sql, params);
        res.json(result.rows);
    } catch (error) { res.status(500).json({ error: 'Internal server error' }); }
});

router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const surveyRes = await query("SELECT * FROM surveys WHERE id = $1", [req.params.id]);
        if (surveyRes.rows.length === 0) return res.status(404).json({ error: 'Survey not found' });
        
        const survey = surveyRes.rows[0];
        
        const questionsRes = await query("SELECT * FROM survey_questions WHERE survey_id = $1 ORDER BY question_order", [survey.id]);
        survey.questions = questionsRes.rows;
        
        const responsesRes = await query(`
            SELECT sq.id, sq.question_text, sq.question_type, sq.options, 
                   AVG(sr.score) as avg_score, COUNT(sr.id) as response_count,
                   array_agg(sr.response_text) as text_responses,
                   array_agg(sr.score) as all_scores
            FROM survey_questions sq
            LEFT JOIN survey_responses sr ON sq.id = sr.question_id
            WHERE sq.survey_id = $1
            GROUP BY sq.id, sq.question_text, sq.question_type, sq.options
            ORDER BY sq.question_order
        `, [survey.id]);
        
        survey.responses = responsesRes.rows;
        
        res.json(survey);
    } catch (error) {
        console.error('Survey GET /:id error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/:id/respond', authenticateToken, async (req, res) => {
    try {
        const { responses } = req.body;
        if (!responses || !Array.isArray(responses)) {
            return res.status(400).json({ error: 'Invalid responses format' });
        }
        
        for (const resp of responses) {
            await query(
                "INSERT INTO survey_responses (question_id, student_id, score, response_text) VALUES ($1, $2, $3, $4) ON CONFLICT (question_id, student_id) DO UPDATE SET score = $3, response_text = $4",
                [resp.question_id, resp.student_id, resp.score, resp.response_text]
            );
        }
        
        res.json({ message: 'Response submitted successfully' });
    } catch (error) {
        console.error('Survey POST /respond error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// --- PUBLIC ROUTES ---
router.get('/public/:id', async (req, res) => {
    try {
        const surveyRes = await query("SELECT id, title, centre_id FROM surveys WHERE id = $1", [req.params.id]);
        if (surveyRes.rows.length === 0) return res.status(404).json({ error: 'Survey not found' });
        
        const survey = surveyRes.rows[0];
        const questionsRes = await query("SELECT id, question_text, question_order, question_type, options FROM survey_questions WHERE survey_id = $1 ORDER BY question_order", [survey.id]);
        survey.questions = questionsRes.rows;
        
        res.json(survey);
    } catch (error) {
        console.error('Survey GET /public/:id error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/public/:id/respond', async (req, res) => {
    try {
        const { email, responses } = req.body;
        if (!responses || !Array.isArray(responses) || !email) {
            return res.status(400).json({ error: 'Invalid payload' });
        }
        
        const studentRes = await query("SELECT id FROM students WHERE email = $1", [email]);
        if (studentRes.rows.length === 0) {
            return res.status(404).json({ error: 'No student found with this email' });
        }
        const studentId = studentRes.rows[0].id;
        
        for (const resp of responses) {
            await query(
                "INSERT INTO survey_responses (question_id, student_id, score, response_text) VALUES ($1, $2, $3, $4) ON CONFLICT (question_id, student_id) DO UPDATE SET score = $3, response_text = $4",
                [resp.question_id, studentId, resp.score, resp.response_text]
            );
        }
        
        res.json({ message: 'Thank you for your feedback!' });
    } catch (error) {
        console.error('Survey POST /public/respond error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
