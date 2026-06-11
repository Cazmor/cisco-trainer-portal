const { Pool } = require('pg');
const { makeDbConfig } = require('./poolConfig');
require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env') });
const p = new Pool(makeDbConfig());

async function setup() {
    try {
        await p.query(`
            CREATE TABLE IF NOT EXISTS instructor_metrics_daily (
                id SERIAL PRIMARY KEY,
                date DATE NOT NULL DEFAULT CURRENT_DATE,
                instructor_id INTEGER REFERENCES users(id),
                centre_id INTEGER REFERENCES centres(id),
                kpi_total_raw DECIMAL(5,2),
                kpi_out_of_50 DECIMAL(5,2),
                evidence_count INTEGER DEFAULT 0,
                evidence_age_days_max INTEGER DEFAULT 0,
                attendance_delay_minutes_p95 INTEGER DEFAULT 0,
                risk_score_0_100 INTEGER DEFAULT 0,
                risk_factors TEXT[] DEFAULT '{}',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Telemetry table created');
        
        await p.query(`
            CREATE TABLE IF NOT EXISTS surveillance_alerts (
                id SERIAL PRIMARY KEY,
                alert_type VARCHAR(20) CHECK (alert_type IN ('red','amber','green')),
                category VARCHAR(50),
                message TEXT,
                instructor_id INTEGER REFERENCES users(id),
                centre_id INTEGER REFERENCES centres(id),
                status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open','acknowledged','investigating','resolved')),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                resolved_at TIMESTAMP
            )
        `);
        console.log('Alerts table created');
    } catch(e) { console.log('Setup error:', e.message); }
    await p.end();
}
setup();
