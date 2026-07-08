const { query } = require('../server/database/db');

async function migrate() {
    try {
        console.log('Adding question_type and options to survey_questions...');
        await query("ALTER TABLE survey_questions ADD COLUMN IF NOT EXISTS question_type VARCHAR(50) DEFAULT 'rating'");
        await query("ALTER TABLE survey_questions ADD COLUMN IF NOT EXISTS options JSONB");
        
        console.log('Modifying survey_responses...');
        await query("ALTER TABLE survey_responses ALTER COLUMN score DROP NOT NULL");
        
        // Try dropping constraint if it exists. Postgres check constraints are usually named table_column_check. 
        // For score BETWEEN 1 AND 5, it's usually survey_responses_score_check
        try {
            await query("ALTER TABLE survey_responses DROP CONSTRAINT survey_responses_score_check");
            console.log('Dropped score check constraint.');
        } catch(e) {
            console.log('Constraint might not exist or already dropped: ', e.message);
        }
        
        await query("ALTER TABLE survey_responses ADD COLUMN IF NOT EXISTS response_text TEXT");
        
        console.log('Migration successful.');
    } catch (e) {
        console.error('Migration failed:', e);
    } finally {
        process.exit();
    }
}
migrate();
