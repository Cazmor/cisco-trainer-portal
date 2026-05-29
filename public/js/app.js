var currentPage = 'dashboard';

document.addEventListener('DOMContentLoaded', function() { init(); });

function init() {
    if (!checkAuth()) return;
    var user = getUser();
    if (!user) return;
    setupNavigation();
    setupThemeToggle();
    setupMobileMenu();
    setupLogout();
    navigateTo('dashboard');
    updateUserInfo();displayCentreInfo();
    updateDate();
}

function setupNavigation() {
    var links = document.querySelectorAll('.nav-item');
    links.forEach(function(link) {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            var page = this.getAttribute('data-page');
            if (page) navigateTo(page);
        });
    });
}

function navigateTo(page) {
    currentPage = page;
    document.querySelectorAll('.nav-item').forEach(function(item) { item.classList.remove('active'); });
    var activeLink = document.querySelector('.nav-item[data-page="' + page + '"]');
    if (activeLink) activeLink.classList.add('active');
    var titles = { dashboard: 'Dashboard', students: 'Student Management', attendance: 'Attendance', performance: 'Performance Tracking', lab: 'Lab Management', classes: 'Class Management', reports: 'Reports', 'ai-assistant': 'AI Assistant', kpi: 'KPI Scorecard', settings: 'Settings' };
    var pageTitle = document.getElementById('pageTitle');
    if (pageTitle) pageTitle.textContent = titles[page] || page;
    loadPage(page);
}

function loadPage(page) {
    showLoading();
    setTimeout(function() {
        switch(page) {
            case 'dashboard': if (typeof loadDashboard === 'function') loadDashboard(); break;
            case 'students': if (typeof loadStudentsPage === 'function') loadStudentsPage(); break;
            case 'attendance': if (typeof loadAttendancePage === 'function') loadAttendancePage(); break;
            case 'performance': if (typeof loadPerformancePage === 'function') loadPerformancePage(); break;
            case 'lab': if (typeof loadLabPage === 'function') loadLabPage(); break;
            case 'classes': if (typeof loadClassesPage === 'function') loadClassesPage(); break;
            case 'reports': if (typeof loadReportsPage === 'function') loadReportsPage(); break;
            case 'ai-assistant': if (typeof loadAIPage === 'function') loadAIPage(); break;
            case 'surveys': if (typeof loadSurveysPage === 'function') loadSurveysPage(); break;
                case 'kpi': if (typeof loadKPIPage === 'function') loadKPIPage(); break;
            case 'settings': if (typeof loadSettingsPage === 'function') loadSettingsPage(); break;
        }
        hideLoading();
    }, 200);
}

function setupThemeToggle() {
    var btn = document.getElementById('themeToggle');
    if (!btn) return;
    var theme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', theme);
    btn.addEventListener('click', function() {
        var newTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });
}

function setupMobileMenu() {
    var toggle = document.getElementById('menuToggle');
    var sidebar = document.getElementById('sidebar');
    if (toggle && sidebar) {
        toggle.addEventListener('click', function() { sidebar.classList.toggle('open'); sidebar.classList.toggle('collapsed'); });
    }
}

function toggleSidebar() {
    var sidebar = document.getElementById('sidebar');
    if (sidebar) { sidebar.classList.toggle('collapsed'); sidebar.classList.toggle('open'); }
}

function displayCentreInfo(){var user=getUser();if(!user)return;var roleBadge=document.getElementById("roleBadge");var centreName=document.getElementById("centreNameDisplay");var centreLoc=document.getElementById("centreLocationDisplay");if(!roleBadge||!centreName)return;if(user.role==="admin"){roleBadge.textContent="CENTRE ADMIN";roleBadge.style.background="rgba(124,58,237,0.2)";roleBadge.style.color="#c4b5fd";roleBadge.style.border="1px solid rgba(124,58,237,0.4)";}else if(user.role==="instructor"){roleBadge.textContent="INSTRUCTOR";roleBadge.style.background="rgba(0,180,216,0.2)";roleBadge.style.color="#67e8f9";roleBadge.style.border="1px solid rgba(0,180,216,0.4)";}if(user.centre_id){fetch("/api/admin/centres/"+user.centre_id,{headers:{"Authorization":"Bearer "+getToken()}}).then(r=>r.json()).then(c=>{if(c.name){centreName.textContent=c.name;centreLoc.textContent=c.location||"";}}).catch(()=>{});}else{centreName.textContent="Super Admin";centreLoc.textContent="All Centres";}}
function updateUserInfo() {
    var user = getUser();
    if (!user) return;
    var nameEl = document.getElementById('userName');
    var roleEl = document.getElementById('userRole');
    if (nameEl) nameEl.textContent = user.name;
    if (roleEl) roleEl.textContent = user.role;
}

function displayCentreInfo(){var user=getUser();if(!user||!user.centre_id)return;try{fetch('/api/admin/centres/'+user.centre_id,{headers:{'Authorization':'Bearer '+getToken()}}).then(r=>r.json()).then(c=>{var el=document.getElementById('sidebarFooter');if(el&&c.name){el.innerHTML='<div style="margin-bottom:8px"><span class="badge success" style="font-size:11px">'+(user.role==='admin'?'Centre Admin':'Instructor')+'</span></div><div style="font-size:12px;color:var(--accent);font-weight:600">'+c.name+'</div><div style="font-size:10px;color:var(--muted)">'+c.location+'</div><button class="logout-btn" onclick="logout()" style="margin-top:8px"><i class="fas fa-sign-out-alt"></i> Logout</button>';}}).catch(()=>{});}catch(e){}}
function updateDate() {
    var el = document.getElementById('currentDate');
    if (el) el.textContent = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

function setupLogout() {
    var btn = document.getElementById('logoutBtn');
    if (btn) btn.addEventListener('click', function(e) { e.preventDefault(); logout(); });
}
