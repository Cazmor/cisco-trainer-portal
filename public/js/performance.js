var currentPerformanceTab = 'assessments';
var allStudents = [];
var allScores = [];
var currentInterventionId = null;

async function loadPerformancePage() {
    var contentArea = document.getElementById('contentArea');
    if (!contentArea) return;
    contentArea.innerHTML = '<div class="performance-container">' +
        '<div class="performance-tabs">' +
            '<button class="performance-tab active" onclick="switchPerformanceTab(\'assessments\')"><i class="fas fa-clipboard-check"></i> Assessments</button>' +
            '<button class="performance-tab" onclick="switchPerformanceTab(\'cisco\')"><i class="fas fa-file-csv"></i> Cisco Exams</button>' +
            '<button class="performance-tab" onclick="switchPerformanceTab(\'combined\')"><i class="fas fa-calculator"></i> Combined Scores</button>' +
            '<button class="performance-tab" onclick="switchPerformanceTab(\'interventions\')"><i class="fas fa-hand-holding-heart"></i> Interventions</button>' +
            '<button class="performance-tab" onclick="switchPerformanceTab(\'feedback\')"><i class="fas fa-comments"></i> Feedback</button>' +
        '</div><div id="performanceContent"></div></div>' +
        '<div id="resolveModal" class="modal"><div class="modal-content"><div class="modal-header"><h3>Resolve Intervention</h3><button class="modal-close" onclick="hideModal(\'resolveModal\')">&times;</button></div><div class="form-group"><label>Resolution Notes</label><textarea id="resolveNotes" class="form-control" rows="3" placeholder="Describe how the intervention was resolved..."></textarea></div><div class="modal-footer"><button class="btn btn-outline" onclick="hideModal(\'resolveModal\')">Cancel</button><button class="btn btn-success" onclick="confirmResolve()"><i class="fas fa-check"></i> Mark Resolved</button></div></div></div>' +
        '<div id="interventionModal" class="modal"><div class="modal-content"><div class="modal-header"><h3>Add Intervention</h3><button class="modal-close" onclick="hideModal(\'interventionModal\')">&times;</button></div><form id="interventionForm" onsubmit="saveInterventionForm(event)"><input type="hidden" id="intStudentId"><div class="form-group"><label>Student</label><input type="text" id="intStudentName" class="form-control" disabled></div><div class="form-group"><label>Type</label><select id="intType" class="form-control" required><option value="">Select</option><option value="Academic Support">Academic Support</option><option value="Mentorship">Mentorship</option><option value="Counseling">Counseling</option><option value="Extra Classes">Extra Classes</option><option value="Parent Meeting">Parent Meeting</option></select></div><div class="form-group"><label>Description</label><textarea id="intDesc" class="form-control" rows="3" required></textarea></div><div class="form-group"><label>Priority</label><select id="intPriority" class="form-control"><option value="medium">Medium</option><option value="low">Low</option><option value="high">High</option><option value="critical">Critical</option></select></div><div class="modal-footer"><button type="button" class="btn btn-outline" onclick="hideModal(\'interventionModal\')">Cancel</button><button type="submit" class="btn btn-primary">Save</button></div></form></div></div>' +
        '<div id="feedbackModal" class="modal"><div class="modal-content"><div class="modal-header"><h3>Add Feedback</h3><button class="modal-close" onclick="hideModal(\'feedbackModal\')">&times;</button></div><form id="feedbackForm" onsubmit="saveFeedback(event)"><div class="form-group"><label>Student</label><select id="feedbackStudentSelect" class="form-control" required><option value="">Select</option></select></div><div class="form-group"><label>Category</label><select id="feedbackCategory" class="form-control" required><option value="">Select</option><option value="Progress">Progress</option><option value="Concern">Concern</option><option value="Achievement">Achievement</option><option value="Behavior">Behavior</option></select></div><div class="form-group"><label>Feedback</label><textarea id="feedbackText" class="form-control" rows="3" required></textarea></div><div class="modal-footer"><button type="button" class="btn btn-outline" onclick="hideModal(\'feedbackModal\')">Cancel</button><button type="submit" class="btn btn-primary">Save</button></div></form></div></div>';
    
    allStudents = await API.students.getAll();
    allScores = await API.performance.get();
    await loadPerformanceTab();
}

async function switchPerformanceTab(tab) {
    currentPerformanceTab = tab;
    var tabs = document.querySelectorAll('.performance-tab');
    for (var i = 0; i < tabs.length; i++) tabs[i].classList.remove('active');
    event.target.classList.add('active');
    await loadPerformanceTab();
}

async function loadPerformanceTab() {
    var content = document.getElementById('performanceContent');
    if (!content) return;
    showLoading();
    try {
        if (currentPerformanceTab === 'assessments') await loadAssessments(content);
        else if (currentPerformanceTab === 'cisco') await loadCiscoExams(content);
        else if (currentPerformanceTab === 'combined') await loadCombinedScores(content);
        else if (currentPerformanceTab === 'interventions') await loadInterventions(content);
        else if (currentPerformanceTab === 'feedback') await loadFeedback(content);
    } catch (e) { content.innerHTML = '<div class="card"><p>Error: ' + e.message + '</p></div>'; }
    hideLoading();
}

async function loadAssessments(content) { allStudents = await API.students.getAll(); allScores = await API.performance.get();
    allScores = await API.performance.get();
    content.innerHTML = '<div class="card"><div class="card-header"><h3>Module Assessments (Quiz 30% + Practical 30%)</h3></div>' +
        '<div style="margin-bottom:12px;padding:10px;background:#dbeafe;border-radius:8px;font-size:13px"><i class="fas fa-info-circle"></i> Quiz 30% + Practical 30% = 60%. Cisco exam = 40%. Select module and stream to fill all students at once.</div>' +
        '<div class="search-bar"><select id="assessModule" class="form-control" onchange="loadClassSheet()"><option value="">Select Module</option>' +
        '<option value="1">Module 1</option><option value="2">Module 2</option><option value="3">Module 3</option><option value="4">Module 4</option><option value="5">Module 5</option><option value="6">Module 6</option><option value="7">Module 7</option><option value="8">Module 8</option><option value="9">Module 9</option><option value="10">Module 10</option><option value="11">Module 11</option><option value="12">Module 12</option><option value="13">Module 13</option><option value="14">Module 14</option></select>' +
        '<select id="assessStream" class="form-control" onchange="loadClassSheet()"><option value="">Select Stream</option><option value="Love">Love</option><option value="Joy">Joy</option><option value="Peace">Peace</option><option value="Mnara">Mnara</option></select>' +
        '<button class="btn btn-primary" onclick="saveClassSheet()"><i class="fas fa-save"></i> Save All</button></div>' +
        '<div id="classSheet"><div class="empty-state"><p>Select module and stream to load class sheet</p></div></div>' +
        '<hr style="margin:20px 0"><h4>Existing Records</h4><div class="table-container"><table><thead><tr><th>Student</th><th>Stream</th><th>Module</th><th>Quiz</th><th>Practical</th><th>Total</th></tr></thead><tbody id="assessTable"></tbody></table></div></div>';
    renderAssessTable();
}

function loadClassSheet() {
    var module = document.getElementById('assessModule').value;
    var stream = document.getElementById('assessStream').value;
    var sheet = document.getElementById('classSheet');
    if (!module || !stream) { sheet.innerHTML = '<div class="empty-state"><p>Select both module and stream</p></div>'; return; }
    var students = allStudents.filter(function(s) { return s.stream === stream && s.status === 'active'; });
    if (students.length === 0) { sheet.innerHTML = '<div class="empty-state"><p>No active students in ' + stream + '</p></div>'; return; }
    var html = '<div style="font-weight:600;margin-bottom:12px">Module ' + module + ' - ' + stream + ' (' + students.length + ' students)</div><table><thead><tr><th>#</th><th>Student</th><th>Quiz (30%)</th><th>Practical (30%)</th></tr></thead><tbody>';
    for (var i = 0; i < students.length; i++) {
        var s = students[i];
        var ex = allScores.find(function(sc) { return sc.student_id === s.id && sc.module_number == module; });
        html += '<tr><td>' + (i+1) + '</td><td><strong>' + s.first_name + ' ' + s.last_name + '</strong><input type="hidden" class="sheet-student-id" value="' + s.id + '"></td>' +
            '<td><input type="number" class="form-control sheet-quiz" value="' + (ex ? ex.quiz_score || '' : '') + '" min="0" max="100" step="0.01" style="width:100px"></td>' +
            '<td><input type="number" class="form-control sheet-practical" value="' + (ex ? ex.practical_score || '' : '') + '" min="0" max="100" step="0.01" style="width:100px"></td></tr>';
    }
    html += '</tbody></table>';
    sheet.innerHTML = html;
}

async function saveClassSheet() {
    var module = document.getElementById('assessModule').value;
    if (!module) { showToast('Select a module', 'error'); return; }
    var ids = document.querySelectorAll('.sheet-student-id');
    var quizzes = document.querySelectorAll('.sheet-quiz');
    var practicals = document.querySelectorAll('.sheet-practical');
    var scores = [];
    for (var i = 0; i < ids.length; i++) {
        var q = parseFloat(quizzes[i].value); var p = parseFloat(practicals[i].value);
        if (!isNaN(q) || !isNaN(p)) scores.push({ student_id: parseInt(ids[i].value), module_number: parseInt(module), module_name: 'Module ' + module, quiz_score: isNaN(q) ? 0 : q, practical_score: isNaN(p) ? 0 : p, exam_score: 0 });
    }
    if (scores.length === 0) { showToast('No scores entered', 'warning'); return; }
    try { showLoading(); await API.performance.saveBulk({ scores: scores }); showToast(scores.length + ' students scored', 'success'); allScores = await API.performance.get(); renderAssessTable(); loadClassSheet(); hideLoading(); } catch (e) { hideLoading(); showToast('Error: ' + e.message, 'error'); }
}

function renderAssessTable() {
    var tbody = document.getElementById('assessTable');
    if (!tbody) return;
    if (allScores.length === 0) { tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:20px">No scores</td></tr>'; return; }
    var html = '';
    for (var i = 0; i < allScores.length; i++) { var s = allScores[i]; html += '<tr><td>' + s.first_name + ' ' + s.last_name + '</td><td>' + s.stream + '</td><td>M' + s.module_number + '</td><td>' + (s.quiz_score || '-') + '</td><td>' + (s.practical_score || '-') + '</td><td><strong>' + ((parseFloat(s.quiz_score)||0)*0.3 + (parseFloat(s.practical_score)||0)*0.3).toFixed(1) + '%</strong></td></tr>'; }
    tbody.innerHTML = html;
}

async function loadCiscoExams(content) { allStudents = await API.students.getAll(); allScores = await API.performance.get();
    content.innerHTML = '<div class="card"><div class="card-header"><h3>Cisco Exams (40%)</h3><button class="btn btn-outline" onclick="document.getElementById(\'ciscoCsvUpload\').click()"><i class="fas fa-upload"></i> Upload CSV</button><input type="file" id="ciscoCsvUpload" accept=".csv" style="display:none" onchange="handleCiscoCsvUpload(event)"></div><div style="margin-bottom:12px;padding:10px;background:#fef3c7;border-radius:8px;font-size:13px">CSV: student_id, module_number, exam_score</div><table><thead><tr><th>Student</th><th>Module</th><th>Exam Score</th></tr></thead><tbody id="ciscoTable"></tbody></table></div>';
    var cisco = allScores.filter(function(s) { return s.exam_score > 0; });
    var tbody = document.getElementById('ciscoTable');
    if (cisco.length === 0) { tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;padding:20px">No exam scores</td></tr>'; return; }
    var html = ''; for (var i = 0; i < cisco.length; i++) { var s = cisco[i]; html += '<tr><td>' + s.first_name + ' ' + s.last_name + '</td><td>M' + s.module_number + '</td><td><strong>' + s.exam_score + '%</strong></td></tr>'; }
    tbody.innerHTML = html;
}

async function handleCiscoCsvUpload(event) {
    var file = event.target.files[0]; if (!file) return;
    try { showLoading(); var text = await file.text(); var lines = text.split('\n'); var scores = [];
        for (var i = 1; i < lines.length; i++) { var p = lines[i].split(','); if (p.length < 3) continue; var sid = parseInt(p[0].trim()), mod = parseInt(p[1].trim()), ex = parseFloat(p[2].trim()); if (!isNaN(sid)&&!isNaN(mod)&&!isNaN(ex)) scores.push({ student_id: sid, module_number: mod, module_name: 'Module '+mod, quiz_score:0, practical_score:0, exam_score:ex }); }
        await API.performance.saveBulk({ scores: scores }); showToast(scores.length+' exam scores uploaded','success'); allScores = await API.performance.get(); await loadPerformanceTab();
    } catch (e) { showToast('Error: '+e.message,'error'); } finally { hideLoading(); event.target.value = ''; }
}

async function loadCombinedScores(content) { allStudents = await API.students.getAll(); allScores = await API.performance.get();
    content.innerHTML = '<div class="card"><div class="card-header"><h3>Combined Scores (Quiz 30% + Practical 30% + Exam 40%)</h3></div><div class="search-bar"><select id="combinedStreamFilter" class="form-control" onchange="renderCombinedTable()"><option value="">All Streams</option><option value="Love">Love</option><option value="Joy">Joy</option><option value="Peace">Peace</option><option value="Mnara">Mnara</option></select></div><table><thead><tr><th>Student</th><th>Stream</th><th>Module</th><th>Quiz</th><th>Practical</th><th>Exam</th><th>Total</th><th>Grade</th></tr></thead><tbody id="combinedTable"></tbody></table></div>';
    renderCombinedTable();
}

async function loadInterventions(content) {
    var interventions = await API.performance.getInterventions();
    var struggling = await API.performance.getStruggling();
    var html = '<div class="card"><div class="card-header"><h3>Student Interventions</h3></div>';
    if (struggling.length === 0) { html += '<div class="empty-state"><i class="fas fa-check-circle" style="color:#10b981;font-size:48px"></i><h3 style="color:#10b981">All Students Above 50%!</h3></div>'; }
    else {
        html += '<div style="margin-bottom:16px"><strong style="color:#ef4444">' + struggling.length + ' student(s) below 50%</strong></div>';
        for (var i = 0; i < struggling.length; i++) {
            var s = struggling[i];
            var studentInts = interventions.filter(function(inv) { return inv.student_id === s.id; });
            var openInt = studentInts.find(function(inv) { return inv.status !== 'resolved'; });
            var resolvedInts = studentInts.filter(function(inv) { return inv.status === 'resolved'; });
            html += '<div style="background:var(--bg-secondary);border:1px solid var(--border-color);border-radius:12px;padding:20px;margin-bottom:16px"><div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:12px"><div><strong style="font-size:16px">' + s.first_name + ' ' + s.last_name + '</strong><br><small>' + s.stream + '</small></div><div style="text-align:right"><span style="font-size:24px;font-weight:700;color:#ef4444">' + parseFloat(s.avg_score).toFixed(1) + '%</span></div></div>';
            if (openInt) { html += '<div style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:12px;margin-bottom:8px"><div style="display:flex;justify-content:space-between"><strong>' + openInt.type + '</strong><span class="badge badge-warning">In Progress</span></div><p style="font-size:13px;margin-top:4px">' + (openInt.description||'') + '</p><button class="btn btn-sm btn-success" style="margin-top:8px" onclick="showResolveModal(' + openInt.id + ')"><i class="fas fa-check"></i> Mark Resolved</button></div>'; }
            else { html += '<button class="btn btn-warning btn-sm" onclick="showInterventionModal(' + s.id + ',\'' + s.first_name + ' ' + s.last_name + '\')"><i class="fas fa-hand-holding-heart"></i> Add Intervention</button>'; }
            if (resolvedInts.length > 0) { html += '<div style="margin-top:8px;font-size:12px;color:#10b981"><i class="fas fa-check-circle"></i> ' + resolvedInts.length + ' intervention(s) resolved</div>'; }
            html += '</div>';
        }
    }
    html += '</div>'; content.innerHTML = html;
}

function showResolveModal(interventionId) {
    currentInterventionId = interventionId;
    document.getElementById('resolveNotes').value = '';
    showModal('resolveModal');
}

async function confirmResolve() {
    var notes = document.getElementById('resolveNotes').value;
    try { showLoading(); await API.performance.updateIntervention(currentInterventionId, { status: 'resolved', resolution_notes: notes }); hideModal('resolveModal'); showToast('Intervention resolved','success'); await loadPerformanceTab(); } catch (e) { hideLoading(); showToast('Error: '+e.message,'error'); }
}

function showInterventionModal(studentId, studentName) {
    document.getElementById('intStudentId').value = studentId;
    document.getElementById('intStudentName').value = studentName;
    document.getElementById('intType').value = '';
    document.getElementById('intDesc').value = '';
    document.getElementById('intPriority').value = 'medium';
    showModal('interventionModal');
}

async function saveInterventionForm(event) {
    event.preventDefault();
    var data = { student_id: parseInt(document.getElementById('intStudentId').value), type: document.getElementById('intType').value, description: document.getElementById('intDesc').value, priority: document.getElementById('intPriority').value };
    try { showLoading(); await API.performance.createIntervention(data); hideModal('interventionModal'); showToast('Intervention saved','success'); await loadPerformanceTab(); } catch (e) { hideLoading(); showToast('Error: '+e.message,'error'); }
}

async function loadFeedback(content) {
    var feedback = await API.performance.getFeedback();
    var html = '<div class="card"><div class="card-header"><h3>Student Feedback</h3><button class="btn btn-primary" onclick="showFeedbackModal()"><i class="fas fa-plus"></i> Add</button></div>';
    if (feedback.length === 0) html += '<div class="empty-state"><p>No feedback yet</p></div>';
    else for (var i = 0; i < feedback.length; i++) { var fb = feedback[i]; html += '<div style="background:#f8fafc;border-left:4px solid #3b82f6;border-radius:8px;padding:16px;margin-bottom:12px"><div style="display:flex;justify-content:space-between"><strong>' + fb.first_name + ' ' + fb.last_name + '</strong><span class="badge badge-info">' + fb.category + '</span></div><p>' + fb.feedback_text + '</p><small>' + (fb.given_by_name||'Unknown') + ' | ' + formatDate(fb.date_given) + '</small></div>'; }
    html += '</div>'; content.innerHTML = html;
}

function showFeedbackModal() {
    document.getElementById('feedbackForm').reset();
    var sel = document.getElementById('feedbackStudentSelect');
    sel.innerHTML = '<option value="">Select</option>';
    for (var i = 0; i < allStudents.length; i++) sel.innerHTML += '<option value="' + allStudents[i].id + '">' + allStudents[i].first_name + ' ' + allStudents[i].last_name + '</option>';
    showModal('feedbackModal');
}

async function saveFeedback(event) {
    event.preventDefault();
    var data = { student_id: parseInt(document.getElementById('feedbackStudentSelect').value), category: document.getElementById('feedbackCategory').value, feedback_text: document.getElementById('feedbackText').value };
    try { showLoading(); await API.performance.addFeedback(data); hideModal('feedbackModal'); showToast('Saved','success'); await loadPerformanceTab(); } catch (e) { hideLoading(); showToast('Error: '+e.message,'error'); }
}


function renderCiscoTable() {
    var filter = document.getElementById('ciscoStreamFilter') ? document.getElementById('ciscoStreamFilter').value : '';
    var ciscoScores = allScores.filter(function(s) { return s.exam_score !== null && s.exam_score > 0; });
    if (filter) ciscoScores = ciscoScores.filter(function(s) { return s.stream === filter; });
    var tbody = document.getElementById('ciscoTable');
    if (!tbody) return;
    if (ciscoScores.length === 0) { tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:20px">No Cisco exam scores</td></tr>'; return; }
    var html = '';
    for (var i=0;i<ciscoScores.length;i++) { var s=ciscoScores[i]; html+='<tr><td>'+s.first_name+' '+s.last_name+'</td><td>'+s.stream+'</td><td>Module '+s.module_number+'</td><td><strong>'+s.exam_score+'%</strong></td><td>'+formatDate(s.date_entered)+'</td></tr>'; }
    tbody.innerHTML = html;
}

function renderCombinedTable() {
    var filter = document.getElementById('combinedStreamFilter') ? document.getElementById('combinedStreamFilter').value : '';
    var filtered = filter ? allScores.filter(function(s) { return s.stream === filter; }) : allScores;
    var tbody = document.getElementById('combinedTable');
    if (!tbody) return;
    if (filtered.length === 0) { tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:20px">No scores</td></tr>'; return; }
    var html = '';
    for (var i=0;i<filtered.length;i++) { var s=filtered[i]; html+='<tr><td>'+s.first_name+' '+s.last_name+'</td><td>'+s.stream+'</td><td>Module '+s.module_number+'</td><td>'+(s.quiz_score||'-')+'</td><td>'+(s.practical_score||'-')+'</td><td>'+(s.exam_score||'-')+'</td><td><strong>'+(s.total_score?parseFloat(s.total_score).toFixed(1):'-')+'%</strong></td><td><span style="font-weight:700">'+(s.grade||'-')+'</span></td></tr>'; }
    tbody.innerHTML = html;
}
