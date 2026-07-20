const { query } = require('./server/database/db');
async function check() {
    try {
        const tables = ['instructor_metrics_daily', 'centre_metrics_daily', 'surveillance_alerts', 'forensic_events'];
        for (const t of tables) {
            try {
                const res = await query(`SELECT COUNT(*) FROM ${t}`);
                console.log(`Table ${t} exists, row count:`, res.rows[0].count);
            } catch (e) {
                console.log(`Table ${t} ERROR:`, e.message);
            }
        }
    } catch (e) {
        console.error(e);
    }
    process.exit(0);
}
check();
