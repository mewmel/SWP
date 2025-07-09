// Real Data from Database
const mockPatients = [
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
        provider: 'local'
    }
];

const mockDoctors = [
    {
        id: '1',
        name: 'Nguyễn Ngọc Khánh Linh',
        email: 'doc1@gmail.com',
        phone: '123',
        expertise: 'Khám, tư vấn và thực hiện các kỹ thuật điều trị vô sinh – hiếm muộn, hỗ trợ sinh sản',
        degree: 'Tiến sĩ Sản Phụ khoa',
        description: 'Tiến sĩ Nguyễn Ngọc Khánh Linh là chuyên gia về kiểm soát chất lượng phôi và thụ tinh trong ống nghiệm, với hơn 12 năm công tác tại các trung tâm sinh sản hàng đầu.',
        status: 'active',
        createdDate: '2024-01-01'
    },
    {
        id: '2',
        name: 'Trương Quốc Lập',
        email: 'doc2@gmail.com',
        phone: '345',
        expertise: 'Khám, tư vấn và thực hiện các kỹ thuật điều trị vô sinh – hiếm muộn - Thụ tinh nhân tạo - IUI',
        degree: 'Bác sĩ Chuyên khoa I Sản Phụ khoa',
        description: 'Bác sĩ Trương Quốc Lập có 8 năm kinh nghiệm trong lĩnh vực IUI, đã hỗ trợ thành công nhiều cặp vợ chồng trên toàn quốc.',
        status: 'active',
        createdDate: '2024-01-01'
    },
    {
        id: '3',
        name: 'Tất Vĩnh Hùng',
        email: 'doc3@gmail.com',
        phone: '567',
        expertise: 'Khám, tư vấn và thực hiện các kỹ thuật điều trị vô sinh – hiếm muộn - IVF',
        degree: 'Thạc sĩ Sản Phụ khoa',
        description: 'Bác sĩ Tất Vĩnh Hùng có hơn 10 năm kinh nghiệm điều trị vô sinh – hiếm muộn, chuyên sâu về IVF tại các trung tâm hàng đầu.',
        status: 'active',
        createdDate: '2024-01-01'
    },
    {
        id: '4',
        name: 'Phạm Thị Hồng Anh',
        email: 'doc4@gmail.com',
        phone: '789',
        expertise: 'Khám, tư vấn và thực hiện các kỹ thuật điều trị vô sinh – hiếm muộn, hỗ trợ sinh sản',
        degree: 'Bác sĩ Chuyên khoa II Sản Phụ khoa',
        description: 'Bác sĩ Phạm Thị Hồng Anh là chuyên gia về thụ tinh trong ống nghiệm và hỗ trợ sinh sản, với 7 năm kinh nghiệm tại các trung tâm hỗ trợ sinh sản uy tín.',
        status: 'active',
        createdDate: '2024-01-01'
    },
    {
        id: '5',
        name: 'Lê Minh Đức',
        email: 'doc5@gmail.com',
        phone: '890',
        expertise: 'Khám, tư vấn và thực hiện các kỹ thuật điều trị vô sinh – hiếm muộn, hỗ trợ sinh sản',
        degree: 'Thạc sĩ Sản Phụ khoa',
        description: 'Bác sĩ Lê Minh Đức chuyên sâu về điều trị vô sinh – hiếm muộn và hỗ trợ sinh sản, với 5 năm kinh nghiệm làm việc tại các bệnh viện đầu ngành.',
        status: 'active',
        createdDate: '2024-01-01'
    },
    {
        id: '6',
        name: 'Trần Thị Tú',
        email: 'doc6@gmail.com',
        phone: '901',
        expertise: 'Khám, tư vấn và thực hiện các kỹ thuật điều trị vô sinh – hiếm muộn, hỗ trợ sinh sản',
        degree: 'Tiến sĩ Sinh học Phôi',
        description: 'Bác sĩ Trần Thị Tú là chuyên gia về kiểm soát chất lượng phôi và thụ tinh trong ống nghiệm, với hơn 8 năm kinh nghiệm tại các trung tâm hàng đầu.',
        status: 'active',
        createdDate: '2024-01-01'
    }
];

const mockManagers = [
    {
        id: '1',
        name: 'manager1',
        email: 'manager1@gmail.com',
        phone: '0123456789',
        position: 'tanker',
        role: 'manager',
        permissions: ['user_management', 'service_management', 'report_access'],
        status: 'active',
        createdDate: '2024-01-01'
    },
    {
        id: '2',
        name: 'admin1',
        email: 'admin1@gmail.com',
        phone: '0123456789',
        position: 'ad',
        role: 'admin',
        permissions: ['user_management', 'service_management', 'report_access', 'system_config'],
        status: 'active',
        createdDate: '2024-01-01'
    }
];

const mockServices = [
    {
        id: '1',
        name: 'Khám tiền đăng ký điều trị (IVF/IUI)',
        description: 'Tư vấn chuyên sâu và chẩn đoán tình trạng sinh sản, xác định phương án điều trị phù hợp cho cả nam và nữ',
        duration: 7, // duration in days
        price: 3100000,
        category: 'Tư vấn',
        isActive: true,
        createdDate: '2024-01-01'
    },
    {
        id: '2',
        name: 'Liệu trình điều trị IVF',
        description: 'Quy trình thụ tinh trong ống nghiệm: kích thích buồng trứng, chọc hút noãn, thụ tinh và chuyển phôi',
        duration: 30, // duration in days
        price: 20700000,
        category: 'IVF',
        isActive: true,
        createdDate: '2024-01-01'
    },
    {
        id: '3',
        name: 'Liệu trình điều trị IUI',
        description: 'Quy trình bơm tinh trùng vào buồng tử cung, tối ưu tỉ lệ thụ thai tự nhiên',
        duration: 30, // duration in days
        price: 3750000,
        category: 'IUI',
        isActive: true,
        createdDate: '2024-01-01'
    }
];

const mockAppointments = [
    {
        id: '1',
        patientName: 'Nguyễn Thị Mai',
        serviceName: 'Khám định kỳ - IVF',
        time: '08:00',
        status: 'scheduled'
    },
    {
        id: '2',
        patientName: 'Trần Văn An',
        serviceName: 'Tư vấn lần đầu',
        time: '09:30',
        status: 'scheduled'
    },
    {
        id: '3',
        patientName: 'Phạm Thị Hoa',
        serviceName: 'Theo dõi kích thích - IVF',
        time: '10:00',
        status: 'completed'
    },
    {
        id: '4',
        patientName: 'Lê Thị Lan',
        serviceName: 'Chuyên phỏi - IVF',
        time: '11:30',
        status: 'scheduled'
    },
    {
        id: '5',
        patientName: 'Hoàng Thị Thu',
        serviceName: 'Kiểm tra sau phẫu thuật',
        time: '14:00',
        status: 'scheduled'
    }
];

// Global Variables
let patients = JSON.parse(localStorage.getItem('patients')) || mockPatients;
let doctors = JSON.parse(localStorage.getItem('doctors')) || mockDoctors;
let managers = JSON.parse(localStorage.getItem('managers')) || mockManagers;
let services = JSON.parse(localStorage.getItem('services')) || mockServices;
let currentEditingService = null;
let currentEditingDoctor = null;
let currentEditingManager = null;
let filteredPatients = [...patients];
let filteredDoctors = [...doctors];
let filteredManagers = [...managers];
let filteredServices = [...services];

// Utility Functions
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('vi-VN');
}

function formatDuration(days) {
    if (days === 1) {
        return `${days} ngày`;
    }
    return `${days} ngày`;
}

function saveToLocalStorage() {
    localStorage.setItem('patients', JSON.stringify(patients));
    localStorage.setItem('doctors', JSON.stringify(doctors));
    localStorage.setItem('managers', JSON.stringify(managers));
    localStorage.setItem('services', JSON.stringify(services));
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const icon = toast.querySelector('.toast-icon');
    const messageEl = toast.querySelector('.toast-message');
    
    // Set icon based on type
    const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
    };
    
    icon.className = `toast-icon ${icons[type]}`;
    messageEl.textContent = message;
    toast.className = `toast ${type} show`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Navigation Functions
function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const dropdownItems = document.querySelectorAll('.dropdown-item');
    const tabContents = document.querySelectorAll('.tab-content');
    
    // Handle main nav items
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            const tabId = item.getAttribute('data-tab');
            if (tabId && tabId !== 'accounts') {
                e.preventDefault();
                
                // Update active nav item
                navItems.forEach(nav => nav.classList.remove('active'));
                dropdownItems.forEach(dropdown => dropdown.classList.remove('active'));
                item.classList.add('active');
                
                // Update active tab content
                tabContents.forEach(tab => tab.classList.remove('active'));
                document.getElementById(tabId).classList.add('active');
                
                // Load tab-specific content
                loadTabContent(tabId);
            }
        });
    });
    
    // Handle dropdown items
    dropdownItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const tabId = item.getAttribute('data-tab');
            
            // Update active states
            navItems.forEach(nav => nav.classList.remove('active'));
            dropdownItems.forEach(dropdown => dropdown.classList.remove('active'));
            item.classList.add('active');
            
            // Add active state to parent nav item
            const parentNavItem = document.querySelector('.nav-item[data-tab="accounts"]');
            if (parentNavItem) {
                parentNavItem.classList.add('active');
            }
            
            // Update active tab content
            tabContents.forEach(tab => tab.classList.remove('active'));
            document.getElementById(tabId).classList.add('active');
            
            // Load tab-specific content
            loadTabContent(tabId);
        });
    });
    
    // Load initial content
    loadTabContent('dashboard');
}

function loadTabContent(tabId) {
    switch(tabId) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'customer-accounts':
            loadPatients();
            break;
        case 'doctor-accounts':
            loadDoctors();
            break;
        case 'manager-accounts':
            loadManagers();
            break;
        case 'services':
            loadServices();
            break;
        case 'reports':
            loadReports();
            break;
    }
}

// Dashboard Functions
function loadDashboard() {
    loadSchedule();
}

function loadSchedule() {
    const scheduleList = document.getElementById('scheduleList');
    if (!scheduleList) return;
    
    scheduleList.innerHTML = mockAppointments.map(appointment => `
        <div class="schedule-item ${appointment.status}">
            <div class="schedule-info">
                <div class="schedule-time">${appointment.time}</div>
                <div class="schedule-details">
                    <h4>BN: ${appointment.patientName}</h4>
                    <p>${appointment.serviceName}</p>
                </div>
            </div>
            <div class="schedule-status ${appointment.status}">
                ${appointment.status === 'completed' ? 'Hoàn thành' :
                  appointment.status === 'cancelled' ? 'Đã hủy' : 'Đã lên lịch'}
            </div>
        </div>
    `).join('');
}

// Patient Functions
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
                        <p>ID: ${patient.id}</p>
                    </div>
                </div>
            </td>
            <td>
                <div class="contact-info">
                    <p>${patient.email}</p>
                    <p>${patient.phone}</p>
                </div>
            </td>
            <td>
                <span class="status-badge ${patient.hasService ? 'with-service' : 'without-service'}">
                    ${patient.hasService ? 'Có dịch vụ' : 'Chưa có dịch vụ'}
                </span>
            </td>
            <td>
                <div>
                    ${formatDate(patient.registeredDate)}
                    ${patient.lastVisit ? `<div style="font-size: 12px; color: #64748b; margin-top: 2px;">Khám cuối: ${formatDate(patient.lastVisit)}</div>` : ''}
                </div>
            </td>
            
            <td>
                <div class="action-buttons">
                    <button class="action-btn view" onclick="viewPatient('${patient.id}')" title="Xem chi tiết">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn delete" onclick="deletePatient('${patient.id}')" title="Xóa">
                        <i class="fas fa-trash"></i>
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
    const statusFilter = document.getElementById('statusFilter');
    const serviceFilter = document.getElementById('serviceFilter');
    
    if (searchInput) {
        searchInput.addEventListener('input', filterPatients);
    }
    if (statusFilter) {
        statusFilter.addEventListener('change', filterPatients);
    }
    if (serviceFilter) {
        serviceFilter.addEventListener('change', filterPatients);
    }
}

function filterPatients() {
    const searchTerm = document.getElementById('patientSearch')?.value.toLowerCase() || '';
    const statusFilter = document.getElementById('statusFilter')?.value || 'all';
    const serviceFilter = document.getElementById('serviceFilter')?.value || 'all';
    
    filteredPatients = patients.filter(patient => {
        const matchesSearch = patient.name.toLowerCase().includes(searchTerm) ||
                             patient.email.toLowerCase().includes(searchTerm);
        const matchesStatus = statusFilter === 'all' || patient.status === statusFilter;
        const matchesService = serviceFilter === 'all' ||
                              (serviceFilter === 'withService' && patient.hasService) ||
                              (serviceFilter === 'withoutService' && !patient.hasService);
        
        return matchesSearch && matchesStatus && matchesService;
    });
    
    renderPatientsTable();
    updatePatientsSummary();
}



function viewPatient(patientId) {
    const patient = patients.find(p => p.id === patientId);
    if (!patient) return;
    
    const modal = document.getElementById('patientDetailModal');
    const content = document.getElementById('patientDetailContent');
    
    content.innerHTML = `
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
    `;
    
    modal.classList.add('show');
}

function closePatientDetailModal() {
    const modal = document.getElementById('patientDetailModal');
    modal.classList.remove('show');
}

function deletePatient(patientId) {
    if (confirm('Bạn có chắc chắn muốn xóa bệnh nhân này?')) {
        patients = patients.filter(p => p.id !== patientId);
        saveToLocalStorage();
        filterPatients();
        showToast('Đã xóa bệnh nhân thành công');
    }
}

// Doctor Functions
function loadDoctors() {
    renderDoctorsTable();
    updateDoctorsSummary();
    initDoctorFilters();
}

function renderDoctorsTable() {
    const tbody = document.getElementById('doctorsTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = filteredDoctors.map(doctor => `
        <tr>
            <td>
                <div class="patient-info">
                    <div class="patient-avatar">
                        ${doctor.name.charAt(0).toUpperCase()}
                    </div>
                    <div class="patient-details">
                        <h4>${doctor.name}</h4>
                        <p>ID: ${doctor.id}</p>
                    </div>
                </div>
            </td>
            <td>
                <div class="contact-info">
                    <p>${doctor.email}</p>
                    <p>${doctor.phone}</p>
                </div>
            </td>
            <td>
                <div>
                    <strong>${doctor.degree}</strong>
                    <div style="font-size: 12px; color: #64748b; margin-top: 2px;">${doctor.expertise}</div>
                </div>
            </td>
            <td>
                <span class="status-badge ${doctor.status}">
                    ${doctor.status === 'active' ? 'Hoạt động' : 'Tạm khóa'}
                </span>
            </td>
            <td>${formatDate(doctor.createdDate)}</td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn view" onclick="viewDoctor('${doctor.id}')" title="Xem chi tiết">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn edit" onclick="editDoctor('${doctor.id}')" title="Chỉnh sửa">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete" onclick="deleteDoctor('${doctor.id}')" title="Xóa">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function updateDoctorsSummary() {
    document.getElementById('totalDoctorsCount').textContent = filteredDoctors.length;
    document.getElementById('activeDoctorsCount').textContent = filteredDoctors.filter(d => d.status === 'active').length;
    document.getElementById('inactiveDoctorsCount').textContent = filteredDoctors.filter(d => d.status === 'inactive').length;
    
    // Calculate new doctors this month
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const newDoctorsThisMonth = filteredDoctors.filter(d => {
        const createdDate = new Date(d.createdDate);
        return createdDate.getMonth() === currentMonth && createdDate.getFullYear() === currentYear;
    }).length;
    document.getElementById('newDoctorsCount').textContent = newDoctorsThisMonth;
}

function initDoctorFilters() {
    const searchInput = document.getElementById('doctorSearch');
    const statusFilter = document.getElementById('doctorStatusFilter');
    
    if (searchInput) {
        searchInput.addEventListener('input', filterDoctors);
    }
    if (statusFilter) {
        statusFilter.addEventListener('change', filterDoctors);
    }
}

function filterDoctors() {
    const searchTerm = document.getElementById('doctorSearch')?.value.toLowerCase() || '';
    const statusFilter = document.getElementById('doctorStatusFilter')?.value || 'all';
    
    filteredDoctors = doctors.filter(doctor => {
        const matchesSearch = doctor.name.toLowerCase().includes(searchTerm) ||
                             doctor.email.toLowerCase().includes(searchTerm) ||
                             doctor.expertise.toLowerCase().includes(searchTerm);
        const matchesStatus = statusFilter === 'all' || doctor.status === statusFilter;
        
        return matchesSearch && matchesStatus;
    });
    
    renderDoctorsTable();
    updateDoctorsSummary();
}

function viewDoctor(doctorId) {
    const doctor = doctors.find(d => d.id === doctorId);
    if (!doctor) return;
    
    const modal = document.getElementById('patientDetailModal');
    const content = document.getElementById('patientDetailContent');
    const title = modal.querySelector('.modal-header h3');
    
    title.textContent = 'Chi tiết bác sĩ';
    
    content.innerHTML = `
        <div class="patient-detail-grid">
            <div class="detail-item">
                <div class="detail-label">Họ và tên</div>
                <div class="detail-value">${doctor.name}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Email</div>
                <div class="detail-value">${doctor.email}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Số điện thoại</div>
                <div class="detail-value">${doctor.phone}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Bằng cấp</div>
                <div class="detail-value">${doctor.degree}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Chuyên môn</div>
                <div class="detail-value">${doctor.expertise}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Trạng thái</div>
                <div class="detail-value">
                    <span class="status-badge ${doctor.status}">
                        ${doctor.status === 'active' ? 'Hoạt động' : 'Tạm khóa'}
                    </span>
                </div>
            </div>
            <div class="detail-item" style="grid-column: 1 / -1;">
                <div class="detail-label">Mô tả</div>
                <div class="detail-value">${doctor.description}</div>
            </div>
        </div>
    `;
    
    modal.classList.add('show');
}

function editDoctor(doctorId) {
    // Implementation for editing doctor
    showToast('Chức năng chỉnh sửa bác sĩ đang được phát triển', 'info');
}

function deleteDoctor(doctorId) {
    if (confirm('Bạn có chắc chắn muốn xóa bác sĩ này?')) {
        doctors = doctors.filter(d => d.id !== doctorId);
        saveToLocalStorage();
        filterDoctors();
        showToast('Đã xóa bác sĩ thành công');
    }
}

// Manager Functions
function loadManagers() {
    renderManagersTable();
    updateManagersSummary();
    initManagerFilters();
}

function renderManagersTable() {
    const tbody = document.getElementById('managersTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = filteredManagers.map(manager => `
        <tr>
            <td>
                <div class="patient-info">
                    <div class="patient-avatar">
                        ${manager.name.charAt(0).toUpperCase()}
                    </div>
                    <div class="patient-details">
                        <h4>${manager.name}</h4>
                        <p>ID: ${manager.id}</p>
                    </div>
                </div>
            </td>
            <td>
                <div class="contact-info">
                    <p>${manager.email}</p>
                    <p>${manager.phone}</p>
                </div>
            </td>
            <td>
                <span class="status-badge category">
                    ${manager.role === 'admin' ? 'Quản trị viên' : 
                      manager.role === 'manager' ? 'Quản lý' : 'Giám sát'}
                </span>
            </td>
            <td>
                <div style="font-size: 12px;">
                    ${manager.permissions.map(perm => {
                        const permLabels = {
                            'user_management': 'Quản lý người dùng',
                            'service_management': 'Quản lý dịch vụ',
                            'report_access': 'Xem báo cáo',
                            'system_config': 'Cấu hình hệ thống'
                        };
                        return permLabels[perm] || perm;
                    }).join('<br>')}
                </div>
            </td>
            <td>
                <span class="status-badge ${manager.status}">
                    ${manager.status === 'active' ? 'Hoạt động' : 'Tạm khóa'}
                </span>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn view" onclick="viewManager('${manager.id}')" title="Xem chi tiết">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn edit" onclick="editManager('${manager.id}')" title="Chỉnh sửa">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete" onclick="deleteManager('${manager.id}')" title="Xóa">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function updateManagersSummary() {
    document.getElementById('totalManagersCount').textContent = filteredManagers.length;
    document.getElementById('adminCount').textContent = filteredManagers.filter(m => m.role === 'admin').length;
    document.getElementById('managerCount').textContent = filteredManagers.filter(m => m.role === 'manager').length;
    document.getElementById('supervisorCount').textContent = filteredManagers.filter(m => m.role === 'supervisor').length;
}

function initManagerFilters() {
    const searchInput = document.getElementById('managerSearch');
    const roleFilter = document.getElementById('managerRoleFilter');
    
    if (searchInput) {
        searchInput.addEventListener('input', filterManagers);
    }
    if (roleFilter) {
        roleFilter.addEventListener('change', filterManagers);
    }
}

function filterManagers() {
    const searchTerm = document.getElementById('managerSearch')?.value.toLowerCase() || '';
    const roleFilter = document.getElementById('managerRoleFilter')?.value || 'all';
    
    filteredManagers = managers.filter(manager => {
        const matchesSearch = manager.name.toLowerCase().includes(searchTerm) ||
                             manager.email.toLowerCase().includes(searchTerm);
        const matchesRole = roleFilter === 'all' || manager.role === roleFilter;
        
        return matchesSearch && matchesRole;
    });
    
    renderManagersTable();
    updateManagersSummary();
}

function viewManager(managerId) {
    const manager = managers.find(m => m.id === managerId);
    if (!manager) return;
    
    const modal = document.getElementById('patientDetailModal');
    const content = document.getElementById('patientDetailContent');
    const title = modal.querySelector('.modal-header h3');
    
    title.textContent = 'Chi tiết quản lý';
    
    content.innerHTML = `
        <div class="patient-detail-grid">
            <div class="detail-item">
                <div class="detail-label">Họ và tên</div>
                <div class="detail-value">${manager.name}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Email</div>
                <div class="detail-value">${manager.email}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Số điện thoại</div>
                <div class="detail-value">${manager.phone}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Chức vụ</div>
                <div class="detail-value">${manager.position}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Vai trò</div>
                <div class="detail-value">
                    <span class="status-badge category">
                        ${manager.role === 'admin' ? 'Quản trị viên' : 
                          manager.role === 'manager' ? 'Quản lý' : 'Giám sát'}
                    </span>
                </div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Trạng thái</div>
                <div class="detail-value">
                    <span class="status-badge ${manager.status}">
                        ${manager.status === 'active' ? 'Hoạt động' : 'Tạm khóa'}
                    </span>
                </div>
            </div>
            <div class="detail-item" style="grid-column: 1 / -1;">
                <div class="detail-label">Quyền hạn</div>
                <div class="detail-value">
                    ${manager.permissions.map(perm => {
                        const permLabels = {
                            'user_management': 'Quản lý người dùng',
                            'service_management': 'Quản lý dịch vụ',
                            'report_access': 'Xem báo cáo',
                            'system_config': 'Cấu hình hệ thống'
                        };
                        return `<span class="status-badge category" style="margin-right: 5px; margin-bottom: 5px;">${permLabels[perm] || perm}</span>`;
                    }).join('')}
                </div>
            </div>
        </div>
    `;
    
    modal.classList.add('show');
}

function editManager(managerId) {
    // Implementation for editing manager
    showToast('Chức năng chỉnh sửa quản lý đang được phát triển', 'info');
}

function deleteManager(managerId) {
    if (confirm('Bạn có chắc chắn muốn xóa quản lý này?')) {
        managers = managers.filter(m => m.id !== managerId);
        saveToLocalStorage();
        filterManagers();
        showToast('Đã xóa quản lý thành công');
    }
}

// Service Functions
function loadServices() {
    renderServicesTable();
    updateServicesSummary();
    initServiceFilters();
}

function renderServicesTable() {
    const tbody = document.getElementById('servicesTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = filteredServices.map(service => `
        <tr>
            <td>
                <div class="service-info">
                    <h4>${service.name}</h4>
                    <p>${service.description}</p>
                </div>
            </td>
            <td>
                <span class="status-badge category">${service.category}</span>
            </td>
            <td>${formatDuration(service.duration)}</td>
            <td><strong>${formatCurrency(service.price)}</strong></td>
            
            <td>
                <div class="action-buttons">
                    <button class="action-btn edit" onclick="editService('${service.id}')" title="Chỉnh sửa">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete" onclick="deleteService('${service.id}')" title="Xóa">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function updateServicesSummary() {
    const categories = [...new Set(filteredServices.map(s => s.category))];
    const averagePrice = filteredServices.length > 0 
        ? filteredServices.reduce((sum, s) => sum + s.price, 0) / filteredServices.length 
        : 0;
    
    document.getElementById('totalServicesCount').textContent = filteredServices.length;
    document.getElementById('activeServicesCount').textContent = filteredServices.filter(s => s.isActive).length;
    document.getElementById('categoriesCount').textContent = categories.length;
    document.getElementById('averagePrice').textContent = formatCurrency(averagePrice);
}

function initServiceFilters() {
    const searchInput = document.getElementById('serviceSearch');
    const categoryFilter = document.getElementById('categoryFilter');
    const statusFilter = document.getElementById('serviceStatusFilter');
    
    if (searchInput) {
        searchInput.addEventListener('input', filterServices);
    }
    if (categoryFilter) {
        categoryFilter.addEventListener('change', filterServices);
    }
    if (statusFilter) {
        statusFilter.addEventListener('change', filterServices);
    }
}

function filterServices() {
    const searchTerm = document.getElementById('serviceSearch')?.value.toLowerCase() || '';
    const categoryFilter = document.getElementById('categoryFilter')?.value || 'all';
    const statusFilter = document.getElementById('serviceStatusFilter')?.value || 'all';
    
    filteredServices = services.filter(service => {
        const matchesSearch = service.name.toLowerCase().includes(searchTerm) ||
                             service.description.toLowerCase().includes(searchTerm);
        const matchesCategory = categoryFilter === 'all' || service.category === categoryFilter;
        const matchesStatus = statusFilter === 'all' ||
                             (statusFilter === 'active' && service.isActive) ||
                             (statusFilter === 'inactive' && !service.isActive);
        
        return matchesSearch && matchesCategory && matchesStatus;
    });
    
    renderServicesTable();
    updateServicesSummary();
}

function openServiceModal(serviceId = null) {
    const modal = document.getElementById('serviceModal');
    const title = document.getElementById('serviceModalTitle');
    const submitBtn = document.getElementById('serviceSubmitBtn');
    
    currentEditingService = serviceId ? services.find(s => s.id === serviceId) : null;
    
    if (currentEditingService) {
        title.textContent = 'Chỉnh sửa dịch vụ';
        submitBtn.textContent = 'Cập nhật';
        
        // Fill form with service data
        document.getElementById('serviceName').value = currentEditingService.name;
        document.getElementById('serviceDescription').value = currentEditingService.description;
        document.getElementById('serviceDuration').value = currentEditingService.duration;
        document.getElementById('servicePrice').value = currentEditingService.price;
        document.getElementById('serviceCategory').value = currentEditingService.category;
        document.getElementById('serviceIsActive').checked = currentEditingService.isActive;
    } else {
        title.textContent = 'Thêm dịch vụ mới';
        submitBtn.textContent = 'Thêm mới';
        
        // Clear form
        document.getElementById('serviceForm').reset();
        document.getElementById('serviceIsActive').checked = true;
    }
    
    modal.classList.add('show');
}

function closeServiceModal() {
    const modal = document.getElementById('serviceModal');
    modal.classList.remove('show');
    currentEditingService = null;
}

function editService(serviceId) {
    openServiceModal(serviceId);
}

function deleteService(serviceId) {
    if (confirm('Bạn có chắc chắn muốn xóa dịch vụ này?')) {
        services = services.filter(s => s.id !== serviceId);
        saveToLocalStorage();
        filterServices();
        showToast('Đã xóa dịch vụ thành công');
    }
}

function toggleServiceStatus(serviceId) {
    const service = services.find(s => s.id === serviceId);
    if (service) {
        service.isActive = !service.isActive;
        saveToLocalStorage();
        filterServices();
        showToast(`Đã ${service.isActive ? 'kích hoạt' : 'vô hiệu hóa'} dịch vụ`);
    }
}

// Reports Functions
function loadReports() {
    initReportTabs();
    loadReportContent('overview');
}

function initReportTabs() {
    const reportTabs = document.querySelectorAll('.report-tab');
    
    reportTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const reportType = tab.getAttribute('data-report');
            
            // Update active tab
            reportTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Load report content
            loadReportContent(reportType);
        });
    });
}

function loadReportContent(reportType) {
    const content = document.getElementById('reportContent');
    if (!content) return;
    
    switch(reportType) {
        case 'overview':
            content.innerHTML = generateOverviewReport();
            break;
        case 'patients':
            content.innerHTML = generatePatientsReport();
            break;
        case 'services':
            content.innerHTML = generateServicesReport();
            break;
        case 'financial':
            content.innerHTML = generateFinancialReport();
            break;
    }
}

function generateOverviewReport() {
    const totalPatients = patients.length;
    const activePatients = patients.filter(p => p.status === 'active').length;
    const totalAppointments = mockAppointments.length;
    const completedAppointments = mockAppointments.filter(a => a.status === 'completed').length;
    const totalRevenue = completedAppointments * 450000;
    
    return `
        <div class="stats-grid">
            <div class="stat-card blue">
                <div class="stat-content">
                    <div class="stat-info">
                        <p class="stat-title">Tổng số bệnh nhân</p>
                        <p class="stat-value">${totalPatients}</p>
                        <p class="stat-trend positive">+15% so với tháng trước</p>
                    </div>
                    <div class="stat-icon">
                        <i class="fas fa-users"></i>
                    </div>
                </div>
            </div>
            <div class="stat-card green">
                <div class="stat-content">
                    <div class="stat-info">
                        <p class="stat-title">Lượt khám</p>
                        <p class="stat-value">${totalAppointments}</p>
                        <p class="stat-trend positive">+23% so với tháng trước</p>
                    </div>
                    <div class="stat-icon">
                        <i class="fas fa-calendar"></i>
                    </div>
                </div>
            </div>
            <div class="stat-card purple">
                <div class="stat-content">
                    <div class="stat-info">
                        <p class="stat-title">Doanh thu</p>
                        <p class="stat-value">${formatCurrency(totalRevenue)}</p>
                        <p class="stat-trend positive">+18% so với tháng trước</p>
                    </div>
                    <div class="stat-icon">
                        <i class="fas fa-dollar-sign"></i>
                    </div>
                </div>
            </div>
            <div class="stat-card yellow">
                <div class="stat-content">
                    <div class="stat-info">
                        <p class="stat-title">Tỷ lệ hoàn thành</p>
                        <p class="stat-value">${Math.round((completedAppointments / totalAppointments) * 100)}%</p>
                        <p class="stat-trend positive">+5% so với tháng trước</p>
                    </div>
                    <div class="stat-icon">
                        <i class="fas fa-chart-line"></i>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="card">
            <div class="card-header">
                <h3>Xu hướng theo tháng</h3>
            </div>
            <div class="card-content">
                <div style="display: flex; flex-direction: column; gap: 16px;">
                    ${generateMonthlyTrend()}
                </div>
            </div>
        </div>
    `;
}

function generateMonthlyTrend() {
    const monthlyData = [
        { month: 'T1', patients: 12, appointments: 45, revenue: 20250000 },
        { month: 'T2', patients: 18, appointments: 52, revenue: 23400000 },
        { month: 'T3', patients: 15, appointments: 48, revenue: 21600000 },
        { month: 'T4', patients: 22, appointments: 61, revenue: 27450000 },
        { month: 'T5', patients: 19, appointments: 55, revenue: 24750000 },
        { month: 'T6', patients: 25, appointments: 68, revenue: 30600000 }
    ];
    
    return monthlyData.map(data => `
        <div style="display: flex; align-items: center; gap: 16px;">
            <div style="width: 32px; font-weight: 600; color: #64748b;">${data.month}</div>
            <div style="flex: 1;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px;">
                    <span>Bệnh nhân mới: ${data.patients}</span>
                    <span>Lượt khám: ${data.appointments}</span>
                    <span style="color: #10b981; font-weight: 600;">${formatCurrency(data.revenue)}</span>
                </div>
                <div style="width: 100%; height: 8px; background: #e2e8f0; border-radius: 4px;">
                    <div style="width: ${(data.appointments / 70) * 100}%; height: 100%; background: #3b82f6; border-radius: 4px; transition: width 0.3s ease;"></div>
                </div>
            </div>
        </div>
    `).join('');
}

function generatePatientsReport() {
    const totalPatients = patients.length;
    const activePatients = patients.filter(p => p.status === 'active').length;
    const patientsWithService = patients.filter(p => p.hasService).length;
    
    return `
        <div class="stats-grid">
            <div class="stat-card blue">
                <div class="stat-content">
                    <div class="stat-info">
                        <p class="stat-title">Tổng số bệnh nhân</p>
                        <p class="stat-value">${totalPatients}</p>
                    </div>
                    <div class="stat-icon">
                        <i class="fas fa-users"></i>
                    </div>
                </div>
            </div>
            <div class="stat-card green">
                <div class="stat-content">
                    <div class="stat-info">
                        <p class="stat-title">Bệnh nhân hoạt động</p>
                        <p class="stat-value">${activePatients}</p>
                    </div>
                    <div class="stat-icon">
                        <i class="fas fa-user-check"></i>
                    </div>
                </div>
            </div>
            <div class="stat-card purple">
                <div class="stat-content">
                    <div class="stat-info">
                        <p class="stat-title">Có dịch vụ</p>
                        <p class="stat-value">${patientsWithService}</p>
                    </div>
                    <div class="stat-icon">
                        <i class="fas fa-stethoscope"></i>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="card">
            <div class="card-header">
                <h3>Phân tích bệnh nhân</h3>
            </div>
            <div class="card-content">
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px;">
                    <div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                            <span>Bệnh nhân có dịch vụ</span>
                            <span style="font-weight: 600;">${Math.round((patientsWithService / totalPatients) * 100)}%</span>
                        </div>
                        <div style="width: 100%; height: 12px; background: #e2e8f0; border-radius: 6px;">
                            <div style="width: ${(patientsWithService / totalPatients) * 100}%; height: 100%; background: #10b981; border-radius: 6px;"></div>
                        </div>
                    </div>
                    <div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                            <span>Bệnh nhân hoạt động</span>
                            <span style="font-weight: 600;">${Math.round((activePatients / totalPatients) * 100)}%</span>
                        </div>
                        <div style="width: 100%; height: 12px; background: #e2e8f0; border-radius: 6px;">
                            <div style="width: ${(activePatients / totalPatients) * 100}%; height: 100%; background: #3b82f6; border-radius: 6px;"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function generateServicesReport() {
    const serviceStats = services.map(service => {
        const appointmentCount = mockAppointments.filter(a => a.serviceName === service.name).length;
        return {
            ...service,
            appointmentCount,
            revenue: appointmentCount * service.price
        };
    }).sort((a, b) => b.appointmentCount - a.appointmentCount);
    
    return `
        <div class="card">
            <div class="card-header">
                <h3>Dịch vụ phổ biến</h3>
            </div>
            <div class="card-content">
                <div style="display: flex; flex-direction: column; gap: 16px;">
                    ${serviceStats.slice(0, 5).map((service, index) => `
                        <div style="display: flex; align-items: center; justify-content: space-between; padding: 16px; background: #f8fafc; border-radius: 8px;">
                            <div style="display: flex; align-items: center; gap: 12px;">
                                <div style="width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; color: white; background: ${
                                    index === 0 ? '#f59e0b' :
                                    index === 1 ? '#9ca3af' :
                                    index === 2 ? '#f97316' : '#3b82f6'
                                };">
                                    ${index + 1}
                                </div>
                                <div>
                                    <div style="font-weight: 600; color: #1e293b;">${service.name}</div>
                                    <div style="font-size: 14px; color: #64748b;">${service.category}</div>
                                </div>
                            </div>
                            <div style="text-align: right;">
                                <div style="font-weight: 600; color: #1e293b;">${service.appointmentCount} lượt</div>
                                <div style="font-size: 14px; color: #10b981;">${formatCurrency(service.revenue)}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
}

function generateFinancialReport() {
    const totalRevenue = mockAppointments.filter(a => a.status === 'completed').length * 450000;
    const totalAppointments = mockAppointments.length;
    const completedAppointments = mockAppointments.filter(a => a.status === 'completed').length;
    
    const serviceStats = services.map(service => {
        const appointmentCount = mockAppointments.filter(a => a.serviceName === service.name).length;
        return {
            ...service,
            revenue: appointmentCount * service.price
        };
    }).sort((a, b) => b.revenue - a.revenue);
    
    return `
        <div class="dashboard-row">
            <div class="card">
                <div class="card-header">
                    <h3>Doanh thu theo dịch vụ</h3>
                </div>
                <div class="card-content">
                    <div style="display: flex; flex-direction: column; gap: 12px;">
                        ${serviceStats.slice(0, 5).map(service => `
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <span style="color: #64748b; font-size: 14px;">${service.name}</span>
                                <span style="color: #10b981; font-weight: 600;">${formatCurrency(service.revenue)}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
            
            <div class="card">
                <div class="card-header">
                    <h3>Thống kê tài chính</h3>
                </div>
                <div class="card-content">
                    <div style="display: flex; flex-direction: column; gap: 16px;">
                        <div style="display: flex; justify-content: space-between;">
                            <span>Tổng doanh thu</span>
                            <span style="font-weight: 700; color: #10b981;">${formatCurrency(totalRevenue)}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span>Doanh thu trung bình/lượt</span>
                            <span style="font-weight: 600; color: #3b82f6;">${formatCurrency(totalRevenue / totalAppointments)}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span>Lượt khám hoàn thành</span>
                            <span style="font-weight: 600; color: #8b5cf6;">${completedAppointments}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span>Tỷ lệ hoàn thành</span>
                            <span style="font-weight: 600; color: #f59e0b;">${Math.round((completedAppointments / totalAppointments) * 100)}%</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Form Handlers
function initForms() {
    
    // Service Form
    const serviceForm = document.getElementById('serviceForm');
    if (serviceForm) {
        serviceForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const formData = {
                name: document.getElementById('serviceName').value,
                description: document.getElementById('serviceDescription').value,
                duration: parseInt(document.getElementById('serviceDuration').value),
                price: parseInt(document.getElementById('servicePrice').value),
                category: document.getElementById('serviceCategory').value,
                isActive: document.getElementById('serviceIsActive').checked
            };
            
            if (currentEditingService) {
                // Update existing service
                const index = services.findIndex(s => s.id === currentEditingService.id);
                services[index] = { ...currentEditingService, ...formData };
                showToast('Đã cập nhật dịch vụ thành công');
            } else {
                // Add new service
                const newService = {
                    id: Date.now().toString(),
                    ...formData,
                    createdDate: new Date().toISOString().split('T')[0]
                };
                services.push(newService);
                showToast('Đã thêm dịch vụ mới thành công');
            }
            
            saveToLocalStorage();
            filterServices();
            closeServiceModal();
        });
    }
}

// Sidebar Toggle
function initSidebar() {
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');
    
    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('open');
        });
        
        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 1024 && 
                !sidebar.contains(e.target) && 
                !sidebarToggle.contains(e.target)) {
                sidebar.classList.remove('open');
            }
        });
    }
}

// Modal Click Outside to Close
function initModals() {
    const modals = document.querySelectorAll('.modal');
    
    modals.forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('show');
            }
        });
    });
}

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initForms();
    initSidebar();
    initModals();
    
    // Load initial data
    saveToLocalStorage();
});

// Export functions for global access
window.viewPatient = viewPatient;
window.deletePatient = deletePatient;
window.closePatientDetailModal = closePatientDetailModal;

window.openServiceModal = openServiceModal;
window.closeServiceModal = closeServiceModal;
window.editService = editService;
window.deleteService = deleteService;
window.toggleServiceStatus = toggleServiceStatus;