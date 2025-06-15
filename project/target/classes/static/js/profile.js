    // --- KIỂM TRA ĐĂNG NHẬP ---
    const userFullName = getWithExpiry('userFullName');
    if (!userFullName) {
        window.location.href = "index.html";
    }
    document.addEventListener('DOMContentLoaded', function() {
    // Sidebar logic (giữ nguyên)
        // Hiện tên user từ localStorage
        var fullName = getWithExpiry('userFullName');
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
        const avatarUpload = document.querySelector('.avatar-upload');
        if (avatarUpload) {
            avatarUpload.addEventListener('click', function() {
                alert('Chọn ảnh mới từ thiết bị của bạn');
            });
        }

        // Save changes
        const btnPrimary = document.querySelector('.btn-primary');
        if (btnPrimary) {
            btnPrimary.addEventListener('click', function() {
                alert('Thông tin đã được lưu thành công!');
            });
        }

        // Add medical history
       
        document.querySelectorAll('.add-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                alert('Mở form thêm thông tin mới');
            });
        });

        // Change password
        const btnChangePassword = Array.from(document.querySelectorAll('.btn-secondary')).find(
            btn => btn.textContent.includes('Đổi mật khẩu')
        );
        if (btnChangePassword) {
            btnChangePassword.addEventListener('click', function() {
                alert('Mở form đổi mật khẩu');
            });
        }

        // Export data
        const btnExportData = Array.from(document.querySelectorAll('.btn-secondary')).find(
            btn => btn.textContent.includes('Xuất dữ liệu')
        );
        if (btnExportData) {
            btnExportData.addEventListener('click', function() {
                alert('Đang chuẩn bị file xuất dữ liệu...');
            });
        }

        // // Delete account
        // document.querySelector('.btn').addEventListener('click', function() {
        //     if (this.textContent.includes('Xóa tài khoản')) {
        //         if (confirm('Bạn có chắc chắn muốn xóa tài khoản? Hành động này không thể hoàn tác.')) {
        //             alert('Yêu cầu xóa tài khoản đã được gửi đến quản trị viên');
        //         }
        //     }
        // });

        

        // ------- AUTO FILL FORM FROM API (CHỈ CHẠY 1 LẦN DUY NHẤT) ----------
        const userEmail = getWithExpiry('userEmail');
        if (userEmail) {
            fetch(`http://localhost:8080/api/customer/${encodeURIComponent(userEmail)}`)
                .then(res => res.json())
                .then(data => {
                    // Log để kiểm tra dữ liệu trả về
                    console.log("API data:", data);

                    if (document.querySelector('.info-hoten')) document.querySelector('.info-hoten').value = data.cusFullName ?? '';
                    if (document.querySelector('.info-ngaysinh')) document.querySelector('.info-ngaysinh').value = data.cusDate ?? '';
                    if (document.querySelector('.info-phone')) document.querySelector('.info-phone').value = data.cusPhone ?? '';
                    if (document.querySelector('.info-email')) document.querySelector('.info-email').value = data.cusEmail ?? '';
                    if (document.querySelector('.info-cccd')) document.querySelector('.info-cccd').value = data.cusId ?? '';
                    if (document.querySelector('.info-nghenghiep')) document.querySelector('.info-nghenghiep').value = data.cusJob ?? '';
                    if (document.querySelector('.info-address')) document.querySelector('.info-address').value = data.cusAddress ?? '';
                    if (document.querySelector('.info-khan-cap')) document.querySelector('.info-khan-cap').value = data.cusContactEmergency ?? '';
                })
                .catch(err => {
                    alert('Không lấy được thông tin hồ sơ!');
                });
        }
    });
