function checkAuth() {
    var token = getToken();
    var user = getUser();
    if (!token || !user) {
        if (!window.location.pathname.includes('login.html') && !window.location.pathname.includes('register.html') && !window.location.pathname.includes('forgot-password.html')) {
            window.location.href = '/login.html';
        }
        return false;
    }
    return true;
}

function getToken() {
    return localStorage.getItem('token');
}

function getUser() {
    var userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try { return JSON.parse(userStr); } catch (e) { return null; }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login.html';
}
