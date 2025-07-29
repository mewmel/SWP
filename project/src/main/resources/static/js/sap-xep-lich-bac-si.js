// Các ngày trong tuần
const days = ['T2','T3','T4','T5','T6','T7','CN'];
const dayNames = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];

// Khung giờ của từng ca
const timeSessions = {
    'T2': { morning: ['08:00-12:00'], afternoon: ['14:00-17:00'] },
    'T3': { morning: ['08:00-12:00'], afternoon: ['14:00-17:00'] },
    'T4': { morning: ['08:00-12:00'], afternoon: ['14:00-17:00'] },
    'T5': { morning: ['08:00-12:00'], afternoon: ['14:00-17:00'] },
    'T6': { morning: ['08:00-12:00'], afternoon: ['14:00-17:00'] },
    'T7': { morning: ['08:00-12:00'], afternoon: [] },
    'CN': { morning: ['08:00-12:00'], afternoon: [] }
};

let doctors = [];
let doctorSchedules = {};
let currentWeekStartDate = null;
let currentWeekStartDateObj = null;

// ======== HÀM HIỂN THỊ LOADING ========
function showLoading() {
    document.getElementById('loadingOverlay').style.display = 'flex';
}
function hideLoading() {
    document.getElementById('loadingOverlay').style.display = 'none';
}

// ----- HÀM XỬ LÝ TUẦN (CHUẨN LỊCH WINDOWS, ĐÚNG NGÀY MONDAY ĐANG HIỂN THỊ) -----
function getMondayOfDate(date) {
    const d = new Date(date);
    d.setHours(0,0,0,0);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function getMonthWeeks(year, month) {
    let weeks = [];
    let firstDayOfMonth = new Date(year, month, 1);
    let monday = getMondayOfDate(firstDayOfMonth);

    while (true) {
        weeks.push(new Date(monday));
        monday.setDate(monday.getDate() + 7);
        if (monday.getMonth() > month || (monday.getMonth() < month && monday.getFullYear() > year)) {
            break;
        }
    }
    return weeks;
}

function getWeekOfMonth(date) {
    const year = date.getFullYear();
    const month = date.getMonth();
    const weeks = getMonthWeeks(year, month);
    for (let i = 0; i < weeks.length; i++) {
        let start = new Date(weeks[i]);
        let end = new Date(start);
        end.setDate(end.getDate() + 7);
        if (date >= start && date < end) return i + 1;
    }
    return weeks.length;
}

function formatWeekDisplay(monday) {
    const start = new Date(monday);
    const year = start.getFullYear();
    const month = start.getMonth();
    const weeks = getMonthWeeks(year, month);
    let weekNumber = weeks.findIndex(w => w.getTime() === start.getTime()) + 1;
    if (weekNumber < 1) weekNumber = getWeekOfMonth(start);
    return `Tuần ${weekNumber} - ${start.getDate()} Tháng ${start.getMonth() + 1}, ${start.getFullYear()}`;
}

function updateWeekDisplay() {
    document.getElementById('currentWeekDisplay').textContent = formatWeekDisplay(currentWeekStartDateObj);
}

function extractWeekStartDate() {
    const d = currentWeekStartDateObj;
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}

function extractWeekEndDate() {
    const d = new Date(currentWeekStartDateObj);
    d.setDate(d.getDate() + 6);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}

async function fetchDoctorExistingSlots(doctorId) {
    const from = extractWeekStartDate();
    const to = extractWeekEndDate();
    try {
        const res = await fetch(`/api/doctors/${doctorId}/all-slots?from=${from}&to=${to}`);
        if (!res.ok) return [];
        return await res.json();
    } catch (e) {
        return [];
    }
}

async function fetchDoctorsAndInit() {
    showLoading();
    try {
        const res = await fetch('/api/doctors');
        const data = await res.json();
        doctors = data.map(d => ({
            id: d.id || d.docId,
            name: d.fullName || d.docFullName || d.name
        }));
        doctorSchedules = {};
        for (const doctor of doctors) {
            doctorSchedules[doctor.id] = {};
            days.forEach(day => {
                doctorSchedules[doctor.id][day] = {
                    morning: false,
                    afternoon: false,
                    scheduledMorning: false,
                    scheduledAfternoon: false,
                    morningStatus: '',
                    afternoonStatus: ''
                };
            });
            const slots = await fetchDoctorExistingSlots(doctor.id);
            slots.forEach(slot => {
                const date = new Date(slot.workDate);
                let dayCode = '';
                switch(date.getDay()) {
                    case 0: dayCode = 'CN'; break;
                    case 1: dayCode = 'T2'; break;
                    case 2: dayCode = 'T3'; break;
                    case 3: dayCode = 'T4'; break;
                    case 4: dayCode = 'T5'; break;
                    case 5: dayCode = 'T6'; break;
                    case 6: dayCode = 'T7'; break;
                }
                if (!dayCode) return;
                const start = slot.startTime.substring(0,5);
                if (start === "08:00") {
                    doctorSchedules[doctor.id][dayCode].scheduledMorning = true;
                    doctorSchedules[doctor.id][dayCode].morningStatus = slot.slotStatus || '';
                }
                if (start === "14:00") {
                    doctorSchedules[doctor.id][dayCode].scheduledAfternoon = true;
                    doctorSchedules[doctor.id][dayCode].afternoonStatus = slot.slotStatus || '';
                }
            });
        }
        renderDoctorCards();
    } catch(e) {
        showSuccessMessage('Không thể tải danh sách bác sĩ từ server! ' + e);
        renderDoctorCards();
    }
    hideLoading();
}

function renderDoctorCards() {
    const doctorsGrid = document.getElementById('doctorsGrid');
    doctorsGrid.innerHTML = '';

    doctors.forEach(doctor => {
        let totalSlots = 0;
        let workingSlots = 0;

        days.forEach(day => {
            const sessions = timeSessions[day];
            if (sessions.morning.length > 0) {
                totalSlots++;
                if (doctorSchedules[doctor.id]?.[day]?.morning) workingSlots++;
            }
            if (sessions.afternoon.length > 0) {
                totalSlots++;
                if (doctorSchedules[doctor.id]?.[day]?.afternoon) workingSlots++;
            }
        });

        const workingPercentage = totalSlots ? Math.round((workingSlots / totalSlots) * 100) : 0;
        const doctorInitials = doctor.name.split(' ').map(n => n.charAt(0)).join('').toUpperCase();

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

// CHỈNH CHẮC CHẮN: slotStatus=cancelled sẽ ép style nền đỏ!
function renderDayTimeSlots(doctorId, day, dayIndex) {
    const sessions = timeSessions[day];
    let slotsHTML = '';

    // Sáng
    if (sessions.morning.length > 0) {
        const isMorningSelected = doctorSchedules[doctorId]?.[day]?.morning || false;
        const isMorningScheduled = doctorSchedules[doctorId]?.[day]?.scheduledMorning || false;
        const morningStatus = doctorSchedules[doctorId]?.[day]?.morningStatus || '';
        const slotClass = dayIndex >= 5 ? 'weekend-slot' : 'morning-slot';

        let statusIcon = '';
        let extraClass = '';
        let styleAttr = '';
        if (isMorningScheduled && morningStatus === 'approved') {
            statusIcon = '<i class="fa fa-check slot-check" style="color:#22c55e"></i>';
            extraClass = 'approved-slot';
        } else if (isMorningScheduled && morningStatus === 'cancelled') {
            statusIcon = '<i class="fa fa-times-circle slot-check" style="color:#fff"></i>';
            extraClass = 'cancelled-slot';
            styleAttr = 'style="background: linear-gradient(90deg, #f87171 0%, #dc2626 100%) !important; color: #fff !important;border:none;"';
        }

        slotsHTML += `
      <div class="time-slot ${slotClass} ${extraClass} ${isMorningSelected ? 'selected' : ''} ${isMorningScheduled ? 'scheduled' : ''}" 
           ${styleAttr}
           data-doctor="${doctorId}" data-day="${day}" data-shift="morning"
           onclick="toggleTimeSlot(this)">
        <p class="slot-time">🌅 Ca sáng</p>
        <p class="slot-hours">08:00-12:00</p>
        ${statusIcon}
      </div>
    `;
    }

    // Chiều
    if (sessions.afternoon.length > 0) {
        const isAfternoonSelected = doctorSchedules[doctorId]?.[day]?.afternoon || false;
        const isAfternoonScheduled = doctorSchedules[doctorId]?.[day]?.scheduledAfternoon || false;
        const afternoonStatus = doctorSchedules[doctorId]?.[day]?.afternoonStatus || '';

        let statusIcon = '';
        let extraClass = '';
        let styleAttr = '';
        if (isAfternoonScheduled && afternoonStatus === 'approved') {
            statusIcon = '<i class="fa fa-check slot-check" style="color:#22c55e"></i>';
            extraClass = 'approved-slot';
        } else if (isAfternoonScheduled && afternoonStatus === 'cancelled') {
            statusIcon = '<i class="fa fa-times-circle slot-check" style="color:#fff"></i>';
            extraClass = 'cancelled-slot';
            styleAttr = 'style="background: linear-gradient(90deg, #f87171 0%, #dc2626 100%) !important; color: #fff !important;border:none;"';
        }

        slotsHTML += `
      <div class="time-slot afternoon-slot ${extraClass} ${isAfternoonSelected ? 'selected' : ''} ${isAfternoonScheduled ? 'scheduled' : ''}" 
           ${styleAttr}
           data-doctor="${doctorId}" data-day="${day}" data-shift="afternoon"
           onclick="toggleTimeSlot(this)">
        <p class="slot-time">🌆 Ca chiều</p>
        <p class="slot-hours">14:00-17:00</p>
        ${statusIcon}
      </div>
    `;
    }

    return slotsHTML;
}

window.toggleTimeSlot = function(element) {
    const doctor = element.getAttribute('data-doctor');
    const day = element.getAttribute('data-day');
    const shift = element.getAttribute('data-shift');
    const isSelected = element.classList.contains('selected');
    if (element.classList.contains('scheduled')) {
        return;
    }

    if (isSelected) {
        element.classList.remove('selected');
        doctorSchedules[doctor][day][shift] = false;
    } else {
        element.classList.add('selected');
        doctorSchedules[doctor][day][shift] = true;
    }

    updateDoctorStats(doctor);
    updateStats();
};

function updateDoctorStats(doctorId) {
    const doctorCard = Array.from(document.querySelectorAll('.doctor-card')).find(card =>
        card.querySelector(`.time-slot[data-doctor="${doctorId}"]`)
    );
    if (!doctorCard) return;

    let totalSlots = 0;
    let workingSlots = 0;

    days.forEach(day => {
        const sessions = timeSessions[day];
        if (sessions.morning.length > 0) {
            totalSlots++;
            if (doctorSchedules[doctorId]?.[day]?.morning) workingSlots++;
        }
        if (sessions.afternoon.length > 0) {
            totalSlots++;
            if (doctorSchedules[doctorId]?.[day]?.afternoon) workingSlots++;
        }
    });

    const workingPercentage = totalSlots ? Math.round((workingSlots / totalSlots) * 100) : 0;
    const statsElement = doctorCard.querySelector('.doctor-stats');
    if (statsElement) {
        statsElement.textContent = `${workingSlots}/${totalSlots} ca làm việc (${workingPercentage}%)`;
    }
}

function updateStats() {
    let workingDoctors = 0;
    let totalShifts = 0;
    let totalPossibleShifts = 0;

    days.forEach(day => {
        const sessions = timeSessions[day];
        if (sessions.morning.length > 0) totalPossibleShifts += doctors.length;
        if (sessions.afternoon.length > 0) totalPossibleShifts += doctors.length;
    });

    doctors.forEach(doctor => {
        let hasAnyShift = false;
        days.forEach(day => {
            const sessions = timeSessions[day];
            if (sessions.morning.length > 0 && (
                doctorSchedules[doctor.id]?.[day]?.morning || doctorSchedules[doctor.id]?.[day]?.scheduledMorning
            )) {
                totalShifts++;
                hasAnyShift = true;
            }
            if (sessions.afternoon.length > 0 && (
                doctorSchedules[doctor.id]?.[day]?.afternoon || doctorSchedules[doctor.id]?.[day]?.scheduledAfternoon
            )) {
                totalShifts++;
                hasAnyShift = true;
            }
        });
        if (hasAnyShift) workingDoctors++;
    });

    const coverageRate = totalPossibleShifts ? Math.round((totalShifts / totalPossibleShifts) * 100) : 0;

    document.getElementById('totalDoctors').textContent = doctors.length;
    document.getElementById('workingDoctors').textContent = workingDoctors;
    document.getElementById('totalShifts').textContent = totalShifts;
    document.getElementById('coverageRate').textContent = coverageRate + '%';
}

// --- HÀM LƯU LỊCH (POST ĐÚNG NGÀY ĐẦU TUẦN) ---
// Giữ nguyên vị trí scroll khi update UI sau khi lưu
function saveAllSchedule() {
    showLoading();

    currentWeekStartDate = extractWeekStartDate();
    const maId = localStorage.getItem('maId');

    const payload = doctors.map(doctor => ({
        docId: doctor.id,
        maId: maId ? parseInt(maId) : null,
        weekStartDate: currentWeekStartDate,
        shifts: days.map(day => ({
            weekday: day,
            morning: !!doctorSchedules[doctor.id][day].morning,
            afternoon: !!doctorSchedules[doctor.id][day].afternoon,
            maxPatient: 5
        }))
    }));

    // Lưu vị trí scroll trước khi render lại
    const scrollY = window.scrollY;

    fetch('/api/workslots/week-bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
        .then(res => {
            hideLoading();
            if (res.ok) {
                doctors.forEach(doctor => {
                    days.forEach(day => {
                        if (doctorSchedules[doctor.id][day].morning) {
                            doctorSchedules[doctor.id][day].scheduledMorning = true;
                            doctorSchedules[doctor.id][day].morning = false;
                        }
                        if (doctorSchedules[doctor.id][day].afternoon) {
                            doctorSchedules[doctor.id][day].scheduledAfternoon = true;
                            doctorSchedules[doctor.id][day].afternoon = false;
                        }
                    });
                });
                renderDoctorCards();
                // Set lại vị trí scroll như trước khi bấm lưu
                setTimeout(() => {
                    window.scrollTo(0, scrollY);
                }, 50);
                showSuccessMessage('Đã lưu lịch làm việc cho tất cả bác sĩ thành công!');
            } else {
                return res.text().then(txt => { throw new Error(txt); });
            }
        })
        .catch(err => {
            hideLoading();
            showSuccessMessage('Lỗi khi lưu lịch: ' + err.message);
        });
}

function showSuccessMessage(message) {
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

document.getElementById('saveAllScheduleBtn').addEventListener('click', saveAllSchedule);

document.getElementById('resetScheduleBtn').addEventListener('click', function() {
    if (confirm('Bạn có chắc chắn muốn bỏ chọn các ca vừa chọn (xanh đậm)?')) {
        doctors.forEach(doctor => {
            days.forEach(day => {
                if (!doctorSchedules[doctor.id][day].scheduledMorning) {
                    doctorSchedules[doctor.id][day].morning = false;
                }
                if (!doctorSchedules[doctor.id][day].scheduledAfternoon) {
                    doctorSchedules[doctor.id][day].afternoon = false;
                }
            });
        });
        renderDoctorCards();
        showSuccessMessage('Đã bỏ chọn các ca chưa lưu!');
        // XÓA DÒNG CUỘN LÊN, GIỜ SẼ KHÔNG TỰ ĐỘNG CUỘN NỮA
        // document.getElementById('schedule-section').scrollIntoView({behavior: 'smooth'});
    }
});

document.getElementById('selectAllBtn').addEventListener('click', function() {
    document.querySelectorAll('.time-slot').forEach(slot => {
        if (!slot.classList.contains('selected') && !slot.classList.contains('scheduled')) {
            slot.classList.add('selected');
            const doctor = slot.getAttribute('data-doctor');
            const day = slot.getAttribute('data-day');
            const shift = slot.getAttribute('data-shift');
            doctorSchedules[doctor][day][shift] = true;
        }
    });
    doctors.forEach(doctor => updateDoctorStats(doctor.id));
    updateStats();
});

document.getElementById('clearAllBtn').addEventListener('click', function() {
    document.querySelectorAll('.time-slot').forEach(slot => {
        if (slot.classList.contains('selected') && !slot.classList.contains('scheduled')) {
            slot.classList.remove('selected');
            const doctor = slot.getAttribute('data-doctor');
            const day = slot.getAttribute('data-day');
            const shift = slot.getAttribute('data-shift');
            doctorSchedules[doctor][day][shift] = false;
        }
    });
    doctors.forEach(doctor => updateDoctorStats(doctor.id));
    updateStats();
});

document.getElementById('prevWeek').addEventListener('click', function() {
    let prev = new Date(currentWeekStartDateObj);
    prev.setDate(prev.getDate() - 7);
    currentWeekStartDateObj = getMondayOfDate(prev);
    updateWeekDisplay();
    fetchDoctorsAndInit();
});
document.getElementById('nextWeek').addEventListener('click', function() {
    let next = new Date(currentWeekStartDateObj);
    next.setDate(next.getDate() + 7);
    currentWeekStartDateObj = getMondayOfDate(next);
    updateWeekDisplay();
    fetchDoctorsAndInit();
});

document.addEventListener('DOMContentLoaded', function() {
    currentWeekStartDateObj = getMondayOfDate(new Date());
    updateWeekDisplay();
    fetchDoctorsAndInit();

    // Khi reload, luôn scroll về đầu trang (nếu muốn giữ nguyên vị trí thì comment dòng này lại)
    window.scrollTo(0, 0);

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
    .time-slot.scheduled {
      background: linear-gradient(90deg, #38bdf8 0%, #2563eb 100%);
      color: #fff;
      font-weight: 500;
      border: none;
      box-shadow: 0 2px 6px #2563eb22;
      position: relative;
      pointer-events: none;
      opacity: 1;
    }
    .time-slot.scheduled.cancelled-slot {
      background: linear-gradient(90deg, #f87171 0%, #dc2626 100%) !important;
      color: #fff !important;
      border: none;
      box-shadow: 0 2px 6px #ef444422;
      position: relative;
      pointer-events: none;
      opacity: 1;
    }
    .time-slot.scheduled .slot-check {
      position: absolute;
      top: 6px;
      right: 8px;
      font-size: 18px;
    }
    .time-slot.scheduled p {
      color: #fff !important;
    }
    .time-slot.scheduled.cancelled-slot .slot-check {
      color: #fff !important;
    }
  `;
    document.head.appendChild(style);
});
document.addEventListener('DOMContentLoaded', function() {
    const logoutBtn = document.querySelector('.doctor-logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function () {
            localStorage.clear();
            window.location.href = '/index.html';
        });
    }
});
document.addEventListener('DOMContentLoaded', function() {
    const maFullName = localStorage.getItem('maFullName');
    if (maFullName) {
        const el = document.querySelector('.doctor-user-name');
        if (el) el.textContent = maFullName;
    }
});