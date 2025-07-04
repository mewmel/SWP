// Biểu đồ hormone E2 (giữ nguyên)
const ctx = document.getElementById('hormoneChart').getContext('2d');
const hormoneChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: ['14/06', '16/06', '18/06', '20/06', '22/06', '24/06'],
        datasets: [{
            label: 'E2 (pg/ml)',
            data: [180, 210, 235, 260, 248, 245],
            borderColor: 'rgb(74, 144, 226)',
            backgroundColor: 'rgba(74, 144, 226, 0.1)',
            tension: 0.1
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            }
        },
        scales: {
            y: {
                beginAtZero: false,
                min: 150,
                max: 300
            }
        }
    }
});

// --------- Kết quả xét nghiệm động từ backend ---------

// Quy đổi trạng thái từ BE -> text + class màu
function getStatusDisplay(status) {
    switch (status) {
        case 'Completed': return {text: 'Hoàn thành', css: 'status-normal'};
        case 'Ongoing':   return {text: 'Đang thực hiện', css: 'status-pending'};
        case 'Inactive':  return {text: 'Chưa thực hiện', css: 'status-inactive'};
        case 'Abnormal':  return {text: 'Cần chú ý', css: 'status-abnormal'};
        case 'Pending':   return {text: 'Đang chờ kết quả', css: 'status-pending'};
        default:          return {text: status, css: ''};
    }
}

// Định dạng ngày giờ
function formatDateTime(dtStr) {
    if (!dtStr) return '';
    const d = new Date(dtStr);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('vi-VN') + ' - ' + d.toLocaleTimeString('vi-VN', {hour:'2-digit',minute:'2-digit'});
}

// Hàm cập nhật số completed lên giao diện
function updateCompletedCount(count) {
    const summaryValue = document.querySelector('.test-summary .summary-value');
    if (summaryValue) summaryValue.textContent = count;
}

// Render kết quả xét nghiệm động
function renderTestResults(results) {
    const container = document.querySelector('.booking-steps-results');
    if (!container) return;
    if (!results || results.length === 0) {
        container.innerHTML = '<p style="color:#888;padding:16px;">Chưa có kết quả xét nghiệm nào.</p>';
        updateCompletedCount(0);
        return;
    }
    container.innerHTML = '';
    let completedCount = 0;
    results.forEach(item => {
        const statusObj = getStatusDisplay(item.stepStatus);
        if (item.stepStatus === 'Completed') completedCount++;
        container.innerHTML += `
        <div class="step-result-item">
            <div class="step-result-header">
                <div class="step-info">
                    <h4>${item.subName || '(Không rõ tên)'}</h4>
                    <div class="test-date">${formatDateTime(item.performedAt)}</div>
                </div>
                <div class="test-status ${statusObj.css}">${statusObj.text}</div>
            </div>
            <div class="step-result-content">
                <div class="result-value">
                    <strong>Kết quả:</strong>
                    <span class="result-number">${item.result ? item.result : '<span class="result-pending">Chưa có</span>'}</span>
                </div>
                <div class="result-note">
                    <strong>Ghi chú:</strong>
                    <span>${item.note || ''}</span>
                </div>
            </div>
        </div>
        `;
    });

    updateCompletedCount(completedCount);

    // Bắt sự kiện click từng xét nghiệm để hiện chi tiết (VD: alert)
    document.querySelectorAll('.step-result-item').forEach(item => {
        item.addEventListener('click', function() {
            const testName = this.querySelector('h4').textContent;
            alert(`Xem chi tiết: ${testName}`);
        });
    });
}

// Gọi API lấy dữ liệu động
function loadTestResults() {
    // Lấy cusId từ localStorage/session, hoặc BE tự nhận diện user đăng nhập
    const cusId = localStorage.getItem('cusId') || 1; // demo cứng cusId=1, bạn tự đổi lại
    fetch(`/api/booking-steps/results?cusId=${cusId}`)
        .then(res => res.json())
        .then(data => renderTestResults(data))
        .catch(err => {
            document.querySelector('.booking-steps-results').innerHTML = '<p>Lỗi tải dữ liệu!</p>';
            updateCompletedCount(0);
        });
}

// --------- Filter & Download giữ nguyên ----------

document.querySelectorAll('.filter-select').forEach(select => {
    select.addEventListener('change', function() {
        console.log('Filter changed:', this.value);
        // TODO: Gọi lại loadTestResults() với bộ lọc nếu cần
    });
});

document.querySelector('.download-btn').addEventListener('click', function() {
    alert('Đang tải báo cáo...');
});

// Khởi chạy khi DOM ready
document.addEventListener('DOMContentLoaded', loadTestResults);
