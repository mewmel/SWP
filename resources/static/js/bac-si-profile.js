// ===== DOCTOR PROFILE PAGE JAVASCRIPT =====

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    initializeProfile();
    initializeAvatarUpload();
});

// ===== INITIALIZATION =====
function initializeProfile() {
    console.log('Profile page initialized');
}

// ===== AVATAR MANAGEMENT =====
function initializeAvatarUpload() {
    const avatarUpload = document.getElementById('avatarUpload');
    
    if (avatarUpload) {
        avatarUpload.addEventListener('change', handleAvatarUpload);
    }
}

function handleAvatarUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
        showAlert('error', 'Vui lòng chọn file hình ảnh hợp lệ');
        return;
    }
    
    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
        showAlert('error', 'Kích thước file không được vượt quá 5MB');
        return;
    }
    
    // Show loading
    const avatar = document.querySelector('.profile-avatar');
    const originalContent = avatar.innerHTML;
    avatar.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    
    // Simulate upload
    setTimeout(() => {
        // Restore avatar
        avatar.innerHTML = originalContent;
        
        // Show success
        showAlert('success', 'Ảnh đại diện đã được cập nhật thành công!');
        
        // Add to activity log if available
        if (typeof addActivityItem === 'function') {
            addActivityItem('Cập nhật ảnh đại diện', 'Ảnh đại diện đã được thay đổi', 'Vừa xong', 'success');
        }
    }, 1500);
}

// ===== ALERT SYSTEM =====
function showAlert(type, message) {
    const alertId = type === 'success' ? 'successAlert' : 'errorAlert';
    const alert = document.getElementById(alertId);
    
    if (alert) {
        alert.querySelector('span').textContent = message;
        alert.style.display = 'flex';
        alert.classList.add('fade-in');
        
        // Auto hide after 5 seconds
        setTimeout(() => {
            hideAlert(alertId);
        }, 5000);
    }
}

function hideAlert(alertId) {
    const alert = document.getElementById(alertId);
    if (alert) {
        alert.style.display = 'none';
        alert.classList.remove('fade-in');
    }
}

// ===== ACTIVITY LOG =====
function addActivityItem(title, description, time, type = 'info') {
    const activityList = document.querySelector('.activity-list');
    if (!activityList) return;
    
    const newActivity = document.createElement('div');
    newActivity.className = 'activity-item fade-in';
    newActivity.innerHTML = `
        <div class="activity-icon ${type}">
            <i class="fas ${getActivityIcon(type)}"></i>
        </div>
        <div class="activity-content">
            <h5>${title}</h5>
            <p>${description}</p>
            <span class="activity-time">${time}</span>
        </div>
    `;
    
    // Insert at the beginning
    activityList.insertBefore(newActivity, activityList.firstChild);
    
    // Remove last item if more than 5
    const items = activityList.querySelectorAll('.activity-item');
    if (items.length > 5) {
        activityList.removeChild(items[items.length - 1]);
    }
}

function getActivityIcon(type) {
    switch (type) {
        case 'success': return 'fa-check-circle';
        case 'warning': return 'fa-key';
        case 'info': return 'fa-info-circle';
        default: return 'fa-circle';
    }
}

// ===== UTILITY FUNCTIONS =====
function animateStatCards() {
    const statCards = document.querySelectorAll('.stat-card-small');
    statCards.forEach((card, index) => {
        setTimeout(() => {
            card.classList.add('fade-in');
        }, index * 100);
    });
}

// Initialize animations when page loads
window.addEventListener('load', function() {
    setTimeout(animateStatCards, 500);
}); 