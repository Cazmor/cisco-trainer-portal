// API Service - Fixed for HTTPS and Auto-Logout
var API = {
    // Auto-detect protocol and host
    baseUrl: (function() {
        // On Render.com (HTTPS) or local (HTTP)
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            return 'http://localhost:3000/api';
        }
        return '/api'; // This works on Render with HTTPS
    })(),
    
    // Get headers with token
    getHeaders: function() {
        var h = { 'Content-Type': 'application/json' };
        var t = localStorage.getItem('token');
        if (t) h['Authorization'] = 'Bearer ' + t;
        return h;
    },
    
    // Request wrapper with error handling
    request: async function(endpoint, options) {
        options = options || {};
        var config = { 
            headers: this.getHeaders(), 
            method: options.method || 'GET',
            credentials: 'include' // Important for HTTPS
        };
        
        if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
            config.body = JSON.stringify(options.body);
        } else if (options.body) {
            config.body = options.body;
        }
        
        if (options.body instanceof FormData) {
            delete config.headers['Content-Type'];
        }
        
        try {
            var r = await fetch(this.baseUrl + endpoint, config);
            
            // Handle 401 Unauthorized - Token expired
            if (r.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login.html';
                throw new Error('Session expired. Please login again.');
            }
            
            var d = await r.json();
            if (!r.ok) throw new Error(d.error || 'Request failed');
            return d;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },
    
    // Auth endpoints
    auth: { 
        login: function(e, p) { 
            return API.request('/auth/login', { method: 'POST', body: { email: e, password: p } }); 
        },
        logout: function() { 
            return API.request('/auth/logout', { method: 'POST' }).catch(function() {}); 
        },
        getProfile: function() { 
            return API.request('/auth/me'); 
        }, 
        updateProfile: function(d) { 
            return API.request('/auth/me', { method: 'PUT', body: d }); 
        } 
    },
    
    // Admin endpoints
    admin: { 
        getDashboard: function() { return API.request('/admin/dashboard'); }, 
        getCentres: function() { return API.request('/admin/centres'); }, 
        getUsers: function() { return API.request('/admin/users'); }, 
        getPendingRegistrations: function() { return API.request('/admin/pending-registrations'); }, 
        approveRegistration: function(id) { return API.request('/admin/approve-registration/' + id, { method: 'POST' }); }, 
        rejectRegistration: function(id) { return API.request('/admin/reject-registration/' + id, { method: 'DELETE' }); } 
    },
    
    // Students endpoints
    students: { 
        getAll: function(p) { var q = new URLSearchParams(p || {}).toString(); return API.request('/students' + (q ? '?' + q : '')); }, 
        getById: function(id) { return API.request('/students/' + id); }, 
        create: function(d) { return API.request('/students', { method: 'POST', body: d }); }, 
        update: function(id, d) { return API.request('/students/' + id, { method: 'PUT', body: d }); }, 
        delete: function(id) { return API.request('/students/' + id, { method: 'DELETE' }); }, 
        bulkImport: function(fd) { return API.request('/students/bulk-import', { method: 'POST', body: fd }); } 
    },
    
    // Attendance endpoints
    attendance: { 
        get: function(p) { var q = new URLSearchParams(p || {}).toString(); return API.request('/attendance' + (q ? '?' + q : '')); }, 
        getMatrix: function(p) { var q = new URLSearchParams(p || {}).toString(); return API.request('/attendance/matrix' + (q ? '?' + q : '')); }, 
        mark: function(d) { return API.request('/attendance', { method: 'POST', body: d }); }, 
        markBulk: function(d) { return API.request('/attendance/bulk', { method: 'POST', body: d }); }, 
        getStats: function(p) { var q = new URLSearchParams(p || {}).toString(); return API.request('/attendance/stats' + (q ? '?' + q : '')); } 
    },
    
    // Performance endpoints
    performance: { 
        get: function(p) { var q = new URLSearchParams(p || {}).toString(); return API.request('/performance' + (q ? '?' + q : '')); }, 
        save: function(d) { return API.request('/performance', { method: 'POST', body: d }); }, 
        saveBulk: function(d) { return API.request('/performance/bulk', { method: 'POST', body: d }); }, 
        getSummary: function() { return API.request('/performance/summary'); }, 
        getStruggling: function() { return API.request('/performance/struggling'); }, 
        getRankings: function() { return API.request('/performance/rankings'); }, 
        getInterventions: function() { return API.request('/performance/interventions'); }, 
        createIntervention: function(d) { return API.request('/performance/interventions', { method: 'POST', body: d }); }, 
        updateIntervention: function(id, d) { return API.request('/performance/interventions/' + id, { method: 'PUT', body: d }); }, 
        getFeedback: function() { return API.request('/performance/feedback'); }, 
        addFeedback: function(d) { return API.request('/performance/feedback', { method: 'POST', body: d }); } 
    },
    
    // Lab endpoints
    lab: { 
        getStatus: function() { return API.request('/lab/status'); }, 
        updateWorkstation: function(id, d) { return API.request('/lab/workstation/' + id, { method: 'PUT', body: d }); }, 
        getLaptops: function() { return API.request('/lab/laptops'); }, 
        addLaptop: function(d) { return API.request('/lab/laptops', { method: 'POST', body: d }); }, 
        updateLaptop: function(id, d) { return API.request('/lab/laptops/' + id, { method: 'PUT', body: d }); }, 
        deleteLaptop: function(id) { return API.request('/lab/laptops/' + id, { method: 'DELETE' }); }, 
        getEquipment: function() { return API.request('/lab/equipment'); }, 
        addEquipment: function(d) { return API.request('/lab/equipment', { method: 'POST', body: d }); }, 
        updateEquipment: function(id, d) { return API.request('/lab/equipment/' + id, { method: 'PUT', body: d }); }, 
        deleteEquipment: function(id) { return API.request('/lab/equipment/' + id, { method: 'DELETE' }); }, 
        getOtherDevices: function() { return API.request('/lab/other-devices'); }, 
        addDevice: function(d) { return API.request('/lab/other-devices', { method: 'POST', body: d }); }, 
        deleteDevice: function(id) { return API.request('/lab/other-devices/' + id, { method: 'DELETE' }); }, 
        getMaintenance: function() { return API.request('/lab/maintenance'); }, 
        addMaintenance: function(d) { return API.request('/lab/maintenance', { method: 'POST', body: d }); }, 
        updateMaintenance: function(id, d) { return API.request('/lab/maintenance/' + id, { method: 'PUT', body: d }); }, 
        deleteMaintenance: function(id) { return API.request('/lab/maintenance/' + id, { method: 'DELETE' }); }, 
        getPreventive: function() { return API.request('/lab/preventive'); }, 
        addPreventive: function(d) { return API.request('/lab/preventive', { method: 'POST', body: d }); }, 
        deletePreventive: function(id) { return API.request('/lab/preventive/' + id, { method: 'DELETE' }); } 
    },
    
    // Classes endpoints
    classes: { 
        getScheduled: function(p) { var q = new URLSearchParams(p || {}).toString(); return API.request('/classes/scheduled' + (q ? '?' + q : '')); }, 
        schedule: function(d) { return API.request('/classes/scheduled', { method: 'POST', body: d }); }, 
        updateClass: function(id, d) { return API.request('/classes/scheduled/' + id, { method: 'PUT', body: d }); }, 
        deleteClass: function(id) { return API.request('/classes/scheduled/' + id, { method: 'DELETE' }); }, 
        getTimetable: function() { return API.request('/classes/timetable'); }, 
        addTimetable: function(d) { return API.request('/classes/timetable', { method: 'POST', body: d }); }, 
        updateTimetable: function(id, d) { return API.request('/classes/timetable/' + id, { method: 'PUT', body: d }); }, 
        getDeliveryPlan: function(p) { var q = new URLSearchParams(p || {}).toString(); return API.request('/classes/delivery-plan' + (q ? '?' + q : '')); }, 
        updateDeliveryPlan: function(id, d) { return API.request('/classes/delivery-plan/' + id, { method: 'PUT', body: d }); }, 
        getInnovation: function() { return API.request('/classes/innovation'); },
        getCurriculum: function(params) { var q = new URLSearchParams(params || {}).toString(); return API.request('/curriculum' + (q ? '?' + q : '')); }, 
        addInnovation: function(d) { return API.request('/classes/innovation', { method: 'POST', body: d }); }, 
        getEvidence: function(p) { var q = new URLSearchParams(p || {}).toString(); return API.request('/classes/evidence' + (q ? '?' + q : '')); }, 
        uploadEvidence: function(fd) { return API.request('/classes/evidence', { method: 'POST', body: fd }); } 
    },
    
    // Reports endpoints
    reports: { 
        getDaily: function(p) { var q = new URLSearchParams(p || {}).toString(); return API.request('/reports/daily' + (q ? '?' + q : '')); }, 
        saveDaily: function(d) { return API.request('/reports/daily', { method: 'POST', body: d }); }, 
        deleteDaily: function(id) { return API.request('/reports/daily/' + id, { method: 'DELETE' }); }, 
        getWeekly: function(p) { var q = new URLSearchParams(p || {}).toString(); return API.request('/reports/weekly' + (q ? '?' + q : '')); }, 
        createWeekly: function(d) { return API.request('/reports/weekly', { method: 'POST', body: d }); }, 
        deleteWeekly: function(id) { return API.request('/reports/weekly/' + id, { method: 'DELETE' }); }, 
        getMaintenance: function() { return API.request('/reports/maintenance'); }, 
        createMaintenance: function(d) { return API.request('/reports/maintenance', { method: 'POST', body: d }); }, 
        deleteMaintenance: function(id) { return API.request('/reports/maintenance/' + id, { method: 'DELETE' }); } 
    },
    
    // AI endpoints
    ai: { generate: function(d) { return API.request('/ai/generate', { method: 'POST', body: d }); } },
    
    // KPI endpoints
    kpi: { getScorecard: function() { return API.request('/kpi/scorecard'); }, getEvidence: function(id) { return API.request('/kpi/evidence/' + id); } },
    
    // Surveys endpoints
    surveys: { getAll: function() { return API.request('/surveys'); }, create: function(d) { return API.request('/surveys', { method: 'POST', body: d }); }, getById: function(id) { return API.request('/surveys/' + id); }, submitResponse: function(id, d) { return API.request('/surveys/' + id + '/respond', { method: 'POST', body: d }); }, getStats: function() { return API.request('/surveys/stats'); } },
    
    // Curriculum endpoints
    curriculum: { get: function(p) { var q = new URLSearchParams(p || {}).toString(); return API.request('/curriculum' + (q ? '?' + q : '')); }, save: function(data) { return API.request('/curriculum/save', { method: 'POST', body: { sections: data.sections || data } }); } },
    
    // Settings endpoints
    settings: { getProfile: function() { return API.request('/settings/profile'); }, updateProfile: function(d) { return API.request('/settings/profile', { method: 'PUT', body: d }); }, getNotifications: function() { return API.request('/settings/notifications'); }, updateNotifications: function(d) { return API.request('/settings/notifications', { method: 'PUT', body: d }); }, getSystem: function() { return API.request('/settings/system'); }, updateSystem: function(d) { return API.request('/settings/system', { method: 'PUT', body: d }); }, getDevelopment: function() { return API.request('/settings/development'); }, addDevelopment: function(d) { return API.request('/settings/development', { method: 'POST', body: d }); }, deleteDevelopment: function(id) { return API.request('/settings/development/' + id, { method: 'DELETE' }); }, importData: function(d) { return API.request('/settings/import', { method: 'POST', body: d }); }, resetSystem: function() { return API.request('/settings/reset', { method: 'DELETE' }); } },
    
    // Templates endpoints
    templates: { get: function(type) { return API.request('/templates/' + type); }, upload: function(type, content) { return API.request('/templates/' + type, { method: 'POST', body: { content: content } }); } }
};

// ============================================
// AUTO-LOGOUT ON INACTIVITY
// ============================================
(function() {
    let inactivityTimer;
    const INACTIVITY_TIME = 30 * 60 * 1000; // 30 minutes
    
    function logoutDueToInactivity() {
        const token = localStorage.getItem('token');
        if (token) {
            // Call logout API
            fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
            // Clear local storage
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            // Show message and redirect
            alert('Session expired due to inactivity. Please login again.');
            window.location.href = '/login.html';
        }
    }
    
    function resetInactivityTimer() {
        clearTimeout(inactivityTimer);
        const token = localStorage.getItem('token');
        if (token) {
            inactivityTimer = setTimeout(logoutDueToInactivity, INACTIVITY_TIME);
        }
    }
    
    // Set up event listeners only if user is logged in
    function startInactivityTracking() {
        const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click', 'mousemove'];
        events.forEach(function(event) {
            document.addEventListener(event, resetInactivityTimer);
        });
        resetInactivityTimer();
    }
    
    // Check if user is logged in and start tracking
    if (localStorage.getItem('token')) {
        startInactivityTracking();
    }
    
    // Monitor localStorage for login (for multi-tab)
    window.addEventListener('storage', function(e) {
        if (e.key === 'token') {
            if (e.newValue) {
                startInactivityTracking();
            } else {
                clearTimeout(inactivityTimer);
            }
        }
    });
})();