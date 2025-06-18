// Patient data storage
const patientData = {
    mai: {
        name: 'Nguyễn Thị Mai',
        age: 28,
        phone: '0123456789',
        address: 'Hoàng Mai, Hà Nội',
        medicalRecord: {
            diagnosis: 'Hiếm muộn nguyên phát, chuẩn bị IVF chu kỳ 1',
            symptoms: 'Không có thai sau 2 năm kết hôn, chu kỳ kinh đều',
            treatment: 'Kích thích buồng trứng, theo dõi siêu âm định kỳ',
            notes: 'Bệnh nhân hợp tác tốt, tuân thủ điều trị đầy đủ'
        }
    },
    an: {
        name: 'Trần Văn An',
        age: 35,
        phone: '0987654321',
        address: 'Cầu Giấy, Hà Nội',
        medicalRecord: {
            diagnosis: 'Tư vấn hiếm muộn lần đầu',
            symptoms: 'Vợ chồng chưa có con sau 18 tháng kết hôn',
            treatment: 'Tư vấn chế độ sinh hoạt, dinh dưỡng. Hẹn khám lại sau 3 tháng',
            notes: 'Cần theo dõi thêm, có thể cần làm thêm xét nghiệm'
        }
    },
    hoa: {
        name: 'Phạm Thị Hoa',
        age: 30,
        phone: '0456789123',
        address: 'Thanh Xuân, Hà Nội',
        medicalRecord: {
            diagnosis: 'IVF - theo dõi kích thích buồng trứng',
            symptoms: 'Đang trong quá trình kích thích buồng trứng chu kỳ 2',
            treatment: 'Tiêm Gonal-F 225UI/ngày, siêu âm theo dõi',
            notes: 'Phản ứng tốt với thuốc kích thích, dự kiến chọc hút sau 2 ngày'
        }
    },
    lan: {
        name: 'Lê Thị Lan',
        age: 33,
        phone: '0789123456',
        address: 'Đống Đa, Hà Nội',
        medicalRecord: {
            diagnosis: 'IVF chu kỳ 2 - chuẩn bị chuyển phôi',
            symptoms: 'Đã có 3 phôi chất lượng tốt được đông lạnh',
            treatment: 'Chuẩn bị nội mạc tử cung, hẹn chuyển phôi',
            notes: 'Nội mạc tử cung dày 9mm, phù hợp chuyển phôi'
        }
    },
    thu: {
        name: 'Hoàng Thị Thu',
        age: 29,
        phone: '0345678901',
        address: 'Ba Đình, Hà Nội',
        medicalRecord: {
            diagnosis: 'Theo dõi sau phẫu thuật nội soi',
            symptoms: 'Đã phẫu thuật cắt u xơ tử cung 1 tháng trước',
            treatment: 'Theo dõi lành vết thương, tư vấn thời gian có thai',
            notes: 'Vết thương lành tốt, có thể chuẩn bị có thai sau 3 tháng'
        }
    }
};

// Modal functions
function viewPatientRecord(patientId) {
    const patient = patientData[patientId];
    if (!patient) return;

    document.getElementById('patientName').textContent = patient.name;
    document.getElementById('patientAge').textContent = patient.age;
    document.getElementById('patientPhone').textContent = patient.phone;
    document.getElementById('patientAddress').textContent = patient.address;
    
    document.getElementById('diagnosis').value = patient.medicalRecord.diagnosis;
    document.getElementById('symptoms').value = patient.medicalRecord.symptoms;
    document.getElementById('treatment').value = patient.medicalRecord.treatment;
    document.getElementById('notes').value = patient.medicalRecord.notes;

    document.getElementById('patientModal').style.display = 'block';
    
    // Store current patient ID for saving
    document.getElementById('patientModal').dataset.patientId = patientId;
}

function closeModal() {
    document.getElementById('patientModal').style.display = 'none';
}

function savePatientRecord() {
    const patientId = document.getElementById('patientModal').dataset.patientId;
    const patient = patientData[patientId];
    
    if (!patient) return;

    // Update patient record
    patient.medicalRecord.diagnosis = document.getElementById('diagnosis').value;
    patient.medicalRecord.symptoms = document.getElementById('symptoms').value;
    patient.medicalRecord.treatment = document.getElementById('treatment').value;
    patient.medicalRecord.notes = document.getElementById('notes').value;

    // Show success message
    showNotification('Đã lưu thay đổi bệnh án thành công!', 'success');
    
    closeModal();
}

// Patient List Modal functions
function openPatientList() {
    document.getElementById('patientListModal').style.display = 'block';
}

function closePatientListModal() {
    document.getElementById('patientListModal').style.display = 'none';
}

function editPatientFromList(patientId) {
    closePatientListModal();
    viewPatientRecord(patientId);
}

function searchPatients() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const tableBody = document.getElementById('patientTableBody');
    const rows = tableBody.getElementsByTagName('tr');

    for (let i = 0; i < rows.length; i++) {
        const patientName = rows[i].getElementsByTagName('td')[0].textContent.toLowerCase();
        if (patientName.includes(searchTerm)) {
            rows[i].style.display = '';
        } else {
            rows[i].style.display = 'none';
        }
    }
}

// Sidebar functions
function openScheduleManager() {
    showNotification('Chức năng quản lý lịch hẹn sẽ được phát triển sớm!', 'info');
}

function openReports() {
    showNotification('Chức năng báo cáo thống kê sẽ được phát triển sớm!', 'info');
}

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notification
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${getNotificationIcon(type)}"></i>
            <span>${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;

    // Add to body
    document.body.appendChild(notification);

    // Auto remove after 4 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 4000);
}

function getNotificationIcon(type) {
    switch(type) {
        case 'success': return 'fa-check-circle';
        case 'error': return 'fa-exclamation-circle';
        case 'warning': return 'fa-exclamation-triangle';
        default: return 'fa-info-circle';
    }
}

// Close modal when clicking outside
window.onclick = function(event) {
    const patientModal = document.getElementById('patientModal');
    const patientListModal = document.getElementById('patientListModal');
    
    if (event.target === patientModal) {
        closeModal();
    }
    if (event.target === patientListModal) {
        closePatientListModal();
    }
}

// Mobile menu toggle
function toggleMobileMenu() {
    const navLeft = document.querySelector('.nav-left');
    navLeft.style.display = navLeft.style.display === 'flex' ? 'none' : 'flex';
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    // Add click handler for mobile menu
    document.querySelector('.menu-toggle').addEventListener('click', toggleMobileMenu);
    
    // Add current time update
    updateCurrentTime();
    setInterval(updateCurrentTime, 60000); // Update every minute
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Escape to close modals
        if (e.key === 'Escape') {
            closeModal();
            closePatientListModal();
        }
        
        // Ctrl+S to save (when modal is open)
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            const patientModal = document.getElementById('patientModal');
            if (patientModal.style.display === 'block') {
                savePatientRecord();
            }
        }
    });
});

function updateCurrentTime() {
    const now = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit' 
    };
    const dateString = now.toLocaleDateString('vi-VN', options);
    
    const currentDateElement = document.querySelector('.current-date');
    if (currentDateElement) {
        currentDateElement.textContent = dateString;
    }
}

// Add smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add loading animation for buttons
function addLoadingState(button) {
    const originalText = button.textContent;
    button.textContent = 'Đang xử lý...';
    button.disabled = true;
    
    setTimeout(() => {
        button.textContent = originalText;
        button.disabled = false;
    }, 1000);
}

// Enhanced patient search with debouncing
let searchTimeout;
const originalSearchPatients = searchPatients;

searchPatients = function() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(originalSearchPatients, 300);
};

// Add notification styles
const notificationStyles = `
.notification {
    position: fixed;
    top: 90px;
    right: 20px;
    z-index: 1001;
    min-width: 300px;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    animation: slideInRight 0.3s ease;
}

.notification-success {
    background: #10b981;
    color: white;
}

.notification-error {
    background: #ef4444;
    color: white;
}

.notification-warning {
    background: #f59e0b;
    color: white;
}

.notification-info {
    background: #3b82f6;
    color: white;
}

.notification-content {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem 1.25rem;
}

.notification-close {
    background: none;
    border: none;
    color: inherit;
    cursor: pointer;
    margin-left: auto;
    padding: 0.25rem;
    border-radius: 4px;
    opacity: 0.8;
}

.notification-close:hover {
    opacity: 1;
    background: rgba(255, 255, 255, 0.1);
}

@keyframes slideInRight {
    from {
        transform: translateX(100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}
`;

// Add notification styles to head
const styleSheet = document.createElement('style');
styleSheet.textContent = notificationStyles;
document.head.appendChild(styleSheet);
