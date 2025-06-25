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

// Patient data storage - Updated to match database schema
    const patientData = {
        mai: {
            cusId: 1,
            name: 'Trần Anh Thư',
            gender: 'Nữ',
            birthDate: '26/09/2004',
            email: 'thutase180353@fpt.edu.vn',
            phone: '0352020737',
            address: 'HCMC',
            occupation: 'Con sen',
            emergencyContact: 'Mơ',
            status: 'active',
            medicalRecord: {
                recordId: 'MR002',
                diagnosis: 'Vô sinh nguyên phát, chuẩn bị điều trị IVF chu kỳ 1',
                treatmentPlan: '1. Kích thích buồng trứng bằng thuốc FSH\n2. Theo dõi nang noãn bằng siêu âm\n3. Chọc hút trứng khi đủ tiêu chuẩn\n4. Thụ tinh trong ống nghiệm\n5. Chuyển phôi vào tử cung',
                notes: 'Bệnh nhân hợp tác tốt, tuân thủ điều trị đầy đủ',
                recordStatus: 'active',
                dischargeDate: '2024-07-24'
            },
            currentBooking: {
                bookType: 'follow-up',
                bookStatus: 'confirmed',
                note: 'Bệnh nhân đến đúng giờ hẹn',
                serviceName: 'Liệu trình điều trị IVF'
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

    // Update viewPatientRecord function to work with new database-matching structure
    window.viewPatientRecord = function(patientId) {
        const patient = patientData[patientId];
        if (!patient) return;

        // Update basic patient info
        document.getElementById('patientName').textContent = patient.name;
        document.getElementById('patientId').textContent = 'BN' + String(patient.cusId).padStart(3, '0');
        document.getElementById('patientGender').textContent = patient.gender;
        document.getElementById('patientBirthDate').textContent = patient.birthDate;
        document.getElementById('patientPhone').textContent = patient.phone;
        document.getElementById('patientEmail').textContent = patient.email;
        document.getElementById('patientAddress').textContent = patient.address;
        document.getElementById('patientOccupation').textContent = patient.occupation;
        document.getElementById('emergencyContact').textContent = patient.emergencyContact;
        document.getElementById('patientStatus').textContent = patient.status === 'active' ? 'Hoạt động' : 'Không hoạt động';
        
        // Update current status
        const appointmentItem = document.querySelector(`[data-patient="${patientId}"]`);
        const statusBadge = appointmentItem ? appointmentItem.querySelector('.status-badge') : null;
        const currentStatus = statusBadge ? statusBadge.textContent : 'Không xác định';
        document.getElementById('currentStatus').textContent = currentStatus;
        document.getElementById('currentStatus').className = 'status-badge ' + 
            (currentStatus === 'Đã khám' ? 'completed' : 'waiting');

        // Update booking information
        if (patient.currentBooking) {
            document.getElementById('bookType').value = patient.currentBooking.bookType;
            document.getElementById('bookStatus').value = patient.currentBooking.bookStatus;
            document.getElementById('bookingNote').value = patient.currentBooking.note;
        }

        // Update medical record information
        if (patient.medicalRecord) {
            document.getElementById('recordStatus').value = patient.medicalRecord.recordStatus;
            document.getElementById('recordCreatedDate').value = '2024-06-24';
            document.getElementById('diagnosis').value = patient.medicalRecord.diagnosis;
            document.getElementById('treatmentPlan').value = patient.medicalRecord.treatmentPlan;
            document.getElementById('dischargeDate').value = patient.medicalRecord.dischargeDate;
            document.getElementById('medicalNote').value = patient.medicalRecord.notes;
        }

        // Update booking step information (sample data)
        document.getElementById('performedAt1').value = '2024-06-24T08:00';
        document.getElementById('stepResult1').value = 'Tình trạng sức khỏe tổng thể tốt';
        document.getElementById('stepNote1').value = 'Bệnh nhân có tiền sử sảy thai 1 lần';

        // Update drug information (sample data)
        document.getElementById('drugName1').value = 'Folic Acid';
        document.getElementById('dosage1').value = '5mg';
        document.getElementById('frequency1').value = '1 lần/ngày';
        document.getElementById('duration1').value = '30 ngày';
        document.getElementById('drugNote1').value = 'Uống sau bữa ăn';

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

        // Update booking information
        if (patient.currentBooking) {
            patient.currentBooking.bookType = document.getElementById('bookType').value;
            patient.currentBooking.bookStatus = document.getElementById('bookStatus').value;
            patient.currentBooking.note = document.getElementById('bookingNote').value;
        }

        // Update medical record information
        if (patient.medicalRecord) {
            patient.medicalRecord.recordStatus = document.getElementById('recordStatus').value;
            patient.medicalRecord.diagnosis = document.getElementById('diagnosis').value;
            patient.medicalRecord.treatmentPlan = document.getElementById('treatmentPlan').value;
            patient.medicalRecord.dischargeDate = document.getElementById('dischargeDate').value;
            patient.medicalRecord.notes = document.getElementById('medicalNote').value;
        }

        // Here you would typically save booking steps and drugs to database
        // For now, we'll just show success message

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

    // ========== NEW FUNCTIONS FOR DATABASE MATCHING ========== 

    // Add new booking step
    window.addBookingStep = function() {
        const stepsList = document.getElementById('bookingStepsList');
        const stepCount = stepsList.children.length + 1;
        
        const newStep = document.createElement('div');
        newStep.className = 'step-item';
        newStep.innerHTML = `
            <div class="step-header">
                <strong>Bước ${stepCount}: </strong>
                <input type="text" placeholder="Tên bước..." style="flex: 1; margin: 0 1rem;">
                <span class="step-status completed">Đang thực hiện</span>
            </div>
            <div class="step-content">
                <div class="record-grid">
                    <div class="record-section">
                        <label>Ngày thực hiện:</label>
                        <input type="datetime-local" value="${new Date().toISOString().slice(0, 16)}">
                    </div>
                    <div class="record-section">
                        <label>Kết quả:</label>
                        <textarea rows="2" placeholder="Kết quả thực hiện..."></textarea>
                    </div>
                </div>
                <div class="record-section">
                    <label>Ghi chú bước này:</label>
                    <textarea rows="2" placeholder="Ghi chú của bác sĩ..."></textarea>
                </div>
                <button type="button" class="btn-remove-drug" onclick="removeBookingStep(this)">
                    <i class="fas fa-trash"></i> Xóa bước
                </button>
            </div>
        `;
        
        stepsList.appendChild(newStep);
    };

    // Remove booking step
    window.removeBookingStep = function(button) {
        if (confirm('Bạn có chắc chắn muốn xóa bước này?')) {
            button.closest('.step-item').remove();
        }
    };

    // Add new drug
    window.addDrug = function() {
        const drugsList = document.getElementById('drugsList');
        const drugCount = drugsList.children.length + 1;
        
        const newDrug = document.createElement('div');
        newDrug.className = 'drug-item';
        newDrug.innerHTML = `
            <div class="record-grid">
                <div class="record-section">
                    <label>Tên thuốc:</label>
                    <input type="text" placeholder="Tên thuốc...">
                </div>
                <div class="record-section">
                    <label>Liều dùng:</label>
                    <input type="text" placeholder="Liều dùng...">
                </div>
            </div>
            <div class="record-grid">
                <div class="record-section">
                    <label>Tần suất:</label>
                    <input type="text" placeholder="Tần suất sử dụng...">
                </div>
                <div class="record-section">
                    <label>Thời gian dùng:</label>
                    <input type="text" placeholder="Thời gian dùng...">
                </div>
            </div>
            <div class="record-section">
                <label>Ghi chú thuốc:</label>
                <textarea rows="2" placeholder="Hướng dẫn sử dụng..."></textarea>
            </div>
            <button type="button" class="btn-remove-drug" onclick="removeDrug(this)">
                <i class="fas fa-trash"></i> Xóa
            </button>
        `;
        
        drugsList.appendChild(newDrug);
    };

    // Remove drug
    window.removeDrug = function(button) {
        if (confirm('Bạn có chắc chắn muốn xóa thuốc này?')) {
            button.closest('.drug-item').remove();
        }
    };

});