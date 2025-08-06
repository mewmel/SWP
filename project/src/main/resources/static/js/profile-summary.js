const style = document.createElement('style');
style.innerText = `
.event-dot {
    display: inline-block;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    margin: 0 3px;
    vertical-align: middle;
    background: #ccc;
    border: 2px solid #fff;
    box-shadow: 0 0 2px rgba(0,0,0,0.15);
}
.event-dot.event-appointment   { background: #4CAF50; }
.event-dot.event-test         { background: #F44336; }
.event-dot.event-ultrasound   { background: #2196F3; }
.event-dot.event-injection    { background: #FF9800; }
.event-dot.event-consult      { background: #9C27B0; }
.event-dot.event-puncture     { background: #3F51B5; }
.event-dot.event-transfer     { background: #00BCD4; }
.event-dot.event-sperm        { background: #795548; }
.event-dot.event-embryo       { background: #FFEB3B; border-color:#BDB76B; }
.event-dot.event-iui          { background: #607D8B; }
.event-dot.event-other        { background: #BDBDBD; }
/* Căn giữa các dot trong mỗi ngày */
.timeline-day .day-events {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 2px;
    min-height: 16px; /* Đảm bảo có khoảng trống cho dot */
}
`;
document.head.appendChild(style);
document.addEventListener('DOMContentLoaded', function() {
    // Kiểm tra xem có đủ element cần thiết không
    function checkRequiredElements() {
        const requiredElements = [
            'timeline-week',
            'timeline-week-label', 
            'timeline-legend',
            'progress-steps'
        ];
        
        const missingElements = requiredElements.filter(id => !document.getElementById(id));
        if (missingElements.length > 0) {
            console.warn('Missing required elements:', missingElements);
            return false;
        }
        return true;
    }
    
    // Thêm hàm phân loại màu dot cho từng subName
    function getIconClass(subName) {
        if (!subName) return '';
        const lower = subName.toLowerCase();
        if (lower.includes('khám')) return 'event-appointment';
        if (lower.includes('xét nghiệm') || lower.includes('thử')) return 'event-test';
        if (lower.includes('siêu âm')) return 'event-ultrasound';
        if (lower.includes('tiêm')) return 'event-injection';
        if (lower.includes('tư vấn')) return 'event-consult';
        if (lower.includes('chọc hút')) return 'event-puncture';
        if (lower.includes('chuyển phôi')) return 'event-transfer';
        if (lower.includes('lấy tinh trùng')) return 'event-sperm';
        if (lower.includes('tạo phôi') || lower.includes('nuôi phôi')) return 'event-embryo';
        if (lower.includes('bơm tinh trùng')) return 'event-iui';
        return 'event-other';
    }

    const cusId = localStorage.getItem('cusId');
    if (!cusId) return;
    
    // Kiểm tra xem có phải đang ở trang dashboard không
    const isDashboardPage = window.location.pathname.includes('dashboard.html');
    
    // Chỉ chạy timeline logic nếu ở trang dashboard
    if (isDashboardPage) {
        // Kiểm tra element cần thiết
        if (!checkRequiredElements()) {
            console.log('Required elements not found, skipping timeline update');
            return;
        }
    }

    fetch(`http://localhost:8080/api/patient-profile/${encodeURIComponent(cusId)}`)
        .then(res => res.json())
        .then(data => {
            document.querySelectorAll('.profile-patient-code').forEach(span => {
                if (span && data.cusId) {
                    span.textContent = "BN-" + data.cusId.toString().padStart(4, '0');
                }
            });
            document.querySelectorAll('.profile-registration-date').forEach(span => {
                if (span && data.ngayDangKy) {
                    const date = new Date(data.ngayDangKy);
                    const formatted = date.getDate().toString().padStart(2, '0') + '/'
                        + (date.getMonth() + 1).toString().padStart(2, '0') + '/'
                        + date.getFullYear();
                    span.textContent = formatted;
                } else if (span) {
                    span.textContent = "Chưa có";
                }
            });
            document.querySelectorAll('.profile-doctor').forEach(span => {
                if (span && data.bacSiPhuTrach) {
                    span.textContent = data.bacSiPhuTrach;
                } else if (span) {
                    span.textContent = "Chưa có";
                }
            });
            document.querySelectorAll('.profile-doctor-email').forEach(span => {
                if (span && data.bacSiEmail) {
                    span.textContent = data.bacSiEmail;
                } else if (span) {
                    span.textContent = "Chưa có";
                }
            });
            document.querySelectorAll('.profile-cycle').forEach(span => {
                if (span && data.chuKyHienTai !== undefined && data.chuKyHienTai !== null) {
                    span.textContent = "Chu kỳ " + data.chuKyHienTai + (data.treatmentName ? " - " + data.treatmentName : "");
                } else if (span) {
                    span.textContent = "Chưa có";
                }
            });
            document.querySelectorAll('.profile-cycle-number').forEach(span => {
                if (span && data.chuKyHienTai !== undefined && data.chuKyHienTai !== null) {
                    span.textContent = data.chuKyHienTai;
                } else if (span) {
                    span.textContent = "0";
                }
            });
        })
        .catch(e => {
            console.error('Lỗi lấy thông tin tổng quan:', e);
        });

    fetch(`http://localhost:8080/api/patient-profile/dashboard/${encodeURIComponent(cusId)}`)
        .then(res => res.json())
        .then(data => {
            document.querySelectorAll('.dashboard-treatment-name').forEach(span => {
                span.textContent = data.treatmentName || "Chưa có";
            });
            document.querySelectorAll('.dashboard-treatment-stage').forEach(span => {
                span.textContent = data.treatmentStage || "Chưa có";
            });
            document.querySelectorAll('.dashboard-next-event-date').forEach(span => {
                span.textContent = data.nextEventDate || "Chưa có";
            });
            document.querySelectorAll('.dashboard-next-event-type').forEach(span => {
                span.textContent = data.nextEventType || "Chưa có";
            });
        })
        .catch(e => {
            console.error('Lỗi lấy dashboard:', e);
        });

    // Helper lấy ngày đầu tuần (thứ 2)
    function getStartOfWeek(date) {
        let d = new Date(date);
        let day = d.getDay();
        let diff = day === 0 ? -6 : 1 - day;
        d.setDate(d.getDate() + diff);
        d.setHours(0,0,0,0);
        return d;
    }

    // =========== SỬA PHẦN RENDER TIMELINE TUẦN HIỆN TẠI ===========
    if (isDashboardPage) {
        // First, get the latest booking to get bookId
        fetch(`http://localhost:8080/api/booking/by-customer/${encodeURIComponent(cusId)}`)
        .then(res => res.json())
        .then(bookings => {
            if (!bookings || bookings.length === 0) {
                console.log('No bookings found for patient');
                return;
            }
            
            // Get the latest booking ID (first in the list since it's ordered by bookId desc)
            const latestBooking = bookings[0];
            const bookId = latestBooking.bookId;
            
            if (!bookId) {
                console.log('No booking ID found');
                return;
            }
            
            // Now get the treatment progress using the correct API
            return fetch(`http://localhost:8080/api/booking-steps/treatment-progress/${bookId}`);
        })
        .then(res => res.json())
        .then(treatmentData => {
            if (!treatmentData) return;
            
            // Update progress display with the correct data
            const progressPercentage = document.getElementById('progress-percentage');
            const progressFill = document.getElementById('progress-fill');
            const progressSteps = document.getElementById('progress-steps');
            
            const percentage = treatmentData.progressPercentage || 0;
            const completedCount = treatmentData.completedSubServices || 0;
            const totalSteps = treatmentData.totalSubServices || 0;
            
            if (progressPercentage) {
                progressPercentage.textContent = `${Math.round(percentage)}%`;
            }
            
            if (progressFill) {
                progressFill.style.width = `${percentage}%`;
            }
            
            if (progressSteps) {
                progressSteps.textContent = `${completedCount}/${totalSteps} bước hoàn thành`;
            }
            
            // Now get the steps for timeline display
            return fetch(`http://localhost:8080/api/patient-profile/steps/${encodeURIComponent(cusId)}`);
        })
        .then(res => res.json())
        .then(steps => {
            if (!steps || !steps.length) return;

            steps.sort((a, b) => new Date(a.performedAt) - new Date(b.performedAt));

            // Lấy tuần hiện tại bắt đầu từ thứ 2
            const today = new Date();
            const startOfWeek = getStartOfWeek(today);

            let timelineHTML = '';
            for (let i = 0; i < 7; i++) {
                const day = new Date(startOfWeek);
                day.setDate(startOfWeek.getDate() + i);
                const dayStr = day.getDate().toString().padStart(2, '0');
                const weekdayArr = ['T2','T3','T4','T5','T6','T7','CN'];
                const weekday = weekdayArr[i];

                // Lọc các booking nằm trong ngày này
                const events = steps.filter(s => {
                    const d = new Date(s.performedAt);
                    return d.getDate() === day.getDate()
                        && d.getMonth() === day.getMonth()
                        && d.getFullYear() === day.getFullYear();
                });

                // In hết dot cho ngày này
                let eventsHtml = '';
                events.forEach(ev => {
                    const iconClass = getIconClass(ev.subName);
                    eventsHtml += `<div class="event-dot ${iconClass}" title="${ev.subName}"></div>`;
                });

                // Highlight hôm nay
                const isToday = day.getDate() === today.getDate()
                    && day.getMonth() === today.getMonth()
                    && day.getFullYear() === today.getFullYear();

                timelineHTML += `
                <div class="timeline-day${isToday ? " today" : ""}${events.length ? " has-event" : ""}">
                    <div class="day-number">${dayStr}</div>
                    <div class="day-events">${eventsHtml}</div>
                    <small>${weekday}</small>
                </div>`;
            }
            const timelineWeek = document.getElementById('timeline-week');
            if (timelineWeek) {
                timelineWeek.innerHTML = timelineHTML;
            }

            // === THÔNG BÁO SIDEBAR: Dịch vụ ngày mai & Lịch trình hôm nay - CHỐNG TRÙNG ===
            const todayObj = new Date();
            todayObj.setHours(0,0,0,0);
            const tomorrowObj = new Date(todayObj);
            tomorrowObj.setDate(todayObj.getDate() + 1);

            let todaySteps = [];
            let tomorrowSteps = [];

            steps.forEach(s => {
                const d = new Date(s.performedAt);
                d.setHours(0,0,0,0);
                if (d.getTime() === todayObj.getTime()) {
                    todaySteps.push(s);
                } else if (d.getTime() === tomorrowObj.getTime()) {
                    tomorrowSteps.push(s);
                }
            });

            let notiHtml = '';

            if (tomorrowSteps.length > 0) {
                notiHtml += `<div style="font-weight:bold;">Dịch vụ ngày mai:</div>`;
                tomorrowSteps.forEach(s => {
                    const timeStr = new Date(s.performedAt).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'});
                    notiHtml += `<div class="notification-item"><div class="notification-time">${timeStr}</div><span>${s.subName || ''}</span></div>`;
                });
            }
            if (todaySteps.length > 0) {
                notiHtml += `<div style="font-weight:bold; margin-top:8px;">Lịch trình hôm nay:</div>`;
                todaySteps.forEach(s => {
                    const timeStr = new Date(s.performedAt).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'});
                    notiHtml += `<div class="notification-item"><div class="notification-time">${timeStr}</div><span>${s.subName || ''}</span></div>`;
                });
            }
            if (!tomorrowSteps.length && !todaySteps.length) {
                notiHtml = `<div class="notification-item">Không có thông báo nào hôm nay và ngày mai.</div>`;
            }
            const notiContainer = document.querySelector('.notifications-list');
            if (notiContainer) notiContainer.innerHTML = notiHtml;
        })
        .catch(e => {
            console.error('Lỗi lấy timeline:', e);
        });
    }

    function setTimelineWeekLabel(date = new Date()) {
        // Tính tuần trong tháng
        const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
        const dayOfMonth = date.getDate();
        const adjustedDate = dayOfMonth + firstDay.getDay();
        const weekNumber = Math.ceil(adjustedDate / 7);

        // Đổi tháng sang số/tháng tiếng Việt
        const month = date.getMonth() + 1; // JS getMonth() trả về 0-11
        const year = date.getFullYear();

        const timelineWeekLabel = document.getElementById('timeline-week-label');
        if (timelineWeekLabel) {
            timelineWeekLabel.textContent = `Tuần ${weekNumber} - Tháng ${month}/${year}`;
        }
    }

    // Gọi hàm khi muốn cập nhật label
    if (isDashboardPage) {
        setTimelineWeekLabel();

        // Render legend động dựa trên các bước hiện có trong tuần hiện tại
        fetch(`http://localhost:8080/api/patient-profile/steps/${encodeURIComponent(cusId)}`)
        .then(res => res.json())
        .then(steps => {
            if (!steps.length) return;

            steps.sort((a, b) => new Date(a.performedAt) - new Date(b.performedAt));
            const today = new Date();
            const startOfWeek = getStartOfWeek(today);

            // Set để lưu các subName trong tuần này
            const weekSubNames = new Map();

            for (let i = 0; i < 7; i++) {
                const day = new Date(startOfWeek);
                day.setDate(startOfWeek.getDate() + i);
                const events = steps.filter(s => {
                    const d = new Date(s.performedAt);
                    return d.getDate() === day.getDate()
                        && d.getMonth() === day.getMonth()
                        && d.getFullYear() === day.getFullYear();
                });
                events.forEach(ev => {
                    const iconClass = getIconClass(ev.subName);
                    if (ev.subName) weekSubNames.set(ev.subName, iconClass);
                });
            }

            const legendDiv = document.getElementById('timeline-legend');
            if (legendDiv) {
                legendDiv.innerHTML = '';
                weekSubNames.forEach((iconClass, subName) => {
                    legendDiv.innerHTML += `
                    <span>
                        <span class="event-dot ${iconClass}" style="display: inline-block; margin-right: 5px;"></span>
                        ${subName}
                    </span>
                `;
                });
            }
        })
        .catch(e => {
            console.error('Lỗi lấy timeline:', e);
        });
    }
});