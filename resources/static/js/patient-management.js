// Patient Management JavaScript
// Dữ liệu bệnh nhân từ database (ví dụ)
const patientsData = [
    {
        id: '1',
        name: 'Trần Anh Thư',
        email: 'thutase180353@fpt.edu.vn',
        phone: '0352020737',
        gender: 'F',
        birthDate: '2004-09-26',
        address: 'HCMC',
        occupation: 'Con sen',
        emergencyContact: 'Mơ',
        hasService: true,
        registeredDate: '2024-09-26',
        lastVisit: '2024-12-15',
        status: 'active',
        provider: 'local',
        currentServices: ['Liệu trình điều trị IVF']
    }
];

// Global variables
let filteredPatients = [...patientsData];

// Utility Functions
function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('vi-VN');
}

function calculateAge(birthDate) {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    
    return age;
}

// Main Functions
function loadPatients() {
    renderPatientsTable();
    updatePatientsSummary();
    initPatientFilters();
}

function renderPatientsTable() {
    const tbody = document.getElementById('patientsTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = filteredPatients.map(patient => `
        <tr>
            <td>
                <div class="patient-info">
                    <div class="patient-avatar">
                        ${patient.name.charAt(0).toUpperCase()}
                    </div>
                    <div class="patient-details">
                        <h4>${patient.name}</h4>
                        <p>ID: ${patient.id} • ${calculateAge(patient.birthDate)} tuổi • ${patient.gender === 'F' ? 'Nữ' : 'Nam'}</p>
                    </div>
                </div>
            </td>
            <td>
                <div class="contact-info">
                    <p><i class="fas fa-envelope"></i> ${patient.email}</p>
                    <p><i class="fas fa-phone"></i> ${patient.phone}</p>
                    <p><i class="fas fa-map-marker-alt"></i> ${patient.address}</p>
                </div>
            </td>
            <td>
                <div class="service-status">
                    <span class="status-badge ${patient.hasService ? 'with-service' : 'without-service'}">
                        ${patient.hasService ? 'Có dịch vụ' : 'Chưa có dịch vụ'}
                    </span>
                    ${patient.hasService ? `
                        <div class="service-list">
                            ${patient.currentServices.map(service => 
                                `<span class="service-tag">${service}</span>`
                            ).join('')}
                        </div>
                    ` : ''}
                </div>
            </td>
            <td>
                <div class="date-info">
                    <p><strong>${formatDate(patient.registeredDate)}</strong></p>
                    ${patient.lastVisit ? `
                        <p class="last-visit">Khám cuối: ${formatDate(patient.lastVisit)}</p>
                    ` : ''}
                </div>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn view" onclick="viewPatient('${patient.id}')" title="Xem chi tiết">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function updatePatientsSummary() {
    document.getElementById('totalPatientsCount').textContent = filteredPatients.length;
    document.getElementById('withServiceCount').textContent = filteredPatients.filter(p => p.hasService).length;
    document.getElementById('withoutServiceCount').textContent = filteredPatients.filter(p => !p.hasService).length;
    document.getElementById('activeCount').textContent = filteredPatients.filter(p => p.status === 'active').length;
}

function initPatientFilters() {
    const searchInput = document.getElementById('patientSearch');
    const serviceFilter = document.getElementById('serviceFilter');
    
    if (searchInput) {
        searchInput.addEventListener('input', filterPatients);
    }
    if (serviceFilter) {
        serviceFilter.addEventListener('change', filterPatients);
    }
}

function filterPatients() {
    const searchTerm = document.getElementById('patientSearch')?.value.toLowerCase() || '';
    const serviceFilter = document.getElementById('serviceFilter')?.value || 'all';
    
    filteredPatients = patientsData.filter(patient => {
        const matchesSearch = patient.name.toLowerCase().includes(searchTerm) ||
                             patient.email.toLowerCase().includes(searchTerm) ||
                             patient.phone.includes(searchTerm);
                             
        const matchesService = serviceFilter === 'all' ||
                              (serviceFilter === 'withService' && patient.hasService) ||
                              (serviceFilter === 'withoutService' && !patient.hasService);
        
        return matchesSearch && matchesService;
    });
    
    renderPatientsTable();
    updatePatientsSummary();
}

// Action Functions
function viewPatient(patientId) {
    const patient = patientsData.find(p => p.id === patientId);
    if (!patient) return;
    
    // Create and show modal
    const modal = createPatientModal(patient);
    document.body.appendChild(modal);
    
    // Show modal with animation
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
}

function createPatientModal(patient) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'patientDetailModal';
    
    modal.innerHTML = `
        <div class="modal-content large">
            <div class="modal-header">
                <h3><i class="fas fa-user"></i> Chi tiết bệnh nhân</h3>
                <button class="modal-close" onclick="closePatientModal()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="patient-detail-grid">
                    <div class="detail-item">
                        <div class="detail-label">Họ và tên</div>
                        <div class="detail-value">${patient.name}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Email</div>
                        <div class="detail-value">${patient.email}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Số điện thoại</div>
                        <div class="detail-value">${patient.phone}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Tuổi</div>
                        <div class="detail-value">${calculateAge(patient.birthDate)} tuổi</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Giới tính</div>
                        <div class="detail-value">${patient.gender === 'F' ? 'Nữ' : 'Nam'}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Địa chỉ</div>
                        <div class="detail-value">${patient.address}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Nghề nghiệp</div>
                        <div class="detail-value">${patient.occupation}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Liên hệ khẩn cấp</div>
                        <div class="detail-value">${patient.emergencyContact}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Ngày đăng ký</div>
                        <div class="detail-value">${formatDate(patient.registeredDate)}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Trạng thái dịch vụ</div>
                        <div class="detail-value">
                            <span class="status-badge ${patient.hasService ? 'with-service' : 'without-service'}">
                                ${patient.hasService ? 'Có dịch vụ' : 'Chưa có dịch vụ'}
                            </span>
                        </div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Trạng thái hoạt động</div>
                        <div class="detail-value">
                            <span class="status-badge ${patient.status}">
                                ${patient.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                            </span>
                        </div>
                    </div>
                    ${patient.lastVisit ? `
                        <div class="detail-item">
                            <div class="detail-label">Lần khám cuối</div>
                            <div class="detail-value">${formatDate(patient.lastVisit)}</div>
                        </div>
                    ` : ''}
                </div>
                
                ${patient.hasService && patient.currentServices.length > 0 ? `
                    <div class="services-section">
                        <h4><i class="fas fa-medical-bag"></i> Dịch vụ hiện tại</h4>
                        <div class="services-list">
                            ${patient.currentServices.map(service => 
                                `<span class="service-tag large">${service}</span>`
                            ).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closePatientModal()">Đóng</button>
            </div>
        </div>
    `;
    
    // Close modal when clicking outside
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closePatientModal();
        }
    });
    
    return modal;
}

function closePatientModal() {
    const modal = document.getElementById('patientDetailModal');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.remove();
        }, 300);
    }
}




// Close modal with Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closePatientModal();
    }
});

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    loadPatients();
}); 