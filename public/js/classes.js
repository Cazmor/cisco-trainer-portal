var currentClassesTab = 'schedule';
var allClasses = [];
var allTimetable = [];
var allPlans = [];
var allInnovations = [];
var allCurriculum = [];
var allStudents = [];

async function loadClassesPage() {
    var contentArea = document.getElementById('contentArea');
    if (!contentArea) return;
    contentArea.innerHTML = '<div class="classes-container"><div class="performance-tabs"><button class="performance-tab active" onclick="switchClassesTab(\'schedule\')"><i class="fas fa-calendar"></i> Schedule</button><button class="performance-tab" onclick="switchClassesTab(\'timetable\')"><i class="fas fa-clock"></i> Timetable</button><button class="performance-tab" onclick="switchClassesTab(\'delivery\')"><i class="fas fa-tasks"></i> Delivery Plan</button><button class="performance-tab" onclick="switchClassesTab(\'evidence\')"><i class="fas fa-camera"></i> Evidence</button><button class="performance-tab" onclick="switchClassesTab(\'innovation\')"><i class="fas fa-lightbulb"></i> Innovation</button><button class="performance-tab" onclick="switchClassesTab(\'analytics\')"><i class="fas fa-chart-pie"></i> Analytics</button></div><div id="classesContent"></div></div><div id="scheduleModal" class="modal"><div class="modal-content" style="max-width:700px"><div class="modal-header"><h3>Schedule Class</h3><button class="modal-close" onclick="hideModal(\'scheduleModal\')">&times;</button></div><form id="scheduleForm" onsubmit="saveScheduledClass(event)"><div class="form-row"><div class="form-group"><label>Class Type</label><select id="schedType" class="form-control" required onchange="toggleClassFields()"><option value="">Select</option><option value="cisco">Cisco Class</option><option value="extra">Extra Class</option><option value="activity">Other Activity</option></select></div><div class="form-group"><label>Stream</label><select id="schedStream" class="form-control" required><option value="">Select</option><option value="Love">Love</option><option value="Joy">Joy</option><option value="Peace">Peace</option><option value="Mnara">Mnara</option><option value="All Streams">All Streams</option></select></div></div><div class="form-row"><div class="form-group"><label>Date</label><input type="date" id="schedDate" class="form-control" required></div><div class="form-row"><div class="form-group"><label>Start</label><input type="time" id="schedStart" class="form-control" required></div><div class="form-group"><label>End</label><input type="time" id="schedEnd" class="form-control" required></div></div></div><div id="ciscoFields"><div class="form-row"><div class="form-group"><label>Module</label><select id="schedModule" class="form-control" onchange="loadSubtopics()"><option value="">Select Module</option></select></div><div class="form-group"><label>Section / Sub-Topic</label><select id="schedSubtopic" class="form-control"><option value="">Select Section</option></select></div></div></div><div id="extraFields" style="display:none"><div class="form-group"><label>Lesson Name</label><input type="text" id="extraLesson" class="form-control" placeholder="e.g. Revision, Lab Practice"></div><div class="form-group"><label>Topic / Description</label><textarea id="extraTopic" class="form-control" rows="2"></textarea></div></div><div id="activityFields" style="display:none"><div class="form-group"><label>Activity Name</label><input type="text" id="activityName" class="form-control" placeholder="e.g. Sports, Event"></div><div class="form-group"><label>Description</label><textarea id="activityDesc" class="form-control" rows="2"></textarea></div></div><div class="form-group"><label>Notes</label><textarea id="schedNotes" class="form-control" rows="2"></textarea></div><div class="modal-footer"><button type="button" class="btn btn-outline" onclick="hideModal(\'scheduleModal\')">Cancel</button><button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> Schedule</button></div></form></div></div><div id="innovationModal" class="modal"><div class="modal-content"><div class="modal-header"><h3>Add Innovation</h3><button class="modal-close" onclick="hideModal(\'innovationModal\')">&times;</button></div><form id="innovationForm" onsubmit="saveInnovation(event)"><div class="form-group"><label>Term</label><select id="innovTerm" class="form-control" required><option value="1">Term 1</option><option value="2">Term 2</option><option value="3">Term 3</option></select></div><div class="form-group"><label>Methodology Name</label><input type="text" id="innovName" class="form-control" required></div><div class="form-group"><label>Description</label><textarea id="innovDesc" class="form-control" rows="3" required></textarea></div><div class="form-group"><label>Impact</label><textarea id="innovImpact" class="form-control" rows="2"></textarea></div><div class="form-row"><div class="form-group"><label>Before (%)</label><input type="number" id="innovBefore" class="form-control" min="0" max="100"></div><div class="form-group"><label>After (%)</label><input type="number" id="innovAfter" class="form-control" min="0" max="100"></div></div><div class="modal-footer"><button type="button" class="btn btn-outline" onclick="hideModal(\'innovationModal\')">Cancel</button><button type="submit" class="btn btn-primary">Save</button></div></form></div></div>';
    await loadClassesData();
}

async function loadClassesData() {
    try { showLoading(); allStudents = await API.students.getAll(); allClasses = await API.classes.getScheduled(); allTimetable = await API.classes.getTimetable(); allPlans = await API.classes.getDeliveryPlan(); allInnovations = await API.classes.getInnovation(); allCurriculum = await API.classes.getCurriculum(); hideLoading(); await loadClassesTab(); } catch (e) { hideLoading(); showToast('Error: '+e.message,'error'); }
}

async function switchClassesTab(tab) { currentClassesTab = tab; var tabs = document.querySelectorAll('.performance-tab'); for (var i = 0; i < tabs.length; i++) tabs[i].classList.remove('active'); event.target.classList.add('active'); await loadClassesTab(); }

async function loadClassesTab() { var content = document.getElementById('classesContent'); if (!content) return; showLoading(); try { if (currentClassesTab === 'schedule') loadScheduleTab(content); else if (currentClassesTab === 'timetable') loadTimetableTab(content); else if (currentClassesTab === 'delivery') loadDeliveryTab(content); else if (currentClassesTab === 'evidence') loadEvidenceTab(content); else if (currentClassesTab === 'innovation') loadInnovationTab(content); else if (currentClassesTab === 'analytics') loadAnalyticsTab(content); } catch (e) { content.innerHTML = '<p>Error: '+e.message+'</p>'; } hideLoading(); }

function showScheduleModal() { document.getElementById('scheduleForm').reset(); document.getElementById('schedDate').value = getToday(); document.getElementById('schedType').value = ''; document.getElementById('ciscoFields').style.display = 'block'; document.getElementById('extraFields').style.display = 'none'; document.getElementById('activityFields').style.display = 'none'; var modSelect = document.getElementById('schedModule'); modSelect.innerHTML = '<option value="">Select Module</option>'; var modules = {}; for (var i = 0; i < allCurriculum.length; i++) { var m = allCurriculum[i]; if (!modules[m.module_number]) modules[m.module_number] = m.module_name; } for (var key in modules) { modSelect.innerHTML += '<option value="' + key + '">Module ' + key + ': ' + modules[key] + '</option>'; } showModal('scheduleModal'); }

function toggleClassFields() { var type = document.getElementById('schedType').value; document.getElementById('ciscoFields').style.display = (type === 'cisco') ? 'block' : 'none'; document.getElementById('extraFields').style.display = (type === 'extra') ? 'block' : 'none'; document.getElementById('activityFields').style.display = (type === 'activity') ? 'block' : 'none'; }

function loadSubtopics() { var module = document.getElementById('schedModule').value; var select = document.getElementById('schedSubtopic'); select.innerHTML = '<option value="">Select Section</option>'; if (!module) return; for (var i = 0; i < allCurriculum.length; i++) { var c = allCurriculum[i]; if (c.module_number == module) { select.innerHTML += '<option value="' + c.section_number + '">' + c.section_number + ' - ' + c.section_name + '</option>'; } } }

async function saveScheduledClass(event) { event.preventDefault(); var type = document.getElementById('schedType').value; var data = { class_type: type, stream: document.getElementById('schedStream').value, date: document.getElementById('schedDate').value, start_time: document.getElementById('schedStart').value, end_time: document.getElementById('schedEnd').value, notes: document.getElementById('schedNotes').value, status: 'scheduled' }; if (type === 'cisco') { data.module_number = parseInt(document.getElementById('schedModule').value) || null; var subtopic = document.getElementById('schedSubtopic'); data.topics = subtopic.value ? subtopic.selectedOptions[0].text : ''; } else if (type === 'extra') { data.extra_type = document.getElementById('extraLesson').value; data.topics = document.getElementById('extraTopic').value; } else if (type === 'activity') { data.extra_type = document.getElementById('activityName').value; data.topics = document.getElementById('activityDesc').value; } try { showLoading(); await API.classes.schedule(data); hideModal('scheduleModal'); showToast('Scheduled!','success'); await loadClassesData(); await loadClassesTab(); } catch (e) { hideLoading(); showToast('Error: '+e.message,'error'); } }

async function markComplete(id) { try { showLoading(); await API.classes.updateClass(id, { status: 'completed' }); showToast('Completed','success'); await loadClassesData(); await loadClassesTab(); } catch (e) { showToast('Error: '+e.message,'error'); } }

async function deleteClass(id) { if (!confirm('Delete?')) return; try { await API.classes.deleteClass(id); showToast('Deleted','success'); await loadClassesData(); await loadClassesTab(); } catch (e) { showToast('Error: '+e.message,'error'); } }

function loadScheduleTab(content) {
    var today = getToday();
    var upcoming = allClasses.filter(function(c) { return c.date >= today && c.status === 'scheduled'; });
    var past = allClasses.filter(function(c) { return c.date < today || c.status !== 'scheduled'; });
    var html = '<div class="card" style="margin-bottom:20px"><div class="card-header"><h3>Upcoming Classes</h3><button class="btn btn-primary" onclick="showScheduleModal()"><i class="fas fa-plus"></i> Schedule</button></div>';
    if (upcoming.length === 0) html += '<div class="empty-state"><p>No upcoming classes</p></div>';
    else for (var i = 0; i < upcoming.length; i++) { var c = upcoming[i]; html += '<div class="class-card"><div class="class-header"><strong>' + c.stream + '</strong> - <span class="badge badge-' + (c.class_type==='cisco'?'info':c.class_type==='extra'?'warning':'secondary') + '">' + (c.class_type==='cisco'?'Cisco':c.class_type==='extra'?(c.extra_type||'Extra'):(c.extra_type||'Activity')) + '</span></div><div class="class-details"><div><i class="fas fa-clock"></i> ' + c.start_time + '-' + c.end_time + '</div><div><i class="fas fa-calendar"></i> ' + formatDate(c.date) + '</div>' + (c.module_number?'<div><i class="fas fa-book"></i> Module '+c.module_number+'</div>':'') + (c.topics?'<div><i class="fas fa-list"></i> '+c.topics.substring(0,40)+'</div>':'') + '</div><div style="margin-top:8px"><button class="btn btn-sm btn-success" onclick="markComplete('+c.id+')">Complete</button> <button class="btn btn-sm btn-danger" onclick="deleteClass('+c.id+')">Delete</button></div></div>'; }
    html += '</div><div class="card"><div class="card-header"><h3>Past Classes</h3></div><div class="table-container"><table><thead><tr><th>Date</th><th>Type</th><th>Stream</th><th>Topic</th><th>Status</th><th>Action</th></tr></thead><tbody>';
    for (var j = 0; j < past.length; j++) { var pc = past[j]; html += '<tr><td>'+formatDate(pc.date)+'</td><td><span class="badge badge-'+(pc.class_type==='cisco'?'info':pc.class_type==='extra'?'warning':'secondary')+'">'+(pc.class_type==='cisco'?'Cisco':pc.class_type==='extra'?(pc.extra_type||'Extra'):(pc.extra_type||'Activity'))+'</span></td><td>'+pc.stream+'</td><td>'+(pc.topics||'-')+'</td><td><span class="badge badge-'+(pc.status==='completed'?'success':pc.status==='cancelled'?'danger':'warning')+'">'+pc.status+'</span></td><td><button class="btn btn-sm btn-danger" onclick="markComplete('+pc.id+')">Complete</button> <button class="btn btn-sm btn-danger" onclick="deleteClass('+pc.id+')">Delete</button></td></tr>'; }
    html += '</tbody></table></div></div>';
    content.innerHTML = html;
}

function loadTimetableTab(content) { var days = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']; var html = '<div class="card"><div class="card-header"><h3>Weekly Timetable</h3><button class="btn btn-primary" onclick="showAddTimetable()"><i class="fas fa-plus"></i> Add</button></div><div class="timetable-grid">'; for (var d = 0; d < days.length; d++) { var dayClasses = allTimetable.filter(function(t) { return t.day_of_week === days[d]; }); html += '<div class="timetable-card"><div class="timetable-day">'+days[d]+'</div>'; if (dayClasses.length===0) html += '<p style="font-size:13px;color:var(--text-secondary)">Empty</p>'; else for (var c=0;c<dayClasses.length;c++){var tc=dayClasses[c];html+='<div style="margin-bottom:6px;padding:8px;background:var(--bg-secondary);border-radius:6px"><strong>'+tc.stream+'</strong><br><small>'+tc.start_time+'-'+tc.end_time+' | '+tc.session_type+'</small><br><button class="btn btn-sm btn-outline" style="margin-top:4px;margin-right:4px" onclick="quickSchedule(\''+tc.stream+'\',\''+tc.start_time+'\',\''+tc.end_time+'\')">Schedule</button><button class="btn btn-sm btn-danger" style="margin-top:4px" onclick="deleteTimetable('+tc.id+')">Delete</button></div>';} html += '</div>'; } html += '</div></div>'; content.innerHTML = html; }

function quickSchedule(stream,start,end) { document.getElementById('schedStream').value=stream; document.getElementById('schedStart').value=start; document.getElementById('schedEnd').value=end; document.getElementById('schedDate').value=getToday(); document.getElementById('schedType').value='cisco'; toggleClassFields(); showModal('scheduleModal'); }

function showAddTimetable() { var day=prompt('Day (Monday-Saturday):');if(!day)return;var stream=prompt('Stream:');if(!stream)return;var start=prompt('Start (HH:MM):','08:00');if(!start)return;var end=prompt('End (HH:MM):','12:00');if(!end)return;var type=prompt('Type (cisco/extra/intensive):','cisco');addTimetable(day,stream,start,end,type); }
async function addTimetable(day,stream,start,end,type) { try { await API.classes.addTimetable({day_of_week:day,stream:stream,start_time:start,end_time:end,session_type:type||'cisco'}); showToast('Added','success'); await loadClassesData(); await loadClassesTab(); } catch(e) { showToast('Error: '+e.message,'error'); } }
async function deleteTimetable(id) { if(!confirm('Delete?'))return; try { await API.classes.updateTimetable(id,{is_active:false}); showToast('Removed','success'); await loadClassesData(); await loadClassesTab(); } catch(e) { showToast('Error: '+e.message,'error'); } }

function loadDeliveryTab(content) {
    var streams = ['Love','Joy','Peace','Mnara'];
    var totalH = allPlans.reduce(function(s,p){return s+(p.total_hours||0);},0);
    var doneH = allPlans.reduce(function(s,p){return s+(p.completed_hours||0);},0);
    var overall = totalH>0?Math.round((doneH/totalH)*100):0;
    var completedTopics = [];
    for (var i = 0; i < allClasses.length; i++) { if (allClasses[i].status === 'completed' && allClasses[i].class_type === 'cisco' && allClasses[i].module_number) { completedTopics.push({ stream: allClasses[i].stream, module: allClasses[i].module_number, section: allClasses[i].topics, date: allClasses[i].date }); } }
    var modules = {}; for (var j = 0; j < allCurriculum.length; j++) { var m = allCurriculum[j]; if (!modules[m.module_number]) modules[m.module_number] = { name: m.module_name, sections: [] }; modules[m.module_number].sections.push(m); }
    var terms = [{ num: 1, name: 'Term 1 (18 hrs)', modules: [1,2,3,4] }, { num: 2, name: 'Term 2 (30 hrs)', modules: [5,6,7,8,9,10] }, { num: 3, name: 'Term 3 (22 hrs)', modules: [11,12,13,14] }];
    var html = '<div class="card"><div class="card-header"><h3><i class="fas fa-book"></i> Cisco Curriculum Delivery Plan</h3></div><div style="text-align:center;padding:20px;background:var(--bg-secondary);border-radius:12px;margin-bottom:20px"><div style="font-size:40px;font-weight:700;color:#8b5cf6">'+overall+'%</div><div>Overall | '+doneH+'/'+totalH+' hrs</div></div><div style="margin-bottom:12px"><strong>Stream:</strong> <select id="deliveryFilter" class="form-control" style="width:180px;display:inline;margin-left:8px" onchange="renderDeliveryDetail()"><option value="all">All Streams</option>';
    for (var s=0;s<streams.length;s++) html += '<option value="'+streams[s]+'">'+streams[s]+'</option>';
    html += '</select></div><div id="deliveryDetail"></div></div>';
    content.innerHTML = html;
    window._deliveryData = { streams: streams, completedTopics: completedTopics, modules: modules, terms: terms, plans: allPlans };
    renderDeliveryDetail();
}

function renderDeliveryDetail() { var filter = document.getElementById('deliveryFilter') ? document.getElementById('deliveryFilter').value : 'all'; var detail = document.getElementById('deliveryDetail'); var data = window._deliveryData; if (!detail || !data) return; var html = ''; for (var t = 0; t < data.terms.length; t++) { var term = data.terms[t]; html += '<div style="margin-bottom:20px;padding:16px;background:var(--bg-secondary);border:1px solid var(--border-color);border-radius:12px"><h4 style="color:#8b5cf6;margin-bottom:12px">'+term.name+'</h4>'; for (var mi = 0; mi < term.modules.length; mi++) { var modNum = term.modules[mi]; var modData = data.modules[modNum]; if (!modData) continue; var sections = modData.sections; html += '<div style="margin-bottom:12px;padding:12px;background:var(--bg-secondary);border-radius:8px"><strong style="font-size:15px">Module '+modNum+': '+modData.name+'</strong>'; for (var si = 0; si < sections.length; si++) { var sec = sections[si]; var isCompleted = data.completedTopics.some(function(ct) { return ct.module === modNum && ct.section && ct.section.indexOf(String(sec.section_number)) >= 0 && (filter === 'all' || ct.stream === filter); }); html += '<div style="margin-left:16px;padding:4px 0;font-size:13px;' + (isCompleted ? 'text-decoration:line-through;color:#10b981' : 'color:var(--text-secondary)') + '"><i class="fas fa-' + (isCompleted ? 'check-circle' : 'circle') + '" style="color:' + (isCompleted ? '#10b981' : '#d1d5db') + ';margin-right:8px"></i>' + sec.section_number + ' ' + sec.section_name + (isCompleted ? ' <span style="font-size:10px;color:#10b981">Done</span>' : '') + '</div>'; } html += '</div>'; } html += '</div>'; } detail.innerHTML = html || '<p>No data</p>'; }

function loadEvidenceTab(content) {
    var completed = allClasses.filter(function(c){return c.status==='completed';});
    var html = '<div class="card"><div class="card-header"><h3><i class="fas fa-camera"></i> Class Evidence</h3></div><div class="search-bar"><select id="evidenceClass" class="form-control" onchange="loadEvidencePhotos()"><option value="">Select class...</option>';
    for (var i=0;i<completed.length;i++) { html += '<option value="'+completed[i].id+'">'+formatDate(completed[i].date)+' - '+completed[i].stream+'</option>'; }
    html += '</select><select id="evidenceFilter" class="form-control" onchange="loadEvidencePhotos()"><option value="">All</option><option value="before">Before</option><option value="during">During</option><option value="after">After</option></select><button class="btn btn-primary" onclick="document.getElementById(\'evFile\').click()"><i class="fas fa-upload"></i> Upload</button><input type="file" id="evFile" accept="image/*" style="display:none" onchange="uploadEvidencePhoto(event)"></div><div id="evidenceGallery"><div class="empty-state"><p>Select a class</p></div></div></div>';
    content.innerHTML = html;
}

async function loadEvidencePhotos() { var classId = document.getElementById('evidenceClass').value; if (!classId) return; try { showLoading(); var ev = await API.classes.getEvidence({class_id:classId}); var gal = document.getElementById('evidenceGallery'); if (ev.length===0) gal.innerHTML='<div class="empty-state"><p>No photos</p></div>'; else { var h='<div class="evidence-gallery">'; for (var i=0;i<ev.length;i++){var e=ev[i];h+='<div class="evidence-item"><img src="'+e.photo_url+'" style="width:100%;height:150px;object-fit:cover"><div class="evidence-caption"><span class="badge badge-info">'+e.photo_type+'</span> '+(e.caption||'')+'</div></div>';} h+='</div>'; gal.innerHTML=h; } hideLoading(); } catch(e) { hideLoading(); showToast('Error: '+e.message,'error'); } }

async function uploadEvidencePhoto(event) { var file=event.target.files[0]; if(!file)return; var classId=document.getElementById('evidenceClass').value; if(!classId){showToast('Select class','warning');return;} var fd=new FormData(); fd.append('evidence',file); fd.append('class_id',classId); fd.append('photo_type',document.getElementById('evidenceFilter').value||'during'); fd.append('caption',''); try{showLoading();await API.classes.uploadEvidence(fd);showToast('Uploaded','success');await loadEvidencePhotos();}catch(e){showToast('Error: '+e.message,'error');}finally{hideLoading();event.target.value='';} }

function loadInnovationTab(content) { var html='<div class="card"><div class="card-header"><h3><i class="fas fa-lightbulb"></i> Innovation Log</h3><button class="btn btn-primary" onclick="showModal(\'innovationModal\')"><i class="fas fa-plus"></i> Add</button></div>'; if (allInnovations.length===0) html+='<div class="empty-state"><p>No innovations</p></div>'; else for(var i=0;i<allInnovations.length;i++){var inv=allInnovations[i];html+='<div class="class-card"><div class="class-header"><strong>'+inv.methodology_name+'</strong><span class="badge badge-info">Term '+inv.term+'</span></div><p>'+inv.description+'</p><div class="class-details"><div><i class="fas fa-chart-line"></i> Before: '+(inv.performance_before||'N/A')+'% | After: '+(inv.performance_after||'N/A')+'%</div></div></div>';} html+='</div>'; content.innerHTML=html; }

async function saveInnovation(event) { event.preventDefault(); var data={term:parseInt(document.getElementById('innovTerm').value),methodology_name:document.getElementById('innovName').value,description:document.getElementById('innovDesc').value,documented_impact:document.getElementById('innovImpact').value,performance_before:parseFloat(document.getElementById('innovBefore').value)||null,performance_after:parseFloat(document.getElementById('innovAfter').value)||null}; try{showLoading();await API.classes.addInnovation(data);hideModal('innovationModal');showToast('Saved','success');await loadClassesData();await loadClassesTab();}catch(e){hideLoading();showToast('Error: '+e.message,'error');} }

function loadAnalyticsTab(content) { 
    var total=allClasses.length,completed=allClasses.filter(function(c){return c.status==='completed';}).length,cisco=allClasses.filter(function(c){return c.class_type==='cisco';}).length,extra=allClasses.filter(function(c){return c.class_type!=='cisco';}).length,rate=total>0?Math.round((completed/total)*100):0; 
    var streams=['Love','Joy','Peace','Mnara'],sd=[]; 
    for(var s=0;s<streams.length;s++){
        var sc=allClasses.filter(function(c){return c.stream===streams[s];});
        var comp=sc.filter(function(c){return c.status==='completed';}).length;
        sd.push({stream:streams[s],total:sc.length,completed:comp,rate:sc.length>0?Math.round((comp/sc.length)*100):0});
    } 
    var html='<div class="stats-grid" style="margin-bottom:24px"><div class="stat-card"><div class="stat-icon"><i class="fas fa-calendar"></i></div><div class="stat-info"><h3>'+total+'</h3><p>Total</p></div></div><div class="stat-card"><div class="stat-icon"><i class="fas fa-check-circle"></i></div><div class="stat-info"><h3>'+rate+'%</h3><p>Completed</p></div></div><div class="stat-card"><div class="stat-icon"><i class="fas fa-book"></i></div><div class="stat-info"><h3>'+cisco+'</h3><p>Cisco</p></div></div><div class="stat-card"><div class="stat-icon"><i class="fas fa-star"></i></div><div class="stat-info"><h3>'+extra+'</h3><p>Other</p></div></div></div><div class="charts-grid"><div class="chart-card"><h3>Classes by Stream</h3><canvas id="chart1"></canvas></div><div class="chart-card"><h3>Completion Rates</h3><canvas id="chart2"></canvas></div></div><div class="card" style="margin-top:20px"><div class="card-header"><h3>Stream Analysis</h3></div><table><thead><tr><th>Stream</th><th>Total</th><th>Done</th><th>Rate</th><th>Status</th></tr></thead><tbody>';
    for(var j=0;j<sd.length;j++){
        var d=sd[j];
        html+='<tr><td><strong>'+d.stream+'</strong></td><td>'+d.total+'</td><td>'+d.completed+'</td><td><div style="display:flex;align-items:center;gap:8px"><div style="flex:1;height:6px;background:#e2e8f0;border-radius:3px"><div style="width:'+d.rate+'%;height:100%;background:'+(d.rate>=80?'#10b981':d.rate>=50?'#f59e0b':'#ef4444')+';border-radius:3px"></div></div><span>'+d.rate+'%</span></div></td><td><span class="badge badge-'+(d.rate>=80?'success':d.rate>=50?'warning':'danger')+'">'+(d.rate>=80?'On Track':d.rate>=50?'Needs Attention':'Behind')+'</span></td></tr>';
    }
    html+='</tbody></table></div>'; 
    content.innerHTML=html; 
    setTimeout(function(){
        var c1=document.getElementById('chart1');
        if(c1) new Chart(c1,{type:'bar',data:{labels:sd.map(function(d){return d.stream}),datasets:[{label:'Total',data:sd.map(function(d){return d.total}),backgroundColor:'#3b82f6',borderRadius:8},{label:'Completed',data:sd.map(function(d){return d.completed}),backgroundColor:'#10b981',borderRadius:8}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom'}}}});
        var c2=document.getElementById('chart2');
        if(c2) new Chart(c2,{type:'doughnut',data:{labels:sd.map(function(d){return d.stream}),datasets:[{data:sd.map(function(d){return d.rate}),backgroundColor:['#3b82f6','#10b981','#f59e0b','#8b5cf6']}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom'}}}});
    },300);
}





async function updateDeliveryProgress(planId) {
    var hours = prompt('Completed hours:');
    if (hours === null) return;
    var modules = prompt('Modules completed (comma-separated, e.g. 1,2,3):');
    if (modules === null) return;
    try {
        showLoading();
        await API.classes.updateDeliveryPlan(planId, { completed_hours: parseInt(hours) || 0, modules_completed: modules });
        showToast('Delivery plan updated', 'success');
        await loadClassesData();
        await loadClassesTab();
    } catch (e) { hideLoading(); showToast('Error: ' + e.message, 'error'); }
}

function markSectionComplete(moduleNum, sectionNum, stream) {
    var date = prompt('Date completed (YYYY-MM-DD):', getToday());
    if (!date) return;
    scheduleClassCompletion(moduleNum, sectionNum, stream, date);
}

async function scheduleClassCompletion(moduleNum, sectionNum, stream, date) {
    try {
        showLoading();
        await API.classes.schedule({
            class_type: 'cisco',
            stream: stream,
            date: date,
            start_time: '08:00',
            end_time: '10:00',
            module_number: moduleNum,
            topics: sectionNum + '',
            status: 'completed'
        });
        showToast('Section marked complete', 'success');
        await loadClassesData();
        await loadClassesTab();
    } catch (e) { hideLoading(); showToast('Error: ' + e.message, 'error'); }
}
