document.addEventListener('DOMContentLoaded', function() {
    const cusId = localStorage.getItem('cusId');
    if (!cusId) return;

    // Lấy DOM cho badge, bell và dropdown
    const bellBtn = document.getElementById('notificationBtn');
    const dropdown = document.getElementById('notificationDropdown');
    const badge = document.querySelector('.notification-badge');

    // Biến toàn cục để lưu số thông báo hôm nay + ngày mai
    let currentNotiCount = 0;

    fetch(`http://localhost:8080/api/patient-profile/steps/${encodeURIComponent(cusId)}`)
        .then(res => res.json())
        .then(steps => {
            const body = document.getElementById('notificationDropdownBody');
            if (!body) return;

            if (!steps || steps.length === 0) {
                body.innerHTML = `<div class="notification-dropdown-item">Không có lịch hôm nay và ngày mai.</div>`;
                if (badge) badge.style.display = "none";
                return;
            }

            // Xác định ngày hôm nay và ngày mai
            const now = new Date();
            now.setHours(0,0,0,0);
            const todayStr = now.toISOString().slice(0,10);
            const tomorrow = new Date(now);
            tomorrow.setDate(now.getDate() + 1);
            const tomorrowStr = tomorrow.toISOString().slice(0,10);

            // Lọc steps cho hôm nay và ngày mai
            const stepsToday = steps.filter(s => {
                const d = new Date(s.performedAt);
                d.setHours(0,0,0,0);
                return d.toISOString().slice(0,10) === todayStr;
            });
            const stepsTomorrow = steps.filter(s => {
                const d = new Date(s.performedAt);
                d.setHours(0,0,0,0);
                return d.toISOString().slice(0,10) === tomorrowStr;
            });

            // Tính số thông báo
            currentNotiCount = stepsToday.length + stepsTomorrow.length;

            // Lấy lastSeenNotiCount từ localStorage
            const lastSeenCount = Number(localStorage.getItem('lastSeenNotiCount') || 0);

            // Xử lý badge
            if (badge) {
                if (currentNotiCount > lastSeenCount) {
                    badge.style.display = "inline-block";
                    badge.textContent = currentNotiCount - lastSeenCount;
                } else {
                    badge.style.display = "none";
                }
            }

            let html = '';

            // Hôm nay
            html += `<div style="font-weight:bold;color:#1976d2;margin-top:4px;">Lịch hôm nay:</div>`;
            if (stepsToday.length) {
                html += stepsToday.map(s => {
                    // Đoán icon
                    let icon = '<i class="fas fa-bell"></i>';
                    if (s.subName && s.subName.toLowerCase().includes('tiêm')) icon = '<i class="fas fa-syringe"></i>';
                    else if (s.subName && (s.subName.toLowerCase().includes('xét nghiệm') || s.subName.toLowerCase().includes('thử'))) icon = '<i class="fas fa-flask"></i>';
                    else if (s.subName && s.subName.toLowerCase().includes('khám')) icon = '<i class="fas fa-calendar-check"></i>';
                    else if (s.subName && s.subName.toLowerCase().includes('siêu âm')) icon = '<i class="fas fa-heartbeat"></i>';

                    const timeStr = new Date(s.performedAt).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'});
                    return `
                        <div class="notification-dropdown-item unread">
                            <div class="notification-avatar">${icon}</div>
                            <div class="notification-content">
                                <div class="notification-title">${s.subName || 'Dịch vụ'} hôm nay</div>
                                <div class="notification-description">${s.subName || ''} lúc ${timeStr}</div>
                                <div class="notification-time">Hôm nay</div>
                            </div>
                        </div>
                    `;
                }).join('');
            } else {
                html += `<div class="notification-dropdown-item" style="color:#888;">Không có lịch hôm nay.</div>`;
            }

            // Ngày mai
            html += `<div style="font-weight:bold;color:#1976d2;margin-top:8px;">Lịch ngày mai:</div>`;
            if (stepsTomorrow.length) {
                html += stepsTomorrow.map(s => {
                    let icon = '<i class="fas fa-bell"></i>';
                    if (s.subName && s.subName.toLowerCase().includes('tiêm')) icon = '<i class="fas fa-syringe"></i>';
                    else if (s.subName && (s.subName.toLowerCase().includes('xét nghiệm') || s.subName.toLowerCase().includes('thử'))) icon = '<i class="fas fa-flask"></i>';
                    else if (s.subName && s.subName.toLowerCase().includes('khám')) icon = '<i class="fas fa-calendar-check"></i>';
                    else if (s.subName && s.subName.toLowerCase().includes('siêu âm')) icon = '<i class="fas fa-heartbeat"></i>';

                    const timeStr = new Date(s.performedAt).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'});
                    return `
                        <div class="notification-dropdown-item unread">
                            <div class="notification-avatar">${icon}</div>
                            <div class="notification-content">
                                <div class="notification-title">${s.subName || 'Dịch vụ'} ngày mai</div>
                                <div class="notification-description">${s.subName || ''} lúc ${timeStr}</div>
                                <div class="notification-time">Ngày mai</div>
                            </div>
                        </div>
                    `;
                }).join('');
            } else {
                html += `<div class="notification-dropdown-item" style="color:#888;">Không có lịch ngày mai.</div>`;
            }

            body.innerHTML = html;
        })
        .catch(err => {
            console.error('Lỗi lấy thông báo:', err);
            if (badge) badge.style.display = "none";
        });

    // Khi bấm chuông: cập nhật số đã đọc vào localStorage và ẩn badge
    if (bellBtn && badge) {
        bellBtn.addEventListener('click', function() {
            // Lưu tổng số lịch hôm nay + ngày mai đã xem
            localStorage.setItem('lastSeenNotiCount', currentNotiCount);
            badge.style.display = "none";
            if (dropdown) dropdown.classList.toggle('open');
        });
    }
});