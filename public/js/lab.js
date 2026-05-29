var currentLabTab = 'status';
var currentInventoryTab = 'laptops';
var allWorkstations = [];
var allLaptops = [];
var allEquipment = [];
var allDevices = [];
var maintenanceLogs = [];
var preventiveTasks = [];
var currentStation = '1';
var selectedLaptops = [];
var selectedEquip = [];
var selectedDevices = [];

async function loadLabPage() {
    var c = document.getElementById('contentArea');
    if (!c) return;
    c.innerHTML = '<div class="lab-container"><div class="performance-tabs"><button class="performance-tab active" onclick="switchLabTab(\'status\')"><i class="fas fa-desktop"></i> Lab Status</button><button class="performance-tab" onclick="switchLabTab(\'inventory\')"><i class="fas fa-boxes"></i> Inventory</button><button class="performance-tab" onclick="switchLabTab(\'maintenance\')"><i class="fas fa-tools"></i> Maintenance</button></div><div id="labContent"></div></div><div id="wsModal" class="modal"><div class="modal-content"><div class="modal-header"><h3 id="wsTitle">Workstation</h3><button class="modal-close" onclick="hideModal(\'wsModal\')">&times;</button></div><div id="wsBody"></div></div></div><div id="maintModal" class="modal"><div class="modal-content"><div class="modal-header"><h3>Report Issue</h3><button class="modal-close" onclick="hideModal(\'maintModal\')">&times;</button></div><form onsubmit="saveMaint(event)"><div class="form-group"><label>Device Type</label><select id="mtType" class="form-control" required><option value="">Select</option><option value="workstation">Workstation</option><option value="laptop">Laptop</option><option value="equipment">Equipment</option><option value="other">Other</option></select></div><div class="form-group"><label>Device ID</label><input type="number" id="mtId" class="form-control" required></div><div class="form-group"><label>Issue</label><textarea id="mtIssue" class="form-control" rows="3" required></textarea></div><div class="form-group"><label>Priority</label><select id="mtPriority" class="form-control"><option value="medium">Medium</option><option value="low">Low</option><option value="high">High</option><option value="critical">Critical</option></select></div><div class="modal-footer"><button type="button" class="btn btn-outline" onclick="hideModal(\'maintModal\')">Cancel</button><button type="submit" class="btn btn-primary">Save</button></div></form></div></div><div id="prevModal" class="modal"><div class="modal-content"><div class="modal-header"><h3>Schedule Preventive</h3><button class="modal-close" onclick="hideModal(\'prevModal\')">&times;</button></div><form onsubmit="savePrev(event)"><div class="form-group"><label>Device Type</label><select id="pvType" class="form-control" required><option value="">Select</option><option value="workstation">Workstation</option><option value="laptop">Laptop</option><option value="equipment">Equipment</option><option value="all">All</option></select></div><div class="form-group"><label>Task</label><textarea id="pvTask" class="form-control" rows="2" required></textarea></div><div class="form-group"><label>Frequency</label><select id="pvFreq" class="form-control" required><option value="">Select</option><option value="daily">Daily</option><option value="weekly">Weekly</option><option value="monthly">Monthly</option><option value="quarterly">Quarterly</option></select></div><div class="form-group"><label>Next Due</label><input type="date" id="pvDue" class="form-control" required></div><div class="modal-footer"><button type="button" class="btn btn-outline" onclick="hideModal(\'prevModal\')">Cancel</button><button type="submit" class="btn btn-primary">Save</button></div></form></div></div>';
    await loadLabData();
}

async function loadLabData() {
    try { showLoading(); var s = await API.lab.getStatus(); allWorkstations = s.workstations || []; allLaptops = await API.lab.getLaptops(); allEquipment = await API.lab.getEquipment(); allDevices = await API.lab.getOtherDevices(); maintenanceLogs = await API.lab.getMaintenance(); preventiveTasks = await API.lab.getPreventive(); hideLoading(); await loadLabTab(); } catch (e) { hideLoading(); }
}

async function switchLabTab(tab) { currentLabTab = tab; var tabs = document.querySelectorAll('.performance-tab'); for (var i=0;i<tabs.length;i++) tabs[i].classList.remove('active'); event.target.classList.add('active'); await loadLabTab(); }

async function loadLabTab() { var c = document.getElementById('labContent'); if (!c) return; showLoading(); try { if (currentLabTab==='status') loadStatus(c); else if (currentLabTab==='inventory') loadInventory(c); else loadMaintenance(c); } catch(e) { c.innerHTML='<p>Error: '+e.message+'</p>'; } hideLoading(); }

function loadStatus(c) {
    var stations = {};
    for (var j=0;j<allEquipment.length;j++) {
        var e = allEquipment[j];
        var loc = e.location || '';
        var stMatch = loc.match(/Station (\d+)/);
        var stNum = stMatch ? stMatch[1] : String(j+1);
        if (!stations[stNum]) stations[stNum] = { items: [], working: 0, total: 0 };
        stations[stNum].items.push(e);
        stations[stNum].total++;
        if (e.status === 'available' || e.status === 'in-use') stations[stNum].working++;
    }
    var stKeys = Object.keys(stations).sort(function(a,b){return parseInt(a)-parseInt(b);});
    var totalSt = stKeys.length;
    var funcSt = 0, partSt = 0, downSt = 0;
    for (var s=0;s<stKeys.length;s++) { var st=stations[stKeys[s]]; var hh=st.total>0?Math.round((st.working/st.total)*100):0; if(hh>=100)funcSt++; else if(hh>=60)partSt++; else downSt++; }
    var overallH = totalSt>0?Math.round((funcSt/totalSt)*100):0;
    
    var html = '<div class="lab-health-overview"><div class="health-card health-functional"><i class="fas fa-check-circle"></i><h3>'+funcSt+'</h3><p>Fully Working</p></div><div class="health-card health-partial"><i class="fas fa-exclamation-circle"></i><h3>'+partSt+'</h3><p>Partial Issues</p></div><div class="health-card health-down"><i class="fas fa-times-circle"></i><h3>'+downSt+'</h3><p>Needs Attention</p></div><div class="health-card"><i class="fas fa-heartbeat"></i><h3>'+overallH+'%</h3><p>Lab Health</p></div></div><div class="card"><div class="card-header"><h3>Workstations ('+totalSt+' total)</h3></div><div class="workstations-grid">';
    
    for (var s2=0;s2<stKeys.length;s2++) {
        var st2 = stations[stKeys[s2]];
        var health = st2.total>0?Math.round((st2.working/st2.total)*100):0;
        var wsStatus = health>=100?'functional':health>=60?'partial':'down';
        html += '<div class="workstation-card '+wsStatus+'" onclick="showWS(\''+stKeys[s2]+'\')"><div class="workstation-number">WS-'+stKeys[s2]+'</div><div style="font-size:12px;margin-bottom:8px"><span class="badge badge-'+(wsStatus==='functional'?'success':wsStatus==='partial'?'warning':'danger')+'">'+wsStatus+' ('+st2.working+'/'+st2.total+')</span></div>';
        for (var ii=0;ii<st2.items.length;ii++) {
            var e = st2.items[ii];
            var isOK = e.status==='available'||e.status==='in-use';
            var icon = e.equipment_type.toLowerCase().includes('monitor')?'tv':e.equipment_type.toLowerCase().includes('keyboard')?'keyboard':e.equipment_type.toLowerCase().includes('mouse')?'mouse':'desktop';
            html += '<div style="font-size:11px;display:flex;justify-content:space-between;padding:2px 0;cursor:pointer" onclick="event.stopPropagation();quickReport(\''+e.equipment_type+'\','+e.id+',\''+stKeys[s2]+'\')"><span><i class="fas fa-'+icon+'" style="margin-right:4px;color:'+(isOK?'#10b981':'#ef4444')+'"></i>'+e.equipment_type+'</span><span style="color:'+(isOK?'#10b981':'#ef4444')+'">'+(isOK?'OK':'Fix')+'</span></div>';
        }
        html += '</div>';
    }
    html += '</div></div>'; c.innerHTML = html;
}

function quickReport(deviceType, deviceId, stationNum) {
    document.getElementById('mtType').value = 'equipment';
    document.getElementById('mtId').value = deviceId;
    document.getElementById('mtIssue').value = deviceType + ' at Station '+stationNum+' - ';
    showModal('maintModal');
}

function showWS(stNum) {
    var items = allEquipment.filter(function(e){return (e.location||'').indexOf('Station '+stNum) >= 0;});
    if (items.length===0) { showToast('No equipment found','warning'); return; }
    var working = items.filter(function(e){return e.status==='available'||e.status==='in-use';}).length;
    document.getElementById('wsTitle').textContent = 'Workstation '+stNum+' ('+working+'/'+items.length+' working)';
    var body = '<div class="grid-2" style="gap:12px">';
    for (var i=0;i<items.length;i++) {
        var e = items[i]; var isOK = e.status==='available'||e.status==='in-use';
        var icon = e.equipment_type.toLowerCase().includes('monitor')?'tv':e.equipment_type.toLowerCase().includes('keyboard')?'keyboard':e.equipment_type.toLowerCase().includes('mouse')?'mouse':'desktop';
        body += '<div style="padding:16px;background:#f8fafc;border-radius:12px;text-align:center;cursor:pointer" onclick="quickReport(\''+e.equipment_type+'\','+e.id+',\''+stNum+'\')"><i class="fas fa-'+icon+'" style="font-size:28px;color:'+(isOK?'#10b981':'#ef4444')+'"></i><h4 style="margin-top:8px">'+e.equipment_type+'</h4><p style="font-size:11px">'+e.model+'</p><p style="font-size:10px"><code>'+e.serial_number+'</code></p><span class="badge badge-'+(isOK?'success':'danger')+'">'+(isOK?'Working':'Needs Repair')+'</span></div>';
    }
    body += '</div>'; document.getElementById('wsBody').innerHTML = body; showModal('wsModal');
}

function loadInventory(c) {
    c.innerHTML = '<div class="card"><div class="card-header"><h3>Inventory</h3></div><div class="performance-tabs" style="margin-bottom:20px"><button class="performance-tab active" onclick="switchInv(\'laptops\')"><i class="fas fa-laptop"></i> Laptops ('+allLaptops.length+')</button><button class="performance-tab" onclick="switchInv(\'equipment\')"><i class="fas fa-server"></i> Workstations ('+allEquipment.length+')</button><button class="performance-tab" onclick="switchInv(\'devices\')"><i class="fas fa-plug"></i> Devices ('+allDevices.length+')</button></div><div id="invContent"></div></div>';
    switchInv('laptops');
}

function switchInv(tab) {
    currentInventoryTab = tab;
    var c = document.getElementById('invContent'); if (!c) return;
    var html = '<div style="margin-bottom:12px;display:flex;gap:8px"><button class="btn btn-outline btn-sm" onclick="dlTpl(\''+tab+'\')"><i class="fas fa-download"></i> Template</button><button class="btn btn-outline btn-sm" onclick="document.getElementById(\'csv_'+tab+'\').click()"><i class="fas fa-upload"></i> Upload CSV</button><input type="file" id="csv_'+tab+'" accept=".csv" style="display:none" onchange="upCSV(event,\''+tab+'\')"></div>';
    if (tab==='laptops') {
        html += '<div style="overflow-x:auto"><table><thead><tr><th><input type="checkbox" id="selAllLap" onchange="toggleAllLap()"></th><th>Item</th><th>Model</th><th>Serial</th><th>Assigned</th><th>Condition</th><th>UAF</th><th>Actions</th></tr></thead><tbody>';
        for (var i=0;i<allLaptops.length;i++) { var l=allLaptops[i]; html+='<tr><td><input type="checkbox" class="lap-check" value="'+l.id+'" onchange="updateLapSel()"></td><td>'+(i+1)+'</td><td>'+l.brand+' '+l.model+'</td><td><code>'+l.serial_number+'</code></td><td>'+(l.first_name?l.first_name+' '+l.last_name:'-')+'</td><td><span class="badge badge-'+(l.status==='available'?'success':'warning')+'">'+l.status+'</span></td><td>'+(l.uaf_document_url?'Yes':'No')+'</td><td><button class="btn btn-sm btn-outline" onclick="editLaptop('+l.id+')"><i class="fas fa-edit"></i></button> <button class="btn btn-sm btn-danger" onclick="delLaptop('+l.id+')"><i class="fas fa-trash"></i></button></td></tr>'; }
        html += '</tbody></table></div><button class="btn btn-danger btn-sm" onclick="bulkDelLaptops()" id="bulkDelLapBtn" style="display:none;margin-top:8px">Delete Selected (<span id="lapSelCount">0</span>)</button>';
    } else if (tab==='equipment') {
        html += '<div style="overflow-x:auto"><table><thead><tr><th><input type="checkbox" id="selAllEq" onchange="toggleAllEq()"></th><th>Station</th><th>Item</th><th>Model</th><th>Serial</th><th>Status</th><th>Comment</th><th>Actions</th></tr></thead><tbody>';
        for (var j=0;j<allEquipment.length;j++) { var e=allEquipment[j]; var loc=e.location||''; var stMatch=loc.match(/Station (\d+)/); var stNum=stMatch?stMatch[1]:String(j+1); html+='<tr><td><input type="checkbox" class="eq-check" value="'+e.id+'" onchange="updateEqSel()"></td><td><strong>'+stNum+'</strong></td><td><strong>'+e.equipment_type+'</strong></td><td>'+(e.model||'-')+'</td><td><code>'+(e.serial_number||'-')+'</code></td><td><span class="badge badge-'+(e.status==='available'?'success':'warning')+'">'+(e.status==='available'?'Working':'Repair')+'</span></td><td>'+(e.notes||'-')+'</td><td><button class="btn btn-sm btn-outline" onclick="editEquip('+e.id+')"><i class="fas fa-edit"></i></button> <button class="btn btn-sm btn-danger" onclick="delEquip('+e.id+')"><i class="fas fa-trash"></i></button></td></tr>'; }
        html += '</tbody></table></div><button class="btn btn-danger btn-sm" onclick="bulkDelEquip()" id="bulkDelEqBtn" style="display:none;margin-top:8px">Delete Selected (<span id="eqSelCount">0</span>)</button>';
    } else {
        html += '<div style="overflow-x:auto"><table><thead><tr><th><input type="checkbox" id="selAllDev" onchange="toggleAllDev()"></th><th>Device</th><th>Model</th><th>Serial</th><th>Location</th><th>Condition</th><th>Actions</th></tr></thead><tbody>';
        for (var k=0;k<allDevices.length;k++) { var d=allDevices[k]; html+='<tr><td><input type="checkbox" class="dev-check" value="'+d.id+'" onchange="updateDevSel()"></td><td><strong>'+d.device_type+'</strong></td><td>'+(d.model||'-')+'</td><td><code>'+(d.serial_number||'-')+'</code></td><td>'+(d.location||'-')+'</td><td><span class="badge badge-info">'+d.status+'</span></td><td><button class="btn btn-sm btn-outline" onclick="editDevice('+d.id+')"><i class="fas fa-edit"></i></button> <button class="btn btn-sm btn-danger" onclick="delDevice('+d.id+')"><i class="fas fa-trash"></i></button></td></tr>'; }
        html += '</tbody></table></div><button class="btn btn-danger btn-sm" onclick="bulkDelDev()" id="bulkDelDevBtn" style="display:none;margin-top:8px">Delete Selected (<span id="devSelCount">0</span>)</button>';
    }
    c.innerHTML = html;
}

function toggleAllLap(){var cb=document.getElementById('selAllLap');var ch=document.querySelectorAll('.lap-check');for(var i=0;i<ch.length;i++)ch[i].checked=cb.checked;updateLapSel();}
function updateLapSel(){var ch=document.querySelectorAll('.lap-check:checked');selectedLaptops=[];for(var i=0;i<ch.length;i++)selectedLaptops.push(parseInt(ch[i].value));var b=document.getElementById('bulkDelLapBtn');var cnt=document.getElementById('lapSelCount');if(cnt)cnt.textContent=selectedLaptops.length;if(b)b.style.display=selectedLaptops.length>0?'inline-flex':'none';}
async function bulkDelLaptops(){if(selectedLaptops.length===0)return;if(!confirm('Delete '+selectedLaptops.length+' laptop(s)?'))return;try{showLoading();for(var i=0;i<selectedLaptops.length;i++)await API.lab.deleteLaptop(selectedLaptops[i]);showToast('Deleted','success');await loadLabData();switchInv('laptops');}catch(e){hideLoading();showToast('Error: '+e.message,'error');}}

function toggleAllEq(){var cb=document.getElementById('selAllEq');var ch=document.querySelectorAll('.eq-check');for(var i=0;i<ch.length;i++)ch[i].checked=cb.checked;updateEqSel();}
function updateEqSel(){var ch=document.querySelectorAll('.eq-check:checked');selectedEquip=[];for(var i=0;i<ch.length;i++)selectedEquip.push(parseInt(ch[i].value));var b=document.getElementById('bulkDelEqBtn');var cnt=document.getElementById('eqSelCount');if(cnt)cnt.textContent=selectedEquip.length;if(b)b.style.display=selectedEquip.length>0?'inline-flex':'none';}
async function bulkDelEquip(){if(selectedEquip.length===0)return;if(!confirm('Delete '+selectedEquip.length+' item(s)?'))return;try{showLoading();for(var i=0;i<selectedEquip.length;i++)await API.lab.deleteEquipment(selectedEquip[i]);showToast('Deleted','success');await loadLabData();switchInv('equipment');}catch(e){hideLoading();showToast('Error: '+e.message,'error');}}

function toggleAllDev(){var cb=document.getElementById('selAllDev');var ch=document.querySelectorAll('.dev-check');for(var i=0;i<ch.length;i++)ch[i].checked=cb.checked;updateDevSel();}
function updateDevSel(){var ch=document.querySelectorAll('.dev-check:checked');selectedDevices=[];for(var i=0;i<ch.length;i++)selectedDevices.push(parseInt(ch[i].value));var b=document.getElementById('bulkDelDevBtn');var cnt=document.getElementById('devSelCount');if(cnt)cnt.textContent=selectedDevices.length;if(b)b.style.display=selectedDevices.length>0?'inline-flex':'none';}
async function bulkDelDev(){if(selectedDevices.length===0)return;if(!confirm('Delete '+selectedDevices.length+' device(s)?'))return;try{showLoading();for(var i=0;i<selectedDevices.length;i++)await API.lab.deleteDevice(selectedDevices[i]);showToast('Deleted','success');await loadLabData();switchInv('devices');}catch(e){hideLoading();showToast('Error: '+e.message,'error');}}

function dlTpl(type) { var csv=''; if(type==='laptops')csv='ITEM,DEVICE MODEL,SERIALNUMBER,ASSIGNED TO,DESIGNATION,CONDITION,UAF SIGNED,UAF SIGN DATE,NOTES\n1,Dell Latitude,DL-001,John,Instructor,Good,Yes,2025-12-31,\n2,HP EliteBook,HP-001,Jane,Student,Working,Yes,2025-06-30,'; else if(type==='equipment')csv='Station,Item,Model,Serial Number,Location,Working/Not working,Comment\n1,Mercer Monitor,Mecer,VGA001,Computer Lab,Working,\n,N-computing,Mecer,L300,Computer Lab,Working,\n,Mecer Keyboard,Mecer,OMK001,Computer Lab,Working,\n,Mecer Mouse,Mecer,OMM001,Computer Lab,Working,'; else csv='DEVICE TYPE,MODEL,SERIAL NUMBER,LOCATION,CONDITION,NOTES\nProjector,Epson EB-X41,EPS-001,Lab Room A,Available,\nPrinter,HP LaserJet,HP-001,Admin Office,Available,'; downloadFile(csv, type+'_template.csv', 'text/csv'); showToast('Template downloaded','success'); }

async function upCSV(event, type) { var file=event.target.files[0];if(!file)return;try{showLoading();var text=await file.text();var lines=text.split('\n');var count=0;currentStation='1'; for(var i=1;i<lines.length;i++){var p=lines[i].split(',');if(p.length<2)continue; if(type==='laptops'){await API.lab.addLaptop({brand:'Laptop',model:(p[1]||'').trim(),serial_number:(p[2]||'SN-'+Date.now()+'-'+i).trim(),status:'available'});count++;} else if(type==='equipment'){var st=(p[0]||'').trim();if(st!==''&&!isNaN(parseInt(st)))currentStation=st;var item=(p[1]||'').trim();var model=(p[2]||'').trim();var sn=(p[3]||'').trim();if(item&&model){await API.lab.addEquipment({equipment_type:item,model:model,serial_number:(sn||'SN-'+Date.now()+'-'+i)+'-'+i,location:'Computer Lab | Station '+currentStation,status:(p[5]||p[6]||'Working').trim().toLowerCase().includes('work')?'available':'maintenance',notes:(p[6]||p[7]||'').trim()});count++;}} else{await API.lab.addDevice({device_type:(p[0]||'Device').trim(),model:(p[1]||'').trim(),serial_number:(p[2]||'DEV-'+Date.now()+'-'+i).trim(),location:(p[3]||'').trim(),status:'available'});count++;}} showToast(count+' items imported','success');await loadLabData();await loadLabTab();}catch(e){showToast('Error: '+e.message,'error');}finally{hideLoading();event.target.value='';}}

async function editLaptop(id){var l=allLaptops.find(function(x){return x.id===id;});if(!l)return;var ns=l.status==='available'?'assigned':l.status==='assigned'?'maintenance':'available';try{await API.lab.updateLaptop(id,{status:ns});showToast('Updated','success');await loadLabData();await loadLabTab();}catch(e){showToast('Error: '+e.message,'error');}}
async function delLaptop(id){if(!confirm('Delete?'))return;try{await API.lab.deleteLaptop(id);showToast('Deleted','success');await loadLabData();await loadLabTab();}catch(e){showToast('Error: '+e.message,'error');}}
async function editEquip(id){var e=allEquipment.find(function(x){return x.id===id;});if(!e)return;var ns=e.status==='available'?'maintenance':'available';try{await API.lab.updateEquipment(id,{status:ns});showToast('Updated','success');await loadLabData();switchInv('equipment');}catch(err){showToast('Error: '+err.message,'error');}}
async function delEquip(id){if(!confirm('Delete?'))return;try{await API.lab.deleteEquipment(id);showToast('Deleted','success');await loadLabData();switchInv('equipment');}catch(e){showToast('Error: '+e.message,'error');}}
function editDevice(id){showToast('Edit #'+id,'info');}
async function delDevice(id){if(!confirm('Delete?'))return;try{await API.lab.deleteDevice(id);showToast('Deleted','success');await loadLabData();switchInv('devices');}catch(e){showToast('Error: '+e.message,'error');}}

function loadMaintenance(c) {
    var o=maintenanceLogs.filter(function(l){return l.status==='open';}),ip=maintenanceLogs.filter(function(l){return l.status==='in-progress';}),r=maintenanceLogs.filter(function(l){return l.status==='resolved';});
    var html='<div class="stats-grid" style="margin-bottom:24px"><div class="stat-card"><div class="stat-icon" style="background:#fef2f2"><i class="fas fa-exclamation-circle" style="color:#ef4444"></i></div><div class="stat-info"><h3>'+o.length+'</h3><p>Open</p></div></div><div class="stat-card"><div class="stat-icon" style="background:#fffbeb"><i class="fas fa-spinner" style="color:#f59e0b"></i></div><div class="stat-info"><h3>'+ip.length+'</h3><p>In Progress</p></div></div><div class="stat-card"><div class="stat-icon" style="background:#f0fdf4"><i class="fas fa-check-circle" style="color:#10b981"></i></div><div class="stat-info"><h3>'+r.length+'</h3><p>Resolved</p></div></div></div><div class="card" style="margin-bottom:20px"><div class="card-header"><h3>Maintenance Logs</h3><button class="btn btn-primary" onclick="showModal(\'maintModal\')"><i class="fas fa-plus"></i> Add</button></div><div style="overflow-x:auto"><table><thead><tr><th>Device</th><th>Issue</th><th>Status</th><th>Priority</th><th>Reported</th><th>Action</th></tr></thead><tbody>';
    for(var i=0;i<maintenanceLogs.length;i++){var log=maintenanceLogs[i];html+='<tr><td>'+log.device_type+' #'+log.device_id+'</td><td>'+log.issue_description.substring(0,60)+'</td><td><span class="badge badge-'+(log.status==='resolved'?'success':log.status==='in-progress'?'info':'warning')+'">'+log.status+'</span></td><td><span class="maintenance-priority priority-'+log.priority+'">'+log.priority+'</span></td><td>'+formatDate(log.date_reported)+'</td><td>'+(log.status!=='resolved'?'<button class="btn btn-sm btn-success" onclick="resolveMaint('+log.id+')">Resolve</button> ':'')+'<button class="btn btn-sm btn-danger" onclick="delMaint('+log.id+')"><i class="fas fa-trash"></i></button></td></tr>';}
    html+='</tbody></table></div></div><div class="card"><div class="card-header"><h3>Preventive</h3><button class="btn btn-primary" onclick="showModal(\'prevModal\')"><i class="fas fa-plus"></i> Add</button></div><div style="overflow-x:auto"><table><thead><tr><th>Task</th><th>Device</th><th>Frequency</th><th>Next Due</th><th>Status</th></tr></thead><tbody>';
    for(var j=0;j<preventiveTasks.length;j++){var pm=preventiveTasks[j];var ov=pm.status!=='completed'&&new Date(pm.next_due)<new Date();html+='<tr><td>'+pm.task_description+'</td><td>'+pm.device_type+' #'+pm.device_id+'</td><td>'+pm.frequency+'</td><td>'+formatDate(pm.next_due)+'</td><td><span class="badge badge-'+(pm.status==='completed'?'success':ov?'danger':'warning')+'">'+(ov?'OVERDUE':pm.status)+'</span></td><td><button class="btn btn-sm btn-danger" onclick="delPrev('+pm.id+')"><i class="fas fa-trash"></i></button></td></tr>';}
    html+='</tbody></table></div></div>'; c.innerHTML = html;
}

async function saveMaint(e){e.preventDefault();var d={device_type:document.getElementById('mtType').value,device_id:parseInt(document.getElementById('mtId').value),issue_description:document.getElementById('mtIssue').value,priority:document.getElementById('mtPriority').value};try{showLoading();await API.lab.addMaintenance(d);hideModal('maintModal');showToast('Reported','success');await loadLabData();await loadLabTab();}catch(err){hideLoading();showToast('Error: '+err.message,'error');}}
async function resolveMaint(id){try{await API.lab.updateMaintenance(id,{status:'resolved'});showToast('Resolved','success');await loadLabData();await loadLabTab();}catch(e){showToast('Error: '+e.message,'error');}}
async function savePrev(e){e.preventDefault();var d={device_type:document.getElementById('pvType').value,device_id:0,task_description:document.getElementById('pvTask').value,frequency:document.getElementById('pvFreq').value,next_due:document.getElementById('pvDue').value};try{showLoading();await API.lab.addPreventive(d);hideModal('prevModal');showToast('Scheduled','success');await loadLabData();await loadLabTab();}catch(err){hideLoading();showToast('Error: '+err.message,'error');}}

async function delMaint(id) { if(!confirm('Delete this maintenance log?'))return; try{showLoading();await API.lab.deleteMaintenance(id);showToast('Deleted','success');await loadLabData();await loadLabTab();}catch(e){hideLoading();showToast('Error: '+e.message,'error');} }

async function delPrev(id) { if(!confirm('Delete this preventive task?'))return; try{showLoading();await API.lab.deletePreventive(id);showToast('Deleted','success');await loadLabData();await loadLabTab();}catch(e){hideLoading();showToast('Error: '+e.message,'error');} }
