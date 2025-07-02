document.addEventListener('DOMContentLoaded', function() {
// 1. Lấy docId từ localStorage
  var docId = localStorage.getItem('docId');
  if (!docId) {
    showAlert('error', 'Không tìm thấy doctorId!');
    return;
  }

  // 2. Fetch hồ sơ bác sĩ
  fetch(`/api/doctor/full-profile/${encodeURIComponent(docId)}`)
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

      // Service hiện tại
      if (doc.currentService && doc.currentService.serName) {
        document.getElementById('serName').textContent = doc.currentService.serName;
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