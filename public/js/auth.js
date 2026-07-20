// ============================================
// AUTHENTICATION SERVICE
// ============================================

// Get stored token
function getToken() {
    return localStorage.getItem('token');
}

// Get stored user data
function getUser() {
    var userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try { return JSON.parse(userStr); } catch (e) { return null; }
}

// Save user data
function setUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
}

// Check if user is authenticated
function checkAuth() {
    var token = getToken();
    var user = getUser();
    
    // If no token or user, redirect to login (except for public pages)
    if (!token || !user) {
        var publicPages = ['login.html', 'register.html', 'forgot-password.html'];
        var currentPage = window.location.pathname.split('/').pop();
        
        if (!publicPages.includes(currentPage)) {
            window.location.href = '/login.html';
        }
        return false;
    }
    
    // Verify token with server
    fetch('/api/auth/me', {
        headers: { 'Authorization': 'Bearer ' + token }
    }).then(function(response) {
        if (response.status === 401 || response.status === 403) {
            // Token expired or invalid - clear storage and redirect
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            var currentPage = window.location.pathname.split('/').pop();
            var publicPages = ['login.html', 'register.html', 'forgot-password.html', 'reset-password.html'];
            if (!publicPages.includes(currentPage)) {
                window.location.href = '/login.html?reason=session_expired';
            }
        }
    }).catch(function() {});
    
    return true;
}

// Login function
async function login(email, password) {
    try {
        var response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email, password: password })
        });
        
        var data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Login failed');
        }
        
        // Store token and user data
        localStorage.setItem('token', data.token || data.data?.token);
        if (data.user || data.data?.user) {
            setUser(data.user || data.data?.user);
        }
        
        // Start inactivity timer
        startInactivityTimer();
        
        return { success: true, user: getUser() };
    } catch (error) {
        console.error('Login error:', error);
        return { success: false, error: error.message };
    }
}

// Logout function
function logout(message) {
    // Optional: Call logout API
    var token = getToken();
    if (token) {
        fetch('/api/auth/logout', { 
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + token }
        }).catch(function() {});
    }
    
    // Clear local storage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Stop inactivity timer
    stopInactivityTimer();
    
    // Show message if provided
    if (message) {
        alert(message);
    }
    
    // Redirect to login
    window.location.href = '/login.html';
}

// ============================================
// AUTO-LOGOUT ON INACTIVITY
// ============================================

var inactivityTimer = null;
var INACTIVITY_TIME = 8 * 60 * 60 * 1000; // 8 hours

// Function to reset the timer (called on user activity)
function resetInactivityTimer() {
    var token = getToken();
    if (!token) return;
    
    if (inactivityTimer) {
        clearTimeout(inactivityTimer);
    }
    
    inactivityTimer = setTimeout(function() {
        logout('Session expired due to inactivity. Please login again.');
    }, INACTIVITY_TIME);
}

// Stop the inactivity timer
function stopInactivityTimer() {
    if (inactivityTimer) {
        clearTimeout(inactivityTimer);
        inactivityTimer = null;
    }
}

// Start tracking user activity
function startInactivityTimer() {
    // Clear any existing timer
    stopInactivityTimer();
    
    // Only start if user is logged in
    if (!getToken()) return;
    
    // Set initial timer
    resetInactivityTimer();
}

// Set up event listeners for user activity
function setupActivityTracking() {
    var events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click', 'mousemove'];
    
    events.forEach(function(event) {
        document.addEventListener(event, resetInactivityTimer);
    });
}

// Initialize tracking when page loads
(function initAuth() {
    // Check if user is logged in
    if (getToken()) {
        startInactivityTimer();
        setupActivityTracking();
    }
    
    // Watch for login in other tabs (optional)
    window.addEventListener('storage', function(e) {
        if (e.key === 'token') {
            if (e.newValue) {
                // User logged in from another tab
                startInactivityTimer();
                setupActivityTracking();
            } else {
                // User logged out from another tab
                stopInactivityTimer();
                if (!window.location.pathname.includes('login.html')) {
                    window.location.href = '/login.html';
                }
            }
        }
    });
})();

// ============================================
// REDIRECT BASED ON USER ROLE
// ============================================

function redirectBasedOnRole() {
    var user = getUser();
    if (!user) return;
    
    var role = user.role || (user.data && user.data.role);
    var currentPage = window.location.pathname.split('/').pop();
    
    var roleMap = {
        'super_admin': 'admin.html',
        'admin': 'centre.html',
        'instructor': 'index.html',
        'student': 'learner.html'
    };
    
    var targetPage = roleMap[role];
    
    if (targetPage && currentPage !== targetPage && 
        !currentPage.includes('login') && !currentPage.includes('register')) {
        window.location.href = '/' + targetPage;
    }
}

// Call this after login
