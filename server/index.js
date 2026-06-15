const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const db = require('./database/db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.disable('x-powered-by');

const allowedOrigins = (process.env.CORS_ORIGIN || '')
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean);
const corsOptions = allowedOrigins.length > 0 ? { origin: allowedOrigins } : undefined;

app.use(cors(corsOptions));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
// Serve static files with correct MIME types
app.use(express.static(path.join(__dirname, '..', 'public'), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    } else if (filePath.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    } else if (filePath.endsWith('.html')) {
      res.setHeader('Content-Type', 'text/html');
    } else if (filePath.endsWith('.json')) {
      res.setHeader('Content-Type', 'application/json');
    } else if (filePath.endsWith('.png')) {
      res.setHeader('Content-Type', 'image/png');
    } else if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) {
      res.setHeader('Content-Type', 'image/jpeg');
    } else if (filePath.endsWith('.svg')) {
      res.setHeader('Content-Type', 'image/svg+xml');
    } else if (filePath.endsWith('.ico')) {
      res.setHeader('Content-Type', 'image/x-icon');
    }
  }
}));
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Import routes
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const studentsRoutes = require('./routes/students');
const attendanceRoutes = require('./routes/attendance');
const performanceRoutes = require('./routes/performance');
const labRoutes = require('./routes/lab');
const classesRoutes = require('./routes/classes');
const reportsRoutes = require('./routes/reports');
const aiRoutes = require('./routes/ai');
const kpiRoutes = require('./routes/kpi');
const settingsRoutes = require('./routes/settings');
const surveysRoutes = require('./routes/surveys');
const curriculumRoutes = require('./routes/curriculum');
const surveillanceRoutes = require('./routes/surveillance');
const templatesRoutes = require('./routes/templates');

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/students', studentsRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/performance', performanceRoutes);
app.use('/api/lab', labRoutes);
app.use('/api/classes', classesRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/kpi', kpiRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/surveys', surveysRoutes);
app.use('/api/curriculum', curriculumRoutes);
app.use('/api/surveillance', surveillanceRoutes);
app.use('/api/templates', templatesRoutes);

// Serve login page as default
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'login.html'));
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});


// Database test endpoint
app.get('/api/db-test', async (req, res) => {
    try {
        const result = await db.query('SELECT NOW() as current_time, version() as pg_version');
        res.json({ 
            success: true, 
            time: result.rows[0].current_time,
            version: result.rows[0].pg_version
        });
    } catch (error) {
        console.error('DB Test Error:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// Check users endpoint
app.get('/api/check-users', async (req, res) => {
    try {
        const result = await db.query('SELECT id, email, role, status FROM users LIMIT 10');
        res.json({ 
            success: true, 
            count: result.rows.length,
            users: result.rows
        });
    } catch (error) {
        console.error('User check error:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});


// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ 
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

const startServer = () => app.listen(PORT, '0.0.0.0', async () => {
    console.log('');
    console.log('========================================');
    console.log('  CISCO TRAINER PROGRESS TRACKING SYSTEM');
    console.log('========================================');
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Open http://localhost:${PORT} in your browser`);
    console.log('');
    
    // Test database connection on startup
    let dbConnected = false; try { dbConnected = await db.testConnection(); } catch(e) { console.log('Database: Not connected yet - will retry'); }
    if (dbConnected) {
        console.log('Database: Connected successfully');
    } else {
        console.log('Database: Connection failed - check PostgreSQL settings');
    }
    console.log('========================================');
});

// Start server - binds to 0.0.0.0 for Render/container compatibility
if (require.main === module) {
    startServer();
}

module.exports = app;
module.exports.startServer = startServer;

