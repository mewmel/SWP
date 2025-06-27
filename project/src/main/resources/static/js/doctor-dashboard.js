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
                clone.querySelector('.service-name').textContent = b.serviceName || 'Dịch vụ';

                // Trạng thái + badge
                const badge = clone.querySelector('.status-badge');
                if (b.bookStatus === 'confirmed') {
                    badge.textContent = 'Đang chờ khám';
                    badge.className = 'status-badge waiting';
                } else if (b.bookStatus === 'ongoing') {
                    badge.textContent = 'Đang khám';
                    badge.className = 'status-badge ongoing';
                } else if (b.bookStatus === 'completed') {
                    badge.textContent = 'Đã khám';
                    badge.className = 'status-badge completed';
                } else {
                    badge.textContent = 'Không rõ';
                    badge.className = 'status-badge';
                }

                // Action button
                const actions = clone.querySelector('.appointment-actions');
                if (b.bookStatus === 'confirmed') {
                    actions.innerHTML = `<button class="btn-waiting" onclick="window.markAsExamined('${b.cusId}')">
                    <i class="fas fa-check"></i> Đã khám
                </button>`;
                } else if (b.bookStatus === 'ongoing') {
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
    window.markAsExamined = function (cusId) {
        const appointmentItem = document.querySelector(`[data-patient="${cusId}"]`);
        if (!appointmentItem) return;

        // Update status
        appointmentItem.setAttribute('data-status', 'confirmed');

        // Update status badge
        const statusBadge = appointmentItem.querySelector('.status-badge');
        statusBadge.textContent = 'Đã xác nhận';
        statusBadge.className = 'status-badge confirmed';

        // Update action button
        const actionDiv = appointmentItem.querySelector('.appointment-actions');
        actionDiv.innerHTML = `
            <button class="btn-record" onclick="window.viewPatientRecord('${cusId}')">
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

    // Load sub-services for booking
    function loadSubServicesForBooking(bookId) {
        fetch(`/api/booking-steps/${bookId}`)
            .then(res => {
                if (!res.ok) throw new Error(`API lỗi: ${res.status}`);
                return res.json();
            })
            .then(steps => {
                // Kiểm tra array
                const select = document.getElementById('serviceSelect');
                select.innerHTML = '<option value="">-- Chọn dịch vụ/bước --</option>';
                if (!Array.isArray(steps) || steps.length === 0) {
                    select.innerHTML = '<option value="">Không có bước nào</option>';
                    // Ẩn completedStepsList, show emptySteps nếu muốn
                    document.getElementById('completedStepsList').innerHTML = '';
                    document.getElementById('emptySteps').style.display = '';
                    return;
                }
                // Show bước đã thực hiện (completedStepsList)
                renderCompletedSteps(steps);
                // Nạp các bước vào dropdown
                steps.forEach(step => {
                    const opt = document.createElement('option');
                    opt.value = step.bookingStepId; // unique id cho mỗi bước
                    opt.textContent = step.subName;
                    select.appendChild(opt);
                });
            })
            .catch(err => {
                console.error('Lỗi lấy subservice:', err);
                const select = document.getElementById('serviceSelect');
                select.innerHTML = '<option value="">Không có bước nào</option>';
                document.getElementById('completedStepsList').innerHTML = '';
                document.getElementById('emptySteps').style.display = '';
            });
    }

    // Render danh sách các bước đã thực hiện ở dưới (nếu có)
    function renderCompletedSteps(steps) {
        const list = document.getElementById('completedStepsList');
        const empty = document.getElementById('emptySteps');
        list.innerHTML = '';
        let hasCompleted = false;
        steps.forEach(step => {
            const item = document.createElement('div');
            item.className = 'step-item completed';
            item.setAttribute('data-step-id', step.bookingStepId);
            item.innerHTML = `
            <div class="step-header">
                <div class="step-info">
                    <strong>${step.subName}</strong>
                    <span class="step-time"></span>
                </div>
                <div class="step-actions">
                    <button class="btn-edit-step" onclick="editStep(${step.bookingStepId})">
                        <i class="fas fa-edit"></i>
                    </button>
                </div>
            </div>
            <div class="step-summary">
                <p><strong>Kết quả:</strong> ${step.result || ''}</p>
                <p><strong>Ghi chú:</strong> ${step.note || ''}</p>
            </div>
        `;
            list.appendChild(item);
            hasCompleted = true;
        });
        // Ẩn/hiện empty state
        if (hasCompleted) {
            empty.style.display = 'none';
        } else {
            empty.style.display = '';
        }
    }

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
                document.getElementById('serviceName').value = patientData.currentBooking.serName || '';
            }
            // Load sub-services cho booking này
            if (patientData.currentBooking.bookId) {
                loadSubServicesForBooking(patientData.currentBooking.bookId);
            }


            // 4. Hồ sơ y tế hiện tại
            if (patientData.currentMedicalRecord) {
                const mr = patientData.currentMedicalRecord;
                document.getElementById('recordStatus').value = mr.recordStatus || '';
                document.getElementById('recordCreatedDate').value = mr.dischargeDate ? mr.dischargeDate : '';
                document.getElementById('diagnosis').value = mr.diagnosis || '';
                document.getElementById('treatmentPlan').value = mr.treatmentPlan || '';
                document.getElementById('dischargeDate').value = mr.dischargeDate || '';
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

    // Lấy thông tin booking (nếu cần update)
    const bookType = document.getElementById('bookType').value;
    const bookStatus = document.getElementById('bookStatus').value;
    const bookingNote = document.getElementById('bookingNote').value;
    const serviceName = document.getElementById('serviceName').value;
    // ... nếu có bookingId thì lấy trong localStorage hoặc patient.currentBooking.bookId (nếu có truyền lên)

    // Lấy thông tin medical record
    const recordStatus = document.getElementById('recordStatus').value;
    const diagnosis = document.getElementById('diagnosis').value;
    const treatmentPlan = document.getElementById('treatmentPlan').value;
    const dischargeDate = document.getElementById('dischargeDate').value;
    const medicalNote = document.getElementById('medicalNote').value;

    // Lấy bookingId (nếu dùng)
    const bookId = localStorage.getItem('bookId') || '';

    // Tạo object dữ liệu gửi đi (tuỳ bạn muốn update gì)
    const updateData = {
        cusId: patientId,
        currentBooking: {
            bookId,
            bookType,
            bookStatus,
            note: bookingNote,
            serName: serviceName
        },
        currentMedicalRecord: {
            recordStatus,
            diagnosis,
            treatmentPlan,
            dischargeDate,
            medicalNotes: medicalNote
        }
    };

    try {
        // Gửi dữ liệu cập nhật về backend 
        const response = await fetch(`/api/customer/update-full-record/${patientId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateData)
        });

        if (!response.ok) throw new Error('API lỗi: ' + response.status);

        // Thành công
        if (typeof showNotification === 'function') {
            showNotification('Đã lưu thay đổi hồ sơ bệnh án!', 'success');
        } else {
            alert('Đã lưu thay đổi hồ sơ bệnh án!');
        }

        window.closeModal();
    } catch (err) {
        console.error('Lỗi khi lưu hồ sơ:', err);
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
        serviceSelect.addEventListener('change', function () {
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

    window.cancelStepForm = function () {
        stepForm.style.display = 'none';
        serviceSelect.value = '';
        document.getElementById('stepResult').value = '';
        document.getElementById('stepNote').value = '';
        document.getElementById('stepStatus').value = 'in-progress';
        window.currentEditingStepId = null;
    };

    window.editStep = function (stepId) {
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