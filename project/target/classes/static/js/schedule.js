
// Calendar navigation
document.getElementById('prevMonth').addEventListener('click', function() {
    // Previous month logic
    alert('Chuyển sang tháng trước');
});

document.getElementById('nextMonth').addEventListener('click', function() {
    // Next month logic
    alert('Chuyển sang tháng sau');
});

// View toggles
document.querySelectorAll('.view-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        alert(`Chuyển sang view: ${this.textContent}`);
    });
});

// Calendar day clicks
document.querySelectorAll('.calendar-day').forEach(day => {
    day.addEventListener('click', function() {
        const dayNumber = this.querySelector('.day-number').textContent;
        alert(`Xem chi tiết ngày ${dayNumber}`);
    });
});

// Medication done buttons
document.querySelectorAll('.done-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        this.textContent = 'Hoàn thành';
        this.disabled = true;
    });
});
