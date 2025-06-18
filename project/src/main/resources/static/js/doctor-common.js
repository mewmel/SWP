// Sidebar functions
function openScheduleManager() {
    if (typeof showNotification === 'function') {
        showNotification('Chức năng quản lý lịch hẹn sẽ được phát triển sớm!', 'info');
    }
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
// Check and update doctor UI based on login status
function checkDoctorLogin() {
    const fullName = localStorage.getItem('userFullName');
    const userRole = localStorage.getItem('userRole');
<<<<<<< HEAD
    
=======

>>>>>>> V-Hung2
    // Debug: Log current localStorage values
    console.log('Doctor Dashboard - Debug Info:');
    console.log('fullName:', fullName);
    console.log('userRole:', userRole);
<<<<<<< HEAD
    
=======

>>>>>>> V-Hung2
    if (fullName) {
        // User is logged in, show authenticated UI
        console.log('User is logged in - showing UI');
        updateDoctorUI(fullName);
<<<<<<< HEAD
        
=======

>>>>>>> V-Hung2
        // If role is not set or not doctor, set it to doctor for this page
        if (!userRole || userRole !== 'doctor') {
            console.log('Setting role to doctor for this page');
            localStorage.setItem('userRole', 'doctor');
        }
        return true;
    } else {
        // User not logged in, show login modal
        console.log('User not logged in - showing auth modal');
        setTimeout(() => {
            if (typeof openAuthModal === 'function') {
                openAuthModal('login');
            }
        }, 500);
        return false;
    }
}

function updateDoctorUI(fullName) {
    // Hide notification wrapper and user menu initially shown
    const userMenu = document.querySelector('.user-menu');
    const notificationWrapper = document.querySelector('.notification-wrapper');
<<<<<<< HEAD
    
=======

>>>>>>> V-Hung2
    if (userMenu) {
        userMenu.style.display = 'flex';
        // Update user name
        const userNameSpan = userMenu.querySelector('.user-name');
        if (userNameSpan) {
            userNameSpan.textContent = `BS. ${fullName}`;
        }
    }
<<<<<<< HEAD
    
    if (notificationWrapper) {
        notificationWrapper.style.display = 'block';
    }
    
=======

    if (notificationWrapper) {
        notificationWrapper.style.display = 'block';
    }

>>>>>>> V-Hung2
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
<<<<<<< HEAD
        
=======

>>>>>>> V-Hung2
        // Override login success handler to ensure doctor role is saved
        const originalLoginForm = document.getElementById('loginForm');
        if (originalLoginForm) {
            originalLoginForm.addEventListener('submit', function(e) {
                // Ensure doctor role is set for this page
                window.selectedRole = 'doctor';
            });
        }
<<<<<<< HEAD
        
=======

>>>>>>> V-Hung2
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
<<<<<<< HEAD
    
    // Add current time update
    updateCurrentTime();
    setInterval(updateCurrentTime, 60000); // Update every minute
    
=======

    // Add current time update
    updateCurrentTime();
    setInterval(updateCurrentTime, 60000); // Update every minute

>>>>>>> V-Hung2
    // Add keyboard shortcuts for doctor dashboard
    document.addEventListener('keydown', function(e) {
        // Escape to close modals
        if (e.key === 'Escape') {
            closeModal();
            closePatientListModal();
        }
<<<<<<< HEAD
        
=======

>>>>>>> V-Hung2
        // Ctrl+S to save (when modal is open)
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            const patientModal = document.getElementById('patientModal');
            if (patientModal && patientModal.style.display === 'block') {
                savePatientRecord();
            }
        }
    });
}