const express = require('express');
const router = express.Router();
const { query } = require('../database/db');
const { authenticateToken, requireRole } = require('../middleware/auth');
const PDFDocument = require('pdfkit');
router.use(authenticateToken);

router.get('/daily', async (req, res) => {
    try {
        const { date, status } = req.query;
        let sql = "SELECT dr.*, u.name as submitted_by_name FROM daily_reports dr LEFT JOIN users u ON dr.submitted_by = u.id WHERE 1=1";
        const params = [];
        if (date) { sql += " AND dr.date = $" + (params.length + 1); params.push(date); }
        if (status) { sql += " AND dr.status = $" + (params.length + 1); params.push(status); }
        if (req.user.role === 'admin' || req.user.role === 'instructor') { sql += " AND dr.centre_id = $" + (params.length + 1); params.push(req.user.centre_id); }
        sql += " ORDER BY dr.date DESC LIMIT 30";
        const result = await query(sql, params);
        res.json(result.rows);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/daily', requireRole('admin', 'instructor', 'super_admin'), async (req, res) => {
    try {
        const { date, streams, topics_covered, engagement_level, challenges, next_steps, status } = req.body;
        const result = await query("INSERT INTO daily_reports (date, centre_id, streams, topics_covered, engagement_level, challenges, next_steps, status, submitted_by) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *", [date || new Date().toISOString().split('T')[0], req.user.centre_id, streams, topics_covered, engagement_level, challenges, next_steps, status || 'draft', req.user.id]);
        res.status(201).json(result.rows[0]);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

router.get('/weekly', async (req, res) => {
    try {
        const { week_start_date, status } = req.query;
        let sql = "SELECT wr.*, u.name as submitted_by_name FROM weekly_reports wr LEFT JOIN users u ON wr.submitted_by = u.id WHERE 1=1";
        const params = [];
        if (week_start_date) { sql += " AND wr.week_start_date = $" + (params.length + 1); params.push(week_start_date); }
        if (status) { sql += " AND wr.status = $" + (params.length + 1); params.push(status); }
        if (req.user.role === 'admin' || req.user.role === 'instructor') { sql += " AND wr.centre_id = $" + (params.length + 1); params.push(req.user.centre_id); }
        sql += " ORDER BY wr.week_start_date DESC LIMIT 20";
        const result = await query(sql, params);
        res.json(result.rows);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/weekly', requireRole('admin', 'instructor', 'super_admin'), async (req, res) => {
    try {
        const { week_start_date, week_end_date, netacad_update, lab_update, centre_update, challenges, recommendations, attachment_urls, status } = req.body;
        const result = await query("INSERT INTO weekly_reports (week_start_date, week_end_date, centre_id, netacad_update, lab_update, centre_update, challenges, recommendations, attachment_urls, status, submitted_by) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *", [week_start_date, week_end_date, req.user.centre_id, netacad_update, lab_update, centre_update, challenges, recommendations, attachment_urls, status || 'draft', req.user.id]);
        res.status(201).json(result.rows[0]);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

router.get('/maintenance', async (req, res) => {
    try {
        let sql = "SELECT mr.*, u.name as submitted_by_name FROM maintenance_reports mr LEFT JOIN users u ON mr.submitted_by = u.id WHERE 1=1";
        const params = [];
        if (req.user.role === 'admin' || req.user.role === 'instructor') { sql += " AND mr.centre_id = $" + (params.length + 1); params.push(req.user.centre_id); }
        sql += " ORDER BY mr.report_date DESC LIMIT 20";
        const result = await query(sql, params);
        res.json(result.rows);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/maintenance', requireRole('admin', 'instructor', 'super_admin'), async (req, res) => {
    try {
        const { report_date, open_issues_count, in_progress_count, resolved_count, critical_issues, upcoming_maintenance, recommendations } = req.body;
        const result = await query("INSERT INTO maintenance_reports (report_date, centre_id, open_issues_count, in_progress_count, resolved_count, critical_issues, upcoming_maintenance, recommendations, submitted_by) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *", [report_date || new Date().toISOString().split('T')[0], req.user.centre_id, open_issues_count || 0, in_progress_count || 0, resolved_count || 0, critical_issues, upcoming_maintenance, recommendations, req.user.id]);
        res.status(201).json(result.rows[0]);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

// PDF: Daily Report - Clean 1 page
router.get('/daily/:id/pdf', async (req, res) => {
    try {
        const result = await query("SELECT * FROM daily_reports WHERE id = $1", [req.params.id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
        const r = result.rows[0];
        const user = await query("SELECT * FROM users WHERE id = $1", [r.submitted_by]);
        const trainer = user.rows[0] ? user.rows[0].name : 'Trainer';
        const centre = await query("SELECT * FROM centres WHERE id = $1", [r.centre_id]);
        const centreName = centre.rows[0] ? centre.rows[0].name : 'Centre';
        
        const doc = new PDFDocument({ margin: 40, size: 'A4' });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=Daily_Report_' + r.date + '.pdf');
        doc.pipe(res);
        
        doc.rect(0, 0, doc.page.width, 90).fill('#0f172a');
        doc.fillColor('#ffffff').fontSize(20).font('Helvetica-Bold').text('DAILY TRAINER REPORT', 40, 25);
        doc.fontSize(9).text(new Date(r.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }), 40, 50);
        doc.fontSize(8).fillColor('#94a3b8').text(trainer + ' | ' + centreName + ' | Online Submission', 40, 68);
        
        var y = 110;
        var sections = [
            { title: 'NETACAD TRAINING UPDATE', content: r.topics_covered || 'N/A' },
            { title: 'LAB UPDATE', content: 'Operational - both Cisco classes and other activities running.' },
            { title: 'CENTER UPDATE', content: r.challenges || 'No issues' },
            { title: 'CHALLENGES', content: r.challenges || 'None reported' },
            { title: 'RECOMMENDATIONS', content: r.next_steps || 'None' }
        ];
        
        for (var i = 0; i < sections.length; i++) {
            doc.fillColor('#1e40af').fontSize(11).font('Helvetica-Bold').text(sections[i].title, 40, y);
            y += 16;
            doc.fillColor('#334155').fontSize(9).font('Helvetica').text(sections[i].content, 40, y, { width: doc.page.width - 80, lineGap: 3 });
            y = doc.y + 12;
            doc.moveTo(40, y).lineTo(doc.page.width - 40, y).stroke('#f1f5f9');
            y += 8;
        }
        
        doc.fillColor('#94a3b8').fontSize(7).text('Generated ' + new Date().toLocaleString() + ' | Confidential', 40, doc.page.height - 30, { align: 'center', width: doc.page.width - 80 });
        doc.end();
    } catch (error) { res.status(500).json({ error: error.message }); }
});

// PDF: Weekly Report - Clean 1 page
router.get('/weekly/:id/pdf', async (req, res) => {
    try {
        const result = await query("SELECT * FROM weekly_reports WHERE id = $1", [req.params.id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
        const r = result.rows[0];
        
        const doc = new PDFDocument({ margin: 40, size: 'A4' });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=Weekly_Report_' + r.week_start_date + '.pdf');
        doc.pipe(res);
        
        doc.rect(0, 0, doc.page.width, 90).fill('#0f172a');
        doc.fillColor('#ffffff').fontSize(20).font('Helvetica-Bold').text('WEEKLY TRAINER REPORT', 40, 25);
        doc.fontSize(9).text(new Date(r.week_start_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' }) + ' - ' + new Date(r.week_end_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }), 40, 50);
        
        var y = 110;
        var sections = [
            { title: 'NETACAD TRAINING UPDATE', content: r.netacad_update || 'N/A' },
            { title: 'LAB UPDATE', content: r.lab_update || 'N/A' },
            { title: 'CENTER UPDATE', content: r.centre_update || 'N/A' },
            { title: 'CHALLENGES', content: r.challenges || 'N/A' },
            { title: 'RECOMMENDATIONS', content: r.recommendations || 'N/A' }
        ];
        
        for (var i = 0; i < sections.length; i++) {
            doc.fillColor('#1e40af').fontSize(11).font('Helvetica-Bold').text(sections[i].title, 40, y);
            y += 16;
            doc.fillColor('#334155').fontSize(9).font('Helvetica').text(sections[i].content, 40, y, { width: doc.page.width - 80, lineGap: 3 });
            y = doc.y + 12;
            doc.moveTo(40, y).lineTo(doc.page.width - 40, y).stroke('#f1f5f9');
            y += 8;
        }
        
        doc.fillColor('#94a3b8').fontSize(7).text('Generated ' + new Date().toLocaleString() + ' | Confidential', 40, doc.page.height - 30, { align: 'center', width: doc.page.width - 80 });
        doc.end();
    } catch (error) { res.status(500).json({ error: error.message }); }
});

// PDF: Maintenance Report - Compact 1-2 pages
router.get('/maintenance/:id/pdf', async (req, res) => {
    try {
        const result = await query("SELECT * FROM maintenance_reports WHERE id = $1", [req.params.id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
        const r = result.rows[0];
        
        const workstations = await query("SELECT * FROM lab_workstations WHERE centre_id = $1 ORDER BY workstation_number", [r.centre_id]);
        const logs = await query("SELECT ml.*, u.name as reported_by_name FROM maintenance_logs ml LEFT JOIN users u ON ml.reported_by = u.id WHERE ml.centre_id = $1 ORDER BY ml.date_reported DESC LIMIT 30", [r.centre_id]);
        const preventive = await query("SELECT * FROM preventive_maintenance WHERE centre_id = $1 ORDER BY next_due ASC LIMIT 15", [r.centre_id]);
        
        var functional = 0, total = workstations.rows.length;
        for (var i = 0; i < workstations.rows.length; i++) { if (workstations.rows[i].status === 'functional') functional++; }
        var health = total > 0 ? Math.round((functional / total) * 100) : 0;
        
        const doc = new PDFDocument({ margin: 35, size: 'A4' });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=Maintenance_Report_' + r.report_date + '.pdf');
        doc.pipe(res);
        
        doc.rect(0, 0, doc.page.width, 75).fill('#1e293b');
        doc.fillColor('#ffffff').fontSize(18).font('Helvetica-Bold').text('LAB MAINTENANCE REPORT', 35, 20);
        doc.fontSize(8).text(new Date(r.report_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }), 35, 42);
        doc.fontSize(7).fillColor('#94a3b8').text('Health: ' + health + '% | Workstations: ' + total + ' | Open Issues: ' + r.open_issues_count + ' | Resolved: ' + r.resolved_count, 35, 55);
        
        var y = 90;
        
        // Workstation Summary - compact grid
        doc.fillColor('#1e40af').fontSize(10).font('Helvetica-Bold').text('WORKSTATION STATUS', 35, y);
        y += 16;
        doc.fontSize(6.5).font('Helvetica-Bold');
        var cols = { ws: 35, status: 80, cpu: 130, mon: 160, kb: 190, ms: 220, net: 250 };
        doc.text('Workstation', cols.ws, y); doc.text('Status', cols.status, y); doc.text('CPU', cols.cpu, y); doc.text('Monitor', cols.mon, y); doc.text('KBD', cols.kb, y); doc.text('MSE', cols.ms, y); doc.text('NET', cols.net, y);
        y += 4; doc.moveTo(35, y).lineTo(doc.page.width - 35, y).stroke('#e2e8f0'); y += 6;
        
        doc.font('Helvetica').fontSize(6);
        for (var w = 0; w < workstations.rows.length; w++) {
            var ws = workstations.rows[w];
            if (y > doc.page.height - 40) { doc.addPage(); y = 40; }
            var sc = ws.status === 'functional' ? '#10b981' : ws.status === 'partial' ? '#f59e0b' : '#ef4444';
            doc.fillColor('#1e293b').text(ws.workstation_number, cols.ws, y);
            doc.fillColor(sc).text(ws.status, cols.status, y);
            doc.fillColor(ws.cpu_status ? '#10b981' : '#ef4444').text(ws.cpu_status ? 'OK' : 'X', cols.cpu, y);
            doc.fillColor(ws.monitor_status ? '#10b981' : '#ef4444').text(ws.monitor_status ? 'OK' : 'X', cols.mon, y);
            doc.fillColor(ws.keyboard_status ? '#10b981' : '#ef4444').text(ws.keyboard_status ? 'OK' : 'X', cols.kb, y);
            doc.fillColor(ws.mouse_status ? '#10b981' : '#ef4444').text(ws.mouse_status ? 'OK' : 'X', cols.ms, y);
            doc.fillColor(ws.network_status ? '#10b981' : '#ef4444').text(ws.network_status ? 'OK' : 'X', cols.net, y);
            y += 10;
        }
        
        y += 8;
        
        // Maintenance Logs - compact
        if (y > doc.page.height - 100) { doc.addPage(); y = 40; }
        doc.fillColor('#1e40af').fontSize(10).font('Helvetica-Bold').text('MAINTENANCE LOGS', 35, y);
        y += 16;
        doc.fontSize(6.5).font('Helvetica-Bold');
        doc.text('Device', 35, y); doc.text('Issue', 100, y); doc.text('Status', 260, y); doc.text('Priority', 300, y); doc.text('Date', 340, y);
        y += 4; doc.moveTo(35, y).lineTo(doc.page.width - 35, y).stroke('#e2e8f0'); y += 6;
        
        doc.font('Helvetica').fontSize(6);
        for (var l = 0; l < logs.rows.length; l++) {
            var log = logs.rows[l];
            if (y > doc.page.height - 40) { doc.addPage(); y = 40; }
            var lsc = log.status === 'resolved' ? '#10b981' : log.status === 'in-progress' ? '#3b82f6' : '#f59e0b';
            doc.fillColor('#1e293b').text(log.device_type + ' #' + log.device_id, 35, y);
            doc.text(log.issue_description.substring(0, 40), 100, y);
            doc.fillColor(lsc).text(log.status, 260, y);
            doc.fillColor('#1e293b').text(log.priority, 300, y);
            doc.fillColor('#64748b').text(new Date(log.date_reported).toLocaleDateString(), 340, y);
            y += 10;
        }
        
        y += 8;
        
        // Preventive - compact
        if (y > doc.page.height - 100) { doc.addPage(); y = 40; }
        doc.fillColor('#1e40af').fontSize(10).font('Helvetica-Bold').text('PREVENTIVE MAINTENANCE', 35, y);
        y += 16;
        doc.fontSize(6.5).font('Helvetica-Bold');
        doc.text('Task', 35, y); doc.text('Device', 180, y); doc.text('Freq', 250, y); doc.text('Next Due', 280, y); doc.text('Status', 340, y);
        y += 4; doc.moveTo(35, y).lineTo(doc.page.width - 35, y).stroke('#e2e8f0'); y += 6;
        
        doc.font('Helvetica').fontSize(6);
        for (var p = 0; p < preventive.rows.length; p++) {
            var pm = preventive.rows[p];
            if (y > doc.page.height - 40) { doc.addPage(); y = 40; }
            var overdue = pm.status !== 'completed' && new Date(pm.next_due) < new Date();
            var psc = pm.status === 'completed' ? '#10b981' : overdue ? '#ef4444' : '#f59e0b';
            doc.fillColor('#1e293b').text(pm.task_description.substring(0, 35), 35, y);
            doc.text(pm.device_type + ' #' + pm.device_id, 180, y);
            doc.text(pm.frequency, 250, y);
            doc.text(new Date(pm.next_due).toLocaleDateString(), 280, y);
            doc.fillColor(psc).text(overdue ? 'OVERDUE' : pm.status, 340, y);
            y += 10;
        }
        
        doc.fillColor('#94a3b8').fontSize(7).text('Generated ' + new Date().toLocaleString() + ' | Confidential', 35, doc.page.height - 20, { align: 'center', width: doc.page.width - 70 });
        doc.end();
    } catch (error) { res.status(500).json({ error: error.message }); }
});

router.delete('/daily/:id', async (req, res) => { try { await query('DELETE FROM daily_reports WHERE id = $1', [req.params.id]); res.json({ message: 'Deleted' }); } catch (error) { res.status(500).json({ error: error.message }); } });
router.delete('/weekly/:id', async (req, res) => { try { await query('DELETE FROM weekly_reports WHERE id = $1', [req.params.id]); res.json({ message: 'Deleted' }); } catch (error) { res.status(500).json({ error: error.message }); } });
router.delete('/maintenance/:id', async (req, res) => { try { await query('DELETE FROM maintenance_reports WHERE id = $1', [req.params.id]); res.json({ message: 'Deleted' }); } catch (error) { res.status(500).json({ error: error.message }); } });

module.exports = router;
