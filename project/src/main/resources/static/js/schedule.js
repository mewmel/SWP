document.addEventListener('DOMContentLoaded', function() {
    // State quản lý tháng hiện tại
    let currentDate = new Date();
    let currentMonth = currentDate.getMonth(); // 0-11
    let currentYear = currentDate.getFullYear();

    // Dữ liệu events mẫu cho các tháng
    const eventsData = {
        '2025-6': {
            3: [{ type: 'injection', title: 'Tiêm Gonal-F' }],
            4: [{ type: 'injection', title: 'Tiêm Gonal-F' }],
            5: [
                { type: 'test', title: 'Xét nghiệm E2' },
                { type: 'injection', title: 'Tiêm Gonal-F' }
            ],
            6: [{ type: 'injection', title: 'Tiêm Gonal-F' }],
            7: [{ type: 'appointment', title: 'Khám bác sĩ' }],
            10: [{ type: 'injection', title: 'Tiêm Cetrotide' }],
            12: [{ type: 'test', title: 'Siêu âm' }],
            14: [{ type: 'appointment', title: 'Tái khám' }],
            24: [
                { type: 'injection', title: 'Tiêm Gonal-F' },
                { type: 'reminder', title: 'Nhắc nhở' }
            ],
            25: [{ type: 'test', title: 'Xét nghiệm máu' }],
            28: [{ type: 'appointment', title: 'Siêu âm kiểm tra' }]
        },
        '2025-7': {
            2: [{ type: 'injection', title: 'Tiêm Gonal-F' }],
            5: [{ type: 'test', title: 'Xét nghiệm hormone' }],
            10: [{ type: 'appointment', title: 'Khám định kỳ' }],
            15: [{ type: 'injection', title: 'Tiêm HCG' }],
            20: [{ type: 'test', title: 'Siêu âm theo dõi' }]
        },
        '2025-5': {
            8: [{ type: 'injection', title: 'Tiêm Gonal-F' }],
            12: [{ type: 'test', title: 'Xét nghiệm FSH' }],
            18: [{ type: 'appointment', title: 'Tư vấn bác sĩ' }],
            25: [{ type: 'injection', title: 'Tiêm Cetrotide' }]
        }
    };

    // Lấy tên tháng tiếng Việt
    const monthNames = [
        'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
        'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
    ];

    // Elements
    const currentMonthElement = document.getElementById('currentMonth');
    const calendarGrid = document.querySelector('.calendar-grid');
    const prevMonthBtn = document.getElementById('prevMonth');
    const nextMonthBtn = document.getElementById('nextMonth');

    // Hàm tính số ngày trong tháng
    function getDaysInMonth(month, year) {
        return new Date(year, month + 1, 0).getDate();
    }

    // Hàm tính ngày đầu tiên của tháng (0 = Chủ nhật, 1 = Thứ 2, ...)
    function getFirstDayOfMonth(month, year) {
        const firstDay = new Date(year, month, 1).getDay();
        // Chuyển đổi để Thứ 2 = 0 (theo calendar header)
        return firstDay === 0 ? 6 : firstDay - 1;
    }

    // Hàm kiểm tra có phải ngày hôm nay không
    function isToday(day, month, year) {
        const today = new Date();
        return day === today.getDate() && 
               month === today.getMonth() && 
               year === today.getFullYear();
    }

    // Hàm tạo class cho event
    function getEventClass(eventType) {
        const eventClasses = {
            'injection': 'event-injection',
            'test': 'event-test',
            'appointment': 'event-appointment',
            'reminder': 'event-reminder'
        };
        return eventClasses[eventType] || 'event-item';
    }

    // Hàm render calendar
    function renderCalendar() {
        // Cập nhật tên tháng
        currentMonthElement.textContent = `${monthNames[currentMonth]}, ${currentYear}`;

        // Xóa tất cả ngày cũ (giữ lại header)
        const headers = calendarGrid.querySelectorAll('.calendar-header');
        calendarGrid.innerHTML = '';
        
        // Thêm lại headers
        headers.forEach(header => {
            calendarGrid.appendChild(header.cloneNode(true));
        });

        const daysInMonth = getDaysInMonth(currentMonth, currentYear);
        const firstDayOfMonth = getFirstDayOfMonth(currentMonth, currentYear);
        const daysInPrevMonth = getDaysInMonth(currentMonth - 1, currentYear);

        // Key cho events data
        const eventsKey = `${currentYear}-${currentMonth + 1}`;
        const monthEvents = eventsData[eventsKey] || {};

        // Thêm các ngày từ tháng trước
        for (let i = firstDayOfMonth - 1; i >= 0; i--) {
            const day = daysInPrevMonth - i;
            const dayElement = createDayElement(day, true, false, []);
            calendarGrid.appendChild(dayElement);
        }

        // Thêm các ngày trong tháng hiện tại
        for (let day = 1; day <= daysInMonth; day++) {
            const dayEvents = monthEvents[day] || [];
            const isCurrentDay = isToday(day, currentMonth, currentYear);
            const dayElement = createDayElement(day, false, isCurrentDay, dayEvents);
            calendarGrid.appendChild(dayElement);
        }

        // Thêm các ngày từ tháng sau để fill đủ grid
        const totalCells = calendarGrid.children.length - 7; // trừ 7 headers
        const remainingCells = 42 - totalCells; // 6 rows x 7 days = 42 cells
        
        for (let day = 1; day <= remainingCells; day++) {
            const dayElement = createDayElement(day, true, false, []);
            calendarGrid.appendChild(dayElement);
        }

        // Cập nhật events summary
        updateEventsSummary();
    }

    // Hàm tạo element cho một ngày
    function createDayElement(day, isOtherMonth, isCurrentDay, events) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        
        if (isOtherMonth) {
            dayElement.classList.add('other-month');
        }
        if (isCurrentDay) {
            dayElement.classList.add('today');
        }

        // Số ngày
        const dayNumber = document.createElement('div');
        dayNumber.className = 'day-number';
        dayNumber.textContent = day;
        dayElement.appendChild(dayNumber);

        // Events
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

        // Thêm event listener
        dayElement.addEventListener('click', function() {
            if (!isOtherMonth) {
                showDayDetails(day, events);
            }
        });

        return dayElement;
    }

    // Hàm hiển thị chi tiết ngày
    function showDayDetails(day, events) {
        const monthName = monthNames[currentMonth];
        if (events.length > 0) {
            let eventsList = events.map(event => `• ${event.title}`).join('\n');
            alert(`Ngày ${day} ${monthName} ${currentYear}\n\nSự kiện:\n${eventsList}`);
        } else {
            alert(`Ngày ${day} ${monthName} ${currentYear}\n\nKhông có sự kiện nào.`);
        }
    }

    // Hàm cập nhật events summary
    function updateEventsSummary() {
        const eventsKey = `${currentYear}-${currentMonth + 1}`;
        const monthEvents = eventsData[eventsKey] || {};
        
        // Cập nhật upcoming events
        const upcomingEventsContainer = document.querySelector('.upcoming-events');
        if (upcomingEventsContainer) {
            upcomingEventsContainer.innerHTML = '';
            
            // Lấy events trong tương lai gần
            const today = new Date();
            const upcomingEvents = [];
            
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
            
            // Hiển thị 3 events gần nhất
            upcomingEvents.slice(0, 3).forEach(event => {
                const eventElement = createUpcomingEventElement(event);
                upcomingEventsContainer.appendChild(eventElement);
            });

            if (upcomingEvents.length === 0) {
                upcomingEventsContainer.innerHTML = '<p style="text-align: center; color: #666; margin: 20px 0;">Không có sự kiện sắp tới trong tháng này.</p>';
            }
        }
    }

    // Hàm tạo element cho upcoming event
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

    // Event listeners cho navigation
    prevMonthBtn.addEventListener('click', function() {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        renderCalendar();
    });

    nextMonthBtn.addEventListener('click', function() {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        renderCalendar();
    });

    // Medication done buttons
    document.querySelectorAll('.done-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            this.textContent = 'Hoàn thành';
            this.style.background = '#27ae60';
            this.disabled = true;
            
            // Hiển thị thông báo
            showNotification('Đã ghi nhận việc tiêm thuốc!', 'success');
        });
    });

    // Hàm hiển thị thông báo
    function showNotification(message, type = 'success') {
        // Tạo notification element
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
        
        // Hiển thị
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 10);
        
        // Ẩn và xóa
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    // Khởi tạo calendar
    renderCalendar();

    // Thêm keyboard navigation
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
