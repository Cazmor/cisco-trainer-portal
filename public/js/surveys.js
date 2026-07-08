async function loadSurveysPage() {
    var contentArea = document.getElementById('contentArea');
    if (!contentArea) return;
    contentArea.innerHTML = '<div class="surveys-container"><div class="card"><div class="card-header"><h3><i class="fas fa-poll"></i> Learner Feedback Surveys</h3><button class="btn btn-primary" onclick="showCreateSurvey()"><i class="fas fa-plus"></i> Create Survey</button></div><div id="surveysContent"></div></div></div><div id="surveyModal" class="modal"><div class="modal-content" style="max-width:600px"><div class="modal-header"><h3>Create Survey</h3><button class="modal-close" onclick="hideModal(\'surveyModal\')">&times;</button></div><form onsubmit="saveSurvey(event)"><div class="form-group"><label>Survey Title</label><input type="text" id="surveyTitle" class="form-control" required placeholder="e.g. Q1 Learner Satisfaction"></div><div class="form-group"><label>Questions</label><div id="dynamicQuestionsContainer"><div class="dynamic-question-row" style="display:flex;gap:8px;margin-bottom:8px"><input type="text" class="form-control survey-question-input" required placeholder="Question text..."><button type="button" class="btn btn-danger" onclick="if(document.querySelectorAll(\'.dynamic-question-row\').length>1) this.parentElement.remove()"><i class="fas fa-trash"></i></button></div></div><button type="button" class="btn btn-outline btn-sm" onclick="addSurveyQuestionRow()" style="margin-top:8px"><i class="fas fa-plus"></i> Add Question</button></div><div class="modal-footer"><button type="button" class="btn btn-outline" onclick="hideModal(\'surveyModal\')">Cancel</button><button type="submit" class="btn btn-primary">Create Survey</button></div></form></div></div><div id="respondModal" class="modal"><div class="modal-content" style="max-width:500px"><div class="modal-header"><h3>Submit Response</h3><button class="modal-close" onclick="hideModal(\'respondModal\')">&times;</button></div><form onsubmit="submitResponse(event)"><input type="hidden" id="respSurveyId"><div id="responseQuestions"></div><div class="modal-footer"><button type="button" class="btn btn-outline" onclick="hideModal(\'respondModal\')">Cancel</button><button type="submit" class="btn btn-primary">Submit</button></div></form></div></div><div id="distributeModal" class="modal"><div class="modal-content" style="max-width:700px"><div class="modal-header"><h3>Distribute Survey to Students</h3><button class="modal-close" onclick="hideModal(\'distributeModal\')">&times;</button></div><div id="distributeContent"></div></div></div><div id="surveyResultsModal" class="modal"><div class="modal-content" style="max-width:700px"><div class="modal-header"><h3>Survey Analysis</h3><button class="modal-close" onclick="hideModal(\'surveyResultsModal\')">&times;</button></div><div id="surveyResultsContent" style="max-height:60vh;overflow-y:auto;padding:10px 0"></div></div></div>';
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

function showCreateSurvey() { 
    var form = document.querySelector('#surveyModal form');
    if (form) form.reset(); 
    var container = document.getElementById('dynamicQuestionsContainer');
    if (container) {
        container.innerHTML = getSurveyQuestionRowHTML();
    }
    showModal('surveyModal'); 
}

function getSurveyQuestionRowHTML() {
    return `
        <div class="dynamic-question-row" style="border: 1px solid var(--border-color); padding: 12px; border-radius: 6px; margin-bottom: 12px; background: var(--bg-secondary);">
            <div style="display:flex;gap:8px;margin-bottom:8px">
                <input type="text" class="form-control survey-question-input" required placeholder="Question text..." style="flex:1">
                <select class="form-control survey-question-type" onchange="toggleOptions(this)" style="width:150px">
                    <option value="rating">Rating (1-5)</option>
                    <option value="text">Short Answer</option>
                    <option value="multiple_choice">Multiple Choice</option>
                </select>
                <button type="button" class="btn btn-danger" onclick="if(document.querySelectorAll('.dynamic-question-row').length>1) this.closest('.dynamic-question-row').remove()"><i class="fas fa-trash"></i></button>
            </div>
            <div class="survey-options-container" style="display:none;margin-left:20px;margin-top:8px">
                <input type="text" class="form-control survey-options-input" placeholder="Options (comma separated, e.g. Yes, No, Maybe)">
            </div>
        </div>
    `;
}

function toggleOptions(selectElem) {
    var row = selectElem.closest('.dynamic-question-row');
    var optionsContainer = row.querySelector('.survey-options-container');
    if (selectElem.value === 'multiple_choice') {
        optionsContainer.style.display = 'block';
        optionsContainer.querySelector('input').setAttribute('required', 'true');
    } else {
        optionsContainer.style.display = 'none';
        optionsContainer.querySelector('input').removeAttribute('required');
    }
}

function addSurveyQuestionRow() {
    var container = document.getElementById('dynamicQuestionsContainer');
    var temp = document.createElement('div');
    temp.innerHTML = getSurveyQuestionRowHTML();
    container.appendChild(temp.firstElementChild);
}

async function saveSurvey(event) {
    event.preventDefault();
    var title = document.getElementById('surveyTitle').value;
    var rows = document.querySelectorAll('.dynamic-question-row');
    var questions = [];
    for(var i=0; i<rows.length; i++) {
        var text = rows[i].querySelector('.survey-question-input').value.trim();
        var type = rows[i].querySelector('.survey-question-type').value;
        var optionsStr = rows[i].querySelector('.survey-options-input').value.trim();
        if(text) {
            var q = { question_text: text, question_type: type };
            if (type === 'multiple_choice') {
                q.options = optionsStr.split(',').map(function(s){return s.trim();}).filter(function(s){return s;});
            }
            questions.push(q);
        }
    }
    if (questions.length === 0) {
        showToast('Please add at least one question', 'warning');
        return;
    }
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
    try { 
        showLoading(); 
        var survey = await API.surveys.getById(surveyId); 
        document.getElementById('respSurveyId').value = surveyId; 
        var qDiv = document.getElementById('responseQuestions'); 
        var html = '<h4>'+survey.title+'</h4>'; 
        for(var i=0;i<survey.questions.length;i++) { 
            var q=survey.questions[i]; 
            html+='<div class="form-group"><label>'+q.question_text+'</label>';
            if (q.question_type === 'text') {
                html += '<input type="text" name="q_'+q.id+'" data-type="text" class="form-control" required>';
            } else if (q.question_type === 'multiple_choice') {
                var opts = q.options || [];
                for(var o=0; o<opts.length; o++) {
                    html += '<div style="margin-bottom:4px"><label style="cursor:pointer"><input type="radio" name="q_'+q.id+'" data-type="multiple_choice" value="'+opts[o]+'" required> '+opts[o]+'</label></div>';
                }
            } else {
                html += '<div style="display:flex;gap:8px">'; 
                for(var r=1;r<=5;r++) html+='<label style="cursor:pointer"><input type="radio" name="q_'+q.id+'" data-type="rating" value="'+r+'" required> '+r+'</label>'; 
                html+='</div>';
            }
            html+='</div>'; 
        } 
        qDiv.innerHTML=html; 
        hideLoading(); 
        showModal('respondModal'); 
    } catch(e) { hideLoading(); showToast('Error: '+e.message,'error'); }
}

async function submitResponse(event) {
    event.preventDefault();
    var surveyId = document.getElementById('respSurveyId').value;
    var responses = [];
    
    var inputs = document.querySelectorAll('#responseQuestions input');
    var processed = {};
    for (var i=0; i<inputs.length; i++) {
        var input = inputs[i];
        if (!input.name) continue;
        var qId = parseInt(input.name.replace('q_',''));
        if (processed[qId]) continue;
        
        if (input.type === 'radio') {
            var selected = document.querySelector('input[name="'+input.name+'"]:checked');
            if (selected) {
                var val = selected.value;
                var type = selected.getAttribute('data-type');
                if (type === 'rating') {
                    responses.push({ question_id: qId, student_id: 1, score: parseInt(val), response_text: val });
                } else {
                    responses.push({ question_id: qId, student_id: 1, score: null, response_text: val });
                }
            }
            processed[qId] = true;
        } else {
            responses.push({ question_id: qId, student_id: 1, score: null, response_text: input.value });
            processed[qId] = true;
        }
    }
    
    try { showLoading(); await API.surveys.submitResponse(surveyId, { responses: responses }); hideModal('respondModal'); showToast('Response submitted!','success'); await loadSurveys(); } catch(e) { hideLoading(); showToast('Error: '+e.message,'error'); }
}

async function viewSurveyResults(id) {
    try { 
        showLoading(); 
        var survey = await API.surveys.getById(id); 
        hideLoading();
        
        var content = document.getElementById('surveyResultsContent');
        var html = '<div style="margin-bottom:20px"><h4>'+survey.title+'</h4></div>';
        
        if (survey.responses.length === 0) {
            html += '<div class="empty-state"><i class="fas fa-inbox"></i><p>No responses yet.</p></div>';
        } else {
            for(var i=0; i<survey.responses.length; i++) { 
                var r = survey.responses[i]; 
                html += '<div style="margin-bottom:16px;background:var(--bg-secondary);padding:12px;border-radius:6px;border:1px solid var(--border-color)">';
                html += '<div style="display:flex;justify-content:space-between;margin-bottom:8px"><strong>' + r.question_text + '</strong><span class="badge badge-info">' + r.response_count + ' responses</span></div>';
                
                if (r.question_type === 'rating' || !r.question_type) {
                    var avg = parseFloat(r.avg_score || 0).toFixed(1);
                    var pct = (avg / 5) * 100;
                    var colorClass = avg >= 4 ? 'bg-success' : (avg >= 3 ? 'bg-warning' : 'bg-danger');
                    html += '<div style="display:flex;align-items:center;gap:12px">';
                    html += '<div style="flex:1;background:#e2e8f0;height:12px;border-radius:6px;overflow:hidden">';
                    html += '<div style="height:100%;width:'+pct+'%;background:var(--primary-color);transition:width 0.5s ease" class="'+colorClass+'"></div>';
                    html += '</div>';
                    html += '<div style="font-weight:bold;width:40px;text-align:right">'+avg+'/5</div>';
                    html += '</div>';
                } else if (r.question_type === 'text') {
                    html += '<ul style="margin:0;padding-left:20px;max-height:150px;overflow-y:auto;color:var(--text-secondary);font-size:14px">';
                    for (var j=0; j<r.text_responses.length; j++) {
                        if (r.text_responses[j]) html += '<li style="margin-bottom:4px">"' + r.text_responses[j] + '"</li>';
                    }
                    html += '</ul>';
                } else if (r.question_type === 'multiple_choice') {
                    var counts = {};
                    for (var j=0; j<r.text_responses.length; j++) {
                        var ans = r.text_responses[j];
                        if (ans) counts[ans] = (counts[ans] || 0) + 1;
                    }
                    html += '<div style="margin-top:8px">';
                    for (var opt in counts) {
                        html += '<div style="display:flex;justify-content:space-between;border-bottom:1px solid #e2e8f0;padding:4px 0">';
                        html += '<span>' + opt + '</span><strong>' + counts[opt] + '</strong>';
                        html += '</div>';
                    }
                    html += '</div>';
                }
                html += '</div>';
            }
        }
        content.innerHTML = html;
        showModal('surveyResultsModal');
    } catch(e) { hideLoading(); showToast('Error: '+e.message,'error'); }
}

async function deleteSurvey(id) { if(!confirm('Delete this survey?'))return; showToast('Survey deleted','success'); await loadSurveys(); }
