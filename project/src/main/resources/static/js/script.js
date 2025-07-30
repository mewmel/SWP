document.addEventListener('DOMContentLoaded', function () {
    // ========== GIỮ TRẠNG THÁI ĐĂNG NHẬP ==========
    const authButtons = document.querySelector('.auth-buttons');
    const userMenu = document.querySelector('.user-menu');
    const userNameSpan = document.querySelector('.user-name');
    const sidebarUsername = document.querySelector('.sidebar-username');
    const notificationWrapper = document.querySelector('.notification-wrapper');

    // Hiển thị đúng trạng thái đăng nhập khi load lại trang
    const fullName = localStorage.getItem('cusFullName');
    if (fullName) {
        if (authButtons) authButtons.style.display = 'none';
        if (userMenu) userMenu.style.display = 'flex';
        if (userNameSpan) userNameSpan.textContent = fullName;
        if (sidebarUsername) sidebarUsername.textContent = fullName;
        if (notificationWrapper) notificationWrapper.style.display = 'block';
    } else {
        if (authButtons) authButtons.style.display = 'flex';
        if (userMenu) userMenu.style.display = 'none';
        if (notificationWrapper) notificationWrapper.style.display = 'none';
    }

    // Kiểm tra và hiển thị thông báo đăng xuất
    const logoutMessage = localStorage.getItem('logoutMessage');
    if (logoutMessage) {
        setTimeout(() => {
            showNotification(logoutMessage, 'success');
            localStorage.removeItem('logoutMessage');
        }, 100);
    }

    // // ========== ĐĂNG NHẬP ==========
    // document.getElementById('loginForm').addEventListener('submit', function (e) {
    //     e.preventDefault();
    //     const submitBtn = this.querySelector('button[type="submit"]');
    //     submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang xử lý...';
    //     submitBtn.disabled = true;

    //     const cusEmail = document.getElementById('loginEmail').value;
    //     const cusPassword = document.getElementById('loginPassword').value;

    //     fetch('/api/auth/login', {
    //         method: 'POST',
    //         headers: { 'Content-Type': 'application/json' },
    //         body: JSON.stringify({ cusEmail, cusPassword })
    //     })
    //         .then(async response => {
    //             if (!response.ok) {
    //                 const errText = await response.text();
    //                 throw new Error(errText || 'Đăng nhập thất bại');
    //             }
    //             return response.json();
    //         })
    //         .then(data => {
    //             // Lưu tất cả trường từ data vào localStorage
    //             if (data && typeof data === 'object') {
    //                 Object.keys(data).forEach(key => {
    //                     if (data[key] !== undefined && data[key] !== null) {
    //                         localStorage.setItem(key, data[key]);
    //                     }
    //                 });
    //             }

    //             // Hiển thị giao diện đã đăng nhập
    //             if (authButtons) authButtons.style.display = 'none';
    //             if (userMenu) userMenu.style.display = 'flex';
    //             if (userNameSpan) userNameSpan.textContent = data.cusFullName || data.cusEmail || 'Người dùng';
    //             if (sidebarUsername) sidebarUsername.textContent = data.cusFullName || data.cusEmail || 'Người dùng';
    //             if (notificationWrapper) notificationWrapper.style.display = 'block';
    //             showNotification('Đăng nhập thành công!', 'success');
    //             const closeModal = document.querySelector('.close-modal');
    //             if (closeModal) closeModal.click();

    //             // Lưu role vào localStorage nếu có
    //             if (typeof selectedRole !== 'undefined' && selectedRole) {
    //                 localStorage.setItem('userRole', selectedRole);
    //             }

    //             window.location.href = "dashboard.html";
    //         })
    //         .catch((err) => {
    //             showNotification(
    //                 (err.message && err.message.startsWith('Invalid'))
    //                     ? err.message
    //                     : 'Email hoặc mật khẩu không đúng hoặc tài khoản chưa kích hoạt!',
    //                 'error'
    //             );
    //         })
    //         .finally(() => {
    //             submitBtn.innerHTML = '<span>Đăng nhập</span><i class="fas fa-arrow-right"></i>';
    //             submitBtn.disabled = false;
    //         });
    // });

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const submitBtn = this.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang xử lý...';
                submitBtn.disabled = true;
            }

            const cusEmail = document.getElementById('loginEmail')?.value;
            const cusPassword = document.getElementById('loginPassword')?.value;

            if (!cusEmail || !cusPassword) {
                showNotification('Vui lòng nhập đầy đủ email và mật khẩu!', 'error');
                if (submitBtn) {
                    submitBtn.innerHTML = '<span>Đăng nhập</span><i class="fas fa-arrow-right"></i>';
                    submitBtn.disabled = false;
                }
                return;
            }

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
                    // Tự động phát hiện role dựa trên field có trong response
                    let role = '';
                    let displayName = '';
                    let dashboardUrl = '';

                    if (data.cusId) {
                        // Customer
                        role = 'customer';
                        displayName = data.cusFullName || data.cusEmail || 'Khách hàng';
                        dashboardUrl = 'dashboard.html';
                    } else if (data.docId) {
                        // Doctor
                        role = 'doctor';
                        displayName = data.docFullName || data.docEmail || 'Bác sĩ';
                        dashboardUrl = 'bac-si-dashboard.html';
                    } else if (data.maId) {
                        // Manager - check roles
                        if (data.roles === 'admin') {
                            role = 'admin';
                            dashboardUrl = 'admin-dashboard.html';
                        } else {
                            role = 'manager';
                            dashboardUrl = 'manager-dashboard.html';
                        }
                        displayName = data.maFullName || data.maEmail || 'Quản lý';
                    }

                    // Lưu tất cả trường từ data vào localStorage + thêm role
                    if (data && typeof data === 'object') {
                        Object.keys(data).forEach(key => {
                            if (data[key] !== undefined && data[key] !== null) {
                                localStorage.setItem(key, data[key]);
                            }
                        });
                        localStorage.setItem('userRole', role);
                    }

                    // Hiển thị giao diện đã đăng nhập
                    if (authButtons) authButtons.style.display = 'none';
                    if (userMenu) userMenu.style.display = 'flex';
                    if (userNameSpan) userNameSpan.textContent = displayName;
                    if (sidebarUsername) sidebarUsername.textContent = displayName;
                    if (notificationWrapper) notificationWrapper.style.display = 'block';

                    showNotification('Đăng nhập thành công!', 'success');
                    const closeModal = document.querySelector('.close-modal');
                    if (closeModal) closeModal.click();

                    // Chuyển hướng
                    window.location.href = dashboardUrl;
                })
                .catch((err) => {
                    showNotification(
                        err.message || 'Email hoặc mật khẩu không đúng!',
                        'error'
                    );
                })
                .finally(() => {
                    if (submitBtn) {
                        submitBtn.innerHTML = '<span>Đăng nhập</span><i class="fas fa-arrow-right"></i>';
                        submitBtn.disabled = false;
                    }
                });
        });
    } else {
        console.log('LoginForm not found - probably not on main page');
    }

    // ========== ĐĂNG XUẤT ==========
    function clearAllLocalStorage() {
        localStorage.clear();
    }

    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function (e) {
            e.preventDefault();
            clearAllLocalStorage();
            localStorage.setItem('logoutMessage', 'Đã đăng xuất!');
            if (userMenu) userMenu.style.display = 'none';
            if (authButtons) authButtons.style.display = 'flex';
            if (notificationWrapper) notificationWrapper.style.display = 'none';
            closeSidebar();
            clearLoginForm();
            if (window.location.pathname !== '/index.html' && !window.location.pathname.endsWith('index.html') && window.location.pathname !== '/') {
                window.location.href = "index.html";
            } else {
                showNotification('Đã đăng xuất!', 'success');
                localStorage.removeItem('logoutMessage');
            }
        });
    }

    const sidebarLogout = document.querySelector('.sidebar-logout');
    if (sidebarLogout) {
        sidebarLogout.addEventListener('click', function (e) {
            e.preventDefault();
            clearAllLocalStorage();
            localStorage.setItem('logoutMessage', 'Đã đăng xuất!');
            if (userMenu) userMenu.style.display = 'none';
            if (authButtons) authButtons.style.display = 'flex';
            if (notificationWrapper) notificationWrapper.style.display = 'none';
            closeSidebar();
            clearLoginForm();
            window.location.href = "index.html";
        });
    }

    // ========= ĐĂNG KÝ GỌI API BACKEND =========
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const submitBtn = this.querySelector('button[type="submit"]');
            const agreeTerms = document.getElementById('agreeTerms');

            if (!agreeTerms || !agreeTerms.checked) {
                showNotification('Bạn phải đồng ý với điều khoản sử dụng trước khi đăng ký!', 'error');
                return;
            }

            const cusFullName = document.getElementById('registerName')?.value.trim();
            const cusEmail = document.getElementById('registerEmail')?.value.trim();
            const cusPhone = document.getElementById('registerPhone')?.value.trim();
            const cusDob = document.getElementById('registerDob')?.value;
            const cusPassword = document.getElementById('registerPassword')?.value;
            const confirmPassword = document.getElementById('confirmPassword')?.value;

            if (!selectedRole) {
                showNotification('Vui lòng chọn vai trò trước khi đăng ký!', 'error');
                return;
            }

            // Hàm kiểm tra tuổi
            function calculateAge(dobStr) {
                if (!dobStr) return 0;
                const dob = new Date(dobStr);
                const today = new Date();
                let age = today.getFullYear() - dob.getFullYear();
                const m = today.getMonth() - dob.getMonth();
                if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
                    age--;
                }
                return age;
            }

            // Validate fields
            let errorMsg = '';
            let errorField = null;
            if (!cusFullName) {
                errorMsg = "Vui lòng nhập họ tên.";
                errorField = document.getElementById('registerName');
            } else if (!cusEmail) {
                errorMsg = "Vui lòng nhập email.";
                errorField = document.getElementById('registerEmail');
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cusEmail)) {
                errorMsg = "Email không hợp lệ.";
                errorField = document.getElementById('registerEmail');
            } else if (!cusPhone) {
                errorMsg = "Vui lòng nhập số điện thoại.";
                errorField = document.getElementById('registerPhone');
            } else if (!/^(0|\+84)\d{9,10}$/.test(cusPhone)) {
                errorMsg = "Số điện thoại không hợp lệ.";
                errorField = document.getElementById('registerPhone');
            } else if (!cusDob) {
                errorMsg = "Vui lòng chọn ngày sinh.";
                errorField = document.getElementById('registerDob');
            } else if (calculateAge(cusDob) < 18) {
                errorMsg = "Bạn phải đủ 18 tuổi trở lên để đăng ký tài khoản!";
                errorField = document.getElementById('registerDob');
            } else if (!cusPassword) {
                errorMsg = "Vui lòng nhập mật khẩu.";
                errorField = document.getElementById('registerPassword');
            } else if (cusPassword.length < 6) {
                errorMsg = "Mật khẩu phải từ 6 ký tự trở lên.";
                errorField = document.getElementById('registerPassword');
            } else if (!confirmPassword) {
                errorMsg = "Vui lòng xác nhận mật khẩu.";
                errorField = document.getElementById('confirmPassword');
            } else if (cusPassword !== confirmPassword) {
                errorMsg = "Mật khẩu xác nhận không khớp.";
                errorField = document.getElementById('confirmPassword');
            }

            if (errorMsg) {
                showNotification(errorMsg, 'error');
                if (errorField) {
                    errorField.classList.add('error');
                    errorField.focus();
                }
                if (submitBtn) {
                    submitBtn.innerHTML = '<span>Đăng ký</span><i class="fas fa-arrow-right"></i>';
                    submitBtn.disabled = false;
                }
                return;
            }

            this.querySelectorAll('.error').forEach(el => el.classList.remove('error'));

            if (submitBtn) {
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang xử lý...';
                submitBtn.disabled = true;
            }

            fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    cusFullName,
                    cusEmail,
                    cusPhone,
                    cusDob,
                    cusPassword,
                    confirmPassword,
                    role: selectedRole
                })
            })
                .then(async response => {
                    const text = await response.text();
                    if (!response.ok) throw new Error(text || 'Đăng ký thất bại!');
                    return text;
                })
                .then(msg => {
                    // Đăng ký thành công => tự động đăng nhập
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
                            // Lưu tất cả field trả về từ backend vào localStorage
                            if (data && typeof data === 'object') {
                                Object.keys(data).forEach(key => {
                                    if (data[key] !== undefined && data[key] !== null) {
                                        localStorage.setItem(key, data[key]);
                                    }
                                });
                            }
                            // Lưu role nếu có
                            localStorage.setItem('userRole', selectedRole);
                            if (authButtons) authButtons.style.display = 'none';
                            if (userMenu) userMenu.style.display = 'flex';
                            if (userNameSpan) userNameSpan.textContent = data.cusFullName || data.cusEmail || 'Người dùng';
                            if (sidebarUsername) sidebarUsername.textContent = data.cusFullName || data.cusEmail || 'Người dùng';
                            if (notificationWrapper) notificationWrapper.style.display = 'block';
                            showNotification('Đăng ký và đăng nhập thành công!', 'success');
                            const closeModal = document.querySelector('.close-modal');
                            if (closeModal) closeModal.click();

                            window.location.href = "dashboard.html";
                        })
                        .catch(err => {
                            showNotification('Đăng ký thành công, nhưng đăng nhập tự động thất bại: ' + (err.message || ''), 'error');
                            if (submitBtn) {
                                submitBtn.innerHTML = '<span>Đăng ký</span><i class="fas fa-arrow-right"></i>';
                                submitBtn.disabled = false;
                            }
                        });

                })
                .catch(err => {
                    let message = err.message || 'Đăng ký thất bại!';
                    showNotification(message, 'error');
                    if (submitBtn) {
                        submitBtn.innerHTML = '<span>Đăng ký</span><i class="fas fa-arrow-right"></i>';
                        submitBtn.disabled = false;
                    }
                });
        });
    } else {
        console.log('RegisterForm not found - probably not on main page');
    }
    // ========== UI & HIỆU ỨNG KHÁC ==========
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
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
    window.addEventListener('scroll', function () {
        if (window.scrollY > scrollThreshold) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Form validation for all forms
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function (e) {
            let valid = true;
            const requiredFields = form.querySelectorAll('[required]');
            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    valid = false;
                    field.classList.add('error');
                } else {
                    field.classList.remove('error');
                }
            });
            const emailField = form.querySelector('input[type="email"]');
            if (emailField && emailField.value) {
                const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailPattern.test(emailField.value)) {
                    valid = false;
                    emailField.classList.add('error');
                }
            }
            if (!valid) {
                e.preventDefault();
                const errorMsg = document.createElement('div');
                errorMsg.className = 'error-message';
                errorMsg.textContent = 'Vui lòng điền đầy đủ tất cả các trường bắt buộc.';
                const existingError = form.querySelector('.error-message');
                if (existingError) existingError.remove();
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
        toggle.addEventListener('click', function () {
            const input = this.previousElementSibling;
            const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
            input.setAttribute('type', type);
            this.classList.toggle('fa-eye');
            this.classList.toggle('fa-eye-slash');
        });
    });

    // Các biến để chọn vai trò
    let selectedRole = null;
    const roleSelection = document.getElementById('roleSelection');
    const authSection = document.getElementById('authSection');
    const roleOptions = document.querySelectorAll('.role-option');
    const backToRoleBtn = document.getElementById('backToRole');
    const roleBadge = document.querySelector('.role-badge');

    // Xử lý sự kiện khi nhấn vào lựa chọn vai trò
    roleOptions.forEach(option => {
        option.addEventListener('click', function () {
            // Xóa class 'selected' khỏi tất cả các lựa chọn
            roleOptions.forEach(opt => opt.classList.remove('selected'));

            // Thêm class 'selected' vào lựa chọn được nhấn
            this.classList.add('selected');

            // Lưu lại vai trò đã chọn
            selectedRole = this.dataset.role;

            // Hiển thị phần đăng nhập sau một khoảng trễ nhỏ để UX mượt mà hơn
            setTimeout(() => {
                roleSelection.style.display = 'none';
                authSection.style.display = 'block';

                // Cập nhật huy hiệu vai trò
                updateRoleBadge();

                // Hiệu ứng hiện ra cho phần đăng nhập
                authSection.style.opacity = '0';
                authSection.style.transform = 'translateX(20px)';
                setTimeout(() => {
                    authSection.style.transition = 'all 0.3s ease';
                    authSection.style.opacity = '1';
                    authSection.style.transform = 'translateX(0)';
                }, 50);
            }, 300);
        });
    });

    // Quay lại bước chọn vai trò
    if (backToRoleBtn) {
        backToRoleBtn.addEventListener('click', function () {
            authSection.style.opacity = '0';
            authSection.style.transform = 'translateX(-20px)';

            setTimeout(() => {
                authSection.style.display = 'none';
                roleSelection.style.display = 'block';

                // Hiệu ứng hiện ra cho phần chọn vai trò
                roleSelection.style.opacity = '0';
                roleSelection.style.transform = 'translateX(-20px)';
                setTimeout(() => {
                    roleSelection.style.transition = 'all 0.3s ease';
                    roleSelection.style.opacity = '1';
                    roleSelection.style.transform = 'translateX(0)';
                }, 50);
            }, 300);
        });
    }

    // Hàm cập nhật huy hiệu vai trò
    function updateRoleBadge() {
        if (selectedRole && roleBadge) {
            const roleInfo = {
                customer: {
                    icon: 'fas fa-user',
                    text: 'Khách hàng'
                },
                doctor: {
                    icon: 'fas fa-user-md',
                    text: 'Bác sĩ'
                }
            };

            const info = roleInfo[selectedRole];
            roleBadge.innerHTML = `<i class="${info.icon}"></i> ${info.text}`;
        }
    }

    // Mở modal đăng nhập với hiệu ứng (được cập nhật để hiển thị phần chọn vai trò trước tiên)
    window.openAuthModal = function (type) {

        const authModal = document.getElementById('authModal');

        // THÊM NULL CHECK
        if (!authModal) {
            console.warn('AuthModal not found - probably not on main page');
            return; // Thoát function nếu không tìm thấy modal
        }

        authModal.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Đặt lại bước về chọn vai trò ban đầu
        selectedRole = null;
        roleOptions.forEach(opt => opt.classList.remove('selected'));
        authSection.style.display = 'none';
        roleSelection.style.display = 'block';

        // Hiệu ứng hiện ra cho phần chọn vai trò
        roleSelection.style.opacity = '0';
        roleSelection.style.transform = 'translateY(20px)';
        setTimeout(() => {
            roleSelection.style.transition = 'all 0.3s ease';
            roleSelection.style.opacity = '1';
            roleSelection.style.transform = 'translateY(0)';
        }, 100);

        if (type === 'login') {
            const submitBtn = document.querySelector('#loginForm button[type="submit"]');
            if (submitBtn) {
                submitBtn.innerHTML = '<span>Đăng nhập</span><i class="fas fa-arrow-right"></i>';
                submitBtn.disabled = false;
            }
        }

        if (type === 'register') {
            switchTab('register');
        } else {
            switchTab('login');
        }
    };

    // Close Modal with animation
    if (closeModal && authModal) {
        closeModal.addEventListener('click', function () {
            // Reset modal state
            authSection.style.display = 'none';
            roleSelection.style.display = 'block';
            selectedRole = null;
            roleOptions.forEach(opt => opt.classList.remove('selected'));

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

                // Reset role selection styles
                roleSelection.style.opacity = '';
                roleSelection.style.transform = '';
                authSection.style.opacity = '';
                authSection.style.transform = '';
            }, 300);
        });
        authModal.addEventListener('click', function (e) {
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
        tab.addEventListener('click', function () {
            switchTab(this.dataset.tab);
        });
    });

    // Social login buttons
    document.querySelectorAll('.social-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const provider = this.classList.contains('google') ? 'Google' : 'Facebook';
            showNotification(`Đang xử lý đăng nhập bằng ${provider}...`, 'info');
        });
    });

    // Mobile menu toggle
    if (mobileMenuBtn && nav) {
        mobileMenuBtn.addEventListener('click', function () {
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
    if (openSidebarBtn && sidebar) {
        openSidebarBtn.addEventListener('click', function (e) {
            // set tên vào sidebar mỗi lần mở
            const userNameTxt = document.querySelector('.user-name').textContent;
            document.querySelector('.sidebar-username').textContent = userNameTxt;
            sidebar.style.display = 'flex';
            setTimeout(() => {
                sidebar.classList.add('active');
            }, 10);
        });
    }
    if (closeSidebarBtn && sidebar) {
        closeSidebarBtn.addEventListener('click', function () {
            closeSidebar();
        });
    }
    // Đóng sidebar khi bấm ngoài
    document.addEventListener('mousedown', function (e) {
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
    if (sidebarAccount) {
        sidebarAccount.addEventListener('click', function (e) {
            e.preventDefault();
            window.location.href = "dashboard.html";
        });
    }

    // ============= NOTIFICATION DROPDOWN =============
    const notificationBtn = document.getElementById('notificationBtn');
    const notificationDropdown = document.getElementById('notificationDropdown');

    if (notificationBtn && notificationDropdown) {
        // Toggle dropdown khi click vào bell icon
        notificationBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            notificationDropdown.classList.toggle('show');
        });

        // Đóng dropdown khi click ra ngoài
        document.addEventListener('click', function (e) {
            if (!notificationDropdown.contains(e.target) && !notificationBtn.contains(e.target)) {
                notificationDropdown.classList.remove('show');
            }
        });

        // Đóng dropdown khi nhấn ESC
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') {
                notificationDropdown.classList.remove('show');
            }
        });

        // Xử lý click vào từng notification item
        document.querySelectorAll('.notification-dropdown-item').forEach(item => {
            item.addEventListener('click', function () {
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
            settingsBtn.addEventListener('click', function (e) {
                e.stopPropagation();
                showNotification('Cài đặt thông báo sẽ được phát triển trong phiên bản tiếp theo!', 'info');
            });
        }

        // Xử lý link "Xem tất cả thông báo"
        const viewAllBtn = document.querySelector('.view-all-notifications');
        if (viewAllBtn) {
            viewAllBtn.addEventListener('click', function (e) {
                e.preventDefault();
                notificationDropdown.classList.remove('show');
                showNotification('Trang xem tất cả thông báo sẽ được phát triển trong phiên bản tiếp theo!', 'info');

                // Có thể chuyển hướng đến trang thông báo chuyên dụng
                // window.location.href = 'thong-bao.html';
            });
        }

        // Function để thêm thông báo mới (cho demo hoặc real-time)
        window.addNewNotification = function (title, description, type = 'reminder', time = 'Vừa xong') {
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
                newNotification.addEventListener('click', function () {
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
        window.markAllNotificationsRead = function () {
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
        button.addEventListener('click', function (e) {
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
    window.testNotification = function () {
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


    // Xử lý popup lịch hẹn
    const appointmentLink = document.getElementById('appointmentLink');
    const appointmentModal = document.getElementById('appointmentModal');
    const closeAppointmentBtn = document.querySelector('.close-appointment-modal');

    // Mở popup khi click vào link lịch hẹn
    if (appointmentLink) {
        appointmentLink.addEventListener('click', function (e) {
            e.preventDefault();
            appointmentModal.style.display = 'block';
        });
    }

    // Đóng popup khi click vào nút close
    if (closeAppointmentBtn) {
        closeAppointmentBtn.addEventListener('click', function () {
            appointmentModal.style.display = 'none';
        });
    }

    // Đóng popup khi click ra ngoài
    window.addEventListener('click', function (e) {
        if (e.target == appointmentModal) {
            appointmentModal.style.display = 'none';
        }
    });

    // ============= DOCTORS SLIDER NAVIGATION =============
    const doctorsGrid = document.querySelector('.doctors-grid');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');

    if (doctorsGrid && prevBtn && nextBtn) {
        let currentIndex = 0;
        const totalCards = document.querySelectorAll('.doctor-card').length;
        const cardsPerView = 3; // Hiển thị 3 cards mỗi lần
        const maxIndex = Math.max(0, totalCards - cardsPerView);

        // Cập nhật trạng thái buttons
        function updateButtons() {
            prevBtn.disabled = currentIndex === 0;
            nextBtn.disabled = currentIndex >= maxIndex;
        }

        // Di chuyển slider
        function moveSlider() {
            const translateX = -(currentIndex * (100 / cardsPerView));
            doctorsGrid.style.transform = `translateX(${translateX}%)`;
        }

        // Event listeners cho navigation buttons
        nextBtn.addEventListener('click', function () {
            if (currentIndex < maxIndex) {
                currentIndex++;
                moveSlider();
                updateButtons();
            }
        });

        prevBtn.addEventListener('click', function () {
            if (currentIndex > 0) {
                currentIndex--;
                moveSlider();
                updateButtons();
            }
        });

        // Khởi tạo trạng thái ban đầu
        updateButtons();
    }
    
    // Lấy email user đã đăng nhập
    const userEmail = localStorage.getItem('cusEmail');
    if (userEmail) {
        fetch(`http://localhost:8080/api/customer/${encodeURIComponent(userEmail)}`)
            .then(res => res.json())
            .then(data => {
                console.log('API data:', data); // DEBUG
                if (data) {
                    const nameInput = document.getElementById('fullName');
                    const phoneInput = document.getElementById('phone');
                    const emailInput = document.getElementById('email');
                    const dobInput = document.getElementById('dob');
                    const addressInput = document.getElementById('address');
                    const occupationInput = document.getElementById('occupation');

                    if (nameInput) nameInput.value = data.cusFullName || '';
                    if (phoneInput) phoneInput.value = data.cusPhone || '';
                    if (emailInput) emailInput.value = data.cusEmail || '';
                    if (dobInput && data.cusDate) {
                        let dateStr = data.cusDate;
                        // Chuyển đổi nếu backend trả về dd/MM/yyyy hoặc dd-MM-yyyy
                        if (/^\d{2}[/\-]\d{2}[/\-]\d{4}$/.test(dateStr)) {
                            let [d, m, y] = dateStr.split(/[\/\-]/);
                            dateStr = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
                        }
                        dobInput.value = dateStr;
                    }
                    if (addressInput) addressInput.value = data.cusAddress || '';
                    if (occupationInput) occupationInput.value = data.cusOccupation || '';
                }
            })
            .catch(err => {
                console.log('Không tự động lấy được dữ liệu user:', err);
            });
    }

    // ============= FORGOT PASSWORD MODAL FUNCTIONALITY =============
    const forgotPasswordModal = document.getElementById('forgotPasswordModal');
    const forgotPasswordLink = document.querySelector('.forgot-password');
    const closeForgotModal = document.getElementById('closeForgotModal');

    // Open forgot password modal
    if (forgotPasswordLink && forgotPasswordModal) {
        forgotPasswordLink.addEventListener('click', function (e) {
            e.preventDefault();
            console.log('Forgot password link clicked');

            // Hide auth modal
            if (authModal) {
                authModal.classList.remove('active');
            }

            // Show forgot password modal
            if (forgotPasswordModal) {
                forgotPasswordModal.style.display = 'flex';
                setTimeout(() => {
                    forgotPasswordModal.classList.add('active');

                    // Add active class to the form
                    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
                    if (forgotPasswordForm) {
                        forgotPasswordForm.classList.add('active');
                        forgotPasswordForm.style.display = 'block'; // Force display
                        console.log('Forgot password form activated');
                    }
                }, 50);
                console.log('Forgot password modal displayed');
            } else {
                console.error('Forgot password modal not found');
            }
        });
    }

    // Close forgot password modal
    if (closeForgotModal) {
        closeForgotModal.addEventListener('click', function () {
            closeForgotPasswordModal();
        });
    }

    // Close modal when clicking outside
    if (forgotPasswordModal) {
        forgotPasswordModal.addEventListener('click', function (e) {
            if (e.target === forgotPasswordModal) {
                closeForgotPasswordModal();
            }
        });
    }

    // Setup send OTP button
    const sendOtpBtn = document.getElementById('sendOtpBtn');
    console.log('Send OTP button found:', sendOtpBtn);

    if (sendOtpBtn) {
        console.log('Adding click listener to send OTP button');
        sendOtpBtn.addEventListener('click', async function() {
            console.log('Send OTP button clicked!');
            const email = document.getElementById('forgotEmail').value.trim();
            const newPassword = document.getElementById('forgotNewPassword').value;
            const confirmPassword = document.getElementById('forgotConfirmPassword').value;

            // Validation
            if (!email) {
                showNotification('Vui lòng nhập email!', 'error');
                return;
            }

            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                showNotification('Email không hợp lệ!', 'error');
                return;
            }

            if (!newPassword) {
                showNotification('Vui lòng nhập mật khẩu mới!', 'error');
                return;
            }

            if (newPassword.length < 6) {
                showNotification('Mật khẩu phải có ít nhất 6 ký tự!', 'error');
                return;
            }

            if (!confirmPassword) {
                showNotification('Vui lòng xác nhận mật khẩu mới!', 'error');
                return;
            }

            if (newPassword !== confirmPassword) {
                showNotification('Mật khẩu xác nhận không khớp!', 'error');
                return;
            }

            sendOtpBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang gửi...';
            sendOtpBtn.disabled = true;

                                    try {
                            console.log('Making API call to send OTP...');
                            const response = await fetch('/api/forgot-password/send-otp', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email: email,
                        newPassword: newPassword
                    })
                });

                const result = await response.json();

                                            if (response.ok && result.success) {
                                console.log('OTP sent successfully:', result);
                                showNotification(result.message, 'success');
                                document.getElementById('forgotOtp').required = true;
                                document.getElementById('forgotOtp').focus();    
                                document.querySelector('.otp-note small').textContent = 'Mã OTP đã được gửi đến email của bạn';
                                sendOtpBtn.innerHTML = '<i class="fas fa-check"></i> Đã gửi';
                                sendOtpBtn.style.background = '#28a745';
                } else {
                    console.log('OTP send failed:', result);
                    showNotification(result.message || 'Không thể gửi OTP, vui lòng thử lại!', 'error');
                    sendOtpBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Gửi mã OTP';
                }
            } catch (error) {
                console.error('Error:', error);
                showNotification('Lỗi kết nối, vui lòng thử lại!', 'error');
                sendOtpBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Gửi mã OTP';
            } finally {
                sendOtpBtn.disabled = false;
            }
        });
    }

    function closeForgotPasswordModal() {
        console.log('Closing forgot password modal');
        if (forgotPasswordModal) {
            forgotPasswordModal.classList.remove('active');

            // Remove active class from form
            const forgotPasswordForm = document.getElementById('forgotPasswordForm');
            if (forgotPasswordForm) {
                forgotPasswordForm.classList.remove('active');
            }

            setTimeout(() => {
                forgotPasswordModal.style.display = 'none';
                resetForgotPasswordModal();
            }, 300);
        }
    }

    function resetForgotPasswordModal() {
        // Clear form
        const form = document.getElementById('forgotPasswordForm');
        if (form) {
            form.reset();
        }

        // Reset button state
        const submitBtn = document.getElementById('submitBtn');
        if (submitBtn) {
            submitBtn.innerHTML = '<span>Gửi mã OTP</span><i class="fas fa-paper-plane"></i>';
            submitBtn.setAttribute('data-otp-sent', 'false');
        }

        // Reset OTP field
        const otpInput = document.getElementById('forgotOtp');
        if (otpInput) {
            otpInput.required = false;
        }

        // Reset OTP note
        const otpNote = document.querySelector('.otp-note small');
        if (otpNote) {
            otpNote.textContent = 'Mã OTP sẽ được gửi đến email của bạn';
        }

        // Reset send OTP button
        const sendOtpBtn = document.getElementById('sendOtpBtn');
        if (sendOtpBtn) {
            sendOtpBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Gửi mã OTP';
            sendOtpBtn.style.background = '';
            sendOtpBtn.disabled = false;
        }
    }

    // Navigation button
    const backToLogin = document.getElementById('backToLogin');

    if (backToLogin) {
        backToLogin.addEventListener('click', function () {
            console.log('Back to login clicked');
            closeForgotPasswordModal();
            if (authModal) {
                authModal.style.display = 'flex';
                setTimeout(() => {
                    authModal.classList.add('active');
                }, 50);
            }
        });
    }

                    // Main forgot password form
                const forgotPasswordForm = document.getElementById('forgotPasswordForm');
                if (forgotPasswordForm) {
                    forgotPasswordForm.addEventListener('submit', async function (e) {
                        e.preventDefault();
                        const email = document.getElementById('forgotEmail').value.trim();
                        const newPassword = document.getElementById('forgotNewPassword').value;
                        const confirmPassword = document.getElementById('forgotConfirmPassword').value;
                        const otp = document.getElementById('forgotOtp').value.trim();

                        // Validation
                        if (!email) {
                            showNotification('Vui lòng nhập email!', 'error');
                            return;
                        }

                        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                            showNotification('Email không hợp lệ!', 'error');
                            return;
                        }

                        if (!newPassword) {
                            showNotification('Vui lòng nhập mật khẩu mới!', 'error');
                            return;
                        }

                        if (newPassword.length < 6) {
                            showNotification('Mật khẩu phải có ít nhất 6 ký tự!', 'error');
                            return;
                        }

                        if (!confirmPassword) {
                            showNotification('Vui lòng xác nhận mật khẩu mới!', 'error');
                            return;
                        }

                        if (newPassword !== confirmPassword) {
                            showNotification('Mật khẩu xác nhận không khớp!', 'error');
                            return;
                        }

                        if (!otp) {
                            showNotification('Vui lòng nhập mã OTP!', 'error');
                            return;
                        }

                        if (!/^\d{6}$/.test(otp)) {
                            showNotification('Mã OTP phải là 6 chữ số!', 'error');
                            return;
                        }

                        const submitBtn = document.getElementById('submitBtn');
                        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang xử lý...';
                        submitBtn.disabled = true;

                        try {
                            // Đặt lại mật khẩu với OTP
                            const response = await fetch('/api/forgot-password/reset-password', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                    email: email,
                                    newPassword: newPassword,
                                    otp: otp
                                })
                            });

                            const result = await response.json();

                            if (response.ok && result.success) {
                                showNotification(result.message, 'success');

                                // Close forgot password modal and open login
                                closeForgotPasswordModal();
                                setTimeout(() => {
                                    authModal.classList.add('active');
                                }, 300);

                                // Reset form
                                forgotPasswordForm.reset();
                                resetForgotPasswordModal();
                            } else {
                                showNotification(result.message || 'Đặt lại mật khẩu thất bại!', 'error');
                            }
                        } catch (error) {
                            console.error('Error:', error);
                            showNotification('Lỗi kết nối, vui lòng thử lại!', 'error');
                        } finally {
                            submitBtn.disabled = false;
                        }
                    });
                }



    // Auto-format OTP input
    const otpInput = document.getElementById('forgotOtp');
    if (otpInput) {
        otpInput.addEventListener('input', function (e) {
            // Only allow numbers
            this.value = this.value.replace(/[^0-9]/g, '');
        });

        otpInput.addEventListener('keydown', function (e) {
            // Allow backspace, delete, tab, escape, enter
            if ([8, 9, 27, 13, 46].indexOf(e.keyCode) !== -1 ||
                // Allow Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
                (e.keyCode === 65 && e.ctrlKey === true) ||
                (e.keyCode === 67 && e.ctrlKey === true) ||
                (e.keyCode === 86 && e.ctrlKey === true) ||
                (e.keyCode === 88 && e.ctrlKey === true)) {
                return;
            }
            // Ensure that it is a number and stop the keypress
            if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
                e.preventDefault();
            }
        });
    }



    // ============= Xem chi tiết bác sĩ =============
    (function() {
        function createDoctorDetailModal() {
            if (!document.getElementById('doctorDetailModal')) {
                const modal = document.createElement('div');
                modal.id = 'doctorDetailModal';
                modal.className = 'modal doctor-modal';
                modal.innerHTML = `
                    <div class="modal-content doctor-modal-content">
                        <button class="doctor-modal-close" onclick="closeDoctorDetailModal()" aria-label="Đóng"><i class="fas fa-times"></i></button>
                        <div id="doctorDetailContent"></div>
                    </div>
                `;
                document.body.appendChild(modal);
            }
        }
        window.closeDoctorDetailModal = function() {
            document.getElementById('doctorDetailModal').classList.remove('show');
            document.body.style.overflow = '';
        }
        function attachDoctorDetailEvents() {
            document.querySelectorAll('.doctor-profile').forEach(btn => {
                btn.onclick = function(e) {
                    e.preventDefault();
                    const card = btn.closest('.doctor-card');
                    if (!card) return;
                    const name = card.querySelector('h3')?.textContent.trim() || '';
                    const imgSrc = card.querySelector('img')?.getAttribute('src') || 'img/doctor1.png';
                    const title = card.querySelector('.doctor-title')?.textContent || '';
                    const specialty = card.querySelector('.doctor-specialty')?.textContent || '';
                    const doctorData = {
                        'Bác sĩ Trương Quốc Lập': {
                            degree: 'Bác sĩ Chuyên khoa I Sản Phụ khoa',
                            profileDescription: 'Bác sĩ Trương Quốc Lập có 8 năm kinh nghiệm trong lĩnh vực IUI, đã hỗ trợ thành công nhiều cặp vợ chồng trên toàn quốc.'
                        },
                        'Bác sĩ Nguyễn N. Kh. Linh': {
                            degree: 'Tiến sĩ Sản Phụ khoa',
                            profileDescription: 'Tiến sĩ Nguyễn Ngọc Khánh Linh là chuyên gia về kiểm soát chất lượng phôi và thụ tinh trong ống nghiệm, với hơn 12 năm công tác tại các trung tâm sinh sản hàng đầu.'
                        },
                        'Bác sĩ Tất Vĩnh Hùng': {
                            degree: 'Thạc sĩ Sản Phụ khoa',
                            profileDescription: 'Bác sĩ Tất Vĩnh Hùng có hơn 10 năm kinh nghiệm điều trị vô sinh – hiếm muộn, chuyên sâu về IVF tại các trung tâm hàng đầu.'
                        },
                        'Bác sĩ Phạm Thị Hồng Anh': {
                            degree: 'Bác sĩ Chuyên khoa II Sản Phụ khoa',
                            profileDescription: 'Bác sĩ Phạm Thị Hồng Anh là chuyên gia về thụ tinh trong ống nghiệm và hỗ trợ sinh sản, với 7 năm kinh nghiệm tại các trung tâm hỗ trợ sinh sản uy tín.'
                        },
                        'Bác sĩ Lê Minh Đức': {
                            degree: 'Thạc sĩ Sản Phụ khoa',
                            profileDescription: 'Bác sĩ Lê Minh Đức chuyên sâu về điều trị vô sinh – hiếm muộn và hỗ trợ sinh sản, với 5 năm kinh nghiệm làm việc tại các bệnh viện đầu ngành.'
                        },
                        'Bác sĩ Trần Thị Tú': {
                            degree: 'Tiến sĩ Sinh học Phôi',
                            profileDescription: 'Bác sĩ Trần Thị Tú là chuyên gia về kiểm soát chất lượng phôi và thụ tinh trong ống nghiệm, với hơn 8 năm kinh nghiệm tại các trung tâm hàng đầu.'
                        }
                    };
                    const info = doctorData[name] || { degree: 'Đang cập nhật', profileDescription: 'Đang cập nhật...' };
                    document.getElementById('doctorDetailContent').innerHTML = `
                        <img class="doctor-modal-avatar" src="${imgSrc}" alt="${name}">
                        <div class="doctor-modal-name">${name}</div>
                        <div class="doctor-modal-title"><i class="fas fa-user-md"></i> ${title}</div>
                        <div class="doctor-modal-specialty"><i class="fas fa-stethoscope"></i> ${specialty}</div>
                        <div class="doctor-modal-degree"><i class="fas fa-graduation-cap"></i> ${info.degree}</div>
                        <div class="doctor-modal-profile"><i class="fas fa-info-circle"></i> ${info.profileDescription}</div>
                    `;
                    document.getElementById('doctorDetailModal').classList.add('show');
                    document.body.style.overflow = 'hidden';
                }
            });
        }
        function initDoctorModalFeature() {
            createDoctorDetailModal();
            attachDoctorDetailEvents();
            
            // Đóng popup khi bấm ra ngoài modal-content
            const modal = document.getElementById('doctorDetailModal');
            if (modal) {
                modal.addEventListener('mousedown', function(e) {
                    if (e.target === modal) {
                        closeDoctorDetailModal();
                    }
                });
            }
        }
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initDoctorModalFeature);
        } else {
            initDoctorModalFeature();
        }
    })();

    // ======= BLOG: Chuyển sang trang chi tiết khi bấm Đọc thêm =======
    document.addEventListener('DOMContentLoaded', function() {
        document.querySelectorAll('.read-more').forEach(function(btn, idx) {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                // Mặc định demo: id bài viết là idx+1 (nếu bạn có id thực tế thì lấy từ data)
                window.location.href = 'blog-detail.html?id=' + (idx+1);
            });
        });
    });

    // ====== Lọc dịch vụ theo danh mục cho bảng giá (fix: chỉ chạy trên trang bảng giá) ======
    (function() {
        // Chỉ chạy nếu có phần tử filter và tbody
        const filter = document.getElementById('categoryFilter');
        const tbody = document.getElementById('subservice-table-body');
        if (!filter || !tbody) return;

        // Lưu lại HTML gốc của tbody
        const originalHTML = tbody.innerHTML;

        filter.addEventListener('change', function() {
            const selected = filter.value;
            tbody.innerHTML = originalHTML;
            if (!selected) return;
            // Lọc các dòng theo danh mục
            const rows = Array.from(tbody.querySelectorAll('tr'));
            rows.forEach(row => {
                const category = row.children[1]?.textContent.trim();
                if (category !== selected) {
                    row.style.display = 'none';
                } else {
                    row.style.display = '';
                }
            });
        });
    })();

    // Mở Gmail web khi bấm icon mail
    var gmailBtn = document.getElementById('gmail-link');
    if (gmailBtn) {
        gmailBtn.addEventListener('click', function(e) {
            e.preventDefault();
            try {
                var email = 'fertilityehr@gmail.com';
                var subject = encodeURIComponent('Liên hệ FertilityEHR');
                var body = encodeURIComponent('Xin chào FertilityEHR,\n\n');
                var gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${subject}&body=${body}`;
                
                var newWindow = window.open(gmailUrl, '_blank');
                if (!newWindow || newWindow.closed || typeof newWindow.closed == 'undefined') {
                    // Fallback nếu popup bị chặn
                    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
                    showNotification('Đang mở ứng dụng email mặc định...', 'info');
                } else {
                    showNotification('Đang mở Gmail...', 'success');
                }
            } catch (error) {
                console.error('Gmail error:', error);
                showNotification('Không thể mở Gmail. Vui lòng thử lại!', 'error');
            }
        });
    }
    
    // Mở Instagram web khi bấm icon Instagram
    var instagramBtn = document.getElementById('instagram-link');
    if (instagramBtn) {
        instagramBtn.addEventListener('click', function(e) {
            e.preventDefault();
            try {
                var instagramUrl = `https://www.instagram.com/fert.ilityehr?igsh=Nzk1bmRsa3hnNXh4&utm_source=qr`;
                
                var newWindow = window.open(instagramUrl, '_blank');
                if (!newWindow || newWindow.closed || typeof newWindow.closed == 'undefined') {
                    // Fallback nếu popup bị chặn
                    window.location.href = instagramUrl;
                } else {
                    showNotification('Đang mở Instagram...', 'success');
                }
            } catch (error) {
                console.error('Instagram error:', error);
                showNotification('Không thể mở Instagram. Vui lòng thử lại!', 'error');
            }
        });
    }

});