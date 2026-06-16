const express = require('express');
const router = express.Router();
const { query } = require('../database/db');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.use(authenticateToken);

// Get template content
router.get('/:type', async (req, res) => {
    try {
        const result = await query("SELECT content FROM csv_templates WHERE type = $1", [req.params.type]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Template not found' });
        }
        res.json({ content: result.rows[0].content });
    } catch (error) {
        console.error('Get template error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update template content (Super Admin only)
router.post('/:type', requireRole('super_admin'), async (req, res) => {
    try {
        const { content } = req.body;
        if (!content) {
            return res.status(400).json({ error: 'Template content is required' });
        }
        const result = await query(
            "INSERT INTO csv_templates (type, content, updated_by, updated_at) VALUES ($1, $2, $3, NOW()) ON CONFLICT (type) DO UPDATE SET content = $2, updated_by = $3, updated_at = NOW() RETURNING *",
            [req.params.type, content, req.user.id]
        );
        res.json({ message: 'Template updated successfully', template: result.rows[0] });
    } catch (error) {
        console.error('Update template error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
