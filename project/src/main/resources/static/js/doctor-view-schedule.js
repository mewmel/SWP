let currentWeek = getMondayOfWeek(new Date());

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
    renderSchedule();


    document.getElementById('prevWeek').onclick = function () {
        // Trừ 7 ngày, rồi luôn reset về thứ 2
        currentWeek.setDate(currentWeek.getDate() - 7);
        currentWeek = getMondayOfWeek(currentWeek); // đảm bảo luôn là thứ 2
        renderSchedule();
    };
    document.getElementById('nextWeek').onclick = function () {
        // Cộng 7 ngày, rồi luôn reset về thứ 2
        currentWeek.setDate(currentWeek.getDate() + 7);
        currentWeek = getMondayOfWeek(currentWeek); // đảm bảo luôn là thứ 2
        renderSchedule();
    };
});


function getMondayOfWeek(date) {
    const d = new Date(date);
    const day = d.getDay();
    // Nếu là Chủ nhật (0) thì phải lùi 6 ngày, còn các ngày khác thì lùi về đúng thứ 2
    const diff = d.getDate() - ((day + 6) % 7);
    d.setDate(diff);
    d.setHours(0, 0, 0, 0); // clear time part
    return d;
}





function getScheduleDataForWeek(weekDate) {
    const days = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    const schedule = [];
    // Clone lại date truyền vào, không mutate object gốc!
    const monday = new Date(weekDate);
    const dayOfWeek = monday.getDay();
    const diff = monday.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    monday.setDate(diff);
    for (let i = 0; i < 7; i++) {
        // Clone lại mỗi lần
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
const scheduleData = getScheduleDataForWeek(new Date(currentWeek));


// Gọi API lấy các ca làm việc đã phân công trong tuần (status = approved)
async function fetchDoctorWorkSlotsForWeek(docId, fromDate, toDate) {
    try {
        const res = await fetch(`/api/workslots/${docId}/slots?from=${fromDate}&to=${toDate}`);
        if (!res.ok) return [];
        return await res.json(); // Trả về array các WorkSlot
    } catch (err) {
        console.error("Không lấy được WorkSlot:", err);
        return [];
    }
}

// Map slots -> array string ["24/06-morning", "24/06-afternoon", ...]
function mapSlotsForHighlight(slots) {
    return slots.map(slot => {
        // slot.workDate dạng yyyy-mm-dd, slot.startTime dạng "08:00:00"
        const d = new Date(slot.workDate);
        const dateStr = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;
        const session = slot.startTime.startsWith('08') ? 'morning' : 'afternoon';
        return `${dateStr}-${session}`;
    });
}

// Vẽ lịch từng tuần + sáng các ca làm
async function renderSchedule() {
    let scheduleGrid = document.getElementById('scheduleGrid');
    scheduleGrid.className = 'calendar-grid';

    // **CLEAR lịch cũ trước khi render**
    scheduleGrid.innerHTML = '';

    const scheduleData = getScheduleDataForWeek(currentWeek);

    // Lấy docId từ localStorage
    const docId = localStorage.getItem('docId');
    if (!docId) return;
    console.log("docId:", docId);

    // Xác định from/to (yyyy-mm-dd) đầu tuần và cuối tuần


    const monday = getMondayOfWeek(currentWeek); // Chuẩn thứ 


    const fromDate = monday.toISOString().slice(0, 10);
    const endOfWeek = new Date(monday);
    endOfWeek.setDate(monday.getDate() + 7);
    const toDate = endOfWeek.toISOString().slice(0, 10);

    // Lấy workSlot từ API (chỉ ca đã approve)
    const slots = await fetchDoctorWorkSlotsForWeek(docId, fromDate, toDate);

    console.log("fromDate:", fromDate, "toDate:", toDate);
    console.log("slots from API:", slots);

// THÊM đoạn filter này:
const approvedSlots = slots.filter(slot =>
    (slot.startTime.startsWith("08") || slot.startTime.startsWith("14"))
    && slot.slotStatus === "approved"
);

    const registeredSlots = mapSlotsForHighlight(approvedSlots);
        console.log('registeredSlots:', registeredSlots);


    // Vẽ lịch
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
                <button class="shift-button morning view-only ${registeredSlots.includes(day.date + '-morning') ? 'selected' : ''}" disabled>
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
                `<button class="shift-button afternoon view-only ${registeredSlots.includes(day.date + '-afternoon') ? 'selected' : ''}" disabled>
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
        console.log('Vẽ lịch ngày:', day, 'registered:', registeredSlots);
        scheduleGrid.appendChild(card);
    });
    // Cập nhật tuần
    updateWeekDisplay();
}

// Cập nhật text hiển thị tuần
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
