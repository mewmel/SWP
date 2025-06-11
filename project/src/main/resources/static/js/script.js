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
                // Lưu tên và email vào localStorage
                localStorage.setItem('userFullName', data.cusFullName || data.cusEmail || 'Người dùng');
                localStorage.setItem('userEmail', data.cusEmail || '');
                // Hiển thị giao diện đã đăng nhập
                if (authButtons) authButtons.style.display = 'none';
                if (userMenu) userMenu.style.display = 'flex';
                if (userNameSpan) userNameSpan.textContent = data.cusFullName || data.cusEmail || 'Người dùng';
                if (sidebarUsername) sidebarUsername.textContent = data.cusFullName || data.cusEmail || 'Người dùng';
                showNotification('Đăng nhập thành công!', 'success');
                const closeModal = document.querySelector('.close-modal');
                if (closeModal) closeModal.click();

                // Chuyển hướng đến trang dashboard
                window.location.href = "dashboard.html";
                
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
            localStorage.removeItem('userEmail');
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
            localStorage.removeItem('userEmail');
            if (userMenu) userMenu.style.display = 'none';
            if (authButtons) authButtons.style.display = 'flex';
            closeSidebar();
            clearLoginForm();
            showNotification('Đã đăng xuất!', 'success');
            // Chờ 1 giây rồi mới chuyển trang
            setTimeout(function() {
                window.location.href = "index.html";
            }, 800);

        });
    }
    //============ Hiện biểu tượng thông báo khi đã đăng nhập=====
    document.addEventListener('DOMContentLoaded', function() {
        const notificationArea = document.querySelector('.notification-wrapper');
        const userFullName = localStorage.getItem('userFullName');
        if (notificationArea) {
            if (userFullName) {
                notificationArea.style.display = 'block';
            } else {
                notificationArea.style.display = 'none';
            }
        }
    });

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

    // ============= NOTIFICATION DROPDOWN =============
    const notificationBtn = document.getElementById('notificationBtn');
    const notificationDropdown = document.getElementById('notificationDropdown');
    
    if (notificationBtn && notificationDropdown) {
        // Toggle dropdown khi click vào bell icon
        notificationBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            notificationDropdown.classList.toggle('show');
        });

        // Đóng dropdown khi click ra ngoài
        document.addEventListener('click', function(e) {
            if (!notificationDropdown.contains(e.target) && !notificationBtn.contains(e.target)) {
                notificationDropdown.classList.remove('show');
            }
        });

        // Đóng dropdown khi nhấn ESC
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                notificationDropdown.classList.remove('show');
            }
        });

        // Xử lý click vào từng notification item
        document.querySelectorAll('.notification-dropdown-item').forEach(item => {
            item.addEventListener('click', function() {
                // Xóa trạng thái unread
                const wasUnread = this.classList.contains('unread');
                this.classList.remove('unread');
                
                // Cập nhật số badge nếu notification chưa đọc
                if (wasUnread) {
                    const badge = document.querySelector('.notification-badge');
                    if (badge) {
                        let count = parseInt(badge.textContent) || 0;
                        if (count > 0) {
                            count--;
                            badge.textContent = count;
                            if (count === 0) {
                                badge.style.display = 'none';
                            }
                        }
                    }
                }
                
                // Đóng dropdown sau khi click
                notificationDropdown.classList.remove('show');
                
                // Lấy thông tin notification và hiển thị thông báo
                const title = this.querySelector('.notification-title');
                if (title) {
                    showNotification('Đã xem: ' + title.textContent, 'success');
                }

                // Có thể thêm logic chuyển hướng tùy theo loại thông báo
                const notificationType = this.querySelector('.notification-avatar i').className;
                if (notificationType.includes('fa-syringe')) {
                    // Chuyển đến trang lịch điều trị
                    console.log('Chuyển đến lịch tiêm thuốc');
                } else if (notificationType.includes('fa-flask')) {
                    // Chuyển đến trang xét nghiệm
                    console.log('Chuyển đến trang xét nghiệm');
                    // window.location.href = 'ket-qua-xet-nghiem.html';
                } else if (notificationType.includes('fa-calendar-check')) {
                    // Chuyển đến lịch hẹn
                    console.log('Chuyển đến lịch hẹn');
                    // window.location.href = 'lich-dieu-tri.html';
                }
            });
        });

        // Xử lý nút cài đặt thông báo
        const settingsBtn = document.querySelector('.notification-settings-btn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                showNotification('Cài đặt thông báo sẽ được phát triển trong phiên bản tiếp theo!', 'info');
            });
        }

        // Xử lý link "Xem tất cả thông báo"
        const viewAllBtn = document.querySelector('.view-all-notifications');
        if (viewAllBtn) {
            viewAllBtn.addEventListener('click', function(e) {
                e.preventDefault();
                notificationDropdown.classList.remove('show');
                showNotification('Trang xem tất cả thông báo sẽ được phát triển trong phiên bản tiếp theo!', 'info');
                
                // Có thể chuyển hướng đến trang thông báo chuyên dụng
                // window.location.href = 'thong-bao.html';
            });
        }

        // Function để thêm thông báo mới (cho demo hoặc real-time)
        window.addNewNotification = function(title, description, type = 'reminder', time = 'Vừa xong') {
            // Tạo element thông báo mới
            const newNotification = document.createElement('div');
            newNotification.className = 'notification-dropdown-item unread';
            
            let iconClass = 'fas fa-bell';
            if (type === 'injection') iconClass = 'fas fa-syringe';
            else if (type === 'test') iconClass = 'fas fa-flask';
            else if (type === 'appointment') iconClass = 'fas fa-calendar-check';
            else if (type === 'message') iconClass = 'fas fa-user-md';
            
            newNotification.innerHTML = `
                <div class="notification-avatar">
                    <i class="${iconClass}"></i>
                </div>
                <div class="notification-content">
                    <div class="notification-title">${title}</div>
                    <div class="notification-description">${description}</div>
                    <div class="notification-time">${time}</div>
                </div>
            `;
            
            // Thêm vào đầu danh sách
            const notificationBody = document.querySelector('.notification-dropdown-body');
            if (notificationBody) {
                notificationBody.insertBefore(newNotification, notificationBody.firstChild);
                
                // Cập nhật badge
                const badge = document.querySelector('.notification-badge');
                if (badge) {
                    let count = parseInt(badge.textContent) || 0;
                    count++;
                    badge.textContent = count;
                    badge.style.display = 'flex';
                }
                
                // Thêm event listener cho notification mới
                newNotification.addEventListener('click', function() {
                    const wasUnread = this.classList.contains('unread');
                    this.classList.remove('unread');
                    
                    if (wasUnread) {
                        const badge = document.querySelector('.notification-badge');
                        if (badge) {
                            let count = parseInt(badge.textContent) || 0;
                            if (count > 0) {
                                count--;
                                badge.textContent = count;
                                if (count === 0) {
                                    badge.style.display = 'none';
                                }
                            }
                        }
                    }
                    
                    notificationDropdown.classList.remove('show');
                    showNotification('Đã xem: ' + title, 'success');
                });
                
                // Animation cho thông báo mới
                newNotification.style.animation = 'slideInNotification 0.3s ease-out';
            }
        };

        // Function để đánh dấu tất cả đã đọc
        window.markAllNotificationsRead = function() {
            document.querySelectorAll('.notification-dropdown-item.unread').forEach(item => {
                item.classList.remove('unread');
            });
            
            const badge = document.querySelector('.notification-badge');
            if (badge) {
                badge.style.display = 'none';
            }
            
            showNotification('Đã đánh dấu tất cả thông báo đã đọc!', 'success');
        };
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
             border-radius: 8px;
             color: white;
             font-weight: 500;
             transform: translateX(120%);
             transition: transform 0.3s ease;
             z-index: 3000;
             max-width: 350px;
             word-wrap: break-word;
             box-shadow: 0 4px 12px rgba(0,0,0,0.15);
         }
         .notification.show {
             transform: translateX(0);
         }
         .notification.success {
             background: linear-gradient(135deg, #2ecc71, #27ae60);
         }
         .notification.error {
             background: linear-gradient(135deg, #e74c3c, #c0392b);
         }
         .notification.info {
             background: linear-gradient(135deg, #3498db, #2980b9);
         }

         /* Animation cho notification mới */
         @keyframes slideInNotification {
             0% {
                 opacity: 0;
                 transform: translateX(-20px) scale(0.9);
             }
             100% {
                 opacity: 1;
                 transform: translateX(0) scale(1);
             }
         }

         /* Ripple effect cho buttons */
         .ripple {
             position: absolute;
             border-radius: 50%;
             background: rgba(255, 255, 255, 0.6);
             transform: scale(0);
             animation: ripple-animation 0.6s linear;
             pointer-events: none;
         }

         @keyframes ripple-animation {
             to {
                 transform: scale(4);
                 opacity: 0;
             }
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

     // ============= DASHBOARD FEATURES =============
     // Temperature Chart (chỉ load khi có element temperatureChart)
     const temperatureChart = document.getElementById('temperatureChart');
     if (temperatureChart) {
         const ctx = temperatureChart.getContext('2d');
         new Chart(ctx, {
             type: 'line',
             data: {
                 labels: ['20/6', '21/6', '22/6', '23/6', '24/6', '25/6', '26/6'],
                 datasets: [{
                     label: 'Nhiệt độ cơ thể (°C)',
                     data: [36.4, 36.3, 36.5, 36.7, 36.8, 36.6, 36.9],
                     borderColor: 'rgb(74, 144, 226)',
                     backgroundColor: 'rgba(74, 144, 226, 0.1)',
                     tension: 0.1,
                     fill: true
                 }]
             },
             options: {
                 responsive: true,
                 maintainAspectRatio: false,
                 plugins: {
                     legend: {
                         display: false
                     }
                 },
                 scales: {
                     y: {
                         beginAtZero: false,
                         min: 36,
                         max: 37.5
                     }
                 }
             }
         });
     }

     // Interactive action items
     document.querySelectorAll('.action-item').forEach(item => {
         item.addEventListener('click', function () {
             const action = this.textContent.trim();
             showNotification(`Chức năng "${action}" sẽ được phát triển trong phiên bản tiếp theo!`, 'info');
         });
     });

     // Progress bar animation
     const progressFill = document.querySelector('.progress-fill');
     if (progressFill) {
         setTimeout(() => {
             progressFill.style.width = '40%';
         }, 500);
     }

     // Timeline day hover effects
     document.querySelectorAll('.timeline-day').forEach(day => {
         day.addEventListener('mouseenter', function () {
             if (this.classList.contains('has-event')) {
                 this.style.transform = 'scale(1.05)';
                 this.style.transition = 'transform 0.2s ease';
             }
         });

         day.addEventListener('mouseleave', function () {
             this.style.transform = 'scale(1)';
         });
     });

     // ============= DEMO FUNCTIONS FOR TESTING =============
     // Function để test thêm notification mới
     window.testNotification = function() {
         const types = ['injection', 'test', 'appointment', 'message'];
         const messages = [
             { title: 'Nhắc nhở tiêm thuốc', desc: 'Đã đến giờ tiêm thuốc Gonal-F 150 IU', type: 'injection' },
             { title: 'Lịch xét nghiệm mới', desc: 'Xét nghiệm hormone FSH vào ngày mai', type: 'test' },
             { title: 'Cuộc hẹn với bác sĩ', desc: 'Khám tái khám với BS. Nguyễn Thị Hương', type: 'appointment' },
             { title: 'Tin nhắn từ phòng khám', desc: 'Bạn có một tin nhắn mới từ phòng khám', type: 'message' }
         ];
         
         const randomMsg = messages[Math.floor(Math.random() * messages.length)];
         if (typeof addNewNotification === 'function') {
             addNewNotification(randomMsg.title, randomMsg.desc, randomMsg.type);
         }
     };

     // Auto-demo notification (uncomment để test)
     // setInterval(testNotification, 10000); // Thêm notification mới mỗi 10 giây

     
 });
 