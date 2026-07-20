var currentReportsTab = 'daily';
var allDailyReports = [];
var allWeeklyReports = [];
var allMaintenanceReports = [];

async function loadReportsPage() {
    var contentArea = document.getElementById('contentArea');
    if (!contentArea) return;
    contentArea.innerHTML = '<div class="reports-container"><div class="performance-tabs"><button class="performance-tab active" onclick="switchReportsTab(\'daily\')"><i class="fas fa-calendar-day"></i> Daily</button><button class="performance-tab" onclick="switchReportsTab(\'weekly\')"><i class="fas fa-calendar-week"></i> Weekly</button><button class="performance-tab" onclick="switchReportsTab(\'maintenance\')"><i class="fas fa-tools"></i> Maintenance</button><button class="performance-tab" onclick="switchReportsTab(\'monthly\')"><i class="fas fa-chart-bar"></i> Data Insights</button><button class="performance-tab" onclick="switchReportsTab(\'insights\')"><i class="fas fa-share-alt"></i> Team Insights</button></div><div id="reportsContent"></div></div><div id="aiReportModal" class="modal"><div class="modal-content" style="max-width:800px"><div class="modal-header"><h3>AI-Assisted Daily Report</h3><button class="modal-close" onclick="hideModal(\'aiReportModal\')">&times;</button></div><form id="aiReportForm" onsubmit="saveAIReport(event)"><div class="form-row"><div class="form-group"><label>Date</label><input type="date" id="reportDate" class="form-control" required></div><div class="form-group"><label>Streams</label><select id="reportStreams" class="form-control" multiple style="height:80px"><option value="Love">Love</option><option value="Joy">Joy</option><option value="Peace">Peace</option><option value="Mnara">Mnara</option></select></div></div><div class="form-group"><label>NETACAD Training Update</label><textarea id="netacadUpdate" class="form-control" rows="4"></textarea></div><div class="form-group"><label>Lab Update</label><textarea id="labUpdate" class="form-control" rows="3"></textarea></div><div class="form-group"><label>Center Update</label><textarea id="centreUpdate" class="form-control" rows="3"></textarea></div><div class="form-group"><label>Challenges</label><textarea id="challenges" class="form-control" rows="2"></textarea></div><div class="form-group"><label>Recommendations</label><textarea id="recommendations" class="form-control" rows="2"></textarea></div><div class="form-group"><label>Engagement</label><select id="engagement" class="form-control"><option value="3">3 - Average</option><option value="1">1 - Very Low</option><option value="2">2 - Low</option><option value="4">4 - High</option><option value="5">5 - Very High</option></select></div><div class="modal-footer"><button type="button" class="btn btn-outline" onclick="generateAIReport()"><i class="fas fa-robot"></i> AI Generate</button><button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> Save</button></div></form></div></div><div id="insightModal" class="modal"><div class="modal-content"><div class="modal-header"><h3>Log Team Insight</h3><button class="modal-close" onclick="hideModal(\'insightModal\')">&times;</button></div><form id="insightForm" onsubmit="saveInsight(event)"><div class="form-group"><label>Date</label><input type="date" id="insightDate" class="form-control" required></div><div class="form-group"><label>Platform</label><select id="insightPlatform" class="form-control" required><option value="">Select</option><option value="WhatsApp">WhatsApp</option><option value="Email">Email</option><option value="SMS">SMS</option><option value="Other">Other</option></select></div><div class="form-group"><label>Summary</label><textarea id="insightSummary" class="form-control" rows="3" required></textarea></div><div class="form-group"><label>Evidence Link</label><input type="url" id="insightLink" class="form-control" placeholder="https://..."></div><div class="modal-footer"><button type="button" class="btn btn-outline" onclick="hideModal(\'insightModal\')">Cancel</button><button type="submit" class="btn btn-primary">Save</button></div></form></div></div>';
    await loadReportsData();
}

async function loadReportsData() { try { showLoading(); allDailyReports = await API.reports.getDaily(); allWeeklyReports = await API.reports.getWeekly(); allMaintenanceReports = await API.reports.getMaintenance(); hideLoading(); await loadReportsTab(); } catch (e) { hideLoading(); } }

async function switchReportsTab(tab) { currentReportsTab = tab; var tabs = document.querySelectorAll('.performance-tab'); for (var i=0;i<tabs.length;i++) tabs[i].classList.remove('active'); event.target.classList.add('active'); await loadReportsTab(); }

async function loadReportsTab() { var content = document.getElementById('reportsContent'); if (!content) return; showLoading(); try { if (currentReportsTab==='daily') loadDailyTab(content); else if (currentReportsTab==='weekly') loadWeeklyTab(content); else if (currentReportsTab==='maintenance') loadMaintenanceTab(content); else if (currentReportsTab==='monthly') loadMonthlyTab(content); else if (currentReportsTab==='insights') loadInsightsTab(content); } catch(e) {} hideLoading(); }

async function generateAIReport() { try { showLoading(); var resp = await API.ai.generate({ conversation_type: 'report_writing', messages: [{ role: 'user', content: 'Generate daily trainer report with: NETACAD Training Update, Lab Update, Center Update, Challenges, Recommendations.' }] }); document.getElementById('netacadUpdate').value = resp.response || ''; hideLoading(); showToast('AI generated','success'); } catch (e) { hideLoading(); } }

async function saveAIReport(event) {
    event.preventDefault();
    var streams = Array.from(document.getElementById('reportStreams').selectedOptions).map(function(o){return o.value;});
    var data = { date: document.getElementById('reportDate').value, streams: streams, topics_covered: document.getElementById('netacadUpdate').value, challenges: document.getElementById('challenges').value, next_steps: document.getElementById('recommendations').value, engagement_level: parseInt(document.getElementById('engagement').value), status: 'submitted' };
    try { showLoading(); await API.reports.saveDaily(data); hideModal('aiReportModal'); showToast('Saved','success'); await loadReportsData(); await loadReportsTab(); } catch(e) { hideLoading(); showToast('Error: '+e.message,'error'); }
}

function showAIReportModal() { document.getElementById('aiReportForm').reset(); document.getElementById('reportDate').value = getToday(); document.getElementById('engagement').value = '3'; showModal('aiReportModal'); }

function loadDailyTab(content) {
    var html = '<div class="card"><div class="card-header"><h3>Daily Reports</h3><button class="btn btn-primary" onclick="showAIReportModal()"><i class="fas fa-robot"></i> New Report</button></div>';
    if (allDailyReports.length === 0) html += '<div class="empty-state"><p>No reports</p></div>';
    else { html += '<table><thead><tr><th>Date</th><th>Streams</th><th>Status</th><th>Actions</th></tr></thead><tbody>';
        for (var i=0;i<allDailyReports.length;i++) { var r=allDailyReports[i]; html += '<tr><td>'+formatDate(r.date)+'</td><td>'+(r.streams?r.streams.join(', '):'N/A')+'</td><td><span class="badge badge-success">'+r.status+'</span></td><td><button class="btn btn-sm btn-outline" onclick="viewDaily('+r.id+')">View</button> <button class="btn btn-sm btn-primary" onclick="shareReport('+r.id+',\'daily\')"><i class="fas fa-envelope"></i> Share</button> <button class="btn btn-sm btn-primary" onclick="downloadPDF('+r.id+',\'daily\')"><i class="fas fa-file-pdf"></i> PDF</button> <button class="btn btn-sm btn-danger" onclick="deleteDaily('+r.id+')"><i class="fas fa-trash"></i></button></td></tr>'; }
        html += '</tbody></table>'; }
    html += '</div>'; content.innerHTML = html;
}

function loadWeeklyTab(content) {
    var html = '<div class="card"><div class="card-header"><h3>Weekly Reports</h3><button class="btn btn-primary" onclick="generateWeekly()"><i class="fas fa-magic"></i> Generate</button></div>';
    if (allWeeklyReports.length === 0) html += '<div class="empty-state"><p>No weekly reports</p></div>';
    else { html += '<table><thead><tr><th>Week</th><th>Status</th><th>Actions</th></tr></thead><tbody>';
        for (var i=0;i<allWeeklyReports.length;i++) { var wr=allWeeklyReports[i]; html += '<tr><td>'+formatDate(wr.week_start_date)+' - '+formatDate(wr.week_end_date)+'</td><td><span class="badge badge-success">'+wr.status+'</span></td><td><button class="btn btn-sm btn-outline" onclick="viewWeekly('+wr.id+')">View</button> <button class="btn btn-sm btn-primary" onclick="shareReport('+wr.id+',\'weekly\')"><i class="fas fa-envelope"></i> Share</button> <button class="btn btn-sm btn-primary" onclick="downloadPDF('+wr.id+',\'weekly\')"><i class="fas fa-file-pdf"></i> PDF</button> <button class="btn btn-sm btn-danger" onclick="deleteWeekly('+wr.id+')"><i class="fas fa-trash"></i></button></td></tr>'; }
        html += '</tbody></table>'; }
    html += '</div>'; content.innerHTML = html;
}

function loadMaintenanceTab(content) {
    var html = '<div class="card"><div class="card-header"><h3>Maintenance Reports</h3><button class="btn btn-primary" onclick="generateMaintReport()"><i class="fas fa-download"></i> Generate & Download</button></div>';
    html += '<div style="margin-bottom:16px;padding:12px;background:#fef3c7;border-radius:8px;font-size:13px">Auto-generated from current lab status and maintenance logs.</div>';
    if (allMaintenanceReports.length === 0) html += '<div class="empty-state"><p>No reports</p></div>';
    else { html += '<table><thead><tr><th>Date</th><th>Open</th><th>Progress</th><th>Resolved</th><th>Action</th></tr></thead><tbody>';
        for (var i=0;i<allMaintenanceReports.length;i++) { var mr=allMaintenanceReports[i]; html += '<tr><td>'+formatDate(mr.report_date)+'</td><td style="color:#ef4444;font-weight:700">'+mr.open_issues_count+'</td><td style="color:#f59e0b;font-weight:700">'+mr.in_progress_count+'</td><td style="color:#10b981;font-weight:700">'+mr.resolved_count+'</td><td><button class="btn btn-sm btn-primary" onclick="downloadMaintPDF('+mr.id+')"><i class="fas fa-download"></i> PDF</button></td></tr>'; }
        html += '</tbody></table>'; }
    html += '</div>'; content.innerHTML = html;
}

function loadInsightsTab(content) {
    var insights = JSON.parse(localStorage.getItem('teamInsights') || '[]');
    var html = '<div class="card"><div class="card-header"><h3>Team Insights</h3><button class="btn btn-primary" onclick="showModal(\'insightModal\')"><i class="fas fa-plus"></i> Log Insight</button></div>';
    if (insights.length === 0) html += '<div class="empty-state"><p>No insights</p></div>';
    else { html += '<table><thead><tr><th>Date</th><th>Platform</th><th>Summary</th><th>Link</th><th>Action</th></tr></thead><tbody>';
        for (var i=0;i<insights.length;i++) { var ins=insights[i]; html += '<tr><td>'+formatDate(ins.date)+'</td><td><span class="badge badge-'+(ins.platform==='WhatsApp'?'success':'info')+'">'+ins.platform+'</span></td><td>'+ins.summary.substring(0,50)+'</td><td>'+(ins.link?'<a href="'+ins.link+'" target="_blank">View</a>':'-')+'</td><td><button class="btn btn-sm btn-primary" onclick="shareInsight('+i+')"><i class="fas fa-envelope"></i> Share</button> <button class="btn btn-sm btn-danger" onclick="deleteInsight('+i+')">Delete</button></td></tr>'; }
        html += '</tbody></table>'; }
    html += '</div>'; content.innerHTML = html;
}

function deleteInsight(index) { var insights = JSON.parse(localStorage.getItem('teamInsights') || '[]'); insights.splice(index, 1); localStorage.setItem('teamInsights', JSON.stringify(insights)); loadReportsTab(); }

async function saveInsight(event) { event.preventDefault(); var insight = { date: document.getElementById('insightDate').value, platform: document.getElementById('insightPlatform').value, summary: document.getElementById('insightSummary').value, link: document.getElementById('insightLink').value }; var insights = JSON.parse(localStorage.getItem('teamInsights') || '[]'); insights.unshift(insight); localStorage.setItem('teamInsights', JSON.stringify(insights)); hideModal('insightModal'); showToast('Saved','success'); loadReportsTab(); }

async function viewDaily(id) { var r = allDailyReports.find(function(x){return x.id===id;}); if (!r) return; alert('Daily Report - '+formatDate(r.date)+'\n\nNETACAD: '+(r.topics_covered||'N/A')+'\n\nChallenges: '+(r.challenges||'None')+'\n\nRecommendations: '+(r.next_steps||'None')); }

async function viewWeekly(id) { var wr = allWeeklyReports.find(function(x){return x.id===id;}); if (!wr) return; alert('Weekly Report\n'+wr.week_start_date+' to '+wr.week_end_date+'\n\nNETACAD: '+(wr.netacad_update||'N/A')+'\n\nLab: '+(wr.lab_update||'N/A')); }

async function shareReport(id, type) {
    try {
        showLoading();
        var resp = await fetch('/api/reports/' + type + '/' + id + '/share', {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
        });
        if (!resp.ok) {
            var err = await resp.json();
            throw new Error(err.error || 'Failed to share');
        }
        var data = await resp.json();
        hideLoading();
        if (data.mailto) {
            window.location.href = data.mailto;
            showToast('Opening email client...', 'success');
        } else {
            showToast('Report shared via email!', 'success');
        }
    } catch(e) {
        hideLoading();
        showToast('Error: ' + e.message, 'error');
    }
}

async function shareInsight(index) {
    var insights = JSON.parse(localStorage.getItem('teamInsights') || '[]');
    var ins = insights[index];
    if (!ins) return;
    var subject = encodeURIComponent('Team Insight: ' + ins.platform);
    var body = encodeURIComponent('Date: ' + formatDate(ins.date) + '\n\nSummary:\n' + ins.summary + '\n\nLink: ' + (ins.link || 'N/A'));
    window.location.href = 'mailto:?subject=' + subject + '&body=' + body;
    showToast('Opening email client...', 'success');
}

async function downloadPDF(id, type) {
    try {
        showLoading();
        var token = localStorage.getItem('token');
        var url = '/api/reports/' + type + '/' + id + '/pdf';
        var response = await fetch(url, { headers: { 'Authorization': 'Bearer ' + token } });
        if (!response.ok) throw new Error('Failed to download');
        var blob = await response.blob();
        var downloadUrl = window.URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = downloadUrl;
        a.download = type + '_report_' + id + '.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(downloadUrl);
        hideLoading();
        showToast('PDF downloaded!', 'success');
    } catch (e) { hideLoading(); showToast('Error: ' + e.message, 'error'); }
}

async function generateMaintReport() {
    try { showLoading(); var labStatus = await API.lab.getStatus(); var logs = await API.lab.getMaintenance(); var openC = logs.filter(function(l){return l.status==='open';}).length; var progC = logs.filter(function(l){return l.status==='in-progress';}).length; var resC = logs.filter(function(l){return l.status==='resolved';}).length;
        await API.reports.createMaintenance({ report_date: getToday(), open_issues_count: openC, in_progress_count: progC, resolved_count: resC, critical_issues: 'See logs', upcoming_maintenance: 'See schedule', recommendations: 'Review overdue tasks' });
        var csv = 'Maintenance Report - '+getToday()+'\n\nOpen,In Progress,Resolved,Lab Health\n'+openC+','+progC+','+resC+','+(labStatus.summary?labStatus.summary.health_percentage:0)+'%\n\nDevice,Issue,Status,Priority\n';
        for (var i=0;i<logs.length;i++) { var l=logs[i]; csv += l.device_type+' #'+l.device_id+',"'+l.issue_description+'",'+l.status+','+l.priority+'\n'; }
        // CSV also available - now using PDF instead. downloadFile(csv, 'maintenance_report_'+getToday()+'.csv', 'text/csv');
        showToast('Report generated! Downloading...','success'); await loadReportsData(); await loadReportsTab(); setTimeout(async function() { var reports = await API.reports.getMaintenance(); if (reports.length > 0) { var latest = reports[reports.length-1]; await downloadPDF(latest.id, 'maintenance'); } }, 500);
    } catch(e) { hideLoading(); showToast('Error: '+e.message,'error'); }
}

function downloadMaintPDF(id) { downloadPDF(id, 'maintenance'); }

async function generateWeekly() {
    var start = prompt('Week start (YYYY-MM-DD):', getToday()); if (!start) return;
    var end = prompt('Week end (YYYY-MM-DD):', getToday()); if (!end) return;
    var weekReports = allDailyReports.filter(function(r){return r.date >= start && r.date <= end;});
    var summary = weekReports.map(function(r){return r.topics_covered;}).join('\n');
    try { showLoading(); await API.reports.createWeekly({ week_start_date: start, week_end_date: end, netacad_update: summary || 'No reports', lab_update: 'Operational', centre_update: 'See daily reports', challenges: 'See daily reports', recommendations: 'See daily reports', status: 'submitted' }); showToast('Generated','success'); await loadReportsData(); await loadReportsTab(); } catch(e) { hideLoading(); }
}






async function deleteWeekly(id) { if (!confirm('Delete this weekly report?')) return; try { showLoading(); await API.reports.deleteWeekly(id); showToast('Deleted','success'); await loadReportsData(); await loadReportsTab(); } catch(e) { hideLoading(); showToast('Error: '+e.message,'error'); } }

async function deleteMaintReport(id) { if (!confirm('Delete this maintenance report?')) return; try { showLoading(); await API.reports.deleteMaintenance(id); showToast('Deleted','success'); await loadReportsData(); await loadReportsTab(); } catch(e) { hideLoading(); showToast('Error: '+e.message,'error'); } }

async function loadMonthlyTab(content) {
    showLoading();
    var students = await API.students.getAll();
    var attendance = await API.attendance.getStats({ start_date: '2026-01-01', end_date: getToday() });
    var performance = await API.performance.getSummary();
    var plans = await API.classes.getDeliveryPlan();
    var interventions = await API.performance.getInterventions();
    var reports = await API.reports.getWeekly();
    hideLoading();
    
    var totalStudents = students.length;
    var activeStudents = students.filter(function(s){return s.status==='active';}).length;
    var avgAttendance = 0;
    if (attendance.length > 0) { var sum = 0; for (var a=0;a<attendance.length;a++) sum += parseFloat(attendance[a].percentage); avgAttendance = Math.round(sum/attendance.length); }
    var avgPerf = 0;
    if (performance.length > 0) { var psum = 0; for (var p=0;p<performance.length;p++) psum += parseFloat(performance[p].avg_score); avgPerf = Math.round(psum/performance.length); }
    var totalHours = plans.reduce(function(s,p){return s+(p.completed_hours||0);},0);
    var resolvedInt = interventions.filter(function(i){return i.status==='resolved';}).length;
    var totalInt = interventions.length;
    var submittedReports = reports.filter(function(r){return r.status==='submitted';}).length;
    
    var html = '<div class="card" style="margin-bottom:20px"><div class="card-header"><h3><i class="fas fa-chart-bar"></i> Monthly Data Insights</h3><button class="btn btn-primary" onclick="downloadMonthlyReport()"><i class="fas fa-download"></i> Download Report</button></div>' +
        '<div class="stats-grid" style="margin-bottom:20px"><div class="stat-card"><div class="stat-icon"><i class="fas fa-user-graduate"></i></div><div class="stat-info"><h3>'+activeStudents+'/'+totalStudents+'</h3><p>Active Students</p></div></div><div class="stat-card"><div class="stat-icon"><i class="fas fa-calendar-check"></i></div><div class="stat-info"><h3>'+avgAttendance+'%</h3><p>Avg Attendance</p></div></div><div class="stat-card"><div class="stat-icon"><i class="fas fa-chart-line"></i></div><div class="stat-info"><h3>'+avgPerf+'%</h3><p>Avg Performance</p></div></div><div class="stat-card"><div class="stat-icon"><i class="fas fa-clock"></i></div><div class="stat-info"><h3>'+totalHours+' hrs</h3><p>Training Delivered</p></div></div></div>' +
        
        '<div class="grid-2" style="gap:20px;margin-bottom:20px"><div class="card"><h4 style="margin-bottom:12px">Stream Performance</h4><table><thead><tr><th>Stream</th><th>Students</th><th>Avg Score</th><th>Status</th></tr></thead><tbody>';
    
    var streams = ['Love','Joy','Peace','Mnara'];
    for (var s=0;s<streams.length;s++) {
        var streamStudents = students.filter(function(st){return st.stream===streams[s];});
        var streamPerf = performance.find(function(p){return p.stream===streams[s];});
        var score = streamPerf ? parseFloat(streamPerf.avg_score).toFixed(1) : 'N/A';
        var status = parseFloat(score) >= 70 ? 'On Track' : parseFloat(score) >= 50 ? 'Needs Attention' : 'Behind';
        html += '<tr><td><strong>'+streams[s]+'</strong></td><td>'+streamStudents.length+'</td><td>'+score+'%</td><td><span class="badge badge-'+(status==='On Track'?'success':status==='Needs Attention'?'warning':'danger')+'">'+status+'</span></td></tr>';
    }
    html += '</tbody></table></div>' +
        
        '<div class="card"><h4 style="margin-bottom:12px">Intervention Summary</h4><table><thead><tr><th>Metric</th><th>Value</th></tr></thead><tbody>' +
        '<tr><td>Total Interventions</td><td>'+totalInt+'</td></tr>' +
        '<tr><td>Resolved</td><td style="color:#10b981;font-weight:700">'+resolvedInt+'</td></tr>' +
        '<tr><td>Resolution Rate</td><td>'+(totalInt>0?Math.round((resolvedInt/totalInt)*100):0)+'%</td></tr>' +
        '<tr><td>Weekly Reports Submitted</td><td>'+submittedReports+'</td></tr>' +
        '<tr><td>Training Hours Delivered</td><td>'+totalHours+' hrs</td></tr>' +
        '</tbody></table></div></div></div>';
    
    content.innerHTML = html;
}

function downloadMonthlyReport() {
    var csv = 'Cisco Trainer Monthly Report\n\n';
    csv += 'Metric,Value\n';
    csv += 'Active Students,'+document.querySelector('.stat-card .stat-info h3').textContent+'\n';
    csv += 'Avg Attendance,'+document.querySelectorAll('.stat-card .stat-info h3')[1].textContent+'\n';
    csv += 'Avg Performance,'+document.querySelectorAll('.stat-card .stat-info h3')[2].textContent+'\n';
    csv += 'Training Hours,'+document.querySelectorAll('.stat-card .stat-info h3')[3].textContent+'\n';
    downloadFile(csv, 'monthly_insights_'+getToday()+'.csv', 'text/csv');
    showToast('Monthly report downloaded','success');
}
