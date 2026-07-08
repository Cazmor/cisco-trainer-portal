// Session management with auto-logout on inactivity
let inactivityTimer;
const INACTIVITY_TIME = 1 * 60 * 1000; // 30 minutes

function resetInactivityTimer() {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    if (inactivityTimer) {
        clearTimeout(inactivityTimer);
    }
    
    inactivityTimer = setTimeout(function() {
        const msg = 'Session expired due to inactivity. Please login again.';
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        alert(msg);
        window.location.href = '/login.html';
    }, INACTIVITY_TIME);
}

function startSessionTracking() {
    if (!localStorage.getItem('token')) return;
    
    var events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click', 'mousemove'];
    for (var i = 0; i < events.length; i++) {
        document.removeEventListener(events[i], resetInactivityTimer);
        document.addEventListener(events[i], resetInactivityTimer);
    }
    resetInactivityTimer();
}

function stopSessionTracking() {
    if (inactivityTimer) {
        clearTimeout(inactivityTimer);
        inactivityTimer = null;
    }
}

// Enhanced logout function
window.logout = function(message) {
    stopSessionTracking();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (message) {
        alert(message);
    }
    window.location.href = '/login.html';
};

// Check auth on page load
function checkAuth() {
    var token = localStorage.getItem('token');
    var user = localStorage.getItem('user');
    
    var publicPages = ['login.html', 'register.html', 'forgot-password.html', 'survey.html'];
    var currentPage = window.location.pathname.split('/').pop();
    var isPublicSurvey = window.location.pathname.startsWith('/surveys/');
    
    if (!token || !user) {
        if (publicPages.indexOf(currentPage) === -1 && !isPublicSurvey) {
            window.location.href = '/login.html';
        }
        return false;
    }
    
    startSessionTracking();
    return true;
}

// Initialize on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        checkAuth();
    });
} else {
    checkAuth();
}
