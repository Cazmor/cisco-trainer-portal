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

// POST /api/performance/cisco-upload
// Accepts a parsed array of Netacad CSV rows (already matched to students).
// Each entry: { student_id, row: { column_name: value, ... } }
router.post('/cisco-upload', requireRole('admin', 'instructor', 'super_admin'), async (req, res) => {
    try {
        const { rows } = req.body;
        if (!rows || !Array.isArray(rows)) {
            return res.status(400).json({ error: 'rows array is required' });
        }

        const parseNum = (v) => { const n = parseFloat(v); return isNaN(n) ? null : Math.min(100, Math.max(0, n)); };
        const parseBool = (v) => { if (!v) return null; const s = String(v).trim().toLowerCase(); return s === 'yes' || s === 'true' || s === '1'; };

        let saved = 0;
        const errors = [];

        for (const entry of rows) {
            const { student_id, row } = entry;
            if (!student_id || !row) continue;
            try {
                await query(`
                    INSERT INTO cisco_exam_results (
                        student_id, centre_id, uploaded_by,
                        final_exam_submitted, survey_submitted, completion,
                        final_exam_score, skills_ch10_14, skills_ch1_9, skills_exams_avg,
                        mod1_exam, mod2_exam, mod3_exam, mod4_exam, checkpoint_1_4,
                        mod5_exam, mod6_exam, checkpoint_5_6,
                        mod7_exam, mod8_exam, checkpoint_7_8,
                        mod9_exam, mod10_exam, mod11_exam, checkpoint_10_11,
                        mod12_exam, mod13_exam, checkpoint_12_13,
                        mod14_exam, chapter_checkpoint_avg,
                        practice_final_1_9, practice_final_10_14, practice_finals_avg,
                        final_exam_1_9, final_exam_10_14, it_essentials_final, final_exams_avg,
                        cert_practice_1101, cert_practice_1102, cert_practice_avg, class_grade
                    ) VALUES (
                        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
                        $11,$12,$13,$14,$15,$16,$17,$18,$19,$20,
                        $21,$22,$23,$24,$25,$26,$27,$28,$29,$30,
                        $31,$32,$33,$34,$35,$36,$37,$38,$39,$40,$41
                    )
                    ON CONFLICT (student_id) DO UPDATE SET
                        centre_id=$2, uploaded_by=$3,
                        final_exam_submitted=$4, survey_submitted=$5, completion=$6,
                        final_exam_score=$7, skills_ch10_14=$8, skills_ch1_9=$9, skills_exams_avg=$10,
                        mod1_exam=$11, mod2_exam=$12, mod3_exam=$13, mod4_exam=$14, checkpoint_1_4=$15,
                        mod5_exam=$16, mod6_exam=$17, checkpoint_5_6=$18,
                        mod7_exam=$19, mod8_exam=$20, checkpoint_7_8=$21,
                        mod9_exam=$22, mod10_exam=$23, mod11_exam=$24, checkpoint_10_11=$25,
                        mod12_exam=$26, mod13_exam=$27, checkpoint_12_13=$28,
                        mod14_exam=$29, chapter_checkpoint_avg=$30,
                        practice_final_1_9=$31, practice_final_10_14=$32, practice_finals_avg=$33,
                        final_exam_1_9=$34, final_exam_10_14=$35, it_essentials_final=$36, final_exams_avg=$37,
                        cert_practice_1101=$38, cert_practice_1102=$39, cert_practice_avg=$40,
                        class_grade=$41, upload_date=NOW()
                `, [
                    student_id, req.user.centre_id, req.user.id,
                    parseBool(row['Final Exam Submitted']), parseBool(row['Survey Submitted']),
                    parseNum(row['Completion']), parseNum(row['Final Exam Score']),
                    parseNum(row['Chapter 10 - 14 Skills Assessment']), parseNum(row['Chapter 1 - 9 Skills Assessment']),
                    parseNum(row['Skills Exams( Average )']),
                    parseNum(row['Module 1: Module Exam']), parseNum(row['Module 2: Module Exam']),
                    parseNum(row['Module 3: Module Exam']), parseNum(row['Module 4: Module Exam']),
                    parseNum(row['Checkpoint Exam Modules 1-4']),
                    parseNum(row['Module 5: Module Exam']), parseNum(row['Module 6: Module Exam']),
                    parseNum(row['Checkpoint Exam Modules 5-6']),
                    parseNum(row['Module 7: Module Exam']), parseNum(row['Module 8: Module Exam']),
                    parseNum(row['Checkpoint Exam Modules 7-8']),
                    parseNum(row['Module 9: Module Exam']), parseNum(row['Module 10: Module Exam']),
                    parseNum(row['Module 11: Module Exam']), parseNum(row['Checkpoint Exam Modules 10-11']),
                    parseNum(row['Module 12: Module Exam']), parseNum(row['Module 13: Module Exam']),
                    parseNum(row['Checkpoint Exam Modules 12-13']),
                    parseNum(row['Module 14: Module Exam']), parseNum(row['Chapter and Checkpoint Exams( Average )']),
                    parseNum(row['Practice Final Exam Modules 1-9']), parseNum(row['Practice Final Exam Modules 10-14']),
                    parseNum(row['Practice Final Exams( Average )']),
                    parseNum(row['Final Exam Modules 1-9']), parseNum(row['Final Exam Modules 10-14']),
                    parseNum(row['IT Essentials Course Final Exam']), parseNum(row['Final Exams( Average )']),
                    parseNum(row['IT Essentials A+ 220-1101 Certification Practice Exam']),
                    parseNum(row['IT Essentials A+ 220-1102 Certification Practice Exam']),
                    parseNum(row['Certification Practice Exams( Average )']),
                    parseNum(row['Class Grade %'])
                ]);

                // Sync module-by-module scores into performance_scores
                const moduleMap = [
                    [1,'Module 1: Module Exam'],[2,'Module 2: Module Exam'],[3,'Module 3: Module Exam'],
                    [4,'Module 4: Module Exam'],[5,'Module 5: Module Exam'],[6,'Module 6: Module Exam'],
                    [7,'Module 7: Module Exam'],[8,'Module 8: Module Exam'],[9,'Module 9: Module Exam'],
                    [10,'Module 10: Module Exam'],[11,'Module 11: Module Exam'],[12,'Module 12: Module Exam'],
                    [13,'Module 13: Module Exam'],[14,'Module 14: Module Exam']
                ];
                for (const [modNum, colName] of moduleMap) {
                    const score = parseNum(row[colName]);
                    if (score !== null) {
                        await query(`
                            INSERT INTO performance_scores (student_id, module_number, module_name, exam_score)
                            VALUES ($1, $2, $3, $4)
                            ON CONFLICT (student_id, module_number)
                            DO UPDATE SET exam_score=$4, updated_at=NOW()
                        `, [student_id, modNum, 'Module ' + modNum, score]);
                    }
                }
                saved++;
            } catch (rowErr) {
                console.error('Row error for student_id', student_id, ':', rowErr.message);
                errors.push({ student_id, error: rowErr.message });
            }
        }
        res.json({ message: `${saved} student record(s) saved`, count: saved, errors });
    } catch (error) {
        console.error('Cisco upload error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/performance/cisco-results
router.get('/cisco-results', async (req, res) => {
    try {
        let sql = `SELECT cer.*, s.first_name, s.last_name, s.email, s.stream
                   FROM cisco_exam_results cer JOIN students s ON cer.student_id = s.id WHERE 1=1`;
        const params = [];
        if (req.user.role === 'admin' || req.user.role === 'instructor') {
            sql += ' AND s.centre_id = $1';
            params.push(req.user.centre_id);
        }
        sql += ' ORDER BY s.first_name, s.last_name';
        const result = await query(sql, params);
        res.json(result.rows);
    } catch (error) {
        console.error('Get cisco results error:', error);
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
