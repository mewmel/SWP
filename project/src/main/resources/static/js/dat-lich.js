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
// Dữ liệu workslot từ backend
let currentSlots = [];

// ================================
// Hàm fetch workslot từ backend
function fetchWorkslotsForDoctorAndDate(docId, date) {
    if (!docId || !date) {
        currentSlots = [];
        updateTimeSlots(date);
        return;
    }
    fetch(`/api/workslots?docId=${docId}&date=${date}`)
        .then(res => res.json())
        .then(data => {
            currentSlots = data;
            updateTimeSlots(date);
        })
        .catch(err => {
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

    // Tạo các slot giờ
    availableHours.forEach(hour => {
        const endHour = parseInt(hour.split(':')[0]) + 1;
        const endTime = endHour.toString().padStart(2, '0') + ':00';
        const slotKey = `${hour}-${endTime}`;

        // Tìm workslot tương ứng từ backend
        const slot = currentSlots.find(s =>
            s.startTime.substring(0,5) === hour && s.endTime.substring(0,5) === endTime
        );
        let disabled = false;
        let title = '';
        if (slot) {
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
                title = 'Dữ liệu slot lỗi!';
            }
        }
        const timeSlot = document.createElement('div');
        timeSlot.className = 'time-slot' + (disabled ? ' disabled' : '');
        timeSlot.setAttribute('data-time', slotKey);
        timeSlot.textContent = slotKey;
        if (title) timeSlot.title = title;

        // Sự kiện click chọn khung giờ
        timeSlot.addEventListener('click', function () {
            if (this.classList.contains('disabled')) return;
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
        })
        .catch(error => {
            console.error('Lỗi lấy danh sách bác sĩ:', error);
        });
}

// ========== Submit form đặt lịch ===========
function setupBookingFormSubmission() {
    document.getElementById('bookingForm').addEventListener('submit', function (e) {
        e.preventDefault();
        if (!document.getElementById('selectedTime').value) {
            alert('Vui lòng chọn khung giờ khám!');
            return;
        }

        // Hiển thị loading overlay
        showBookingLoadingOverlay();

        // Lấy và tách thời gian, loại bỏ giây và khoảng trắng nếu có
        const timeRange = document.getElementById('selectedTime').value.trim();
        let [startTime, endTime] = timeRange.split('-').map(t => t.trim());
        if (startTime.length === 8) startTime = startTime.slice(0,5);
        if (endTime.length === 8) endTime = endTime.slice(0,5);

        const data = {
            fullName: document.getElementById('fullName').value,
            phone: document.getElementById('phone').value,
            email: document.getElementById('email').value,
            dob: document.getElementById('dob').value,
            docId: parseInt(document.getElementById('doctor').value),
            appointmentDate: document.getElementById('appointmentDate').value,
            serId: parseInt(document.getElementById('service').value),
            startTime: startTime,
            endTime: endTime,
            note: document.getElementById('symptoms').value,
            bookType: 'initial'
        };

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
        steps[2].classList.remove('active');
        steps[2].classList.add('completed');
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

// ========== Initialize all functionality ===========
document.addEventListener('DOMContentLoaded', function() {
    initializeDateInputs();
    loadDoctors();
    setupBookingFormSubmission();
    setupMobileMenu();
    setupDateDoctorChangeListener();

    // Khi load trang lần đầu, nếu có sẵn ngày & bác sĩ thì load workslot luôn
    const docIdInit = document.getElementById('doctor').value;
    const dateInit = document.getElementById('appointmentDate').value;
    if (docIdInit && dateInit) {
        fetchWorkslotsForDoctorAndDate(docIdInit, dateInit);
    } else {
        updateTimeSlots(dateInit || new Date().toISOString().split('T')[0]);
    }
});