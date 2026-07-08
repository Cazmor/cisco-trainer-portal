const express = require('express');
const router = express.Router();
const { query } = require('../database/db');
const { authenticateToken } = require('../middleware/auth');
router.use(authenticateToken);

router.get('/scorecard', async (req, res) => {
    try {
        const centreId = req.user.centre_id || req.query.centre_id;
        const kpis = [];
        
        // KPI 1: Lab Uptime (≥90%)
        const labResult = await query("SELECT COUNT(*) as total, COUNT(CASE WHEN status = 'functional' THEN 1 END) as functional FROM lab_workstations WHERE centre_id = $1", [centreId]);
        const labHealth = labResult.rows[0].total > 0 ? Math.round((labResult.rows[0].functional / labResult.rows[0].total) * 100) : 0;
        kpis.push({ id: 1, name: 'Lab Uptime', value: labHealth, target: 90, unit: '%' });
        
        // KPI 2: Training Delivery (12+ hrs/month, 60% attendance, 70% practical)
        const planResult = await query("SELECT SUM(completed_hours) as hrs FROM delivery_plans WHERE centre_id = $1", [centreId]);
        const trainingHours = Math.round(planResult.rows[0].hrs || 0);
        const deliveryScore = trainingHours >= 15 ? 95 : trainingHours >= 12 ? 85 : trainingHours >= 10 ? 65 : trainingHours >= 5 ? 45 : 20;
        kpis.push({ id: 2, name: 'Training Delivery', value: deliveryScore, target: 85, unit: '%' });
        
        // KPI 3: Learner Pass Rate (≥85%)
        const scoreResult = await query("SELECT AVG(total_score) as avg FROM performance_scores ps JOIN students s ON ps.student_id = s.id WHERE s.centre_id = $1", [centreId]);
        const passRate = Math.round(scoreResult.rows[0].avg || 0);
        kpis.push({ id: 3, name: 'Learner Pass Rate', value: passRate, target: 85, unit: '%' });
        
        // KPI 4: Weekly Reports (5/5 on time)
        const reportResult = await query("SELECT COUNT(*) as count FROM weekly_reports WHERE centre_id = $1 AND status = 'submitted'", [centreId]);
        const reportScore = Math.min(reportResult.rows[0].count * 20, 100);
        kpis.push({ id: 4, name: 'Weekly Reports', value: reportScore, target: 100, unit: '%' });
        
        // KPI 5: Learner Satisfaction (≥60%)
        const surveyResult = await query(
            `SELECT AVG(sr.score) as avg_score 
             FROM survey_responses sr 
             JOIN survey_questions sq ON sr.question_id = sq.id 
             JOIN surveys s ON sq.survey_id = s.id 
             WHERE s.centre_id = $1 AND sq.question_type = 'rating'`, 
            [centreId]
        );
        const satisfactionScore = surveyResult.rows[0].avg_score ? Math.round((surveyResult.rows[0].avg_score / 5) * 100) : 0;
        kpis.push({ id: 5, name: 'Learner Satisfaction', value: satisfactionScore, target: 60, unit: '%' });
        
        // KPI 6: Professional Development (2 courses/yr)
        const devResult = await query("SELECT COUNT(*) as count FROM professional_development WHERE user_id = $1", [req.user.id]);
        const devScore = Math.min(devResult.rows[0].count * 50, 100);
        kpis.push({ id: 6, name: 'Professional Development', value: devScore, target: 100, unit: '%' });
        
        // KPI 7: Teaching Innovation (1/term)
        const innovResult = await query("SELECT COUNT(*) as count FROM innovation_log WHERE centre_id = $1", [centreId]);
        const innovScore = Math.min(innovResult.rows[0].count * 33, 100);
        kpis.push({ id: 7, name: 'Teaching Innovation', value: innovScore, target: 100, unit: '%' });
        
        res.json({ centre_id: centreId, generated_at: new Date().toISOString(), kpis: kpis, overall_score: Math.round(kpis.reduce(function(s, k) { return s + k.value; }, 0) / kpis.length) });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

router.get('/evidence/:kpiId', async (req, res) => {
    try {
        const centreId = req.user.centre_id;
        const kpiId = parseInt(req.params.kpiId);
        var evidence = {};
        if (kpiId === 1) { const data = await query("SELECT * FROM lab_workstations WHERE centre_id = $1", [centreId]); evidence = { workstations: data.rows }; }
        else if (kpiId === 2) { const data = await query("SELECT module_number, module_name, AVG(total_score) as avg_score FROM performance_scores ps JOIN students s ON ps.student_id = s.id WHERE s.centre_id = $1 GROUP BY module_number, module_name ORDER BY module_number", [centreId]); evidence = { module_scores: data.rows }; }
        else if (kpiId === 4) { const data = await query("SELECT * FROM weekly_reports WHERE centre_id = $1 ORDER BY week_start_date DESC LIMIT 10", [centreId]); evidence = { reports: data.rows }; }
        else if (kpiId === 5) { const data = await query("SELECT title, created_at FROM surveys WHERE centre_id = $1 ORDER BY created_at DESC", [centreId]); evidence = { surveys: data.rows }; }
        else if (kpiId === 7) { const data = await query("SELECT * FROM innovation_log WHERE centre_id = $1 ORDER BY created_at DESC", [centreId]); evidence = { innovations: data.rows }; }
        res.json(evidence);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

module.exports = router;
