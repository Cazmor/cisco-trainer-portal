var kpiData = null;
var currentScoringKPI = null;

async function loadKPIPage() {
    var contentArea = document.getElementById('contentArea');
    if (!contentArea) return;
    var user = getUser();
    contentArea.innerHTML = '<div class="kpi-container"><div class="kpi-header"><h2><i class="fas fa-trophy"></i> Cisco Trainer Performance Scorecard 2026</h2><div><button class="btn btn-outline" onclick="loadKPIPage()"><i class="fas fa-sync"></i> Refresh</button>' + (user.role === 'super_admin' ? '<button class="btn btn-primary" onclick="showRankings()"><i class="fas fa-medal"></i> Rankings</button>' : '') + '</div></div><div class="kpi-overall-score" id="overallScore"><p>Loading...</p></div><div class="kpi-grid" id="kpiGrid"></div></div><div id="scoringModal" class="modal"><div class="modal-content" style="max-width:950px"><div class="modal-header"><h3 id="scoringTitle">Sub-Objective Scoring</h3><button class="modal-close" onclick="hideModal(\'scoringModal\')">&times;</button></div><div id="scoringContent"></div><div class="modal-footer"><button class="btn btn-outline" onclick="hideModal(\'scoringModal\')">Cancel</button><button class="btn btn-primary" onclick="saveSubScores()"><i class="fas fa-save"></i> Save Scores</button></div></div></div><div id="rankingsModal" class="modal"><div class="modal-content" style="max-width:800px"><div class="modal-header"><h3>Instructor Rankings</h3><button class="modal-close" onclick="hideModal(\'rankingsModal\')">&times;</button></div><div id="rankingsContent"></div></div></div>';
    await loadKPIData();
}

var kpiDefinitions = [
    {
        id: 1, name: 'Maintain >90% Lab Computers Uptime', target: '>90%', icon: 'fa-desktop',
        subObjectives: [
            { name: 'Achieve 90% uptime', scale: ['<60%','60-69%','70-79%','80-89%','>90%'], evidence: 'lab', autoScore: true },
            { name: 'Maintenance logs submitted', scale: ['1-24%','25-49%','50-74%','75-99%','100%'], evidence: 'maintenance', autoScore: true },
            { name: 'Preventive maintenance done', scale: ['0-1','2-4','5-7','8-9','All'], evidence: 'preventive', autoScore: true },
            { name: 'No major lab downtime', scale: ['>4','3-4','2','1','0'], evidence: 'maintenance', autoScore: true }
        ]
    },
    {
        id: 2, name: 'Deliver 12+ Hours Training/Month', target: '>12 hrs', icon: 'fa-chalkteboard-teacher',
        subObjectives: [
            { name: 'Hands-on training hours delivered', scale: ['<10','10-11','12-13','14','>15'], evidence: 'delivery', autoScore: true },
            { name: '60% average student attendance', scale: ['<40%','40-49%','50-59%','60-69%','>70%'], evidence: 'attendance', autoScore: true },
            { name: '70% practical participation', scale: ['<40%','40-49%','50-59%','60-69%','>70%'], evidence: 'performance', autoScore: true }
        ]
    },
    {
        id: 3, name: 'Achieve >85% Learner Pass-Rate', target: '>85%', icon: 'fa-graduation-cap',
        subObjectives: [
            { name: 'Extra revision sessions held', scale: ['1','2','3','4','>5'], evidence: 'interventions', autoScore: true },
            { name: 'Individual feedback given', scale: ['<40%','40-59%','60-74%','75-89%','>90%'], evidence: 'feedback', autoScore: true },
            { name: 'Progress tracking maintained', scale: ['Monthly','Bi-weekly','Weekly','Near real-time','Real-time'], evidence: 'delivery', autoScore: true }
        ]
    },
    {
        id: 4, name: 'Provide Weekly Reports on Time', target: '5/5', icon: 'fa-file-alt',
        subObjectives: [
            { name: 'Reports submitted on time', scale: ['0-1','2','3','4','All'], evidence: 'reports', autoScore: true },
            { name: 'Data insights in reports', scale: ['<20%','<50%','>50%','>75%','100%'], evidence: 'reports', autoScore: true },
            { name: 'Actionable recommendations 80%+', scale: ['<40%','40-59%','60-79%','80-89%','>90%'], evidence: 'reports', autoScore: true }
        ]
    },
    {
        id: 5, name: 'Quarterly Surveys >60% Satisfaction', target: '>60%', icon: 'fa-smile',
        subObjectives: [
            { name: 'Survey response rate 70%', scale: ['<40%','40-49%','50-59%','60-69%','>70%'], evidence: 'feedback', autoScore: true },
            { name: 'Learner satisfaction >65%', scale: ['<40%','40-49%','50-59%','60-69%','>70%'], evidence: 'feedback', autoScore: true },
            { name: 'Issues documented & discussed', scale: ['Documented','50% discussed','75% discussed','90% discussed','100% resolved'], evidence: 'feedback', autoScore: true }
        ]
    },
    {
        id: 6, name: 'Complete 2 Cisco PD Courses/Year', target: '2 courses', icon: 'fa-certificate',
        subObjectives: [
            { name: 'Enrolled in Professional Skills', scale: ['<50%','Started 1','Enrolled 2','Active','Fully engaged'], evidence: 'cpd', autoScore: true },
            { name: 'Shared insights with team', scale: ['<25%','50%','Often','Consistently','Systematically'], evidence: 'insights', autoScore: true },
            { name: 'Completed 4+ hours training', scale: ['<2 hrs','2-2.9','3-3.9','4 hrs','>4 hrs'], evidence: 'cpd', autoScore: true }
        ]
    },
    {
        id: 7, name: 'Implement 1 New IT Methodology/Term', target: '1/term', icon: 'fa-lightbulb',
        subObjectives: [
            { name: 'Documented impact on engagement', scale: ['Poorly documented','Some evidence','Clear doc','Well-doc+data','Data+reflection'], evidence: 'innovation', autoScore: true },
            { name: 'Achieved 10% improvement', scale: ['1-4%','5-7%','8-9%','>10%','Sustained >10%'], evidence: 'innovation', autoScore: true },
            { name: 'Shared with IT Manager', scale: ['Verbal only','Email','With evidence','Formally proposed','Endorsed'], evidence: 'innovation', autoScore: true }
        ]
    }
];

var subScores = {};

async function loadKPIData() {
    try { 
        showLoading(); 
        kpiData = await API.kpi.getScorecard(); 
        subScores = JSON.parse(localStorage.getItem('kpiSubScores') || '{}'); await autoScoreFromSystem(); localStorage.setItem('kpiSubScores', JSON.stringify(subScores));
        renderKPIScorecard(); 
        hideLoading(); 
    } catch (e) { hideLoading(); showToast('Error: '+e.message,'error'); }
}

async function autoScoreFromSystem() {
    try {
        var labStatus = await API.lab.getStatus();
        var labHealth = labStatus.summary ? labStatus.summary.health_percentage : 0;
        var maintenanceLogs = await API.lab.getMaintenance();
        var preventive = await API.lab.getPreventive();
        var downtimeIncidents = maintenanceLogs.filter(function(l) { return l.status !== 'resolved'; }).length;
        var logsSubmitted = maintenanceLogs.length;
        var preventiveDone = preventive.filter(function(p) { return p.status === 'completed'; }).length;
        var totalPreventive = preventive.length;
        
        var attendance = await API.attendance.getStats({ start_date: '2026-01-01', end_date: getToday() });
        var avgAttendance = 0;
        if (attendance.length > 0) { var sum = 0; for (var a = 0; a < attendance.length; a++) sum += parseFloat(attendance[a].percentage); avgAttendance = Math.round(sum / attendance.length); }
        
        var plans = await API.classes.getDeliveryPlan();
        var trainingHours = plans.reduce(function(s, p) { return s + (p.completed_hours || 0); }, 0);
        
        var performance = await API.performance.getSummary();
        var avgScore = 0;
        if (performance.length > 0) { var psum = 0; for (var p = 0; p < performance.length; p++) psum += parseFloat(performance[p].avg_score); avgScore = Math.round(psum / performance.length); }
        
        var interventions = await API.performance.getInterventions();
        var resolvedInterventions = interventions.filter(function(i) { return i.status === 'resolved'; }).length;
        var feedback = await API.performance.getFeedback();
        var feedbackCount = feedback.length;
        
        var weeklyReports = await API.reports.getWeekly();
        var submittedReports = weeklyReports.filter(function(r) { return r.status === 'submitted'; }).length;
        
        var cpdEntries = await API.settings.getDevelopment();
        var cpdCount = cpdEntries.length;
        var cpdHours = cpdEntries.reduce(function(s, c) { return s + (parseFloat(c.hours_completed) || 0); }, 0);
        
        var innovations = await API.classes.getInnovation();
        var innovCount = innovations.length;
        
        var key = 'kpi_1';
        if (!subScores[key]) {
            var labScore = labHealth >= 90 ? 5 : labHealth >= 80 ? 4 : labHealth >= 70 ? 3 : labHealth >= 60 ? 2 : 1;
            var logScore = logsSubmitted >= 10 ? 5 : logsSubmitted >= 7 ? 4 : logsSubmitted >= 5 ? 3 : logsSubmitted >= 2 ? 2 : 1;
            var prevScore = totalPreventive > 0 ? (preventiveDone >= totalPreventive ? 5 : preventiveDone >= totalPreventive*0.75 ? 4 : preventiveDone >= totalPreventive*0.5 ? 3 : preventiveDone >= totalPreventive*0.25 ? 2 : 1) : 3;
            var downtimeScore = downtimeIncidents === 0 ? 5 : downtimeIncidents === 1 ? 4 : downtimeIncidents === 2 ? 3 : downtimeIncidents <= 4 ? 2 : 1;
            subScores[key] = [labScore, logScore, prevScore, downtimeScore];
        }
        
        key = 'kpi_2';
        if (!subScores[key]) {
            var hourScore = trainingHours >= 15 ? 5 : trainingHours >= 14 ? 4 : trainingHours >= 12 ? 3 : trainingHours >= 10 ? 2 : 1;
            var attScore = avgAttendance >= 70 ? 5 : avgAttendance >= 60 ? 4 : avgAttendance >= 50 ? 3 : avgAttendance >= 40 ? 2 : 1;
            var pracScore = avgScore >= 70 ? 5 : avgScore >= 60 ? 4 : avgScore >= 50 ? 3 : avgScore >= 40 ? 2 : 1;
            subScores[key] = [hourScore, attScore, pracScore];
        }
        
        key = 'kpi_3';
        if (!subScores[key]) {
            var revScore = resolvedInterventions >= 5 ? 5 : resolvedInterventions >= 4 ? 4 : resolvedInterventions >= 3 ? 3 : resolvedInterventions >= 2 ? 2 : 1;
            var fbScore = feedbackCount >= 20 ? 5 : feedbackCount >= 15 ? 4 : feedbackCount >= 10 ? 3 : feedbackCount >= 5 ? 2 : 1;
            subScores[key] = [revScore, fbScore, 3];
        }
        
        key = 'kpi_4';
        if (!subScores[key]) {
            var reportScore = submittedReports >= 5 ? 5 : submittedReports >= 4 ? 4 : submittedReports >= 3 ? 3 : submittedReports >= 2 ? 2 : 1;
            var insightScore = submittedReports >= 4 ? 4 : submittedReports >= 2 ? 3 : 2;
            var actionScore = submittedReports >= 5 ? 5 : submittedReports >= 3 ? 4 : submittedReports >= 1 ? 3 : 2;
            subScores[key] = [reportScore, insightScore, actionScore];
        }
        
        key = 'kpi_5';
        if (!subScores[key]) {
            var fbScore = feedbackCount >= 10 ? 4 : feedbackCount >= 5 ? 3 : feedbackCount >= 1 ? 2 : 1;
            var satScore = avgPerf >= 70 ? 4 : avgPerf >= 50 ? 3 : 2;
            var docScore = feedbackCount >= 15 ? 5 : feedbackCount >= 10 ? 4 : feedbackCount >= 5 ? 3 : 2;
            subScores[key] = [fbScore, satScore, docScore];
        }
        
        key = 'kpi_6';
        if (!subScores[key]) {
            var cpdScore = cpdCount >= 2 ? 5 : cpdCount >= 1 ? 3 : 1;
            var insights = JSON.parse(localStorage.getItem('teamInsights') || '[]');
            var shareScore = insights.length >= 5 ? 5 : insights.length >= 3 ? 4 : insights.length >= 1 ? 3 : 1;
            var hourCPD = cpdHours >= 4 ? 5 : cpdHours >= 3 ? 4 : cpdHours >= 2 ? 3 : cpdHours >= 1 ? 2 : 1;
            subScores[key] = [cpdScore, shareScore, hourCPD];
        }
        
        key = 'kpi_7';
        if (!subScores[key]) {
            var innovScore = innovCount >= 3 ? 5 : innovCount >= 2 ? 4 : innovCount >= 1 ? 3 : 1;
            var impactScore = innovCount >= 2 ? 4 : innovCount >= 1 ? 3 : 1;
            var shareInnovScore = innovCount >= 2 ? 4 : innovCount >= 1 ? 3 : 2;
            subScores[key] = [innovScore, impactScore, shareInnovScore];
        }
        
        localStorage.setItem('kpiSubScores', JSON.stringify(subScores));
    } catch (e) { console.error('Auto-score error:', e); }
}

function renderKPIScorecard() {
    var totalSubScore = 0, totalSubCount = 0;
    for (var i = 0; i < kpiDefinitions.length; i++) {
        var def = kpiDefinitions[i];
        var key = 'kpi_' + def.id;
        var scores = subScores[key] || [];
        if (scores.length === 0) { scores = []; for (var x = 0; x < def.subObjectives.length; x++) scores.push(def.subObjectives[x].defaultScore || 1); }
        for (var s = 0; s < scores.length; s++) { totalSubScore += scores[s]; totalSubCount++; }
    }
    var maxPossible = totalSubCount * 5;
    var kpiWeightedScore = Math.round((totalSubScore / maxPossible) * 50);
    var overallRating = kpiWeightedScore >= 45 ? 5 : kpiWeightedScore >= 35 ? 4 : kpiWeightedScore >= 25 ? 3 : kpiWeightedScore >= 15 ? 2 : 1;
    
    document.getElementById('overallScore').innerHTML = '<p>KPI Performance Score (50% Weight)</p><h2>' + kpiWeightedScore + '/50</h2><p style="font-size:14px">Rating: <strong>' + getRatingText(overallRating) + '</strong> | ' + totalSubScore + '/' + maxPossible + ' points | ' + totalSubCount + ' objectives</p>';
    
    var grid = document.getElementById('kpiGrid');
    var html = '';
    for (var j = 0; j < kpiDefinitions.length; j++) {
        var def = kpiDefinitions[j];
        var key = 'kpi_' + def.id;
        var scores = subScores[key] || [];
        var sum = 0; for (var ss = 0; ss < scores.length; ss++) sum += scores[ss];
        var avg = Math.round(sum / Math.max(scores.length, 1));
        var pct = Math.round((avg / 5) * 100);
        var level = pct >= 90 ? 'excellent' : pct >= 70 ? 'good' : pct >= 50 ? 'average' : 'poor';
        
        html += '<div class="kpi-card kpi-' + level + '"><div class="kpi-card-header"><div class="kpi-card-title"><i class="fas ' + def.icon + '" style="margin-right:8px;color:#8b5cf6"></i>KPI ' + def.id + ': ' + def.name + '</div></div><div class="kpi-value-display"><span class="kpi-value">' + avg + '</span><span class="kpi-unit">/5</span><div class="kpi-target">Target: ' + def.target + '</div></div><div style="text-align:center;margin:8px 0;font-size:20px">' + getStarsHTML(avg) + '</div><div class="kpi-scale">' + scores.length + ' sub-objectives | Avg: ' + avg + '/5</div><button class="kpi-evidence-btn" onclick="showScoringModal(' + def.id + ')"><i class="fas fa-edit"></i> Score Sub-Objectives</button></div>';
    }
    grid.innerHTML = html;
}

function showScoringModal(kpiId) {
    var def = kpiDefinitions.find(function(d) { return d.id === kpiId; }); if (!def) return;
    currentScoringKPI = kpiId;
    document.getElementById('scoringTitle').textContent = 'KPI ' + kpiId + ': ' + def.name;
    var content = document.getElementById('scoringContent');
    var key = 'kpi_' + kpiId;
    var scores = subScores[key] || [];
    
    var html = '<p style="margin-bottom:16px;color:var(--text-secondary)"><i class="fas fa-info-circle"></i> Rate each sub-objective 1-5. Click <i class="fas fa-eye"></i> to view system evidence.</p><table><thead><tr><th>#</th><th>Sub-Objective</th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th><th>Evidence</th></tr></thead><tbody>';
    for (var i = 0; i < def.subObjectives.length; i++) {
        var sub = def.subObjectives[i];
        html += '<tr><td>'+(i+1)+'</td><td><strong>'+sub.name+'</strong><br><small>'+sub.scale.join(' | ')+'</small>' + (sub.note ? '<br><small style="color:#f59e0b"><i class="fas fa-clock"></i> '+sub.note+'</small>' : '') + '</td>';
        for (var r = 1; r <= 5; r++) html += '<td style="text-align:center"><input type="radio" name="sub_'+i+'" value="'+r+'" '+(scores.length>i&&scores[i]===r?'checked':'')+'></td>';
        html += '<td><button class="btn btn-sm btn-outline" onclick="viewSubEvidence(\''+sub.evidence+'\')"><i class="fas fa-eye"></i></button></td>';
        html += '</tr>';
    }
    html += '</tbody></table>';
    content.innerHTML = html;
    showModal('scoringModal');
}

function viewSubEvidence(evidenceType) {
    hideModal('scoringModal');
    if (evidenceType === 'lab' || evidenceType === 'maintenance' || evidenceType === 'preventive') {
        navigateTo('lab');
    } else if (evidenceType === 'attendance') {
        navigateTo('attendance');
    } else if (evidenceType === 'performance' || evidenceType === 'interventions' || evidenceType === 'feedback') {
        navigateTo('performance');
    } else if (evidenceType === 'delivery') {
        navigateTo('classes');
        setTimeout(function() { switchClassesTab('delivery'); }, 300);
    } else if (evidenceType === 'reports') {
        navigateTo('reports');
    } else if (evidenceType === 'innovation') {
        navigateTo('classes');
        setTimeout(function() { switchClassesTab('innovation'); }, 300);
    } else if (evidenceType === 'cpd') {
        navigateTo('settings');
        setTimeout(function() { switchSettingsTab('cpd'); }, 300);
    } else if (evidenceType === 'surveys') {
        showToast('Survey module coming soon', 'info');
    } else if (evidenceType === 'insights') {
        navigateTo('reports');
        setTimeout(function() { switchReportsTab('insights'); }, 300);
    }
}

function saveSubScores() {
    var def = kpiDefinitions.find(function(d) { return d.id === currentScoringKPI; }); if (!def) return;
    var scores = [];
    for (var i = 0; i < def.subObjectives.length; i++) {
        var sel = document.querySelector('input[name="sub_'+i+'"]:checked');
        scores.push(sel ? parseInt(sel.value) : (def.subObjectives[i].defaultScore || 1));
    }
    subScores['kpi_' + currentScoringKPI] = scores;
    localStorage.setItem('kpiSubScores', JSON.stringify(subScores));
    hideModal('scoringModal');
    showToast('Scores saved!', 'success');
    renderKPIScorecard();
}

function getStarsHTML(count) { var s=''; for(var i=0;i<5;i++) s+=i<count?'<i class="fas fa-star" style="color:#f59e0b"></i>':'<i class="far fa-star" style="color:#d1d5db"></i>'; return s; }
function getRatingText(rating) { var labels=['','Critical (1/5)','Poor (2/5)','Average (3/5)','Good (4/5)','Excellent (5/5)']; return labels[rating]||'N/A'; }

async function showRankings() {
    try { showLoading(); var rankings = await API.performance.getRankings(); var content = document.getElementById('rankingsContent'); var html = '<table><thead><tr><th>Rank</th><th>Instructor</th><th>Score</th><th>Rating</th></tr></thead><tbody>';
        for(var i=0;i<rankings.length;i++){var r=rankings[i];var stars=parseFloat(r.avg_score)>=90?5:parseFloat(r.avg_score)>=70?4:parseFloat(r.avg_score)>=50?3:2;html+='<tr><td>'+(i<3?['🥇','🥈','🥉'][i]:r.rank)+'</td><td><strong>'+r.first_name+' '+r.last_name+'</strong></td><td>'+parseFloat(r.avg_score).toFixed(1)+'%</td><td>'+getStarsHTML(stars)+'</td></tr>';}
        html+='</tbody></table>'; content.innerHTML=html; showModal('rankingsModal'); hideLoading();
    } catch (e) { hideLoading(); }
}
