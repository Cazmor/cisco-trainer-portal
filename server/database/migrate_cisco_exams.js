const { query } = require('./db');

async function migrate() {
    console.log('Running cisco_exam_results migration...');

    await query(`
        CREATE TABLE IF NOT EXISTS cisco_exam_results (
            id SERIAL PRIMARY KEY,
            student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
            upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

            -- Completion
            final_exam_submitted BOOLEAN,
            survey_submitted BOOLEAN,
            completion DECIMAL(5,2),

            -- Skills Assessments
            final_exam_score DECIMAL(5,2),
            skills_ch10_14 DECIMAL(5,2),
            skills_ch1_9 DECIMAL(5,2),
            skills_exams_avg DECIMAL(5,2),

            -- Module Exams (1-14)
            mod1_exam DECIMAL(5,2),
            mod2_exam DECIMAL(5,2),
            mod3_exam DECIMAL(5,2),
            mod4_exam DECIMAL(5,2),
            checkpoint_1_4 DECIMAL(5,2),
            mod5_exam DECIMAL(5,2),
            mod6_exam DECIMAL(5,2),
            checkpoint_5_6 DECIMAL(5,2),
            mod7_exam DECIMAL(5,2),
            mod8_exam DECIMAL(5,2),
            checkpoint_7_8 DECIMAL(5,2),
            mod9_exam DECIMAL(5,2),
            mod10_exam DECIMAL(5,2),
            mod11_exam DECIMAL(5,2),
            checkpoint_10_11 DECIMAL(5,2),
            mod12_exam DECIMAL(5,2),
            mod13_exam DECIMAL(5,2),
            checkpoint_12_13 DECIMAL(5,2),
            mod14_exam DECIMAL(5,2),
            chapter_checkpoint_avg DECIMAL(5,2),

            -- Practice Finals
            practice_final_1_9 DECIMAL(5,2),
            practice_final_10_14 DECIMAL(5,2),
            practice_finals_avg DECIMAL(5,2),

            -- Final Exams
            final_exam_1_9 DECIMAL(5,2),
            final_exam_10_14 DECIMAL(5,2),
            it_essentials_final DECIMAL(5,2),
            final_exams_avg DECIMAL(5,2),

            -- Certification Practice
            cert_practice_1101 DECIMAL(5,2),
            cert_practice_1102 DECIMAL(5,2),
            cert_practice_avg DECIMAL(5,2),

            -- Overall
            class_grade DECIMAL(5,2),

            centre_id INTEGER REFERENCES centres(id),
            uploaded_by INTEGER REFERENCES users(id),
            UNIQUE(student_id)
        )
    `);

    console.log('cisco_exam_results table created (or already exists).');

    // Also update the csv template
    const templateHeader = [
        'NAME','EMAIL','Final Exam Submitted','Survey Submitted','Completion','Final Exam Score',
        'Chapter 10 - 14 Skills Assessment','Chapter 1 - 9 Skills Assessment','Skills Exams( Average )',
        'Module 1: Module Exam','Module 2: Module Exam','Module 3: Module Exam','Module 4: Module Exam',
        'Checkpoint Exam Modules 1-4','Module 5: Module Exam','Module 6: Module Exam',
        'Checkpoint Exam Modules 5-6','Module 7: Module Exam','Module 8: Module Exam',
        'Checkpoint Exam Modules 7-8','Module 9: Module Exam','Module 10: Module Exam',
        'Module 11: Module Exam','Checkpoint Exam Modules 10-11','Module 12: Module Exam',
        'Module 13: Module Exam','Checkpoint Exam Modules 12-13','Module 14: Module Exam',
        'Chapter and Checkpoint Exams( Average )','Practice Final Exam Modules 1-9',
        'Practice Final Exam Modules 10-14','Practice Final Exams( Average )',
        'Final Exam Modules 1-9','Final Exam Modules 10-14','IT Essentials Course Final Exam',
        'Final Exams( Average )','IT Essentials A+ 220-1101 Certification Practice Exam',
        'IT Essentials A+ 220-1102 Certification Practice Exam',
        'Certification Practice Exams( Average )','Class Grade %'
    ].join('\t');

    const templateExample = [
        'John Doe','john@example.com','Yes','Yes','100','88.5',
        '90','85','87.5',
        '80','75','82','90','81.75','78','85','81.5','88','92','90','86','79','81','80','83','85','84','88','83.5',
        '80','85','82.5','88','90','89','89','85','82','83.5','88.2'
    ].join('\t');

    await query(
        `INSERT INTO csv_templates (type, content) VALUES ($1, $2)
         ON CONFLICT (type) DO UPDATE SET content = $2, updated_at = NOW()`,
        ['performance', templateHeader + '\n' + templateExample]
    );
    console.log('Performance CSV template updated in DB.');

    process.exit(0);
}

migrate().catch(e => { console.error('Migration failed:', e.message); process.exit(1); });
