document.addEventListener('DOMContentLoaded', function() {
    // ========== GIỮ TRẠNG THÁI ĐĂNG NHẬP ==========
    const authButtons = document.querySelector('.auth-buttons');
    const userMenu = document.querySelector('.user-menu');
    const userNameSpan = document.querySelector('.user-name');
    const sidebarUsername = document.querySelector('.sidebar-username');
    // Hiển thị đúng trạng thái đăng nhập khi load lại trang
    const fullName = localStorage.getItem('userFullName');
    if (fullName) {
        if (authButtons) authButtons.style.display = 'none';
        if (userMenu) userMenu.style.display = 'flex';
        if (userNameSpan) userNameSpan.textContent = fullName;
        if (sidebarUsername) sidebarUsername.textContent = fullName;
    } else {
        if (authButtons) authButtons.style.display = 'flex';
        if (userMenu) userMenu.style.display = 'none';
    }

    // ========== ĐĂNG NHẬP ==========
    document.getElementById('loginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const submitBtn = this.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;

        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang xử lý...';
        submitBtn.disabled = true;

        const cusEmail = document.getElementById('loginEmail').value;
        const cusPassword = document.getElementById('loginPassword').value;

        fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cusEmail, cusPassword })
        })
            .then(async response => {
                if (!response.ok) {
                    const errText = await response.text();
                    throw new Error(errText || 'Đăng nhập thất bại');
                }
                return response.json();
            })
            .then(data => {
                // Lưu tên vào localStorage
                localStorage.setItem('userFullName', data.cusFullName || data.cusEmail || 'Người dùng');
                // Hiển thị giao diện đã đăng nhập
                if (authButtons) authButtons.style.display = 'none';
                if (userMenu) userMenu.style.display = 'flex';
                if (userNameSpan) userNameSpan.textContent = data.cusFullName || data.cusEmail || 'Người dùng';
                if (sidebarUsername) sidebarUsername.textContent = data.cusFullName || data.cusEmail || 'Người dùng';
                showNotification('Đăng nhập thành công!', 'success');
                const closeModal = document.querySelector('.close-modal');
                if (closeModal) closeModal.click();
            })
            .catch((err) => {
                showNotification(
                    (err.message && err.message.startsWith('Invalid'))
                        ? err.message
                        : 'Email hoặc mật khẩu không đúng hoặc tài khoản chưa kích hoạt!',
                    'error'
                );
            })
            .finally(() => {
                submitBtn.innerHTML = '<span>Đăng nhập</span><i class="fas fa-arrow-right"></i>';
                submitBtn.disabled = false;
            });
    });

    // ========== ĐĂNG XUẤT ==========
    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            localStorage.removeItem('userFullName');
            if (userMenu) userMenu.style.display = 'none';
            if (authButtons) authButtons.style.display = 'flex';
            closeSidebar();
            showNotification('Đã đăng xuất!', 'success');
            clearLoginForm();
        });
    }
    const sidebarLogout = document.querySelector('.sidebar-logout');
    if(sidebarLogout) {
        sidebarLogout.addEventListener('click', function(e) {
            e.preventDefault();
            localStorage.removeItem('userFullName');
            if (userMenu) userMenu.style.display = 'none';
            if (authButtons) authButtons.style.display = 'flex';
            closeSidebar();
            clearLoginForm();
            showNotification('Đã đăng xuất!', 'success');
        });
    }

    // ========= ĐĂNG KÝ GỌI API BACKEND =========
    document.getElementById('registerForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const submitBtn = this.querySelector('button[type="submit"]');
        const agreeTerms = document.getElementById('agreeTerms');

        // Kiểm tra đã tích vào ô điều khoản chưa
        if (!agreeTerms.checked) {
            showNotification('Bạn phải đồng ý với điều khoản sử dụng trước khi đăng ký!', 'error');
            return;
        }

        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang xử lý...';
        submitBtn.disabled = true;

        const cusFullName = document.getElementById('registerName').value;
        const cusEmail = document.getElementById('registerEmail').value;
        const cusPassword = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cusFullName, cusEmail, cusPassword, confirmPassword })
        })
            .then(async response => {
                const text = await response.text();
                if (!response.ok) throw new Error(text || 'Đăng ký thất bại!');
                return text;
            })
            .then(msg => {
                showNotification('Đăng ký thành công!', 'success');
                submitBtn.innerHTML = '<span>Đăng ký</span><i class="fas fa-arrow-right"></i>';
                submitBtn.disabled = false;
                const closeModal = document.querySelector('.close-modal');
                if (closeModal) closeModal.click();
            })
            .catch(err => {
                // Kiểm tra thông báo lỗi trả về từ backend
                let message = err.message || 'Đăng ký thất bại!';
                if (message.includes('Email đã tồn tại') || message.includes('Email đã được đăng ký') || message.includes('email')) {
                    showNotification(message, 'error');
                } else {
                    showNotification(message, 'error');
                }
                submitBtn.innerHTML = '<span>Đăng ký</span><i class="fas fa-arrow-right"></i>';
                submitBtn.disabled = false;
            });
    });

    // ========== UI & HIỆU ỨNG KHÁC ==========
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if(targetId === '#') return;
            const targetElement = document.querySelector(targetId);
            if(targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Fixed header on scroll
    const header = document.querySelector('header');
    const scrollThreshold = 100;
    window.addEventListener('scroll', function() {
        if(window.scrollY > scrollThreshold) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Form validation for all forms
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            let valid = true;
            const requiredFields = form.querySelectorAll('[required]');
            requiredFields.forEach(field => {
                if(!field.value.trim()) {
                    valid = false;
                    field.classList.add('error');
                } else {
                    field.classList.remove('error');
                }
            });
            const emailField = form.querySelector('input[type="email"]');
            if(emailField && emailField.value) {
                const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if(!emailPattern.test(emailField.value)) {
                    valid = false;
                    emailField.classList.add('error');
                }
            }
            if(!valid) {
                e.preventDefault();
                const errorMsg = document.createElement('div');
                errorMsg.className = 'error-message';
                errorMsg.textContent = 'Vui lòng điền đầy đủ tất cả các trường bắt buộc.';
                const existingError = form.querySelector('.error-message');
                if(existingError) existingError.remove();
                form.prepend(errorMsg);
            }
        });
    });

    // Auth Modal Functionality
    const authModal = document.getElementById('authModal');
    const closeModal = document.querySelector('.close-modal');
    const authTabs = document.querySelectorAll('.auth-tab');
    const authForms = document.querySelectorAll('.auth-form');
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const nav = document.querySelector('nav');

    // Clear login form
    function clearLoginForm() {
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.reset();
            loginForm.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
            const errorMsg = loginForm.querySelector('.error-message');
            if (errorMsg) errorMsg.remove();
            const submitBtn = loginForm.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.innerHTML = '<span>Đăng nhập</span><i class="fas fa-arrow-right"></i>';
                submitBtn.disabled = false;
            }
        }
    }

    // Toggle password visibility
    document.querySelectorAll('.toggle-password').forEach(toggle => {
        toggle.addEventListener('click', function() {
            const input = this.previousElementSibling;
            const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
            input.setAttribute('type', type);
            this.classList.toggle('fa-eye');
            this.classList.toggle('fa-eye-slash');
        });
    });

    // Open Auth Modal with animation
    window.openAuthModal = function(type) {
        authModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        if (type === 'login') {
            const submitBtn = document.querySelector('#loginForm button[type="submit"]');
            if (submitBtn) {
                submitBtn.innerHTML = '<span>Đăng nhập</span><i class="fas fa-arrow-right"></i>';
                submitBtn.disabled = false;
            }
        }
        const form = document.getElementById(type + 'Form');
        const inputs = form.querySelectorAll('.form-group');
        inputs.forEach((input, index) => {
            input.style.opacity = '0';
            input.style.transform = 'translateY(20px)';
            setTimeout(() => {
                input.style.transition = 'all 0.3s ease';
                input.style.opacity = '1';
                input.style.transform = 'translateY(0)';
            }, 100 * index);
        });
        if (type === 'register') {
            switchTab('register');
        } else {
            switchTab('login');
        }
    };

    // Close Modal with animation
    if (closeModal && authModal) {
        closeModal.addEventListener('click', function() {
            const activeForm = document.querySelector('.auth-form.active');
            const inputs = activeForm ? activeForm.querySelectorAll('.form-group') : [];
            inputs.forEach((input, index) => {
                input.style.opacity = '0';
                input.style.transform = 'translateY(-20px)';
            });
            setTimeout(() => {
                authModal.classList.remove('active');
                document.body.style.overflow = '';
                inputs.forEach(input => {
                    input.style.opacity = '';
                    input.style.transform = '';
                });
                clearLoginForm();
            }, 300);
        });
        authModal.addEventListener('click', function(e) {
            if (e.target === authModal) closeModal.click();
        });
    }

    function switchTab(tabName) {
        const currentForm = document.querySelector('.auth-form.active');
        if (currentForm) {
            currentForm.style.opacity = '0';
            currentForm.style.transform = 'translateX(-20px)';
        }
        authTabs.forEach(tab => {
            if (tab.dataset.tab === tabName) tab.classList.add('active');
            else tab.classList.remove('active');
        });
        setTimeout(() => {
            authForms.forEach(form => {
                if (form.id === tabName + 'Form') {
                    form.classList.add('active');
                    form.style.opacity = '0';
                    form.style.transform = 'translateX(20px)';
                    const inputs = form.querySelectorAll('.form-group');
                    inputs.forEach((input, index) => {
                        input.style.opacity = '0';
                        input.style.transform = 'translateY(20px)';
                        setTimeout(() => {
                            input.style.transition = 'all 0.3s ease';
                            input.style.opacity = '1';
                            input.style.transform = 'translateY(0)';
                        }, 100 * index);
                    });
                    setTimeout(() => {
                        form.style.transition = 'all 0.3s ease';
                        form.style.opacity = '1';
                        form.style.transform = 'translateX(0)';
                    }, 100);
                } else {
                    form.classList.remove('active');
                    form.style.opacity = '';
                    form.style.transform = '';
                }
            });
        }, 300);
    }
    authTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            switchTab(this.dataset.tab);
        });
    });

    // Social login buttons
    document.querySelectorAll('.social-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const provider = this.classList.contains('google') ? 'Google' : 'Facebook';
            showNotification(`Đang xử lý đăng nhập bằng ${provider}...`, 'info');
        });
    });

    // Mobile menu toggle
    if(mobileMenuBtn && nav) {
        mobileMenuBtn.addEventListener('click', function() {
            nav.classList.toggle('active');
        });
    }

    // ============= SIDEBAR USER MENU =============
    const sidebar = document.getElementById('sidebar');
    const openSidebarBtn = document.getElementById('openSidebar');
    const closeSidebarBtn = document.getElementById('closeSidebar');
    function closeSidebar() {
        if (sidebar) {
            sidebar.classList.remove('active');
            setTimeout(() => {
                sidebar.style.display = 'none';
            }, 300);
        }
    }
    if(openSidebarBtn && sidebar) {
        openSidebarBtn.addEventListener('click', function(e) {
            // set tên vào sidebar mỗi lần mở
            const userNameTxt = document.querySelector('.user-name').textContent;
            document.querySelector('.sidebar-username').textContent = userNameTxt;
            sidebar.style.display = 'flex';
            setTimeout(() => {
                sidebar.classList.add('active');
            }, 10);
        });
    }
    if(closeSidebarBtn && sidebar) {
        closeSidebarBtn.addEventListener('click', function() {
            closeSidebar();
        });
    }
    // Đóng sidebar khi bấm ngoài
    document.addEventListener('mousedown', function(e) {
        if (
            sidebar &&
            sidebar.classList.contains('active') &&
            !sidebar.contains(e.target) &&
            !e.target.closest('#openSidebar')
        ) {
            closeSidebar();
        }
    });
    // Chuyển sang trang dashboard khi click vào "Tài khoản" trên sidebar
    const sidebarAccount = document.querySelector('.sidebar-account');
    if(sidebarAccount) {
        sidebarAccount.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = "dashboard.html";
        });
    }

    // Notification system
    function showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }

    // Add notification styles
    const style = document.createElement('style');
    style.textContent = `
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 25px;
            border-radius: 5px;
            color: white;
            font-weight: 500;
            transform: translateX(120%);
            transition: transform 0.3s ease;
            z-index: 3000;
        }
        .notification.show {
            transform: translateX(0);
        }
        .notification.success {
            background-color: #2ecc71;
        }
        .notification.error {
            background-color: #e74c3c;
        }
    `;
    document.head.appendChild(style);

    // Auth Buttons Animation
    document.querySelectorAll('.btn-login, .btn-register').forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            ripple.classList.add('ripple');
            this.appendChild(ripple);
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            ripple.style.width = ripple.style.height = `${size}px`;
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;
            setTimeout(() => {
                ripple.remove();
            }, 600);
            const modal = document.getElementById('authModal');
            if (modal) {
                modal.style.opacity = '0';
                modal.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    modal.classList.add('active');
                    modal.style.opacity = '1';
                    modal.style.transform = 'scale(1)';
                }, 50);
            }
        });
    });
});