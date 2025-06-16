document.addEventListener('DOMContentLoaded', function() {
    // Lấy các elements cần thiết
    const modal = document.getElementById('scheduleModal');
    const openBtn = document.getElementById('openSchedule');
    const closeBtn = modal.querySelector('.close-modal');
    const cancelBtn = document.getElementById('cancelSchedule');
    const saveBtn = modal.querySelector('.save-schedule-btn');
    const calendarDates = document.getElementById('calendarDates');
    const currentMonthEl = document.getElementById('currentMonth');
    const prevMonthBtn = document.getElementById('prevMonth');
    const nextMonthBtn = document.getElementById('nextMonth');

    // Khởi tạo các biến trạng thái
    let currentDate = new Date();
    let selectedDates = new Set();
    let selectedShifts = new Set();

    // Hàm format date thành chuỗi YYYY-MM-DD
    function formatDate(date) {
        return date.toISOString().split('T')[0];
    }

    // Hàm kiểm tra ngày có phải trong quá khứ
    function isPastDate(date) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date < today;
    }

    // Hàm render calendar
    function renderCalendar(date) {
        const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
        const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());

        // Cập nhật tiêu đề tháng
        currentMonthEl.textContent = `Tháng ${date.getMonth() + 1}, ${date.getFullYear()}`;
        calendarDates.innerHTML = '';

        // Render từng ngày trong calendar
        for (let i = 0; i < 42; i++) {
            const currentDate = new Date(startDate);
            const dateEl = document.createElement('div');
            dateEl.classList.add('calendar-date');
            dateEl.textContent = currentDate.getDate();
            dateEl.dataset.date = formatDate(currentDate);

            // Style cho ngày không thuộc tháng hiện tại
            if (currentDate.getMonth() !== date.getMonth()) {
                dateEl.classList.add('other-month');
                dateEl.style.opacity = '0.5';
            }

            // Style cho ngày trong quá khứ
            if (isPastDate(currentDate)) {
                dateEl.classList.add('past-date');
                dateEl.style.opacity = '0.5';
            } else {
                // Xử lý click cho ngày trong tương lai
                dateEl.addEventListener('click', function() {
                    if (currentDate.getMonth() === date.getMonth()) {
                        const dateStr = this.dataset.date;
                        this.classList.toggle('selected');
                        
                        if (selectedDates.has(dateStr)) {
                            selectedDates.delete(dateStr);
                        } else {
                            selectedDates.add(dateStr);
                        }
                        
                        // Debug log
                        console.log('Đã chọn ngày:', Array.from(selectedDates));
                    }
                });
            }

            // Đánh dấu ngày đã chọn
            if (selectedDates.has(formatDate(currentDate))) {
                dateEl.classList.add('selected');
            }

            calendarDates.appendChild(dateEl);
            startDate.setDate(startDate.getDate() + 1);
        }
    }

    // Xử lý chọn ca làm việc
    const shiftOptions = modal.querySelectorAll('.shift-option input[type="checkbox"]');
    shiftOptions.forEach(shift => {
        shift.addEventListener('change', function() {
            if (this.checked) {
                selectedShifts.add(this.value);
            } else {
                selectedShifts.delete(this.value);
            }
            // Debug log
            console.log('Đã chọn ca:', Array.from(selectedShifts));
        });
    });

    // Event listeners cho các nút điều khiển
    openBtn.addEventListener('click', function(e) {
        e.preventDefault();
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    });

    [closeBtn, cancelBtn].forEach(btn => {
        if (btn) {
            btn.addEventListener('click', () => {
                modal.style.display = 'none';
                document.body.style.overflow = '';
            });
        }
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }
    });

    prevMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar(currentDate);
    });

    nextMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar(currentDate);
    });

    // Xử lý lưu lịch làm việc
    if (saveBtn) {
        saveBtn.addEventListener('click', function() {
            if (selectedDates.size === 0) {
                alert('Vui lòng chọn ít nhất một ngày');
                return;
            }
            if (selectedShifts.size === 0) {
                alert('Vui lòng chọn ít nhất một ca làm việc');
                return;
            }

            const scheduleData = {
                dates: Array.from(selectedDates),
                shifts: Array.from(selectedShifts)
            };

            // Debug log
            console.log('Dữ liệu lịch làm việc:', scheduleData);
            
            // TODO: Gửi dữ liệu lên server
            alert('Đã lưu lịch làm việc thành công!');
            modal.style.display = 'none';
            document.body.style.overflow = '';
        });
    }

    // Khởi tạo calendar
    renderCalendar(currentDate);
});
// Thêm hàm kiểm tra ngày cuối tuần
function isWeekend(date) {
    const day = date.getDay();
    return day === 0 || day === 6; // 0 là Chủ nhật, 6 là Thứ 7
}

// Cập nhật hàm xử lý click ngày trong calendar
dateEl.addEventListener('click', function() {
    if (currentDate.getMonth() === date.getMonth()) {
        const dateStr = this.dataset.date;
        const clickedDate = new Date(dateStr);
        
        // Kiểm tra và hiển thị ca làm việc phù hợp
        const weekdayShifts = document.querySelector('.weekday-shifts');
        const weekendShifts = document.querySelector('.weekend-shifts');
        
        if (isWeekend(clickedDate)) {
            weekdayShifts.style.display = 'none';
            weekendShifts.style.display = 'block';
        } else {
            weekdayShifts.style.display = 'block';
            weekendShifts.style.display = 'none';
        }

        // Toggle selected state
        this.classList.toggle('selected');
        if (selectedDates.has(dateStr)) {
            selectedDates.delete(dateStr);
            // Xóa các ca đã chọn cho ngày này
            const shifts = document.querySelectorAll('.shift-option input[type="checkbox"]:checked');
            shifts.forEach(shift => shift.checked = false);
            selectedShifts.clear();
        } else {
            selectedDates.add(dateStr);
        }
    }
});