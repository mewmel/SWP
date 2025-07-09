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

// Biến động: danh sách bác sĩ và schedule
let doctors = [];
let doctorSchedules = {};
let currentWeekStartDate = null;

// === Biến toàn cục cho tuần (dạng Date object) ===
let currentWeekStartDateObj = null;

// ======== HÀM HIỂN THỊ LOADING ========
function showLoading() {
    document.getElementById('loadingOverlay').style.display = 'flex';
}
function hideLoading() {
    document.getElementById('loadingOverlay').style.display = 'none';
}

// ----- HÀM XỬ LÝ TUẦN (CHUẨN LỊCH WINDOWS, ĐÚNG NGÀY MONDAY ĐANG HIỂN THỊ) -----

// Lấy ngày Thứ 2 gần nhất của 1 ngày bất kỳ (luôn trả về object mới, không thay đổi biến truyền vào)
function getMondayOfDate(date) {
    const d = new Date(date);
    d.setHours(0,0,0,0);
    const day = d.getDay();
    // day === 0 là Chủ nhật => lùi về thứ 2 trước đó (6 ngày)
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

// Lấy mảng các ngày Thứ 2 đầu tuần của tháng (có thể kéo từ cuối tháng trước sang)
function getMonthWeeks(year, month) {
    let weeks = [];
    let firstDayOfMonth = new Date(year, month, 1);
    let monday = getMondayOfDate(firstDayOfMonth);

    while (true) {
        weeks.push(new Date(monday));
        monday.setDate(monday.getDate() + 7);
        // Khi monday đã sang hẳn tháng sau, break
        if (monday.getMonth() > month || (monday.getMonth() < month && monday.getFullYear() > year)) {
            break;
        }
    }
    return weeks;
}

// Xác định tuần thứ mấy trong tháng (tuần lịch, không phải tuần ISO)
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
    return weeks.length; // fallback
}

// Trả về string: "Tuần x - dd Tháng mm, yyyy" (ngày là thứ 2 đầu tuần, đúng tuần lịch)
function formatWeekDisplay(monday) {
    const start = new Date(monday);
    const year = start.getFullYear();
    const month = start.getMonth();
    const weeks = getMonthWeeks(year, month);
    let weekNumber = weeks.findIndex(w => w.getTime() === start.getTime()) + 1;
    if (weekNumber < 1) weekNumber = getWeekOfMonth(start);
    return `Tuần ${weekNumber} - ${start.getDate()} Tháng ${start.getMonth() + 1}, ${start.getFullYear()}`;
}

// Update hiển thị tuần lên giao diện
function updateWeekDisplay() {
    document.getElementById('currentWeekDisplay').textContent = formatWeekDisplay(currentWeekStartDateObj);
}

// Hàm lấy ngày đầu tuần (yyyy-mm-dd) dùng cho API - KHÔNG DÙNG toISOString() để tránh lệch ngày!
function extractWeekStartDate() {
    const d = currentWeekStartDateObj;
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}

// Fetch danh sách bác sĩ từ backend và khởi tạo schedule
function fetchDoctorsAndInit() {
    showLoading();
    fetch('/api/doctors')
        .then(res => res.json())
        .then(data => {
            doctors = data.map(d => ({
                id: d.id || d.docId,
                name: d.fullName || d.docFullName || d.name
            }));
            if (doctors.length === 0) {
                hideLoading();
                showSuccessMessage('Không có bác sĩ nào trong hệ thống!');
                renderDoctorCards();
                return;
            }
            doctorSchedules = {};
            doctors.forEach(doctor => {
                doctorSchedules[doctor.id] = {};
                days.forEach(day => {
                    doctorSchedules[doctor.id][day] = { morning: false, afternoon: false };
                });
            });
            renderDoctorCards();
            hideLoading();
        })
        .catch((e) => {
            hideLoading();
            showSuccessMessage('Không thể tải danh sách bác sĩ từ server! ' + e);
            renderDoctorCards();
        });
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

    // Afternoon shift
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

window.toggleTimeSlot = function(element) {
    const doctor = element.getAttribute('data-doctor');
    const day = element.getAttribute('data-day');
    const shift = element.getAttribute('data-shift');
    const isSelected = element.classList.contains('selected');

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
            if (sessions.morning.length > 0 && doctorSchedules[doctor.id]?.[day]?.morning) {
                totalShifts++;
                hasAnyShift = true;
            }
            if (sessions.afternoon.length > 0 && doctorSchedules[doctor.id]?.[day]?.afternoon) {
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
function saveAllSchedule() {
    showLoading();

    // Lấy ngày đầu tuần từ currentWeekStartDateObj
    currentWeekStartDate = extractWeekStartDate();

    // LẤY maId từ localStorage
    const maId = localStorage.getItem('maId');

    const payload = doctors.map(doctor => ({
        docId: doctor.id,
        maId: maId ? parseInt(maId) : null, // BỔ SUNG maId vào payload
        weekStartDate: currentWeekStartDate,
        shifts: days.map(day => ({
            weekday: day,
            morning: !!doctorSchedules[doctor.id][day].morning,
            afternoon: !!doctorSchedules[doctor.id][day].afternoon,
            maxPatient: 5 // hoặc lấy theo từng bác sĩ nếu có
        }))
    }));

    fetch('/api/workslots/week-bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
        .then(res => {
            hideLoading();
            if (res.ok) {
                showSuccessMessage('Đã lưu lịch làm việc cho tất cả bác sĩ thành công!');
                updateStats();
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
    if (confirm('Bạn có chắc chắn muốn đặt lại tất cả lịch làm việc?')) {
        doctors.forEach(doctor => {
            days.forEach(day => {
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
            doctorSchedules[doctor][day][shift] = true;
        }
    });
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
            doctorSchedules[doctor][day][shift] = false;
        }
    });
    doctors.forEach(doctor => updateDoctorStats(doctor.id));
    updateStats();
});

// ==== XỬ LÝ CHUYỂN TUẦN BẰNG MŨI TÊN CHUẨN LỊCH WINDOWS ====
document.getElementById('prevWeek').addEventListener('click', function() {
    let prev = new Date(currentWeekStartDateObj);
    prev.setDate(prev.getDate() - 7);
    currentWeekStartDateObj = getMondayOfDate(prev);
    updateWeekDisplay();
});
document.getElementById('nextWeek').addEventListener('click', function() {
    let next = new Date(currentWeekStartDateObj);
    next.setDate(next.getDate() + 7);
    currentWeekStartDateObj = getMondayOfDate(next);
    updateWeekDisplay();
});

document.addEventListener('DOMContentLoaded', function() {
    // Khởi tạo ngày đầu tuần là Thứ 2 gần nhất, có thể là cuối tháng trước
    currentWeekStartDateObj = getMondayOfDate(new Date());
    updateWeekDisplay();

    fetchDoctorsAndInit();

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
    // Lấy tên manager từ localStorage
    const maFullName = localStorage.getItem('maFullName');
    if (maFullName) {
        const el = document.querySelector('.doctor-user-name');
        if (el) el.textContent = maFullName;
    }
});