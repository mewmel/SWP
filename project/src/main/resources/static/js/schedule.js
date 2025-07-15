document.addEventListener('DOMContentLoaded', function() {
    // State quản lý tháng hiện tại
    let currentDate = new Date();
    let currentMonth = currentDate.getMonth(); // 0-11
    let currentYear = currentDate.getFullYear();

    // Dữ liệu sự kiện của lịch (sẽ được lấy từ API, không còn mẫu cứng)
    const eventsData = {}; // Chỉ chứa dữ liệu thật từ backend

    // Lấy tên tháng tiếng Việt
    const monthNames = [
        'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
        'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
    ];

    // Lấy các element cần thiết
    const currentMonthElement = document.getElementById('currentMonth');
    const calendarGrid = document.querySelector('.calendar-grid');
    const prevMonthBtn = document.getElementById('prevMonth');
    const nextMonthBtn = document.getElementById('nextMonth');

    // Hàm tính số ngày trong tháng
    function getDaysInMonth(month, year) {
        return new Date(year, month + 1, 0).getDate();
    }

    // Hàm tính thứ của ngày đầu tiên trong tháng (0 = Thứ 2)
    function getFirstDayOfMonth(month, year) {
        const firstDay = new Date(year, month, 1).getDay();
        // Chuyển đổi: Thứ 2 = 0 (theo tiêu chuẩn lịch đang dùng)
        return firstDay === 0 ? 6 : firstDay - 1;
    }

    // Kiểm tra ngày có phải hôm nay không
    function isToday(day, month, year) {
        const today = new Date();
        return day === today.getDate() &&
            month === today.getMonth() &&
            year === today.getFullYear();
    }

    // Lấy class CSS cho loại sự kiện
    function getEventClass(eventType) {
        const eventClasses = {
            'injection': 'event-injection',
            'test': 'event-test',
            'appointment': 'event-appointment',
            'reminder': 'event-reminder',
            'completed': 'event-completed'
        };
        return eventClasses[eventType] || 'event-item';
    }

    // Hàm render lịch tháng hiện tại với dữ liệu mới nhất
    function renderCalendar() {
        // Cập nhật tên tháng
        currentMonthElement.textContent = `${monthNames[currentMonth]}, ${currentYear}`;

        // Xóa các ngày cũ (chỉ giữ lại header)
        const headers = calendarGrid.querySelectorAll('.calendar-header');
        calendarGrid.innerHTML = '';
        headers.forEach(header => {
            calendarGrid.appendChild(header.cloneNode(true));
        });

        const daysInMonth = getDaysInMonth(currentMonth, currentYear);
        const firstDayOfMonth = getFirstDayOfMonth(currentMonth, currentYear);
        const daysInPrevMonth = getDaysInMonth(currentMonth - 1, currentYear);

        // Key dạng "2025-6" cho mapping sự kiện
        const eventsKey = `${currentYear}-${currentMonth + 1}`;
        const monthEvents = eventsData[eventsKey] || {};

        // Thêm các ngày của tháng trước để lấp đầu dòng (nếu cần)
        for (let i = firstDayOfMonth - 1; i >= 0; i--) {
            const day = daysInPrevMonth - i;
            const dayElement = createDayElement(day, true, false, []);
            calendarGrid.appendChild(dayElement);
        }

        // Thêm các ngày của tháng hiện tại
        for (let day = 1; day <= daysInMonth; day++) {
            const dayEvents = monthEvents[day] || [];
            const isCurrentDay = isToday(day, currentMonth, currentYear);
            const dayElement = createDayElement(day, false, isCurrentDay, dayEvents);
            calendarGrid.appendChild(dayElement);
        }

        // Thêm các ngày của tháng sau để đủ lưới 6 hàng
        const totalCells = calendarGrid.children.length - 7; // Trừ 7 header
        const remainingCells = 42 - totalCells; // 6 hàng x 7 ngày = 42 cell
        for (let day = 1; day <= remainingCells; day++) {
            const dayElement = createDayElement(day, true, false, []);
            calendarGrid.appendChild(dayElement);
        }

        // Cập nhật danh sách sự kiện sắp tới
        updateEventsSummary();
    }

    // Hàm tạo 1 ô ngày trên lịch
    function createDayElement(day, isOtherMonth, isCurrentDay, events) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        if (isOtherMonth) {
            dayElement.classList.add('other-month');
        }
        if (isCurrentDay) {
            dayElement.classList.add('today');
        }
        // Hiển thị số ngày
        const dayNumber = document.createElement('div');
        dayNumber.className = 'day-number';
        dayNumber.textContent = day;
        dayElement.appendChild(dayNumber);

        // Nếu có sự kiện, hiển thị các sự kiện trong ô
        if (events.length > 0) {
            const dayEvents = document.createElement('div');
            dayEvents.className = 'day-events';
            events.forEach(event => {
                const eventElement = document.createElement('div');
                eventElement.className = `event-item ${getEventClass(event.type)}`;
                eventElement.textContent = event.title;
                dayEvents.appendChild(eventElement);
            });
            dayElement.appendChild(dayEvents);
        }

        // Cho phép click xem chi tiết sự kiện trong ngày
        dayElement.addEventListener('click', function() {
            if (!isOtherMonth) {
                showDayDetails(day, events);
            }
        });

        return dayElement;
    }

    // Hàm hiển thị popup chi tiết sự kiện trong ngày
    function showDayDetails(day, events) {
        const monthName = monthNames[currentMonth];
        if (events.length > 0) {
            let eventsList = events.map(event => {
                let details = `• ${event.title}`;
                if (event.time) details += ` (${event.time})`;
                if (event.doctor) details += `\n  Bác sĩ: ${event.doctor}`;
                if (event.subServices && event.subServices.trim()) {
                    details += `\n  Dịch vụ: ${event.subServices}`;
                }
                if (event.note) details += `\n  Ghi chú: ${event.note}`;
                return details;
            }).join('\n\n');
            alert(`Ngày ${day} ${monthName} ${currentYear}\n\nLịch khám:\n\n${eventsList}`);
        } else {
            alert(`Ngày ${day} ${monthName} ${currentYear}\n\nKhông có lịch khám nào.`);
        }
    }

    // Hàm cập nhật danh sách sự kiện sắp tới (summary card bên phải)
    function updateEventsSummary() {
        const eventsKey = `${currentYear}-${currentMonth + 1}`;
        const monthEvents = eventsData[eventsKey] || {};

        const upcomingEventsContainer = document.querySelector('.upcoming-events');
        if (upcomingEventsContainer) {
            upcomingEventsContainer.innerHTML = '';
            const today = new Date();
            const upcomingEvents = [];

            // Lấy các sự kiện còn lại trong tháng (>= hôm nay)
            Object.keys(monthEvents).forEach(day => {
                const eventDate = new Date(currentYear, currentMonth, parseInt(day));
                if (eventDate >= today) {
                    monthEvents[day].forEach(event => {
                        upcomingEvents.push({
                            day: day,
                            date: eventDate,
                            ...event
                        });
                    });
                }
            });

            // Sắp xếp theo ngày
            upcomingEvents.sort((a, b) => a.date - b.date);
            // Hiển thị 3 sự kiện gần nhất
            upcomingEvents.slice(0, 3).forEach(event => {
                const eventElement = createUpcomingEventElement(event);
                upcomingEventsContainer.appendChild(eventElement);
            });

            // Nếu không có sự kiện nào
            if (upcomingEvents.length === 0) {
                upcomingEventsContainer.innerHTML = '<p style="text-align: center; color: #666; margin: 20px 0;">Không có sự kiện sắp tới trong tháng này.</p>';
            }
        }
    }

    // Hàm tạo 1 element sự kiện sắp tới (summary card)
    function createUpcomingEventElement(event) {
        const eventDiv = document.createElement('div');
        eventDiv.className = 'upcoming-event';
        const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
        const dayName = dayNames[event.date.getDay()];
        eventDiv.innerHTML = `
            <div class="event-date">
                <div class="day">${event.day}</div>
                <div class="month">${dayName}</div>
            </div>
            <div class="event-details">
                <div class="event-title">${event.title}</div>
                <div class="event-time">08:00 - Phòng khám</div>
            </div>
        `;
        return eventDiv;
    }

    // Xử lý chuyển tháng trước
    prevMonthBtn.addEventListener('click', function() {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        renderCalendar();
    });

    // Xử lý chuyển tháng sau
    nextMonthBtn.addEventListener('click', function() {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        renderCalendar();
    });

    // Xử lý nút Đã tiêm (nếu dùng)
    document.querySelectorAll('.done-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            this.textContent = 'Hoàn thành';
            this.style.background = '#27ae60';
            this.disabled = true;
            showNotification('Đã ghi nhận việc tiêm thuốc!', 'success');
        });
    });

    // Hàm hiển thị thông báo nổi (toast)
    function showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 25px;
            background: ${type === 'success' ? '#27ae60' : '#e74c3c'};
            color: white;
            border-radius: 8px;
            font-weight: 500;
            z-index: 1000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 10);
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    // ===== PHẦN NÀY ĐÃ ĐƯỢC THAY THẾ BẰNG API MỚI =====
    // Code cũ đã được remove để load booking tái khám trực tiếp từ API

// THÊM HÀM NÀY để load lịch cho đúng khách hàng
    function loadScheduleForCustomer(cusId) {
        // Chỉ xoá sạch eventsData ở đây!
        Object.keys(eventsData).forEach(key => delete eventsData[key]);
        
        // Load tất cả booking (lần đầu và tái khám) với thông tin WorkSlot
        fetch(`/api/booking/history/${cusId}`)
            .then(res => res.json())
            .then(allBookings => {
                allBookings.forEach(booking => {
                    // Parse workDate from WorkSlot
                    const workDate = new Date(booking.workDate);
                    const year = workDate.getFullYear();
                    const month = workDate.getMonth() + 1; // getMonth() returns 0-11
                    const day = workDate.getDate();
                    
                    const eventsKey = `${year}-${month}`;
                    if (!eventsData[eventsKey]) eventsData[eventsKey] = {};
                    if (!eventsData[eventsKey][day]) eventsData[eventsKey][day] = [];
                    
                    // Xác định type và title của event dựa trên bookType và bookStatus
                    let type = 'appointment';
                    let title = booking.serName;
                    
                    if (booking.bookStatus === 'completed') {
                        type = 'completed';
                        if (booking.bookType === 'follow-up') {
                            title = `Đã tái khám: ${booking.serName}`;
                        } else {
                            title = `Đã khám: ${booking.serName}`;
                        }
                    } else if (booking.bookStatus === 'confirmed' || booking.bookStatus === 'pending') {
                        type = 'appointment';
                        if (booking.bookType === 'follow-up') {
                            title = `Tái khám: ${booking.serName}`;
                        } else {
                            title = `Khám: ${booking.serName}`;
                        }
                    }
                    
                    eventsData[eventsKey][day].push({
                        type: type,
                        title: title,
                        time: booking.startTime ? booking.startTime.substring(0, 5) : '',
                        doctor: booking.docFullName,
                        note: booking.note,
                        bookId: booking.bookId,
                        bookStatus: booking.bookStatus,
                        bookType: booking.bookType,
                        subServices: booking.subServices || '' // Thêm SubService info
                    });
                });
                
                // Render calendar sau khi load xong data
                renderCalendar();
                updateUpcomingEvents(allBookings);
                updateTreatmentInfo(allBookings);
            })
            .catch(error => {
                console.error('Error loading booking history:', error);
                // Fallback: render calendar với data rỗng
                renderCalendar();
            });
    }

    // Hàm cập nhật phần "Sự kiện sắp tới" 
    function updateUpcomingEvents(allBookings) {
        const upcomingEventsContainer = document.querySelector('.upcoming-events');
        if (!upcomingEventsContainer) return;
        
        // Filter và sort upcoming events (chỉ lấy các booking confirmed/pending từ hôm nay trở đi)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const upcomingBookings = allBookings
            .filter(booking => {
                const workDate = new Date(booking.workDate);
                return workDate >= today && (booking.bookStatus === 'confirmed' || booking.bookStatus === 'pending');
            })
            .sort((a, b) => new Date(a.workDate) - new Date(b.workDate))
            .slice(0, 3); // Chỉ lấy 3 sự kiện gần nhất
        
        if (upcomingBookings.length === 0) {
            upcomingEventsContainer.innerHTML = '<p style="color: #888; text-align: center; padding: 1rem;">Không có lịch khám nào sắp tới.</p>';
            return;
        }
        
        // Render upcoming events
        upcomingEventsContainer.innerHTML = upcomingBookings.map(booking => {
            const workDate = new Date(booking.workDate);
            const dayOfWeek = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][workDate.getDay()];
            const day = workDate.getDate();
            const startTime = booking.startTime ? booking.startTime.substring(0, 5) : '';
            
            return `
                <div class="upcoming-event">
                    <div class="event-date">
                        <div class="day">${day}</div>
                        <div class="month">${dayOfWeek}</div>
                    </div>
                    <div class="event-details">
                        <div class="event-title">${booking.serName}</div>
                        <div class="event-time">${startTime} - ${booking.docFullName}</div>
                        ${booking.subServices && booking.subServices.trim() ? 
                          `<div class="event-note">Dịch vụ phụ: ${booking.subServices}</div>` : ''}
                        ${booking.note ? `<div class="event-note">${booking.note}</div>` : ''}
                    </div>
                </div>
            `;
                 }).join('');
     }

    // Hàm cập nhật thông tin lịch điều trị
    function updateTreatmentInfo(allBookings) {
        const totalCount = allBookings.length;
        const completedCount = allBookings.filter(booking => booking.bookStatus === 'completed').length;
        const upcomingCount = allBookings.filter(booking => {
            const workDate = new Date(booking.workDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return workDate >= today && (booking.bookStatus === 'confirmed' || booking.bookStatus === 'pending');
        }).length;

        // Cập nhật các element  
        const totalElement = document.getElementById('totalBookingCount');
        const completedElement = document.getElementById('completedBookingCount');
        const upcomingElement = document.getElementById('upcomingBookingCount');

        if (totalElement) totalElement.textContent = totalCount;
        if (completedElement) completedElement.textContent = completedCount;
        if (upcomingElement) upcomingElement.textContent = upcomingCount;
    }

// GIẢ SỬ bạn đã lấy được cusId (ví dụ lấy từ localStorage hoặc server truyền vào)
    const cusId = localStorage.getItem('cusId');
    if (cusId) {
        loadScheduleForCustomer(cusId);
    } else {
        // Xử lý khi chưa đăng nhập hoặc chưa có cusId
        alert("Bạn cần đăng nhập để xem lịch điều trị!");
    }

    // Hỗ trợ chuyển tháng bằng phím mũi tên
    document.addEventListener('keydown', function(e) {
        if (e.target.tagName.toLowerCase() !== 'input') {
            if (e.key === 'ArrowLeft') {
                prevMonthBtn.click();
            } else if (e.key === 'ArrowRight') {
                nextMonthBtn.click();
            }
        }
    });

});