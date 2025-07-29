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

    // ✅ THAY THẾ: Hàm hiển thị modal chi tiết sự kiện trong ngày
    function showDayDetails(day, events) {
        const monthName = monthNames[currentMonth];
        const dayNames = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
        const selectedDate = new Date(currentYear, currentMonth, day);
        const dayOfWeek = dayNames[selectedDate.getDay()];
        
        // Lấy các element modal
        const modal = document.getElementById('dayDetailModal');
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');
        
        // Set title
        modalTitle.innerHTML = `<i class="fas fa-calendar-day"></i> ${dayOfWeek}, ${day} ${monthName} ${currentYear}`;
        
        // Tạo nội dung modal
        let modalContent = `
            <div class="day-info">
                <div class="date-display">${day}</div>
                <div class="day-type">${dayOfWeek}, ${monthName} ${currentYear}</div>
            </div>
        `;
        
        if (events.length > 0) {
            modalContent += `
                <div class="events-list">
                    ${events.map(event => createEventCard(event)).join('')}
                </div>
            `;
        } else {
            modalContent += `
                <div class="empty-day">
                    <i class="fas fa-calendar-times"></i>
                    <h4>Không có lịch khám</h4>
                    <p>Bạn không có lịch hẹn nào trong ngày này.</p>
                </div>
            `;
        }
        
        modalBody.innerHTML = modalContent;
        
        // Hiển thị modal
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden'; // Prevent background scroll
    }
    
    // ✅ THÊM: Hàm tạo event card cho modal
    function createEventCard(event) {
        const eventType = event.type || 'appointment';
        const statusIcon = {
            'completed': 'fas fa-check-circle',
            'appointment': 'fas fa-calendar-check',
            'test': 'fas fa-flask',
            'injection': 'fas fa-syringe',
            'reminder': 'fas fa-bell'
        };
        
        return `
            <div class="event-card ${eventType}">
                <div class="event-header">
                    <div class="event-title">
                        <i class="${statusIcon[eventType] || statusIcon.appointment}"></i>
                        ${event.title}
                    </div>
                    ${event.time ? `<div class="event-time">${event.time}</div>` : ''}
                </div>
                <div class="event-details">
                    ${event.doctor ? `
                        <div class="event-detail-item">
                            <i class="fas fa-user-md"></i>
                            <span>Bác sĩ: ${event.doctor}</span>
                        </div>
                    ` : ''}
                    ${event.subServices && event.subServices.trim() ? `
                        <div class="event-detail-item">
                            <i class="fas fa-medical-bag"></i>
                            <span>Dịch vụ: ${event.subServices}</span>
                        </div>
                    ` : ''}
                    ${event.note ? `
                        <div class="event-detail-item">
                            <i class="fas fa-sticky-note"></i>
                            <span>Ghi chú: ${event.note}</span>
                        </div>
                    ` : ''}
                    ${event.bookStatus ? `
                        <div class="event-detail-item">
                            <i class="fas fa-info-circle"></i>
                            <span>Trạng thái: ${getStatusText(event.bookStatus)}</span>
                        </div>
                    ` : ''}
                </div>
                ${event.bookType === 'follow-up' && event.bookStatus === 'confirmed' ? `
                    <div class="event-actions">
                        <button class="btn-reschedule" onclick="openRescheduleModal(${event.bookId}, '${event.title}', '${event.doctor}')">
                            <i class="fas fa-calendar-alt"></i>
                            Dời lịch tái khám
                        </button>
                    </div>
                ` : ''}
            </div>
        `;
    }
    
    // ✅ THÊM: Hàm lấy text trạng thái
    function getStatusText(status) {
        const statusMap = {
            'pending': 'Chờ xác nhận',
            'confirmed': 'Đã xác nhận',
            'completed': 'Đã hoàn thành',
            'cancelled': 'Đã hủy'
        };
        return statusMap[status] || status;
    }
    
    // ✅ THÊM: Xử lý đóng modal
    function closeModal() {
        const modal = document.getElementById('dayDetailModal');
        modal.style.display = 'none';
        document.body.style.overflow = 'auto'; // Restore background scroll
    }
    
    // ✅ THÊM: Event listeners cho modal
    function initModalEventListeners() {
        const modal = document.getElementById('dayDetailModal');
        const modalClose = document.getElementById('modalClose');
        const modalOverlay = document.getElementById('modalOverlay');
        
        // Đóng modal khi click X
        modalClose.addEventListener('click', closeModal);
        
        // Đóng modal khi click overlay
        modalOverlay.addEventListener('click', closeModal);
        
        // Đóng modal khi nhấn Escape
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && modal.style.display === 'block') {
                closeModal();
            }
        });
        
        // ✅ THÊM: Event listeners cho modal dời lịch
        initRescheduleModalListeners();
    }
    
    // ✅ THÊM: Khởi tạo event listeners cho modal dời lịch
    function initRescheduleModalListeners() {
        const rescheduleModal = document.getElementById('rescheduleModal');
        const rescheduleModalClose = document.getElementById('rescheduleModalClose');
        const rescheduleOverlay = document.getElementById('rescheduleOverlay');
        const rescheduleForm = document.getElementById('rescheduleForm');
        const newDateInput = document.getElementById('newDate');
        
        // Đóng modal khi click X
        rescheduleModalClose.addEventListener('click', closeRescheduleModal);
        
        // Đóng modal khi click overlay
        rescheduleOverlay.addEventListener('click', closeRescheduleModal);
        
        // Đóng modal khi nhấn Escape
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && rescheduleModal.style.display === 'block') {
                closeRescheduleModal();
            }
        });
        
        // Set ngày tối thiểu là ngày mai
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        newDateInput.min = tomorrow.toISOString().split('T')[0];
        
        // Load khung giờ khi thay đổi ngày
        newDateInput.addEventListener('change', loadAvailableTimeSlots);
        
        // Xử lý submit form
        rescheduleForm.addEventListener('submit', handleRescheduleSubmit);
    }
    
    // ✅ THÊM: Biến lưu thông tin booking hiện tại
    let currentBookingData = {};
    
    // ✅ THÊM: Mở modal dời lịch
    window.openRescheduleModal = async function(bookId, title, doctor) {
        // Lưu thông tin booking hiện tại
        currentBookingData = { bookId, title, doctor };
        
        // Tìm thông tin chi tiết từ eventsData
        const bookingDetails = findBookingDetails(bookId);
        
        // Cập nhật thông tin lịch hẹn hiện tại
        document.getElementById('currentService').textContent = title;
        document.getElementById('currentDoctor').textContent = doctor;
        
        if (bookingDetails) {
            document.getElementById('currentDate').textContent = formatDateVietnamese(bookingDetails.date);
            document.getElementById('currentTime').textContent = bookingDetails.time || '';
        }
        
        // 🔄 MỚI: Lấy docId từ API booking detail
        try {
            const response = await fetch(`/api/booking/${bookId}`);
            if (response.ok) {
                const bookingInfo = await response.json();
                currentBookingData.docId = bookingInfo.docId;
                
                // Tạo date picker với 5 ngày tiếp theo kiểm tra WorkSlot thực tế
                if (bookingDetails) {
                    await generateDatePickerButtons(bookingDetails.date);
                }
            } else {
                console.error('Không thể lấy thông tin booking:', response.status);
                showNotification('Không thể lấy thông tin lịch hẹn!', 'error');
                return;
            }
        } catch (error) {
            console.error('Lỗi khi gọi API booking:', error);
            showNotification('Lỗi kết nối! Vui lòng thử lại.', 'error');
            return;
        }
        
        // Reset form
        document.getElementById('rescheduleForm').reset();
        
        // Hiển thị modal
        const modal = document.getElementById('rescheduleModal');
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
    
    // ✅ THÊM: Đóng modal dời lịch
    window.closeRescheduleModal = function() {
        const modal = document.getElementById('rescheduleModal');
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        currentBookingData = {};
    }
    
    // ✅ THÊM: Tìm thông tin chi tiết booking
    function findBookingDetails(bookId) {
        for (const monthKey in eventsData) {
            for (const day in eventsData[monthKey]) {
                const events = eventsData[monthKey][day];
                for (const event of events) {
                    if (event.bookId === bookId) {
                        const [year, month] = monthKey.split('-');
                        return {
                            date: new Date(parseInt(year), parseInt(month) - 1, parseInt(day)),
                            time: event.time,
                            event: event
                        };
                    }
                }
            }
        }
        return null;
    }
    
    // ✅ THÊM: Format ngày theo kiểu Việt Nam
    function formatDateVietnamese(date) {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }
    
    // ✅ THÊM: Tạo 5 button chọn ngày (async để gọi API WorkSlot)
    async function generateDatePickerButtons(currentDate) {
        const datePicker = document.getElementById('datePicker');
        if (!datePicker) return;
        
        // Hiển thị loading
        datePicker.innerHTML = '<div style="text-align: center; padding: 20px; color: #666;"><i class="fas fa-spinner fa-spin"></i> Đang tải lịch làm việc...</div>';
        
        if (!currentBookingData.docId) {
            datePicker.innerHTML = '<div style="text-align: center; padding: 20px; color: #e74c3c;">Không thể lấy thông tin bác sĩ!</div>';
            return;
        }
        
        // Tính khoảng ngày: từ ngày mai đến 5 ngày sau ngày hẹn hiện tại
        const tomorrow = new Date(currentDate);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const endDate = new Date(currentDate);
        endDate.setDate(endDate.getDate() + 5);
        
        // ✅ FIX: Tránh vấn đề timezone
        const fromDate = `${tomorrow.getFullYear()}-${(tomorrow.getMonth() + 1).toString().padStart(2, '0')}-${tomorrow.getDate().toString().padStart(2, '0')}`;
        const toDate = `${endDate.getFullYear()}-${(endDate.getMonth() + 1).toString().padStart(2, '0')}-${endDate.getDate().toString().padStart(2, '0')}`;
        
        try {
            // Gọi API lấy WorkSlot của bác sĩ trong 5 ngày tiếp theo
            const response = await fetch(`/api/workslots/${currentBookingData.docId}/slots?from=${fromDate}&to=${toDate}`);
            
            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }
            
            const workSlots = await response.json();
            console.log('📅 WorkSlots từ API:', workSlots);
            
            // Tạo Set các ngày có WorkSlot approved
            const availableDates = new Set();
            workSlots.forEach(slot => {
                if (slot.slotStatus === 'approved') {
                    // ✅ FIX: Tránh vấn đề timezone - dùng workDate string trực tiếp
                    const workDate = slot.workDate; // workDate từ API đã là string "yyyy-MM-dd"
                    availableDates.add(workDate);
                }
            });
            
            console.log('📅 Ngày có lịch làm việc:', Array.from(availableDates));
            
            // Clear loading và tạo buttons
            datePicker.innerHTML = '';
            
            // Tạo 5 ngày tiếp theo
            for (let i = 1; i <= 5; i++) {
                const date = new Date(currentDate);
                date.setDate(date.getDate() + i);
                
                // ✅ FIX: Tránh vấn đề timezone bằng cách format thủ công
                const year = date.getFullYear();
                const month = (date.getMonth() + 1).toString().padStart(2, '0');
                const day = date.getDate().toString().padStart(2, '0');
                const dateStr = `${year}-${month}-${day}`;
                
                // Debug: Log thông tin ngày được tạo
                console.log(`📅 DEBUG: Tạo button ${i} - Ngày: ${dateStr}, Thứ: ${date.getDay()}, Display: ${date.getDate()}`);
                
                // Kiểm tra ngày này có trong WorkSlot approved không
                const isAvailable = availableDates.has(dateStr);
                
                const dateBtn = createDateButton(date, i, isAvailable);
                datePicker.appendChild(dateBtn);
            }
            
        } catch (error) {
            console.error('❌ Lỗi khi lấy WorkSlot:', error);
            datePicker.innerHTML = '<div style="text-align: center; padding: 20px; color: #e74c3c;">Không thể tải lịch làm việc! Vui lòng thử lại.</div>';
        }
    }
    
    // ✅ THÊM: Tạo button cho mỗi ngày với trạng thái available  
    function createDateButton(date, dayOffset, isAvailable) {
        const button = document.createElement('button');
        button.type = 'button';
        
        // ✅ FIX: Tránh vấn đề timezone bằng cách format thủ công
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;
        
        button.dataset.date = dateStr;
        button.dataset.dayOffset = dayOffset;
        
        // Debug: Log thông tin button được tạo
        console.log(`🔧 DEBUG: Create button - Date object: ${date}, DateStr: ${dateStr}, Display day: ${date.getDate()}, DayOffset: ${dayOffset}`);
        
        // Tên thứ trong tuần
        const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
        const dayName = dayNames[date.getDay()];
        
        // Tên tháng
        const monthNames = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
        const monthName = monthNames[date.getMonth()];
        
        // Set className và thuộc tính dựa trên availability
        if (isAvailable) {
            button.className = 'date-btn available';
            button.disabled = false;
            button.title = 'Bác sĩ có lịch làm việc trong ngày này';
            
            // Thêm event listener chỉ cho ngày available
            button.addEventListener('click', function() {
                selectDate(this);
            });
        } else {
            button.className = 'date-btn unavailable';
            button.disabled = true;
            button.title = 'Bác sĩ không có lịch làm việc trong ngày này';
        }
        
        // Nội dung HTML với status indicator
        button.innerHTML = `
            <div class="day-name">${dayName}</div>
            <div class="date-number">${date.getDate()}</div>
            <div class="month-name">${monthName}</div>
            <div class="status-indicator">
                ${isAvailable ? 
                    '<i class="fas fa-check-circle" style="color: #27ae60; font-size: 0.8rem;"></i>' : 
                    '<i class="fas fa-times-circle" style="color: #e74c3c; font-size: 0.8rem;"></i>'
                }
            </div>
        `;
        
        return button;
    }
    
    // ✅ THÊM: Xử lý chọn ngày 
    async function selectDate(selectedButton) {
        // Kiểm tra xem button này có available không
        if (selectedButton.disabled || selectedButton.classList.contains('unavailable')) {
            showNotification('Bác sĩ không có lịch làm việc trong ngày này!', 'warning');
            return;
        }
        
        // Remove selected class từ tất cả buttons
        document.querySelectorAll('.date-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        
        // Add selected class cho button được chọn
        selectedButton.classList.add('selected');
        
        // Lưu ngày đã chọn
        const selectedDate = selectedButton.dataset.date;
        const displayDay = selectedButton.querySelector('.date-number').textContent;
        const displayDayName = selectedButton.querySelector('.day-name').textContent;
        
        console.log(`🎯 DEBUG: User click button ${displayDayName} ${displayDay}, dataset.date = ${selectedDate}`);
        
        currentBookingData.selectedDate = selectedDate;
        
        // Cập nhật hidden input cho form validation
        const hiddenInput = document.getElementById('newDate');
        if (hiddenInput) {
            hiddenInput.value = selectedDate;
        }
        
        // Load khung giờ khả dụng cho ngày đã chọn
        await loadAvailableTimeSlots(selectedDate);
        
        console.log('✅ Đã chọn ngày:', selectedDate);
    }

    
    // ✅ THÊM: Load khung giờ khả dụng cho ngày đã chọn từ API WorkSlot
    async function loadAvailableTimeSlots(selectedDate) {
        const timeSlotSelect = document.getElementById('newTimeSlot');
        
        if (!selectedDate || !currentBookingData.docId) {
            timeSlotSelect.innerHTML = '<option value="">-- Chọn khung giờ --</option>';
            return;
        }
        
        // Hiển thị loading
        timeSlotSelect.innerHTML = '<option value="">Đang tải khung giờ...</option>';
        
        try {
            // Gọi API lấy WorkSlot với booking count cho ngày cụ thể
            const response = await fetch(`/api/workslots?docId=${currentBookingData.docId}&date=${selectedDate}`);
            
            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }
            
            const workSlots = await response.json();
            console.log('⏰ WorkSlots cho ngày', selectedDate, ':', workSlots);
            
            // Reset dropdown
            timeSlotSelect.innerHTML = '<option value="">-- Chọn khung giờ --</option>';
            
            if (!workSlots || workSlots.length === 0) {
                timeSlotSelect.innerHTML = '<option value="">Bác sĩ không có lịch làm việc trong ngày này</option>';
                return;
            }
            
            // Tạo options từ WorkSlot thực tế
            workSlots.forEach(slot => {
                const option = document.createElement('option');
                const timeRange = `${slot.startTime}-${slot.endTime}`;
                option.value = timeRange;
                
                // Kiểm tra slot có còn chỗ không (để disable nếu đầy)
                const remainingSlots = slot.maxPatient - slot.currentBooking;
                const isFull = remainingSlots <= 0;
                
                // ✅ Chỉ hiển thị khung giờ, tạm ẩn thông tin số chỗ
                option.textContent = timeRange;
                
                if (isFull) {
                    option.disabled = true;
                    option.style.color = '#999';
                    option.style.fontStyle = 'italic';
                }
                
                timeSlotSelect.appendChild(option);
            });
            
            console.log('✅ Đã load', workSlots.length, 'khung giờ cho ngày', selectedDate);
            
        } catch (error) {
            console.error('❌ Lỗi khi lấy khung giờ:', error);
            timeSlotSelect.innerHTML = '<option value="">Không thể tải khung giờ! Vui lòng thử lại.</option>';
        }
    }
    
    // ✅ THÊM: Xử lý submit form dời lịch
    function handleRescheduleSubmit(e) {
        e.preventDefault();
        
        const formData = {
            bookId: currentBookingData.bookId,
            newDate: currentBookingData.selectedDate,
            newTimeSlot: document.getElementById('newTimeSlot').value,
            reason: document.getElementById('rescheduleReason').value
        };
        
        // Validation
        if (!formData.newDate) {
            showNotification('Vui lòng chọn ngày mới!', 'error');
            return;
        }
        
        if (!formData.newTimeSlot) {
            showNotification('Vui lòng chọn khung giờ!', 'error');
            return;
        }
        
        // Kiểm tra ngày không được là quá khứ (này đã được đảm bảo bởi logic 5 ngày tiếp theo)
        const selectedDate = new Date(formData.newDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (selectedDate <= today) {
            showNotification('Ngày mới phải là ngày trong tương lai!', 'error');
            return;
        }
        
        // Kiểm tra slot không được là disabled
        const timeSlotSelect = document.getElementById('newTimeSlot');
        const selectedOption = timeSlotSelect.options[timeSlotSelect.selectedIndex];
        if (selectedOption && selectedOption.disabled) {
            showNotification('Khung giờ này đã đầy, vui lòng chọn khung giờ khác!', 'error');
            return;
        }
        
        // Hiển thị loading
        const submitBtn = document.querySelector('#rescheduleForm .btn-primary');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang xử lý...';
        submitBtn.disabled = true;
        
        // ✅ THAY THẾ: Gọi API thực tế để dời lịch
        handleRescheduleAPI();
        
        async function handleRescheduleAPI() {
            try {
                // ✅ BƯỚC 1: Lấy slotId từ ngày giờ được chọn
                const [startTime, endTime] = formData.newTimeSlot.split('-');
                
                const slotResponse = await fetch('/api/workslots/get-slot-id-by-date-time', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        docId: currentBookingData.docId,
                        workDate: formData.newDate,
                        startTime: startTime,
                        endTime: endTime
                    })
                });
                
                if (!slotResponse.ok) {
                    const errorText = await slotResponse.text();
                    throw new Error(`Không thể tìm khung giờ phù hợp: ${errorText}`);
                }
                
                const slotData = await slotResponse.json();
                
                if (!slotData.slotId) {
                    throw new Error('Không tìm thấy khung giờ làm việc phù hợp!');
                }
                
                console.log('📅 Đã lấy slotId:', slotData.slotId, 'cho ngày', formData.newDate, 'khung giờ', formData.newTimeSlot);
                
                // ✅ BƯỚC 2: Gửi yêu cầu dời lịch
                const rescheduleResponse = await fetch(`/api/booking/${formData.bookId}/reschedule`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        newSlotId: slotData.slotId,
                        reason: formData.reason
                    })
                });
                
                const rescheduleResult = await rescheduleResponse.json();
                
                if (rescheduleResponse.ok && rescheduleResult.success) {
                    // Thành công
                    showNotification(rescheduleResult.message, 'success');
                    
                    // Đóng modal
                    closeRescheduleModal();
                    
                    // Reload calendar để cập nhật
                    renderCalendar();
                    
                    console.log('✅ Reschedule thành công:', rescheduleResult);
                } else {
                    // Lỗi từ API
                    throw new Error(rescheduleResult.message || 'Không thể dời lịch');
                }
                
            } catch (error) {
                console.error('❌ Lỗi khi dời lịch:', error);
                showNotification(`Lỗi: ${error.message}`, 'error');
            } finally {
                // Reset button
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
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
        const bgColor = type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : '#f39c12';
        const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ⓘ';
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 25px;
            background: ${bgColor};
            color: white;
            border-radius: 8px;
            font-weight: 500;
            z-index: 1003;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            max-width: 400px;
            word-wrap: break-word;
        `;
        notification.innerHTML = `<span style="margin-right: 8px;">${icon}</span>${message}`;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 10);
        
        const duration = type === 'error' ? 5000 : 3000; // Error hiển thị lâu hơn
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                document.body.removeChild(notification);
                }
            }, 300);
        }, duration);
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
                    } else if (booking.bookStatus === 'confirmed') {
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
                return workDate >= today && booking.bookStatus === 'confirmed';
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
            return workDate >= today && booking.bookStatus === 'confirmed';
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

    // ✅ THÊM: Khởi tạo modal event listeners
    initModalEventListeners();

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