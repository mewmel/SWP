// Global variables
let currentWeek = new Date();
let selectedSlots = new Set();

// Schedule data
const scheduleData = [
    { day: 'Thứ 2', date: '24/06', isWeekend: false },
    { day: 'Thứ 3', date: '25/06', isWeekend: false },
    { day: 'Thứ 4', date: '26/06', isWeekend: false },
    { day: 'Thứ 5', date: '27/06', isWeekend: false },
    { day: 'Thứ 6', date: '28/06', isWeekend: false },
    { day: 'Thứ 7', date: '29/06', isWeekend: true },
    { day: 'Chủ nhật', date: '30/06', isWeekend: true }
];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeScheduleGrid();
    initializeEventListeners();
    updateWeekDisplay();
    updateStats();
});

// Initialize schedule grid
function initializeScheduleGrid() {
    const scheduleGrid = document.getElementById('scheduleGrid');
    scheduleGrid.innerHTML = '';

    scheduleData.forEach(day => {
        const dayCard = createDayCard(day);
        scheduleGrid.appendChild(dayCard);
    });
}

// Create day card
function createDayCard(day) {
    const card = document.createElement('div');
    card.className = 'day-card';
    
    card.innerHTML = `
        <div class="day-header">
            <h3>${day.day}</h3>
            <p class="day-date">${day.date}/2024</p>
            ${day.isWeekend ? '<span class="weekend-badge">Cuối tuần</span>' : ''}
        </div>
        
        <div class="shift-slot">
            <label class="shift-label">Ca sáng</label>
            <button class="shift-button morning" data-day="${day.date}" data-shift="morning">
                <div class="shift-time">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12,6 12,12 16,14"/>
                    </svg>
                    <span>08:00 - 12:00</span>
                </div>
                <svg class="check-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: none;">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22,4 12,14.01 9,11.01"/>
                </svg>
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
                `<button class="shift-button afternoon" data-day="${day.date}" data-shift="afternoon">
                    <div class="shift-time">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"/>
                            <polyline points="12,6 12,12 16,14"/>
                        </svg>
                        <span>13:00 - 17:00</span>
                    </div>
                    <svg class="check-icon orange" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: none;">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                        <polyline points="22,4 12,14.01 9,11.01"/>
                    </svg>
                </button>`
            }
        </div>
    `;

    // Add event listeners to shift buttons
    const shiftButtons = card.querySelectorAll('.shift-button');
    shiftButtons.forEach(button => {
        button.addEventListener('click', handleShiftClick);
    });

    return card;
}

// Handle shift button click
function handleShiftClick(event) {
    const button = event.currentTarget;
    const day = button.dataset.day;
    const shift = button.dataset.shift;
    const slotId = `${day}-${shift}`;
    
    if (selectedSlots.has(slotId)) {
        // Deselect
        selectedSlots.delete(slotId);
        button.classList.remove('selected');
        button.querySelector('.check-icon').style.display = 'none';
    } else {
        // Select
        selectedSlots.add(slotId);
        button.classList.add('selected');
        button.querySelector('.check-icon').style.display = 'block';
    }
    
    updateStats();
}

// Initialize event listeners
function initializeEventListeners() {
    // Week navigation
    document.getElementById('prevWeek').addEventListener('click', () => {
        currentWeek.setDate(currentWeek.getDate() - 7);
        updateWeekDisplay();
    });
    
    document.getElementById('nextWeek').addEventListener('click', () => {
        currentWeek.setDate(currentWeek.getDate() + 7);
        updateWeekDisplay();
    });
    
    // Action buttons
    document.getElementById('saveBtn').addEventListener('click', handleSave);
    document.getElementById('resetBtn').addEventListener('click', handleReset);
    document.getElementById('submitBtn').addEventListener('click', handleSubmit);
}

// Update week display
function updateWeekDisplay() {
    const startOfWeek = new Date(currentWeek);
    const dayOfWeek = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    startOfWeek.setDate(diff);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    const formatDate = (date) => {
        return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
    };

    const weekRange = `${formatDate(startOfWeek)} - ${formatDate(endOfWeek)}`;
    document.getElementById('weekRange').textContent = weekRange;
}

// Update statistics
function updateStats() {
    const totalSlots = selectedSlots.size;
    const morningSlots = Array.from(selectedSlots).filter(slot => slot.includes('morning')).length;
    const afternoonSlots = Array.from(selectedSlots).filter(slot => slot.includes('afternoon')).length;
    const totalHours = (morningSlots * 4) + (afternoonSlots * 4);
    
    document.getElementById('totalHours').textContent = `${totalHours} giờ`;
    document.getElementById('totalShifts').textContent = `${totalSlots} ca`;
    document.getElementById('shiftBreakdown').textContent = `${morningSlots} sáng, ${afternoonSlots} chiều`;
}

// Handle save
function handleSave() {
    const selectedSlotsArray = Array.from(selectedSlots);
    console.log('Saving draft:', selectedSlotsArray);
    
    // Show success message
    showNotification('Đã lưu bản nháp thành công!', 'success');
}

// Handle reset
function handleReset() {
    if (confirm('Bạn có chắc chắn muốn đặt lại tất cả lựa chọn?')) {
        selectedSlots.clear();
        
        // Reset all buttons
        document.querySelectorAll('.shift-button.selected').forEach(button => {
            button.classList.remove('selected');
            button.querySelector('.check-icon').style.display = 'none';
        });
        
        updateStats();
        showNotification('Đã đặt lại thành công!', 'info');
    }
}

// Handle submit
async function handleSubmit() {
    const submitBtn = document.getElementById('submitBtn');
    const submitText = document.getElementById('submitText');
    
    if (selectedSlots.size === 0) {
        showNotification('Vui lòng chọn ít nhất một ca làm việc!', 'error');
        return;
    }
    
    // Show loading state
    submitBtn.disabled = true;
    submitBtn.classList.add('loading');
    submitText.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spin">
            <polyline points="23,4 23,10 17,10"/>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
        </svg>
        Đang gửi...
    `;
    
    try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Show success state
        submitBtn.classList.remove('loading');
        submitBtn.classList.add('success');
        submitText.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22,4 12,14.01 9,11.01"/>
            </svg>
            Đã gửi thành công
        `;
        
        showNotification('Đăng ký lịch làm việc thành công! Hệ thống sẽ xem xét và phê duyệt trong vòng 2 giờ.', 'success');
        
        // Reset after 3 seconds
        setTimeout(() => {
            submitBtn.disabled = false;
            submitBtn.classList.remove('success');
            submitText.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="22" y1="2" x2="11" y2="13"/>
                    <polygon points="22,2 15,22 11,13 2,9 22,2"/>
                </svg>
                Gửi đăng ký
            `;
        }, 3000);
        
    } catch (error) {
        // Handle error
        submitBtn.disabled = false;
        submitBtn.classList.remove('loading');
        submitText.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22,2 15,22 11,13 2,9 22,2"/>
            </svg>
            Gửi đăng ký
        `;
        
        showNotification('Có lỗi xảy ra khi gửi đăng ký. Vui lòng thử lại!', 'error');
    }
}

// Show notification
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // Create notification
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 1000;
        max-width: 400px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    
    // Set background color based on type
    const colors = {
        success: '#16a34a',
        error: '#dc2626',
        info: '#2563eb',
        warning: '#ea580c'
    };
    
    notification.style.backgroundColor = colors[type] || colors.info;
    notification.textContent = message;
    
    // Add to DOM
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 5000);
}

// Add CSS for spin animation
const style = document.createElement('style');
style.textContent = `
    .spin {
        animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);
