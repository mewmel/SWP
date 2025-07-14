document.addEventListener('DOMContentLoaded', function() {

        // ========== GIỮ TRẠNG THÁI ĐĂNG NHẬP ==========
    const authButtons = document.querySelector('.auth-buttons');
    const userMenu = document.querySelector('.user-menu');
    const userNameSpan = document.querySelector('.user-name');
    const sidebarUsername = document.querySelector('.sidebar-username');
    const notificationWrapper = document.querySelector('.notification-wrapper');

    // Hiển thị đúng trạng thái đăng nhập khi load lại trang
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
            localStorage.clear(); // <-- Sửa ở đây, không cần gọi hàm nào khác
            window.location.href = "index.html";
        });
    }







  // 1. Lấy docId từ localStorage
  var docId = localStorage.getItem('docId');
  if (!docId) {
    showAlert('error', 'Không tìm thấy doctorId!');
    return;
  }




  // 2. Fetch hồ sơ bác sĩ
  fetch(`/api/doctor/full-profile/${docId}`)
    .then(function(res) {
      if (!res.ok) throw new Error('Không lấy được dữ liệu');
      return res.json();
    })
    .then(function(doc) {
      // Thông tin cơ bản
      document.getElementById('fullName').textContent = doc.docFullName || '';
      document.getElementById('degree').textContent   = doc.degree || '';
      document.getElementById('docEmail').textContent = doc.docEmail || '';
      document.getElementById('phone').textContent    = doc.docPhone || '';
      document.getElementById('docId').textContent    = 'BS' + String(doc.docId).padStart(3, '0');

      // Chuyên môn
      document.getElementById('expertise').textContent = doc.expertise || '';
      document.getElementById('bio').textContent       = doc.profileDescription || '';

      // Hiển thị các tag chuyên môn từ serviceList
const tagsContainer = document.getElementById('expertiseTags');
tagsContainer.innerHTML = ''; // clear tag cũ

if (Array.isArray(doc.currentService)) {
  doc.currentService.forEach(service => {
    const tag = document.createElement('span');
    tag.className = 'expertise-tag';
    tag.textContent = service.serName || 'Dịch vụ không rõ';
    tagsContainer.appendChild(tag);
  });
}

      // Avatar: nếu có imageData
      if (doc.imageData && doc.imageMimeType) {
        // doc.imageData là mảng số, cần tạo Blob
        var bytes = new Uint8Array(doc.imageData.data || doc.imageData);
        var blob  = new Blob([bytes], { type: doc.imageMimeType });
        var url   = URL.createObjectURL(blob);

        // Thay icon bằng <img>
        var avatarWrapper = document.querySelector('.profile-avatar');
        if (avatarWrapper) {
          avatarWrapper.innerHTML = '<img src="' + url + '" alt="Avatar" class="avatar-img"/>';
        }
      }
    })
    .catch(function(err) {
      console.error('Lỗi khi tải hồ sơ bác sĩ:', err);
      showAlert('error', 'Lỗi khi tải hồ sơ bác sĩ');
    });




});