// Trang xem lịch làm việc đã đăng ký (view-only)
let currentWeek = new Date();

// Hàm tạo dữ liệu lịch cho tuần hiện tại
function getScheduleDataForWeek(weekDate) {
    const days = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    const schedule = [];
    const monday = new Date(weekDate);
    const dayOfWeek = monday.getDay();
    const diff = monday.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    monday.setDate(diff);
    for (let i = 0; i < 7; i++) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        schedule.push({
            day: days[(i + 1) % 7],
            date: `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`,
            isWeekend: (i === 5 || i === 6)
        });
    }
    return schedule;
}

// Lấy các ca đã đăng ký từ localStorage (hoặc backend nếu có API)
function getRegisteredSlots(weekKey) {
    // Dữ liệu lưu dạng: { "2024-06-24": ["24/06-morning", "25/06-afternoon", ...] }
    const data = JSON.parse(localStorage.getItem('doctorRegisteredSlots') || '{}');
    return data[weekKey] || [];
}

function getWeekKey(weekDate) {
    // Trả về yyyy-mm-dd của thứ 2 đầu tuần
    const monday = new Date(weekDate);
    const dayOfWeek = monday.getDay();
    const diff = monday.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    monday.setDate(diff);
    return monday.toISOString().slice(0, 10);
}

function renderSchedule() {
    let scheduleGrid = document.getElementById('scheduleGrid');
    // Đổi class để dùng layout calendar grid
    scheduleGrid.className = 'calendar-grid';
    scheduleGrid.innerHTML = '';
    const scheduleData = getScheduleDataForWeek(currentWeek);
    const weekKey = getWeekKey(currentWeek);
    const registeredSlots = getRegisteredSlots(weekKey);

    scheduleData.forEach(day => {
        const card = document.createElement('div');
        card.className = 'calendar-day-card';
        card.innerHTML = `
            <div class="day-header">
                <h3>${day.day}</h3>
                <div class="day-date">${day.date}/2024</div>
                ${day.isWeekend ? '<span class="weekend-badge">Cuối tuần</span>' : ''}
            </div>
            <div class="shift-slot">
                <label class="shift-label">Ca sáng</label>
                <button class="shift-button morning view-only ${registeredSlots.includes(day.date+'-morning') ? 'selected' : ''}" disabled>
                    <div class="shift-time">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"/>
                            <polyline points="12,6 12,12 16,14"/>
                        </svg>
                        <span>08:00 - 12:00</span>
                    </div>
                </button>
            </div>
            <div class="shift-slot">
                <label class="shift-label">Ca chiều</label>
                ${day.isWeekend ?
                    `<div class="unavailable-slot">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="15" y1="9" x2="9" y2="15"/>
                            <line x1="9" y1="9" x2="15" y2="15"/>
                        </svg>
                        <span>Không làm việc</span>
                    </div>` :
                    `<button class="shift-button afternoon view-only ${registeredSlots.includes(day.date+'-afternoon') ? 'selected' : ''}" disabled>
                        <div class="shift-time">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10"/>
                                <polyline points="12,6 12,12 16,14"/>
                            </svg>
                            <span>14:00 - 17:00</span>
                        </div>
                    </button>`
                }
            </div>
        `;
        scheduleGrid.appendChild(card);
    });
    // Cập nhật tuần
    updateWeekDisplay();
}

function updateWeekDisplay() {
    const startOfWeek = new Date(currentWeek);
    const dayOfWeek = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    startOfWeek.setDate(diff);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    const formatDate = (date) => `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
    document.getElementById('weekRange').textContent = `${formatDate(startOfWeek)} - ${formatDate(endOfWeek)}`;
}

document.addEventListener('DOMContentLoaded', function() {
    renderSchedule();
    document.getElementById('prevWeek').addEventListener('click', () => {
        currentWeek.setDate(currentWeek.getDate() - 7);
        renderSchedule();
    });
    document.getElementById('nextWeek').addEventListener('click', () => {
        currentWeek.setDate(currentWeek.getDate() + 7);
        renderSchedule();
    });
});