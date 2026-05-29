var selectedDate = getToday();
var selectedStream = '';
var attendanceData = [];
var allStudentsData = [];
var matrixData = [];
var currentView = 'daily';
var pendingAbsentStudentId = null;

async function loadAttendancePage() {
    var contentArea = document.getElementById('contentArea');
    if (!contentArea) return;
    contentArea.innerHTML = '<div class="attendance-container">' +
        '<div class="card" style="margin-bottom:20px">' +
            '<div class="card-header"><h3><i class="fas fa-clipboard-list"></i> Attendance Register</h3>' +
                '<div style="display:flex;gap:8px">' +
                    '<button class="btn btn-outline btn-sm ' + (currentView==='daily'?'active':'') + '" onclick="switchAttendanceView(\'daily\')"><i class="fas fa-calendar-day"></i> Daily Register</button>' +
                    '<button class="btn btn-outline btn-sm ' + (currentView==='matrix'?'active':'') + '" onclick="switchAttendanceView(\'matrix\')"><i class="fas fa-table"></i> Performance Matrix</button>' +
                '</div>' +
            '</div>' +
            '<div class="search-bar" style="align-items:center">' +
                '<label style="font-weight:600;font-size:13px">Date:</label><input type="date" id="attDate" value="' + selectedDate + '" style="width:160px">' +
                '<label style="font-weight:600;font-size:13px;margin-left:8px">Stream:</label><select id="attStream" style="width:140px"><option value="">All Streams</option><option value="Love">Love</option><option value="Joy">Joy</option><option value="Peace">Peace</option><option value="Mnara">Mnara</option></select>' +
                '<button class="btn btn-primary" onclick="loadAttendanceSheet()"><i class="fas fa-search"></i> Load Register</button>' +
                '<button class="btn btn-success" onclick="markAllPresentToday()"><i class="fas fa-check-double"></i> Mark All Present</button>' +
                '<button class="btn btn-outline" onclick="exportCurrentView()"><i class="fas fa-download"></i> Export</button>' +
            '</div>' +
            '<div class="attendance-stats" id="attStats"></div>' +
            '<div id="attendanceContent"></div>' +
        '</div>' +
    '</div>' +
    '<div id="absentModal" class="modal"><div class="modal-content"><div class="modal-header"><h3>Mark Absent - Reason</h3><button class="modal-close" onclick="hideModal(\'absentModal\')">&times;</button></div><div class="form-group"><label>Select Reason</label><select id="absentReason" class="form-control"><option value="Sick">Sick</option><option value="Family Emergency">Family Emergency</option><option value="No Reason">No Reason</option><option value="Other">Other</option></select></div><div class="modal-footer"><button class="btn btn-outline" onclick="hideModal(\'absentModal\')">Cancel</button><button class="btn btn-danger" onclick="confirmAbsent()"><i class="fas fa-times"></i> Mark Absent</button></div></div></div>';
    
    allStudentsData = await API.students.getAll();
    await loadAttendanceSheet();
}

function switchAttendanceView(view) { currentView = view; loadAttendancePage(); }

async function loadAttendanceSheet() {
    selectedDate = document.getElementById('attDate') ? document.getElementById('attDate').value : selectedDate;
    selectedStream = document.getElementById('attStream') ? document.getElementById('attStream').value : '';
    try { showLoading(); attendanceData = await API.attendance.get({ date: selectedDate, stream: selectedStream }); if (currentView === 'daily') renderDailyRegister(); else await loadMatrixView(); updateStats(); hideLoading(); } catch (e) { hideLoading(); showToast('Error: ' + e.message, 'error'); }
}

async function loadMatrixView() {
    var startDate = new Date(Date.now() - 30*24*60*60*1000).toISOString().split('T')[0];
    var endDate = getToday();
    matrixData = await API.attendance.getMatrix({ start_date: startDate, end_date: endDate, stream: selectedStream });
    renderMatrixView();
}

function updateStats() {
    var div = document.getElementById('attStats'); if (!div) return;
    var data = currentView === 'daily' ? attendanceData : [];
    var total = data.length || (selectedStream ? allStudentsData.filter(function(s){return s.stream===selectedStream&&s.status==='active'}).length : allStudentsData.filter(function(s){return s.status==='active'}).length);
    var present = data.filter(function(a){return a.status==='P';}).length;
    var absent = data.filter(function(a){return a.status==='A';}).length;
    var rate = total > 0 ? Math.round((present/total)*100) : 0;
    div.innerHTML = '<div class="attendance-stat"><h3>'+total+'</h3><p>Students</p></div><div class="attendance-stat"><h3 style="color:#10b981">'+present+'</h3><p>Present</p></div><div class="attendance-stat"><h3 style="color:#ef4444">'+absent+'</h3><p>Absent</p></div><div class="attendance-stat"><h3 style="color:#3b82f6">'+rate+'%</h3><p>Rate</p></div>';
}

function renderDailyRegister() {
    var content = document.getElementById('attendanceContent'); if (!content) return;
    var studentsToShow = allStudentsData.filter(function(s){return s.status==='active';});
    if (selectedStream) studentsToShow = studentsToShow.filter(function(s){return s.stream===selectedStream;});
    if (studentsToShow.length === 0) { content.innerHTML = '<div class="empty-state"><p>No students</p></div>'; return; }
    var html = '<div class="table-container"><table class="attendance-table"><thead><tr><th>#</th><th>Student Name</th><th>Stream</th><th>Status</th><th>Reason</th><th>Time In</th><th>Actions</th></tr></thead><tbody>';
    for (var i = 0; i < studentsToShow.length; i++) {
        var s = studentsToShow[i]; var record = attendanceData.find(function(a){return a.student_id===s.id;});
        var status = record ? record.status : null;
        var statusHTML = status==='P' ? '<span class="badge badge-success" style="font-size:13px;padding:6px 14px"><i class="fas fa-check"></i> Present</span>' : (status==='A' ? '<span class="badge badge-danger" style="font-size:13px;padding:6px 14px"><i class="fas fa-times"></i> Absent</span>' : '<span class="badge badge-warning" style="font-size:13px;padding:6px 14px"><i class="fas fa-minus"></i> Not Marked</span>');
        html += '<tr style="' + (!status?'background:#fffbeb':'') + '"><td>'+(i+1)+'</td><td><strong>'+s.first_name+' '+s.last_name+'</strong></td><td><span class="badge badge-info">'+(s.stream||'N/A')+'</span></td><td>'+statusHTML+'</td><td>'+(record&&record.absence_reason?record.absence_reason:'-')+'</td><td>'+(record&&record.time_in?record.time_in:'-')+'</td><td style="white-space:nowrap"><button class="btn btn-sm btn-success" onclick="markAttendance('+s.id+',\'P\')" title="Present"><i class="fas fa-check"></i></button> <button class="btn btn-sm btn-danger" onclick="showAbsentModal('+s.id+')" title="Absent"><i class="fas fa-times"></i></button></td></tr>';
    }
    html += '</tbody></table></div>'; content.innerHTML = html;
}

function renderMatrixView() {
    var content = document.getElementById('attendanceContent'); if (!content) return;
    var students = {}; var dates = new Set();
    for (var i = 0; i < matrixData.length; i++) { var row = matrixData[i]; if (!students[row.id]) students[row.id] = { name: row.first_name+' '+row.last_name, stream: row.stream, attendance: {}, present: 0, total: 0 }; if (row.date) { dates.add(row.date); students[row.id].attendance[row.date] = row.status; if (row.status==='P') students[row.id].present++; students[row.id].total++; } }
    var sortedDates = Array.from(dates).sort(); var studentArray = Object.entries(students).map(function(e){return {id:e[0],data:e[1]};});
    if (studentArray.length===0) { content.innerHTML='<div class="empty-state"><p>No records</p></div>'; return; }
    var html = '<div style="overflow-x:auto"><table style="font-size:12px"><thead><tr><th style="position:sticky;left:0;background:var(--bg-secondary);min-width:180px;z-index:3">Student</th><th style="position:sticky;left:180px;background:var(--bg-secondary);z-index:3">Stream</th><th style="width:55px">Avg</th>';
    for (var d=0;d<sortedDates.length;d++) html+='<th style="width:35px;font-size:10px;text-align:center;writing-mode:vertical-lr">'+formatDateShort(sortedDates[d])+'</th>';
    html+='</tr></thead><tbody>';
    for (var j=0;j<studentArray.length;j++) { var st=studentArray[j]; var rate=st.data.total>0?Math.round((st.data.present/st.data.total)*100):0; var rateColor=rate>=90?'#10b981':rate>=75?'#3b82f6':rate>=50?'#f59e0b':'#ef4444'; html+='<tr><td style="position:sticky;left:0;background:var(--bg-secondary);z-index:2"><strong>'+st.data.name+'</strong></td><td style="position:sticky;left:180px;background:var(--bg-secondary);z-index:2"><small>'+st.data.stream+'</small></td><td style="text-align:center;font-weight:700;color:'+rateColor+'">'+rate+'%</td>'; for (var k=0;k<sortedDates.length;k++){var date=sortedDates[k];var stat=st.data.attendance[date];if(stat==='P')html+='<td style="background:#d1fae5;color:#065f46;text-align:center;font-weight:700;cursor:pointer" onclick="editAttendanceDate(\''+st.id+'\',\''+date+'\',\'P\')">P</td>';else if(stat==='A')html+='<td style="background:#fee2e2;color:#991b1b;text-align:center;font-weight:700;cursor:pointer" onclick="editAttendanceDate(\''+st.id+'\',\''+date+'\',\'A\')">A</td>';else html+='<td style="text-align:center;color:#ccc;cursor:pointer" onclick="editAttendanceDate(\''+st.id+'\',\''+date+'\',null)">-</td>';} html+='</tr>'; }
    html+='</tbody></table></div><div style="margin-top:12px;display:flex;gap:16px;font-size:12px;color:var(--text-secondary)"><span><span style="background:#d1fae5;padding:2px 8px;border-radius:4px;color:#065f46">P</span> Present</span><span><span style="background:#fee2e2;padding:2px 8px;border-radius:4px;color:#991b1b">A</span> Absent</span><span><span style="color:#ccc">-</span> Click to edit</span></div>';
    content.innerHTML=html;
}

function formatDateShort(dateStr) { if(!dateStr)return'';var d=new Date(dateStr);return d.getDate()+'/'+(d.getMonth()+1); }

function showAbsentModal(studentId) { pendingAbsentStudentId = studentId; document.getElementById('absentReason').value = 'Sick'; showModal('absentModal'); }

function confirmAbsent() { var reason = document.getElementById('absentReason').value; hideModal('absentModal'); markAttendance(pendingAbsentStudentId, 'A', reason); }

async function editAttendanceDate(studentId, date, currentStatus) { var newStatus = confirm('Change to Present?') ? 'P' : 'A'; var reason = newStatus==='A' ? (confirm('Add reason?') ? prompt('Reason:') : '') : ''; try { await API.attendance.mark({student_id:parseInt(studentId),date:date,status:newStatus,absence_reason:reason||null}); showToast('Updated','success'); await loadMatrixView(); } catch(e) { showToast('Error: '+e.message,'error'); } }

async function markAttendance(studentId, status, reason) { try { await API.attendance.mark({student_id:studentId,date:selectedDate,status:status,absence_reason:reason||null}); showToast(status==='P'?'Present':'Absent','success'); await loadAttendanceSheet(); } catch(e) { showToast('Error: '+e.message,'error'); } }

async function markAllPresentToday() { if (!confirm('Mark ALL active students PRESENT for '+selectedDate+'?')) return; try { showLoading(); var stream = selectedStream || null; await API.attendance.markBulk({date:selectedDate,stream:stream}); showToast('All marked present!','success'); await loadAttendanceSheet(); } catch(e) { hideLoading(); showToast('Error: '+e.message,'error'); } }

function exportCurrentView() { 
    if (currentView==='daily') { var csv='Date,Student,Stream,Status,Reason\n'; for(var i=0;i<attendanceData.length;i++){var a=attendanceData[i];csv+=selectedDate+',"'+a.first_name+' '+a.last_name+'",'+a.stream+','+(a.status==='P'?'Present':'Absent')+','+(a.absence_reason||'')+'\n';} downloadFile(csv,'attendance_'+selectedDate+'.csv','text/csv'); }
    else { var csv2='Student,Stream,Rate\n'; var students={}; for(var j=0;j<matrixData.length;j++){var r=matrixData[j];if(!students[r.id])students[r.id]={name:r.first_name+' '+r.last_name,stream:r.stream,present:0,total:0};if(r.status==='P')students[r.id].present++;students[r.id].total++;} for(var key in students){var st=students[key];csv2+='"'+st.name+'",'+st.stream+','+(st.total>0?Math.round((st.present/st.total)*100):0)+'%\n';} downloadFile(csv2,'attendance_matrix.csv','text/csv'); }
    showToast('Exported','success');
}
