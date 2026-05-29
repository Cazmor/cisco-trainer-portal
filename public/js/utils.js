function showToast(message, type) {
    type = type || 'info';
    var container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        container.style.cssText = 'position:fixed;top:20px;right:20px;z-index:10000;display:flex;flex-direction:column;gap:10px;';
        document.body.appendChild(container);
    }
    var toast = document.createElement('div');
    toast.style.cssText = 'padding:12px 20px;border-radius:8px;color:white;font-size:14px;min-width:300px;box-shadow:0 4px 12px rgba(0,0,0,0.15);animation:slideIn 0.3s ease;display:flex;align-items:center;gap:10px;';
    var colors = { success: '#10b981', error: '#ef4444', warning: '#f59e0b', info: '#3b82f6' };
    toast.style.backgroundColor = colors[type] || colors.info;
    var icons = { success: 'fa-check-circle', error: 'fa-exclamation-circle', warning: 'fa-exclamation-triangle', info: 'fa-info-circle' };
    toast.innerHTML = '<i class="fas ' + (icons[type] || icons.info) + '"></i><span>' + message + '</span>';
    container.appendChild(toast);
    setTimeout(function() { toast.style.animation = 'slideOut 0.3s ease'; setTimeout(function() { toast.remove(); }, 300); }, 4000);
}

function showLoading() { var overlay = document.getElementById('loadingOverlay'); if (overlay) overlay.style.display = 'flex'; }
function hideLoading() { var overlay = document.getElementById('loadingOverlay'); if (overlay) overlay.style.display = 'none'; }

function formatDate(dateString) { if (!dateString) return ''; var d = new Date(dateString); return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }); }
function getToday() { return new Date().toISOString().split('T')[0]; }
function showConfirm(message) { return confirm(message); }

function showModal(modalId) { var modal = document.getElementById(modalId); if (modal) { modal.style.display = 'flex'; setTimeout(function() { var content = modal.querySelector('.modal-content'); if (content) content.style.transform = 'scale(1)'; }, 10); } }
function hideModal(modalId) { var modal = document.getElementById(modalId); if (modal) { var content = modal.querySelector('.modal-content'); if (content) content.style.transform = 'scale(0.9)'; setTimeout(function() { modal.style.display = 'none'; }, 200); } }

function downloadFile(content, filename, type) {
    type = type || 'text/csv';
    var BOM = '\uFEFF';
    var blob = new Blob([BOM + content], { type: type + ';charset=utf-8' });
    var url = window.URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

var style = document.createElement('style');
style.textContent = '@keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } } @keyframes slideOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(100%); opacity: 0; } }';
document.head.appendChild(style);
