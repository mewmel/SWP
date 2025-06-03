// Wait for the DOM to fully load
document.addEventListener('DOMContentLoaded', function() {
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

    // Add fixed header class on scroll
    const header = document.querySelector('header');
    const scrollThreshold = 100;

    window.addEventListener('scroll', function() {
        if(window.scrollY > scrollThreshold) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

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
            
            // Email validation if there's an email field
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
                
                // Show error message
                const errorMsg = document.createElement('div');
                errorMsg.className = 'error-message';
                errorMsg.textContent = 'Vui lòng điền đầy đủ tất cả các trường bắt buộc.';
                
                // Check if error message already exists
                const existingError = form.querySelector('.error-message');
                if(existingError) {
                    existingError.remove();
                }
                
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
        
        // Add entrance animation to form elements
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
        
        // Switch to the correct tab
        if (type === 'register') {
            switchTab('register');
        } else {
            switchTab('login');
        }
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
        const currentForm = document.querySelector('.auth-form.active');
        if (currentForm) {
            currentForm.style.opacity = '0';
            currentForm.style.transform = 'translateX(-20px)';
        }
        
        // Update tabs
        authTabs.forEach(tab => {
            if (tab.dataset.tab === tabName) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });
        
        // Show new form with animation
        setTimeout(() => {
            authForms.forEach(form => {
                if (form.id === tabName + 'Form') {
                    form.classList.add('active');
                    form.style.opacity = '0';
                    form.style.transform = 'translateX(20px)';
                    
                    // Animate form elements
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
                    
                    // Fade in form
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

    // Tab click handlers
    authTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            switchTab(this.dataset.tab);
        });
    });

    // Form submission handlers with loading state
    document.getElementById('loginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const submitBtn = this.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        // Show loading state
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang xử lý...';
        submitBtn.disabled = true;
        
        // Simulate API call
        setTimeout(() => {
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            const rememberMe = document.getElementById('rememberMe').checked;
            
            console.log('Login attempt:', { email, password, rememberMe });
            
            // Show success message
            showNotification('Đăng nhập thành công!', 'success');
            
            // Reset button
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            
            // Close modal
            closeModal.click();
        }, 1500);
    });

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
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                return;
            }
            
            console.log('Register attempt:', { name, email, password, agreeTerms });
            
            // Show success message
            showNotification('Đăng ký thành công!', 'success');
            
            // Reset button
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            
            // Close modal
            closeModal.click();
        }, 1500);
    });

    // Social login buttons
    document.querySelectorAll('.social-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const provider = this.classList.contains('google') ? 'Google' : 'Facebook';
            showNotification(`Đang xử lý đăng nhập bằng ${provider}...`, 'info');
        });
    });

    // Mobile menu toggle
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

    // Auth Buttons Animation
    document.querySelectorAll('.btn-login, .btn-register').forEach(button => {
        button.addEventListener('click', function(e) {
            // Create ripple effect
            const ripple = document.createElement('span');
            ripple.classList.add('ripple');
            this.appendChild(ripple);

            // Get position of click
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;

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
}); 