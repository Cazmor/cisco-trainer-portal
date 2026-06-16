const { query } = require('./server/database/db');
async function init() {
    await query('CREATE TABLE IF NOT EXISTS csv_templates (type VARCHAR(50) PRIMARY KEY, content TEXT, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_by INTEGER)');
    const defs = {
        students: 'first_name,last_name,email,phone,stream,status,emergency_contact,notes\nJohn,Doe,john@example.com,1234567890,Love,active,Jane Doe,Good student',
        performance: 'student_id,module_number,module_name,quiz_score,practical_score,exam_score\n1,1,Intro to Networks,85,90,88',
        laptops: 'ITEM,DEVICE MODEL,SERIALNUMBER,ASSIGNED TO,DESIGNATION,CONDITION,UAF SIGNED,UAF SIGN DATE,NOTES\n1,Dell Latitude,DL-001,John,Instructor,Good,Yes,2025-12-31,',
        equipment: 'Station,Item,Model,Serial Number,Location,Working/Not working,Comment\n1,Mercer Monitor,Mecer,VGA001,Computer Lab,Working,',
        devices: 'DEVICE TYPE,MODEL,SERIAL NUMBER,LOCATION,CONDITION,NOTES\nProjector,Epson EB-X41,EPS-001,Lab Room A,Available,'
    };
    for (const [k, v] of Object.entries(defs)) {
        await query('INSERT INTO csv_templates (type, content) VALUES ($1, $2) ON CONFLICT (type) DO NOTHING', [k, v]);
    }
    console.log('Templates seeded');
    process.exit(0);
}
init();
