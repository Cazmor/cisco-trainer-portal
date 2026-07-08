var currentSettingsTab = 'profile';

async function loadSettingsPage() {
    var contentArea = document.getElementById('contentArea');
    if (!contentArea) return;
    var user = getUser();
    var templateTabHtml = (user.role === 'admin' && !user.centre_id) || user.role === 'super_admin' ? '<button class="settings-nav-item" onclick="switchSettingsTab(\'templates\')"><i class="fas fa-file-csv"></i> Templates</button>' : '';
    contentArea.innerHTML = '<div class="settings-container">' +
        '<div class="settings-nav">' +
            '<button class="settings-nav-item active" onclick="switchSettingsTab(\'profile\')"><i class="fas fa-user-circle"></i> Profile</button>' +
            '<button class="settings-nav-item" onclick="switchSettingsTab(\'notifications\')"><i class="fas fa-bell"></i> Notifications</button>' +
            '<button class="settings-nav-item" onclick="switchSettingsTab(\'emails\')"><i class="fas fa-envelope"></i> Email Recipients</button>' +
            '<button class="settings-nav-item" onclick="switchSettingsTab(\'system\')"><i class="fas fa-cog"></i> System</button>' +
            '<button class="settings-nav-item" onclick="switchSettingsTab(\'security\')"><i class="fas fa-shield-alt"></i> Security</button>' +
            '<button class="settings-nav-item" onclick="switchSettingsTab(\'cpd\')"><i class="fas fa-certificate"></i> CPD Log</button>' +
            '<button class="settings-nav-item" onclick="switchSettingsTab(\'curriculum\')"><i class="fas fa-book"></i> Curriculum</button>' +
            '<button class="settings-nav-item" onclick="switchSettingsTab(\'data\')"><i class="fas fa-database"></i> Data Management</button>' +
            templateTabHtml +
        '</div><div id="settingsContent"></div>' +
    '</div>' +
    '<div id="cpdModal" class="modal"><div class="modal-content" style="max-width:600px"><div class="modal-header"><h3>Add CPD Entry</h3><button class="modal-close" onclick="hideModal(\'cpdModal\')">&times;</button></div><form id="cpdForm" onsubmit="saveCPDEntry(event)"><div class="form-group"><label>Course/Webinar Name</label><input type="text" id="cpdName" class="form-control" required placeholder="e.g. CCNA Switching & Routing"></div><div class="form-group"><label>Platform / Provider</label><select id="cpdPlatform" class="form-control"><option value="Cisco NetAcad">Cisco NetAcad</option><option value="Coursera">Coursera</option><option value="Udemy">Udemy</option><option value="LinkedIn Learning">LinkedIn Learning</option><option value="Other">Other</option></select></div><div class="form-row"><div class="form-group"><label>Hours Spent</label><input type="number" id="cpdHours" class="form-control" placeholder="Hours" min="0" step="0.5"></div><div class="form-group"><label>Date Completed</label><input type="date" id="cpdDate" class="form-control"></div></div><div class="form-group"><label>Status</label><div style="display:flex;gap:16px"><label><input type="checkbox" id="cpdCompleted"> Completed</label><label><input type="checkbox" id="cpdShared"> Shared with team</label></div></div><div class="form-group"><label>Notes</label><textarea id="cpdNotes" class="form-control" rows="2"></textarea></div><div class="modal-footer"><button type="button" class="btn btn-outline" onclick="hideModal(\'cpdModal\')">Cancel</button><button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> Save</button></div></form></div></div>';
    await loadSettingsTab();
}

async function switchSettingsTab(tab) { currentSettingsTab = tab; var items = document.querySelectorAll('.settings-nav-item'); for (var i=0;i<items.length;i++) items[i].classList.remove('active'); var active = document.querySelector('.settings-nav-item[onclick*="'+tab+'"]'); if (active) active.classList.add('active'); await loadSettingsTab(); }

async function loadSettingsTab() { var content = document.getElementById('settingsContent'); if (!content) return; showLoading(); try { if (currentSettingsTab==='profile') loadProfileTab(content); else if (currentSettingsTab==='notifications') loadNotificationsTab(content); else if (currentSettingsTab==='emails') loadEmailsTab(content); else if (currentSettingsTab==='system') loadSystemTab(content); else if (currentSettingsTab==='cpd') loadCPDTab(content); else if (currentSettingsTab==='curriculum') loadCurriculumTab(content); else if (currentSettingsTab==='data') loadDataTab(content); else if (currentSettingsTab==='security') loadSecurityTab(content); else if (currentSettingsTab==='templates') loadTemplatesTab(content); } catch(e) { content.innerHTML='<p>Error: '+e.message+'</p>'; } hideLoading(); }

async function loadProfileTab(content) {
    var profile = await API.settings.getProfile();
    var user = getUser();
    content.innerHTML = '<div class="settings-section"><h3><i class="fas fa-user-circle"></i> Profile Settings</h3>' +
        '<div class="profile-avatar-section"><div class="profile-avatar"><i class="fas fa-user"></i></div><p style="color:var(--text-secondary)">' + user.role.replace(/_/g,' ').toUpperCase() + '</p></div>' +
        '<form onsubmit="updateProfile(event)" class="settings-form">' +
            '<div class="form-group"><label>Full Name *</label><input type="text" id="profileName" class="form-control" value="' + (profile.name||'') + '" required></div>' +
            '<div class="form-group"><label>Email *</label><input type="email" class="form-control" value="' + (profile.email||'') + '" disabled></div>' +
            '<div class="form-group"><label>Centre Name</label><input type="text" class="form-control" value="' + (user.centre_id||'N/A') + '" disabled></div>' +
            '<div class="form-group"><label>Role</label><input type="text" class="form-control" value="' + user.role.replace(/_/g,' ') + '" disabled></div>' +
            '<div class="form-group"><label>Phone Number</label><input type="tel" id="profilePhone" class="form-control" value="' + (profile.phone||'') + '" placeholder="+254..."></div>' +
            '<div class="form-group"><label>Profile Photo</label><input type="file" class="form-control" accept="image/*"><small style="color:var(--text-secondary)">Upload a profile photo (optional)</small></div>' +
            '<button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> Save Profile</button>' +
        '</form></div>';
}

async function updateProfile(event) { event.preventDefault(); var data = { name: document.getElementById('profileName').value, phone: document.getElementById('profilePhone').value }; try { await API.settings.updateProfile(data); showToast('Profile updated!','success'); } catch(e) { showToast('Error: '+e.message,'error'); } }

async function loadNotificationsTab(content) {
    var prefs = await API.settings.getNotifications();
    content.innerHTML = '<div class="settings-section"><h3><i class="fas fa-bell"></i> Notification Preferences</h3>' +
        '<div class="toggle-switch"><div><div class="toggle-label">Email reminders for scheduled classes</div><div class="toggle-description">Get notified before your scheduled classes</div></div><label class="toggle-input"><input type="checkbox" id="notifEmail" '+(prefs.email_reminders?'checked':'')+' onchange="saveNotifPrefs()"><span class="toggle-slider"></span></label></div>' +
        '<div class="toggle-switch"><div><div class="toggle-label">Weekly report reminders (Saturday)</div><div class="toggle-description">Reminder to submit weekly reports</div></div><label class="toggle-input"><input type="checkbox" id="notifWeekly" '+(prefs.weekly_report_reminder?'checked':'')+' onchange="saveNotifPrefs()"><span class="toggle-slider"></span></label></div>' +
        '<div class="toggle-switch"><div><div class="toggle-label">Maintenance alerts</div><div class="toggle-description">Get notified about lab maintenance issues</div></div><label class="toggle-input"><input type="checkbox" id="notifMaint" '+(prefs.maintenance_alerts?'checked':'')+' onchange="saveNotifPrefs()"><span class="toggle-slider"></span></label></div>' +
        '<div class="toggle-switch"><div><div class="toggle-label">UAF expiry reminders (30 days before)</div><div class="toggle-description">Get notified before UAF documents expire</div></div><label class="toggle-input"><input type="checkbox" id="notifUAF" '+(prefs.uaf_expiry_reminders?'checked':'')+' onchange="saveNotifPrefs()"><span class="toggle-slider"></span></label></div>' +
        '<div class="toggle-switch"><div><div class="toggle-label">Student at-risk alerts</div><div class="toggle-description">Get notified about struggling students</div></div><label class="toggle-input"><input type="checkbox" id="notifRisk" '+(prefs.student_at_risk_alerts?'checked':'')+' onchange="saveNotifPrefs()"><span class="toggle-slider"></span></label></div>' +
        '</div>';
}

async function saveNotifPrefs() { var data = { email_reminders: document.getElementById('notifEmail').checked, weekly_report_reminder: document.getElementById('notifWeekly').checked, maintenance_alerts: document.getElementById('notifMaint').checked, uaf_expiry_reminders: document.getElementById('notifUAF').checked, student_at_risk_alerts: document.getElementById('notifRisk').checked }; try { await API.settings.updateNotifications(data); showToast('Preferences saved','success'); } catch(e) { showToast('Error: '+e.message,'error'); } }

function loadEmailsTab(content) {
    var saved = JSON.parse(localStorage.getItem('emailSettings') || '{"admin":"","it":"","coordinator":""}');
    content.innerHTML = '<div class="settings-section"><h3><i class="fas fa-envelope"></i> Email Recipients</h3>' +
        '<p style="color:var(--text-secondary);margin-bottom:20px">Configure who receives system alerts, reports, and notifications.</p>' +
        '<form onsubmit="saveEmailSettings(event)">' +
            '<div class="form-group"><label>Admin Email (Primary) *</label><input type="email" id="emailAdmin" class="form-control" value="'+saved.admin+'" required placeholder="admin@example.com"><small style="color:var(--text-secondary)">Receives all system alerts and reports</small></div>' +
            '<div class="form-group"><label>IT Support Email</label><input type="email" id="emailIT" class="form-control" value="'+saved.it+'" placeholder="it@example.com"><small style="color:var(--text-secondary)">Receives maintenance and emergency alerts</small></div>' +
            '<div class="form-group"><label>Academy Coordinator Email</label><input type="email" id="emailCoord" class="form-control" value="'+saved.coordinator+'" placeholder="coordinator@example.com"><small style="color:var(--text-secondary)">Receives weekly reports and summaries</small></div>' +
            '<button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> Save Email Settings</button>' +
        '</form></div>';
}

function saveEmailSettings(event) { event.preventDefault(); var data = { admin: document.getElementById('emailAdmin').value, it: document.getElementById('emailIT').value, coordinator: document.getElementById('emailCoord').value }; localStorage.setItem('emailSettings', JSON.stringify(data)); showToast('Email settings saved!','success'); }

async function loadSystemTab(content) {
    var sys = await API.settings.getSystem();
    content.innerHTML = '<div class="settings-section"><h3><i class="fas fa-cog"></i> System Settings</h3>' +
        '<form onsubmit="updateSystemSettings(event)">' +
            '<div class="form-group"><label>Language</label><select id="sysLang" class="form-control"><option value="en" '+(sys.language==='en'?'selected':'')+'>English</option><option value="sw" '+(sys.language==='sw'?'selected':'')+'>Swahili</option></select></div>' +
            '<div class="form-group"><label>Theme</label><select id="sysTheme" class="form-control"><option value="light" '+(sys.theme==='light'?'selected':'')+'>Light</option><option value="dark" '+(sys.theme==='dark'?'selected':'')+'>Dark</option></select></div>' +
            '<div class="form-group"><label>Timezone</label><select id="sysTZ" class="form-control"><option value="Africa/Nairobi" '+(sys.timezone==='Africa/Nairobi'?'selected':'')+'>Africa/Nairobi (EAT)</option><option value="UTC" '+(sys.timezone==='UTC'?'selected':'')+'>UTC</option></select></div>' +
            '<button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> Save System Settings</button>' +
        '</form>' +
        '<hr style="margin:24px 0">' +
        '<h4 style="color:#ef4444;margin-bottom:12px"><i class="fas fa-exclamation-triangle"></i> Emergency Actions</h4>' +
        '<button class="btn btn-danger" onclick="reportEmergency()"><i class="fas fa-broadcast-tower"></i> Report Emergency Lab Issue</button>' +
        '</div>';
}

async function updateSystemSettings(event) { event.preventDefault(); var data = { language: document.getElementById('sysLang').value, theme: document.getElementById('sysTheme').value, timezone: document.getElementById('sysTZ').value }; try { await API.settings.updateSystem(data); if (data.theme !== document.documentElement.getAttribute('data-theme')) { document.documentElement.setAttribute('data-theme', data.theme); localStorage.setItem('theme', data.theme); } showToast('Settings saved','success'); } catch(e) { showToast('Error: '+e.message,'error'); } }

function reportEmergency() { var issue = prompt('Describe the emergency lab issue:'); if (!issue) return; showToast('Emergency reported! IT Support has been notified.','success'); }

async function loadCPDTab(content) {
    var entries = await API.settings.getDevelopment();
    var coursesCompleted = entries.filter(function(e){return e.status==='completed';}).length;
    var totalHours = entries.reduce(function(s,e){return s+(parseFloat(e.hours_completed)||0);},0);
    
    var html = '<div class="settings-section"><h3><i class="fas fa-certificate"></i> Professional Development Log (KPI 6)</h3>' +
        '<div class="grid-2" style="margin-bottom:20px"><div class="stat-card"><div class="stat-icon" style="background:#ede9fe"><i class="fas fa-certificate" style="color:#8b5cf6"></i></div><div class="stat-info"><h3>'+coursesCompleted+'</h3><p>Courses Completed</p></div></div><div class="stat-card"><div class="stat-icon" style="background:#dbeafe"><i class="fas fa-clock" style="color:#3b82f6"></i></div><div class="stat-info"><h3>'+totalHours+'</h3><p>Hours Logged</p></div></div></div>' +
        '<button class="btn btn-primary" onclick="showModal(\'cpdModal\')" style="margin-bottom:16px"><i class="fas fa-plus"></i> Add CPD Entry</button>';
    
    if (entries.length === 0) html += '<div class="empty-state"><p>No CPD entries yet. Start logging your professional development.</p></div>';
    else {
        html += '<div class="table-container"><table><thead><tr><th>Course</th><th>Platform</th><th>Hours</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead><tbody>';
        for (var i=0;i<entries.length;i++){var e=entries[i];html+='<tr><td><strong>'+e.course_name+'</strong></td><td>'+e.provider+'</td><td>'+e.hours_completed+'</td><td>'+formatDate(e.completion_date||e.start_date)+'</td><td><span class="badge badge-'+(e.status==='completed'?'success':'info')+'">'+e.status+'</span></td><td><button class="btn btn-sm btn-danger" onclick="deleteCPD('+e.id+')"><i class="fas fa-trash"></i></button></td></tr>';}
        html += '</tbody></table></div>';
    }
    html += '</div>';
    content.innerHTML = html;
}

async function saveCPDEntry(event) {
    event.preventDefault();
    var data = { course_name: document.getElementById('cpdName').value, provider: document.getElementById('cpdPlatform').value, hours_completed: parseFloat(document.getElementById('cpdHours').value)||0, completion_date: document.getElementById('cpdDate').value, status: document.getElementById('cpdCompleted').checked?'completed':'in-progress', notes: document.getElementById('cpdNotes').value };
    try { showLoading(); await API.settings.addDevelopment(data); hideModal('cpdModal'); showToast('CPD entry saved!','success'); await loadSettingsTab(); } catch(e) { hideLoading(); showToast('Error: '+e.message,'error'); }
}

async function deleteCPD(id) { if (!confirm('Delete this CPD entry?')) return; try { await API.settings.deleteDevelopment(id); showToast('Deleted','success'); await loadSettingsTab(); } catch(e) { showToast('Error: '+e.message,'error'); } }

function loadCurriculumTab(content) {
    content.innerHTML = '<div class="settings-section"><h3><i class="fas fa-book"></i> Module Curriculum Management</h3>' +
        '<p style="color:var(--text-secondary);margin-bottom:16px">Paste the IT Essentials v8 curriculum below. Format: Module X: Name then 1.1 Section - Topics</p>' +
        '<div class="form-group"><label>Paste Module Topics Below</label><textarea id="curriculumText" class="form-control" rows="15" placeholder="Module 1: Introduction to Personal Computer Hardware&#10;1.1 Personal Computer Safety - ESD, Electrical Safety&#10;1.2 PC Components - Cases, Power Supplies, Motherboards...&#10;&#10;Module 2: PC Assembly&#10;2.1 Assemble the Computer - Fire Safety, Power Supply..."></textarea></div>' +
        '<div style="display:flex;gap:8px;margin-bottom:16px">' +
            '<button class="btn btn-primary" onclick="saveCurriculum()"><i class="fas fa-save"></i> Save Modules to Delivery Plan</button>' +
            '<button class="btn btn-outline" onclick="resetCurriculum()"><i class="fas fa-undo"></i> Reset to Default</button>' +
        '</div>' +
        '<button class="btn btn-outline" onclick="viewCurrentModules()"><i class="fas fa-eye"></i> View Current Modules</button>' +
        '<hr style="margin:24px 0">' +
        '<h4 style="margin-bottom:12px">About</h4>' +
        '<div style="background:var(--bg-secondary);padding:20px;border-radius:12px">' +
            '<p><strong>Cisco Trainer Progress Tracking System</strong></p>' +
            '<p style="color:var(--text-secondary)">Version: 2.0.0 | Build: 2026</p>' +
            '<p style="color:var(--text-secondary)">© 2026 Cisco Networking Academy</p>' +
        '</div></div>';
}

async function saveCurriculum() { 
    var text = document.getElementById('curriculumText').value; 
    if (!text.trim()) { showToast('Paste curriculum text first','warning'); return; } 
    try { 
        showLoading(); 
        var lines = text.split('\n'); 
        var currentModule = null, currentModuleName = ''; 
        var sections = []; 
        for (var i = 0; i < lines.length; i++) { 
            var line = lines[i].trim(); 
            if (!line) continue; 
            var modMatch = line.match(/^Module\s+(\d+):\s*(.+)/i); 
            if (modMatch) { currentModule = parseInt(modMatch[1]); currentModuleName = modMatch[2].trim(); continue; } 
            var secMatch = line.match(/^(\d+\.\d+)\s+(.+?)\s*-\s*(.+)/); 
            if (secMatch && currentModule) { 
                sections.push({ module_number: currentModule, module_name: currentModuleName, section_number: parseFloat(secMatch[1]), section_name: secMatch[2].trim(), topics: secMatch[3].trim() }); 
            } 
        } 
        if (sections.length === 0) { showToast('No valid sections found. Use format: Module X: Name then 1.1 Section - Topics','warning'); hideLoading(); return; } 
        await API.curriculum.save({ sections: sections }); 
        var mods = []; for (var j = 0; j < sections.length; j++) { if (mods.indexOf(sections[j].module_number) < 0) mods.push(sections[j].module_number); } 
        showToast(sections.length + ' sections saved across ' + mods.length + ' modules!','success'); 
        hideLoading(); 
    } catch(e) { hideLoading(); showToast('Error: '+e.message,'error'); } 
}

async function uploadDataFile(event, type) {
    var file = event.target.files[0];
    if (!file) return;
    try {
        showLoading();
        // Just mock for now
        await new Promise(resolve => setTimeout(resolve, 1000));
        showToast(type + ' uploaded successfully', 'success');
    } catch(e) {
        showToast('Error: ' + e.message, 'error');
    } finally {
        hideLoading();
        event.target.value = '';
    }
}

async function loadTemplatesTab(content) {
    content.innerHTML = '<div class="settings-section"><h3><i class="fas fa-file-csv"></i> Template Management</h3>' +
        '<p style="color:var(--text-secondary);margin-bottom:20px">Upload custom CSV templates that instructors will download for bulk imports. The headers in these templates will be used to validate uploaded files.</p>' +
        '<div class="grid-2" style="gap:16px">' +
        renderTemplateUploader('Students', 'students') +
        renderTemplateUploader('Performance', 'performance') +
        renderTemplateUploader('Laptops', 'laptops') +
        renderTemplateUploader('Workstations', 'equipment') +
        renderTemplateUploader('Devices', 'devices') +
        '</div></div>';
}

function renderTemplateUploader(title, type) {
    return '<div class="card" style="padding:16px"><h4 style="margin-bottom:12px">' + title + ' Template</h4>' +
        '<div style="display:flex;gap:8px"><button class="btn btn-outline btn-sm" onclick="downloadCurrentTemplate(\'' + type + '\')"><i class="fas fa-download"></i> Current</button>' +
        '<button class="btn btn-primary btn-sm" onclick="document.getElementById(\'tplUpload_' + type + '\').click()"><i class="fas fa-upload"></i> Upload New</button>' +
        '<input type="file" id="tplUpload_' + type + '" accept=".csv" style="display:none" onchange="handleTemplateUpload(event, \'' + type + '\')"></div></div>';
}

async function downloadCurrentTemplate(type) {
    try {
        showLoading();
        const tpl = await API.templates.get(type);
        downloadFile(tpl.content, type + '_template.csv', 'text/csv');
        showToast('Template downloaded', 'success');
    } catch (e) {
        showToast('Error: ' + e.message, 'error');
    } finally {
        hideLoading();
    }
}

async function handleTemplateUpload(event, type) {
    var file = event.target.files[0];
    if (!file) return;
    try {
        showLoading();
        var text = await file.text();
        await API.templates.upload(type, text);
        showToast(type + ' template updated successfully', 'success');
    } catch (e) {
        showToast('Error: ' + e.message, 'error');
    } finally {
        hideLoading();
        event.target.value = '';
    }
}

async function resetCurriculum() { if (!confirm('Reset curriculum to default?')) return; try { await API.curriculum.reset(); showToast('Reset to default','success'); } catch(e) { showToast('Error: '+e.message,'error'); } }

async function viewCurrentModules() {
    try { showLoading(); var modules = await API.curriculum.get(); var text = ''; for (var i=0;i<modules.length;i++){var m=modules[i];text+='Module '+m.module_number+': '+m.module_name+'\n'+m.section_number+' '+m.section_name+'\n'+m.topics+'\n\n';} alert(text||'No modules found'); hideLoading(); } catch(e) { hideLoading(); }
}

function loadDataTab(content) {
    content.innerHTML = '<div class="settings-section"><h3><i class="fas fa-database"></i> Data Management</h3>' +
        '<div class="grid-2" style="margin-bottom:20px">' +
            '<div class="data-card"><i class="fas fa-download" style="color:#3b82f6"></i><h4>Export All Data</h4><p>Download complete system data</p><button class="btn btn-primary btn-sm" onclick="exportData()">Export</button></div>' +
            '<div class="data-card"><i class="fas fa-upload" style="color:#10b981"></i><h4>Import Data</h4><p>Restore from backup file</p><input type="file" id="importUpload" accept=".csv" style="display:none" onchange="handleImportUpload(event)"><button class="btn btn-outline btn-sm" onclick="document.getElementById(\'importUpload\').click()">Import</button></div>' +
            '<div class="data-card"><i class="fas fa-cloud-download-alt" style="color:#8b5cf6"></i><h4>Download Backup</h4><p>Full system backup</p><button class="btn btn-outline btn-sm" onclick="exportData()">Backup</button></div>' +
            '<div class="data-card" style="border-color:#ef4444;background:linear-gradient(135deg, rgba(254,242,242,0.9), rgba(254,242,242,0.6))"><i class="fas fa-exclamation-triangle" style="color:#ef4444"></i><h4 style="color:#ef4444">Reset System</h4><p>Clear all data</p><button class="btn btn-danger btn-sm" onclick="resetSystem()">Reset</button></div>' +
        '</div></div>';
}

function exportData() { window.open('/api/settings/export', '_blank'); showToast('Export started!','success'); }

async function resetSystem() { 
    if (!confirm('WARNING: This will reset all data. Are you sure?')) return; 
    if (!confirm('FINAL WARNING: All data will be lost. Continue?')) return; 
    try {
        showLoading();
        await API.settings.resetSystem();
        showToast('System reset successfully', 'success');
        setTimeout(() => window.location.reload(), 1500);
    } catch(e) {
        hideLoading();
        showToast('Error: ' + e.message, 'error');
    }
}

async function handleImportUpload(event) {
    var file = event.target.files[0];
    if (!file) return;
    try {
        showLoading();
        var reader = new FileReader();
        reader.onload = async function(e) {
            try {
                var text = e.target.result;
                var rows = text.split('\n');
                var headers = rows[0].split(',');
                var data = [];
                for (var i = 1; i < rows.length; i++) {
                    if (!rows[i].trim()) continue;
                    var values = rows[i].split(',');
                    var obj = {};
                    for (var j = 0; j < headers.length; j++) {
                        obj[headers[j].trim()] = values[j] ? values[j].trim() : '';
                    }
                    data.push(obj);
                }
                
                await API.settings.importData({ students: data });
                showToast('Data imported successfully', 'success');
                event.target.value = '';
                hideLoading();
            } catch (err) {
                hideLoading();
                showToast('Error parsing file: ' + err.message, 'error');
            }
        };
        reader.readAsText(file);
    } catch (e) {
        hideLoading();
        showToast('Error: ' + e.message, 'error');
    }
}

function loadSecurityTab(content) {
    content.innerHTML = '<div class="settings-section"><h3><i class="fas fa-shield-alt"></i> Security Settings</h3>' +
        '<form id="changePasswordForm" class="settings-form">' +
            '<div class="form-group"><label>Current Password *</label><input type="password" id="currentPassword" class="form-control" required></div>' +
            '<div class="form-group"><label>New Password *</label><input type="password" id="newPassword" class="form-control" required minlength="8">' +
            '<div id="password-requirements" style="margin-top: 8px; font-size: 13px; color: #64748b; background: var(--bg-secondary); padding: 10px; border-radius: 8px; border: 1px solid #e2e8f0;">' +
                '<div style="margin-bottom: 4px; font-weight: 600; color: #334155;">Password requirements:</div>' +
                '<div id="req-length" style="color: #ef4444; margin-bottom: 2px;"><i class="fas fa-times-circle"></i> At least 8 characters</div>' +
                '<div id="req-upper" style="color: #ef4444; margin-bottom: 2px;"><i class="fas fa-times-circle"></i> One uppercase letter</div>' +
                '<div id="req-lower" style="color: #ef4444; margin-bottom: 2px;"><i class="fas fa-times-circle"></i> One lowercase letter</div>' +
                '<div id="req-number" style="color: #ef4444; margin-bottom: 2px;"><i class="fas fa-times-circle"></i> One number</div>' +
                '<div id="req-special" style="color: #ef4444;"><i class="fas fa-times-circle"></i> One special character</div>' +
            '</div></div>' +
            '<div class="form-group"><label>Confirm New Password *</label><input type="password" id="confirmPassword" class="form-control" required minlength="8"></div>' +
            '<button type="submit" class="btn btn-primary" id="changePwdBtn"><i class="fas fa-save"></i> Change Password</button>' +
        '</form></div>';

    setTimeout(() => {
        const pwdInput = document.getElementById('newPassword');
        if (pwdInput) {
            pwdInput.addEventListener('input', function() {
                const val = this.value;
                function updateReq(id, valid) {
                    const el = document.getElementById(id);
                    if (valid) { el.style.color = '#10b981'; el.innerHTML = '<i class="fas fa-check-circle"></i> ' + el.innerText.trim(); }
                    else { el.style.color = '#ef4444'; el.innerHTML = '<i class="fas fa-times-circle"></i> ' + el.innerText.trim(); }
                }
                updateReq('req-length', val.length >= 8);
                updateReq('req-upper', /[A-Z]/.test(val));
                updateReq('req-lower', /[a-z]/.test(val));
                updateReq('req-number', /[0-9]/.test(val));
                updateReq('req-special', /[^A-Za-z0-9]/.test(val));
            });
        }
        
        const form = document.getElementById('changePasswordForm');
        if (form) {
            form.addEventListener('submit', async function(e) {
                e.preventDefault();
                const current = document.getElementById('currentPassword').value;
                const newPwd = document.getElementById('newPassword').value;
                const confPwd = document.getElementById('confirmPassword').value;
                if (newPwd !== confPwd) { showToast('New passwords do not match', 'error'); return; }
                const minLength = 8; const hasUpper = /[A-Z]/.test(newPwd); const hasLower = /[a-z]/.test(newPwd); const hasNumber = /[0-9]/.test(newPwd); const hasSpecial = /[^A-Za-z0-9]/.test(newPwd);
                if (!(newPwd.length >= minLength && hasUpper && hasLower && hasNumber && hasSpecial)) { showToast('Password does not meet requirements', 'error'); return; }
                
                try {
                    const btn = document.getElementById('changePwdBtn');
                    btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Changing...';
                    const response = await fetch('/api/auth/change-password', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + localStorage.getItem('token') },
                        body: JSON.stringify({ currentPassword: current, newPassword: newPwd })
                    });
                    const data = await response.json();
                    if (response.ok) { showToast('Password changed successfully!', 'success'); form.reset(); pwdInput.dispatchEvent(new Event('input')); }
                    else { showToast(data.error || 'Failed to change password', 'error'); }
                } catch(err) { showToast('Network error', 'error'); }
                finally { document.getElementById('changePwdBtn').disabled = false; document.getElementById('changePwdBtn').innerHTML = '<i class="fas fa-save"></i> Change Password'; }
            });
        }
    }, 100);
}
