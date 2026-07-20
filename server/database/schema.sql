-- Cisco Trainer Progress Tracking System - Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Centres table
CREATE TABLE centres (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    centre_id INTEGER REFERENCES centres(id) ON DELETE SET NULL,
    photo_url VARCHAR(500),
    role VARCHAR(50) NOT NULL CHECK (role IN ('super_admin', 'admin', 'instructor', 'student')),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'pending', 'suspended')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Password resets table
CREATE TABLE password_resets (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Pending registrations table
CREATE TABLE pending_registrations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    centre_id INTEGER REFERENCES centres(id) ON DELETE SET NULL,
    role VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Students table
CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(50),
    stream VARCHAR(50) CHECK (stream IN ('Love', 'Joy', 'Peace', 'Mnara')),
    centre_id INTEGER REFERENCES centres(id) ON DELETE SET NULL,
    enrollment_date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'graduated', 'dropped')),
    photo_url VARCHAR(500),
    emergency_contact VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Attendance records table
CREATE TABLE attendance_records (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    status CHAR(1) NOT NULL CHECK (status IN ('P', 'A')),
    absence_reason VARCHAR(50) CHECK (absence_reason IN ('Sick', 'Family Emergency', 'No Reason', 'Other')),
    time_in TIME,
    notes TEXT,
    marked_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, date)
);

-- Performance scores table
CREATE TABLE performance_scores (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
    module_number INTEGER NOT NULL CHECK (module_number BETWEEN 1 AND 14),
    module_name VARCHAR(255) NOT NULL,
    quiz_score DECIMAL(5,2) CHECK (quiz_score >= 0 AND quiz_score <= 100),
    practical_score DECIMAL(5,2) CHECK (practical_score >= 0 AND practical_score <= 100),
    exam_score DECIMAL(5,2) CHECK (exam_score >= 0 AND exam_score <= 100),
    total_score DECIMAL(5,2) GENERATED ALWAYS AS ((COALESCE(quiz_score, 0) * 0.2 + COALESCE(practical_score, 0) * 0.4 + COALESCE(exam_score, 0) * 0.4)) STORED,
    grade CHAR(1) GENERATED ALWAYS AS (
        CASE 
            WHEN (COALESCE(quiz_score, 0) * 0.2 + COALESCE(practical_score, 0) * 0.4 + COALESCE(exam_score, 0) * 0.4) >= 80 THEN 'A'
            WHEN (COALESCE(quiz_score, 0) * 0.2 + COALESCE(practical_score, 0) * 0.4 + COALESCE(exam_score, 0) * 0.4) >= 70 THEN 'B'
            WHEN (COALESCE(quiz_score, 0) * 0.2 + COALESCE(practical_score, 0) * 0.4 + COALESCE(exam_score, 0) * 0.4) >= 60 THEN 'C'
            WHEN (COALESCE(quiz_score, 0) * 0.2 + COALESCE(practical_score, 0) * 0.4 + COALESCE(exam_score, 0) * 0.4) >= 50 THEN 'D'
            ELSE 'F'
        END
    ) STORED,
    date_entered DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, module_number)
);

-- Interventions table
CREATE TABLE interventions (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
    type VARCHAR(100) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'in-progress', 'resolved')),
    priority VARCHAR(50) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    date_initiated DATE DEFAULT CURRENT_DATE,
    date_resolved DATE,
    resolution_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Student feedback table
CREATE TABLE student_feedback (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL,
    feedback_text TEXT NOT NULL,
    given_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    date_given DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Lab workstations table
CREATE TABLE lab_workstations (
    id SERIAL PRIMARY KEY,
    workstation_number VARCHAR(50) NOT NULL,
    centre_id INTEGER REFERENCES centres(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'functional' CHECK (status IN ('functional', 'partial', 'down')),
    cpu_status BOOLEAN DEFAULT TRUE,
    monitor_status BOOLEAN DEFAULT TRUE,
    keyboard_status BOOLEAN DEFAULT TRUE,
    mouse_status BOOLEAN DEFAULT TRUE,
    network_status BOOLEAN DEFAULT TRUE,
    notes TEXT,
    last_checked DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Lab laptops table
CREATE TABLE lab_laptops (
    id SERIAL PRIMARY KEY,
    brand VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    serial_number VARCHAR(100) UNIQUE NOT NULL,
    centre_id INTEGER REFERENCES centres(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'available' CHECK (status IN ('available', 'assigned', 'maintenance', 'retired')),
    assigned_to INTEGER REFERENCES students(id) ON DELETE SET NULL,
    uaf_document_url VARCHAR(500),
    uaf_expiry_date DATE,
    warranty_expiry DATE,
    purchase_date DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Lab equipment table
CREATE TABLE lab_equipment (
    id SERIAL PRIMARY KEY,
    equipment_type VARCHAR(100) NOT NULL,
    brand VARCHAR(100),
    model VARCHAR(100),
    serial_number VARCHAR(100) UNIQUE,
    centre_id INTEGER REFERENCES centres(id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 1,
    status VARCHAR(50) DEFAULT 'available' CHECK (status IN ('available', 'in-use', 'maintenance', 'retired')),
    location VARCHAR(255),
    last_maintenance DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Lab other devices table
CREATE TABLE lab_other_devices (
    id SERIAL PRIMARY KEY,
    device_type VARCHAR(100) NOT NULL,
    brand VARCHAR(100),
    model VARCHAR(100),
    serial_number VARCHAR(100) UNIQUE,
    centre_id INTEGER REFERENCES centres(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'available' CHECK (status IN ('available', 'in-use', 'maintenance', 'retired')),
    location VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Maintenance logs table
CREATE TABLE maintenance_logs (
    id SERIAL PRIMARY KEY,
    device_type VARCHAR(50) NOT NULL,
    device_id INTEGER NOT NULL,
    centre_id INTEGER REFERENCES centres(id) ON DELETE CASCADE,
    issue_description TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'in-progress', 'resolved')),
    priority VARCHAR(50) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    reported_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    assigned_to VARCHAR(255),
    date_reported DATE DEFAULT CURRENT_DATE,
    date_resolved DATE,
    resolution_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Preventive maintenance table
CREATE TABLE preventive_maintenance (
    id SERIAL PRIMARY KEY,
    centre_id INTEGER REFERENCES centres(id) ON DELETE CASCADE,
    device_type VARCHAR(50) NOT NULL,
    device_id INTEGER NOT NULL,
    task_description TEXT NOT NULL,
    frequency VARCHAR(50) NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly', 'quarterly')),
    last_done DATE,
    next_due DATE NOT NULL,
    assigned_to VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'overdue')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Classes scheduled table
CREATE TABLE classes_scheduled (
    id SERIAL PRIMARY KEY,
    class_type VARCHAR(50) DEFAULT 'cisco' CHECK (class_type IN ('cisco', 'extra')),
    extra_type VARCHAR(100),
    stream VARCHAR(50),
    centre_id INTEGER REFERENCES centres(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    module_number INTEGER,
    module_name VARCHAR(255),
    topics TEXT,
    instructor_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Class evidence photos table
CREATE TABLE class_evidence_photos (
    id SERIAL PRIMARY KEY,
    class_id INTEGER REFERENCES classes_scheduled(id) ON DELETE CASCADE,
    photo_type VARCHAR(50) CHECK (photo_type IN ('before', 'during', 'after')),
    photo_url VARCHAR(500) NOT NULL,
    caption TEXT,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Timetable config table
CREATE TABLE timetable_config (
    id SERIAL PRIMARY KEY,
    day_of_week VARCHAR(20) NOT NULL,
    stream VARCHAR(50),
    centre_id INTEGER REFERENCES centres(id) ON DELETE CASCADE,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    session_type VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Delivery plans table
CREATE TABLE delivery_plans (
    id SERIAL PRIMARY KEY,
    term INTEGER NOT NULL CHECK (term IN (1, 2, 3)),
    centre_id INTEGER REFERENCES centres(id) ON DELETE CASCADE,
    stream VARCHAR(50) NOT NULL,
    total_hours INTEGER DEFAULT 0,
    completed_hours INTEGER DEFAULT 0,
    modules_planned TEXT,
    modules_completed TEXT,
    saturday_intensives INTEGER DEFAULT 0,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'planned' CHECK (status IN ('planned', 'in-progress', 'completed')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Module curriculum table
CREATE TABLE module_curriculum (
    id SERIAL PRIMARY KEY,
    module_number INTEGER NOT NULL,
    module_name VARCHAR(255) NOT NULL,
    section_number DECIMAL(4,1),
    section_name VARCHAR(255) NOT NULL,
    topics TEXT,
    centre_id INTEGER REFERENCES centres(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Innovation log table
CREATE TABLE innovation_log (
    id SERIAL PRIMARY KEY,
    centre_id INTEGER REFERENCES centres(id) ON DELETE CASCADE,
    term INTEGER NOT NULL,
    methodology_name VARCHAR(255) NOT NULL,
    description TEXT,
    documented_impact TEXT,
    performance_before DECIMAL(5,2),
    performance_after DECIMAL(5,2),
    shared_with_manager BOOLEAN DEFAULT FALSE,
    endorsement_received BOOLEAN DEFAULT FALSE,
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Daily reports table
CREATE TABLE daily_reports (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    centre_id INTEGER REFERENCES centres(id) ON DELETE CASCADE,
    streams TEXT[],
    topics_covered TEXT,
    engagement_level INTEGER CHECK (engagement_level BETWEEN 1 AND 5),
    challenges TEXT,
    next_steps TEXT,
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'submitted')),
    submitted_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Weekly reports table
CREATE TABLE weekly_reports (
    id SERIAL PRIMARY KEY,
    week_start_date DATE NOT NULL,
    week_end_date DATE NOT NULL,
    centre_id INTEGER REFERENCES centres(id) ON DELETE CASCADE,
    netacad_update TEXT,
    lab_update TEXT,
    centre_update TEXT,
    challenges TEXT,
    recommendations TEXT,
    attachment_urls TEXT[],
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'submitted')),
    submitted_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Maintenance reports table
CREATE TABLE maintenance_reports (
    id SERIAL PRIMARY KEY,
    report_date DATE NOT NULL,
    centre_id INTEGER REFERENCES centres(id) ON DELETE CASCADE,
    open_issues_count INTEGER DEFAULT 0,
    in_progress_count INTEGER DEFAULT 0,
    resolved_count INTEGER DEFAULT 0,
    critical_issues TEXT,
    upcoming_maintenance TEXT,
    recommendations TEXT,
    submitted_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Surveys table
CREATE TABLE surveys (
    id SERIAL PRIMARY KEY,
    centre_id INTEGER REFERENCES centres(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Survey questions table
CREATE TABLE survey_questions (
    id SERIAL PRIMARY KEY,
    survey_id INTEGER REFERENCES surveys(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_order INTEGER NOT NULL,
    question_type VARCHAR(50) DEFAULT 'rating',
    options JSONB
);

-- Survey responses table
CREATE TABLE survey_responses (
    id SERIAL PRIMARY KEY,
    question_id INTEGER REFERENCES survey_questions(id) ON DELETE CASCADE,
    student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
    score INTEGER NOT NULL CHECK (score BETWEEN 1 AND 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(question_id, student_id)
);

-- Professional development table
CREATE TABLE professional_development (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    course_name VARCHAR(255) NOT NULL,
    provider VARCHAR(255),
    hours_completed DECIMAL(5,1),
    status VARCHAR(50) DEFAULT 'in-progress' CHECK (status IN ('planned', 'in-progress', 'completed')),
    certificate_url VARCHAR(500),
    start_date DATE,
    completion_date DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notification preferences table
CREATE TABLE notification_preferences (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    email_reminders BOOLEAN DEFAULT TRUE,
    weekly_report_reminder BOOLEAN DEFAULT TRUE,
    maintenance_alerts BOOLEAN DEFAULT TRUE,
    uaf_expiry_reminders BOOLEAN DEFAULT TRUE,
    student_at_risk_alerts BOOLEAN DEFAULT TRUE,
    report_emails TEXT,
    reminder_time VARCHAR(10) DEFAULT '17:00',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- System settings table
CREATE TABLE system_settings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    language VARCHAR(50) DEFAULT 'en',
    theme VARCHAR(50) DEFAULT 'light',
    timezone VARCHAR(100) DEFAULT 'Africa/Nairobi',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AI conversations table
CREATE TABLE ai_conversations (
    id SERIAL PRIMARY KEY,
    conversation_type VARCHAR(100) NOT NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    centre_id INTEGER REFERENCES centres(id) ON DELETE CASCADE,
    user_messages JSONB DEFAULT '[]',
    ai_responses JSONB DEFAULT '[]',
    generated_content TEXT,
    saved_to_module BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_students_centre_id ON students(centre_id);
CREATE INDEX idx_students_stream ON students(stream);
CREATE INDEX idx_attendance_records_date ON attendance_records(date);
CREATE INDEX idx_attendance_records_student_id ON attendance_records(student_id);
CREATE INDEX idx_performance_scores_student_id ON performance_scores(student_id);
CREATE INDEX idx_performance_scores_module_number ON performance_scores(module_number);
CREATE INDEX idx_maintenance_logs_status ON maintenance_logs(status);
CREATE INDEX idx_maintenance_logs_centre_id ON maintenance_logs(centre_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_classes_scheduled_date ON classes_scheduled(date);
CREATE INDEX idx_daily_reports_date ON daily_reports(date);
CREATE INDEX idx_weekly_reports_dates ON weekly_reports(week_start_date, week_end_date);

-- CSV Templates table
CREATE TABLE csv_templates (
    type VARCHAR(50) PRIMARY KEY,
    content TEXT NOT NULL,
    updated_by INTEGER REFERENCES users(id),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
