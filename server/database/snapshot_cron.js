const { Pool } = require('pg');
const { makeDbConfig } = require('./poolConfig');
require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env') });
const pool = new Pool(makeDbConfig());

async function runIntelligentSnapshot() {
    console.log('[' + new Date().toISOString() + '] Starting intelligent surveillance snapshot...');
    try {
        const instructors = await pool.query("SELECT id, centre_id, name FROM users WHERE role = 'instructor' AND status = 'active'");
        
        let processed = 0;
        let alertsGenerated = 0;

        for (const inst of instructors.rows) {
            try {
                // REAL student count
                const studentResult = await pool.query(
                    "SELECT COUNT(*) as count FROM students WHERE centre_id = $1 AND status = 'active'",
                    [inst.centre_id]
                );
                const studentCount = parseInt(studentResult.rows[0]?.count) || 0;

                // REAL KPI data from performance scores
                const perfResult = await pool.query(
                    "SELECT AVG(total_score) as avg_score, COUNT(*) as modules_count, MAX(ps.created_at) as last_score_date FROM performance_scores ps JOIN students s ON ps.student_id = s.id WHERE s.centre_id = $1",
                    [inst.centre_id]
                );
                
                // REAL attendance data
                const attResult = await pool.query(
                    "SELECT COUNT(*) as total, COUNT(CASE WHEN ar.status='P' THEN 1 END) as present, MAX(ar.created_at) as last_att_date FROM attendance_records ar JOIN students s ON ar.student_id = s.id WHERE s.centre_id = $1 AND ar.date >= CURRENT_DATE - INTERVAL '30 days'",
                    [inst.centre_id]
                );
                
                // REAL report submissions
                const reportResult = await pool.query(
                    "SELECT COUNT(*) as count, MAX(created_at) as last_report_date FROM weekly_reports WHERE centre_id = $1 AND status = 'submitted' AND week_start_date >= CURRENT_DATE - INTERVAL '30 days'",
                    [inst.centre_id]
                );
                
                // REAL intervention data
                const interventionResult = await pool.query(
                    "SELECT COUNT(*) as total, COUNT(CASE WHEN i.status='resolved' THEN 1 END) as resolved, MAX(i.created_at) as last_intervention_date FROM interventions i JOIN students s ON i.student_id = s.id WHERE s.centre_id = $1",
                    [inst.centre_id]
                );
                
                // REAL innovation data
                const innovationResult = await pool.query(
                    "SELECT COUNT(*) as count, MAX(created_at) as last_innovation_date FROM innovation_log WHERE centre_id = $1 AND created_at >= CURRENT_DATE - INTERVAL '90 days'",
                    [inst.centre_id]
                );
                
                // REAL CPD data
                const cpdResult = await pool.query(
                    "SELECT COUNT(*) as count, COALESCE(SUM(hours_completed),0) as total_hours, MAX(created_at) as last_cpd_date FROM professional_development WHERE user_id = $1",
                    [inst.id]
                );
                
                // Lab health from workstations
                const labResult = await pool.query(
                    "SELECT COUNT(*) as total, COUNT(CASE WHEN status='functional' THEN 1 END) as functional FROM lab_workstations WHERE centre_id = $1",
                    [inst.centre_id]
                );
                const labHealth = labResult.rows[0]?.total > 0 ? Math.round((labResult.rows[0].functional / labResult.rows[0].total) * 100) : 0;
                
                // INTELLIGENT EVIDENCE AGE CALCULATION
                const dates = [
                    perfResult.rows[0]?.last_score_date,
                    attResult.rows[0]?.last_att_date,
                    reportResult.rows[0]?.last_report_date,
                    interventionResult.rows[0]?.last_intervention_date,
                    innovationResult.rows[0]?.last_innovation_date,
                    cpdResult.rows[0]?.last_cpd_date
                ].filter(d => d != null).map(d => new Date(d).getTime());

                let evidenceAge = 0;
                if (dates.length > 0) {
                    const mostRecent = Math.max(...dates);
                    const diffTime = Math.abs(new Date().getTime() - mostRecent);
                    evidenceAge = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
                } else {
                    // No evidence at all
                    evidenceAge = 999; 
                }

                // CALCULATE INTELLIGENT KPI (out of 50)
                const avgScore = Math.round(parseFloat(perfResult.rows[0]?.avg_score) || 0);
                const attRate = attResult.rows[0]?.total > 0 ? Math.round((attResult.rows[0].present / attResult.rows[0].total) * 100) : 100; // default to 100% if no records yet but students exist
                const reportsSubmitted = parseInt(reportResult.rows[0]?.count) || 0;
                const interventionsResolved = parseInt(interventionResult.rows[0]?.resolved) || 0;
                const interventionsTotal = parseInt(interventionResult.rows[0]?.total) || 0;
                const innovations = parseInt(innovationResult.rows[0]?.count) || 0;
                const cpdCourses = parseInt(cpdResult.rows[0]?.count) || 0;
                const cpdHours = parseFloat(cpdResult.rows[0]?.total_hours) || 0;
                
                // SMART KPI CALCULATION - weighted by actual performance
                var kpiScore = 0;
                if (studentCount > 0) {
                    kpiScore += (avgScore / 100) * 10; // Performance contributes up to 10
                    kpiScore += (attRate / 100) * 10; // Attendance contributes up to 10
                } else {
                    // No students, give baseline for these so they aren't unfairly penalized
                    kpiScore += 20;
                }
                
                kpiScore += Math.min(reportsSubmitted, 4) * 2.5; // Reports up to 10
                
                if (interventionsTotal > 0) {
                    kpiScore += (interventionsResolved / interventionsTotal) * 5; // Interventions up to 5
                } else {
                    kpiScore += 5; // No interventions needed is a good thing
                }

                kpiScore += Math.min(innovations, 3) * 1.67; // Innovation up to 5
                kpiScore += Math.min(cpdCourses, 3) * 1.67; // CPD courses up to 5
                kpiScore += Math.min(cpdHours / 4, 1) * 5; // CPD hours up to 5
                
                var kpiOutOf50 = Math.round(Math.min(kpiScore, 50));
                
                // INTELLIGENT RISK CALCULATION
                var riskScore = 0;
                if (kpiOutOf50 < 25) riskScore += 30;
                else if (kpiOutOf50 < 35) riskScore += 20;
                else if (kpiOutOf50 < 45) riskScore += 10;
                
                if (studentCount > 0) {
                    if (attRate < 50) riskScore += 25;
                    else if (attRate < 70) riskScore += 15;
                    else if (attRate < 85) riskScore += 5;
                }
                
                if (reportsSubmitted < 2) riskScore += 20;
                else if (reportsSubmitted < 3) riskScore += 10;
                
                if (labResult.rows[0]?.total > 0) {
                    if (labHealth < 60) riskScore += 20;
                    else if (labHealth < 80) riskScore += 10;
                }
                
                if (evidenceAge > 30) riskScore += 15;
                else if (evidenceAge > 14) riskScore += 5;
                
                riskScore = Math.min(riskScore, 100);
                
                var riskLevel = [];
                riskLevel.push(riskScore > 60 ? 'High risk' : riskScore > 30 ? 'Moderate' : 'Low');
                if (studentCount === 0) riskLevel.push('No active students');
                if (reportsSubmitted === 0) riskLevel.push('No reports');
                if (cpdCourses === 0) riskLevel.push('No CPD');
                
                await pool.query(
                    "INSERT INTO instructor_metrics_daily (instructor_id, centre_id, kpi_out_of_50, evidence_age_days_max, risk_score_0_100, risk_factors, date) VALUES ($1, $2, $3, $4, $5, $6, CURRENT_DATE) ON CONFLICT (instructor_id, date) DO UPDATE SET kpi_out_of_50 = EXCLUDED.kpi_out_of_50, evidence_age_days_max = EXCLUDED.evidence_age_days_max, risk_score_0_100 = EXCLUDED.risk_score_0_100, risk_factors = EXCLUDED.risk_factors, centre_id = EXCLUDED.centre_id",
                    [inst.id, inst.centre_id, kpiOutOf50, evidenceAge, riskScore, riskLevel]
                );
                
                if (riskScore > 60) {
                    await pool.query(
                        "INSERT INTO surveillance_alerts (alert_type, category, message, instructor_id) VALUES ($1, $2, $3, $4)",
                        ['red', 'High Risk Alert', inst.name + ' has risk score ' + riskScore + '/100. KPI: ' + kpiOutOf50 + '/50. Factors: ' + riskLevel.join(' | '), inst.id]
                    );
                    alertsGenerated++;
                } else if (riskScore > 30 && evidenceAge > 14) {
                    await pool.query(
                        "INSERT INTO surveillance_alerts (alert_type, category, message, instructor_id) VALUES ($1, $2, $3, $4)",
                        ['amber', 'Evidence Aging', inst.name + ' has evidence ' + evidenceAge + ' days old. Risk: ' + riskScore + '/100', inst.id]
                    );
                    alertsGenerated++;
                }
                
                console.log(`Processed ${inst.name}: KPI=${kpiOutOf50}/50, Risk=${riskScore}/100, Students=${studentCount}, Evidence Age=${evidenceAge} days`);
                processed++;

            } catch (err) {
                console.error(`Error processing instructor ${inst.name} (ID: ${inst.id}):`, err.message);
            }
        }
        
        // Centre health
        console.log('Calculating centre health...');
        const centres = await pool.query("SELECT id FROM centres");
        for (const ct of centres.rows) {
            try {
                const metrics = await pool.query("SELECT AVG(kpi_out_of_50) as avg_kpi, AVG(risk_score_0_100) as avg_risk FROM instructor_metrics_daily WHERE centre_id = $1 AND date = CURRENT_DATE", [ct.id]);
                const health = Math.max(0, 100 - Math.round(parseFloat(metrics.rows[0]?.avg_risk) || 0));
                await pool.query("INSERT INTO centre_metrics_daily (centre_id, avg_kpi_out_of_50, centre_health_0_100) VALUES ($1, $2, $3)", [ct.id, Math.round(parseFloat(metrics.rows[0]?.avg_kpi) || 0), health]);
            } catch (err) {
                console.error(`Error calculating health for centre ID ${ct.id}:`, err.message);
            }
        }
        
        console.log(`[${new Date().toISOString()}] Intelligent snapshot complete! Processed ${processed} instructors, generated ${alertsGenerated} alerts.`);
    } catch (error) { 
        console.error('Fatal Snapshot error:', error.message); 
    }
    finally { 
        await pool.end(); 
    }
}
runIntelligentSnapshot();
