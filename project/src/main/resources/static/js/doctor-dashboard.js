document.addEventListener('DOMContentLoaded', function () {
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

// Patient data storage
    const patientData = {
        mai: {
            name: 'Nguyễn Thị Mai',
            age: 28,
            phone: '0123456789',
            address: 'Hoàng Mai, Hà Nội',
            medicalRecord: {
                diagnosis: 'Hiếm muộn nguyên phát, chuẩn bị IVF chu kỳ 1',
                symptoms: 'Không có thai sau 2 năm kết hôn, chu kỳ kinh đều',
                treatment: 'Kích thích buồng trứng, theo dõi siêu âm định kỳ',
                notes: 'Bệnh nhân hợp tác tốt, tuân thủ điều trị đầy đủ'
            }
        },
        an: {
            name: 'Trần Văn An',
            age: 35,
            phone: '0987654321',
            address: 'Cầu Giấy, Hà Nội',
            medicalRecord: {
                diagnosis: 'Tư vấn hiếm muộn lần đầu',
                symptoms: 'Vợ chồng chưa có con sau 18 tháng kết hôn',
                treatment: 'Tư vấn chế độ sinh hoạt, dinh dưỡng. Hẹn khám lại sau 3 tháng',
                notes: 'Cần theo dõi thêm, có thể cần làm thêm xét nghiệm'
            }
        },
        hoa: {
            name: 'Phạm Thị Hoa',
            age: 30,
            phone: '0456789123',
            address: 'Thanh Xuân, Hà Nội',
            medicalRecord: {
                diagnosis: 'IVF - theo dõi kích thích buồng trứng',
                symptoms: 'Đang trong quá trình kích thích buồng trứng chu kỳ 2',
                treatment: 'Tiêm Gonal-F 225UI/ngày, siêu âm theo dõi',
                notes: 'Phản ứng tốt với thuốc kích thích, dự kiến chọc hút sau 2 ngày'
            }
        },
        lan: {
            name: 'Lê Thị Lan',
            age: 33,
            phone: '0789123456',
            address: 'Đống Đa, Hà Nội',
            medicalRecord: {
                diagnosis: 'IVF chu kỳ 2 - chuẩn bị chuyển phôi',
                symptoms: 'Đã có 3 phôi chất lượng tốt được đông lạnh',
                treatment: 'Chuẩn bị nội mạc tử cung, hẹn chuyển phôi',
                notes: 'Nội mạc tử cung dày 9mm, phù hợp chuyển phôi'
            }
        },
        thu: {
            name: 'Hoàng Thị Thu',
            age: 29,
            phone: '0345678901',
            address: 'Ba Đình, Hà Nội',
            medicalRecord: {
                diagnosis: 'Theo dõi sau phẫu thuật nội soi',
                symptoms: 'Đã phẫu thuật cắt u xơ tử cung 1 tháng trước',
                treatment: 'Theo dõi lành vết thương, tư vấn thời gian có thai',
                notes: 'Vết thương lành tốt, có thể chuẩn bị có thai sau 3 tháng'
            }
        }
    };

// Modal functions
    function viewPatientRecord(patientId) {
        const patient = patientData[patientId];
        if (!patient) return;

        document.getElementById('patientName').textContent = patient.name;
        document.getElementById('patientAge').textContent = patient.age;
        document.getElementById('patientPhone').textContent = patient.phone;
        document.getElementById('patientAddress').textContent = patient.address;

        document.getElementById('diagnosis').value = patient.medicalRecord.diagnosis;
        document.getElementById('symptoms').value = patient.medicalRecord.symptoms;
        document.getElementById('treatment').value = patient.medicalRecord.treatment;
        document.getElementById('notes').value = patient.medicalRecord.notes;

        document.getElementById('patientModal').style.display = 'block';

        // Store current patient ID for saving
        document.getElementById('patientModal').dataset.patientId = patientId;
    }

    function closeModal() {
        document.getElementById('patientModal').style.display = 'none';
    }

    function savePatientRecord() {
        const patientId = document.getElementById('patientModal').dataset.patientId;
        const patient = patientData[patientId];

        if (!patient) return;

        // Update patient record
        patient.medicalRecord.diagnosis = document.getElementById('diagnosis').value;
        patient.medicalRecord.symptoms = document.getElementById('symptoms').value;
        patient.medicalRecord.treatment = document.getElementById('treatment').value;
        patient.medicalRecord.notes = document.getElementById('notes').value;

        // Show success message - use the notification function from script.js
        if (typeof showNotification === 'function') {
            showNotification('Đã lưu thay đổi bệnh án thành công!', 'success');
        }

        closeModal();
    }



// Patient List Modal functions
    function openPatientList() {
        document.getElementById('patientListModal').style.display = 'block';
    }

    function closePatientListModal() {
        document.getElementById('patientListModal').style.display = 'none';
    }

    function editPatientFromList(patientId) {
        closePatientListModal();
        viewPatientRecord(patientId);
    }

    function searchPatients() {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        const tableBody = document.getElementById('patientTableBody');
        const rows = tableBody.getElementsByTagName('tr');

        for (let i = 0; i < rows.length; i++) {
            const patientName = rows[i].getElementsByTagName('td')[0].textContent.toLowerCase();
            if (patientName.includes(searchTerm)) {
                rows[i].style.display = '';
            } else {
                rows[i].style.display = 'none';
            }
        }
    }



// Close modal when clicking outside
    window.onclick = function(event) {
        const patientModal = document.getElementById('patientModal');
        const patientListModal = document.getElementById('patientListModal');

        if (event.target === patientModal) {
            closeModal();
        }
        if (event.target === patientListModal) {
            closePatientListModal();
        }
    }


    function updateCurrentTime() {
        const now = new Date();
        const options = {
            weekday: 'long',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        };
        const dateString = now.toLocaleDateString('vi-VN', options);

        const currentDateElement = document.querySelector('.current-date');
        if (currentDateElement) {
            currentDateElement.textContent = dateString;
        }
    }

// Enhanced patient search with debouncing
    let searchTimeout;
    const originalSearchPatients = searchPatients;

    searchPatients = function() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(originalSearchPatients, 300);
    };

});