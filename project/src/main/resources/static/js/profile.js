document.addEventListener('DOMContentLoaded', function() {
    // Khai báo các input trong form chỉnh sửa hồ sơ
    const nameInput = document.querySelector('.info-hoten');
    const dobInput = document.getElementById('dob') || document.querySelector('.info-ngaysinh');
    const phoneInput = document.getElementById('phone') || document.querySelector('.info-phone');
    const emailInput = document.getElementById('email') || document.querySelector('.info-email');
    const jobInput = document.querySelector('.info-nghenghiep');
    const addressInput = document.querySelector('.info-address');
    const emergencyInput = document.querySelector('.info-khan-cap');
    const genderRadios = document.querySelectorAll('input[name="gender"]');
    const sidebarUsername = document.querySelector('.sidebar-username');
    const userNameSpan = document.querySelector('.user-name');

    // Lấy email đã login từ localStorage (dùng key chuẩn là cusEmail)
    const userEmail = localStorage.getItem('cusEmail');
    let cusId = null;

// --- CHỨC NĂNG CHUYỂN ĐỔI TAB ---
const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

// Hàm chuyển đổi tab
function switchTab(targetTab) {
    // Xóa class active khỏi tất cả tab buttons
    tabButtons.forEach(btn => btn.classList.remove('active'));
    
    // Xóa class active khỏi tất cả tab contents
    tabContents.forEach(content => content.classList.remove('active'));
    
    // Thêm class active cho tab button được click
    const activeButton = document.querySelector(`.tab-btn[data-tab="${targetTab}"]`);
    if (activeButton) {
        activeButton.classList.add('active');
    }
    
    // Hiển thị tab content tương ứng
    const activeContent = document.getElementById(targetTab);
    if (activeContent) {
        activeContent.classList.add('active');
    }
}

// Thêm event listener cho tất cả tab buttons
tabButtons.forEach(button => {
    button.addEventListener('click', function(e) {
        e.preventDefault();
        const targetTab = this.getAttribute('data-tab');
        switchTab(targetTab);
    });
});



    // --- HIỂN THÔNG TIN NGƯỜI DÙNG LÊN FORM ---
    if (userEmail) {
        fetch(`http://localhost:8080/api/customer/${encodeURIComponent(userEmail)}`)
            .then(res => res.json())
            .then(data => {
                cusId = data.cusId;
                if (nameInput) nameInput.value = data.cusFullName || '';
                if (dobInput && data.cusDate) {
                    // Chuyển đổi ngày sang định dạng yyyy-MM-dd cho input type="date"
                    let dateStr = data.cusDate;
                    if (/^\d{2}[/\-]\d{2}[/\-]\d{4}$/.test(dateStr)) {
                        let [d, m, y] = dateStr.split(/[\/\-]/);
                        dateStr = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
                    }
                    dobInput.value = dateStr;
                }
                if (phoneInput) phoneInput.value = data.cusPhone || '';
                if (emailInput) emailInput.value = data.cusEmail || '';
                if (jobInput) jobInput.value = data.cusOccupation || '';
                if (addressInput) addressInput.value = data.cusAddress || '';
                if (emergencyInput) emergencyInput.value = data.emergencyContact || '';
                // Hiển thị giới tính
                if (genderRadios && genderRadios.length) {
                    genderRadios.forEach(radio => {
                        if (
                            (radio.value === 'nam' && data.cusGender === 'M') ||
                            (radio.value === 'nu' && data.cusGender === 'F')
                        ) {
                            radio.checked = true;
                        }
                    });
                }
                // Cập nhật tên sidebar/menu
                if (userNameSpan) userNameSpan.textContent = data.cusFullName || '';
                if (sidebarUsername) sidebarUsername.textContent = data.cusFullName || '';
                // Đồng bộ localStorage (nếu cần)
                localStorage.setItem('cusId', data.cusId || '');
                localStorage.setItem('cusFullName', data.cusFullName || '');
                localStorage.setItem('cusEmail', data.cusEmail || '');
                localStorage.setItem('cusPhone', data.cusPhone || '');
                localStorage.setItem('cusDate', data.cusDate || '');
                localStorage.setItem('cusAddress', data.cusAddress || '');
                localStorage.setItem('cusOccupation', data.cusOccupation || '');
                localStorage.setItem('cusGender', data.cusGender || '');
                localStorage.setItem('emergencyContact', data.emergencyContact || '');
            })
            .catch(() => {
                showNotification('Không lấy được thông tin hồ sơ!', 'error');
            });
    }

    // --- CHỨC NĂNG ĐỔI MẬT KHẨU ---
    // 1. Lấy phần tử
    const currentInput = document.getElementById("currentPassword");
    const verifyBtn = document.getElementById("btnVerifyPassword");
    const currentStep = document.getElementById("currentPasswordStep");
    const changePasswordForm = document.getElementById("changePasswordForm");
    const backBtn = document.getElementById("btnBackToStep1");
    const otpInput = document.getElementById("otpCode");
    const newPassInput = document.getElementById("newPassword");
    const confirmInput = document.getElementById("confirmNewPassword");

    let currentPasswordCache = "";

    // Hàm chuyển đổi giữa các bước
    function showStep1() {
        currentStep.style.display = "block";
        changePasswordForm.style.display = "none";
    }

    function showStep2() {
        currentStep.style.display = "none";
        changePasswordForm.style.display = "block";
    }

    // Bước 1: xác thực mật khẩu cũ và gửi OTP
    if (verifyBtn) {
        verifyBtn.addEventListener("click", async () => {
            const current = currentInput.value.trim();
            if (!current) {
                showNotification("Vui lòng nhập mật khẩu hiện tại!", "error");
                return;
            }

            const cusId = localStorage.getItem("cusId");
            const email = localStorage.getItem("cusEmail");
            if (!cusId || !email) {
                showNotification("Không tìm thấy thông tin người dùng!", "error");
                return;
            }

            // Disable button và show loading
            verifyBtn.disabled = true;
            verifyBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang xử lý...';

            try {
                // 1.1 verify mật khẩu cũ
                let res = await fetch(`/api/auth/${cusId}/verify-cus-password`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ currentPassword: current })
                });
                
                if (!res.ok) {
                    const msg = await res.text();
                    showNotification(msg || "Mật khẩu hiện tại không đúng!", "error");
                    return;
                }

                // 1.2 gọi API đổi-password với otp=null để trigger gửi mail
                res = await fetch(`/api/auth/${email}/change-cus-password`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        currentPassword: current,
                        newPassword: "",  // bất kỳ, vì service chỉ check otp
                        otp: null
                    })
                });
                
                const text = await res.text();
                if (!res.ok || text !== "OTP_SENT") {
                    showNotification(text || "Không thể gửi OTP, thử lại sau!", "error");
                    return;
                }

                // 1.3 hiển thị form đổi mật khẩu
                currentPasswordCache = current;
                showStep2();
                showNotification("Mã OTP đã được gửi đến email của bạn.", "success");
                
            } catch (err) {
                console.error(err);
                showNotification("Lỗi kết nối tới máy chủ!", "error");
            } finally {
                // Reset button
                verifyBtn.disabled = false;
                verifyBtn.innerHTML = 'Tiếp tục';
            }
        });
    }

    // Nút quay lại bước 1
    if (backBtn) {
        backBtn.addEventListener("click", () => {
            showStep1();
            changePasswordForm.reset();
            currentPasswordCache = "";
        });
    }

    // Bước 2: submit form đổi mật khẩu
    if (changePasswordForm) {
        changePasswordForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const otp = otpInput.value.trim();
            const newPass = newPassInput.value.trim();
            const conf = confirmInput.value.trim();
            const email = localStorage.getItem("cusEmail");

            if (!otp || !newPass || !conf) {
                showNotification("Vui lòng nhập đầy đủ OTP và mật khẩu mới!", "error");
                return;
            }
            if (newPass !== conf) {
                showNotification("Mật khẩu mới không khớp!", "error");
                return;
            }

            // Disable submit button
            const submitBtn = changePasswordForm.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang đổi mật khẩu...';
            }

            try {
                const res = await fetch(`/api/auth/${email}/change-cus-password`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        currentPassword: currentPasswordCache,
                        newPassword: newPass,
                        otp: otp
                    })
                });
                
                const text = await res.text();

                if (res.ok) {
                    showNotification("Đổi mật khẩu thành công!", "success");
                    showStep1();
                    currentInput.value = "";
                    changePasswordForm.reset();
                    currentPasswordCache = "";
                } else {
                    showNotification(text || "Đổi mật khẩu thất bại!", "error");
                }
            } catch (err) {
                console.error(err);
                showNotification("Lỗi kết nối tới máy chủ!", "error");
            } finally {
                // Reset submit button
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = '<i class="fas fa-key"></i> Đổi mật khẩu';
                }
            }
        });
    }


    // --- UPDATE DỮ LIỆU KHI LƯU ---
    const saveBtn = document.querySelector('.btn.btn-primary');
    if (saveBtn) {
        saveBtn.addEventListener('click', function(e) {
                e.preventDefault();
            const currentCusId = cusId || localStorage.getItem('cusId');
            if (!currentCusId) {
                showNotification('Không xác định được người dùng. Vui lòng đăng nhập lại!', 'error');
                return;
            }
            let genderValue = '';
            if (genderRadios && genderRadios.length) {
                genderRadios.forEach(radio => {
                    if (radio.checked) {
                        genderValue = (radio.value === 'nam') ? 'M' : (radio.value === 'nu') ? 'F' : '';
                    }
                });
            }
            const dataUpdate = {
                cusFullName: nameInput ? nameInput.value.trim() : "",
                cusGender: genderValue,
                cusDate: dobInput ? dobInput.value : "",
                cusPhone: phoneInput ? phoneInput.value.trim() : "",
                cusEmail: emailInput ? emailInput.value.trim() : "", // có thể cho update email nếu backend cho phép
                cusOccupation: jobInput ? jobInput.value.trim() : "",
                cusAddress: addressInput ? addressInput.value.trim() : "",
                emergencyContact: emergencyInput ? emergencyInput.value.trim() : ""
            };
            fetch(`http://localhost:8080/api/customer/${currentCusId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataUpdate)
            })
                .then(async res => {
                    if (!res.ok) throw new Error(await res.text());
                    return res.json();
                })
                .then(updated => {
                    // Cập nhật lại tên menu/sidebar
                    if (userNameSpan) userNameSpan.textContent = updated.cusFullName || '';
                    if (sidebarUsername) sidebarUsername.textContent = updated.cusFullName || '';
                    // Đồng bộ lại localStorage với thông tin mới nhất
                    if (updated && typeof updated === 'object') {
                        Object.keys(updated).forEach(key => {
                            if (updated[key] !== undefined && updated[key] !== null) {
                                localStorage.setItem(key, updated[key]);
                            }
                        });
                    }
                    showNotification('Thông tin đã được lưu thành công!', 'success');
                })
                .catch(err => {
                    showNotification('Cập nhật hồ sơ thất bại: ' + err.message, 'error');
                });
        });
    }
});

// Hàm hiển thị thông báo đẹp thay thế alert
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `profile-notification ${type}`;
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
// CSS đã được chuyển sang styles.css
// Add notification styles
const style = document.createElement('style');
style.textContent = `
         .profile-notification {
             position: fixed;
             top: 20px;
             right: 20px;
             padding: 15px 25px;
             border-radius: 8px;
             color: white;
             font-weight: 500;
             opacity: 0;
             transform: translateX(120%);
             transition: all 0.3s ease;
             z-index: 99999;
             max-width: 350px;
             word-wrap: break-word;
             box-shadow: 0 4px 12px rgba(0,0,0,0.15);
         }
         .profile-notification.show {
             opacity: 1;
             transform: translateX(0);
         }
         .profile-notification.success {
             background: linear-gradient(135deg, #2ecc71, #27ae60);
         }
         .profile-notification.error {
             background: linear-gradient(135deg, #e74c3c, #c0392b);
         }
         .profile-notification.warning {
             background: linear-gradient(135deg, #f39c12, #e67e22);
         }
         .profile-notification.info {
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
// CSS đã được chuyển sang styles.css