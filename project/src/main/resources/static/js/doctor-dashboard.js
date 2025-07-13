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

    async function loadTodayBookings() {
        const docId = localStorage.getItem('docId');
        if (!docId) return;

        try {
            const response = await fetch(`/api/booking/doctor/${docId}/today`);
            if (!response.ok) throw new Error('Network error');
            const bookings = await response.json();
            const scheduleList = document.querySelector('.schedule-list');
            if (!scheduleList) return;

            // Lấy node mẫu
            const sample = scheduleList.querySelector('.appointment-item');
            if (!sample) return;

            // Xóa hết cũ, chỉ giữ lại node mẫu (ẩn đi)
            scheduleList.innerHTML = '';

            if (bookings.length === 0) {
                scheduleList.innerHTML = '<div style="padding: 1rem; color: #888;">Không có lịch hẹn hôm nay.</div>';
                return;
            }

            // Xài for...of vì await trong vòng lặp
            for (const b of bookings) {
                // Clone node mẫu
                const clone = sample.cloneNode(true);

                // Call API để lấy tên bệnh nhân và dịch vụ bằng bookId
                let info = { cusName: 'Ẩn danh', serName: 'Dịch vụ' ,startTime: '--:--'};
                try {
                    const infoRes = await fetch(`/api/booking/patient-service/${b.bookId}`);
                    if (infoRes.ok) {
                        info = await infoRes.json();
                    }
                } catch (e) {
                    // Nếu lỗi thì vẫn dùng mặc định
                }

                // Set data
                clone.dataset.patient = b.cusId || '';
                clone.dataset.status = b.bookStatus || '';

                // Time
                clone.querySelector('.time').textContent = info.startTime ? info.startTime.slice(0, 5) : '--:--';

                // Tên BN
                clone.querySelector('.patient-name').textContent = info.cusName || 'Ẩn danh';

                // Tên dịch vụ
                clone.querySelector('.service-name').textContent = info.serName || 'Dịch vụ';

                // Trạng thái + badge
                const badge = clone.querySelector('.status-badge');
                if (b.bookStatus === 'pending') {
                    badge.textContent = 'Không đến khám';
                    badge.className = 'status-badge waiting';
                } 
                if (b.bookStatus === 'completed') {
                    badge.textContent = 'Đã khám xong';
                    badge.className = 'status-badge completed';
                }

                // Action button
                const actions = clone.querySelector('.appointment-actions');
                if (b.bookStatus === 'confirmed') {
                    actions.innerHTML = `<button class="btn-waiting" onclick="window.markAsExamined('${b.cusId}','${b.serId}','${b.docId}','${b.bookId}')">
                    <i class="fas fa-check"></i> Xem hồ sơ
                </button>
                <button class="btn-reject" onclick="window.markAsCancelled('${b.cusId}','${b.serId}','${b.docId}','${b.bookId}')">
                    <i class="fas fa-times"></i> Không đến khám
                </button>
                `;
                } else {
                    actions.innerHTML = '';
                }
                loadAndRenderTestResults(b.bookId);
                // Thêm vào danh sách
                scheduleList.appendChild(clone);
            }
        } catch (err) {
            console.error('Lỗi tải booking:', err);
        }
    }

    // Cập nhật thời gian hiện tại  
    updateCurrentTime();


    // Cập nhật lịch hẹn hôm nay khi trang được tải 
    loadTodayBookings();


    // Show notification
    function showNotification(message, type = 'success') {
        alert(`${type.toUpperCase()}: ${message}`);
    }
    //code tồi
    // Show notification
    function showNotification(message, type = 'error') {
        alert(`${type.toUpperCase()}: ${message}`);
    }

    // Remove old modal functions - will be redefined later to match database structure



    // Patient List Modal functions
    window.openPatientList = function () {
        console.log('Opening patient list...');
        
        // Show modal
        const modal = document.getElementById('patientListModal');
        if (modal) {
            modal.style.display = 'block';
            loadPatientListFromDatabase();
        } else {
            alert('Không tìm thấy modal danh sách bệnh nhân');
        }
    };

    window.closePatientListModal = function () {
        const modal = document.getElementById('patientListModal');
        if (modal) {
            modal.style.display = 'none';
        }
    };

    window.editPatientFromList = function (patientId, bookId) {
        window.closePatientListModal();
        window.viewPatientRecord(patientId, bookId);
    };

    window.searchPatients = function () {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
        const tableBody = document.getElementById('patientTableBody');
        const rows = tableBody.getElementsByTagName('tr');

        for (let i = 0; i < rows.length; i++) {
            const patientName = rows[i].getElementsByTagName('td')[0]?.textContent?.toLowerCase() || '';
            const patientPhone = rows[i].getElementsByTagName('td')[2]?.textContent?.toLowerCase() || '';
            
            // Search by name or phone
            if (patientName.includes(searchTerm) || patientPhone.includes(searchTerm)) {
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

    window.checkout = async function (bookId, cusId) {
        const appointmentItem = document.querySelector(`[data-patient="${cusId}"]`);
        if (!appointmentItem) return;

        const subIds = await getSubServiceIds(bookId);

        let allCompleted = true;
        for (const subId of subIds) {
            const res = await fetch(`/api/booking-steps/check-test-result/${bookId}/${subId}`);
            const step = await res.json();
            if (step.stepStatus !== 'completed') {
                allCompleted = false;
                break;
            }
        }
        if (!allCompleted) {
            showNotification("❌ Vui lòng hoàn thành tất cả các xét nghiệm/bước trước khi checkout!", "error");
            return;
        }
        await fetch(`/api/booking/update-status/${bookId}`, {
            method: 'PUT',
            body: JSON.stringify({ bookStatus: 'completed' }),
            headers: { 'Content-Type': 'application/json' }
        });


        // Update status badge
        const statusBadge = appointmentItem.querySelector('.status-badge');
        statusBadge.textContent = 'Đã khám xong';
        statusBadge.className = 'status-badge completed';


        showNotification("✅ Đã check-out bệnh nhân thành công!", "success");
        loadTodayBookings();
    };



    // Mark patient as cancelled
    window.markAsCancelled = async function (cusId, serId, docId, bookId) {
        const appointmentItem = document.querySelector(`[data-patient="${cusId}"]`);
        if (!appointmentItem) return;
        // 1. Đổi trạng thái UI
        appointmentItem.setAttribute('data-status', 'pending');
        // Ở ngay sau khi đổi trạng thái UI (hoặc trước khi tạo hồ sơ)

        //check trạng thái cus nếu lần đầu đi khám thì xóa Booking còn nếu là tái khám thì cho về lại pending+ setnote là ko đi khám+ liên hệ cus xem cus có muốn tiếp tục dịch vụ không

    }

    // Mark patient as examined
    window.markAsExamined = async function (cusId, serId, docId, bookId) {
        const appointmentItem = document.querySelector(`[data-patient="${cusId}"]`);
        if (!appointmentItem) return;

        // 2. Đổi nút/action
        const actionDiv = appointmentItem.querySelector('.appointment-actions');
        actionDiv.innerHTML = `
            <button class="btn-record" onclick="window.viewPatientRecord('${cusId}', '${bookId}')">
                <i class="fas fa-file-medical"></i> Xem hồ sơ
            </button>
        `;



        // 3. Kiểm tra có medical record chưa, nếu chưa thì tạo
        try {
            // API kiểm tra đã có medical record chưa
            const res = await fetch(`/api/medical-records/exist?cusId=${cusId}&serId=${serId}`);
            const { exists } = await res.json();
            if (!exists) {
                // Tạo mới medical record
                await fetch(`/api/medical-records/create/${serId}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        cusId,
                        docId,
                        serId,
                        recordStatus:'active',
                    })
                });

                // Tạo mới drug
                const drugRes = await fetch(`/api/drugs/create/${bookId}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        docId,
                        cusId,
                    })
                });

                const drugId = await drugRes.json();
                localStorage.setItem('drugId', drugId);



                await fetch(`/api/booking-steps/set-pending/${bookId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ performedAt: new Date().toISOString() })
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
    window.viewPatientRecord = async function (cusId, bookId) {
        try {
            // 1. Gọi API
            const res = await fetch(`/api/customer/full-record/${cusId}, ${bookId}`);
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
            modal.dataset.bookId = patientData.currentBooking.bookId || '';

            const btnCheckout = modal.querySelector('.btn-primary[onclick*="checkout"]');
            if (btnCheckout) {
                btnCheckout.onclick = function () {
                    window.checkout(modal.dataset.bookId, modal.dataset.patientId);
                }
            }


        } catch (err) {
            console.error(err);
            alert("Lỗi khi lấy dữ liệu bệnh nhân!");
        }
    };




    // Update close modal functions
    window.closeModal = function () {
        document.getElementById('patientModal').style.display = 'none';
        localStorage.removeItem('drugId');
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

        const stepsArr = Array.from(document.querySelectorAll('#completedStepsList .step-item'))
            .filter(item => !item.classList.contains('step-template'))
            .map(stepDiv => {
                let performedAt = stepDiv.querySelector('.step-time')?.textContent.trim() || '';
                if (performedAt.match(/^\d{2}\/\d{2}\/\d{4}/)) {
                    const [date, time] = performedAt.split(' ');
                    const [d, m, y] = date.split('/');
                    performedAt = `${y}-${m}-${d}T${time}:00`;
                }

                // LẤY stepStatus đúng từ node:
                let stepStatus = stepDiv.querySelector('.step-status')?.getAttribute('data-status') || 'pending';

                return {
                    subId: parseInt(stepDiv.getAttribute('data-sub-id')),
                    performedAt,
                    result: stepDiv.querySelector('.step-result')?.textContent.trim() || '',
                    note: stepDiv.querySelector('.step-note')?.textContent.trim() || '',
                    stepStatus,
                };
            });

        // (4) Lấy danh sách đơn thuốc

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
                await fetch(`/api/booking-steps/update-with-booking/${bookId}/${step.subId}`, {
                    method: 'PUT',
                    body: JSON.stringify(step),
                    headers: { 'Content-Type': 'application/json' }
                });
            }

            // (4) Gọi API insert Drug cho từng thuốc


            alert('Đã lưu hồ sơ bệnh án thành công!');

        } catch (err) {
            console.error('Lỗi khi lưu hồ sơ bệnh án:', err);
            alert('Lỗi khi lưu hồ sơ bệnh án!');
        }
    };

    // Additional utility functions for sidebar
    // openScheduleManager function is already defined in doctor-common.js
    // Removed duplicate definition to avoid conflicts

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

    // ========== EDITABLE TEST RESULTS FUNCTIONS ==========
    window.addNewTestItem = function () {
        const testContainer = document.querySelector('.booking-steps-results');
        const testCount = testContainer.querySelectorAll('.step-result-item').length + 1;

        const newTestItem = document.createElement('div');
        newTestItem.className = 'step-result-item';
        newTestItem.innerHTML = `
        <div class="step-result-header">
            <div class="step-info">
                <h6 contenteditable="true" class="editable-title">Xét nghiệm mới ${testCount}</h6>
                <input type="datetime-local" class="editable-date" value="${new Date().toISOString().slice(0, 16)}">
            </div>
            <select class="step-status-select">
                <option value="completed">Hoàn thành</option>
                <option value="pending" selected>Đang chờ</option>
                <option value="cancelled">Đã hủy</option>
            </select>
        </div>
        <div class="step-result-content">
            <div class="result-grid">
                ${createResultItemHtml()}
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
        if (typeof showNotification === 'function') {
            showNotification('Đã thêm xét nghiệm mới!', 'success');
        }
    };

    function createResultItemHtml(label = '', value = '', unit = '', status = 'Bình thường', editable = true) {
        return `
        <div class="result-item">
            <input type="text" class="editable-label" value="${label}" placeholder="Tên chỉ số" ${editable ? '' : 'readonly'}>
            :
            <input type="text" class="editable-result" value="${value}" placeholder="Giá trị" ${editable ? '' : 'readonly'}>
            <select class="unit-select" ${editable ? '' : 'disabled'}>
                <option value="triệu/ml"${unit === 'triệu/ml' ? ' selected' : ''}>triệu/ml</option>
                <option value="mg/ml"${unit === 'mg/ml' ? ' selected' : ''}>mg/ml</option>
                <option value="mIU/ml"${unit === 'mIU/ml' ? ' selected' : ''}>mIU/ml</option>
                <option value="ng/ml"${unit === 'ng/ml' ? ' selected' : ''}>ng/ml</option>
                <option value="pg/ml"${unit === 'pg/ml' ? ' selected' : ''}>pg/ml</option>
                <option value="%"${unit === '%' ? ' selected' : ''}>%</option>
            </select>
            <select class="status-select" ${editable ? '' : 'disabled'}>
                <option value="Bình thường"${status === 'Bình thường' ? ' selected' : ''}>Bình thường</option>
                <option value="Cao"${status === 'Cao' ? ' selected' : ''}>Cao</option>
                <option value="Thấp"${status === 'Thấp' ? ' selected' : ''}>Thấp</option>
                <option value="Bất thường"${status === 'Bất thường' ? ' selected' : ''}>Bất thường</option>
            </select>
            ${editable ? `
                <button type="button" class="remove-test-item-btn" onclick="removeTestResultItem(this)">
                    <i class="fas fa-trash"></i> Xóa
                </button>
            ` : ''}
        </div>
    `;
    }



    // Add test result row to existing test
    window.addTestResultRow = function (button) {
        const resultGrid = button.parentElement.querySelector('.result-grid');
        resultGrid.insertAdjacentHTML('beforeend', createResultItemHtml());
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
        const testResults = [];
        testItems.forEach(item => {
            const bookingStepId = item.dataset.bookingStepId || null;
            const subId = item.dataset.subId;
            const subName = item.querySelector('.editable-title').textContent.trim();
            const performedAt = item.querySelector('.editable-date').value;
            const stepStatus = item.querySelector('.step-status-select').value;
            const note = item.querySelector('.editable-note').value;

            const results = [];
            item.querySelectorAll('.result-item').forEach(resultItem => {
                results.push({
                    indexName: resultItem.querySelector('.editable-label').value.trim(),
                    value: resultItem.querySelector('.editable-result').value.trim(),
                    unit: resultItem.querySelector('.unit-select').value,
                    status: resultItem.querySelector('.status-select').value
                });
            });

            testResults.push({
                bookingStepId,
                subId,
                subName,
                performedAt,
                results,
                note,
                stepStatus
            });
        });
        // LOG PAYLOAD TRƯỚC KHI GỬI
        console.log("Test Results Payload:", testResults);

        // Gửi về backend: /api/booking-steps/save-test-results
        fetch('/api/booking-steps/save-test-results', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testResults)
        })
            .then(async res => {
                // Log toàn bộ response nếu bị lỗi
                if (!res.ok) {
                    const errMsg = await res.text();
                    console.error("API save-test-results error:", errMsg);
                    throw new Error(errMsg);
                }
                return res.json();
            })
            .then(data => {
                if (typeof showNotification === 'function') showNotification('Đã lưu tất cả kết quả xét nghiệm!', 'success');
                else alert('Đã lưu tất cả kết quả xét nghiệm!');
            })
            .catch((err) => {
                alert('Lưu thất bại!');
                console.error('Lỗi khi lưu test results:', err);
            });
    };



    // Render test results from backend
    // This function should be called after fetching test results from the API
    window.renderTestResults = function (testResults) {
        const testContainer = document.querySelector('.booking-steps-results');
        testContainer.innerHTML = ''; // clear cũ

        testResults.forEach(test => {
            const isEditable = test.stepStatus !== 'completed';
            const newTestItem = document.createElement('div');
            newTestItem.className = 'step-result-item';
            newTestItem.dataset.bookingStepId = test.bookingStepId || '';
            newTestItem.dataset.subId = test.subId;

            // editable-title: chỉ cho edit nếu chưa completed
            const titleReadOnly = isEditable ? 'contenteditable="true"' : 'contenteditable="false"';
            // Thêm nút "Thêm chỉ số" nếu còn edit
            const addRowBtn = isEditable ? `
            <button type="button" class="add-test-item-btn" onclick="addTestResultRow(this)" style="margin-top: 8px; padding: 8px 16px; font-size: 0.8rem;">
                <i class="fas fa-plus"></i> Thêm chỉ số
            </button>` : '';

            newTestItem.innerHTML = `
            <div class="step-result-header">
                <div class="step-info">
                    <h6 ${titleReadOnly} class="editable-title">${test.subName || ''}</h6>
                    <input type="datetime-local" class="editable-date" value="${formatDateTimeLocal(test.performedAt)}" ${isEditable ? '' : 'readonly'}>
                </div>
                <select class="step-status-select" ${isEditable ? '' : 'disabled'}>
                    <option value="completed"${test.stepStatus === 'completed' ? ' selected' : ''}>Hoàn thành</option>
                    <option value="pending"${test.stepStatus === 'pending' ? ' selected' : ''}>Đang chờ</option>
                    <option value="cancelled"${test.stepStatus === 'inactive' ? ' selected' : ''}>Không kích hoạt</option>
                </select>
            </div>
            <div class="step-result-content">
                <div class="result-grid"></div>
                ${addRowBtn}
                <div class="result-note">
                    <strong>Ghi chú:</strong>
                    <textarea class="editable-note" placeholder="Nhập ghi chú..." ${isEditable ? '' : 'readonly'}>${test.note || ''}</textarea>
                </div>
                ${isEditable ? `<button type="button" class="remove-test-item-btn" onclick="removeTestItem(this)" style="margin-top: 16px;"><i class="fas fa-trash"></i> Xóa toàn bộ xét nghiệm</button>` : ''}
            </div>
        `;

            // Render từng result-item, cho xóa nếu isEditable
            const grid = newTestItem.querySelector('.result-grid');
            (test.results || []).forEach(res => {
                grid.insertAdjacentHTML('beforeend', createResultItemHtml(
                    res.indexName || '',
                    res.value || '',
                    res.unit || '',
                    res.status || 'Bình thường',
                    isEditable // truyền cờ này xuống để show/hide nút xóa
                ));
            });
            if (!test.results || !test.results.length) {
                grid.insertAdjacentHTML('beforeend', createResultItemHtml('', '', '', 'Bình thường', isEditable));
            }
            testContainer.appendChild(newTestItem);
        });
    };





    function formatDateTimeLocal(isoString) {
        if (!isoString) return '';
        const date = new Date(isoString);
        // Trả ra format yyyy-MM-ddTHH:mm cho input type="datetime-local"
        return date.toISOString().slice(0, 16);
    }
    // Ví dụ gọi API khi chuyển tab/hoặc khi load trang
    async function loadAndRenderTestResults(bookId) {
        try {
            const res = await fetch(`/api/booking-steps/test-results/${bookId}`); // Sửa path nếu cần
            if (!res.ok) throw new Error('API error');
            const data = await res.json();
            // Log kết quả subservice:
            console.log('Test Results API:', data);


            window.renderTestResults(data);
        } catch (e) {
            window.renderTestResults([]); // Hiện form trống
        }
    }




    // ========== SERVICE SELECTION AND STEP FORM ==========


    // Lưu subId/subName khi chọn option (nên khai báo biến ở ngoài nếu muốn dùng sau)
    let selectedSubId = null;
    let selectedSubName = '';

    function setupServiceSelection(bookId) {
        const serviceSelect = document.getElementById('serviceSelect');
        const stepForm = document.getElementById('stepForm');
        const selectedServiceTitle = document.getElementById('selectedServiceTitle');
        const emptyStepsDiv = document.getElementById('emptySteps');

        // 1. Fetch subservice list
        fetch(`/api/booking-steps/${bookId}/subservice-of-visit`)
            .then(res => {
                if (!res.ok) throw new Error(`API lỗi: ${res.status}`);
                return res.json();
            })
            .then(async subs => {
                serviceSelect.innerHTML = '<option value="">-- Chọn dịch vụ/bước --</option>';
                if (!Array.isArray(subs) || subs.length === 0) {
                    serviceSelect.innerHTML = '<option value="">Không có bước nào</option>';
                    emptyStepsDiv.style.display = '';
                    return;
                }
                for (const sub of subs) {
                    const opt = document.createElement('option');
                    opt.value = sub.subId;
                    opt.textContent = sub.subName;
                    serviceSelect.appendChild(opt);

                    try {
                        await fetch(`/api/booking-steps/set-pending/${bookId}/${sub.subId}`, {
                            method: 'PUT',
                            body: JSON.stringify({
                                stepStatus: 'pending',
                                performedAt: new Date().toISOString(),
                                note: 'Đang tiến hành...',
                            }),
                            headers: { 'Content-Type': 'application/json' }
                        });
                    } catch (e) {
                        console.error('Lỗi update step:', bookId, sub.subId, e);
                    }
                }

                // **ĐÂY LÀ ĐIỂM QUAN TRỌNG NHẤT**
                // Gán lại onchange sau khi render options!
                serviceSelect.onchange = function () {
                    const selectedOption = this.options[this.selectedIndex];
                    if (this.value) {
                        selectedSubId = this.value;
                        selectedSubName = selectedOption.textContent;

                        selectedServiceTitle.innerHTML = `<i class="fas fa-edit"></i> Thực hiện: ${selectedSubName}`;
                        stepForm.style.display = 'block';
                        document.getElementById('performedAt').value = getLocalDateTimeValue();
                        document.getElementById('stepResult').value = '';
                        document.getElementById('stepNote').value = '';
                        document.getElementById('stepStatus').value = 'pending';
                    } else {
                        stepForm.style.display = 'none';
                        selectedSubId = null;
                        selectedSubName = '';
                    }
                };

                // Nếu cần mặc định ẩn form
                stepForm.style.display = 'none';
            })
            .catch(err => {
                console.error('Lỗi lấy subservice:', err);
                serviceSelect.innerHTML = '<option value="">Không có bước nào</option>';
                emptyStepsDiv.style.display = '';
            });
    }

    async function getSubServiceIds(bookId) {
        const res = await fetch(`/api/booking-steps/${bookId}/subservice-of-visit`);
        if (!res.ok) return [];
        const subs = await res.json();
        return Array.isArray(subs) ? subs.map(sub => sub.subId) : [];
    }





    window.saveBookingStep = function () {
        const serviceSelect = document.getElementById('serviceSelect');
        const performedAt = document.getElementById('performedAt').value;
        const stepStatus = document.getElementById('stepStatus').value; // 'pending', 'completed', 'inactive'
        const stepResult = document.getElementById('stepResult').value;
        const stepNote = document.getElementById('stepNote').value;
        const selectedServiceTitle = document.getElementById('selectedServiceTitle');

        if (!serviceSelect.value || !performedAt || !stepResult) {
            alert('Vui lòng điền đầy đủ thông tin bắt buộc!');
            return;
        }

        const subId = serviceSelect.value;
        const subName = serviceSelect.options[serviceSelect.selectedIndex].textContent;
        const dateTime = new Date(performedAt);
        const formattedDateTime = `${dateTime.getDate().toString().padStart(2, '0')}/${(dateTime.getMonth() + 1).toString().padStart(2, '0')}/${dateTime.getFullYear()} ${dateTime.getHours().toString().padStart(2, '0')}:${dateTime.getMinutes().toString().padStart(2, '0')}`;

        const statusClass = stepStatus;
        const statusText = {
            'pending': 'Đang thực hiện',
            'completed': 'Đã hoàn thành',
            'inactive': 'Không hoạt động',
        }[stepStatus];

        const stepsList = document.getElementById('completedStepsList');
        const stepTemplate = stepsList.querySelector('.step-template');
        const newStepId = Date.now();

        if (window.currentEditingStepId) {
            const oldStepItem = stepsList.querySelector(`[data-step-id="${window.currentEditingStepId}"]`);
            if (oldStepItem) oldStepItem.remove();
            window.currentEditingStepId = null;
        }

        const newStepItem = stepTemplate.cloneNode(true);
        newStepItem.style.display = '';
        newStepItem.classList.remove('step-template');
        newStepItem.classList.add('step-item', statusClass);
        newStepItem.setAttribute('data-step-id', newStepId);
        newStepItem.setAttribute('data-sub-id', subId);
        newStepItem.setAttribute('data-sub-name', subName);

        // Gán dữ liệu vào DOM node
        newStepItem.querySelector('.step-info strong').textContent = subName;
        newStepItem.querySelector('.step-time').textContent = formattedDateTime;
        newStepItem.querySelector('.step-status').textContent = statusText;
        newStepItem.querySelector('.step-status').className = 'step-status ' + statusClass;
        newStepItem.querySelector('.step-status').setAttribute('data-status', statusClass);
        newStepItem.querySelector('.step-result').textContent = stepResult;
        newStepItem.querySelector('.step-note').textContent = stepNote;
        newStepItem.querySelector('.btn-edit-step').onclick = function () {
            window.editStep(newStepId);
        };

        stepsList.insertBefore(newStepItem, stepsList.firstChild);

        updateEmptyStepsNotice();
        cancelStepForm();

        alert('Đã lưu bước thực hiện thành công!');
    };


    function updateEmptyStepsNotice() {
        const stepsList = document.getElementById('completedStepsList');
        const emptyDiv = document.getElementById('emptySteps');
        // Đếm số node KHÔNG phải template
        const realItems = Array.from(stepsList.children).filter(child => !child.classList.contains('step-template'));
        if (realItems.length === 0) {
            emptyDiv.style.display = '';
        } else {
            emptyDiv.style.display = 'none';
        }
    }

    window.cancelStepForm = function () {
        document.getElementById('stepForm').style.display = 'none';
        document.getElementById('serviceSelect').value = '';
        document.getElementById('stepResult').value = '';
        document.getElementById('stepNote').value = '';
        document.getElementById('stepStatus').value = 'pending';
        window.currentEditingStepId = null;

        updateEmptyStepsNotice();
    };

    window.editStep = function (stepId) {
        const stepsList = document.getElementById('completedStepsList');
        const stepItem = stepsList.querySelector(`[data-step-id="${stepId}"]`);
        if (stepItem) {
            const serviceSelect = document.getElementById('serviceSelect');
            const selectedServiceTitle = document.getElementById('selectedServiceTitle');
            const subId = stepItem.getAttribute('data-sub-id');
            const subName = stepItem.getAttribute('data-sub-name');
            const stepResult = stepItem.querySelector('.step-result').textContent;
            const stepNote = stepItem.querySelector('.step-note').textContent;
            // Không cần lấy formattedDateTime vì khi edit thường để user nhập lại performedAt

            // Chọn đúng dịch vụ
            serviceSelect.value = subId;
            selectedServiceTitle.innerHTML = `<i class="fas fa-edit"></i> Chỉnh sửa: ${subName}`;
            document.getElementById('stepResult').value = stepResult;
            document.getElementById('stepNote').value = stepNote;

            // Show form
            document.getElementById('stepForm').style.display = 'block';

            // Store editing step ID for later removal
            window.currentEditingStepId = stepId;
        }
    };

    // ========== PRESCRIPTION TAB FUNCTIONS ==========
    // Drug counter for unique IDs
    let drugCounter = 0;

    window.addDrugPrescription = function () {
        drugCounter++;
        const drugsList = document.getElementById('drugsList');

        const itemId = `drugItem${drugCounter}`;

        const newDrugItem = document.createElement('div');
        newDrugItem.className = 'drug-item';
        newDrugItem.innerHTML = `
        <div class="drug-header">
            <h6><i class="fas fa-capsules"></i> Thuốc #${drugCounter}</h6>
            <button type="button" class="btn-remove-drug" onclick="window.removeDrugPrescription(this)" title="Xóa thuốc này">
                <i class="fas fa-trash"></i>
            </button>
        </div>
        <div class="drug-content">
            <div class="record-grid">
                <div class="record-section">
                    <label><i class="fas fa-pills"></i> Tên thuốc:</label>
                    <input type="text" placeholder="Nhập tên thuốc..." id="drugName-${itemId}" class="form-control">
                </div>
                <div class="record-section">
                    <label><i class="fas fa-weight"></i> Hàm lượng:</label>
                    <input type="text" placeholder="Ví dụ: 5mg" id="dosage-${itemId}" class="form-control">
                </div>
            </div>
            <div class="record-section">
                <div class="record-section">
                    <label><i class="fas fa-clock"></i> Tần suất sử dụng:</label>
                    <input type="text" id="frequency-${itemId}" class="form-control">
                </div>
                <div class="record-section">
                    <label><i class="fas fa-calendar-days"></i> Thời gian dùng:</label>
                    <input type="text" placeholder="Ví dụ: 30 ngày" value="30 ngày" id="duration-${itemId}" class="form-control">
                </div>
            </div>
            <div class="record-section">
                <label><i class="fas fa-comment-medical"></i> Hướng dẫn sử dụng & Lưu ý:</label>
                <textarea rows="2" placeholder="Ghi chú cách sử dụng thuốc..." id="drugItemNote-${itemId}" class="form-control"></textarea>
            </div>
        </div>
    `;

        drugsList.appendChild(newDrugItem);
    };

    // Fill prescription header with doctor name and drug ID
    const drugId = localStorage.getItem('drugId') || '';
    function fillPrescriptionHeader() {
        const nameInput = document.getElementById('prescribingDoctorName');


        const fullName = localStorage.getItem('docFullName');


        if (nameInput) nameInput.value = fullName || '';


        // lấy ttin dưới db lên bằng api

    }
    fillPrescriptionHeader();

    // Remove drug item
    window.removeDrugPrescription = function (button) {
        const drugItem = button.closest('.drug-item');
        if (!drugItem) return;

        if (confirm('Bạn có chắc chắn muốn xóa thuốc này?')) {
            drugItem.style.transition = 'all 0.3s ease';
            drugItem.style.opacity = '0';
            drugItem.style.transform = 'translateX(-20px)';

            setTimeout(() => {
                drugItem.remove();
                updatePrescriptionSummary();
                renumberDrugs();
            }, 300);
        }
    };

    // Renumber drug items
    function renumberDrugs() {
        const items = document.querySelectorAll('#drugsList .drug-item');
        items.forEach((item, idx) => {
            const header = item.querySelector('.drug-header h6');
            if (header) header.innerHTML = `<i class="fas fa-capsules"></i> Thuốc #${idx + 1}`;
        });
    }

    // Update summary
    function updatePrescriptionSummary() {
        const items = document.querySelectorAll('#drugsList .drug-item');
        const count = items.length;
        document.querySelector('#prescriptionTab .stat-item .stat-number').textContent = count;
    }


    function collectPrescriptionData() {
        const drugs = [];
        const drugItems = document.querySelectorAll('#prescriptionTab .drug-item');

        drugItems.forEach(item => {
            const drugNameInput = item.querySelector('input[id^="drugName-"]');
            const dosageInput = item.querySelector('input[id^="dosage-"]');
            const frequencyInput = item.querySelector('input[id^="frequency-"]');
            const durationInput = item.querySelector('input[id^="duration-"]');
            const instructionsTextarea = item.querySelector('textarea[id^="drugItemNote-"]');

            const drugName = drugNameInput?.value?.trim() || '';
            const dosage = dosageInput?.value?.trim() || '';
            const frequency = frequencyInput?.value?.trim() || '';
            const duration = durationInput?.value?.trim() || '';
            const drugItemNote = instructionsTextarea?.value?.trim() || '';

            if (drugName !== '') {
                drugs.push({
                    drugName,
                    dosage,
                    frequency,
                    duration,
                    drugItemNote,
                });
            }
        });


        document.querySelector('#prescriptionNumber').value = localStorage.getItem('drugId') || '';
        // Final prescription data
        return {
            prescriptionNumber: document.getElementById('prescriptionNumber')?.value || '',
            prescriptionDate: document.getElementById('prescriptionDate')?.value || '',
            doctorName: document.getElementById('prescribingDoctorName')?.value || '',
            diagnosis: document.getElementById('prescriptionDiagnosis')?.value || '',
            drugs: drugs,
            generalNotes: document.getElementById('generalNotes')?.value || '',

        };
    }

    window.savePrescription = async function () {
        const data = collectPrescriptionData();

        const drugId = localStorage.getItem('drugId') || '';

        if (!data.prescriptionNumber) {
            showNotification('❌ Không tìm thấy prescriptionNumber. Vui lòng kiểm tra lại.', 'error');
            return;
        }

        try {
            // 1. Cập nhật bảng Drug
            const updateDrugRes = await fetch(`/api/drugs/update/${drugId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    createdAt: data.prescriptionDate || new Date().toISOString(),
                    note: data.diagnosis || ''
                })
            });

            if (!updateDrugRes.ok) throw new Error('Không thể cập nhật đơn thuốc');

            // 2. Tạo mới các bản ghi DrugItem liên kết với drugId
            const drugItemsPayload = data.drugs.map(item => ({
                drugName: item.drugName,
                dosage: item.dosage,
                frequency: item.frequency,
                duration: item.duration,
                drugItemNote: item.drugItemNote
            }));

            const drugItemRes = await fetch(`/api/drug-items/create/${drugId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(drugItemsPayload)
            });

            if (!drugItemRes.ok) throw new Error('Không thể lưu thuốc con');

            showNotification('💊 Đã lưu đơn thuốc thành công!', 'success');
        } catch (err) {
            console.error(err);
            showNotification('❌ Có lỗi khi lưu đơn thuốc', 'error');
        }
    };



    window.previewPrescription = function () {

        const prescriptionData = collectPrescriptionData();

        const previewContent = `
        <div style="max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background: white;">
            <h3 style="text-align: center; margin-bottom: 20px;">Xem trước đơn thuốc</h3>
            <div style="margin-bottom: 15px;">
                <strong>Chẩn đoán:</strong> ${prescriptionData.diagnosis}
            </div>
            <div style="margin-bottom: 15px;">
                <strong>Danh sách thuốc:</strong>
                <ul style="margin-left: 20px;">
                    ${prescriptionData.drugs.map((drug, index) => `
                        <li style="margin-bottom: 10px;">
                            <strong>${drug.name} ${drug.dosage}</strong><br>
                            ${drug.frequency}, ${drug.duration}<br>
                            <em>${drug.instructions}</em>
                        </li>
                    `).join('')}
                </ul>
            </div>
            <div style="margin-bottom: 15px;">
                <strong>Lời dặn:</strong> ${prescriptionData.generalNotes}
            </div>
            <div style="text-align: center; margin-top: 20px;">
                <button onclick="this.parentElement.parentElement.remove()" style="padding: 8px 16px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer;">Đóng</button>
            </div>
        </div>
    `;

        const overlay = document.createElement('div');
        overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.6);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
        overlay.innerHTML = previewContent;

        overlay.addEventListener('click', function (e) {
            if (e.target === overlay) {
                overlay.remove();
            }
        });

        document.body.appendChild(overlay);
    };


    // Patient List functionality is defined outside DOMContentLoaded for global access



});