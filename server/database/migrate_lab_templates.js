const { query } = require('./db');
async function run() {
    console.log('Updating lab templates in DB...');
    const defs = {
        laptops: 'TYPE,DEVICE MODEL,SERIALNUMBER,ASSIGNED TO,DESIGNATION,CONDITION,UAF SIGNED,NOTES\nLaptop,Dell Latitude,DL-001,John Doe,Instructor,Good,Yes,No issues',
        equipment: 'Station,Item,Model,Serial Number,Location,CPU Lockable,Working/ Not working,COMMENT\n1,Monitor,Mecer,VGA001,Computer Lab,Yes,Working,',
        devices: 'DEVICE TYPE,MODEL,SERIAL NUMBER,LOCATION,ASSIGNED TO,CONDITION,NOTES\nProjector,Epson EB-X41,EPS-001,Lab Room A,,Available,'
    };
    for (const [k, v] of Object.entries(defs)) {
        await query(
            'INSERT INTO csv_templates (type, content) VALUES ($1, $2) ON CONFLICT (type) DO UPDATE SET content = $2, updated_at = NOW()',
            [k, v]
        );
    }
    console.log('Lab CSV templates updated in database successfully.');
    process.exit(0);
}
run().catch(e => { console.error(e); process.exit(1); });
