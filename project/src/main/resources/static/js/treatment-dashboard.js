// Treatment Dashboard JavaScript
// Hiển thị thông tin điều trị active trên dashboard

document.addEventListener('DOMContentLoaded', function() {
    loadActiveTreatmentInfo();
});

async function loadActiveTreatmentInfo() {
    try {
        const cusId = localStorage.getItem('cusId') || sessionStorage.getItem('cusId');
        
        if (!cusId) {
            console.log('Không tìm thấy cusId trong localStorage');
            showNoTreatmentInfo();
            return;
        }

        console.log('🔍 Loading active treatment info for cusId:', cusId);
        
        const response = await fetch(`/api/medical-records/active-treatment/${cusId}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('✅ Active treatment data loaded:', data);
        
        if (data.hasActiveTreatment) {
            // Nếu có medical record active, tìm booking để lấy chi tiết điều trị
            await loadDetailedTreatmentInfo(data);
        } else {
            showNoTreatmentInfo();
        }
        
    } catch (error) {
        console.error('❌ Error loading active treatment info:', error);
        showNoTreatmentInfo();
    }
}

// Function mới để load chi tiết điều trị giống như modal
async function loadDetailedTreatmentInfo(basicData) {
    try {
        // Hiển thị thông tin cơ bản trước
        displayBasicTreatmentInfo(basicData);
        
        // Nếu có treatmentProgress từ API medical-records, sử dụng luôn
        if (basicData.treatmentProgress && basicData.treatmentProgress.subServiceDetails) {
            console.log('✅ Using treatment progress from medical-records API');
            displayDetailedTreatmentInfo(basicData.treatmentProgress);
            return;
        }
        
        // Nếu không có, thử lấy từ API booking-steps như modal
        if (basicData.treatmentProgress && basicData.treatmentProgress.subServiceDetails && basicData.treatmentProgress.subServiceDetails.length > 0) {
            // Tìm booking ID từ dữ liệu có sẵn
            const bookIds = await findBookingIds(basicData);
            
            if (bookIds && bookIds.length > 0) {
                console.log('🔍 Loading detailed treatment using booking-steps API with bookId:', bookIds[0]);
                
                // Sử dụng API giống như modal
                const response = await fetch(`/api/booking-steps/treatment-progress/${bookIds[0]}`);
                if (response.ok) {
                    const treatmentProgressData = await response.json();
                    console.log('✅ Detailed treatment data from booking-steps:', treatmentProgressData);
                    
                    if (treatmentProgressData && treatmentProgressData.subServiceDetails) {
                        displayDetailedTreatmentInfo(treatmentProgressData);
                        return;
                    }
                }
            }
        }
        
        // Fallback: Hiển thị với dữ liệu có sẵn hoặc thông báo không có
        if (basicData.treatmentProgress) {
            displayDetailedTreatmentInfo(basicData.treatmentProgress);
        } else {
            showNoDetailedTreatmentInfo();
        }
        
    } catch (error) {
        console.error('❌ Error loading detailed treatment info:', error);
        showNoDetailedTreatmentInfo();
    }
}

// Helper function để tìm booking IDs
async function findBookingIds(medicalRecordData) {
    try {
        if (medicalRecordData.recordId) {
            const response = await fetch(`/api/medical-record-booking/by-record/${medicalRecordData.recordId}`);
            if (response.ok) {
                const bookings = await response.json();
                return bookings.map(b => b.bookId);
            }
        }
        return [];
    } catch (error) {
        console.error('Error finding booking IDs:', error);
        return [];
    }
}

// Function để hiển thị thông tin cơ bản
function displayBasicTreatmentInfo(data) {
    // Cập nhật tên điều trị trên overview cards
    const treatmentNameElements = document.querySelectorAll('.dashboard-treatment-name');
    treatmentNameElements.forEach(element => {
        if (data.serviceName) {
            element.textContent = data.serviceName;
        } else {
            element.textContent = 'Điều trị IVF';
        }
    });

    // Cập nhật thông tin trong sidebar
    updateSidebarTreatmentInfo(data);
    
    // Cập nhật thông tin ngày tiếp theo
    updateNextEventInfo(data);
}

function displayTreatmentInfo(data) {
    // Function này giờ chỉ gọi displayBasicTreatmentInfo
    displayBasicTreatmentInfo(data);
    
    // Chi tiết điều trị sẽ được load riêng trong loadDetailedTreatmentInfo
    if (data.treatmentProgress) {
        updateTreatmentProgress(data.treatmentProgress);
        displayDetailedTreatmentInfo(data.treatmentProgress);
    }
}

// Function để hiển thị khi không có chi tiết điều trị
function showNoDetailedTreatmentInfo() {
    // Cập nhật section chi tiết điều trị với thông báo
    document.getElementById('totalSubServices').textContent = '0';
    document.getElementById('completedSubServices').textContent = '0';
    document.getElementById('pendingSubServices').textContent = '0';
    document.getElementById('inactiveSubServices').textContent = '0';
    document.getElementById('treatmentProgressPercentage').textContent = '0%';
    document.getElementById('treatmentProgressFill').style.width = '0%';
    
    const stepsContent = document.getElementById('treatmentStepsContent');
    if (stepsContent) {
        stepsContent.innerHTML = `
            <div class="treatment-empty">
                <i class="fas fa-clipboard-list"></i>
                <h3>Chưa có chi tiết điều trị</h3>
                <p>Không thể tải chi tiết kế hoạch điều trị. Có thể bệnh nhân chưa có booking hoặc chưa có các bước điều trị được thiết lập.</p>
            </div>
        `;
    }
}

// Function mới để hiển thị thông tin chi tiết điều trị
function displayDetailedTreatmentInfo(progress) {
    // Cập nhật các số liệu thống kê
    document.getElementById('totalSubServices').textContent = progress.totalSubServices || 0;
    document.getElementById('completedSubServices').textContent = progress.completedSubServices || 0;
    document.getElementById('pendingSubServices').textContent = progress.pendingSubServices || 0;
    document.getElementById('inactiveSubServices').textContent = progress.inactiveSubServices || 0;
    
    // Cập nhật progress bar của section chi tiết
    const percentage = progress.progressPercentage || 0;
    document.getElementById('treatmentProgressPercentage').textContent = `${percentage}%`;
    document.getElementById('treatmentProgressFill').style.width = `${percentage}%`;
    
    // Hiển thị các bước điều trị chi tiết
    renderDetailedTreatmentSteps(progress.subServiceDetails || []);
}

// Function để render các bước điều trị chi tiết
function renderDetailedTreatmentSteps(subServiceDetails) {
    const stepsContent = document.getElementById('treatmentStepsContent');
    
    if (!subServiceDetails || subServiceDetails.length === 0) {
        stepsContent.innerHTML = `
            <div class="treatment-empty">
                <i class="fas fa-clipboard-list"></i>
                <h3>Chưa có kế hoạch điều trị</h3>
                <p>Bệnh nhân chưa có kế hoạch điều trị nào được thiết lập.</p>
            </div>
        `;
        return;
    }
    
    let stepsHtml = '';
    
    subServiceDetails.forEach((step, index) => {
        const stepNumber = index + 1;
        let statusClass = '';
        let statusText = '';
        
        switch (step.stepStatus) {
            case 'completed':
                statusClass = 'completed';
                statusText = 'Hoàn thành';
                break;
            case 'pending':
                statusClass = 'current';
                statusText = 'Đang thực hiện';
                break;
            default:
                statusClass = 'pending';
                statusText = 'Chờ thực hiện';
        }
        
        stepsHtml += `
            <div class="treatment-step-item ${statusClass}">
                <div class="treatment-step-number">
                    <div class="step-number">${stepNumber}</div>
                    <div class="step-status-text">${statusText}</div>
                </div>
                <div class="treatment-step-content">
                    <div class="step-name">${step.subName || `Bước ${stepNumber}`}</div>
                    <div class="step-description">${step.subDescription || 'Đang thực hiện theo kế hoạch'}</div>
                    ${step.performedAt ? `<div class="step-date">Thời gian: ${formatDate(step.performedAt)}</div>` : ''}
                    ${step.stepResult ? `<div class="step-result"><strong>Kết quả:</strong> ${formatStepResult(step.stepResult)}</div>` : ''}
                    ${step.stepNote ? `<div class="step-note"><strong>Ghi chú:</strong> ${step.stepNote}</div>` : ''}
                </div>
            </div>
        `;
    });
    
    stepsContent.innerHTML = stepsHtml;
}

function updateTreatmentProgress(progress) {
    // Cập nhật progress bar
    const progressFill = document.querySelector('.progress-fill');
    const progressText = document.getElementById('progress-text');
    
    if (progressFill && progressText) {
        const percentage = progress.progressPercentage || 0;
        progressFill.style.width = `${percentage}%`;
        progressText.textContent = `${percentage}% hoàn thành`;
    }

    // Cập nhật timeline với sub-service details
    if (progress.subServiceDetails && progress.subServiceDetails.length > 0) {
        updateTimelineWithTreatmentSteps(progress.subServiceDetails);
    }

    // Hiển thị thống kê trong phần quick actions hoặc tạo section mới
    displayTreatmentStats(progress);
}

function updateTimelineWithTreatmentSteps(subServiceDetails) {
    const timelineWeek = document.getElementById('timeline-week');
    const timelineLegend = document.getElementById('timeline-legend');
    
    if (!timelineWeek) return;

    // Clear existing timeline
    timelineWeek.innerHTML = '';
    
    // Tạo timeline items từ sub-service details
    let timelineHtml = '<div class="treatment-steps-timeline">';
    
    subServiceDetails.forEach((step, index) => {
        const stepNumber = index + 1;
        let statusClass = '';
        let statusIcon = '';
        
        switch (step.stepStatus) {
            case 'completed':
                statusClass = 'completed';
                statusIcon = '✅';
                break;
            case 'pending':
                statusClass = 'current';
                statusIcon = '🔄';
                break;
            default:
                statusClass = 'upcoming';
                statusIcon = '⏳';
        }
        
        timelineHtml += `
            <div class="timeline-step ${statusClass}">
                <div class="step-marker">
                    <span class="step-number">${stepNumber}</span>
                    <span class="step-icon">${statusIcon}</span>
                </div>
                <div class="step-content">
                    <div class="step-title">${step.subName || `Bước ${stepNumber}`}</div>
                    <div class="step-description">${step.subDescription || 'Đang thực hiện theo kế hoạch'}</div>
                    ${step.performedAt ? `<div class="step-date">${formatDate(step.performedAt)}</div>` : ''}
                </div>
            </div>
        `;
    });
    
    timelineHtml += '</div>';
    timelineWeek.innerHTML = timelineHtml;
    
    // Cập nhật legend
    if (timelineLegend) {
        timelineLegend.innerHTML = `
            <div class="legend-item">
                <span class="legend-dot completed"></span>
                <span>Hoàn thành (${subServiceDetails.filter(s => s.stepStatus === 'completed').length})</span>
            </div>
            <div class="legend-item">
                <span class="legend-dot current"></span>
                <span>Đang thực hiện (${subServiceDetails.filter(s => s.stepStatus === 'pending').length})</span>
            </div>
            <div class="legend-item">
                <span class="legend-dot upcoming"></span>
                <span>Sắp tới (${subServiceDetails.filter(s => s.stepStatus === 'inactive').length})</span>
            </div>
        `;
    }
}

function displayTreatmentStats(progress) {
    // Tìm hoặc tạo section để hiển thị thống kê điều trị
    let statsSection = document.querySelector('.treatment-stats-section');
    
    if (!statsSection) {
        // Tạo section mới nếu chưa có
        statsSection = document.createElement('section');
        statsSection.className = 'treatment-stats-section';
        statsSection.innerHTML = `
            <h3>📊 Thống kê điều trị</h3>
            <div class="stats-grid" id="treatmentStatsGrid"></div>
        `;
        
        // Chèn sau phần overview
        const overviewSection = document.querySelector('.dashboard-overview');
        if (overviewSection && overviewSection.nextSibling) {
            overviewSection.parentNode.insertBefore(statsSection, overviewSection.nextSibling);
        }
    }
    
    const statsGrid = document.getElementById('treatmentStatsGrid');
    if (statsGrid) {
        statsGrid.innerHTML = `
            <div class="stat-card">
                <div class="stat-number">${progress.totalSubServices}</div>
                <div class="stat-label">Tổng bước</div>
                <div class="stat-icon">📋</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${progress.completedSubServices}</div>
                <div class="stat-label">Hoàn thành</div>
                <div class="stat-icon">✅</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${progress.pendingSubServices}</div>
                <div class="stat-label">Đang thực hiện</div>
                <div class="stat-icon">🔄</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${progress.inactiveSubServices}</div>
                <div class="stat-label">Sắp tới</div>
                <div class="stat-icon">⏳</div>
            </div>
        `;
    }
}

function updateSidebarTreatmentInfo(data) {
    // Cập nhật thông tin trong sidebar "Thông tin điều trị"
    const treatmentInfoSidebar = document.getElementById('treatmentInfoSidebar');
    
    if (treatmentInfoSidebar) {
        treatmentInfoSidebar.innerHTML = `
            <div class="info-row">
                <span class="info-label">Tình trạng:</span>
                <span class="info-value">${getStatusText(data.recordStatus)}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Chẩn đoán:</span>
                <span class="info-value">${data.diagnosis || 'Chưa có'}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Bác sĩ phụ trách:</span>
                <span class="info-value">${data.doctorName || 'Chưa xác định'}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Dịch vụ:</span>
                <span class="info-value">${data.serviceName || 'Chưa xác định'}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Ngày bắt đầu:</span>
                <span class="info-value">${formatDate(data.createdAt)}</span>
            </div>
            ${data.dischargeDate ? `
            <div class="info-row">
                <span class="info-label">Ngày dự kiến kết thúc:</span>
                <span class="info-value">${formatDate(data.dischargeDate)}</span>
            </div>` : ''}
        `;
    }
}

function updateNextEventInfo(data) {
    // Tìm sự kiện tiếp theo từ treatmentProgress
    if (data.treatmentProgress && data.treatmentProgress.subServiceDetails) {
        const nextEvent = data.treatmentProgress.subServiceDetails.find(step => 
            step.stepStatus === 'pending' || step.stepStatus === 'inactive'
        );
        
        if (nextEvent) {
            const nextEventDateElements = document.querySelectorAll('.dashboard-next-event-date');
            const nextEventTypeElements = document.querySelectorAll('.dashboard-next-event-type');
            
            nextEventDateElements.forEach(element => {
                if (nextEvent.performedAt) {
                    const date = new Date(nextEvent.performedAt);
                    element.textContent = `${date.getDate()}/${date.getMonth() + 1}`;
                } else {
                    element.textContent = 'TBD';
                }
            });
            
            nextEventTypeElements.forEach(element => {
                element.textContent = nextEvent.subName || 'Sự kiện tiếp theo';
            });
        }
    }
}

function showNoTreatmentInfo() {
    // Hiển thị thông báo không có điều trị active
    const treatmentNameElements = document.querySelectorAll('.dashboard-treatment-name');
    treatmentNameElements.forEach(element => {
        element.textContent = 'Chưa có điều trị';
    });
    
    const nextEventDateElements = document.querySelectorAll('.dashboard-next-event-date');
    const nextEventTypeElements = document.querySelectorAll('.dashboard-next-event-type');
    
    nextEventDateElements.forEach(element => {
        element.textContent = '--';
    });
    
    nextEventTypeElements.forEach(element => {
        element.textContent = 'Chưa có lịch hẹn';
    });
    
    // Cập nhật progress bar
    const progressFill = document.querySelector('.progress-fill');
    const progressText = document.getElementById('progress-text');
    
    if (progressFill && progressText) {
        progressFill.style.width = '0%';
        progressText.textContent = 'Chưa bắt đầu điều trị';
    }
    
    // Cập nhật sidebar
    const treatmentInfoSidebar = document.getElementById('treatmentInfoSidebar');
    if (treatmentInfoSidebar) {
        treatmentInfoSidebar.innerHTML = `
            <div class="info-row">
                <span class="info-label">Tình trạng:</span>
                <span class="info-value">Chưa có điều trị</span>
            </div>
            <div class="info-row">
                <span class="info-label">Chẩn đoán:</span>
                <span class="info-value">Chưa có</span>
            </div>
            <div class="info-row">
                <span class="info-label">Bác sĩ phụ trách:</span>
                <span class="info-value">Chưa có</span>
            </div>
        `;
    }
    
    // Cập nhật section chi tiết điều trị
    document.getElementById('totalSubServices').textContent = '0';
    document.getElementById('completedSubServices').textContent = '0';
    document.getElementById('pendingSubServices').textContent = '0';
    document.getElementById('inactiveSubServices').textContent = '0';
    document.getElementById('treatmentProgressPercentage').textContent = '0%';
    document.getElementById('treatmentProgressFill').style.width = '0%';
    
    const stepsContent = document.getElementById('treatmentStepsContent');
    if (stepsContent) {
        stepsContent.innerHTML = `
            <div class="treatment-empty">
                <i class="fas fa-clipboard-list"></i>
                <h3>Chưa có kế hoạch điều trị</h3>
                <p>Bệnh nhân chưa có kế hoạch điều trị nào được thiết lập.</p>
            </div>
        `;
    }
}

// Helper functions
function getStatusText(status) {
    switch (status) {
        case 'active':
            return 'Đang điều trị';
        case 'closed':
            return 'Đã kết thúc';
        case 'pending':
            return 'Chờ xử lý';
        default:
            return status || 'Không xác định';
    }
}

function formatDate(dateString) {
    if (!dateString) return 'Chưa xác định';
    
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN');
    } catch (error) {
        return 'Ngày không hợp lệ';
    }
}

// Refresh function để có thể gọi từ bên ngoài
window.refreshTreatmentInfo = function() {
    loadActiveTreatmentInfo();
};
