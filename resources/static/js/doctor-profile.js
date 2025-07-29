document.addEventListener('DOMContentLoaded', function() {
    // ========== GIỮ TRẠNG THÁI ĐĂNG NHẬP ==========
    const authButtons = document.querySelector('.auth-buttons');
    const userMenu = document.querySelector('.user-menu');
    const userNameSpan = document.querySelector('.user-name');
    const sidebarUsername = document.querySelector('.sidebar-username');
    const notificationWrapper = document.querySelector('.notification-wrapper');
    const fullName = localStorage.getItem('docFullName');

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

    // ========== ĐĂNG XUẤT ==========
    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function (e) {
            e.preventDefault();
            localStorage.clear();
            window.location.href = "index.html";
        });
    }

    // 1. Lấy docId từ localStorage
    var docId = localStorage.getItem('docId');
    if (!docId) {
        showAlert('error', 'Không tìm thấy doctorId!');
        return;
    }

// ========== SỰ KIỆN UPLOAD ẢNH ĐẠI DIỆN ==========
const avatarInput = document.getElementById('avatarUpload');
if (avatarInput) {
    avatarInput.addEventListener('change', function (event) {
        const file = event.target.files[0];
        if (!file) return;

        // Kiểm tra định dạng và size
        if (!['image/jpeg', 'image/png'].includes(file.type)) {
            showAlert('error', 'Chỉ chấp nhận ảnh JPG hoặc PNG!');
            avatarInput.value = "";
            return;
        }

        // Gửi file lên server (chỉ preview nếu upload thành công)
        const formData = new FormData();
        formData.append('avatar', file);

        fetch(`/api/avatar/upload-doctor-avatar/${docId}`, {
            method: 'POST',
            body: formData
        })
        .then(res => {
            if (!res.ok) {
                return res.text().then(msg => { throw new Error(msg || "Upload thất bại"); });
            }
            return res.text();
        })
        .then(msg => {
            showAlert('success', msg || 'Cập nhật ảnh đại diện thành công!');
            // Sau khi upload thành công, fetch lại avatar từ backend (tránh preview tạm)
            fetchDoctorProfile(docId);

        })
        .catch(err => {
            showAlert('error', err.message || 'Có lỗi khi upload avatar!');
            console.error(err);
        })
        .finally(() => {
            avatarInput.value = "";
        });
    });
}

function fetchAvatar(docId) {
    fetch(`/api/avatar/doctor-avatar/${docId}`)
        .then(res => {
            if (!res.ok) throw new Error('Không lấy được avatar');
            return res.blob();
        })
        .then(blob => {
            const url = URL.createObjectURL(blob);
            updateAvatarPreview(url);
        })
        .catch(err => {
            console.error('Lỗi khi tải avatar:', err);
            resetAvatarPreviewToDefault();
        });
    }

    // ========== LOAD PROFILE ==========
    fetchDoctorProfile(docId);

    // ========== HÀM HỖ TRỢ ==========

    function fetchDoctorProfile(docId) {
      fetchAvatar(docId);
        fetch(`/api/doctors/full-profile/${docId}`)
            .then(res => {
                if (!res.ok) throw new Error('Không lấy được dữ liệu');
                return res.json();
            })
            .then(doc => {
                // Thông tin cá nhân
                document.getElementById('fullName').value = doc.docFullName || '';
                document.getElementById('degree').value   = doc.degree || '';
                document.getElementById('email').value    = doc.docEmail || '';
                document.getElementById('phone').value    = doc.docPhone || '';
                document.getElementById('doctorId').value = 'BS' + String(doc.docId).padStart(3, '0');

                // Chuyên môn, mô tả
                document.getElementById('specialization').value = doc.expertise || '';
                document.getElementById('description').value = doc.profileDescription || '';

                // Hiển thị các tag chuyên môn từ serviceList
                const tagsContainer = document.getElementById('expertiseTags');
                tagsContainer.innerHTML = '';
                if (Array.isArray(doc.currentService)) {
                    doc.currentService.forEach(service => {
                        const tag = document.createElement('span');
                        tag.className = 'expertise-tag';
                        tag.textContent = service.serName || 'Dịch vụ không rõ';
                        tagsContainer.appendChild(tag);
                    });
                }
            }
            )
            .catch(err => {
                console.error('Lỗi khi tải hồ sơ bác sĩ:', err);
                showAlert('error', 'Lỗi khi tải hồ sơ bác sĩ');
            });
    }

    function updateAvatarPreview(imgUrl) {
        const avatarWrapper = document.querySelector('.profile-avatar');
        if (!avatarWrapper) return;
        // Xóa icon user-md nếu có
        const icon = avatarWrapper.querySelector('i.fas.fa-user-md');
        if (icon) icon.remove();
        // Xóa img cũ (nếu có)
        const oldImg = avatarWrapper.querySelector('img.avatar-img');
        if (oldImg) oldImg.remove();
        // Thêm img mới
        const img = document.createElement('img');
        img.src = imgUrl;
        img.alt = 'Avatar';
        img.className = 'avatar-img';
        img.style.width = '96px';
        img.style.height = '96px';
        img.style.borderRadius = '50%';
        img.style.objectFit = 'cover';
        avatarWrapper.insertBefore(img, avatarWrapper.querySelector('.avatar-upload'));
    }

    function resetAvatarPreviewToDefault() {
        const avatarWrapper = document.querySelector('.profile-avatar');
        if (!avatarWrapper) return;
        // Xóa img cũ (nếu có)
        const oldImg = avatarWrapper.querySelector('img.avatar-img');
        if (oldImg) oldImg.remove();
        // Nếu chưa có icon thì thêm lại
        if (!avatarWrapper.querySelector('i.fas.fa-user-md')) {
            const icon = document.createElement('i');
            icon.className = 'fas fa-user-md';
            avatarWrapper.insertBefore(icon, avatarWrapper.querySelector('.avatar-upload'));
        }
    }

    function showAlert(type, message) {
        const alertBox = document.createElement('div');
        alertBox.className = `alert alert-${type}`;
        alertBox.textContent = message;
        document.body.appendChild(alertBox);
        setTimeout(() => {
            alertBox.remove();
        }, 3000);
    }
});
