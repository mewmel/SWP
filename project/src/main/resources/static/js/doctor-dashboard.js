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

    // ========== PATIENT STATUS MANAGEMENT ==========
    
    // Mark patient as examined
    window.markAsExamined = function(patientId) {
        const appointmentItem = document.querySelector(`[data-patient="${patientId}"]`);
        if (!appointmentItem) return;
        
        // Update status
        appointmentItem.setAttribute('data-status', 'examined');
        
        // Update status badge
        const statusBadge = appointmentItem.querySelector('.status-badge');
        statusBadge.textContent = 'Đã khám';
        statusBadge.className = 'status-badge completed';
        
        // Update action button
        const actionDiv = appointmentItem.querySelector('.appointment-actions');
        actionDiv.innerHTML = `
            <button class="btn-record" onclick="viewPatientRecord('${patientId}')">
                <i class="fas fa-file-medical"></i> Xem hồ sơ
            </button>
        `;
        
        // Show success notification
        if (typeof showNotification === 'function') {
            showNotification(`Đã check-in bệnh nhân thành công`, 'success');
        }
    };
    


    // ========== MODAL TAB MANAGEMENT ==========
    
    // Switch tabs in patient record modal
    window.switchTab = function(tabName) {
        // Remove active class from all tabs and contents
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        
        // Add active class to clicked tab
        event.target.classList.add('active');
        
        // Show corresponding content
        const tabContentId = tabName + 'Tab';
        const tabContent = document.getElementById(tabContentId);
        if (tabContent) {
            tabContent.classList.add('active');
        }
    };
    
    // Print patient record
    window.printRecord = function() {
        const patientName = document.getElementById('patientName').textContent;
        
        // Create printable content
        const printContent = `
            <html>
            <head>
                <title>Hồ sơ bệnh án - ${patientName}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    .header { text-align: center; margin-bottom: 20px; }
                    .section { margin-bottom: 15px; }
                    .label { font-weight: bold; }
                    textarea { width: 100%; min-height: 80px; border: 1px solid #ccc; padding: 8px; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h2>HỒ SƠ BỆNH ÁN</h2>
                    <h3>${patientName}</h3>
                    <p>Ngày in: ${new Date().toLocaleDateString('vi-VN')}</p>
                </div>
                
                <div class="section">
                    <div class="label">Lý do khám:</div>
                    <p>${document.getElementById('visitReason').value}</p>
                </div>
                
                <div class="section">
                    <div class="label">Triệu chứng:</div>
                    <p>${document.getElementById('currentSymptoms').value}</p>
                </div>
                
                <div class="section">
                    <div class="label">Chẩn đoán:</div>
                    <p>${document.getElementById('diagnosis').value}</p>
                </div>
                
                <div class="section">
                    <div class="label">Kê đơn thuốc:</div>
                    <p style="white-space: pre-line;">${document.getElementById('prescription').value}</p>
                </div>
                
                <div class="section">
                    <div class="label">Hướng dẫn:</div>
                    <p>${document.getElementById('instructions').value}</p>
                </div>
                
                <div class="section">
                    <div class="label">Ghi chú của bác sĩ:</div>
                    <p>${document.getElementById('doctorNotes').value}</p>
                </div>
                
                <div style="margin-top: 40px; text-align: right;">
                    <p>Bác sĩ điều trị</p>
                    <br><br>
                    <p>_________________</p>
                </div>
            </body>
            </html>
        `;
        
        // Open print window
        const printWindow = window.open('', '_blank');
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.print();
    };

    // Update viewPatientRecord function to work with new modal structure
    window.viewPatientRecord = function(patientId) {
        const patient = patientData[patientId];
        if (!patient) return;

        // Update basic info
        document.getElementById('patientName').textContent = patient.name;
        document.getElementById('patientId').textContent = 'BN' + patientId.toUpperCase();
        document.getElementById('patientAge').textContent = patient.age + ' tuổi';
        document.getElementById('patientPhone').textContent = patient.phone;
        document.getElementById('patientAddress').textContent = patient.address;
        document.getElementById('patientBirthDate').textContent = '15/03/1996'; // Sample date
        
        // Update current status
        const appointmentItem = document.querySelector(`[data-patient="${patientId}"]`);
        const statusBadge = appointmentItem ? appointmentItem.querySelector('.status-badge') : null;
        const currentStatus = statusBadge ? statusBadge.textContent : 'Không xác định';
        document.getElementById('currentStatus').textContent = currentStatus;
        document.getElementById('currentStatus').className = 'status-badge ' + 
            (currentStatus === 'Đã khám' ? 'completed' : 'waiting');

        // Update medical record data with sample content
        document.getElementById('visitReason').value = 'Khám định kỳ theo lịch hẹn';
        document.getElementById('currentSymptoms').value = patient.medicalRecord.symptoms;
        document.getElementById('diagnosis').value = patient.medicalRecord.diagnosis;
        document.getElementById('bloodPressure').value = '120/80 mmHg';
        document.getElementById('heartRate').value = '72 bpm';
        document.getElementById('weight').value = '55 kg';
        document.getElementById('prescription').value = '1. Folic Acid 5mg - 1 viên/ngày\n2. Vitamin E 400IU - 1 viên/ngày\n3. Duphaston 10mg - 2 viên/ngày';
        document.getElementById('instructions').value = patient.medicalRecord.treatment;
        document.getElementById('doctorNotes').value = patient.medicalRecord.notes;

        // Reset to first tab
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        document.querySelector('.tab-btn').classList.add('active');
        document.getElementById('currentTab').classList.add('active');

        // Show modal
        document.getElementById('patientModal').style.display = 'block';
        document.getElementById('patientModal').dataset.patientId = patientId;
    };

    // Update close modal functions
    window.closeModal = function() {
        document.getElementById('patientModal').style.display = 'none';
    };
    
    window.savePatientRecord = function() {
        const patientId = document.getElementById('patientModal').dataset.patientId;
        const patient = patientData[patientId];

        if (!patient) return;

        // Update patient record with current tab data
        patient.medicalRecord.diagnosis = document.getElementById('diagnosis').value;
        patient.medicalRecord.symptoms = document.getElementById('currentSymptoms').value;
        patient.medicalRecord.treatment = document.getElementById('instructions').value;
        patient.medicalRecord.notes = document.getElementById('doctorNotes').value;

        // Show success message
        if (typeof showNotification === 'function') {
            showNotification('Đã lưu thay đổi hồ sơ bệnh án thành công!', 'success');
        } else {
            alert('Đã lưu thay đổi hồ sơ bệnh án thành công!');
        }

        closeModal();
    };

    // Additional utility functions for sidebar
    window.openScheduleManager = function() {
        if (typeof showNotification === 'function') {
            showNotification('Tính năng quản lý lịch hẹn đang được phát triển', 'info');
        }
    };

    window.openReports = function() {
        if (typeof showNotification === 'function') {
            showNotification('Tính năng báo cáo thống kê đang được phát triển', 'info');
        }
    };

});