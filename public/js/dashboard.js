async function loadDashboard() {
    var contentArea = document.getElementById('contentArea');
    if (!contentArea) return;
    contentArea.innerHTML = '<div class="dashboard-container">' +
        '<div class="stats-grid" id="statsGrid"></div>' +
        '<div class="charts-grid">' +
            '<div class="chart-card"><h3>Attendance Trend</h3><canvas id="attendanceChart"></canvas></div>' +
            '<div class="chart-card"><h3>Performance Distribution</h3><canvas id="performanceChart"></canvas></div>' +
            '<div class="chart-card"><h3>Module Coverage per Stream</h3><canvas id="moduleChart"></canvas></div>' +
            '<div class="chart-card"><h3>Weekly Progress (Planned vs Actual)</h3><canvas id="progressChart"></canvas></div>' +
        '</div>' +
        '<div class="grid-2" style="margin-top:24px">' +
            '<div class="card" id="alertsPanel"></div>' +
            '<div class="card" id="topPerformersPanel"></div>' +
        '</div>' +
        '<div class="grid-2" style="margin-top:24px">' +
            '<div class="card" id="strugglingPanel"></div>' +
            '<div class="card" id="streamBreakdown"></div>' +
        '</div>' +
    '</div>';
    await loadAllDashboardData();
}

async function loadAllDashboardData() {
    showLoading();
    try {
        var students = await API.students.getAll();
        var today = getToday();
        var weekAgo = new Date(Date.now() - 7*24*60*60*1000).toISOString().split('T')[0];
        var monthAgo = new Date(Date.now() - 30*24*60*60*1000).toISOString().split('T')[0];
        
        var todayAttendance = await API.attendance.get({ date: today });
        var weekAttendance = await API.attendance.getStats({ start_date: weekAgo, end_date: today });
        var monthAttendance = await API.attendance.getStats({ start_date: monthAgo, end_date: today });
        
        var labStatus = await API.lab.getStatus();
        var laptops = await API.lab.getLaptops();
        var equipment = await API.lab.getEquipment();
        
        var performanceSummary = await API.performance.getSummary();
        var rankings = await API.performance.getRankings();
        var struggling = await API.performance.getStruggling();
        var interventions = await API.performance.getInterventions();
        var scores = await API.performance.get();
        
        var plans = await API.classes.getDeliveryPlan();
        var timetable = await API.classes.getTimetable();
        var classes = await API.classes.getScheduled({ date: today });
        
        updateStatsGrid(students, todayAttendance, labStatus, laptops, equipment, performanceSummary, monthAttendance, plans);
        loadAttendanceChart(monthAttendance);
        loadPerformanceChart(rankings, scores);
        loadModuleChart(students, plans);
        loadProgressChart(plans);
        loadAlertsPanel(students, todayAttendance, weekAttendance, struggling);
        loadTopPerformers(rankings);
        loadStrugglingPanel(struggling, interventions);
        loadStreamBreakdown(students, performanceSummary, scores);
        
        hideLoading();
    } catch (e) { hideLoading(); console.error('Dashboard error:', e); showToast('Error loading dashboard: ' + e.message, 'error'); }
}

function updateStatsGrid(students, attendance, labStatus, laptops, equipment, perfSummary, monthAttendance, plans) {
    var grid = document.getElementById('statsGrid');
    if (!grid) return;
    
    var activeStudents = students.filter(function(s) { return s.status === 'active'; });
    var presentToday = attendance.filter(function(a) { return a.status === 'P'; }).length;
    var totalAttendance = monthAttendance.reduce(function(s, r) { return s + parseInt(r.total); }, 0);
    var totalPresent = monthAttendance.reduce(function(s, r) { return s + parseInt(r.present); }, 0);
    var monthAttendanceRate = totalAttendance > 0 ? Math.round((totalPresent / totalAttendance) * 100) : 0;
    
    var allScores = 0; var scoreCount = 0;
    perfSummary.forEach(function(s) { allScores += parseFloat(s.avg_score || 0) * parseInt(s.total_entries || 0); scoreCount += parseInt(s.total_entries || 0); });
    var avgPerf = scoreCount > 0 ? Math.round(allScores / scoreCount) : 0;
    
    var totalWorkstations = labStatus.summary ? labStatus.summary.total : 0;
    var functionalWS = labStatus.summary ? labStatus.summary.functional : 0;
    var labUptime = totalWorkstations > 0 ? Math.round((functionalWS / totalWorkstations) * 100) : 0;
    
    var totalDevices = totalWorkstations + laptops.length + equipment.length;
    
    var totalModules = 0; var completedModules = 0;
    plans.forEach(function(p) {
        var planned = p.modules_planned ? p.modules_planned.split(',').length : 0;
        var done = p.modules_completed ? p.modules_completed.split(',').length : 0;
        totalModules += planned; completedModules += done;
    });
    var moduleCoverage = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;
    
    var systemHealth = Math.round((monthAttendanceRate + avgPerf + labUptime + moduleCoverage) / 4);
    
    var activeLaptops = laptops.filter(function(l) { return l.status === 'available' || l.status === 'assigned'; }).length;
    var uafCompliance = laptops.length > 0 ? Math.round((activeLaptops / laptops.length) * 100) : 100;
    
    grid.innerHTML = 
        '<div class="stat-card"><div class="stat-icon icon-bg-blue"><i class="fas fa-user-graduate"></i></div><div class="stat-info"><h3>' + students.length + '</h3><p>Total Students</p><small>' + activeStudents.length + ' active | Streams: ' + getStreamSummary(students) + '</small></div></div>' +
        '<div class="stat-card"><div class="stat-icon icon-bg-purple"><i class="fas fa-laptop"></i></div><div class="stat-info"><h3>' + totalDevices + '</h3><p>Total Devices</p><small>Laptops: ' + laptops.length + ' | Workstations: ' + totalWorkstations + '</small></div></div>' +
        '<div class="stat-card"><div class="stat-icon icon-bg-green"><i class="fas fa-calendar-check"></i></div><div class="stat-info"><h3>' + monthAttendanceRate + '%</h3><p>Avg Attendance</p><small>30-day average</small></div></div>' +
        '<div class="stat-card"><div class="stat-icon icon-bg-yellow"><i class="fas fa-chart-line"></i></div><div class="stat-info"><h3>' + avgPerf + '%</h3><p>Avg Performance</p><small>All modules</small></div></div>' +
        '<div class="stat-card"><div class="stat-icon icon-bg-pink"><i class="fas fa-server"></i></div><div class="stat-info"><h3>' + labUptime + '%</h3><p>Lab Uptime</p><small>' + functionalWS + '/' + totalWorkstations + ' functional</small></div></div>' +
        '<div class="stat-card"><div class="stat-icon icon-bg-green"><i class="fas fa-book"></i></div><div class="stat-info"><h3>' + moduleCoverage + '%</h3><p>Module Coverage</p><small>' + completedModules + '/' + totalModules + ' completed</small></div></div>' +
        '<div class="stat-card"><div class="stat-icon icon-bg-purple"><i class="fas fa-heartbeat"></i></div><div class="stat-info"><h3>' + systemHealth + '%</h3><p>System Health</p><small>Overall score</small></div></div>' +
        '<div class="stat-card"><div class="stat-icon icon-bg-teal"><i class="fas fa-shield-alt"></i></div><div class="stat-info"><h3>' + uafCompliance + '%</h3><p>UAF Compliance</p><small>Laptops active</small></div></div>';
}

function getStreamSummary(students) {
    var streams = {};
    students.forEach(function(s) { if (s.stream) streams[s.stream] = (streams[s.stream] || 0) + 1; });
    var parts = [];
    for (var key in streams) parts.push(key + ': ' + streams[key]);
    return parts.join(' ');
}

function loadAttendanceChart(monthAttendance) {
    var ctx = document.getElementById('attendanceChart');
    if (!ctx || !monthAttendance.length) return;
    new Chart(ctx, { type: 'bar', data: { labels: monthAttendance.map(function(s) { return s.stream; }), datasets: [{ label: 'Attendance %', data: monthAttendance.map(function(s) { return parseFloat(s.percentage); }), backgroundColor: ['#3b82f6','#10b981','#f59e0b','#8b5cf6'], borderRadius: 8 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { max: 100, ticks: { callback: function(v) { return v + '%'; } } } } } });
}

function loadPerformanceChart(rankings, scores) {
    var ctx = document.getElementById('performanceChart');
    if (!ctx) return;
    var grades = { A: 0, B: 0, C: 0, D: 0, F: 0 };
    scores.forEach(function(s) { if (s.grade && grades[s.grade] !== undefined) grades[s.grade]++; });
    new Chart(ctx, { type: 'doughnut', data: { labels: ['A (80-100)','B (70-79)','C (60-69)','D (50-59)','F (<50)'], datasets: [{ data: [grades.A, grades.B, grades.C, grades.D, grades.F], backgroundColor: ['#10b981','#3b82f6','#f59e0b','#f97316','#ef4444'], borderWidth: 2, borderColor: '#fff' }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } } });
}

function loadModuleChart(students, plans) {
    var ctx = document.getElementById('moduleChart');
    if (!ctx) return;
    var labels = plans.map(function(p) { return p.stream; });
    var completed = plans.map(function(p) { return p.modules_completed ? p.modules_completed.split(',').length : 0; });
    var planned = plans.map(function(p) { return p.modules_planned ? p.modules_planned.split(',').length : 0; });
    new Chart(ctx, { type: 'bar', data: { labels: labels, datasets: [{ label: 'Completed', data: completed, backgroundColor: '#10b981', borderRadius: 8 }, { label: 'Planned', data: planned, backgroundColor: '#e2e8f0', borderRadius: 8 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } }, scales: { y: { ticks: { stepSize: 1 } } } } });
}

function loadProgressChart(plans) {
    var ctx = document.getElementById('progressChart');
    if (!ctx) return;
    var labels = plans.map(function(p) { return p.stream; });
    var hoursDone = plans.map(function(p) { return p.completed_hours || 0; });
    var hoursPlanned = plans.map(function(p) { return p.total_hours || 0; });
    new Chart(ctx, { type: 'bar', data: { labels: labels, datasets: [{ label: 'Actual Hours', data: hoursDone, backgroundColor: '#8b5cf6', borderRadius: 8 }, { label: 'Planned Hours', data: hoursPlanned, backgroundColor: '#e2e8f0', borderRadius: 8 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } } });
}

function loadAlertsPanel(students, todayAttendance, weekAttendance, struggling) {
    var panel = document.getElementById('alertsPanel');
    if (!panel) return;
    var html = '<div class="card-header"><h3><i class="fas fa-bell" style="color:#f59e0b"></i> Alerts & Insights</h3></div>';
    
    var alerts = [];
    
    var presentCount = todayAttendance.filter(function(a) { return a.status === 'P'; }).length;
    var todayRate = todayAttendance.length > 0 ? Math.round((presentCount / todayAttendance.length) * 100) : 100;
    if (todayRate < 75) alerts.push({ type: 'warning', msg: 'Low attendance today: ' + todayRate + '% (' + presentCount + '/' + todayAttendance.length + ' present)' });
    
    weekAttendance.forEach(function(s) {
        if (parseFloat(s.percentage) < 75) alerts.push({ type: 'warning', msg: 'Low attendance: ' + s.stream + ' stream at ' + s.percentage + '% this week' });
    });
    
    if (struggling.length > 0) alerts.push({ type: 'danger', msg: struggling.length + ' student(s) below 50% average - needs intervention' });
    else alerts.push({ type: 'success', msg: 'All students above 50% average performance!' });
    
    var inactiveStudents = students.filter(function(s) { return s.status === 'inactive' || s.status === 'dropped'; });
    if (inactiveStudents.length > 0) alerts.push({ type: 'info', msg: inactiveStudents.length + ' inactive/dropped students' });
    
    if (alerts.length === 0) alerts.push({ type: 'success', msg: 'System running smoothly! No issues detected.' });
    
    alerts.forEach(function(a) {
        var icon = a.type === 'danger' ? 'fa-exclamation-circle' : a.type === 'warning' ? 'fa-exclamation-triangle' : a.type === 'success' ? 'fa-check-circle' : 'fa-info-circle';
        var bg = a.type === 'danger' ? '#fef2f2' : a.type === 'warning' ? '#fffbeb' : a.type === 'success' ? '#f0fdf4' : '#eff6ff';
        var color = a.type === 'danger' ? '#dc2626' : a.type === 'warning' ? '#d97706' : a.type === 'success' ? '#059669' : '#2563eb';
        html += '<div style="padding:10px 12px;margin-bottom:8px;background:' + bg + ';border-radius:8px;display:flex;align-items:center;gap:10px;font-size:13px"><i class="fas ' + icon + '" style="color:' + color + ';font-size:16px"></i><span>' + a.msg + '</span></div>';
    });
    
    panel.innerHTML = html;
}

function loadTopPerformers(rankings) {
    var panel = document.getElementById('topPerformersPanel');
    if (!panel) return;
    var html = '<div class="card-header"><h3><i class="fas fa-star" style="color:#f59e0b"></i> Top Performers</h3></div>';
    
    if (rankings.length === 0) {
        html += '<p style="color:var(--text-secondary);text-align:center;padding:20px">No performance data yet</p>';
    } else {
        var top5 = rankings.slice(0, 5);
        var medals = ['🥇','🥈','🥉','⭐','⭐'];
        top5.forEach(function(r, i) {
            var avg = parseFloat(r.avg_score || 0).toFixed(1);
            html += '<div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--border-color)">' +
                '<span style="font-size:24px">' + medals[i] + '</span>' +
                '<div style="flex:1"><strong>' + r.first_name + ' ' + r.last_name + '</strong><br><small style="color:var(--text-secondary)">' + r.stream + ' | Rank #' + r.rank + '</small></div>' +
                '<div style="text-align:right"><span style="font-size:20px;font-weight:700;color:#10b981">' + avg + '%</span><br><small style="color:var(--text-secondary)">Avg Score</small></div>' +
                '</div>';
        });
    }
    panel.innerHTML = html;
}

function loadStrugglingPanel(struggling, interventions) {
    var panel = document.getElementById('strugglingPanel');
    if (!panel) return;
    var html = '<div class="card-header"><h3><i class="fas fa-hand-holding-heart" style="color:#ef4444"></i> Students Needing Support</h3></div>';
    
    if (struggling.length === 0) {
        html += '<div style="text-align:center;padding:30px"><i class="fas fa-check-circle" style="font-size:40px;color:#10b981"></i><p style="margin-top:8px;color:#10b981;font-weight:600">All students performing well!</p></div>';
    } else {
        html += '<div style="margin-bottom:12px;font-size:14px"><strong>' + struggling.length + ' student(s) below 50%</strong></div>';
        struggling.forEach(function(s) {
            var intervention = interventions.find(function(i) { return i.student_id === s.id && i.status !== 'resolved'; });
            var hasHelp = intervention ? '<span class="badge badge-info">Help in progress</span>' : '<span class="badge badge-danger">Needs action</span>';
            html += '<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border-color)">' +
                '<div><strong>' + s.first_name + ' ' + s.last_name + '</strong><br><small style="color:var(--text-secondary)">' + s.stream + '</small></div>' +
                '<div style="text-align:right"><span style="color:#ef4444;font-weight:700;font-size:18px">' + parseFloat(s.avg_score).toFixed(1) + '%</span><br>' + hasHelp + '</div>' +
                '</div>';
        });
    }
    panel.innerHTML = html;
}

function loadStreamBreakdown(students, perfSummary, scores) {
    var panel = document.getElementById('streamBreakdown');
    if (!panel) return;
    var html = '<div class="card-header"><h3><i class="fas fa-layer-group" style="color:#6366f1"></i> Stream Breakdown</h3></div>';
    
    var streams = ['Love','Joy','Peace','Mnara'];
    html += '<div class="table-container"><table><thead><tr><th>Stream</th><th>Students</th><th>Avg Score</th><th>Attendance</th><th>Top Student</th></tr></thead><tbody>';
    
    streams.forEach(function(stream) {
        var streamStudents = students.filter(function(s) { return s.stream === stream; });
        var streamScores = scores.filter(function(s) { return s.stream === stream; });
        var avgScore = 0;
        if (streamScores.length > 0) {
            var total = streamScores.reduce(function(s, sc) { return s + parseFloat(sc.total_score || 0); }, 0);
            avgScore = Math.round(total / streamScores.length);
        }
        var summary = perfSummary.find(function(s) { return s.stream === stream; });
        var topStudent = '';
        if (streamScores.length > 0) {
            var best = streamScores.reduce(function(a, b) { return (parseFloat(a.total_score) || 0) > (parseFloat(b.total_score) || 0) ? a : b; });
            topStudent = best.first_name + ' ' + best.last_name;
        }
        html += '<tr><td><strong>' + stream + '</strong></td><td>' + streamStudents.length + '</td><td>' + avgScore + '%</td><td>' + (summary ? parseFloat(summary.avg_score).toFixed(1) + '%' : 'N/A') + '</td><td>' + (topStudent || '-') + '</td></tr>';
    });
    
    html += '</tbody></table></div>';
    panel.innerHTML = html;
}
