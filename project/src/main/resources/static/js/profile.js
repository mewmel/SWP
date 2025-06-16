// Sidebar logic (giữ nguyên)
document.addEventListener('DOMContentLoaded', function() {
    // Hiện tên user từ localStorage
    var fullName = localStorage.getItem('userFullName');
    var sidebarUsername = document.querySelector('.sidebar-username');
    if (sidebarUsername) {
        sidebarUsername.textContent = fullName || "User";
    }
    // Sidebar show/hide
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
    // Đăng xuất từ sidebar
    const sidebarLogout = document.querySelector('.sidebar-logout');
    if(sidebarLogout) {
        sidebarLogout.addEventListener('click', function(e) {
            e.preventDefault();
            localStorage.removeItem('userFullName');
            closeSidebar();
            alert('Đăng xuất thành công!');
            window.location.href = "index.html";
        });
    }
    // Chuyển sang trang hồ sơ cá nhân
    const sidebarAccount = document.querySelector('.sidebar-account');
    if(sidebarAccount) {
        sidebarAccount.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = "ho-so-ca-nhan.html";
        });
    }

    // Tab functionality
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const tabId = this.dataset.tab;
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            this.classList.add('active');
            document.getElementById(tabId).classList.add('active');
        });
    });

    // Avatar upload
    document.querySelector('.avatar-upload').addEventListener('click', function() {
        alert('Chọn ảnh mới từ thiết bị của bạn');
    });

    // Add medical history
    document.querySelectorAll('.add-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            alert('Mở form thêm thông tin mới');
        });
    });

    // Change password & Export data
    document.querySelectorAll('.btn-secondary').forEach(btn => {
        btn.addEventListener('click', function() {
            if (this.textContent.includes('Đổi mật khẩu')) {
                alert('Mở form đổi mật khẩu');
            }
            if (this.textContent.includes('Xuất dữ liệu')) {
                alert('Đang chuẩn bị file xuất dữ liệu...');
            }
        });
    });

    // Delete account
    document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('click', function() {
            if (this.textContent.includes('Xóa tài khoản')) {
                if (confirm('Bạn có chắc chắn muốn xóa tài khoản? Hành động này không thể hoàn tác.')) {
                    alert('Yêu cầu xóa tài khoản đã được gửi đến quản trị viên');
                }
            }
        });
    });

    // ------- AUTO FILL FORM FROM API (CHỈ CHẠY 1 LẦN DUY NHẤT) ----------
    const userEmail = localStorage.getItem('userEmail');
    let cusId = null;
    if (userEmail) {
        fetch(`http://localhost:8080/api/customer/${encodeURIComponent(userEmail)}`)
            .then(res => res.json())
            .then(data => {
                cusId = data.cusId; // Lưu cusId lại để update
                if (document.querySelector('.info-hoten')) document.querySelector('.info-hoten').value = data.cusFullName ?? '';
                if (document.querySelector('.info-ngaysinh')) document.querySelector('.info-ngaysinh').value = data.cusDate ?? '';
                if (document.querySelector('.info-phone')) document.querySelector('.info-phone').value = data.cusPhone ?? '';
                if (document.querySelector('.info-email')) document.querySelector('.info-email').value = data.cusEmail ?? '';
                if (document.querySelector('.info-cccd')) document.querySelector('.info-cccd').value = data.cusId ?? '';
                if (document.querySelector('.info-nghenghiep')) document.querySelector('.info-nghenghiep').value = data.cusOccupation ?? '';
                if (document.querySelector('.info-address')) document.querySelector('.info-address').value = data.cusAddress ?? '';
                if (document.querySelector('.info-khan-cap')) document.querySelector('.info-khan-cap').value = data.emergencyContact ?? '';
                if (document.querySelector('.info-gioitinh')) document.querySelector('.info-gioitinh').value = data.cusGender ?? '';
            })
            .catch(err => {
                alert('Không lấy được thông tin hồ sơ!');
            });
    }

    // ------- UPDATE PROFILE TO API (Lưu vào SQL) ----------
    const saveBtn = document.querySelector('.btn-primary');
    if(saveBtn) {
        saveBtn.addEventListener('click', function(e) {
            e.preventDefault();
            // Nếu chưa lấy được cusId thì không gửi
            if (!cusId) {
                alert('Không xác định được người dùng. Vui lòng tải lại trang hoặc đăng nhập lại!');
                return;
            }
            // Lấy giá trị mới từ form
            const dataUpdate = {
                cusFullName: document.querySelector('.info-hoten')?.value?.trim() || "",
                cusGender: document.querySelector('.info-gioitinh')?.value?.trim() || "",
                cusDate: document.querySelector('.info-ngaysinh')?.value || "",
                cusPhone: document.querySelector('.info-phone')?.value?.trim() || "",
                cusOccupation: document.querySelector('.info-nghenghiep')?.value?.trim() || "",
                cusAddress: document.querySelector('.info-address')?.value?.trim() || "",
                emergencyContact: document.querySelector('.info-khan-cap')?.value?.trim() || ""
            };
            fetch(`http://localhost:8080/api/customer/${cusId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataUpdate)
            })
                .then(async res => {
                    if (!res.ok) throw new Error(await res.text());
                    return res.json();
                })
                .then(updated => {
                    // Cập nhật lại tên trên menu/sidebar nếu cần
                    localStorage.setItem('userFullName', updated.cusFullName);
                    if (document.querySelector('.user-name')) {
                        document.querySelector('.user-name').textContent = updated.cusFullName;
                    }
                    if (sidebarUsername) {
                        sidebarUsername.textContent = updated.cusFullName;
                    }
                    alert('Thông tin đã được lưu thành công!');
                })
                .catch(err => {
                    alert('Cập nhật hồ sơ thất bại: ' + err.message);
                });
        });
    }
});