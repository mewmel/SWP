document.addEventListener('DOMContentLoaded', function () {
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
        button.addEventListener('click', function (e) {
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
    // const currentInput = document.getElementById("currentPassword");
    // const verifyBtn = document.getElementById("btnVerify");
    // const changeBtn = document.getElementById("btnChange");
    // const currentGroup = document.getElementById("currentPasswordGroup");
    // const modal = document.getElementById("forgotPasswordModal");  // modal thay thế newGroup

    // let currentPasswordCache = ""; // Lưu tạm để gửi kèm khi đổi

    // // Bước 1: Xác thực mật khẩu hiện tại
    // verifyBtn.addEventListener("click", async () => {
    //     const currentPassword = currentInput.value.trim();
    //     if (!currentPassword) return alert("Vui lòng nhập mật khẩu hiện tại!");
    //     // LẤY ID CUSTOMER
    //     const cusId = localStorage.getItem('cusId');
    //     if (!cusId) return alert("Không tìm thấy thông tin người dùng!");

    //     try {
    //         const res = await fetch(`/api/auth/${cusId}/verify-cus-password`, {
    //             method: "POST",
    //             headers: { "Content-Type": "application/json" },
    //             body: JSON.stringify({ currentPassword })
    //         });

    //         if (res.ok) {
    //             currentPasswordCache = currentPassword;          // Lưu lại
    //             currentGroup.style.display = "none";
    //             modal.style.display = "block";                // Mở form ra
    //         } else {
    //             const errorMsg = await res.text();
    //             alert(errorMsg || "Mật khẩu hiện tại không đúng!");
    //         }
    //     } catch (err) {
    //         console.error(err);
    //         alert("Không thể kết nối tới máy chủ!");
    //     }
    // });

    // // Bước 2: Gửi mật khẩu mới
    // changeBtn.addEventListener("click", async () => {
    //     // 1. Lấy dữ liệu từ form
    //     const otp = document.getElementById("forgotOtp").value.trim();
    //     const newPassword = document.getElementById("forgotNewPassword").value.trim();
    //     const confirm = document.getElementById("forgotConfirmPassword").value.trim();
    //     const email = localStorage.getItem("email");              // PathVariable email
    //     // currentPasswordCache bạn đã lưu ở bước 1
    //     if (!otp || !newPassword || !confirm) {
    //         return alert("Vui lòng nhập đủ OTP và mật khẩu mới!");
    //     }
    //     if (newPassword !== confirm) {
    //         return alert("Mật khẩu mới không khớp!");
    //     }
    //     if (!email) {
    //         return alert("Không tìm thấy email người dùng!");
    //     }

    //     try {
    //         // 2. Gọi API PUT với body có otp
    //         const res = await fetch(`/api/auth/${email}/change-cus-password`, {
    //             method: "PUT",
    //             headers: { "Content-Type": "application/json" },
    //             body: JSON.stringify({
    //                 currentPassword: currentPasswordCache,
    //                 newPassword: newPassword,
    //                 otp: otp
    //             })
    //         });

    //         const text = await res.text();
    //         if (res.ok) {
    //             alert("Đổi mật khẩu thành công!");
    //             // 3. Reset giao diện
    //             document.getElementById("currentPasswordGroup").style.display = "block";
    //             document.getElementById("forgotPasswordModal").style.display = "none";
    //             document.getElementById("currentPassword").value = "";
    //             // reset modal form
    //             document.getElementById("forgotOtp").value = "";
    //             document.getElementById("forgotNewPassword").value = "";
    //             document.getElementById("forgotConfirmPassword").value = "";
    //             currentPasswordCache = "";
    //         } else {
    //             alert(text || "Đổi mật khẩu thất bại!");
    //         }
    //     } catch (err) {
    //         console.error(err);
    //         alert("Không thể kết nối tới máy chủ!");
    //     }
    // });
    // 1. Lấy phần tử
  const currentInput     = document.getElementById("currentPassword");
  const verifyBtn        = document.getElementById("btnVerify");
  const currentGroup     = document.getElementById("currentPasswordGroup");

  const modal            = document.getElementById("forgotPasswordModal");
  const closeModalBtn    = document.getElementById("closeForgotModal");
  const form             = document.getElementById("forgotPasswordForm");
  const otpInput         = document.getElementById("forgotOtp");
  const newPassInput     = document.getElementById("forgotNewPassword");
  const confirmInput     = document.getElementById("forgotConfirmPassword");

  let currentPasswordCache = "";

  // toggle class 'active' để CSS hiện/ẩn modal
function showModal() {
  modal.style.display = 'flex';    // hoặc 'block' tuỳ CSS của bạn
  modal.classList.add('active');
}
function hideModal() {
  modal.style.display = 'none';
  modal.classList.remove('active');
}

  // Bước 1: xác thực mật khẩu cũ, gọi API đổi-password với otp=null → server sẽ gửi mail
  verifyBtn.addEventListener("click", async () => {
    const current = currentInput.value.trim();
    if (!current) return alert("Vui lòng nhập mật khẩu hiện tại!");

    const cusId = localStorage.getItem("cusId");
    const email = localStorage.getItem("cusEmail");
    if (!cusId || !email) return alert("Không tìm thấy thông tin người dùng!");

    try {
      // 1.1 verify mật khẩu cũ
      let res = await fetch(`/api/auth/${cusId}/verify-cus-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: current })
      });
      if (!res.ok) {
        const msg = await res.text();
        return alert(msg || "Mật khẩu hiện tại không đúng!");
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
        return alert(text || "Không thể gửi OTP, thử lại sau!");
      }

      // 1.3 hiển thị modal nhập OTP & mật khẩu mới
      currentPasswordCache = current;
      currentGroup.style.display = "none";
      showModal();
      alert("Mã OTP đã được gửi đến email của bạn.");
    } catch (err) {
      console.error(err);
      alert("Lỗi kết nối tới máy chủ!");
    }
  });

  // Đóng modal
  closeModalBtn.addEventListener("click", () => {
    hideModal();
    currentGroup.style.display = "block";
    form.reset();
  });

  // Bước 2: submit form modal → gọi lại API đổi-password với otp + newPassword
  form.addEventListener("submit", async e => {
    e.preventDefault();

    const otp     = otpInput.value.trim();
    const newPass = newPassInput.value.trim();
    const conf    = confirmInput.value.trim();
    const email   = localStorage.getItem("cusEmail");

    if (!otp || !newPass || !conf) {
      return alert("Vui lòng nhập đầy đủ OTP và mật khẩu mới!");
    }
    if (newPass !== conf) {
      return alert("Mật khẩu mới không khớp!");
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
        alert("Đổi mật khẩu thành công!");
        hideModal();
        currentGroup.style.display = "block";
        currentInput.value = "";
        form.reset();
        currentPasswordCache = "";
      } else {
        alert(text || "Đổi mật khẩu thất bại!");
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi kết nối tới máy chủ!");
    }
  });


    // --- UPDATE DỮ LIỆU KHI LƯU ---
    const saveBtn = document.querySelector('.btn.btn-primary');
    if (saveBtn) {
        saveBtn.addEventListener('click', function (e) {
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