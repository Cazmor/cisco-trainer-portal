const { query } = require('./db');

async function migrate() {
    console.log('Running survey_questions column migration...');
    try {
        await query(`
            ALTER TABLE survey_questions 
            ADD COLUMN IF NOT EXISTS question_type VARCHAR(50) DEFAULT 'rating'
        `);
        await query(`
            ALTER TABLE survey_questions 
            ADD COLUMN IF NOT EXISTS options JSONB
        `);
        console.log('survey_questions columns question_type and options successfully verified/added.');
    } catch (e) {
        console.error('Migration failed:', e.message);
        process.exit(1);
    }
    process.exit(0);
}

migrate();
