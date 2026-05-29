const express = require('express');
const router = express.Router();
const { query } = require('../database/db');
const { authenticateToken, requireRole } = require('../middleware/auth');
router.use(authenticateToken);

router.get('/', async (req, res) => {
    try {
        var sql = "SELECT * FROM module_curriculum WHERE 1=1";
        var params = [];
        if (req.query.module_number) { sql += " AND module_number = $" + (params.length + 1); params.push(req.query.module_number); }
        sql += " ORDER BY module_number, section_number";
        var result = await query(sql, params);
        res.json(result.rows);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/save', requireRole('admin', 'instructor', 'super_admin'), async (req, res) => {
    try {
        var sections = req.body.sections;
        if (!sections || !Array.isArray(sections) || sections.length === 0) {
            return res.status(400).json({ error: 'Sections array required' });
        }
        
        // Group by module to delete existing
        var modulesToClear = [];
        for (var i = 0; i < sections.length; i++) {
            var mn = sections[i].module_number;
            if (modulesToClear.indexOf(mn) < 0) modulesToClear.push(mn);
        }
        
        // Clear all affected modules
        for (var j = 0; j < modulesToClear.length; j++) {
            await query("DELETE FROM module_curriculum WHERE module_number = $1", [modulesToClear[j]]);
        }
        
        // Insert all sections
        var saved = 0;
        for (var k = 0; k < sections.length; k++) {
            var s = sections[k];
            await query(
                "INSERT INTO module_curriculum (module_number, module_name, section_number, section_name, topics) VALUES ($1,$2,$3,$4,$5)",
                [s.module_number, s.module_name, s.section_number, s.section_name, s.topics || '']
            );
            saved++;
        }
        
        res.json({ message: 'Curriculum saved', sections_saved: saved, modules: modulesToClear.length });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/reset', requireRole('admin', 'super_admin'), async (req, res) => {
    try { await query("DELETE FROM module_curriculum"); res.json({ message: 'Reset' }); } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
