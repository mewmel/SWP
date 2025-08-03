document.addEventListener('DOMContentLoaded', function () {
    // ========== GIỮ TRẠNG THÁI ĐĂNG NHẬP ==========
    // Sử dụng hàm chung từ doctor-common.js
    // Không cần duplicate logic ở đây nữa



    // ========== ĐĂNG XUẤT ==========
    // Sử dụng hàm logout chung từ doctor-common.js
    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function (e) {
            e.preventDefault();
            logout(); // Gọi hàm chung
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
                clone.dataset.bookid = b.bookId || '';

                // Time
                clone.querySelector('.time').textContent = info.startTime ? info.startTime.slice(0, 5) : '--:--';

                // Tên BN
                clone.querySelector('.patient-name').textContent = info.cusName || 'Ẩn danh';

                // Tên dịch vụ
                clone.querySelector('.service-name').textContent = info.serName || 'Dịch vụ';

                // Trạng thái + badge
                const badge = clone.querySelector('.status-badge');
                if (b.bookStatus === 'pending') {
                    badge.textContent = 'Chưa xác nhận';
                    badge.className = 'status-badge waiting';
                } else if (b.bookStatus === 'rejected') {
                    badge.textContent = 'Không đến khám';
                    badge.className = 'status-badge rejected';
                } else if (b.bookStatus === 'confirmed') {
                    badge.textContent = 'Đã xác nhận';
                    badge.className = 'status-badge confirmed';
                } else if (b.bookStatus === 'completed') {
                    badge.textContent = 'Đã khám xong';
                    badge.className = 'status-badge completed';
                }

                // Action button
                const actions = clone.querySelector('.appointment-actions');
                if (b.bookStatus === 'confirmed') {
                    actions.innerHTML = `<button class="btn-waiting" onclick="window.markAsExamined('${b.cusId}','${b.serId}','${b.docId}','${b.bookId}')">
                    <i class="fas fa-check"></i> Đã đến khám
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

window.checkout = async function (bookId, cusId, bookType) {
    const appointmentItem = document.querySelector(`[data-patient="${cusId}"]`);
    if (!appointmentItem) return;

    let subIds = [];
    if (bookType === 'follow-up') {
        subIds = await getSubServiceIds(bookId);
    } else if (bookType === 'initial') {
        subIds = await getSubServiceIdsForInitial(bookId);
    }

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

    showNotification("✅ Đã check-out bệnh nhân thành công!", "success");
    closeModal();
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
        const appointmentItem = document.querySelector(`[data-bookid="${bookId}"]`);
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
            const mres = await fetch(`/api/medical-records/exist?cusId=${cusId}&serId=${serId}`);
            const { exists } = await mres.json();
            if (!exists) {
                // Tạo mới medical record

                const createRes = await fetch(`/api/medical-records/create/${serId}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        cusId,
                        docId,
                        serId,
                        recordStatus:'active',
                    })
                });
                const createData = await createRes.json();
                const recordId = createData.recordId;
                
                // gắn cặp bookId & recordId vào MedicalRecordBooking
                await fetch(`/api/medical-records-booking/create/${recordId},${bookId}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        recordId,
                        bookId
                    })
                });



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
        //4.  nếu có medicalRecord rồi thì kiểm tra xem trường drugId của booking đó có chưa            
            const dres = await fetch(`/api/booking/${bookId}/has-drug`);
            const { hasDrug } = await dres.json();
            // nếu chưa thì tạo mới rồi gán vô
            if(!hasDrug) {
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

                    // Gán drugId cho booking:
                    await fetch(`/api/booking/${bookId}/set-drug/${drugId}`, {
                        method: 'PUT'
                    });
                    
                    // ✅ FIX: Lưu drugId vào localStorage sau khi tạo mới
                    localStorage.setItem('drugId', drugId);
    
                    if (typeof showNotification === 'function') console.log('Đã tạo đơn thuốc cho booking:', bookId);
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
            
            // ✅ FIX: Fill prescription header when switching to prescription tab
            if (tabName === 'prescription') {
                fillPrescriptionHeader();
            }
            
            // Load medical history when switching to history tab
            if (tabName === 'history') {
                const cusId = localStorage.getItem('cusId');
                const bookId = localStorage.getItem('bookId');
                
                if (cusId) {
                    window.loadMedicalHistory(cusId, bookId);
                }
            }
            
            // Load treatment data when switching to treatment tab
            if (tabName === 'treatment') {
                const bookId = localStorage.getItem('bookId');
                
                if (bookId) {
                    window.loadSimpleTreatmentData(bookId);
                }
            }
            
            // Load payment data when switching to payment tab
            if (tabName === 'payment') {
                const bookId = localStorage.getItem('bookId');
                
                if (bookId) {
                    window.loadPaymentData(bookId);
                }
            }
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
        // Store IDs for medical history
        localStorage.setItem('cusId', cusId);
        localStorage.setItem('bookId', bookId);
        
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
            document.getElementById('prescriptionNumber').value = patientData.drugId || 'Không rõ';
            
            // ✅ FIX: Lưu drugId vào localStorage để các function khác sử dụng
            if (patientData.drugId) {
                localStorage.setItem('drugId', patientData.drugId);
                console.log('viewPatientRecord - drugId saved to localStorage:', patientData.drugId); // Debug log
            } else {
                console.log('viewPatientRecord - no drugId in patientData'); // Debug log
            }

            // 3. Booking hiện tại
            if (patientData.currentBooking) {
                localStorage.setItem('bookId', patientData.currentBooking.bookId || '');
                document.getElementById('bookType').value = patientData.currentBooking.bookType || '';
                document.getElementById('bookStatus').value = patientData.currentBooking.bookStatus || '';
                document.getElementById('bookingNote').value = patientData.currentBooking.note || '';
                document.getElementById('serviceName').textContent = patientData.currentBooking.serName || '';
            }
            // Load sub-services cho booking này
            if (patientData.currentBooking.bookId && patientData.currentBooking.bookType === 'initial') {
                setupServiceSelection(patientData.currentBooking.bookId);
            }
            if (patientData.currentBooking.bookId && patientData.currentBooking.bookType === 'follow-up') {
                setupServiceSelectionForFollowUp(patientData.currentBooking.bookId);
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
            const curStatus = statusBadge?.textContent || 'Đang khám';
            document.getElementById('currentStatus').textContent = curStatus;
            
            // Cập nhật class theo status mới
            let statusClass = 'waiting';
            if (curStatus === 'Đã khám xong') {
                statusClass = 'completed';
            } else if (curStatus === 'Đã xác nhận') {
                statusClass = 'confirmed';
            } else if (curStatus === 'Không đến khám') {
                statusClass = 'rejected';
            } else if (curStatus === 'Chưa xác nhận') {
                statusClass = 'waiting';
            }
            document.getElementById('currentStatus').className = 'status-badge ' + statusClass;




            // 6. Reset tab và show modal
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            document.querySelector('.tab-btn').classList.add('active');
            document.getElementById('currentTab').classList.add('active');



            const modal = document.getElementById('patientModal');
            modal.style.display = 'block';
            modal.dataset.patientId = cusId;
            modal.dataset.bookType = patientData.currentBooking.bookType || '';
            modal.dataset.bookId = patientData.currentBooking.bookId || '';

            const btnCheckout = modal.querySelector('.btn-primary[onclick*="checkout"]');
            if (btnCheckout) {
                btnCheckout.onclick = function () {
                    window.checkout(modal.dataset.bookId, modal.dataset.patientId, modal.dataset.bookType);
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




        // Nếu là "tái khám" mà KHÔNG đến khám
        if (bookType === 'follow-up' && bookStatus !== 'completed') {
            await fetch(`/api/booking/update-status/${bookId}`, {
            method: 'PUT',
            body: JSON.stringify({ bookStatus: 'pending' }),
            headers: { 'Content-Type': 'application/json' }
        });
            alert("Hãy xác nhận bệnh nhân đã đến khám thêm lần nữa trước khi lưu hồ sơ bệnh án!");
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
                const subName = selectedOption?.textContent?.toLowerCase() || '';

                // Ẩn cả 2 form trước
                document.getElementById('stepForm').style.display = 'none';
                document.getElementById('testResultForm').style.display = 'none';

                if (this.value) {
                    selectedSubId = this.value;
                    selectedSubName = selectedOption.textContent;
                    selectedServiceTitle.innerHTML = `<i class="fas fa-edit"></i> Thực hiện: ${selectedSubName}`;

                    if (subName.includes('xét nghiệm')) {
                        document.getElementById('testResultForm').style.display = '';
                        document.getElementById('selectedTestServiceTitle').innerHTML = `<i class="fas fa-vial"></i> ${subName}`;
                        document.getElementById('testResultForm').setAttribute('data-bookid', bookId);
                    } else {
                        document.getElementById('stepForm').style.display = '';
                        document.getElementById('performedAt').value = getLocalDateTimeValue();
                        document.getElementById('stepResult').value = '';
                        document.getElementById('stepNote').value = '';
                        document.getElementById('stepStatus').value = 'pending';
                    }
                } else {
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

    async function getSubServiceIdsForInitial(bookId) {
        const res = await fetch(`/api/booking-steps/${bookId}/subservice-of-visit-follow-up`);
        if (!res.ok) return [];
        const subs = await res.json();
        return Array.isArray(subs) ? subs.map(sub => sub.subId) : [];
    }

        async function getSubServiceIds(bookId) {
        const res = await fetch(`/api/booking-steps/${bookId}/subservice-of-visit`);
        if (!res.ok) return [];
        const subs = await res.json();
        return Array.isArray(subs) ? subs.map(sub => sub.subId) : [];
    }

    function setupServiceSelectionForFollowUp(bookId) {
    const serviceSelect = document.getElementById('serviceSelect');
    const stepForm = document.getElementById('stepForm');
    const selectedServiceTitle = document.getElementById('selectedServiceTitle');
    const emptyStepsDiv = document.getElementById('emptySteps');

    fetch(`/api/booking-steps/${bookId}/subservice-of-visit-follow-up`)
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

            // Đặt event onchange ở đây mới đúng
            serviceSelect.onchange = function () {
                const selectedOption = this.options[this.selectedIndex];
                const subName = selectedOption?.textContent?.toLowerCase() || '';

                // Ẩn cả 2 form trước
                document.getElementById('stepForm').style.display = 'none';
                document.getElementById('testResultForm').style.display = 'none';

                if (this.value) {
                    selectedSubId = this.value;
                    selectedSubName = selectedOption.textContent;
                    selectedServiceTitle.innerHTML = `<i class="fas fa-edit"></i> Thực hiện: ${selectedSubName}`;

                    if (subName.includes('xét nghiệm')) {
                        document.getElementById('testResultForm').style.display = '';
                        document.getElementById('selectedTestServiceTitle').innerHTML = `<i class="fas fa-vial"></i> ${subName}`;
                        document.getElementById('testResultForm').setAttribute('data-bookid', bookId);
                    } else {
                        document.getElementById('stepForm').style.display = '';
                        document.getElementById('performedAt').value = getLocalDateTimeValue();
                        document.getElementById('stepResult').value = '';
                        document.getElementById('stepNote').value = '';
                        document.getElementById('stepStatus').value = 'pending';
                    }
                } else {
                    selectedSubId = null;
                    selectedSubName = '';
                }
            };

            stepForm.style.display = 'none';
        })
        .catch(err => {
            console.error('Lỗi lấy subservice:', err);
            serviceSelect.innerHTML = '<option value="">Không có bước nào</option>';
            emptyStepsDiv.style.display = '';
        });
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

        // ✅ THÊM: Chỉ remove option nếu KHÔNG phải đang edit
        if (!window.currentEditingStepId) {
            const selectedOption = serviceSelect.options[serviceSelect.selectedIndex];
            if (selectedOption) {
                selectedOption.remove();
            }

            // ✅ THÊM: Kiểm tra nếu dropdown trống thì hiển thị thông báo
            if (serviceSelect.options.length <= 1) { // Chỉ còn option default
                serviceSelect.innerHTML = '<option value="">Tất cả bước đã hoàn thành</option>';
                serviceSelect.disabled = true;
            }
        }

        updateEmptyStepsNotice();
        cancelStepForm();
        
        // ✅ THÊM: Reset trạng thái editing sau khi save thành công
        window.currentEditingStepId = null;

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

    // ✅ THÊM: Hàm helper để refresh dropdown sau khi hoàn thành/hủy bỏ
    function refreshServiceDropdown() {
        const serviceSelect = document.getElementById('serviceSelect');
        
        // Nếu có option và không disable thì return
        if (serviceSelect.options.length > 1 && !serviceSelect.disabled) {
            return;
        }
        
        // Nếu dropdown bị disable hoặc trống, có thể reload lại
        // Tùy thuộc vào requirement cụ thể
        console.log('Dropdown may need refresh');
    }

    window.cancelStepForm = function () {
        document.getElementById('stepForm').style.display = 'none';
        const serviceSelect = document.getElementById('serviceSelect');
        serviceSelect.value = '';
        document.getElementById('stepResult').value = '';
        document.getElementById('stepNote').value = '';
        document.getElementById('stepStatus').value = 'pending';
        window.currentEditingStepId = null;

        // ✅ THÊM: Đảm bảo dropdown không bị disable khi cancel
        if (serviceSelect.disabled && serviceSelect.options.length > 1) {
            serviceSelect.disabled = false;
        }

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

            // ✅ THÊM: Thêm lại option vào dropdown khi edit
            const existingOption = serviceSelect.querySelector(`option[value="${subId}"]`);
            if (!existingOption) {
                // Tạo option mới
                const newOption = document.createElement('option');
                newOption.value = subId;
                newOption.textContent = subName;
                serviceSelect.appendChild(newOption);
                
                // Enable dropdown nếu đang bị disable
                if (serviceSelect.disabled) {
                    serviceSelect.disabled = false;
                    // Cập nhật lại default option
                    const defaultOption = serviceSelect.querySelector('option[value=""]');
                    if (defaultOption && defaultOption.textContent === 'Tất cả bước đã hoàn thành') {
                        defaultOption.textContent = '-- Chọn dịch vụ/bước --';
                    }
                }
            }

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
    function fillPrescriptionHeader() {
        const nameInput = document.getElementById('prescribingDoctorName');
        const fullName = localStorage.getItem('docFullName');
        
        if (nameInput) nameInput.value = fullName || '';
        
        // ✅ FIX: Set prescription date to current time if empty
        const prescriptionDateInput = document.getElementById('prescriptionDate');
        if (prescriptionDateInput && !prescriptionDateInput.value) {
            prescriptionDateInput.value = getLocalDateTimeValue();
        }
        
        // ✅ FIX: Set prescription number from localStorage
        const prescriptionNumberInput = document.getElementById('prescriptionNumber');
        const drugId = localStorage.getItem('drugId');
        console.log('fillPrescriptionHeader - drugId from localStorage:', drugId); // Debug log
        if (prescriptionNumberInput) {
            prescriptionNumberInput.value = drugId || 'Không rõ';
            console.log('fillPrescriptionHeader - prescriptionNumber set to:', prescriptionNumberInput.value); // Debug log
        }
        
        // ✅ FIX: Load existing drug items if any
        loadExistingPrescriptionData();
    }
    
    // Load existing prescription data
    async function loadExistingPrescriptionData() {
        const drugId = document.getElementById('prescriptionNumber')?.value;
        if (!drugId || drugId === 'Không rõ') return;
        
        try {
            const bookId = localStorage.getItem('bookId');
            const res = await fetch(`/api/drugs/by-booking/${bookId}`);
            if (res.ok) {
                const drugData = await res.json();
                if (drugData && drugData.length > 0) {
                    const drug = drugData[0];
                    
                    // Fill prescription header info
                    if (drug.createdAt) {
                        document.getElementById('prescriptionDate').value = formatDateTimeLocal(drug.createdAt);
                    }
                    if (drug.drugNote) {
                        document.getElementById('prescriptionDiagnosis').value = drug.drugNote;
                    }
                    
                    // Clear existing drug items and load from database
                    const drugsList = document.getElementById('drugsList');
                    drugsList.innerHTML = '';
                    
                    if (drug.drugItems && drug.drugItems.length > 0) {
                        drug.drugItems.forEach((item, index) => {
                            drugCounter = index + 1;
                            addDrugItemFromData(item);
                        });
                    }
                }
            }
        } catch (err) {
            console.log('No existing prescription data found:', err);
        }
    }
    
    // Add drug item from existing data
    function addDrugItemFromData(itemData) {
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
                    <input type="text" placeholder="Nhập tên thuốc..." id="drugName-${itemId}" class="form-control" value="${itemData.drugName || ''}">
                </div>
                <div class="record-section">
                    <label><i class="fas fa-weight"></i> Hàm lượng:</label>
                    <input type="text" placeholder="Ví dụ: 5mg" id="dosage-${itemId}" class="form-control" value="${itemData.dosage || ''}">
                </div>
            </div>
            <div class="record-section">
                <div class="record-section">
                    <label><i class="fas fa-clock"></i> Tần suất sử dụng:</label>
                    <input type="text" id="frequency-${itemId}" class="form-control" value="${itemData.frequency || ''}">
                </div>
                <div class="record-section">
                    <label><i class="fas fa-calendar-days"></i> Thời gian dùng:</label>
                    <input type="text" placeholder="Ví dụ: 30 ngày" id="duration-${itemId}" class="form-control" value="${itemData.duration || '30 ngày'}">
                </div>
            </div>
            <div class="record-section">
                <label><i class="fas fa-comment-medical"></i> Hướng dẫn sử dụng & Lưu ý:</label>
                <textarea rows="2" placeholder="Ghi chú cách sử dụng thuốc..." id="drugItemNote-${itemId}" class="form-control">${itemData.drugItemNote || ''}</textarea>
            </div>
        </div>
    `;
        
        drugsList.appendChild(newDrugItem);
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

        
        if (!data.prescriptionNumber) {
            showNotification('❌ Không tìm thấy prescriptionNumber. Vui lòng kiểm tra lại.', 'error');
            return;
        }

        const drugId = data.prescriptionNumber;
        try {
            // 1. Cập nhật bảng Drug
            const updateDrugRes = await fetch(`/api/drugs/update/${drugId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    createdAt: data.prescriptionDate || new Date().toISOString().replace('Z','').split('.')[0],
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
                            <strong>${drug.drugName} ${drug.dosage}</strong><br>
                            ${drug.frequency}, ${drug.duration}<br>
                            <em>${drug.drugItemNote}</em>
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


// Tạo 1 row chỉ số mới
function createTestIndexRowHtml() {
    return `
    <div class="test-index-row" style="display:flex;gap:8px;margin-bottom:8px;align-items:center;">
        <input type="text" class="test-index-name" placeholder="Tên chỉ số" style="width: 120px;">
        <input type="text" class="test-index-value" placeholder="Giá trị" style="width: 60px;">
        <select class="test-index-unit" style="width: 80px;">
            <option value="triệu/ml">triệu/ml</option>
            <option value="mg/ml">mg/ml</option>
            <option value="%">%</option>
            <option value="ng/ml">ng/ml</option>
        </select>
        <select class="test-index-status" style="width: 100px;">
            <option value="Bình thường">Bình thường</option>
            <option value="Cao">Cao</option>
            <option value="Thấp">Thấp</option>
            <option value="Bất thường">Bất thường</option>
        </select>
        <button type="button" onclick="window.removeTestResultRow(this)" style="color:red;"><i class="fas fa-trash"></i></button>
    </div>
    `;
}

// Thêm chỉ số mới
window.addTestResultRow = function () {
    const grid = document.getElementById('testResultGrid');
    if (!grid) {
        alert('Không tìm thấy testResultGrid');
        return;
    }
    grid.insertAdjacentHTML('beforeend', createTestIndexRowHtml());
};

// Xóa 1 chỉ số
window.removeTestResultRow = function (btn) {
    if (btn && btn.parentElement) {
        btn.parentElement.remove();
    }
};

// Hàm saveTestResultStep, collect all values (ví dụ, bạn tuỳ ý gọi API lưu)
window.saveTestResultStep = async function () {
    // 1. Lấy dữ liệu form
    const performedAt = document.getElementById('testPerformedAt').value;
    const note = document.getElementById('testNote').value || '';
    const grid = document.getElementById('testResultGrid');
    const rows = grid.querySelectorAll('.test-index-row');
    const results = [];
    rows.forEach(row => {
        results.push({
            indexName: row.querySelector('.test-index-name').value,
            value: row.querySelector('.test-index-value').value,
            unit: row.querySelector('.test-index-unit').value,
            status: row.querySelector('.test-index-status').value
        });
    });

    // Lấy subId, subName từ select hoặc biến toàn cục
    const serviceSelect = document.getElementById('serviceSelect');
    const subId = serviceSelect ? serviceSelect.value : window.selectedSubId;
    const subName = serviceSelect
        ? serviceSelect.options[serviceSelect.selectedIndex].textContent
        : window.selectedSubName;

    // Lấy bookId
    const testResultForm = document.getElementById('testResultForm');
    const bookingId = testResultForm.getAttribute('data-bookid') || window.currentBookingId;

    // Trạng thái
    const stepStatus = document.getElementById('testStatus').value;

    // 2. Tìm bookingStepId từ API
    let bookingStepId = null;
    try {
        const res = await fetch(`/api/booking-steps/find-id/${bookingId}/${subId}`);
        if (res.ok) {
            const data = await res.json();
            bookingStepId = data.bookingStepId || null;
        }
    } catch (err) {
        console.error('Không tìm được bookingStepId:', err);
    }

    // 3. Build payload
    const testResultPayload = [{
        bookingStepId: bookingStepId, // Đảm bảo đúng bookingStepId
        bookingId: bookingId,
        subId: subId,
        subName: subName,
        performedAt: performedAt,
        results: results,
        note: note,
        stepStatus: stepStatus
    }];
    console.log("Type of stepStatus:", typeof stepStatus, stepStatus);

    // 4. Gửi về backend để lưu
    try {
        const response = await fetch('/api/booking-steps/save-test-results', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testResultPayload)
        });
        if (!response.ok) {
            const errMsg = await response.text();
            throw new Error(errMsg);
        }
        // Optional: reload kết quả hoặc show thông báo
        if (typeof showNotification === 'function') showNotification('Đã lưu kết quả xét nghiệm!', 'success');
        else alert('Đã lưu kết quả xét nghiệm!');
        window.cancelTestResultForm();
        // Nếu muốn reload lại danh sách đã thực hiện, gọi hàm render lại luôn
        // loadAndRenderTestResults(bookingId);
    } catch (err) {
        alert('Lưu thất bại!');
        console.error('Lỗi khi lưu test results:', err);
    }
};



// Cancel form
window.cancelTestResultForm = function () {
    document.getElementById('testResultForm').style.display = 'none';
    document.getElementById('testResultGrid').innerHTML = '';
    document.getElementById('testPerformedAt').value = '';
    document.getElementById('testNote').value = '';
};

// ========== MEDICAL HISTORY FUNCTIONS ==========

// Load medical history for a customer
window.loadMedicalHistory = async function (cusId, bookId) {
    const historyContent = document.getElementById('medical-history-content');
    const emptyHistory = document.getElementById('empty-history');
    const loadingHistory = document.getElementById('loading-history');
    
    // Show loading state
    historyContent.style.display = 'none';
    emptyHistory.style.display = 'none';
    loadingHistory.style.display = 'block';
    
    try {
        // Try to get medical history using the API
        const response = await fetch(`/api/booking/history/${cusId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch medical history');
        }
        
        const historyData = await response.json();
        
        // Hide loading state
        loadingHistory.style.display = 'none';
        
        if (!historyData || historyData.length === 0) {
            // Show empty state for first-time patients
            emptyHistory.style.display = 'block';
            return;
        }
        
        // Display medical history
        displayMedicalHistory(historyData);
        historyContent.style.display = 'block';
        
    } catch (error) {
        console.error('Error loading medical history:', error);
        loadingHistory.style.display = 'none';
        emptyHistory.style.display = 'block';
    }
};

// Display medical history data
window.displayMedicalHistory = function (historyData) {
    const historyContent = document.getElementById('medical-history-content');
    
    // Clear existing content
    historyContent.innerHTML = '';
    
    // Sort history by date (newest first)
    const sortedHistory = historyData.sort((a, b) => {
        const dateA = new Date(a.createdAt || a.workDate);
        const dateB = new Date(b.createdAt || b.workDate);
        return dateB - dateA;
    });
    
    // Create history items
    sortedHistory.forEach((booking, index) => {
        const historyItem = createHistoryItem(booking, index);
        historyContent.appendChild(historyItem);
    });
};

// Create a single history item
window.createHistoryItem = function (booking, index) {
    const historyItem = document.createElement('div');
    historyItem.className = 'history-item';
    
    // Format date
    const bookingDate = booking.workDate || booking.createdAt;
    const formattedDate = formatDate(bookingDate);
    const formattedTime = formatTime(booking.startTime, booking.endTime);
    
    // Determine booking type
    const bookingType = booking.bookType === 'initial' ? 'Khám lần đầu' : 'Tái khám';
    
    // Determine status
    const statusClass = getStatusClass(booking.bookStatus);
    const statusText = getStatusText(booking.bookStatus);
    
    // Format sub-services
    const subServices = booking.subServices || [];
    const servicesText = Array.isArray(subServices) ? subServices.join(', ') : subServices;
    
    historyItem.innerHTML = `
        <div class="history-header">
            <div class="history-date">${formattedDate}</div>
            <div class="history-status ${statusClass}">${statusText}</div>
        </div>
        <div class="history-content">
            <div class="history-info">
                <p><strong>Loại khám:</strong> ${bookingType}</p>
                <p><strong>Dịch vụ:</strong> ${booking.serName || 'Chưa xác định'}</p>
                <p><strong>Bác sĩ:</strong> ${booking.docFullName || 'Chưa xác định'}</p>
                ${formattedTime ? `<p><strong>Thời gian:</strong> <span class="history-time">${formattedTime}</span></p>` : ''}
            </div>
            ${servicesText ? `
            <div class="history-services">
                <strong>Dịch vụ thực hiện:</strong> ${servicesText}
            </div>
            ` : ''}
            ${booking.note ? `
            <div class="history-notes">
                <p><strong>Ghi chú:</strong> ${booking.note}</p>
            </div>
            ` : ''}
        </div>
    `;
    
    return historyItem;
};

// Format date for display
window.formatDate = function (dateString) {
    if (!dateString) return 'Chưa xác định';
    
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    } catch (error) {
        return 'Chưa xác định';
    }
};

// Format time for display
window.formatTime = function (startTime, endTime) {
    if (!startTime) return '';
    
    try {
        const start = startTime.toString().slice(0, 5);
        const end = endTime ? endTime.toString().slice(0, 5) : '';
        return end ? `${start} - ${end}` : start;
    } catch (error) {
        return '';
    }
};

// Get CSS class for status
window.getStatusClass = function (status) {
    switch (status) {
        case 'completed':
            return 'completed';
        case 'confirmed':
            return 'completed';
        case 'pending':
            return 'pending';
        case 'cancelled':
        case 'rejected':
            return 'cancelled';
        default:
            return 'pending';
    }
};

// Get display text for status
window.getStatusText = function (status) {
    switch (status) {
        case 'completed':
            return 'Đã hoàn thành';
        case 'confirmed':
            return 'Đã xác nhận';
        case 'pending':
            return 'Chờ xử lý';
        case 'cancelled':
            return 'Đã hủy';
        case 'rejected':
            return 'Từ chối';
        default:
            return 'Chờ xử lý';
    }
};

// ========== TREATMENT TAB FUNCTIONALITY ==========

// Load treatment data for the current booking
window.loadTreatmentData = async function (bookId) {
    const loadingTreatment = document.getElementById('loading-treatment');
    const emptyTreatment = document.getElementById('empty-treatment');
    const currentService = document.getElementById('current-service');
    const subServices = document.getElementById('sub-services');
    const treatmentSummary = document.getElementById('treatment-summary');

    // Show loading state
    loadingTreatment.style.display = 'block';
    emptyTreatment.style.display = 'none';
    currentService.style.display = 'none';
    subServices.style.display = 'none';
    treatmentSummary.style.display = 'none';

                        try {
                        // Get sub-services for this booking
                        console.log(`🔍 DEBUG: Fetching sub-services for bookId: ${bookId}`);
                        const response = await fetch(`/api/booking-steps/${bookId}/subservice-of-visit`);
                        if (!response.ok) {
                            const errorText = await response.text();
                            console.error(`❌ Sub-services API error: ${response.status} - ${errorText}`);
                            throw new Error(`API error: ${response.status} - ${errorText}`);
                        }
                        
                        const subServicesData = await response.json();
                        console.log(`✅ Sub-services data received:`, subServicesData);
                        console.log(`🔍 DEBUG: Sub-services subIds:`, subServicesData.map(s => ({ subId: s.subId, subName: s.subName, subPrice: s.subPrice })));
        
        if (!Array.isArray(subServicesData) || subServicesData.length === 0) {
            // Show empty state
            loadingTreatment.style.display = 'none';
            emptyTreatment.style.display = 'block';
            return;
        }

                                                        // Get booking steps to check completion status
                        console.log(`🔍 DEBUG: Fetching steps for bookId: ${bookId}`);
                        
                        // Try the main steps API first
                        let stepsData = [];
                        let stepStatusMap = {};
                        
                        try {
                            const stepsResponse = await fetch(`/api/booking-steps/${bookId}`);
                            if (stepsResponse.ok) {
                                stepsData = await stepsResponse.json();
                                console.log(`✅ Steps data received from main API:`, stepsData);
                                
                                // Create a map of subId to step status
                                if (Array.isArray(stepsData)) {
                                    stepsData.forEach(step => {
                                        stepStatusMap[step.subId] = step.stepStatus;
                                    });
                                }
                            } else {
                                console.warn(`⚠️ Main steps API failed, trying fallback...`);
                                // Fallback to by-booking API
                                const fallbackResponse = await fetch(`/api/booking-steps/by-booking/${bookId}`);
                                if (fallbackResponse.ok) {
                                    const fallbackData = await fallbackResponse.json();
                                    console.log(`✅ Steps data received from fallback API:`, fallbackData);
                                    
                                    // Create a map of subId to step status from fallback data
                                    if (Array.isArray(fallbackData)) {
                                        console.log(`🔍 DEBUG: Processing fallback data with subId:`, fallbackData.map(s => ({ subId: s.subId, subName: s.subName, stepStatus: s.stepStatus })));
                                        fallbackData.forEach(step => {
                                            stepStatusMap[step.subId] = step.stepStatus;
                                        });
                                        console.log(`✅ DEBUG: Final stepStatusMap:`, stepStatusMap);
                                    }
                                } else {
                                    console.warn(`⚠️ Fallback API also failed, continuing without step status...`);
                                }
                            }
                        } catch (error) {
                            console.warn(`⚠️ Error fetching steps data:`, error);
                            // Continue without step status data
                        }

        // Display treatment data
        window.displayTreatmentData(subServicesData, stepStatusMap, bookId);
        
    } catch (error) {
        console.error('Error loading treatment data:', error);
        // Show empty state on error
        loadingTreatment.style.display = 'none';
        emptyTreatment.style.display = 'block';
    }
};

// Display treatment data
window.displayTreatmentData = function (subServicesData, stepStatusMap, bookId) {
    const loadingTreatment = document.getElementById('loading-treatment');
    const currentService = document.getElementById('current-service');
    const subServices = document.getElementById('sub-services');
    const treatmentSummary = document.getElementById('treatment-summary');
    const treatmentStepsContent = document.getElementById('treatment-steps-content');
    const paymentSection = document.getElementById('payment-section');

    // Hide loading state
    loadingTreatment.style.display = 'none';

    // Calculate totals
    let totalSteps = subServicesData.length;
    let completedSteps = 0;
    let pendingSteps = 0;
    let totalPrice = 0;

    // Generate HTML for each sub-service
    let stepsHtml = '';
    console.log(`🔍 DEBUG: Processing subServicesData with stepStatusMap:`, { subServicesData: subServicesData.map(s => ({ subId: s.subId, subName: s.subName })), stepStatusMap });
    subServicesData.forEach((subService, index) => {
        const stepStatus = stepStatusMap[subService.subId] || 'inactive';
        console.log(`🔍 DEBUG: subId ${subService.subId} -> stepStatus: ${stepStatus}`);
        const statusClass = stepStatus === 'completed' ? 'completed' : 
                           stepStatus === 'pending' ? 'current' : 'pending';
        
        if (stepStatus === 'completed') completedSteps++;
        if (stepStatus === 'pending') pendingSteps++;
        
        const price = subService.subPrice || 0;
        totalPrice += price;
        
        const estimatedDay = subService.estimatedDayOffset || 1;
        
        stepsHtml += `
            <div class="sub-service-item ${statusClass}">
                <div class="sub-service-header">
                    <span class="step-number">${index + 1}</span>
                    <div class="sub-service-info">
                        <h6>${subService.subName}</h6>
                        <p>${subService.subDescription || 'Mô tả chi tiết bước điều trị'}</p>
                    </div>
                    <div class="sub-service-details">
                        <span class="estimated-day">Ngày ${estimatedDay}</span>
                        <span class="sub-price">${window.formatPrice(price)}</span>
                    </div>
                    <span class="status-icon ${statusClass}">
                        <i class="fas ${statusClass === 'completed' ? 'fa-check-circle' : 
                                       statusClass === 'current' ? 'fa-clock' : 'fa-circle'}"></i>
                    </span>
                </div>
            </div>
        `;
    });

    // Update current service info
    const currentServiceName = document.getElementById('current-service-name');
    const currentServiceDescription = document.getElementById('current-service-description');
    const currentServicePrice = document.getElementById('current-service-price');
    const currentServiceDuration = document.getElementById('current-service-duration');

    if (subServicesData.length > 0) {
        const firstService = subServicesData[0];
        currentServiceName.textContent = firstService.subName || 'Dịch vụ khám';
        currentServiceDescription.textContent = 'Quy trình điều trị chi tiết với các bước được thiết kế riêng biệt';
        currentServicePrice.textContent = window.formatPrice(totalPrice);
        currentServiceDuration.textContent = `${Math.max(...subServicesData.map(s => s.estimatedDayOffset || 1))} ngày`;
    }

    // Update treatment steps content
    treatmentStepsContent.innerHTML = stepsHtml;

    // Update summary
    document.getElementById('total-steps').textContent = totalSteps;
    document.getElementById('completed-steps').textContent = completedSteps;
    document.getElementById('pending-steps').textContent = pendingSteps;

    // Show sections
    currentService.style.display = 'block';
    subServices.style.display = 'block';
    treatmentSummary.style.display = 'block';
};

// Format price for display
window.formatPrice = function (price) {
    if (!price || price === 0) return '0 VNĐ';
    
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        minimumFractionDigits: 0
    }).format(price);
};

// ========== SIMPLE TREATMENT TAB FUNCTIONALITY ==========

// Load simple treatment data (only subIds)
window.loadSimpleTreatmentData = async function (bookId) {
    const loadingTreatment = document.getElementById('loading-treatment');
    const emptyTreatment = document.getElementById('empty-treatment');
    const subServicesList = document.getElementById('sub-services-list');

    // Show loading state
    loadingTreatment.style.display = 'block';
    emptyTreatment.style.display = 'none';
    subServicesList.style.display = 'none';

    try {
        // Get sub-services for this booking
        console.log(`🔍 DEBUG: Fetching sub-services for bookId: ${bookId}`);
        const response = await fetch(`/api/booking-steps/${bookId}/subservice-of-visit`);
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`❌ Sub-services API error: ${response.status} - ${errorText}`);
            throw new Error(`API error: ${response.status} - ${errorText}`);
        }
        
        const subServicesData = await response.json();
        console.log(`✅ Sub-services data received:`, subServicesData);

        if (!Array.isArray(subServicesData) || subServicesData.length === 0) {
            // Show empty state
            loadingTreatment.style.display = 'none';
            emptyTreatment.style.display = 'block';
            return;
        }

        // Display simple treatment data (only subIds)
        window.displaySimpleTreatmentData(subServicesData);
        
    } catch (error) {
        console.error('Error loading simple treatment data:', error);
        // Show empty state on error
        loadingTreatment.style.display = 'none';
        emptyTreatment.style.display = 'block';
    }
};

// Display simple treatment data (only subIds)
window.displaySimpleTreatmentData = function (subServicesData) {
    const loadingTreatment = document.getElementById('loading-treatment');
    const subServicesList = document.getElementById('sub-services-list');
    const treatmentStepsContent = document.getElementById('treatment-steps-content');

    // Hide loading state
    loadingTreatment.style.display = 'none';

    // Generate simple HTML for subIds list
    let stepsHtml = '';
    subServicesData.forEach((subService, index) => {
        stepsHtml += `
            <div class="sub-service-item simple">
                <div class="sub-service-header">
                    <span class="step-number">${index + 1}</span>
                    <div class="sub-service-info">
                        <h6>SubId: ${subService.subId}</h6>
                        <p>${subService.subName || 'Tên dịch vụ'}</p>
                    </div>
                </div>
            </div>
        `;
    });

    // Update treatment steps content
    treatmentStepsContent.innerHTML = stepsHtml;

    // Show sub-services list
    subServicesList.style.display = 'block';
};

// ========== PAYMENT TAB FUNCTIONALITY ==========

// Load and display payment data
window.loadPaymentData = async function (bookId) {
    const loadingPayment = document.getElementById('loading-payment');
    const emptyPayment = document.getElementById('empty-payment');
    const paymentContent = document.getElementById('payment-content');

    // Show loading state
    loadingPayment.style.display = 'block';
    emptyPayment.style.display = 'none';
    paymentContent.style.display = 'none';

    try {
        // Try to get existing revenue data for this booking
        console.log('🔄 Fetching revenue data for booking:', bookId);
        const response = await fetch(`/api/booking-revenue/by-booking/${bookId}`);
        
        if (response.ok) {
            const revenues = await response.json();
            console.log('✅ Revenue data received:', revenues);
            
            if (revenues && revenues.length > 0) {
                // Use existing revenue data
                const revenue = revenues[0]; // Take the first one
                console.log('✅ Using existing revenue:', revenue);
                
                const paymentData = {
                    revenueId: revenue.revenueId,
                    createdAt: new Date(revenue.createdAt).toLocaleString('vi-VN'),
                    totalAmount: revenue.totalAmount,
                    revenueStatus: revenue.revenueStatus,
                    imageId: revenue.imageId,
                    revenueDetails: [] // We'll populate this from sub-services
                };
                
                // Get sub-services for this booking to populate details
                try {
                    const subServicesResponse = await fetch(`/api/booking-steps/${bookId}/subservice-of-visit`);
                    if (subServicesResponse.ok) {
                        const subServices = await subServicesResponse.json();
                        paymentData.revenueDetails = subServices.map((service, index) => ({
                            revenueDetailId: `DET-${bookId}-${index + 1}`,
                            subId: service.subId,
                            subName: service.subName,
                            subDescription: service.subDescription || 'Mô tả dịch vụ',
                            subPrice: service.subPrice || 0,
                            status: revenue.revenueStatus // Use revenue status instead of hardcoded 'pending'
                        }));
                    }
                } catch (error) {
                    console.warn('⚠️ Could not load sub-services for revenue details:', error);
                }
                
                // Hide loading and show content
                loadingPayment.style.display = 'none';
                paymentContent.style.display = 'block';
                window.displayPaymentData(paymentData);
                
                // Initialize bill image upload and load existing image
                window.initializeBillImageUpload();
                window.loadBillImage();
                return;
            }
        } else if (response.status === 500) {
            console.warn('⚠️ Server error 500 when fetching revenue data, trying to create new revenue...');
            window.showPaymentNotification('Lỗi kết nối server. Đang thử tạo hóa đơn mới...', 'warning');
        }
        
        // If no existing revenue or server error, create a new one with sub-services
        console.log('🔄 Creating new revenue for booking:', bookId);
        try {
            const subServicesResponse = await fetch(`/api/booking-steps/${bookId}/subservice-of-visit`);
            if (subServicesResponse.ok) {
                const subServices = await subServicesResponse.json();
                console.log('✅ Sub-services loaded:', subServices);
                
                if (subServices && subServices.length > 0) {
                    // Calculate total amount
                    const totalAmount = subServices.reduce((sum, service) => sum + (service.subPrice || 0), 0);
                    
                    // Create new revenue
                    const createRevenueResponse = await fetch('/api/booking-revenue/create', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                        },
                        body: new URLSearchParams({
                            bookId: bookId,
                            serId: 1, // Default service ID
                            totalAmount: totalAmount
                        })
                    });
                    
                    if (createRevenueResponse.ok) {
                        const createResult = await createRevenueResponse.json();
                        console.log('✅ New revenue created:', createResult);
                        
                        const paymentData = {
                            revenueId: createResult.revenueId,
                            createdAt: new Date().toLocaleString('vi-VN'),
                            totalAmount: totalAmount,
                            revenueStatus: 'pending',
                            revenueDetails: subServices.map((service, index) => ({
                                revenueDetailId: `DET-${bookId}-${index + 1}`,
                                subId: service.subId,
                                subName: service.subName,
                                subDescription: service.subDescription || 'Mô tả dịch vụ',
                                subPrice: service.subPrice || 0,
                                status: 'pending' // New revenue starts with pending status
                            }))
                        };
                        
                        // Hide loading and show content
                        loadingPayment.style.display = 'none';
                        paymentContent.style.display = 'block';
                        window.displayPaymentData(paymentData);
                        
                        // Initialize bill image upload and load existing image
                        window.initializeBillImageUpload();
                        window.loadBillImage();
                        
                        window.showPaymentNotification('Đã tạo hóa đơn thanh toán mới thành công!', 'success');
                        return;
                    } else {
                        console.error('❌ Failed to create revenue:', createRevenueResponse.status);
                        window.showPaymentNotification('Không thể tạo hóa đơn thanh toán. Vui lòng thử lại sau.', 'error');
                    }
                } else {
                    console.warn('⚠️ No sub-services found for booking');
                    window.showPaymentNotification('Không tìm thấy dịch vụ nào cho booking này.', 'warning');
                }
            } else {
                console.error('❌ Failed to load sub-services:', subServicesResponse.status);
                window.showPaymentNotification('Không thể tải thông tin dịch vụ. Vui lòng thử lại sau.', 'error');
            }
        } catch (error) {
            console.error('❌ Error creating revenue or loading sub-services:', error);
            window.showPaymentNotification('Có lỗi xảy ra khi tạo hóa đơn thanh toán.', 'error');
        }
        
        // If all else fails, show empty state
        loadingPayment.style.display = 'none';
        emptyPayment.style.display = 'block';
        
    } catch (error) {
        console.error('❌ Error loading payment data:', error);
        loadingPayment.style.display = 'none';
        emptyPayment.style.display = 'block';
        window.showPaymentNotification('Có lỗi xảy ra khi tải thông tin thanh toán.', 'error');
    }
};

// Display payment data
window.displayPaymentData = function (paymentData) {
    // Update revenue information
    document.getElementById('revenue-id').textContent = paymentData.revenueId;
    document.getElementById('revenue-created-date').textContent = paymentData.createdAt;
    document.getElementById('revenue-total-amount').textContent = window.formatPrice(paymentData.totalAmount);
    
    const statusElement = document.getElementById('revenue-status');
    statusElement.textContent = paymentData.revenueStatus === 'pending' ? 'Chờ thanh toán' : 'Đã thanh toán';
    statusElement.className = `status-badge ${paymentData.revenueStatus}`;

    // Generate revenue details table
    const tbody = document.getElementById('revenue-details-tbody');
    let detailsHtml = '';
    
    paymentData.revenueDetails.forEach((detail, index) => {
        // Use revenue status for all sub-services
        const subServiceStatus = paymentData.revenueStatus;
        detailsHtml += `
            <tr>
                <td>${index + 1}</td>
                <td><strong>${detail.subName}</strong></td>
                <td>${detail.subDescription}</td>
                <td>${window.formatPrice(detail.subPrice)}</td>
                <td><span class="status-badge ${subServiceStatus}">${subServiceStatus === 'pending' ? 'Chờ thanh toán' : 'Đã thanh toán'}</span></td>
            </tr>
        `;
    });
    
    tbody.innerHTML = detailsHtml;

    // Update payment summary
    const totalAmount = paymentData.totalAmount;
    const paidAmount = paymentData.revenueStatus === 'success' ? totalAmount : 0;
    const remainingAmount = totalAmount - paidAmount;

    document.getElementById('payment-total').textContent = window.formatPrice(totalAmount);
    document.getElementById('payment-paid').textContent = window.formatPrice(paidAmount);
    document.getElementById('payment-remaining').textContent = window.formatPrice(remainingAmount);
};

// View payment history
window.viewPaymentHistory = function () {
    alert('Chức năng xem lịch sử thanh toán sẽ được phát triển sau.');
};

// Show payment notification
window.showPaymentNotification = function(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `payment-notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add to payment tab
    const paymentTab = document.getElementById('paymentTab');
    paymentTab.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
};

// Refresh payment data
window.refreshPaymentData = function() {
    const bookId = localStorage.getItem('bookId');
    if (bookId) {
        window.loadPaymentData(bookId);
        window.showPaymentNotification('Đang làm mới dữ liệu thanh toán...', 'info');
    }
};

// Create sample revenue data for testing
window.createSampleRevenue = async function() {
    const bookId = localStorage.getItem('bookId');
    if (!bookId) {
        window.showPaymentNotification('Không tìm thấy thông tin booking!', 'error');
        return;
    }
    
    try {
        window.showPaymentNotification('Đang tạo dữ liệu mẫu...', 'info');
        
        // Create sample revenue with default values
        const createResponse = await fetch('/api/booking-revenue/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                bookId: bookId,
                serId: 1, // Default service ID
                totalAmount: 5000000 // Sample amount
            })
        });
        
        if (createResponse.ok) {
            const result = await createResponse.json();
            console.log('✅ Sample revenue created:', result);
            window.showPaymentNotification('Đã tạo dữ liệu mẫu thành công!', 'success');
            
            // Reload payment data
            setTimeout(() => {
                window.loadPaymentData(bookId);
            }, 1000);
        } else {
            console.error('❌ Failed to create sample revenue:', createResponse.status);
            window.showPaymentNotification('Không thể tạo dữ liệu mẫu.', 'error');
        }
    } catch (error) {
        console.error('❌ Error creating sample revenue:', error);
        window.showPaymentNotification('Có lỗi xảy ra khi tạo dữ liệu mẫu.', 'error');
    }
};

// Process payment
window.processPayment = async function () {
    const bookId = localStorage.getItem('bookId');
    if (!bookId) {
        window.showPaymentNotification('Không tìm thấy thông tin booking!', 'error');
        return;
    }

    // Show confirmation dialog
    const confirmed = confirm('Bạn có chắc chắn muốn xử lý thanh toán cho booking này?');
    if (confirmed) {
        try {
            window.showPaymentNotification('Đang xử lý thanh toán...', 'info');
            
            // Get revenue data for this booking
            const response = await fetch(`/api/booking-revenue/by-booking/${bookId}`);
            if (response.ok) {
                const revenues = await response.json();
                if (revenues && revenues.length > 0) {
                    const revenueId = revenues[0].revenueId;
                    
                    // Confirm payment via API
                    const confirmResponse = await fetch(`/api/booking-revenue/confirm-payment/${revenueId}`, {
                        method: 'PUT'
                    });
                    
                    if (confirmResponse.ok) {
                        window.showPaymentNotification('Thanh toán đã được xử lý thành công!', 'success');
                        
                        // Update the status to success
                        const statusElement = document.getElementById('revenue-status');
                        statusElement.textContent = 'Đã thanh toán';
                        statusElement.className = 'status-badge success';
                        
                        // Update payment summary
                        const totalAmount = parseFloat(document.getElementById('payment-total').textContent.replace(/[^\d]/g, ''));
                        document.getElementById('payment-paid').textContent = window.formatPrice(totalAmount);
                        document.getElementById('payment-remaining').textContent = window.formatPrice(0);
                        
                        // Update all sub-service statuses in the table
                        const tbody = document.getElementById('revenue-details-tbody');
                        if (tbody) {
                            const rows = tbody.querySelectorAll('tr');
                            rows.forEach(row => {
                                const statusCell = row.querySelector('td:last-child span');
                                if (statusCell) {
                                    statusCell.textContent = 'Đã thanh toán';
                                    statusCell.className = 'status-badge success';
                                }
                            });
                        }
                        
                        // Reload payment data to ensure consistency
                        setTimeout(() => {
                            window.loadPaymentData(bookId);
                        }, 1000);
                        
                        // Payment completed successfully
                    } else {
                        console.error('❌ Payment confirmation failed:', confirmResponse.status);
                        window.showPaymentNotification('Có lỗi xảy ra khi xử lý thanh toán!', 'error');
                    }
                } else {
                    window.showPaymentNotification('Không tìm thấy thông tin thanh toán cho booking này!', 'error');
                }
            } else {
                console.error('❌ Failed to load revenue data:', response.status);
                window.showPaymentNotification('Không thể tải thông tin thanh toán!', 'error');
            }
        } catch (error) {
            console.error('❌ Error processing payment:', error);
            window.showPaymentNotification('Có lỗi xảy ra khi xử lý thanh toán!', 'error');
        }
    }
};

// ========== BILL IMAGE UPLOAD FUNCTIONALITY ==========

// Initialize bill image upload functionality
window.initializeBillImageUpload = function() {
    const uploadArea = document.getElementById('upload-area');
    const fileInput = document.getElementById('bill-image-input');
    const currentImage = document.getElementById('current-bill-image');
    const imagePreview = document.getElementById('bill-image-preview');

    if (!uploadArea || !fileInput) return;

    // Click to select file
    uploadArea.addEventListener('click', () => {
        fileInput.click();
    });

    // Drag and drop functionality
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileUpload(files[0]);
        }
    });

    // File input change
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFileUpload(e.target.files[0]);
        }
    });

    // Handle file upload
    function handleFileUpload(file) {
        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'];
        if (!allowedTypes.includes(file.type)) {
            showUploadError('Chỉ hỗ trợ file JPG, PNG, GIF hoặc PDF');
            return;
        }

        // Validate file size (10MB)
        if (file.size > 10 * 1024 * 1024) {
            showUploadError('File quá lớn, tối đa 10MB');
            return;
        }

        // Show preview for images
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                imagePreview.src = e.target.result;
                currentImage.style.display = 'flex';
                uploadArea.style.display = 'none';
            };
            reader.readAsDataURL(file);
        } else {
            // For PDF files, show a PDF icon
            imagePreview.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjRkY2QjZCQyIvPgo8cGF0aCBkPSJNMTYgMTZIMzJWMzJIMTZWMzZIMzJWMjBIMTZWMjBaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K';
            currentImage.style.display = 'flex';
            uploadArea.style.display = 'none';
        }

        // Upload file to server
        uploadBillImage(file);
    }

    // Upload bill image to server
    async function uploadBillImage(file) {
        const bookId = localStorage.getItem('bookId');
        if (!bookId) {
            window.showPaymentNotification('Không tìm thấy thông tin booking!', 'error');
            return;
        }

        try {
            window.showPaymentNotification('Đang upload ảnh bill...', 'info');
            
            // Get revenue data for this booking
            const response = await fetch(`/api/booking-revenue/by-booking/${bookId}`);
            if (!response.ok) {
                console.error('❌ Failed to load revenue data for upload:', response.status);
                window.showPaymentNotification('Không thể tải thông tin thanh toán!', 'error');
                return;
            }

            const revenues = await response.json();
            if (!revenues || revenues.length === 0) {
                window.showPaymentNotification('Chưa có thông tin thanh toán cho booking này!', 'error');
                return;
            }

            const revenueId = revenues[0].revenueId;
            console.log('🔄 Uploading bill image for revenue:', revenueId);

            // Create FormData for file upload
            const formData = new FormData();
            formData.append('billImage', file);

            // Upload image
            const uploadResponse = await fetch(`/api/booking-revenue/upload-bill-image/${revenueId}`, {
                method: 'POST',
                body: formData
            });

            if (uploadResponse.ok) {
                window.showPaymentNotification('Upload ảnh bill thành công!', 'success');
                
                // Reload bill image to show the uploaded one
                setTimeout(() => {
                    window.loadBillImage();
                }, 500);
            } else {
                const errorText = await uploadResponse.text();
                console.error('❌ Upload failed:', uploadResponse.status, errorText);
                window.showPaymentNotification(`Upload thất bại: ${errorText}`, 'error');
            }
        } catch (error) {
            console.error('❌ Error uploading bill image:', error);
            window.showPaymentNotification('Có lỗi xảy ra khi upload ảnh!', 'error');
        }
    }

    // Show upload error
    function showUploadError(message) {
        // Remove existing error/success messages
        const existingError = uploadArea.querySelector('.upload-error');
        const existingSuccess = uploadArea.querySelector('.upload-success');
        if (existingError) existingError.remove();
        if (existingSuccess) existingSuccess.remove();

        // Add error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'upload-error';
        errorDiv.textContent = message;
        uploadArea.appendChild(errorDiv);

        // Reset to upload area
        currentImage.style.display = 'none';
        uploadArea.style.display = 'block';
    }

    // Show upload success
    function showUploadSuccess(message) {
        // Remove existing error/success messages
        const existingError = uploadArea.querySelector('.upload-error');
        const existingSuccess = uploadArea.querySelector('.upload-success');
        if (existingError) existingError.remove();
        if (existingSuccess) existingSuccess.remove();

        // Add success message
        const successDiv = document.createElement('div');
        successDiv.className = 'upload-success';
        successDiv.textContent = message;
        uploadArea.appendChild(successDiv);
    }
};

// Remove bill image
window.removeBillImage = function() {
    const uploadArea = document.getElementById('upload-area');
    const currentImage = document.getElementById('current-bill-image');
    const fileInput = document.getElementById('bill-image-input');

    if (uploadArea && currentImage && fileInput) {
        currentImage.style.display = 'none';
        uploadArea.style.display = 'block';
        fileInput.value = ''; // Clear file input

        // Remove any error/success messages
        const existingError = uploadArea.querySelector('.upload-error');
        const existingSuccess = uploadArea.querySelector('.upload-success');
        if (existingError) existingError.remove();
        if (existingSuccess) existingSuccess.remove();
    }
};

// Load bill image if exists
window.loadBillImage = async function() {
    const bookId = localStorage.getItem('bookId');
    if (!bookId) {
        console.log('⚠️ No bookId found for loading bill image');
        return;
    }

    try {
        console.log('🔄 Loading bill image for booking:', bookId);
        
        // Get revenue data for this booking
        const response = await fetch(`/api/booking-revenue/by-booking/${bookId}`);
        if (response.ok) {
            const revenues = await response.json();
            console.log('✅ Revenue data loaded:', revenues);
            
            if (revenues && revenues.length > 0) {
                const revenue = revenues[0];
                if (revenue.imageId) {
                    console.log('🔄 Loading image for revenue:', revenue.revenueId);
                    
                    // Load and display the image
                    const imageResponse = await fetch(`/api/booking-revenue/bill-image/${revenue.revenueId}`);
                    if (imageResponse.ok) {
                        const blob = await imageResponse.blob();
                        const imageUrl = URL.createObjectURL(blob);
                        
                        const currentImage = document.getElementById('current-bill-image');
                        const imagePreview = document.getElementById('bill-image-preview');
                        const uploadArea = document.getElementById('upload-area');
                        
                        if (currentImage && imagePreview && uploadArea) {
                            imagePreview.src = imageUrl;
                            currentImage.style.display = 'flex';
                            uploadArea.style.display = 'none';
                            console.log('✅ Bill image loaded and displayed');
                        } else {
                            console.warn('⚠️ Required elements not found for bill image display');
                        }
                    } else {
                        console.warn('⚠️ Failed to load bill image:', imageResponse.status);
                    }
                } else {
                    console.log('ℹ️ No imageId found in revenue');
                }
            } else {
                console.log('ℹ️ No revenue data found for booking');
            }
        } else {
            console.warn('⚠️ Failed to load revenue data:', response.status);
        }
    } catch (error) {
        console.error('❌ Error loading bill image:', error);
    }
};

// ========== END BILL IMAGE UPLOAD FUNCTIONALITY ==========

});