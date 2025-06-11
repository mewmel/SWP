document.addEventListener('DOMContentLoaded', function() {
<<<<<<< Updated upstream:project/src/main/resources/static/script.js
=======
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
>>>>>>> Stashed changes:project/src/main/resources/static/js/script.js
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
<<<<<<< Updated upstream:project/src/main/resources/static/script.js

            const targetId = this.getAttribute('href');
            if(targetId === '#') return;

=======
            const targetId = this.getAttribute('href');
            if(targetId === '#') return;
>>>>>>> Stashed changes:project/src/main/resources/static/js/script.js
            const targetElement = document.querySelector(targetId);
            if(targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

<<<<<<< Updated upstream:project/src/main/resources/static/script.js
    // Add fixed header class on scroll
    const header = document.querySelector('header');
    const scrollThreshold = 100;

=======
    // Fixed header on scroll
    const header = document.querySelector('header');
    const scrollThreshold = 100;
>>>>>>> Stashed changes:project/src/main/resources/static/js/script.js
    window.addEventListener('scroll', function() {
        if(window.scrollY > scrollThreshold) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

<<<<<<< Updated upstream:project/src/main/resources/static/script.js
    // Simple testimonial slider (if we have multiple testimonials)
    const testimonials = document.querySelectorAll('.testimonial');
    let currentTestimonial = 0;

    if(testimonials.length > 1) {
        // Create navigation dots
        const sliderNav = document.createElement('div');
        sliderNav.className = 'testimonial-nav';

        testimonials.forEach((_, index) => {
            const dot = document.createElement('button');
            dot.className = index === 0 ? 'dot active' : 'dot';
            dot.addEventListener('click', () => showTestimonial(index));
            sliderNav.appendChild(dot);
        });

        // Add the navigation to the slider
        const slider = document.querySelector('.testimonial-slider');
        slider.appendChild(sliderNav);

        // Hide all testimonials except the first one
        testimonials.forEach((testimonial, index) => {
            if(index !== 0) {
                testimonial.style.display = 'none';
            }
        });

        // Set up auto rotation
        setInterval(nextTestimonial, 5000);
    }

    function showTestimonial(index) {
        // Hide all testimonials
        testimonials.forEach(testimonial => {
            testimonial.style.display = 'none';
        });

        // Show the selected testimonial
        testimonials[index].style.display = 'block';

        // Update the active dot
        const dots = document.querySelectorAll('.testimonial-nav .dot');
        dots.forEach((dot, i) => {
            if(i === index) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });

        currentTestimonial = index;
    }

    function nextTestimonial() {
        let next = currentTestimonial + 1;
        if(next >= testimonials.length) {
            next = 0;
        }
        showTestimonial(next);
    }

    // Form validation for any contact forms
    const forms = document.querySelectorAll('form');

=======
    // Form validation for all forms
    const forms = document.querySelectorAll('form');
>>>>>>> Stashed changes:project/src/main/resources/static/js/script.js
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            let valid = true;
            const requiredFields = form.querySelectorAll('[required]');
<<<<<<< Updated upstream:project/src/main/resources/static/script.js

=======
>>>>>>> Stashed changes:project/src/main/resources/static/js/script.js
            requiredFields.forEach(field => {
                if(!field.value.trim()) {
                    valid = false;
                    field.classList.add('error');
                } else {
                    field.classList.remove('error');
                }
            });
<<<<<<< Updated upstream:project/src/main/resources/static/script.js

            // Email validation if there's an email field
=======
>>>>>>> Stashed changes:project/src/main/resources/static/js/script.js
            const emailField = form.querySelector('input[type="email"]');
            if(emailField && emailField.value) {
                const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if(!emailPattern.test(emailField.value)) {
                    valid = false;
                    emailField.classList.add('error');
                }
            }
<<<<<<< Updated upstream:project/src/main/resources/static/script.js

            if(!valid) {
                e.preventDefault();

                // Show error message
                const errorMsg = document.createElement('div');
                errorMsg.className = 'error-message';
                errorMsg.textContent = 'Vui lòng điền đầy đủ tất cả các trường bắt buộc.';

                // Check if error message already exists
                const existingError = form.querySelector('.error-message');
                if(existingError) {
                    existingError.remove();
                }

=======
            if(!valid) {
                e.preventDefault();
                const errorMsg = document.createElement('div');
                errorMsg.className = 'error-message';
                errorMsg.textContent = 'Vui lòng điền đầy đủ tất cả các trường bắt buộc.';
                const existingError = form.querySelector('.error-message');
                if(existingError) existingError.remove();
>>>>>>> Stashed changes:project/src/main/resources/static/js/script.js
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

<<<<<<< Updated upstream:project/src/main/resources/static/script.js
    // Hàm clear form đăng nhập
=======
    // Clear login form
>>>>>>> Stashed changes:project/src/main/resources/static/js/script.js
    function clearLoginForm() {
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.reset();
            loginForm.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
            const errorMsg = loginForm.querySelector('.error-message');
            if (errorMsg) errorMsg.remove();
<<<<<<< Updated upstream:project/src/main/resources/static/script.js
            // Reset nút đăng nhập về mặc định
=======
>>>>>>> Stashed changes:project/src/main/resources/static/js/script.js
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
<<<<<<< Updated upstream:project/src/main/resources/static/script.js

        // RESET nút đăng nhập về mặc định mỗi lần mở modal
=======
>>>>>>> Stashed changes:project/src/main/resources/static/js/script.js
        if (type === 'login') {
            const submitBtn = document.querySelector('#loginForm button[type="submit"]');
            if (submitBtn) {
                submitBtn.innerHTML = '<span>Đăng nhập</span><i class="fas fa-arrow-right"></i>';
                submitBtn.disabled = false;
            }
        }
<<<<<<< Updated upstream:project/src/main/resources/static/script.js

        // Add entrance animation to form elements
=======
>>>>>>> Stashed changes:project/src/main/resources/static/js/script.js
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
<<<<<<< Updated upstream:project/src/main/resources/static/script.js

        // Switch to the correct tab
=======
>>>>>>> Stashed changes:project/src/main/resources/static/js/script.js
        if (type === 'register') {
            switchTab('register');
        } else {
            switchTab('login');
        }
<<<<<<< Updated upstream:project/src/main/resources/static/script.js
    }

    // Close Modal with animation
    closeModal.addEventListener('click', function() {
        const activeForm = document.querySelector('.auth-form.active');
        const inputs = activeForm.querySelectorAll('.form-group');

        // Add exit animation
        inputs.forEach((input, index) => {
            input.style.opacity = '0';
            input.style.transform = 'translateY(-20px)';
        });

        setTimeout(() => {
            authModal.classList.remove('active');
            document.body.style.overflow = '';
            // Reset animations
            inputs.forEach(input => {
                input.style.opacity = '';
                input.style.transform = '';
            });
            clearLoginForm(); // Clear form đăng nhập khi đóng modal
        }, 300);
    });

    // Close modal when clicking outside
    authModal.addEventListener('click', function(e) {
        if (e.target === authModal) {
            closeModal.click();
        }
    });

    // Switch between login and register tabs with animation
    function switchTab(tabName) {
        // Fade out current form
=======
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
>>>>>>> Stashed changes:project/src/main/resources/static/js/script.js
        const currentForm = document.querySelector('.auth-form.active');
        if (currentForm) {
            currentForm.style.opacity = '0';
            currentForm.style.transform = 'translateX(-20px)';
        }
<<<<<<< Updated upstream:project/src/main/resources/static/script.js

        // Update tabs
        authTabs.forEach(tab => {
            if (tab.dataset.tab === tabName) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });

        // Show new form with animation
=======
        authTabs.forEach(tab => {
            if (tab.dataset.tab === tabName) tab.classList.add('active');
            else tab.classList.remove('active');
        });
>>>>>>> Stashed changes:project/src/main/resources/static/js/script.js
        setTimeout(() => {
            authForms.forEach(form => {
                if (form.id === tabName + 'Form') {
                    form.classList.add('active');
                    form.style.opacity = '0';
                    form.style.transform = 'translateX(20px)';
<<<<<<< Updated upstream:project/src/main/resources/static/script.js

                    // Animate form elements
=======
>>>>>>> Stashed changes:project/src/main/resources/static/js/script.js
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
<<<<<<< Updated upstream:project/src/main/resources/static/script.js

                    // Fade in form
=======
>>>>>>> Stashed changes:project/src/main/resources/static/js/script.js
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
<<<<<<< Updated upstream:project/src/main/resources/static/script.js

    // Tab click handlers
=======
>>>>>>> Stashed changes:project/src/main/resources/static/js/script.js
    authTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            switchTab(this.dataset.tab);
        });
    });

<<<<<<< Updated upstream:project/src/main/resources/static/script.js
    // =================== ĐĂNG NHẬP BẰNG API BACKEND ===================
    document.getElementById('loginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const submitBtn = this.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;

        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang xử lý...';
        submitBtn.disabled = true;

        // Lấy đúng tên trường theo backend!
        const cusEmail = document.getElementById('loginEmail').value;
        const cusPassword = document.getElementById('loginPassword').value;

        fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cusEmail, cusPassword })
        })
            .then(response => {
                if (!response.ok) throw new Error('Đăng nhập thất bại');
                return response.json();
            })
            .then(data => {
                try {
                    // Đăng nhập thành công: đổi giao diện
                    document.querySelector('.auth-buttons').style.display = 'none';
                    const userMenu = document.querySelector('.user-menu');
                    userMenu.style.display = 'flex';
                    userMenu.querySelector('.user-name').textContent = data.cusFullName || data.cusEmail || 'Người dùng';
                    showNotification('Đăng nhập thành công!', 'success');
                    closeModal.click();
                } catch (err) {
                    console.error('Lỗi xử lý giao diện sau đăng nhập:', err);
                    showNotification('Có lỗi khi xử lý giao diện sau khi đăng nhập!', 'error');
                }
            })
            .catch((err) => {
                console.error('Lỗi đăng nhập:', err);
                showNotification('Email hoặc mật khẩu không đúng hoặc tài khoản chưa kích hoạt!', 'error');
            })
            .finally(() => {
                submitBtn.innerHTML = '<span>Đăng nhập</span><i class="fas fa-arrow-right"></i>';
                submitBtn.disabled = false;
            });
    });

    // Đăng xuất
    document.querySelector('.logout-btn').addEventListener('click', function(e) {
        e.preventDefault();
        document.querySelector('.user-menu').style.display = 'none';
        document.querySelector('.auth-buttons').style.display = 'flex';
        showNotification('Đã đăng xuất!', 'success');
        clearLoginForm(); // Clear form đăng nhập khi logout
    });

    // =================== HẾT ĐĂNG NHẬP ===================

    document.getElementById('registerForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const submitBtn = this.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;

        // Show loading state
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang xử lý...';
        submitBtn.disabled = true;

        // Simulate API call
        setTimeout(() => {
            const name = document.getElementById('registerName').value;
            const email = document.getElementById('registerEmail').value;
            const password = document.getElementById('registerPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const agreeTerms = document.getElementById('agreeTerms').checked;

            // Validate passwords match
            if (password !== confirmPassword) {
                showNotification('Mật khẩu không khớp!', 'error');
                submitBtn.innerHTML = '<span>Đăng ký</span><i class="fas fa-arrow-right"></i>';
                submitBtn.disabled = false;
                return;
            }

            console.log('Register attempt:', { name, email, password, agreeTerms });

            // Show success message
            showNotification('Đăng ký thành công!', 'success');

            // Reset button
            submitBtn.innerHTML = '<span>Đăng ký</span><i class="fas fa-arrow-right"></i>';
            submitBtn.disabled = false;

            // Close modal
            closeModal.click();
        }, 1500);
    });

=======
>>>>>>> Stashed changes:project/src/main/resources/static/js/script.js
    // Social login buttons
    document.querySelectorAll('.social-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const provider = this.classList.contains('google') ? 'Google' : 'Facebook';
            showNotification(`Đang xử lý đăng nhập bằng ${provider}...`, 'info');
        });
    });

    // Mobile menu toggle
<<<<<<< Updated upstream:project/src/main/resources/static/script.js
    mobileMenuBtn.addEventListener('click', function() {
        nav.classList.toggle('active');
    });

    // Notification system
    function showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;

        document.body.appendChild(notification);

        // Trigger animation
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);

        // Remove notification after 3 seconds
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
=======
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

   // Notification dropdown functionality
   const notificationBtn = document.getElementById('notificationBtn');
   const notificationDropdown = document.getElementById('notificationDropdown');
   
   if (notificationBtn && notificationDropdown) {
       notificationBtn.addEventListener('click', function(e) {
           e.stopPropagation();
           notificationDropdown.classList.toggle('show');
       });

       // Close dropdown when clicking outside
       document.addEventListener('click', function(e) {
           if (!notificationDropdown.contains(e.target) && !notificationBtn.contains(e.target)) {
               notificationDropdown.classList.remove('show');
           }
       });

       // Handle notification item clicks
       document.querySelectorAll('.notification-dropdown-item').forEach(item => {
           item.addEventListener('click', function() {
               // Remove unread status
               this.classList.remove('unread');
               
               // Update notification badge count
               const badge = document.querySelector('.notification-badge');
               let count = parseInt(badge.textContent);
               if (count > 0) {
                   count--;
                   badge.textContent = count;
                   if (count === 0) {
                       badge.style.display = 'none';
                   }
               }
               
               // You can add more functionality here like navigating to specific pages
               console.log('Notification clicked:', this.querySelector('.notification-title').textContent);
           });
       });

       // Settings button in dropdown
       const settingsBtn = document.querySelector('.notification-settings-btn');
       if (settingsBtn) {
           settingsBtn.addEventListener('click', function(e) {
               e.stopPropagation();
               alert('Cài đặt thông báo sẽ được phát triển trong phiên bản tiếp theo!');
           });
       }

       // View all notifications link
       const viewAllBtn = document.querySelector('.view-all-notifications');
       if (viewAllBtn) {
           viewAllBtn.addEventListener('click', function(e) {
               e.preventDefault();
               alert('Trang xem tất cả thông báo sẽ được phát triển trong phiên bản tiếp theo!');
           });
       }
   }
>>>>>>> Stashed changes:project/src/main/resources/static/js/script.js

    // Auth Buttons Animation
    document.querySelectorAll('.btn-login, .btn-register').forEach(button => {
        button.addEventListener('click', function(e) {
<<<<<<< Updated upstream:project/src/main/resources/static/script.js
            // Create ripple effect
            const ripple = document.createElement('span');
            ripple.classList.add('ripple');
            this.appendChild(ripple);

            // Get position of click
=======
            const ripple = document.createElement('span');
            ripple.classList.add('ripple');
            this.appendChild(ripple);
>>>>>>> Stashed changes:project/src/main/resources/static/js/script.js
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
<<<<<<< Updated upstream:project/src/main/resources/static/script.js

            // Set ripple position and size
            ripple.style.width = ripple.style.height = `${size}px`;
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;

            // Remove ripple after animation
            setTimeout(() => {
                ripple.remove();
            }, 600);

            // Add fade effect to modal
            const modal = document.getElementById('authModal');
            modal.style.opacity = '0';
            modal.style.transform = 'scale(0.95)';

            // Show modal with animation
            setTimeout(() => {
                modal.classList.add('active');
                modal.style.opacity = '1';
                modal.style.transform = 'scale(1)';
            }, 50);
        });
    });
=======
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
     // Temperature Chart
     const ctx = document.getElementById('temperatureChart').getContext('2d');
     const temperatureChart = new Chart(ctx, {
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

     // Interactive features
     document.querySelectorAll('.action-item').forEach(item => {
         item.addEventListener('click', function () {
             const action = this.textContent.trim();
             alert(`Chức năng "${action}" sẽ được phát triển trong phiên bản tiếp theo!`);
         });
     });

     
     // Progress animation
     setTimeout(() => {
         document.querySelector('.progress-fill').style.width = '40%';
     }, 500);

     // Add hover effects to timeline days
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
     // User data loading được xử lý bởi script.js
>>>>>>> Stashed changes:project/src/main/resources/static/js/script.js
});