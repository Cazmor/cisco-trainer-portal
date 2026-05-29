-- Surveillance Telemetry Tables

CREATE TABLE IF NOT EXISTS instructor_metrics_daily (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    instructor_id INTEGER REFERENCES users(id),
    centre_id INTEGER REFERENCES centres(id),
    kpi_out_of_50 DECIMAL(5,2),
    evidence_count INTEGER DEFAULT 0,
    evidence_age_days_max INTEGER DEFAULT 0,
    attendance_count INTEGER DEFAULT 0,
    attendance_delay_minutes_p95 INTEGER DEFAULT 0,
    lab_sessions INTEGER DEFAULT 0,
    assessments_median DECIMAL(5,2),
    passrate_window DECIMAL(5,2),
    risk_score_0_100 INTEGER DEFAULT 0,
    risk_factors TEXT[] DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS centre_metrics_daily (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    centre_id INTEGER REFERENCES centres(id),
    students_total INTEGER DEFAULT 0,
    instructors_total INTEGER DEFAULT 0,
    attendance_avg DECIMAL(5,2),
    avg_kpi_out_of_50 DECIMAL(5,2),
    passrate DECIMAL(5,2),
    lab_uptime DECIMAL(5,2),
    report_on_time_pct DECIMAL(5,2),
    centre_health_0_100 INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS surveillance_alerts (
    id SERIAL PRIMARY KEY,
    alert_type VARCHAR(20) CHECK (alert_type IN ('red','amber','green')),
    category VARCHAR(50),
    message TEXT,
    instructor_id INTEGER REFERENCES users(id),
    centre_id INTEGER REFERENCES centres(id),
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open','acknowledged','investigating','resolved')),
    risk_factors TEXT[] DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_instructor_metrics_date ON instructor_metrics_daily(date);
CREATE INDEX IF NOT EXISTS idx_instructor_metrics_instructor ON instructor_metrics_daily(instructor_id);
CREATE INDEX IF NOT EXISTS idx_centre_metrics_date ON centre_metrics_daily(date);
CREATE INDEX IF NOT EXISTS idx_surveillance_alerts_status ON surveillance_alerts(status);
