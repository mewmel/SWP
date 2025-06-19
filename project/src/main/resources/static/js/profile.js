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
                alert('Không lấy được thông tin hồ sơ!');
            });
    }

    // --- UPDATE DỮ LIỆU KHI LƯU ---
    const saveBtn = document.querySelector('.btn.btn-primary');
    if (saveBtn) {
        saveBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const currentCusId = cusId || localStorage.getItem('cusId');
            if (!currentCusId) {
                alert('Không xác định được người dùng. Vui lòng đăng nhập lại!');
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
                    alert('Thông tin đã được lưu thành công!');
                })
                .catch(err => {
                    alert('Cập nhật hồ sơ thất bại: ' + err.message);
                });
        });
    }
});