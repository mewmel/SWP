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

    async function loadTodayConfirmedBookings() {
        const docId = localStorage.getItem('docId');
        if (!docId) return;

        try {
            const response = await fetch(`/api/booking/doctor/${docId}/confirmed-today`);
            if (!response.ok) throw new Error('Network error');
            const bookings = await response.json();
            console.log('bookings', bookings); // Thêm dòng này!
            const scheduleList = document.querySelector('.schedule-list');
            if (!scheduleList) return;

            // Lấy node mẫu
            const sample = scheduleList.querySelector('.appointment-item');
            if (!sample) return;

            // Xóa hết cũ, chỉ giữ lại node mẫu (ẩn đi)
            scheduleList.innerHTML = '';
            // scheduleList.appendChild(sample); // KHÔNG giữ lại mẫu, chỉ clone luôn (vì mỗi lần load lại render mới hết)

            if (bookings.length === 0) {
                scheduleList.innerHTML = '<div style="padding: 1rem; color: #888;">Không có lịch hẹn hôm nay.</div>';
                return;
            }

            bookings.forEach(b => {
                // Clone node mẫu
                const clone = sample.cloneNode(true);

                // Set data
                clone.dataset.patient = b.cusId || '';
                clone.dataset.status = b.bookStatus || '';

                // Time
                clone.querySelector('.time').textContent = b.startTime ? b.startTime.slice(0, 5) : '--:--';

                // Tên BN
                clone.querySelector('.patient-name').textContent = b.cusFullName || 'Ẩn danh';

                // Tên dịch vụ
                clone.querySelector('.service-name').textContent = b.serName || 'Dịch vụ';

                // Trạng thái + badge
                const badge = clone.querySelector('.status-badge');
                if (b.bookStatus === 'confirmed') {
                    badge.textContent = 'Đang chờ khám';
                    badge.className = 'status-badge waiting';
                } else if (b.bookStatus === 'completed') {
                    badge.textContent = 'Đang khám';
                    badge.className = 'status-badge completed';
                } else {
                    badge.textContent = 'Không rõ';
                    badge.className = 'status-badge';
                }

                // Action button
                const actions = clone.querySelector('.appointment-actions');
                if (b.bookStatus === 'confirmed') {
                    actions.innerHTML = `<button class="btn-waiting" onclick="window.markAsExamined('${b.cusId}','${b.serId}','${b.docId}','${b.bookId}')">
    <i class="fas fa-check"></i> Đang khám
</button>`;
                } else if (b.bookStatus === 'completed') {
                    actions.innerHTML = `<button class="btn-record" onclick="window.viewPatientRecord('${b.cusId}')">
                    <i class="fas fa-file-medical"></i> Xem hồ sơ
                </button>`;
                } else if (b.bookStatus === 'completed') {
                    actions.innerHTML = `<span style="color:gray; font-size:0.9rem;">Đã hoàn tất</span>`;
                } else {
                    actions.innerHTML = '';
                }

                // Thêm vào danh sách
                scheduleList.appendChild(clone);
            });
        } catch (err) {
            console.error('Lỗi tải booking:', err);
        }
    }
    // Cập nhật thời gian hiện tại  
    updateCurrentTime();


    // Cập nhật lịch hẹn hôm nay khi trang được tải 
    loadTodayConfirmedBookings();



    // Remove old modal functions - will be redefined later to match database structure



    // Patient List Modal functions
    window.openPatientList = function () {
        document.getElementById('patientListModal').style.display = 'block';
    };

    window.closePatientListModal = function () {
        document.getElementById('patientListModal').style.display = 'none';
    };

    window.editPatientFromList = function (patientId) {
        window.closePatientListModal();
        window.viewPatientRecord(patientId);
    };

    window.searchPatients = function () {
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

    // Convert datetime string to local datetime format for input
    function toDatetimeLocal(dtString) {
        if (!dtString) return '';
        return dtString.split('.')[0].slice(0, 16); // "2025-06-29T16:21"
    }
    // Get current local date and time in the format YYYY-MM-DDTHH:MM
    function getLocalDateTimeValue() {
        const now = new Date();
        const year = now.getFullYear();
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        const day = now.getDate().toString().padStart(2, '0');
        const hour = now.getHours().toString().padStart(2, '0');
        const min = now.getMinutes().toString().padStart(2, '0');
        return `${year}-${month}-${day}T${hour}:${min}`;
    }

    // Close modal when clicking outside
    window.onclick = function (event) {
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

    searchPatients = function () {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(originalSearchPatients, 300);
    };

    // ========== PATIENT STATUS MANAGEMENT ==========

    // Mark patient as examined
    window.markAsExamined = async function (cusId, serId, docId, bookId) {
        const appointmentItem = document.querySelector(`[data-patient="${cusId}"]`);
        if (!appointmentItem) return;

        // 1. Đổi trạng thái UI
        appointmentItem.setAttribute('data-status', 'completed');
        // Ở ngay sau khi đổi trạng thái UI (hoặc trước khi tạo hồ sơ)
        await fetch(`/api/booking/update-status/${bookId}`, {
            method: 'PUT',
            body: JSON.stringify({
                bookStatus: 'completed',
            }),
            headers: { 'Content-Type': 'application/json' }
        });
        // Cập nhật lịch hẹn hôm nay
    await loadTodayConfirmedBookings();  



        
        // Update status badge
        const statusBadge = appointmentItem.querySelector('.status-badge');
        statusBadge.textContent = 'Đang khám';
        statusBadge.className = 'status-badge confirmed';

        // 2. Đổi nút/action
        const actionDiv = appointmentItem.querySelector('.appointment-actions');
        actionDiv.innerHTML = `
            <button class="btn-record" onclick="window.viewPatientRecord('${cusId}')">
                <i class="fas fa-file-medical"></i> Xem hồ sơ
            </button>
        `;



        // 3. Kiểm tra có medical record chưa, nếu chưa thì tạo
        try {
            // API kiểm tra đã có medical record chưa
            const res = await fetch(`/api/medical-records/exist?cusId=${cusId}&serId=${serId}`);
            const { exists } = await res.json();
            if (!exists) {
                // Tạo mới
                await fetch(`/api/medical-records/create/${serId}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        cusId,
                        docId,
                        serId,
                        recordStatus: 'closed'
                    })
                });
                //tạo mới table Drug
                await fetch(`/api/drugs/create/${bookId}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        docId,
                        cusId,
                    })
                });

                if (typeof showNotification === 'function') showNotification('Đã tạo hồ sơ bệnh án!', 'success');



                // Show success notification
                if (typeof showNotification === 'function') {
                    showNotification(`Đã check-in bệnh nhân thành công`, 'success');
                }
            }
        } catch (err) {
            console.error('Lỗi tạo hồ sơ bệnh án:', err);
            if (typeof showNotification === 'function') showNotification('Không thể tạo hồ sơ bệnh án', 'error');
        }
    };




    // ========== MODAL TAB MANAGEMENT ==========

    // Switch tabs in patient record modal
    window.switchTab = function (tabName) {
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
    window.printRecord = function () {
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
    window.viewPatientRecord = async function (cusId) {
        try {
            // 1. Gọi API
            const res = await fetch(`/api/customer/full-record/${cusId}`);
            if (!res.ok) {
                return alert("Không thể tải dữ liệu bệnh nhân!");
            }
            const patientData = await res.json();

            // 2. Thông tin cơ bản
            document.getElementById('patientName').textContent = patientData.cusFullName || 'Không rõ';
            document.getElementById('cusId').textContent = 'BN' + String(patientData.cusId).padStart(3, '0');
            document.getElementById('patientGender').textContent = patientData.cusGender || 'Không rõ';
            document.getElementById('patientBirthDate').textContent = patientData.cusDate || 'Không rõ';
            document.getElementById('patientPhone').textContent = patientData.cusPhone || 'Không rõ';
            document.getElementById('patientEmail').textContent = patientData.cusEmail || 'Không rõ';
            document.getElementById('patientAddress').textContent = patientData.cusAddress || 'Không rõ';
            document.getElementById('patientOccupation').textContent = patientData.cusOccupation || 'Không rõ';
            document.getElementById('emergencyContact').textContent = patientData.emergencyContact || 'Không rõ';
            document.getElementById('patientStatus').textContent = (patientData.cusStatus === 'active'
                ? 'Hoạt động' : 'Không hoạt động');

            // 3. Booking hiện tại
            if (patientData.currentBooking) {
                localStorage.setItem('bookId', patientData.currentBooking.bookId || '');
                document.getElementById('bookType').value = patientData.currentBooking.bookType || '';
                document.getElementById('bookStatus').value = patientData.currentBooking.bookStatus || '';
                document.getElementById('bookingNote').value = patientData.currentBooking.note || '';
                document.getElementById('serviceName').textContent = patientData.currentBooking.serName || '';
            }
            // Load sub-services cho booking này
            if (patientData.currentBooking.bookId) {
                setupServiceSelection(patientData.currentBooking.bookId);
            }


            // 4. Hồ sơ y tế hiện tại
            if (patientData.currentMedicalRecord) {
                const mr = patientData.currentMedicalRecord;
                localStorage.setItem('recordId', mr.recordId || '');
                document.getElementById('recordStatus').value = mr.recordStatus || '';
                document.getElementById('diagnosis').value = mr.diagnosis || '';
                document.getElementById('treatmentPlan').value = mr.treatmentPlan || '';
                document.getElementById('recordCreatedDate').value = toDatetimeLocal(mr.createdAt) || '';
                document.getElementById('dischargeDate').value = toDatetimeLocal(mr.dischargeDate) || '';
                document.getElementById('medicalNote').value = mr.medicalNotes || '';
            }

            // 5. (Ví dụ) Cập nhật UI badge trạng thái cuộc hẹn
            const appointmentItem = document.querySelector(`[data-patient="${cusId}"]`);
            const statusBadge = appointmentItem?.querySelector('.status-badge');
            const curStatus = statusBadge?.textContent || 'Không xác định';
            document.getElementById('currentStatus').textContent = curStatus;
            document.getElementById('currentStatus').className =
                'status-badge ' + (curStatus === 'Đã khám' ? 'completed' : 'waiting');




            // 6. Reset tab và show modal
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            document.querySelector('.tab-btn').classList.add('active');
            document.getElementById('currentTab').classList.add('active');

            const modal = document.getElementById('patientModal');
            modal.style.display = 'block';
            modal.dataset.patientId = cusId;
        } catch (err) {
            console.error(err);
            alert("Lỗi khi lấy dữ liệu bệnh nhân!");
        }
    };




    // Update close modal functions
    window.closeModal = function () {
        document.getElementById('patientModal').style.display = 'none';
    };

    window.savePatientRecord = async function () {
        const modal = document.getElementById('patientModal');
        const patientId = modal.dataset.patientId;
        if (!patientId) {
            alert('Không xác định được bệnh nhân!');
            return;
        }

        // 1. Lấy loại đặt lịch và trạng thái lịch hẹn từ DOM
        const bookType = document.getElementById('bookType').value;
        const bookStatus = document.getElementById('bookStatus').value;
        const bookingNote = document.getElementById('bookingNote').value || '';
        const bookId = localStorage.getItem('bookId') || '';
        const recordId = localStorage.getItem('recordId') || '';




        // Nếu là "Khám lần đầu" mà KHÔNG đến khám → XÓA medical record nếu có (nếu có API xóa)
        if (bookType === 'initial' && bookStatus !== 'completed') {
            console.log('bookType value:', document.getElementById('bookType')?.value);
console.log('bookStatus input:', document.getElementById('bookStatus'));
            // Nếu có recordId thì lấy ra rồi xóa (nếu backend cho xóa, bạn tùy biến ở đây)
            // await fetch(`/api/medical-records/${recordId}`, { method: 'DELETE' });
            alert("Không tạo hồ sơ bệnh án vì bệnh nhân không đến khám!");
            return;
        }

        // 2. Nếu đã đến khám → Lưu lần lượt 4 bảng
        if (bookStatus !== 'completed') {
            alert("Không thể lưu hồ sơ bệnh án vì bệnh nhân chưa đến khám!");
            return;
        }


        // (2) Lấy dữ liệu MedicalRecord
        localStorage.getItem('recordId', recordId);
        const recordStatus = document.getElementById('recordStatus').value;
        const createdDate = document.getElementById('recordCreatedDate').value;
        const diagnosis = document.getElementById('diagnosis').value || '';
        const treatmentPlan = document.getElementById('treatmentPlan').value || '';
        const dischargeDate = document.getElementById('dischargeDate').value || '';
        const note = document.getElementById('medicalNote').value || '';


        // (3) Lấy danh sách các bước đã hoàn thành
        const stepsArr = Array.from(document.querySelectorAll('#completedStepsList .step-item')).map(stepDiv => {
            return {
                subName: stepDiv.querySelector('.step-info strong').textContent.trim(),
                stepStatus: stepDiv.querySelector('.step-status')?.textContent.trim() || 'Đang thực hiện',
                //nếu stepStatus là hoàn thành thì lấy thêm thông tin
                ...(stepStatus === 'completed' && {
                    performedAt: stepDiv.querySelector('.stepPerformedAt')?.value || '',
                    result: stepDiv.querySelector('.stepResult')?.textContent.trim() || '',
                    note: stepDiv.querySelector('.stepNote')?.textContent.trim() || '',
                })

            };
        });

        // (4) Lấy danh sách đơn thuốc
        const drugsArr = Array.from(document.querySelectorAll('.drug-item')).map(drugDiv => {
            return {
                bookId: bookId,
                docId: localStorage.getItem('docId') || '',
                cusId: patientId,
                drugName: drugDiv.querySelector('input[placeholder="Tên thuốc..."]').value,
                dosage: drugDiv.querySelector('input[placeholder="Liều dùng..."]').value,
                frequency: drugDiv.querySelector('input[placeholder="Tần suất sử dụng..."]').value,
                duration: drugDiv.querySelector('input[placeholder="Thời gian dùng..."]').value,
                note: drugDiv.querySelector('textarea').value,
            };
        });

        try {
            // (1) Gọi API insert Booking 
            await fetch(`/api/booking/update-note-status/${bookId}`, {
                method: 'PUT',
                body: JSON.stringify({
                    bookId: bookId,
                    bookStatus: bookStatus,
                    note: bookingNote,
                }),
                headers: { 'Content-Type': 'application/json' }
            });

            // (2) Gọi API insert MedicalRecord
            await fetch(`/api/medical-records/update-with-booking/${recordId}`, {
                method: 'PUT',
                body: JSON.stringify({
                    recordStatus: recordStatus,
                    createdAt: createdDate,
                    diagnosis: diagnosis,
                    treatmentPlan: treatmentPlan,
                    dischargeDate: dischargeDate,
                    note: note,
                }),
                headers: { 'Content-Type': 'application/json' }
            });

            // (3) Gọi API insert BookingStep cho từng bước
            for (let step of stepsArr) {
                await fetch(`/api/booking-steps/update-with-booking/${bookId}/${step.subName}`, {
                    method: 'PUT',
                    body: JSON.stringify(step),
                    headers: { 'Content-Type': 'application/json' }
                });
            }

            // (4) Gọi API insert Drug cho từng thuốc
            for (let drug of drugsArr) {
                await fetch(`/api/drugs/update-with-booking/${bookId}`, {
                    method: 'PUT',
                    body: JSON.stringify(drug),
                    headers: { 'Content-Type': 'application/json' }
                });
            }

            alert('Đã lưu hồ sơ bệnh án thành công!');
            // Có thể gọi thêm showNotification() nếu có
            window.closeModal();
        } catch (err) {
            console.error('Lỗi khi lưu hồ sơ bệnh án:', err);
            alert('Lỗi khi lưu hồ sơ bệnh án!');
        }
    };


    // Additional utility functions for sidebar
    // openScheduleManager function is already defined in doctor-common.js
    // Removed duplicate definition to avoid conflicts

    window.openReports = function () {
        if (typeof showNotification === 'function') {
            showNotification('Tính năng báo cáo thống kê đang được phát triển', 'info');
        }
    };

    // ========== NEW FUNCTIONS FOR DATABASE MATCHING ========== 

    // Add new booking step
    window.addBookingStep = function () {
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
    window.removeBookingStep = function (button) {
        if (confirm('Bạn có chắc chắn muốn xóa bước này?')) {
            button.closest('.step-item').remove();
        }
    };

    // Add new drug
    window.addDrug = function () {
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
    window.removeDrug = function (button) {
        if (confirm('Bạn có chắc chắn muốn xóa thuốc này?')) {
            button.closest('.drug-item').remove();
        }
    };

    // ========== EDITABLE TEST RESULTS FUNCTIONS ==========

    // Add new test item
    window.addNewTestItem = function () {
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
    window.addTestResultRow = function (button) {
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
    window.removeTestResultItem = function (button) {
        if (confirm('Bạn có chắc chắn muốn xóa chỉ số này?')) {
            button.closest('.result-item').remove();
        }
    };

    // Remove entire test item
    window.removeTestItem = function (button) {
        if (confirm('Bạn có chắc chắn muốn xóa toàn bộ xét nghiệm này?')) {
            button.closest('.step-result-item').remove();
            if (typeof showNotification === 'function') {
                showNotification('Đã xóa xét nghiệm!', 'info');
            }
        }
    };

    // Save all test results
    window.saveAllTestResults = function () {
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
    document.addEventListener('input', function (e) {
        if (e.target.matches('.editable-title, .editable-date, .editable-result, .editable-label, .editable-note, .step-status-select, .unit-select, .status-select, .result-value-select, .editable-detailed-result')) {
            clearTimeout(saveTimeout);
            saveTimeout = setTimeout(() => {
                // Auto-save after 2 seconds of no input
                console.log('Auto-saving changes...');
                // You can implement auto-save to backend here
            }, 2000);
        }
    });


    // ========== SERVICE SELECTION AND STEP FORM ==========


    function setupServiceSelection(bookId) {
        const serviceSelect = document.getElementById('serviceSelect');
        const stepForm = document.getElementById('stepForm');
        const selectedServiceTitle = document.getElementById('selectedServiceTitle');

        fetch(`/api/booking-steps/${bookId}/subservice-of-visit`)
            .then(res => {
                if (!res.ok) throw new Error(`API lỗi: ${res.status}`);
                return res.json();
            })
            .then(subs => {
                serviceSelect.innerHTML = '<option value="">-- Chọn dịch vụ/bước --</option>';
                document.getElementById('completedStepsList').innerHTML = '';
                document.getElementById('emptySteps').style.display = 'none';
                if (!Array.isArray(subs) || subs.length === 0) {
                    serviceSelect.innerHTML = '<option value="">Không có bước nào</option>';
                    document.getElementById('emptySteps').style.display = '';
                    return;
                }
                subs.forEach(sub => {
                    const opt = document.createElement('option');
                    opt.value = sub.subId; // subId lấy từ backend
                    opt.textContent = sub.subName; // tên dịch vụ lấy từ backend
                    serviceSelect.appendChild(opt);
                });

                // Reset step form
                stepForm.style.display = 'none';
            })
            .catch(err => {
                console.error('Lỗi lấy subservice:', err);
                serviceSelect.innerHTML = '<option value="">Không có bước nào</option>';
                document.getElementById('completedStepsList').innerHTML = '';
                document.getElementById('emptySteps').style.display = '';
            });

        // Gắn event: chỉ lấy tên bước từ textContent
        serviceSelect.onchange = function () {
            const selectedOption = this.options[this.selectedIndex];
            if (this.value) {
                selectedServiceTitle.innerHTML = `<i class="fas fa-edit"></i> Thực hiện: ${selectedOption.textContent}`;
                stepForm.style.display = 'block';

                // Set current datetime
                const stepPerformedAt = document.getElementById('performedAt');
                stepPerformedAt.value = getLocalDateTimeValue();

                // Clear form
                document.getElementById('stepResult').value = '';
                document.getElementById('stepNote').value = '';
                document.getElementById('stepStatus').value = 'pending';
            } else {
                stepForm.style.display = 'none';
            }
        };
    }




    window.saveBookingStep = function () {
        const serviceSelect = document.getElementById('serviceSelect');
        const performedAt = document.getElementById('performedAt').value;
        const stepStatus = document.getElementById('stepStatus').value;
        const stepResult = document.getElementById('stepResult').value;
        const stepNote = document.getElementById('stepNote').value;

        if (!serviceSelect.value || !performedAt || !stepResult) {
            alert('Vui lòng điền đầy đủ thông tin bắt buộc!');
            return;
        }

        const subName = serviceSelect.options[serviceSelect.selectedIndex].textContent;
        const dateTime = new Date(performedAt);
        const formattedDateTime = `${dateTime.getDate().toString().padStart(2, '0')}/${(dateTime.getMonth() + 1).toString().padStart(2, '0')}/${dateTime.getFullYear()} ${dateTime.getHours().toString().padStart(2, '0')}:${dateTime.getMinutes().toString().padStart(2, '0')}`;

        const statusClass = stepStatus === 'completed' ? 'completed' : 'pending';
        const statusText = {
            'pending': 'Đang thực hiện',
            'completed': 'Đã hoàn thành',
            'inactive': 'Không hoạt động',
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
                    <strong>${subName}</strong>
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
        updateEmptyStepsNotice();
        // Clear and hide form
        cancelStepForm();


        alert('Đã lưu bước thực hiện thành công!');
    };
    function updateEmptyStepsNotice() {
        const stepsList = document.getElementById('completedStepsList');
        const emptyDiv = document.getElementById('emptySteps');
        if (!stepsList.children.length) {
            emptyDiv.style.display = '';
        } else {
            emptyDiv.style.display = 'none';
        }
    }

    window.cancelStepForm = function () {
        stepForm.style.display = 'none';
        serviceSelect.value = '';
        document.getElementById('stepResult').value = '';
        document.getElementById('stepNote').value = '';
        document.getElementById('stepStatus').value = 'pending';
        window.currentEditingStepId = null;

        updateEmptyStepsNotice();
    };

    window.editStep = function (stepId) {
        const stepItem = document.querySelector(`[data-step-id="${stepId}"]`);
        if (stepItem) {
            const stepInfo = stepItem.querySelector('.step-info strong').textContent;
            const stepResult = stepItem.querySelector('.step-summary p:first-child').textContent.replace('Kết quả: ', '');
            const stepNote = stepItem.querySelector('.step-summary p:last-child').textContent.replace('Ghi chú: ', '');

            // Find the service key by name
            let serviceKey = '';
            for (let i = 0; i < serviceSelect.options.length; i++) {
                if (serviceSelect.options[i].textContent === stepInfo) {
                    serviceKey = serviceSelect.options[i].value;
                    break;
                }
            }
            serviceSelect.value = serviceKey;

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