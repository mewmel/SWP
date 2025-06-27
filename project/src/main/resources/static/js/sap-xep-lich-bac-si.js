// Simplified JavaScript for schedule management with only 2 shifts
const doctors = [
    { id: 'BS001', name: 'BS. Nguyễn Văn A' },
    { id: 'BS002', name: 'BS. Trần Thị B' },
    { id: 'BS003', name: 'BS. Lê Văn C' },
    { id: 'BS004', name: 'BS. Phạm Thị D' },
    { id: 'BS005', name: 'BS. Hoàng Văn E' },
    { id: 'BS006', name: 'BS. Đặng Thị F' }
];

// Simplified time sessions with only 2 shifts per day
const timeSessions = {
    'T2': {
        morning: ['08:00-12:00'],
        afternoon: ['14:00-17:00']
    },
    'T3': {
        morning: ['08:00-12:00'],
        afternoon: ['14:00-17:00']
    },
    'T4': {
        morning: ['08:00-12:00'],
        afternoon: ['14:00-17:00']
    },
    'T5': {
        morning: ['08:00-12:00'],
        afternoon: ['14:00-17:00']
    },
    'T6': {
        morning: ['08:00-12:00'],
        afternoon: ['14:00-17:00']
    },
    'T7': {
        morning: ['08:00-12:00'],
        afternoon: [] // Weekend only morning
    },
    'CN': {
        morning: ['08:00-12:00'],
        afternoon: [] // Weekend only morning
    }
};

// Simplified schedule data with only 2 shifts
const doctorSchedules = {
    'BS001': {
        'T2': { 'morning': true, 'afternoon': false },
        'T3': { 'morning': true, 'afternoon': true },
        'T4': { 'morning': false, 'afternoon': true },
        'T5': { 'morning': true, 'afternoon': false },
        'T6': { 'morning': false, 'afternoon': false },
        'T7': { 'morning': false },
        'CN': { 'morning': false }
    },
    'BS002': {
        'T2': { 'morning': false, 'afternoon': true },
        'T3': { 'morning': true, 'afternoon': true },
        'T4': { 'morning': true, 'afternoon': false },
        'T5': { 'morning': false, 'afternoon': true },
        'T6': { 'morning': true, 'afternoon': true },
        'T7': { 'morning': false },
        'CN': { 'morning': false }
    },
    'BS003': {
        'T2': { 'morning': true, 'afternoon': false },
        'T3': { 'morning': false, 'afternoon': true },
        'T4': { 'morning': true, 'afternoon': true },
        'T5': { 'morning': false, 'afternoon': false },
        'T6': { 'morning': true, 'afternoon': false },
        'T7': { 'morning': false },
        'CN': { 'morning': false }
    },
    'BS004': {
        'T2': { 'morning': false, 'afternoon': false },
        'T3': { 'morning': true, 'afternoon': false },
        'T4': { 'morning': false, 'afternoon': true },
        'T5': { 'morning': true, 'afternoon': true },
        'T6': { 'morning': false, 'afternoon': true },
        'T7': { 'morning': false },
        'CN': { 'morning': false }
    },
    'BS005': {
        'T2': { 'morning': true, 'afternoon': true },
        'T3': { 'morning': false, 'afternoon': false },
        'T4': { 'morning': true, 'afternoon': false },
        'T5': { 'morning': false, 'afternoon': true },
        'T6': { 'morning': true, 'afternoon': false },
        'T7': { 'morning': false },
        'CN': { 'morning': false }
    },
    'BS006': {
        'T2': { 'morning': false, 'afternoon': true },
        'T3': { 'morning': true, 'afternoon': false },
        'T4': { 'morning': false, 'afternoon': false },
        'T5': { 'morning': true, 'afternoon': false },
        'T6': { 'morning': false, 'afternoon': true },
        'T7': { 'morning': false },
        'CN': { 'morning': false }
    }
};

const days = ['T2','T3','T4','T5','T6','T7','CN'];
const dayNames = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];

function showLoading() {
    document.getElementById('loadingOverlay').style.display = 'flex';
}

function hideLoading() {
    document.getElementById('loadingOverlay').style.display = 'none';
}

function renderDoctorCards() {
    const doctorsGrid = document.getElementById('doctorsGrid');
    doctorsGrid.innerHTML = '';

    doctors.forEach(doctor => {
        // Calculate doctor stats
        let totalSlots = 0;
        let workingSlots = 0;

        days.forEach(day => {
            const sessions = timeSessions[day];
            // Morning shift
            if (sessions.morning.length > 0) {
                totalSlots++;
                if (doctorSchedules[doctor.id]?.[day]?.morning) workingSlots++;
            }
            // Afternoon shift
            if (sessions.afternoon.length > 0) {
                totalSlots++;
                if (doctorSchedules[doctor.id]?.[day]?.afternoon) workingSlots++;
            }
        });

        const workingPercentage = Math.round((workingSlots / totalSlots) * 100);
        const doctorInitials = doctor.name.split(' ').map(n => n.charAt(0)).join('').toUpperCase();

        // Create doctor card
        const doctorCard = document.createElement('div');
        doctorCard.className = 'doctor-card';

        doctorCard.innerHTML = `
      <div class="doctor-header">
        <div class="doctor-avatar">${doctorInitials}</div>
        <div class="doctor-info">
          <h4>${doctor.name}</h4>
          <p class="doctor-stats">${workingSlots}/${totalSlots} ca làm việc (${workingPercentage}%)</p>
        </div>
      </div>
      <div class="week-schedule">
        ${days.map((day, dayIndex) => `
          <div class="day-column">
            <div class="day-header ${dayIndex >= 5 ? 'weekend' : 'weekday'}">
              ${dayNames[dayIndex]}
            </div>
            <div class="time-slots">
              ${renderDayTimeSlots(doctor.id, day, dayIndex)}
            </div>
          </div>
        `).join('')}
      </div>
    `;

        doctorsGrid.appendChild(doctorCard);
    });

    updateStats();
}

function renderDayTimeSlots(doctorId, day, dayIndex) {
    const sessions = timeSessions[day];
    let slotsHTML = '';

    // Morning shift
    if (sessions.morning.length > 0) {
        const isMorningSelected = doctorSchedules[doctorId]?.[day]?.morning || false;
        const slotClass = dayIndex >= 5 ? 'weekend-slot' : 'morning-slot';

        slotsHTML += `
      <div class="time-slot ${slotClass} ${isMorningSelected ? 'selected' : ''}" 
           data-doctor="${doctorId}" data-day="${day}" data-shift="morning"
           onclick="toggleTimeSlot(this)">
        <p class="slot-time">🌅 Ca sáng</p>
        <p class="slot-hours">08:00-12:00</p>
      </div>
    `;
    }

    // Afternoon shift (only for weekdays)
    if (sessions.afternoon.length > 0) {
        const isAfternoonSelected = doctorSchedules[doctorId]?.[day]?.afternoon || false;

        slotsHTML += `
      <div class="time-slot afternoon-slot ${isAfternoonSelected ? 'selected' : ''}" 
           data-doctor="${doctorId}" data-day="${day}" data-shift="afternoon"
           onclick="toggleTimeSlot(this)">
        <p class="slot-time">🌆 Ca chiều</p>
        <p class="slot-hours">14:00-17:00</p>
      </div>
    `;
    }

    return slotsHTML;
}

function toggleTimeSlot(element) {
    const doctor = element.getAttribute('data-doctor');
    const day = element.getAttribute('data-day');
    const shift = element.getAttribute('data-shift');

    // Toggle selection
    const isSelected = element.classList.contains('selected');

    if (isSelected) {
        element.classList.remove('selected');
        doctorSchedules[doctor][day][shift] = false;
    } else {
        element.classList.add('selected');
        if (!doctorSchedules[doctor]) doctorSchedules[doctor] = {};
        if (!doctorSchedules[doctor][day]) doctorSchedules[doctor][day] = {};
        doctorSchedules[doctor][day][shift] = true;
    }

    // Update doctor stats in real-time
    updateDoctorStats(doctor);
    updateStats();
}

function updateDoctorStats(doctorId) {
    const doctorCard = document.querySelector(`[data-doctor="${doctorId}"]`).closest('.doctor-card');
    if (!doctorCard) return;

    let totalSlots = 0;
    let workingSlots = 0;

    days.forEach(day => {
        const sessions = timeSessions[day];
        // Morning shift
        if (sessions.morning.length > 0) {
            totalSlots++;
            if (doctorSchedules[doctorId]?.[day]?.morning) workingSlots++;
        }
        // Afternoon shift
        if (sessions.afternoon.length > 0) {
            totalSlots++;
            if (doctorSchedules[doctorId]?.[day]?.afternoon) workingSlots++;
        }
    });

    const workingPercentage = Math.round((workingSlots / totalSlots) * 100);
    const statsElement = doctorCard.querySelector('.doctor-stats');
    if (statsElement) {
        statsElement.textContent = `${workingSlots}/${totalSlots} ca làm việc (${workingPercentage}%)`;
    }
}

function updateStats() {
    let workingDoctors = 0;
    let totalShifts = 0;
    let totalPossibleShifts = 0;

    // Calculate total possible shifts
    days.forEach(day => {
        const sessions = timeSessions[day];
        if (sessions.morning.length > 0) totalPossibleShifts += doctors.length;
        if (sessions.afternoon.length > 0) totalPossibleShifts += doctors.length;
    });

    doctors.forEach(doctor => {
        let hasAnyShift = false;
        days.forEach(day => {
            const sessions = timeSessions[day];

            // Check morning shift
            if (sessions.morning.length > 0 && doctorSchedules[doctor.id]?.[day]?.morning) {
                totalShifts++;
                hasAnyShift = true;
            }

            // Check afternoon shift
            if (sessions.afternoon.length > 0 && doctorSchedules[doctor.id]?.[day]?.afternoon) {
                totalShifts++;
                hasAnyShift = true;
            }
        });
        if (hasAnyShift) workingDoctors++;
    });

    const coverageRate = Math.round((totalShifts / totalPossibleShifts) * 100);

    document.getElementById('totalDoctors').textContent = doctors.length;
    document.getElementById('workingDoctors').textContent = workingDoctors;
    document.getElementById('totalShifts').textContent = totalShifts;
    document.getElementById('coverageRate').textContent = coverageRate + '%';
}

function saveAllSchedule() {
    showLoading();

    // Simulate API call delay
    setTimeout(() => {
        document.querySelectorAll('.time-slot').forEach(slot => {
            const doctor = slot.getAttribute('data-doctor');
            const day = slot.getAttribute('data-day');
            const shift = slot.getAttribute('data-shift');
            const isSelected = slot.classList.contains('selected');

            if (!doctorSchedules[doctor]) doctorSchedules[doctor] = {};
            if (!doctorSchedules[doctor][day]) doctorSchedules[doctor][day] = {};
            doctorSchedules[doctor][day][shift] = isSelected;
        });

        hideLoading();
        showSuccessMessage('Đã lưu lịch làm việc cho tất cả bác sĩ thành công!');
        updateStats();
    }, 1500);
}

function showSuccessMessage(message) {
    // Simple success notification
    const notification = document.createElement('div');
    notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #10b981;
    color: white;
    padding: 16px 24px;
    border-radius: 8px;
    font-weight: 500;
    z-index: 10000;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    animation: slideIn 0.3s ease;
  `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Event listeners
document.getElementById('saveAllScheduleBtn').addEventListener('click', saveAllSchedule);

document.getElementById('resetScheduleBtn').addEventListener('click', function() {
    if (confirm('Bạn có chắc chắn muốn đặt lại tất cả lịch làm việc?')) {
        doctors.forEach(doctor => {
            days.forEach(day => {
                if (!doctorSchedules[doctor.id]) doctorSchedules[doctor.id] = {};
                if (!doctorSchedules[doctor.id][day]) doctorSchedules[doctor.id][day] = {};

                const sessions = timeSessions[day];
                if (sessions.morning.length > 0) {
                    doctorSchedules[doctor.id][day].morning = false;
                }
                if (sessions.afternoon.length > 0) {
                    doctorSchedules[doctor.id][day].afternoon = false;
                }
            });
        });
        renderDoctorCards();
        showSuccessMessage('Đã đặt lại tất cả lịch làm việc!');
    }
});

document.getElementById('selectAllBtn').addEventListener('click', function() {
    document.querySelectorAll('.time-slot').forEach(slot => {
        if (!slot.classList.contains('selected')) {
            slot.classList.add('selected');
            const doctor = slot.getAttribute('data-doctor');
            const day = slot.getAttribute('data-day');
            const shift = slot.getAttribute('data-shift');

            if (!doctorSchedules[doctor]) doctorSchedules[doctor] = {};
            if (!doctorSchedules[doctor][day]) doctorSchedules[doctor][day] = {};
            doctorSchedules[doctor][day][shift] = true;
        }
    });

    // Update all doctor stats
    doctors.forEach(doctor => updateDoctorStats(doctor.id));
    updateStats();
});

document.getElementById('clearAllBtn').addEventListener('click', function() {
    document.querySelectorAll('.time-slot').forEach(slot => {
        if (slot.classList.contains('selected')) {
            slot.classList.remove('selected');
            const doctor = slot.getAttribute('data-doctor');
            const day = slot.getAttribute('data-day');
            const shift = slot.getAttribute('data-shift');

            if (doctorSchedules[doctor] && doctorSchedules[doctor][day]) {
                doctorSchedules[doctor][day][shift] = false;
            }
        }
    });

    // Update all doctor stats
    doctors.forEach(doctor => updateDoctorStats(doctor.id));
    updateStats();
});

// Week navigation (dummy functionality)
document.getElementById('prevWeek').addEventListener('click', function() {
    showSuccessMessage('Chuyển đến tuần trước');
});

document.getElementById('nextWeek').addEventListener('click', function() {
    showSuccessMessage('Chuyển đến tuần sau');
});

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    renderDoctorCards();

    // Add CSS for animations
    const style = document.createElement('style');
    style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    
    .slot-hours {
      font-size: 11px;
      color: #64748b;
      margin: 0;
      margin-top: 2px;
    }
  `;
    document.head.appendChild(style);
});