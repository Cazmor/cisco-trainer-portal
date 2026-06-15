const express = require('express');
const router = express.Router();
const { query } = require('../database/db');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Get all templates (Super Admin sees all, others see assigned)
router.get('/', authenticateToken, async (req, res) => {
    try {
        let result;
        if (req.user.role === 'super_admin') {
            result = await query(`
                SELECT t.*, tc.name as category_name, u.name as created_by_name
                FROM templates t
                JOIN template_categories tc ON t.category_id = tc.id
                LEFT JOIN users u ON t.created_by = u.id
                WHERE t.is_active = true
                ORDER BY tc.name, t.name
            `);
        } else {
            result = await query(`
                SELECT t.*, tc.name as category_name
                FROM templates t
                JOIN centre_templates ct ON ct.template_id = t.id
                JOIN template_categories tc ON t.category_id = tc.id
                WHERE ct.centre_id = $1 AND t.is_active = true
            `, [req.user.centre_id]);
        }
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get template by ID
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const result = await query('SELECT * FROM templates WHERE id = $1', [req.params.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Template not found' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create template (Super Admin only)
router.post('/', authenticateToken, requireRole('super_admin'), async (req, res) => {
    try {
        const { name, category_id, template_type, content, headers, sample_data } = req.body;
        
        const result = await query(`
            INSERT INTO templates (name, category_id, template_type, content, headers, sample_data, created_by)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `, [name, category_id, template_type, content, headers, sample_data, req.user.id]);
        
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update template (Super Admin only)
router.put('/:id', authenticateToken, requireRole('super_admin'), async (req, res) => {
    try {
        const { name, content, headers, sample_data, is_active } = req.body;
        const result = await query(`
            UPDATE templates 
            SET name = COALESCE($1, name),
                content = COALESCE($2, content),
                headers = COALESCE($3, headers),
                sample_data = COALESCE($4, sample_data),
                is_active = COALESCE($5, is_active),
                updated_at = NOW()
            WHERE id = $6
            RETURNING *
        `, [name, content, headers, sample_data, is_active, req.params.id]);
        
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete template (Super Admin only)
router.delete('/:id', authenticateToken, requireRole('super_admin'), async (req, res) => {
    try {
        await query('DELETE FROM templates WHERE id = $1', [req.params.id]);
        res.json({ message: 'Template deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Assign template to centre (Super Admin only)
router.post('/:id/assign', authenticateToken, requireRole('super_admin'), async (req, res) => {
    try {
        const { centre_id } = req.body;
        await query(`
            INSERT INTO centre_templates (centre_id, template_id, assigned_by)
            VALUES ($1, $2, $3)
            ON CONFLICT DO NOTHING
        `, [centre_id, req.params.id, req.user.id]);
        res.json({ message: 'Template assigned successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Download template as CSV
router.get('/:id/download', authenticateToken, async (req, res) => {
    try {
        const result = await query('SELECT * FROM templates WHERE id = $1', [req.params.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Template not found' });
        }
        const template = result.rows[0];
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${template.name}.csv"`);
        res.send(template.content);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
