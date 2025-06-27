document.addEventListener('DOMContentLoaded', function () {
    console.log('Doctor dashboard script loaded successfully');

    // Test buttons và modal availability
    setTimeout(() => {
        const testViewBtn = document.querySelector('.btn-record');
        const testSaveBtn = document.querySelector('.btn-primary[onclick*="savePatientRecord"]');
        const testModal = document.getElementById('patientModal');

        console.log('🔍 Test results:');
        console.log('- .btn-record (Xem hồ sơ) found:', !!testViewBtn);
        console.log('- .btn-primary (Lưu thay đổi) found:', !!testSaveBtn);
        console.log('- #patientModal found:', !!testModal);
        console.log('- viewPatientRecord function exists:', typeof window.viewPatientRecord);
        console.log('- savePatientRecord function exists:', typeof window.savePatientRecord);

        // Test patient data
        console.log('- Patient data available:', Object.keys(patientData).length + ' patients');
        console.log('- Available patient IDs:', Object.keys(patientData));

        // Check localStorage
        const savedKeys = Object.keys(localStorage).filter(key => key.startsWith('patientData_'));
        console.log('- Saved patient data in localStorage:', savedKeys.length);
        if (savedKeys.length > 0) {
            console.log('- Saved patient keys:', savedKeys);
        }
        console.log('💡 Tip: Dùng clearPatientData() để xóa dữ liệu test');
    }, 1000);

    // Đảm bảo các nút hoạt động
    document.addEventListener('click', function(e) {
        // Nút "Xem hồ sơ"
        if (e.target.closest('.btn-record')) {
            e.preventDefault();
            const button = e.target.closest('.btn-record');
            const onclick = button.getAttribute('onclick');
            console.log('Btn-record clicked with onclick:', onclick);

            // Extract patient ID from onclick attribute
            const match = onclick.match(/viewPatientRecord\('(.+?)'\)/);
            if (match) {
                const patientId = match[1];
                console.log('Extracted patient ID:', patientId);
                window.viewPatientRecord(patientId);
            }
        }

        // Nút "Lưu thay đổi"
        if (e.target.closest('.btn-primary') && e.target.closest('.btn-primary').onclick) {
            const button = e.target.closest('.btn-primary');
            const onclick = button.getAttribute('onclick');

            if (onclick && onclick.includes('savePatientRecord')) {
                e.preventDefault();
                console.log('Save button clicked');
                window.savePatientRecord();
            }
        }

        // Nút "Đóng" modal
        if (e.target.closest('.btn-secondary') && e.target.closest('.btn-secondary').onclick) {
            const button = e.target.closest('.btn-secondary');
            const onclick = button.getAttribute('onclick');

            if (onclick && onclick.includes('closeModal')) {
                e.preventDefault();
                console.log('Close button clicked');
                window.closeModal();
            }
        }

        // Nút "In hồ sơ"
        if (e.target.closest('.btn-print') && e.target.closest('.btn-print').onclick) {
            const button = e.target.closest('.btn-print');
            const onclick = button.getAttribute('onclick');

            if (onclick && onclick.includes('printRecord')) {
                e.preventDefault();
                console.log('Print button clicked');
                window.printRecord();
            }
        }
    });

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
            name: 'Nguyễn Thị Mai',
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
            cusId: 2,
            name: 'Trần Văn An',
            gender: 'Nam',
            birthDate: '15/03/1989',
            email: 'tranan@gmail.com',
            phone: '0987654321',
            address: 'Cầu Giấy, Hà Nội',
            occupation: 'Kỹ sư',
            emergencyContact: 'Vợ - Nguyễn Thị Lan',
            status: 'active',
            medicalRecord: {
                recordId: 'MR003',
                diagnosis: 'Tư vấn hiếm muộn lần đầu',
                treatmentPlan: 'Tư vấn chế độ sinh hoạt, dinh dưỡng. Hẹn khám lại sau 3 tháng',
                notes: 'Cần theo dõi thêm, có thể cần làm thêm xét nghiệm',
                recordStatus: 'active',
                dischargeDate: '2024-09-24'
            },
            currentBooking: {
                bookType: 'initial',
                bookStatus: 'confirmed',
                note: 'Lần đầu tư vấn',
                serviceName: 'Tư vấn hiếm muộn'
            }
        },
        hoa: {
            cusId: 3,
            name: 'Phạm Thị Hoa',
            gender: 'Nữ',
            birthDate: '20/07/1994',
            email: 'phamhoa@gmail.com',
            phone: '0456789123',
            address: 'Thanh Xuân, Hà Nội',
            occupation: 'Giáo viên',
            emergencyContact: 'Chồng - Lê Văn Minh',
            status: 'active',
            medicalRecord: {
                recordId: 'MR004',
                diagnosis: 'IVF - theo dõi kích thích buồng trứng',
                treatmentPlan: 'Tiêm Gonal-F 225UI/ngày, siêu âm theo dõi',
                notes: 'Phản ứng tốt với thuốc kích thích, dự kiến chọc hút sau 2 ngày',
                recordStatus: 'active',
                dischargeDate: '2024-08-15'
            },
            currentBooking: {
                bookType: 'follow-up',
                bookStatus: 'confirmed',
                note: 'Theo dõi kích thích buồng trứng',
                serviceName: 'Liệu trình điều trị IVF'
            }
        },
        lan: {
            cusId: 4,
            name: 'Lê Thị Lan',
            gender: 'Nữ',
            birthDate: '10/12/1991',
            email: 'lethilan@gmail.com',
            phone: '0789123456',
            address: 'Đống Đa, Hà Nội',
            occupation: 'Kế toán',
            emergencyContact: 'Chồng - Trần Văn Hùng',
            status: 'active',
            medicalRecord: {
                recordId: 'MR005',
                diagnosis: 'IVF chu kỳ 2 - chuẩn bị chuyển phôi',
                treatmentPlan: 'Chuẩn bị nội mạc tử cung, hẹn chuyển phôi',
                notes: 'Nội mạc tử cung dày 9mm, phù hợp chuyển phôi',
                recordStatus: 'active',
                dischargeDate: '2024-08-20'
            },
            currentBooking: {
                bookType: 'follow-up',
                bookStatus: 'confirmed',
                note: 'Chuẩn bị chuyển phôi',
                serviceName: 'Liệu trình điều trị IVF'
            }
        },
        thu: {
            cusId: 5,
            name: 'Hoàng Thị Thu',
            gender: 'Nữ',
            birthDate: '25/04/1995',
            email: 'hoangthu@gmail.com',
            phone: '0345678901',
            address: 'Ba Đình, Hà Nội',
            occupation: 'Y tá',
            emergencyContact: 'Chồng - Nguyễn Văn Dũng',
            status: 'active',
            medicalRecord: {
                recordId: 'MR006',
                diagnosis: 'Theo dõi sau phẫu thuật nội soi',
                treatmentPlan: 'Theo dõi lành vết thương, tư vấn thời gian có thai',
                notes: 'Vết thương lành tốt, có thể chuẩn bị có thai sau 3 tháng',
                recordStatus: 'active',
                dischargeDate: '2024-09-14'
            },
            currentBooking: {
                bookType: 'follow-up',
                bookStatus: 'confirmed',
                note: 'Kiểm tra sau phẫu thuật',
                serviceName: 'Khám theo dõi sau phẫu thuật'
            }
        }
    };

// Remove old modal functions - will be redefined later to match database structure



// Patient List Modal functions
    window.openPatientList = function() {
        document.getElementById('patientListModal').style.display = 'block';
    };

    window.closePatientListModal = function() {
        document.getElementById('patientListModal').style.display = 'none';
    };

    window.editPatientFromList = function(patientId) {
        window.closePatientListModal();
        window.viewPatientRecord(patientId);
    };

    window.searchPatients = function() {
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
    };



// Close modal when clicking outside
    window.onclick = function(event) {
        const patientModal = document.getElementById('patientModal');
        const patientListModal = document.getElementById('patientListModal');

        if (event.target === patientModal) {
            window.closeModal();
        }
        if (event.target === patientListModal) {
            window.closePatientListModal();
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
            <button class="btn-record" onclick="window.viewPatientRecord('${patientId}')">
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
        console.log('👀 Mở hồ sơ bệnh nhân ID:', patientId);

        let patient = patientData[patientId];

        if (!patient) {
            console.error('Patient not found with ID:', patientId);
            alert('Không tìm thấy thông tin bệnh nhân!');
            return;
        }

        // Load dữ liệu đã lưu từ localStorage nếu có
        const savedData = loadPatientDataFromStorage(patientId);
        if (savedData) {
            console.log('📂 Sử dụng dữ liệu đã lưu');
            patient = savedData;
            // Cập nhật lại patientData với dữ liệu mới
            patientData[patientId] = patient;
        }

        console.log('Patient data:', patient);

        // Update basic patient info - safely check if elements exist
        const patientNameEl = document.getElementById('patientName');
        const patientIdEl = document.getElementById('patientId');
        const patientGenderEl = document.getElementById('patientGender');
        const patientBirthDateEl = document.getElementById('patientBirthDate');
        const patientPhoneEl = document.getElementById('patientPhone');
        const patientEmailEl = document.getElementById('patientEmail');
        const patientAddressEl = document.getElementById('patientAddress');
        const patientOccupationEl = document.getElementById('patientOccupation');
        const emergencyContactEl = document.getElementById('emergencyContact');
        const patientStatusEl = document.getElementById('patientStatus');

        if (patientNameEl) patientNameEl.textContent = patient.name;
        if (patientIdEl) patientIdEl.textContent = 'BN' + String(patient.cusId).padStart(3, '0');
        if (patientGenderEl) patientGenderEl.textContent = patient.gender;
        if (patientBirthDateEl) patientBirthDateEl.textContent = patient.birthDate;
        if (patientPhoneEl) patientPhoneEl.textContent = patient.phone;
        if (patientEmailEl) patientEmailEl.textContent = patient.email;
        if (patientAddressEl) patientAddressEl.textContent = patient.address;
        if (patientOccupationEl) patientOccupationEl.textContent = patient.occupation;
        if (emergencyContactEl) emergencyContactEl.textContent = patient.emergencyContact;
        if (patientStatusEl) patientStatusEl.textContent = patient.status === 'active' ? 'Hoạt động' : 'Không hoạt động';

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

        // Update booking step information (sample data) - only if elements exist
        const performedAt1 = document.getElementById('performedAt1');
        const stepResult1 = document.getElementById('stepResult1');
        const stepNote1 = document.getElementById('stepNote1');

        if (performedAt1) performedAt1.value = '2024-06-24T08:00';
        if (stepResult1) stepResult1.value = 'Tình trạng sức khỏe tổng thể tốt';
        if (stepNote1) stepNote1.value = 'Bệnh nhân có tiền sử sảy thai 1 lần';

        // Update drug information (sample data) - only if elements exist
        const drugName1 = document.getElementById('drugName1');
        const dosage1 = document.getElementById('dosage1');
        const frequency1 = document.getElementById('frequency1');
        const duration1 = document.getElementById('duration1');
        const drugNote1 = document.getElementById('drugNote1');

        if (drugName1) drugName1.value = 'Folic Acid';
        if (dosage1) dosage1.value = '5mg';
        if (frequency1) frequency1.value = '1 lần/ngày';
        if (duration1) duration1.value = '30 ngày';
        if (drugNote1) drugNote1.value = 'Uống sau bữa ăn';

        // Reset to first tab
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        document.querySelector('.tab-btn').classList.add('active');
        document.getElementById('currentTab').classList.add('active');

        // Show modal
        const patientModal = document.getElementById('patientModal');
        if (patientModal) {
            patientModal.style.display = 'block';
            patientModal.dataset.patientId = patientId;
            console.log('Modal shown successfully');
        } else {
            console.error('Patient modal not found!');
            alert('Không thể hiển thị modal bệnh nhân!');
        }
    };

    // Update close modal functions
    window.closeModal = function() {
        document.getElementById('patientModal').style.display = 'none';
    };

    window.savePatientRecord = function() {
        console.log('💾 Lưu hồ sơ bệnh nhân (tĩnh)');

        const patientModal = document.getElementById('patientModal');
        if (!patientModal) {
            alert('Không tìm thấy modal bệnh nhân!');
            return;
        }

        const patientId = patientModal.dataset.patientId;
        const patient = patientData[patientId];

        if (!patient) {
            alert('Không tìm thấy thông tin bệnh nhân!');
            return;
        }

        try {
            // Update booking information
            const bookType = document.getElementById('bookType');
            const bookStatus = document.getElementById('bookStatus');
            const bookingNote = document.getElementById('bookingNote');

            if (patient.currentBooking) {
                if (bookType) patient.currentBooking.bookType = bookType.value;
                if (bookStatus) patient.currentBooking.bookStatus = bookStatus.value;
                if (bookingNote) patient.currentBooking.note = bookingNote.value;
            }

            // Update medical record information
            const recordStatus = document.getElementById('recordStatus');
            const diagnosis = document.getElementById('diagnosis');
            const treatmentPlan = document.getElementById('treatmentPlan');
            const dischargeDate = document.getElementById('dischargeDate');
            const medicalNote = document.getElementById('medicalNote');

            if (patient.medicalRecord) {
                if (recordStatus) patient.medicalRecord.recordStatus = recordStatus.value;
                if (diagnosis) patient.medicalRecord.diagnosis = diagnosis.value;
                if (treatmentPlan) patient.medicalRecord.treatmentPlan = treatmentPlan.value;
                if (dischargeDate) patient.medicalRecord.dischargeDate = dischargeDate.value;
                if (medicalNote) patient.medicalRecord.notes = medicalNote.value;
            }

            // Save booking steps
            const completedSteps = [];
            const stepItems = document.querySelectorAll('#completedStepsList .step-item');
            stepItems.forEach(item => {
                const stepName = item.querySelector('.step-info strong').textContent;
                const stepTime = item.querySelector('.step-time').textContent;
                const stepStatus = item.querySelector('.step-status').textContent;
                const stepResult = item.querySelector('.step-summary p:first-child').textContent.replace('Kết quả: ', '');
                const stepNote = item.querySelector('.step-summary p:last-child').textContent.replace('Ghi chú: ', '');

                completedSteps.push({
                    name: stepName,
                    time: stepTime,
                    status: stepStatus,
                    result: stepResult,
                    note: stepNote
                });
            });

            // Save drug information
            const drugs = [];
            const drugItems = document.querySelectorAll('#drugsList .drug-item');
            drugItems.forEach((item, index) => {
                const drugNameInput = item.querySelector('input[placeholder*="Tên thuốc"], #drugName' + (index + 1));
                const dosageInput = item.querySelector('input[placeholder*="Liều"], #dosage' + (index + 1));
                const frequencyInput = item.querySelector('input[placeholder*="Tần suất"], #frequency' + (index + 1));
                const durationInput = item.querySelector('input[placeholder*="Thời gian"], #duration' + (index + 1));
                const noteTextarea = item.querySelector('textarea, #drugNote' + (index + 1));

                drugs.push({
                    name: drugNameInput ? drugNameInput.value : '',
                    dosage: dosageInput ? dosageInput.value : '',
                    frequency: frequencyInput ? frequencyInput.value : '',
                    duration: durationInput ? durationInput.value : '',
                    note: noteTextarea ? noteTextarea.value : ''
                });
            });

            // Update patient data trong memory
            patient.lastUpdated = new Date().toISOString();
            patient.bookingSteps = completedSteps;
            patient.drugs = drugs;

            // Lưu vào localStorage để persist
            localStorage.setItem('patientData_' + patientId, JSON.stringify(patient));

            console.log('✅ Đã lưu thành công:', {
                patient: patient.name,
                steps: completedSteps.length,
                drugs: drugs.length,
                time: new Date().toLocaleString('vi-VN')
            });

            // Hiển thị thông báo đơn giản
            alert(`✅ Đã lưu hồ sơ của ${patient.name}!\n📋 ${completedSteps.length} bước điều trị\n💊 ${drugs.length} loại thuốc`);

            // Đóng modal
            window.closeModal();

        } catch (error) {
            console.error('❌ Lỗi khi lưu:', error);
            alert('❌ Có lỗi khi lưu dữ liệu: ' + error.message);
        }
    };

    // Thêm function để load dữ liệu từ localStorage khi cần
    function loadPatientDataFromStorage(patientId) {
        const savedData = localStorage.getItem('patientData_' + patientId);
        if (savedData) {
            try {
                const parsedData = JSON.parse(savedData);
                console.log('📂 Loaded patient data from localStorage:', parsedData);
                return parsedData;
            } catch (error) {
                console.error('❌ Error parsing saved data:', error);
            }
        }
        return null;
    }

    // Function để clear dữ liệu test (có thể gọi từ console)
    window.clearPatientData = function(patientId) {
        if (patientId) {
            localStorage.removeItem('patientData_' + patientId);
            console.log('🗑️ Đã xóa dữ liệu của bệnh nhân:', patientId);
        } else {
            // Clear tất cả patient data
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith('patientData_')) {
                    localStorage.removeItem(key);
                }
            });
            console.log('🗑️ Đã xóa tất cả dữ liệu bệnh nhân');
        }
    };

    // Additional utility functions for sidebar
    // openScheduleManager function is already defined in doctor-common.js
    // Removed duplicate definition to avoid conflicts

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

    // ========== EDITABLE TEST RESULTS FUNCTIONS ==========

    // Add new test item
    window.addNewTestItem = function() {
        const testContainer = document.querySelector('.booking-steps-results');
        const testCount = testContainer.children.length + 1;

        const newTestItem = document.createElement('div');
        newTestItem.className = 'step-result-item';
        newTestItem.innerHTML = `
            <div class="step-result-header">
                <div class="step-info">
                    <h6 contenteditable="true" class="editable-title">Xét nghiệm mới ${testCount}</h6>
                    <input type="datetime-local" class="editable-date" value="${new Date().toISOString().slice(0, 16)}">
                </div>
                <select class="step-status-select">
                    <option value="pending" selected>Đang chờ</option>
                    <option value="completed">Hoàn thành</option>
                    <option value="cancelled">Đã hủy</option>
                </select>
            </div>
            <div class="step-result-content">
                <div class="result-grid">
                    <div class="result-item">
                        <input type="text" class="editable-label" value="Chỉ số 1" placeholder="Tên chỉ số">:
                        <input type="text" class="editable-result" value="" placeholder="Giá trị">
                        <select class="unit-select">
                            <option value="mg/ml">mg/ml</option>
                            <option value="mIU/ml">mIU/ml</option>
                            <option value="ng/ml">ng/ml</option>
                            <option value="pg/ml">pg/ml</option>
                            <option value="triệu/ml">triệu/ml</option>
                            <option value="%">%</option>
                        </select>
                        <select class="status-select">
                            <option value="Bình thường" selected>Bình thường</option>
                            <option value="Cao">Cao</option>
                            <option value="Thấp">Thấp</option>
                            <option value="Bất thường">Bất thường</option>
                        </select>
                        <button type="button" class="remove-test-item-btn" onclick="removeTestResultItem(this)">
                            <i class="fas fa-trash"></i> Xóa
                        </button>
                    </div>
                </div>
                <button type="button" class="add-test-item-btn" onclick="addTestResultRow(this)" style="margin-top: 8px; padding: 8px 16px; font-size: 0.8rem;">
                    <i class="fas fa-plus"></i> Thêm chỉ số
                </button>
                <div class="result-note">
                    <strong>Ghi chú:</strong> 
                    <textarea class="editable-note" placeholder="Nhập ghi chú..."></textarea>
                </div>
                <button type="button" class="remove-test-item-btn" onclick="removeTestItem(this)" style="margin-top: 16px;">
                    <i class="fas fa-trash"></i> Xóa toàn bộ xét nghiệm
                </button>
            </div>
        `;

        testContainer.appendChild(newTestItem);

        // Show notification
        if (typeof showNotification === 'function') {
            showNotification('Đã thêm xét nghiệm mới!', 'success');
        }
    };

    // Add test result row to existing test
    window.addTestResultRow = function(button) {
        const resultGrid = button.parentElement.querySelector('.result-grid');

        const newResultItem = document.createElement('div');
        newResultItem.className = 'result-item';
        newResultItem.innerHTML = `
            <input type="text" class="editable-label" value="Chỉ số mới" placeholder="Tên chỉ số">:
            <input type="text" class="editable-result" value="" placeholder="Giá trị">
            <select class="unit-select">
                <option value="mg/ml">mg/ml</option>
                <option value="mIU/ml">mIU/ml</option>
                <option value="ng/ml">ng/ml</option>
                <option value="pg/ml">pg/ml</option>
                <option value="triệu/ml">triệu/ml</option>
                <option value="%">%</option>
            </select>
            <select class="status-select">
                <option value="Bình thường" selected>Bình thường</option>
                <option value="Cao">Cao</option>
                <option value="Thấp">Thấp</option>
                <option value="Bất thường">Bất thường</option>
            </select>
            <button type="button" class="remove-test-item-btn" onclick="removeTestResultItem(this)">
                <i class="fas fa-trash"></i> Xóa
            </button>
        `;

        resultGrid.appendChild(newResultItem);
    };

    // Remove individual test result item
    window.removeTestResultItem = function(button) {
        if (confirm('Bạn có chắc chắn muốn xóa chỉ số này?')) {
            button.closest('.result-item').remove();
        }
    };

    // Remove entire test item
    window.removeTestItem = function(button) {
        if (confirm('Bạn có chắc chắn muốn xóa toàn bộ xét nghiệm này?')) {
            button.closest('.step-result-item').remove();
            if (typeof showNotification === 'function') {
                showNotification('Đã xóa xét nghiệm!', 'info');
            }
        }
    };

    // Save all test results
    window.saveAllTestResults = function() {
        const testItems = document.querySelectorAll('.step-result-item');
        const results = [];

        testItems.forEach(item => {
            const title = item.querySelector('.editable-title').textContent;
            const date = item.querySelector('.editable-date').value;
            const status = item.querySelector('.step-status-select').value;
            const note = item.querySelector('.editable-note').value;

            const resultItems = [];
            item.querySelectorAll('.result-item').forEach(resultItem => {
                const label = resultItem.querySelector('.editable-label').value;
                const value = resultItem.querySelector('.editable-result').value;
                const unit = resultItem.querySelector('.unit-select').value;
                const resultStatus = resultItem.querySelector('.status-select').value;

                resultItems.push({ label, value, unit, status: resultStatus });
            });

            results.push({ title, date, status, note, results: resultItems });
        });

        console.log('Saving test results:', results);

        // Here you would send data to backend
        // Example: saveTestResultsToAPI(results);

        if (typeof showNotification === 'function') {
            showNotification('Đã lưu tất cả kết quả xét nghiệm!', 'success');
        } else {
            alert('Đã lưu tất cả kết quả xét nghiệm!');
        }
    };

    // Auto-save functionality
    let saveTimeout;
    document.addEventListener('input', function(e) {
        if (e.target.matches('.editable-title, .editable-date, .editable-result, .editable-label, .editable-note, .step-status-select, .unit-select, .status-select, .result-value-select, .editable-detailed-result')) {
            clearTimeout(saveTimeout);
            saveTimeout = setTimeout(() => {
                // Auto-save after 2 seconds of no input
                console.log('Auto-saving changes...');
                // You can implement auto-save to backend here
            }, 2000);
        }
    });

    // Service Selection and Step Form Functions
    const serviceSelect = document.getElementById('serviceSelect');
    const stepForm = document.getElementById('stepForm');
    const selectedServiceTitle = document.getElementById('selectedServiceTitle');

    const serviceNames = {
        'clinical-exam': 'Khám lâm sàng tổng quát',
        'blood-test': 'Xét nghiệm máu',
        'hormone-test': 'Xét nghiệm nội tiết tố',
        'ultrasound': 'Siêu âm',
        'egg-retrieval': 'Chọc hút trứng',
        'embryo-transfer': 'Chuyển phôi',
        'pregnancy-test': 'Xét nghiệm thai',
        'consultation': 'Tư vấn và theo dõi',
        'medication': 'Kê đơn thuốc',
        'follow-up': 'Tái khám'
    };

    if (serviceSelect) {
        serviceSelect.addEventListener('change', function() {
            const selectedService = this.value;

            if (selectedService) {
                const serviceName = serviceNames[selectedService];
                selectedServiceTitle.innerHTML = `<i class="fas fa-edit"></i> Thực hiện: ${serviceName}`;
                stepForm.style.display = 'block';

                // Set current datetime
                const now = new Date();
                const currentDateTime = now.toISOString().slice(0, 16);
                document.getElementById('performedAt').value = currentDateTime;

                // Clear form
                document.getElementById('stepResult').value = '';
                document.getElementById('stepNote').value = '';
                document.getElementById('stepStatus').value = 'in-progress';
            } else {
                stepForm.style.display = 'none';
            }
        });
    }

    window.saveBookingStep = function() {
        const serviceSelect = document.getElementById('serviceSelect');
        const performedAt = document.getElementById('performedAt').value;
        const stepStatus = document.getElementById('stepStatus').value;
        const stepResult = document.getElementById('stepResult').value;
        const stepNote = document.getElementById('stepNote').value;

        if (!serviceSelect.value || !performedAt || !stepResult) {
            alert('Vui lòng điền đầy đủ thông tin bắt buộc!');
            return;
        }

        const serviceName = serviceNames[serviceSelect.value];
        const dateTime = new Date(performedAt);
        const formattedDateTime = `${dateTime.getDate().toString().padStart(2, '0')}/${(dateTime.getMonth() + 1).toString().padStart(2, '0')}/${dateTime.getFullYear()} ${dateTime.getHours().toString().padStart(2, '0')}:${dateTime.getMinutes().toString().padStart(2, '0')}`;

        const statusClass = stepStatus === 'completed' ? 'completed' : 'pending';
        const statusText = {
            'in-progress': 'Đang thực hiện',
            'completed': 'Đã hoàn thành',
            'postponed': 'Hoãn lại',
            'cancelled': 'Hủy bỏ'
        }[stepStatus];

        // Create new step item
        const stepsList = document.getElementById('completedStepsList');
        const newStepId = Date.now(); // Use timestamp as ID

        // Remove existing step if editing
        if (window.currentEditingStepId) {
            const oldStepItem = document.querySelector(`[data-step-id="${window.currentEditingStepId}"]`);
            if (oldStepItem) {
                oldStepItem.remove();
            }
            window.currentEditingStepId = null;
        }

        const newStepItem = document.createElement('div');
        newStepItem.className = `step-item ${statusClass}`;
        newStepItem.setAttribute('data-step-id', newStepId);

        newStepItem.innerHTML = `
            <div class="step-header">
                <div class="step-info">
                    <strong>${serviceName}</strong>
                    <span class="step-time">${formattedDateTime}</span>
                </div>
                <div class="step-actions">
                    <span class="step-status ${statusClass}">${statusText}</span>
                    <button class="btn-edit-step" onclick="editStep(${newStepId})">
                        <i class="fas fa-edit"></i>
                    </button>
                </div>
            </div>
            <div class="step-summary">
                <p><strong>Kết quả:</strong> ${stepResult}</p>
                <p><strong>Ghi chú:</strong> ${stepNote}</p>
            </div>
        `;

        // Insert at the beginning of the list
        stepsList.insertBefore(newStepItem, stepsList.firstChild);

        // Clear and hide form
        cancelStepForm();

        alert('Đã lưu bước thực hiện thành công!');
    };

    window.cancelStepForm = function() {
        stepForm.style.display = 'none';
        serviceSelect.value = '';
        document.getElementById('stepResult').value = '';
        document.getElementById('stepNote').value = '';
        document.getElementById('stepStatus').value = 'in-progress';
        window.currentEditingStepId = null;
    };

    window.editStep = function(stepId) {
        const stepItem = document.querySelector(`[data-step-id="${stepId}"]`);
        if (stepItem) {
            const stepInfo = stepItem.querySelector('.step-info strong').textContent;
            const stepResult = stepItem.querySelector('.step-summary p:first-child').textContent.replace('Kết quả: ', '');
            const stepNote = stepItem.querySelector('.step-summary p:last-child').textContent.replace('Ghi chú: ', '');

            // Find the service key by name
            let serviceKey = '';
            for (const [key, name] of Object.entries(serviceNames)) {
                if (name === stepInfo) {
                    serviceKey = key;
                    break;
                }
            }

            // Populate form with existing data
            serviceSelect.value = serviceKey;
            selectedServiceTitle.innerHTML = `<i class="fas fa-edit"></i> Chỉnh sửa: ${stepInfo}`;
            document.getElementById('stepResult').value = stepResult;
            document.getElementById('stepNote').value = stepNote;

            // Show form
            stepForm.style.display = 'block';

            // Store editing step ID for later removal
            window.currentEditingStepId = stepId;
        }
    };

});