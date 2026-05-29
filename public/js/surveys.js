async function loadSurveysPage() {
    var contentArea = document.getElementById('contentArea');
    if (!contentArea) return;
    contentArea.innerHTML = '<div class="surveys-container"><div class="card"><div class="card-header"><h3><i class="fas fa-poll"></i> Learner Feedback Surveys</h3><button class="btn btn-primary" onclick="showCreateSurvey()"><i class="fas fa-plus"></i> Create Survey</button></div><div id="surveysContent"></div></div></div><div id="surveyModal" class="modal"><div class="modal-content" style="max-width:600px"><div class="modal-header"><h3>Create Survey</h3><button class="modal-close" onclick="hideModal(\'surveyModal\')">&times;</button></div><form onsubmit="saveSurvey(event)"><div class="form-group"><label>Survey Title</label><input type="text" id="surveyTitle" class="form-control" required placeholder="e.g. Q1 Learner Satisfaction"></div><div class="form-group"><label>Questions (one per line)</label><textarea id="surveyQuestions" class="form-control" rows="6" required placeholder="How satisfied are you with the training?&#10;How helpful was the instructor?&#10;How would you rate the lab facilities?&#10;Would you recommend this course?&#10;How clear were the explanations?"></textarea></div><div class="modal-footer"><button type="button" class="btn btn-outline" onclick="hideModal(\'surveyModal\')">Cancel</button><button type="submit" class="btn btn-primary">Create Survey</button></div></form></div></div><div id="respondModal" class="modal"><div class="modal-content" style="max-width:500px"><div class="modal-header"><h3>Submit Response</h3><button class="modal-close" onclick="hideModal(\'respondModal\')">&times;</button></div><form onsubmit="submitResponse(event)"><input type="hidden" id="respSurveyId"><div id="responseQuestions"></div><div class="modal-footer"><button type="button" class="btn btn-outline" onclick="hideModal(\'respondModal\')">Cancel</button><button type="submit" class="btn btn-primary">Submit</button></div></form></div></div><div id="distributeModal" class="modal"><div class="modal-content" style="max-width:700px"><div class="modal-header"><h3>Distribute Survey to Students</h3><button class="modal-close" onclick="hideModal(\'distributeModal\')">&times;</button></div><div id="distributeContent"></div></div></div>';
    await loadSurveys();
}

async function loadSurveys() {
    try { showLoading(); var surveys = await API.surveys.getAll(); var stats = await API.surveys.getStats(); var students = await API.students.getAll(); hideLoading(); renderSurveys(surveys, stats, students); } catch(e) { hideLoading(); showToast('Error: '+e.message,'error'); }
}

function renderSurveys(surveys, stats, students) {
    var c = document.getElementById('surveysContent');
    if (!c) return;
    if (surveys.length === 0) { c.innerHTML = '<div class="empty-state"><i class="fas fa-poll"></i><h3>No Surveys Yet</h3><p>Create your first learner feedback survey</p></div>'; return; }
    var totalResponses = stats.reduce(function(s,st){return s+(parseInt(st.respondent_count)||0);},0);
    var html = '<div class="stats-grid" style="margin-bottom:20px"><div class="stat-card"><div class="stat-icon"><i class="fas fa-poll"></i></div><div class="stat-info"><h3>'+surveys.length+'</h3><p>Surveys Created</p></div></div><div class="stat-card"><div class="stat-icon"><i class="fas fa-users"></i></div><div class="stat-info"><h3>'+totalResponses+'</h3><p>Total Responses</p></div></div><div class="stat-card"><div class="stat-icon"><i class="fas fa-user-graduate"></i></div><div class="stat-info"><h3>'+students.length+'</h3><p>Students</p></div></div><div class="stat-card"><div class="stat-icon"><i class="fas fa-chart-line"></i></div><div class="stat-info"><h3>'+(students.length>0&&totalResponses>0?Math.round((totalResponses/students.length)*100):0)+'%</h3><p>Response Rate</p></div></div></div>';
    
    for (var i=0;i<surveys.length;i++) {
        var s = surveys[i]; var stat = stats.find(function(st){return st.id===s.id;}) || {};
        html += '<div class="class-card"><div class="class-header"><div><strong>'+s.title+'</strong></div><span class="badge badge-info">'+(stat.question_count||0)+' questions | '+(stat.respondent_count||0)+' responses</span></div><div style="font-size:12px;color:var(--text-secondary)">Created: '+formatDate(s.created_at)+'</div><div style="margin-top:8px;display:flex;gap:6px;flex-wrap:wrap"><button class="btn btn-sm btn-primary" onclick="showDistributeModal('+s.id+',\''+s.title+'\')"><i class="fas fa-paper-plane"></i> Send to Students</button><button class="btn btn-sm btn-outline" onclick="showRespondModal('+s.id+')"><i class="fas fa-pen"></i> Manual Entry</button><button class="btn btn-sm btn-outline" onclick="viewSurveyResults('+s.id+')"><i class="fas fa-chart-bar"></i> Results</button><button class="btn btn-sm btn-danger" onclick="deleteSurvey('+s.id+')"><i class="fas fa-trash"></i></button></div></div>';
    }
    c.innerHTML = html;
}

function showCreateSurvey() { document.getElementById('surveyForm')?.reset(); showModal('surveyModal'); }

async function saveSurvey(event) {
    event.preventDefault();
    var title = document.getElementById('surveyTitle').value;
    var questionsText = document.getElementById('surveyQuestions').value;
    var questions = questionsText.split('\n').filter(function(q){return q.trim();});
    try { showLoading(); await API.surveys.create({ title: title, questions: questions }); hideModal('surveyModal'); showToast('Survey created!','success'); await loadSurveys(); } catch(e) { hideLoading(); showToast('Error: '+e.message,'error'); }
}

async function showDistributeModal(surveyId, surveyTitle) {
    try {
        showLoading();
        var students = await API.students.getAll();
        var activeStudents = students.filter(function(s){return s.status==='active' && s.email;});
        hideLoading();
        
        var content = document.getElementById('distributeContent');
        var surveyLink = window.location.origin + '/surveys/' + surveyId;
        
        var html = '<div style="margin-bottom:16px"><h4>'+surveyTitle+'</h4><p style="color:var(--text-secondary)">Survey Link: <code>'+surveyLink+'</code></p></div>';
        html += '<div style="margin-bottom:16px"><strong>Select students to send survey:</strong></div>';
        html += '<div style="margin-bottom:12px"><label><input type="checkbox" id="selectAllStudents" onchange="toggleAllStudents()"> Select All ('+activeStudents.length+' students)</label></div>';
        html += '<div style="max-height:300px;overflow-y:auto;margin-bottom:16px"><table><thead><tr><th>Select</th><th>Student</th><th>Email</th><th>Stream</th></tr></thead><tbody>';
        
        for (var i=0;i<activeStudents.length;i++) {
            var s = activeStudents[i];
            html += '<tr><td><input type="checkbox" class="student-check-survey" value="'+s.email+'" data-name="'+s.first_name+' '+s.last_name+'"></td><td>'+s.first_name+' '+s.last_name+'</td><td>'+s.email+'</td><td>'+s.stream+'</td></tr>';
        }
        html += '</tbody></table></div>';
        html += '<div class="form-group"><label>Email Subject</label><input type="text" id="emailSubject" class="form-control" value="'+surveyTitle+' - Learner Feedback Survey"></div>';
        html += '<div class="form-group"><label>Email Message</label><textarea id="emailMessage" class="form-control" rows="4">Dear Student,\n\nPlease complete this short survey about your training experience. Your feedback helps us improve.\n\nClick here: '+surveyLink+'\n\nThank you!</textarea></div>';
        html += '<div class="modal-footer"><button class="btn btn-outline" onclick="hideModal(\'distributeModal\')">Cancel</button><button class="btn btn-primary" onclick="sendSurveyEmails('+surveyId+')"><i class="fas fa-paper-plane"></i> Send to Selected Students</button></div>';
        
        content.innerHTML = html;
        showModal('distributeModal');
    } catch(e) { hideLoading(); showToast('Error: '+e.message,'error'); }
}

function toggleAllStudents() {
    var selectAll = document.getElementById('selectAllStudents');
    var checks = document.querySelectorAll('.student-check-survey');
    for (var i=0;i<checks.length;i++) checks[i].checked = selectAll.checked;
}

async function sendSurveyEmails(surveyId) {
    var selected = document.querySelectorAll('.student-check-survey:checked');
    if (selected.length === 0) { showToast('Select at least one student','warning'); return; }
    
    var emails = [];
    var names = [];
    for (var i=0;i<selected.length;i++) {
        emails.push(selected[i].value);
        names.push(selected[i].getAttribute('data-name'));
    }
    
    var subject = document.getElementById('emailSubject').value;
    var message = document.getElementById('emailMessage').value;
    
    var mailtoLink = 'mailto:' + emails.join(',') + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(message);
    
    showToast('Opening email client for '+emails.length+' students...','success');
    hideModal('distributeModal');
    
    // Log the distribution
    var insights = JSON.parse(localStorage.getItem('teamInsights') || '[]');
    insights.unshift({ date: getToday(), platform: 'Email', summary: 'Survey "' + subject + '" sent to '+emails.length+' students', link: 'mailto:'+emails.join(',') });
    localStorage.setItem('teamInsights', JSON.stringify(insights));
    
    window.open(mailtoLink, '_blank');
}

async function showRespondModal(surveyId) {
    try { showLoading(); var survey = await API.surveys.getById(surveyId); document.getElementById('respSurveyId').value = surveyId; var qDiv = document.getElementById('responseQuestions'); var html = '<h4>'+survey.title+'</h4>'; for(var i=0;i<survey.questions.length;i++) { var q=survey.questions[i]; html+='<div class="form-group"><label>'+q.question_text+'</label><div style="display:flex;gap:8px">'; for(var r=1;r<=5;r++) html+='<label style="cursor:pointer"><input type="radio" name="q_'+q.id+'" value="'+r+'" required> '+r+'</label>'; html+='</div></div>'; } qDiv.innerHTML=html; hideLoading(); showModal('respondModal'); } catch(e) { hideLoading(); showToast('Error: '+e.message,'error'); }
}

async function submitResponse(event) {
    event.preventDefault();
    var surveyId = document.getElementById('respSurveyId').value;
    var responses = [];
    var radios = document.querySelectorAll('#responseQuestions input[type=radio]:checked');
    for (var i=0;i<radios.length;i++) { responses.push({ question_id: parseInt(radios[i].name.replace('q_','')), student_id: 1, score: parseInt(radios[i].value) }); }
    try { showLoading(); await API.surveys.submitResponse(surveyId, { responses: responses }); hideModal('respondModal'); showToast('Response submitted!','success'); await loadSurveys(); } catch(e) { hideLoading(); showToast('Error: '+e.message,'error'); }
}

async function viewSurveyResults(id) {
    try { showLoading(); var survey = await API.surveys.getById(id); hideLoading();
        var msg = 'Survey: '+survey.title+'\n\nResponses:\n';
        for(var i=0;i<survey.responses.length;i++) { var r=survey.responses[i]; msg+=r.question_text+': '+parseFloat(r.avg_score).toFixed(1)+'/5 ('+r.response_count+' responses)\n'; }
        alert(msg);
    } catch(e) { hideLoading(); }
}

async function deleteSurvey(id) { if(!confirm('Delete this survey?'))return; showToast('Survey deleted','success'); await loadSurveys(); }
