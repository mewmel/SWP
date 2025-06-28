document.addEventListener('DOMContentLoaded', function() {
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

    fetch(`http://localhost:8080/api/patient-profile/${encodeURIComponent(cusId)}`)
        .then(res => res.json())
        .then(data => {
            // Mã bệnh nhân (cả hai nơi)
            document.querySelectorAll('.profile-patient-code').forEach(span => {
                if (span && data.cusId) {
                    span.textContent = "BN-" + data.cusId.toString().padStart(4, '0');
                }
            });

            // Ngày đăng ký (cả hai nơi)
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

            // Bác sĩ phụ trách (chỉ hiện ở Thông tin bệnh nhân)
            document.querySelectorAll('.profile-doctor').forEach(span => {
                if (span && data.bacSiPhuTrach) {
                    span.textContent = data.bacSiPhuTrach;
                } else if (span) {
                    span.textContent = "Chưa có";
                }
            });

            // Chu kỳ điều trị (hiện ở Thông tin bệnh nhân)
            document.querySelectorAll('.profile-cycle').forEach(span => {
                if (span && data.chuKyHienTai !== undefined && data.chuKyHienTai !== null) {
                    span.textContent = "Chu kỳ " + data.chuKyHienTai + (data.treatmentName ? " - " + data.treatmentName : "");
                } else if (span) {
                    span.textContent = "Chưa có";
                }
            });

            // Chu kỳ thứ (ở Thông tin điều trị)
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
    // 2. Lấy thông tin dashboard bệnh nhân
    fetch(`http://localhost:8080/api/patient-profile/dashboard/${encodeURIComponent(cusId)}`)
        .then(res => res.json())
        .then(data => {
            // Ví dụ: treatmentName, treatmentStage, nextEventDate, nextEventType
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

    fetch(`http://localhost:8080/api/patient-profile/steps/${encodeURIComponent(cusId)}`)
        .then(res => res.json())
        .then(steps => {
            if (!steps.length) return;

            // Sắp xếp tăng dần theo ngày
            steps.sort((a, b) => new Date(a.performedAt) - new Date(b.performedAt));
            // Lấy ngày bắt đầu timeline (ngày performedAt nhỏ nhất)
            const firstDate = new Date(steps[0].performedAt);

            // Render 7 ngày liên tiếp từ ngày đầu tiên
            let timelineHTML = '';
            for (let i = 0; i < 7; i++) {
                const day = new Date(firstDate);
                day.setDate(firstDate.getDate() + i);
                const dayStr = day.getDate().toString().padStart(2, '0');
                const weekday = ['CN','T2','T3','T4','T5','T6','T7'][day.getDay()];

                // Tìm các step trong ngày này
                const events = steps.filter(s => {
                    const d = new Date(s.performedAt);
                    return d.getDate() === day.getDate() && d.getMonth() === day.getMonth() && d.getFullYear() === day.getFullYear();
                });

                // Xác định event-dot
                let eventsHtml = '';
                events.forEach(ev => {
                    const iconClass = getIconClass(ev.subName);
                    if (iconClass) eventsHtml += `<div class="event-dot ${iconClass}"></div>`;
                });

                // Highlight hôm nay
                const today = new Date();
                const isToday = day.getDate() === today.getDate() && day.getMonth() === today.getMonth() && day.getFullYear() === today.getFullYear();

                timelineHTML += `
                <div class="timeline-day${isToday ? " today" : ""}${events.length ? " has-event" : ""}">
                    <div class="day-number">${dayStr}</div>
                    <div class="day-events">${eventsHtml}</div>
                    <small>${weekday}</small>
                </div>`;
            }
            document.getElementById('timeline-week').innerHTML = timelineHTML;

            // Progress bar: Giai đoạn hiện tại
            // ... code fetch steps ...
            const now = new Date();
            const completedSteps = steps.filter(s =>
                new Date(s.performedAt) <= now &&
                s.stepStatus && s.stepStatus.toLowerCase() === "completed"
            );
            const currentStage = completedSteps.length + 1;
            const totalStage = steps.length;
            const stageName = (currentStage > 0 && currentStage <= steps.length) ? steps[currentStage-1].subName : '';
            document.getElementById('progress-text').textContent =
                `Giai đoạn ${currentStage}/${totalStage} - ${stageName}`;
        })
        .catch(e => {
            console.error('Lỗi lấy timeline:', e);
        });
    function setTimelineWeekLabel(date = new Date()) {
        // Tính tuần trong tháng
        const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
        const dayOfMonth = date.getDate();
        const adjustedDate = dayOfMonth + firstDay.getDay();
        const weekNumber = Math.ceil(adjustedDate / 7);

        // Đổi tháng sang số/tháng tiếng Việt
        const month = date.getMonth() + 1; // JS getMonth() trả về 0-11
        const year = date.getFullYear();

        document.getElementById('timeline-week-label').textContent =
            `Tuần ${weekNumber} - Tháng ${month}/${year}`;
    }

    // Gọi hàm khi muốn cập nhật label
    setTimelineWeekLabel();

    // Render legend động dựa trên các bước hiện có
    fetch(`http://localhost:8080/api/patient-profile/steps/${encodeURIComponent(cusId)}`)
        .then(res => res.json())
        .then(steps => {
            if (!steps.length) return;

            // Sắp xếp tăng dần theo ngày
            steps.sort((a, b) => new Date(a.performedAt) - new Date(b.performedAt));
            // Lấy ngày bắt đầu timeline (ngày performedAt nhỏ nhất)
            const firstDate = new Date(steps[0].performedAt);

            // Set để lưu các subName trong tuần này
            const weekSubNames = new Map(); // key: subName, value: iconClass

            // Render 7 ngày liên tiếp từ ngày đầu tiên
            let timelineHTML = '';
            for (let i = 0; i < 7; i++) {
                const day = new Date(firstDate);
                day.setDate(firstDate.getDate() + i);
                const dayStr = day.getDate().toString().padStart(2, '0');
                const weekday = ['CN','T2','T3','T4','T5','T6','T7'][day.getDay()];

                // Tìm các step trong ngày này
                const events = steps.filter(s => {
                    const d = new Date(s.performedAt);
                    return d.getDate() === day.getDate() && d.getMonth() === day.getMonth() && d.getFullYear() === day.getFullYear();
                });

                // Xác định event-dot
                let eventsHtml = '';
                events.forEach(ev => {
                    const iconClass = getIconClass(ev.subName);
                    if (ev.subName) weekSubNames.set(ev.subName, iconClass); // <-- chỉ collect subName xuất hiện trong tuần
                    if (iconClass) eventsHtml += `<div class="event-dot ${iconClass}"></div>`;
                });

                // Highlight hôm nay
                const today = new Date();
                const isToday = day.getDate() === today.getDate() && day.getMonth() === today.getMonth() && day.getFullYear() === today.getFullYear();

                timelineHTML += `
            <div class="timeline-day${isToday ? " today" : ""}${events.length ? " has-event" : ""}">
                <div class="day-number">${dayStr}</div>
                <div class="day-events">${eventsHtml}</div>
                <small>${weekday}</small>
            </div>`;
            }
            document.getElementById('timeline-week').innerHTML = timelineHTML;

            // Progress bar: Giai đoạn hiện tại
            // ... code fetch steps ...
            const now = new Date();
            const completedSteps = steps.filter(s =>
                new Date(s.performedAt) <= now &&
                s.stepStatus && s.stepStatus.toLowerCase() === "completed"
            );
            const currentStage = completedSteps.length + 1;
            const totalStage = steps.length;
            const stageName = (currentStage > 0 && currentStage <= steps.length) ? steps[currentStage-1].subName : '';
            document.getElementById('progress-text').textContent =
                `Giai đoạn ${currentStage}/${totalStage} - ${stageName}`;

            // Render legend chỉ với subName xuất hiện trong tuần
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
});