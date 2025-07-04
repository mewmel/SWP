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
    const currentInput = document.getElementById("currentPassword");
    const newGroup = document.getElementById("newPasswordGroup");
    const verifyBtn = document.getElementById("btnVerify");
    const changeBtn = document.getElementById("btnChange");

    let currentPasswordCache = ""; // Lưu tạm để gửi kèm khi đổi

    // Bước 1: Xác thực mật khẩu hiện tại
    verifyBtn.addEventListener("click", async () => {
        const currentPassword = currentInput.value.trim();
        if (!currentPassword) return showNotification("Vui lòng nhập mật khẩu hiện tại!", 'warning');
        // LẤY ID CUSTOMER
        const cusId = localStorage.getItem('cusId');
        if (!cusId) return showNotification("Không tìm thấy thông tin người dùng!", 'error');

        try {
            const res = await fetch(`/api/auth/${cusId}/verify-cus-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ currentPassword })
            });

            if (res.ok) {
                currentPasswordCache = currentPassword;          // Lưu lại
                document.getElementById("currentPasswordGroup").style.display = "none";
                newGroup.style.display = "block";                // Mở form mới
                showNotification("Mật khẩu đã được xác thực!", 'success');
            } else {
                const errorMsg = await res.text();
                showNotification(errorMsg || "Mật khẩu hiện tại không đúng!", 'error');
            }
        } catch (err) {
            console.error(err);
            showNotification("Không thể kết nối tới máy chủ!", 'error');
        }
    });

    // Bước 2: Gửi mật khẩu mới
    changeBtn.addEventListener("click", async () => {
        const newPassword = document.getElementById("newPassword").value.trim();
        const confirm = document.getElementById("changeConfirmPassword").value.trim();

        if (!newPassword || !confirm) return showNotification("Vui lòng nhập đủ hai ô!", 'warning');
        if (newPassword !== confirm) return showNotification("Mật khẩu mới không khớp!", 'warning');

        // LẤY ID CUSTOMER
        const cusId = localStorage.getItem('cusId');
        if (!cusId) return showNotification("Không tìm thấy thông tin người dùng!", 'error');

        try {
            // SỬA: Thêm cusId vào đường dẫn
            const res = await fetch(`/api/auth/${cusId}/change-cus-password`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    currentPassword: currentPasswordCache,
                    newPassword: newPassword
                })
            });

            if (res.ok) {
                showNotification("Đổi mật khẩu thành công!", 'success');
                // Reset form
                document.getElementById("currentPasswordGroup").style.display = "block";
                document.getElementById("newPasswordGroup").style.display = "none";
                document.getElementById("currentPassword").value = "";
                document.getElementById("newPassword").value = "";
                document.getElementById("changeConfirmPassword").value = "";
                currentPasswordCache = "";
            } else {
                const errorMsg = await res.text();
                showNotification(errorMsg || "Đổi mật khẩu thất bại!", 'error');
            }
        } catch (err) {
            console.error(err);
            showNotification("Không thể kết nối tới máy chủ!", 'error');
        }
    });


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