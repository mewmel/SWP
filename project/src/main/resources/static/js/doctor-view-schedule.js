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

// Leave Request Modal Management
function initializeLeaveRequestModal() {
    const modal = document.getElementById('leaveRequestModal');
    const requestLeaveBtn = document.getElementById('requestLeaveBtn');
    const closeBtn = document.querySelector('.close');
    const cancelBtn = document.getElementById('cancelLeaveBtn');
    const leaveForm = document.getElementById('leaveRequestForm');
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');

    if (!modal || !requestLeaveBtn) return; // Exit if elements don't exist

    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    startDateInput.min = today;
    endDateInput.min = today;

    // Open modal
    requestLeaveBtn.addEventListener('click', function() {
        modal.style.display = 'block';
    });

    // Close modal functions
    function closeModal() {
        modal.style.display = 'none';
        leaveForm.reset();
    }

    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);

    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            closeModal();
        }
    });

    // Update end date minimum when start date changes
    startDateInput.addEventListener('change', function() {
        endDateInput.min = this.value;
        if (endDateInput.value && endDateInput.value < this.value) {
            endDateInput.value = this.value;
        }
    });

    // Handle form submission
    leaveForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const formData = new FormData(this);
        const leaveData = {
            type: document.getElementById('leaveType').value,
            startDate: document.getElementById('startDate').value,
            endDate: document.getElementById('endDate').value,
            reason: document.getElementById('reason').value,
            attachment: document.getElementById('attachment').files[0]
        };

        // Calculate duration
        const start = new Date(leaveData.startDate);
        const end = new Date(leaveData.endDate);
        const duration = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

        // Validate dates
        if (start > end) {
            alert('Ngày kết thúc phải sau ngày bắt đầu!');
            return;
        }

        // Simulate API call
        console.log('Submitting leave request:', leaveData);

        // Show success message
        alert(`Đăng ký nghỉ phép thành công!\nThời gian: ${duration} ngày\nTrạng thái: Chờ duyệt`);

        // Add new request to the list (simulation)
        addLeaveRequestToList(leaveData, duration);

        // Close modal
        closeModal();
    });

    // Function to add new leave request to the list
    function addLeaveRequestToList(data, duration) {
        const leaveList = document.querySelector('.leave-requests-list');
        if (!leaveList) return;

        const newItem = document.createElement('div');
        newItem.className = 'leave-request-item pending';

        const startDate = new Date(data.startDate).toLocaleDateString('vi-VN');
        const endDate = new Date(data.endDate).toLocaleDateString('vi-VN');
        const today = new Date().toLocaleDateString('vi-VN');

        newItem.innerHTML = `
            <div class="leave-info">
                <div class="leave-dates">
                    <strong>${startDate} - ${endDate}</strong>
                    <span class="leave-duration">(${duration} ngày)</span>
                </div>
                <div class="leave-reason">Lý do: ${data.reason}</div>
                <div class="leave-submitted">Đăng ký: ${today}</div>
            </div>
            <div class="leave-status">
                <span class="status-badge pending">Chờ duyệt</span>
            </div>
        `;

        leaveList.insertBefore(newItem, leaveList.firstChild);
    }

    // File validation
    const attachmentInput = document.getElementById('attachment');
    if (attachmentInput) {
        attachmentInput.addEventListener('change', function() {
            const file = this.files[0];
            if (file) {
                const maxSize = 5 * 1024 * 1024; // 5MB
                if (file.size > maxSize) {
                    alert('File quá lớn! Vui lòng chọn file nhỏ hơn 5MB.');
                    this.value = '';
                }
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', function() {
    renderSchedule();

    // Initialize schedule navigation
    const prevWeekBtn = document.getElementById('prevWeek');
    const nextWeekBtn = document.getElementById('nextWeek');

    if (prevWeekBtn) {
        prevWeekBtn.addEventListener('click', () => {
            currentWeek.setDate(currentWeek.getDate() - 7);
            renderSchedule();
        });
    }

    if (nextWeekBtn) {
        nextWeekBtn.addEventListener('click', () => {
            currentWeek.setDate(currentWeek.getDate() + 7);
            renderSchedule();
        });
    }

    // Initialize leave request modal
    initializeLeaveRequestModal();
});