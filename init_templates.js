const { query } = require('./server/database/db');
async function init() {
    await query('CREATE TABLE IF NOT EXISTS csv_templates (type VARCHAR(50) PRIMARY KEY, content TEXT, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_by INTEGER)');
    const defs = {
        students: 'First Name,Second Name,Email,Stream\nJohn,Doe,john@example.com,Love',
        performance: 'First Name,Second Name,Email,Stream,Module Number,Exam Score\nJohn,Doe,john@example.com,Love,1,88',
        laptops: 'TYPE,DEVICE MODEL,SERIALNUMBER,ASSIGNED TO,DESIGNATION,CONDITION,UAF SIGNED,NOTES\nLaptop,Dell Latitude,DL-001,John Doe,Instructor,Good,Yes,No issues',
        equipment: 'Station,Item,Model,Serial Number,Location,CPU Lockable,Working/ Not working,COMMENT\n1,Monitor,Mecer,VGA001,Computer Lab,Yes,Working,',
        devices: 'DEVICE TYPE,MODEL,SERIAL NUMBER,LOCATION,ASSIGNED TO,CONDITION,NOTES\nProjector,Epson EB-X41,EPS-001,Lab Room A,,Available,'
    };
    for (const [k, v] of Object.entries(defs)) {
        await query('INSERT INTO csv_templates (type, content) VALUES ($1, $2) ON CONFLICT (type) DO NOTHING', [k, v]);
    }
    console.log('Templates seeded');
    process.exit(0);
}
init();
