// ================================
// Khai báo giờ làm việc theo ngày
// ================================
const workingHours = {
    1: ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00'], // Mon
    2: ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00'], // Tue
    3: ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00'], // Wed
    4: ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00'], // Thu
    5: ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00'], // Fri
    6: ['08:00', '09:00', '10:00', '11:00'], // Sat
    0: ['08:00', '09:00', '10:00', '11:00']  // Sun
};

// ================================
// Biến lưu trạng thái medical record của customer
let customerMedicalRecordStatus = null;

// ================================
// Dữ liệu workslot từ backend
let currentSlots = [];
let approvedSlots = []; // Danh sách slot đã được duyệt

// ================================
// Hàm fetch workslot đã được duyệt cho bác sĩ trong khoảng thời gian
function fetchApprovedSlotsForDoctor(docId, fromDate, toDate) {
    if (!docId || !fromDate || !toDate) {
        approvedSlots = [];
        return Promise.resolve([]);
    }
    
    return fetch(`/api/workslots/${docId}/slots?from=${fromDate}&to=${toDate}`)
        .then(res => res.json())
        .then(data => {
            approvedSlots = data;
            console.log('Approved slots for doctor:', data);
            return data;
        })
        .catch(err => {
            console.error('Error fetching approved slots:', err);
            approvedSlots = [];
            return [];
        });
}

// ================================
// Hàm fetch workslot từ backend (giữ nguyên để tương thích)
function fetchWorkslotsForDoctorAndDate(docId, date) {
    if (!docId || !date) {
        currentSlots = [];
        updateTimeSlots(date);
        return;
    }
    
    // Tính toán khoảng thời gian 1 tuần (7 ngày) xung quanh ngày được chọn
    const selectedDate = new Date(date);
    const fromDate = new Date(selectedDate);
    fromDate.setDate(selectedDate.getDate() - 3); // 3 ngày trước
    const toDate = new Date(selectedDate);
    toDate.setDate(selectedDate.getDate() + 3); // 3 ngày sau
    
    const fromDateStr = fromDate.toISOString().split('T')[0];
    const toDateStr = toDate.toISOString().split('T')[0];
    
    // Fetch cả approved slots và current booking count
    Promise.all([
        fetchApprovedSlotsForDoctor(docId, fromDateStr, toDateStr),
        fetch(`/api/workslots?docId=${docId}&date=${date}`).then(res => res.json()).catch(() => [])
    ])
    .then(([approvedData, currentData]) => {
        currentSlots = currentData;
        updateTimeSlots(date);
    })
    .catch(err => {
        console.error('Error fetching workslots:', err);
        currentSlots = [];
        updateTimeSlots(date);
    });
}

// ================================
// Hàm cập nhật khung giờ theo ngày, khóa slot đã đủ số lượng
// ================================
function updateTimeSlots(selectedDate) {
    const timeSlotsContainer = document.querySelector('.time-slots');
    const date = new Date(selectedDate);
    const dayOfWeek = date.getDay();

    // Xóa slot cũ
    timeSlotsContainer.innerHTML = '';

    // Lấy giờ làm việc của ngày
    const availableHours = workingHours[dayOfWeek] || [];

    if (availableHours.length === 0) {
        timeSlotsContainer.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #6c757d; padding: 20px;">Ngày này phòng khám không làm việc</p>';
        return;
    }

    // Kiểm tra xem có slot nào được duyệt cho ngày này không
    const hasApprovedSlots = approvedSlots.some(slot => {
        const slotDate = slot.workDate || slot.date;
        return slotDate === selectedDate && slot.slotStatus === 'approved';
    });

    if (!hasApprovedSlots && document.getElementById('doctor').value) {
        timeSlotsContainer.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #ff6b35; padding: 20px; background: #fff3f0; border: 1px solid #ff6b35; border-radius: 8px;">Bác sĩ chưa mở lịch làm việc cho ngày này. Vui lòng chọn ngày khác!</p>';
        return;
    }

    // Lấy thời gian hiện tại
    const now = new Date();
    const selectedDateObj = new Date(selectedDate);
    const isToday = selectedDateObj.toDateString() === now.toDateString();

    // Tạo các slot giờ
    availableHours.forEach(hour => {
        const endHour = parseInt(hour.split(':')[0]) + 1;
        const endTime = endHour.toString().padStart(2, '0') + ':00';
        const slotKey = `${hour}-${endTime}`;

        // Tìm workslot tương ứng từ backend (booking count)
        const slot = currentSlots.find(s =>
            s.startTime.substring(0,5) === hour && s.endTime.substring(0,5) === endTime
        );
        
        // Kiểm tra xem slot có được duyệt không từ approvedSlots
        const approvedSlot = approvedSlots.find(s => {
            const slotDate = s.workDate || s.date; // Hỗ trợ cả 2 format
            const slotStartTime = s.startTime ? s.startTime.substring(0,5) : '';
            const slotEndTime = s.endTime ? s.endTime.substring(0,5) : '';
            return slotDate === selectedDate && 
                   slotStartTime === hour && 
                   slotEndTime === endTime &&
                   s.slotStatus === 'approved';
        });
        
        let disabled = false;
        let title = '';
        let isApproved = !!approvedSlot;


        // tạm bỏ check slot để demo
        // Kiểm tra xem slot có trong quá khứ không (chỉ áp dụng cho ngày hôm nay)
        if (isToday) {
            const slotEndTime = new Date();
            slotEndTime.setHours(parseInt(hour.split(':')[0]), parseInt(hour.split(':')[1]), 0, 0);
            
            if (slotEndTime <= now) {
                disabled = true;
                title = 'Khung giờ đã qua';
            }
        }
        
        // Chỉ cho phép đặt lịch nếu slot đã được duyệt
        if (!disabled && !isApproved) {
            disabled = true;
            title = 'Bác sĩ chưa mở lịch cho khung giờ này';
        }
        
        // Kiểm tra slot từ backend (chỉ khi đã được duyệt và chưa bị disable vì quá khứ)
        if (!disabled && isApproved && slot) {
            let max = Number(slot.maxPatient);
            let booked = Number(slot.currentBooking);
            if (!isNaN(max) && !isNaN(booked)) {
                if (booked >= max) {
                    disabled = true;
                    title = `Đã đủ số lượng (${max} khách)`;
                } else {
                    title = `Còn ${max - booked} chỗ`;
                }
            } else {
                title = 'Có thể đặt lịch';
            }
        } else if (!disabled && isApproved && !slot) {
            // Slot đã được duyệt nhưng chưa có thông tin booking
            title = 'Có thể đặt lịch';
        }
        
        const timeSlot = document.createElement('div');
        let className = 'time-slot';
        
        if (isApproved && !disabled) {
            className += ' approved'; // Class mới cho slot đã được duyệt
        }
        
        if (disabled) {
            className += ' disabled';
            // Thêm class riêng cho slot quá khứ
            if (title === 'Khung giờ đã qua') {
                className += ' past-time';
            }
        }
        
        timeSlot.className = className;
        timeSlot.setAttribute('data-time', slotKey);
        timeSlot.textContent = slotKey;
        if (title) timeSlot.title = title;

        // Sự kiện click chọn khung giờ
        timeSlot.addEventListener('click', function () {
            if (this.classList.contains('disabled')) {
                // Hiển thị thông báo tùy theo lý do disable
                if (title === 'Khung giờ đã qua') {
                    alert('Không thể chọn khung giờ đã qua. Vui lòng chọn khung giờ khác!');
                } else if (title.includes('Đã đủ số lượng')) {
                    alert('Khung giờ này đã đầy. Vui lòng chọn khung giờ khác!');
                } else if (title === 'Bác sĩ chưa mở lịch cho khung giờ này') {
                    alert('Bác sĩ chưa mở lịch cho khung giờ này. Vui lòng chọn khung giờ khác!');
                } else {
                    alert('Khung giờ này không khả dụng. Vui lòng chọn khung giờ khác!');
                }
                return;
            }
            document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
            this.classList.add('selected');
            document.getElementById('selectedTime').value = this.dataset.time;
        });

        timeSlotsContainer.appendChild(timeSlot);
    });

    // Reset selectedTime
    document.getElementById('selectedTime').value = '';
}

// ================================
// Hàm check trạng thái đặt lịch của customer (medical record + booking pending)
// ================================
async function checkCustomerBookingStatus(cusId) {
    if (!cusId) return { status: 'can_book', message: 'No customer ID' };
    
    try {
        const response = await fetch(`/api/medical-records/customer/${cusId}/booking-status`);
        const data = await response.json();
        console.log('Customer booking status:', data);
        return data;
    } catch (error) {
        console.error('Error checking customer booking status:', error);
        return { status: 'can_book', message: 'Error occurred' };
    }
}

// ================================
// Hàm check trạng thái medical record của customer (cũ - để tương thích)
// ================================
async function checkCustomerMedicalRecordStatus(cusId) {
    if (!cusId) return null;
    
    try {
        const response = await fetch(`/api/medical-records/customer/${cusId}/status`);
        const data = await response.json();
        console.log('Medical record status:', data);
        return data;
    } catch (error) {
        console.error('Error checking medical record status:', error);
        return null;
    }
}

// ================================
// Hàm hiển thị popup thông báo về medical record đang active
// ================================
function showActiveMedicalRecordPopup(medicalRecordData) {
    const popupHtml = `
        <div id="activeMedicalRecordOverlay" class="booking-overlay show">
            <div class="booking-container">
                <div class="booking-header">
                    <i class="fas fa-info-circle" style="color: #ff6b35;"></i>
                    <h3>Thông báo dịch vụ đang điều trị</h3>
                </div>
                <div class="booking-body">
                    <div class="medical-record-info">
                        <div class="info-section">
                            <h4><i class="fas fa-user-md"></i> Thông tin bác sĩ phụ trách</h4>
                            <div class="doctor-info">
                                <p><strong>Bác sĩ:</strong> ${medicalRecordData.docFullName || 'N/A'}</p>
                                <p><strong>Email:</strong> ${medicalRecordData.docEmail || 'N/A'}</p>
                                <p><strong>Điện thoại:</strong> ${medicalRecordData.docPhone || 'N/A'}</p>
                            </div>
                        </div>
                        
                        <div class="info-section">
                            <h4><i class="fas fa-heart"></i> Dịch vụ đang điều trị</h4>
                            <div class="service-info">
                                <p><strong>Dịch vụ:</strong> ${medicalRecordData.serviceName || 'N/A'}</p>
                                <p><strong>Chẩn đoán:</strong> ${medicalRecordData.diagnosis || 'Chưa có'}</p>
                                <p><strong>Kế hoạch điều trị:</strong> ${medicalRecordData.treatmentPlan || 'Chưa có'}</p>
                            </div>
                        </div>
                        
                        <div class="warning-message">
                            <i class="fas fa-exclamation-triangle"></i>
                            <p>Bạn hiện đang trong quá trình điều trị dịch vụ <strong>"${medicalRecordData.serviceName || 'N/A'}"</strong>. 
                            Để đảm bảo an toàn và hiệu quả điều trị, vui lòng liên hệ trực tiếp với bác sĩ phụ trách để được tư vấn về việc đặt lịch khám mới hoặc thay đổi lịch điều trị hiện tại.</p>
                        </div>
                        
                        <div class="contact-buttons">
                            <button class="contact-btn email-btn" onclick="contactDoctorByEmail('${medicalRecordData.docEmail || ''}')">
                                <i class="fas fa-envelope"></i> Gửi email
                            </button>
                            <button class="contact-btn phone-btn" onclick="contactDoctorByPhone('${medicalRecordData.docPhone || ''}')">
                                <i class="fas fa-phone"></i> Gọi điện
                            </button>
                        </div>
                    </div>
                </div>
                <div class="booking-footer">
                    <button class="btn-cancel" onclick="closeActiveMedicalRecordPopup()">
                        <i class="fas fa-times"></i> Đóng
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', popupHtml);
    
    // Disable form đặt lịch
    disableBookingForm();
}

// ================================
// Hàm hiển thị popup cho booking pending
// ================================
function showPendingBookingPopup(bookingData) {
    const popupHtml = `
        <div id="pendingBookingOverlay" class="booking-overlay show">
            <div class="booking-container">
                <div class="booking-header">
                    <i class="fas fa-clock" style="color: #f39c12;"></i>
                    <h3>Lịch hẹn đang chờ xác nhận</h3>
                </div>
                <div class="booking-body">
                    <div class="pending-booking-info">
                        <div class="info-section">
                            <h4><i class="fas fa-calendar-alt"></i> Thông tin lịch hẹn</h4>
                            <div class="booking-info">
                                <p><strong>Mã đặt lịch:</strong> #${bookingData.bookId || 'N/A'}</p>
                                <p><strong>Trạng thái:</strong> <span class="status-pending">Chờ xác nhận</span></p>
                                <p><strong>Ngày đặt:</strong> ${bookingData.bookCreatedAt ? new Date(bookingData.bookCreatedAt).toLocaleDateString('vi-VN') : 'N/A'}</p>
                            </div>
                        </div>
                        
                        <div class="warning-message" style="background: linear-gradient(135deg, #fff3cd, #ffeaa7);">
                            <i class="fas fa-hourglass-half"></i>
                            <p>Bạn hiện có lịch hẹn đang chờ bác sĩ xác nhận. Vui lòng đợi phản hồi từ phòng khám hoặc liên hệ trực tiếp để được tư vấn về việc đặt lịch mới.</p>
                        </div>
                        
                        <div class="contact-buttons">
                            <button class="contact-btn phone-btn" onclick="contactClinic()">
                                <i class="fas fa-phone"></i> Liên hệ phòng khám
                            </button>
                            <button class="contact-btn email-btn" onclick="contactSupport()">
                                <i class="fas fa-envelope"></i> Gửi email hỗ trợ
                            </button>
                        </div>
                    </div>
                </div>
                <div class="booking-footer">
                    <button class="btn-cancel" onclick="closePendingBookingPopup()">
                        <i class="fas fa-times"></i> Đóng
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', popupHtml);
    
    // Disable form đặt lịch
    disableBookingForm('pending');
}

// ================================
// Hàm đóng popup booking pending
// ================================
function closePendingBookingPopup() {
    const overlay = document.getElementById('pendingBookingOverlay');
    if (overlay) {
        overlay.remove();
    }
    
    // Chuyển về trang chủ
    window.location.href = 'index.html';
}

// ================================
// Hàm liên hệ phòng khám
// ================================
function contactClinic() {
    window.location.href = 'tel:19001234';
}

// ================================
// Hàm disable form đặt lịch khi có medical record active hoặc booking pending
// ================================
function disableBookingForm(reason = 'active') {
    const formElements = document.querySelectorAll('#bookingForm input, #bookingForm select, #bookingForm textarea, #bookingForm button[type="submit"]');
    formElements.forEach(element => {
        element.disabled = true;
        if (element.tagName === 'INPUT' || element.tagName === 'SELECT' || element.tagName === 'TEXTAREA') {
            element.style.opacity = '0.5';
            element.style.cursor = 'not-allowed';
        }
    });
    
    // Thêm thông báo trên form
    const formContainer = document.getElementById('bookingForm');
    const warningNotice = document.createElement('div');
    warningNotice.id = 'formWarningNotice';
    warningNotice.className = 'form-warning-notice';
    
    let warningText = '';
    let warningIcon = '';
    
    if (reason === 'pending') {
        warningIcon = 'fas fa-clock';
        warningText = 'Không thể đặt lịch mới khi đang có lịch hẹn chờ xác nhận. Vui lòng đợi phản hồi từ phòng khám.';
    } else {
        warningIcon = 'fas fa-lock';
        warningText = 'Không thể đặt lịch mới khi đang có dịch vụ điều trị đang hoạt động. Vui lòng liên hệ bác sĩ phụ trách.';
    }
    
    warningNotice.innerHTML = `
        <div class="warning-content">
            <i class="${warningIcon}"></i>
            <p>${warningText}</p>
        </div>
    `;
    formContainer.parentNode.insertBefore(warningNotice, formContainer);
}

// ================================
// Hàm enable lại form đặt lịch
// ================================
function enableBookingForm() {
    const formElements = document.querySelectorAll('#bookingForm input, #bookingForm select, #bookingForm textarea, #bookingForm button[type="submit"]');
    formElements.forEach(element => {
        element.disabled = false;
        if (element.tagName === 'INPUT' || element.tagName === 'SELECT' || element.tagName === 'TEXTAREA') {
            element.style.opacity = '1';
            element.style.cursor = 'auto';
        }
    });
    
    // Xóa thông báo cảnh báo
    const warningNotice = document.getElementById('formWarningNotice');
    if (warningNotice) {
        warningNotice.remove();
    }
}

// ================================
// Hàm đóng popup medical record
// ================================
function closeActiveMedicalRecordPopup() {
    const overlay = document.getElementById('activeMedicalRecordOverlay');
    if (overlay) {
        overlay.remove();
    }
    
    // Chuyển về trang chủ
    window.location.href = 'index.html';
}

// ================================
// Hàm liên hệ bác sĩ qua email
// ================================
function contactDoctorByEmail(email) {
    if (email && email !== 'N/A') {
        window.location.href = `mailto:${email}?subject=Liên hệ về lịch điều trị&body=Chào bác sĩ,%0A%0ATôi cần tư vấn về lịch điều trị hiện tại của tôi.%0A%0AXin cảm ơn!`;
    } else {
        alert('Thông tin email bác sĩ không có sẵn. Vui lòng gọi hotline: 1900 1234');
    }
}

// ================================
// Hàm liên hệ bác sĩ qua điện thoại
// ================================
function contactDoctorByPhone(phone) {
    if (phone && phone !== 'N/A') {
        window.location.href = `tel:${phone}`;
    } else {
        alert('Thông tin điện thoại bác sĩ không có sẵn. Vui lòng gọi hotline: 1900 1234');
    }
}

// ================================
// Hàm lấy cusId từ localStorage (giả định đã đăng nhập)
// ================================
function getCurrentCustomerId() {
    // Giả định cusId được lưu trong localStorage khi đăng nhập
    const cusId = localStorage.getItem('cusId') || localStorage.getItem('userId');
    console.log('Current customer ID:', cusId);
    
    // Cho mục đích test - có thể set cusId = 1 để test
    // localStorage.setItem('cusId', '1'); // Uncomment để test với cusId = 1
    
    return cusId;
}



// ================================
// Hàm lấy tên ngày trong tuần (vi)
// ================================
function getDayName(dayOfWeek) {
    const days = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    return days[dayOfWeek];
}

// ========== Thiết lập min/max ngày =============
function initializeDateInputs() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('appointmentDate').setAttribute('min', today);
    document.getElementById('dob').setAttribute('max', today);

    // Set default to today & update slot
    document.getElementById('appointmentDate').value = today;
    updateTimeSlots(today);
}

// ========== Đổi ngày hoặc bác sĩ sẽ đổi khung giờ =============
function setupDateDoctorChangeListener() {
    document.getElementById('appointmentDate').addEventListener('change', function () {
        const date = this.value;
        const docId = document.getElementById('doctor').value;
        fetchWorkslotsForDoctorAndDate(docId, date);

        // Hiển thị thông tin giờ làm việc
        if (date) {
            const jsDate = new Date(date);
            const dayOfWeek = jsDate.getDay();
            const dayName = getDayName(dayOfWeek);
            let workingInfo = '';
            if (dayOfWeek >= 1 && dayOfWeek <= 5) {
                workingInfo = `${dayName}: 8:00 - 17:00`;
            } else if (dayOfWeek === 6) {
                workingInfo = `${dayName}: 8:00 - 12:00`;
            } else if (dayOfWeek === 0) {
                workingInfo = `${dayName}: 8:00 - 12:00`;
            }
            let workingHoursDisplay = document.querySelector('.working-hours-display');
            if (!workingHoursDisplay) {
                workingHoursDisplay = document.createElement('div');
                workingHoursDisplay.className = 'working-hours-display';
                workingHoursDisplay.style.cssText = `
                    background: #e3f2fd;
                    border: 1px solid #2196f3;
                    border-radius: 8px;
                    padding: 8px 12px;
                    margin-top: 8px;
                    font-size: 0.85rem;
                    color: #1976d2;
                    text-align: center;
                `;
                document.querySelector('.time-slots').parentNode.appendChild(workingHoursDisplay);
            }
            workingHoursDisplay.textContent = `Giờ làm việc ${workingInfo}`;
        }
    });
    document.getElementById('doctor').addEventListener('change', function () {
        const docId = this.value;
        const date = document.getElementById('appointmentDate').value;
        fetchWorkslotsForDoctorAndDate(docId, date);
    });
}

// ========== Lấy danh sách bác sĩ từ backend ============
function loadDoctors() {
    fetch('/api/doctors')
        .then(response => response.json())
        .then(data => {
            const doctorSelect = document.getElementById('doctor');
            doctorSelect.innerHTML = '<option value="">Chọn bác sĩ</option>';
            data.forEach(doctor => {
                const option = document.createElement('option');
                option.value = doctor.docId;
                option.textContent = doctor.docFullName + (doctor.expertise ? ' - ' + doctor.expertise : '');
                doctorSelect.appendChild(option);
            });
            
            // Auto-select doctor nếu có trong localStorage
            const selectedDoctorName = localStorage.getItem('selectedDoctorName');
            if (selectedDoctorName) {
                console.log('Trying to auto-select doctor:', selectedDoctorName);
                
                // Tìm option có tên khớp với tên bác sĩ được chọn
                const options = doctorSelect.querySelectorAll('option');
                console.log('Available doctors in dropdown:', Array.from(options).map(opt => opt.textContent));
                
                for (let option of options) {
                    const optionText = option.textContent.toLowerCase();
                    const searchName = selectedDoctorName.replace('Bác sĩ ', '').toLowerCase();
                    
                    // Xử lý tên viết tắt đặc biệt cho các bác sĩ
                    let isMatch = false;
                    
                    if (selectedDoctorName.includes('Nguyễn N. Kh. Linh')) {
                        // Kiểm tra nhiều pattern cho bác sĩ Linh
                        isMatch = optionText.includes('nguyễn ngọc khánh linh') || 
                                 optionText.includes('nguyễn n. kh. linh') ||
                                 optionText.includes('khánh linh') ||
                                 optionText.includes('n. kh. linh') ||
                                 optionText.includes('nguyễn khánh linh');
                    } else if (selectedDoctorName.includes('Trương Quốc Lập')) {
                        isMatch = optionText.includes('trương quốc lập') || optionText.includes('quốc lập');
                    } else if (selectedDoctorName.includes('Tất Vĩnh Hùng')) {
                        isMatch = optionText.includes('tất vĩnh hùng') || optionText.includes('vĩnh hùng');
                    } else if (selectedDoctorName.includes('Phạm Thị Hồng Anh')) {
                        isMatch = optionText.includes('phạm thị hồng anh') || optionText.includes('hồng anh');
                    } else if (selectedDoctorName.includes('Lê Minh Đức')) {
                        isMatch = optionText.includes('lê minh đức') || optionText.includes('minh đức');
                    } else if (selectedDoctorName.includes('Trần Thị Tú')) {
                        isMatch = optionText.includes('trần thị tú') || optionText.includes('thị tú');
                    } else {
                        // Logic thông thường cho các bác sĩ khác
                        isMatch = optionText.includes(searchName);
                    }
                    
                    console.log(`Checking option: "${optionText}" against search: "${searchName}" - Match: ${isMatch}`);
                    
                    if (isMatch) {
                        doctorSelect.value = option.value;
                        console.log('Successfully selected doctor with ID:', option.value);
                        
                        // Trigger change event để cập nhật slots
                        const changeEvent = new Event('change');
                        doctorSelect.dispatchEvent(changeEvent);
                        break;
                    }
                }
                
                // Xóa selectedDoctorName sau khi đã sử dụng
                localStorage.removeItem('selectedDoctorName');
            }
        })
        .catch(error => {
            console.error('Lỗi lấy danh sách bác sĩ:', error);
        });
}

// ========== Submit form đặt lịch & kiểm tra tất cả field ===========
function setupBookingFormSubmission() {
    document.getElementById('bookingForm').addEventListener('submit', function (e) {
        e.preventDefault();

        // Lấy tất cả field
        const fullName = document.getElementById('fullName');
        const phone = document.getElementById('phone');
        const email = document.getElementById('email');
        const dob = document.getElementById('dob');
        const doctor = document.getElementById('doctor');
        const appointmentDate = document.getElementById('appointmentDate');
        const service = document.getElementById('service');
        const selectedTime = document.getElementById('selectedTime');
        const symptoms = document.getElementById('symptoms');

        // Xóa trạng thái lỗi cũ
        this.querySelectorAll('.error').forEach(el => el.classList.remove('error'));

        // Validate từng trường giống như đăng ký
        let errorMsg = '';
        let errorField = null;

        if (!fullName.value.trim()) {
            errorMsg = "Vui lòng nhập họ tên.";
            errorField = fullName;
        } else if (!email.value.trim()) {
            errorMsg = "Vui lòng nhập email.";
            errorField = email;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
            errorMsg = "Email không hợp lệ.";
            errorField = email;
        } else if (!phone.value.trim()) {
            errorMsg = "Vui lòng nhập số điện thoại.";
            errorField = phone;
        } else if (!/^(0|\+84)\d{9,10}$/.test(phone.value.trim())) {
            errorMsg = "Số điện thoại không hợp lệ.";
            errorField = phone;
        } else if (!dob.value) {
            errorMsg = "Vui lòng chọn ngày sinh.";
            errorField = dob;
        } else if (calculateAgeBooking(dob.value) < 18) {
            errorMsg = "Bạn phải đủ 18 tuổi trở lên để đặt lịch!";
            errorField = dob;
        } else if (!doctor.value) {
            errorMsg = "Vui lòng chọn bác sĩ.";
            errorField = doctor;
        } else if (!appointmentDate.value) {
            errorMsg = "Vui lòng chọn ngày khám.";
            errorField = appointmentDate;
        } else if (!service.value) {
            errorMsg = "Vui lòng chọn dịch vụ.";
            errorField = service;
        } else if (!selectedTime.value) {
            errorMsg = "Vui lòng chọn khung giờ khám!";
            errorField = selectedTime;
        }
        // ====== Đã bỏ check không cho đặt lịch quá khứ ======
        else {
            const selectedDate = new Date(appointmentDate.value);
            const today = new Date();
            const isToday = selectedDate.toDateString() === today.toDateString();
            if (isToday) {
                const timeRange = selectedTime.value.trim();
                const [startTime] = timeRange.split('-').map(t => t.trim());
                const [hour, minute] = startTime.split(':').map(Number);
                const slotDateTime = new Date();
                slotDateTime.setHours(hour, minute, 0, 0);
                if (slotDateTime <= today) {
                    errorMsg = "Không thể đặt lịch cho khung giờ đã qua. Vui lòng chọn khung giờ khác!";
                    errorField = selectedTime;
                }
            }
        }

        if (errorMsg) {
            // In ra tất cả field đang có
            console.log({
                fullName: fullName.value,
                phone: phone.value,
                email: email.value,
                dob: dob.value,
                doctor: doctor.value,
                appointmentDate: appointmentDate.value,
                service: service.value,
                selectedTime: selectedTime.value,
                symptoms: symptoms.value
            });
            alert(errorMsg);
            if (errorField) {
                errorField.classList.add('error');
                errorField.focus();
            }
            return;
        }

        // Hiển thị loading overlay
        showBookingLoadingOverlay();

        // Lấy và tách thời gian, loại bỏ giây và khoảng trắng nếu có
        const timeRange = selectedTime.value.trim();
        let [startTime, endTime] = timeRange.split('-').map(t => t.trim());
        if (startTime.length === 8) startTime = startTime.slice(0,5);
        if (endTime.length === 8) endTime = endTime.slice(0,5);

        const data = {
            fullName: fullName.value,
            phone: phone.value,
            email: email.value,
            dob: dob.value,
            docId: parseInt(doctor.value),
            appointmentDate: appointmentDate.value,
            serId: parseInt(service.value),
            startTime: startTime,
            endTime: endTime,
            note: symptoms.value,
            bookType: 'initial'
        };

        // In ra tất cả data gửi lên backend
        console.log(data);

        fetch('/api/booking', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
            .then(res => res.json())
            .then(resp => {
                if (resp.success) {
                    showBookingSuccess();
                } else {
                    showBookingError(resp.message || 'Có lỗi xảy ra!');
                }
            })
            .catch(err => {
                showBookingError('Có lỗi xảy ra khi gửi dữ liệu!');
            });
    });
}


// Hàm kiểm tra tuổi đặt lịch
function calculateAgeBooking(dobStr) {
    if (!dobStr) return 0;
    const dob = new Date(dobStr);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
        age--;
    }
    return age;
}

// ========== Mobile menu toggle ===========
function setupMobileMenu() {
    document.querySelector('.mobile-menu-btn').addEventListener('click', function () {
        document.querySelector('nav').classList.toggle('active');
    });
}

// ========== Booking Loading Functions ===========
function showBookingLoadingOverlay() {
    const overlay = document.getElementById('bookingLoadingOverlay');
    const loadingContent = overlay.querySelector('.booking-loading-content');
    const successContent = overlay.querySelector('.booking-success-content');
    const errorContent = overlay.querySelector('.booking-error-content');

    // Reset states
    loadingContent.style.display = 'block';
    successContent.style.display = 'none';
    errorContent.style.display = 'none';

    // Show overlay
    overlay.classList.add('show');

    // Simulate progress steps
    simulateProgressSteps();
}

function simulateProgressSteps() {
    const steps = document.querySelectorAll('.progress-step');
    steps.forEach(step => {
        step.classList.remove('active', 'completed');
    });

    steps[0].classList.add('active');
    setTimeout(() => {
        steps[0].classList.remove('active');
        steps[0].classList.add('completed');
        steps[1].classList.add('active');
    }, 1000);

    setTimeout(() => {
        steps[1].classList.remove('active');
        steps[1].classList.add('completed');
        steps[2].classList.add('active');
    }, 2000);
}

function showBookingSuccess() {
    const overlay = document.getElementById('bookingLoadingOverlay');
    const loadingContent = overlay.querySelector('.booking-loading-content');
    const successContent = overlay.querySelector('.booking-success-content');
    const steps = document.querySelectorAll('.progress-step');

    setTimeout(() => {
        steps[1].classList.remove('active');
        steps[1].classList.add('completed');
        setTimeout(() => {
            loadingContent.style.display = 'none';
            successContent.style.display = 'block';
        }, 500);
    }, 1000);
}

function showBookingError(message) {
    const overlay = document.getElementById('bookingLoadingOverlay');
    const loadingContent = overlay.querySelector('.booking-loading-content');
    const errorContent = overlay.querySelector('.booking-error-content');
    const errorMessage = errorContent.querySelector('.error-message');

    if (message) {
        errorMessage.innerHTML = message + '<br>Vui lòng thử lại hoặc liên hệ hotline: <strong>1900 1234</strong>';
    }

    setTimeout(() => {
        loadingContent.style.display = 'none';
        errorContent.style.display = 'block';
    }, 1500);
}

function closeBookingOverlay() {
    const overlay = document.getElementById('bookingLoadingOverlay');
    overlay.classList.remove('show');
    const successContent = overlay.querySelector('.booking-success-content');
    if (successContent.style.display === 'block') {
        resetBookingForm();
    }
}

function resetBookingForm() {
    document.getElementById('bookingForm').reset();
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('appointmentDate').value = today;
    updateTimeSlots(today);
    const workingHoursDisplay = document.querySelector('.working-hours-display');
    if (workingHoursDisplay) {
        workingHoursDisplay.remove();
    }
    document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
    document.getElementById('selectedTime').value = '';
    window.location.href = 'index.html';
}

function contactSupport() {
    window.location.href = 'tel:19001234';
}

// ========== Auto refresh slots for today to handle past time validation ==========
function startTimeSlotRefresh() {
    setInterval(function() {
        const selectedDate = document.getElementById('appointmentDate').value;
        const today = new Date().toISOString().split('T')[0];
        
        // Chỉ refresh nếu đang chọn ngày hôm nay
        if (selectedDate === today) {
            const docId = document.getElementById('doctor').value;
            if (docId) {
                fetchWorkslotsForDoctorAndDate(docId, selectedDate);
            } else {
                updateTimeSlots(selectedDate);
            }
        }
    }, 60000); // Refresh mỗi phút
}

// ========== Debug function để test doctor selection ==========
function debugDoctorSelection() {
    console.log('=== DEBUG DOCTOR SELECTION ===');
    const selectedDoctorName = localStorage.getItem('selectedDoctorName');
    console.log('Stored doctor name in localStorage:', selectedDoctorName);
    
    const doctorSelect = document.getElementById('doctor');
    const options = doctorSelect.querySelectorAll('option');
    console.log('Available doctors in dropdown:');
    options.forEach((option, index) => {
        console.log(`${index}: "${option.textContent}" (value: ${option.value})`);
    });
    
    if (selectedDoctorName) {
        const searchName = selectedDoctorName.replace('Bác sĩ ', '').toLowerCase();
        console.log('Search name (after removing "Bác sĩ"):', searchName);
        
        console.log('Matching attempts:');
        options.forEach((option, index) => {
            const optionText = option.textContent.toLowerCase();
            const normalMatch = optionText.includes(searchName);
            
            // Special check for Linh
            let specialMatch = false;
            if (selectedDoctorName.includes('Nguyễn N. Kh. Linh')) {
                specialMatch = optionText.includes('nguyễn ngọc khánh linh') || 
                             optionText.includes('nguyễn n. kh. linh') ||
                             optionText.includes('khánh linh') ||
                             optionText.includes('n. kh. linh');
            }
            
            console.log(`${index}: "${optionText}" - Normal: ${normalMatch}, Special: ${specialMatch}`);
        });
    }
}
function debugTimeValidation() {
    console.log('=== DEBUG TIME VALIDATION ===');
    const now = new Date();
    console.log('Current time:', now.toLocaleTimeString());
    
    console.log('=== DEBUG APPROVED SLOTS ===');
    console.log('Current approved slots:', approvedSlots);
    console.log('Current booking slots:', currentSlots);
    
    const selectedDate = document.getElementById('appointmentDate').value;
    const selectedDoctor = document.getElementById('doctor').value;
    console.log('Selected date:', selectedDate);
    console.log('Selected doctor:', selectedDoctor);
    
    const approvedForDate = approvedSlots.filter(slot => {
        const slotDate = slot.workDate || slot.date;
        return slotDate === selectedDate && slot.slotStatus === 'approved';
    });
    console.log('Approved slots for selected date:', approvedForDate);
    
    const today = new Date().toISOString().split('T')[0];
    const isToday = selectedDate === today;
    
    console.log('Today:', today);
    console.log('Is today:', isToday);
    
    if (isToday) {
        const slots = document.querySelectorAll('.time-slot');
        slots.forEach(slot => {
            const timeRange = slot.getAttribute('data-time');
            const [startTime] = timeRange.split('-');
            const [hour, minute] = startTime.split(':').map(Number);
            
            const slotTime = new Date();
            slotTime.setHours(hour, minute, 0, 0);
            
            const isPast = slotTime <= now;
            const isDisabled = slot.classList.contains('disabled');
            const isApproved = slot.classList.contains('approved');
            
            console.log(`Slot ${timeRange}: Time=${slotTime.toLocaleTimeString()}, IsPast=${isPast}, IsDisabled=${isDisabled}, IsApproved=${isApproved}`);
        });
    }
}

// Expose debug functions to global scope for testing
window.debugTimeValidation = debugTimeValidation;
window.debugDoctorSelection = debugDoctorSelection;

// ========== Initialize all functionality ===========
document.addEventListener('DOMContentLoaded', async function() {
    // Check booking status trước khi khởi tạo form
    const cusId = getCurrentCustomerId();
    if (cusId) {
        console.log('Checking booking status for customer:', cusId);
        const bookingStatus = await checkCustomerBookingStatus(cusId);
        
        if (bookingStatus.status === 'has_active_medical_record') {
            console.log('Customer has active medical record, showing popup');
            showActiveMedicalRecordPopup(bookingStatus);
            return; // Dừng khởi tạo form nếu có active medical record
        } else if (bookingStatus.status === 'has_pending_booking') {
            console.log('Customer has pending booking, showing popup');
            showPendingBookingPopup(bookingStatus);
            return; // Dừng khởi tạo form nếu có booking pending
        } else {
            console.log('Customer can book new appointment');
        }
    } else {
        console.log('No customer ID found, allowing guest booking');
    }

    // Khởi tạo các chức năng bình thường
    initializeDateInputs();
    loadDoctors();
    setupBookingFormSubmission();
    setupMobileMenu();
    setupDateDoctorChangeListener();
    
    // Bắt đầu auto refresh slots
    startTimeSlotRefresh();

    // Khi load trang lần đầu, nếu có sẵn ngày & bác sĩ thì load workslot luôn
    const docIdInit = document.getElementById('doctor').value;
    const dateInit = document.getElementById('appointmentDate').value;
    if (docIdInit && dateInit) {
        fetchWorkslotsForDoctorAndDate(docIdInit, dateInit);
    } else {
        updateTimeSlots(dateInit || new Date().toISOString().split('T')[0]);
    }
});
