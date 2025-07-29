// Sidebar functions
function openScheduleManager() {
    console.log('Navigating to schedule manager...');
    const docId = localStorage.getItem('docId');
    if (!docId) {
        alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!');
        window.location.href = 'index.html';
        return;
    }
    window.location.href = 'bac-si-lich-hen-kham.html';
}

function openReports() {
    if (typeof showNotification === 'function') {
        showNotification('Chức năng báo cáo thống kê sẽ được phát triển sớm!', 'info');
    }
}
// Mobile menu toggle
function toggleMobileMenu() {
    const navLeft = document.querySelector('.nav-left');
    if (navLeft) {
        navLeft.style.display = navLeft.style.display === 'flex' ? 'none' : 'flex';
    }
}
// Update current time display
function updateCurrentTime() {
    const timeElement = document.querySelector('.current-time');
    if (timeElement) {
        const now = new Date();
        const timeString = now.toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        const dateString = now.toLocaleDateString('vi-VN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        timeElement.innerHTML = `${timeString}<br><small>${dateString}</small>`;
    }
}
// Close modal functions
function closeModal() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.style.display = 'none';
    });
}

// Common logout function for all doctor pages
function logout() {
    localStorage.clear();
    window.location.href = 'index.html';
}
function closePatientListModal() {
    const patientModal = document.getElementById('patientListModal');
    if (patientModal) {
        patientModal.style.display = 'none';
    }
}
// Check and update doctor UI based on login status
function checkDoctorLogin() {
    const docFullName = localStorage.getItem('docFullName');

    // Debug: Log current localStorage values
    console.log('Doctor Dashboard - Debug Info:');
    console.log('fullName:', docFullName);


    if (docFullName) {
        // User is logged in, show authenticated UI
        console.log('User is logged in - showing UI');
        updateDoctorUI(docFullName);
        return true;
    } else {
        // User not logged in, show login modal
        // console.log('User not logged in - showing auth modal');
        // setTimeout(() => {
        //     if (typeof openAuthModal === 'function') {
        //         openAuthModal('login');
        //     }
        // }, 1000);
        // return false;
        console.log('Doctor not logged in');

        // SỬA: KHÔNG GỌI openAuthModal - chỉ redirect
        console.log('Redirecting to login page...');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000); // Tăng delay để user nhìn thấy message

        return false;
    }
}

function updateDoctorUI(fullName) {
    // Hide notification wrapper and user menu initially shown
    const userMenu = document.querySelector('.user-menu');
    const notificationWrapper = document.querySelector('.notification-wrapper');

    if (userMenu) {
        userMenu.style.display = 'flex';
        // Update user name
        const userNameSpan = userMenu.querySelector('.user-name');
        if (userNameSpan) {
            userNameSpan.textContent = `BS. ${fullName}`;
        }
    }

    // Update doctor name in doctor profile info (new addition)
    const doctorNameElement = document.getElementById('doctorName');
    if (doctorNameElement) {
        doctorNameElement.textContent = `BS. ${fullName}`;
    }

    // Update profile doctor name (for profile page)
    const profileDoctorNameElement = document.getElementById('profileDoctorName');
    if (profileDoctorNameElement) {
        profileDoctorNameElement.textContent = `BS. ${fullName}`;
    }

    // Also update any other doctor name elements
    const doctorNameElements = document.querySelectorAll('.doctor-name');
    doctorNameElements.forEach(element => {
        if (!element.id) { // Only update elements without specific IDs to avoid double updating
            element.textContent = `BS. ${fullName}`;
        }
    });

    if (notificationWrapper) {
        notificationWrapper.style.display = 'block';
    }

    // Update sidebar username if opened
    const sidebarUsername = document.querySelector('.sidebar-username');
    if (sidebarUsername) {
        sidebarUsername.textContent = `BS. ${fullName}`;
    }
}

// Override selectedRole for doctor dashboard
window.addEventListener('load', function() {
    // Auto-select doctor role for this page
    window.selectedRole = 'doctor';
});

// Doctor Dashboard specific initialization
document.addEventListener('DOMContentLoaded', function() {
    // Give script.js time to load first
    setTimeout(() => {
        // Check doctor login status after script.js has initialized
        const isLoggedIn = checkDoctorLogin();

        // Override login success handler to ensure doctor role is saved
        const originalLoginForm = document.getElementById('loginForm');
        if (originalLoginForm) {
            originalLoginForm.addEventListener('submit', function(e) {
                // Ensure doctor role is set for this page
                window.selectedRole = 'doctor';
            });
        }

        // Initialize doctor dashboard features
        initializeDoctorDashboard();
    }, 100);
});

function initializeDoctorDashboard() {
    // Add click handler for mobile menu
    const menuToggle = document.querySelector('.menu-toggle');
    if (menuToggle) {
        menuToggle.addEventListener('click', toggleMobileMenu);
    }

    // Add current time update
    updateCurrentTime();
    setInterval(updateCurrentTime, 60000); // Update every minute

    // Add keyboard shortcuts for doctor dashboard
    document.addEventListener('keydown', function(e) {
        // Escape to close modals
        if (e.key === 'Escape') {
            closeModal();
            closePatientListModal();
        }

        // Ctrl+S to save (when modal is open)
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            const patientModal = document.getElementById('patientModal');
            if (patientModal && patientModal.style.display === 'block') {
                savePatientRecord();
            }
        }
    });

    function showAlert(type, message) {
  const alert = document.getElementById(type + 'Alert');
  alert.querySelector('span').textContent = message;
  alert.style.display = 'flex';

  setTimeout(() => {
    alert.style.display = 'none';
  }, 3000);
}
}

// Auto-initialize for all doctor pages
document.addEventListener('DOMContentLoaded', function() {
    // Check if this is a doctor page (by checking for doctor-specific elements)
    const isDoctorPage = document.querySelector('.doctor-header') || 
                        document.querySelector('.doctor-profile-info') ||
                        document.querySelector('.doctor-name');
    
    if (isDoctorPage) {
        // Give time for other scripts to load
        setTimeout(() => {
            checkDoctorLogin();
        }, 500);
    }
});