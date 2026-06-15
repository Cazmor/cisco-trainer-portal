// Session management with auto-logout on inactivity
let inactivityTimer;
const INACTIVITY_TIME = 30 * 60 * 1000; // 30 minutes

function resetInactivityTimer() {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    if (inactivityTimer) {
        clearTimeout(inactivityTimer);
    }
    
    inactivityTimer = setTimeout(() => {
        logout('Session expired due to inactivity. Please login again.');
    }, INACTIVITY_TIME);
}

function startSessionTracking() {
    if (!localStorage.getItem('token')) return;
    
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click', 'mousemove'];
    events.forEach(event => {
        document.removeEventListener(event, resetInactivityTimer);
        document.addEventListener(event, resetInactivityTimer);
    });
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
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    const publicPages = ['login.html', 'register.html', 'forgot-password.html'];
    const currentPage = window.location.pathname.split('/').pop();
    
    if (!token || !user) {
        if (!publicPages.includes(currentPage)) {
            window.location.href = '/login.html';
        }
        return false;
    }
    
    startSessionTracking();
    return true;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
});