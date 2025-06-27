// Mock Data
const mockPatients = [
    {
        id: '1',
        name: 'Nguyễn Thị Mai',
        email: 'mai.nguyen@gmail.com',
        phone: '0912345678',
        hasService: true,
        registeredDate: '2024-01-15',
        lastVisit: '2024-06-20',
        status: 'active'
    },
    {
        id: '2',
        name: 'Trần Văn An',
        email: 'an.tran@gmail.com',
        phone: '0987654321',
        hasService: true,
        registeredDate: '2024-02-10',
        lastVisit: '2024-06-22',
        status: 'active'
    },
    {
        id: '3',
        name: 'Phạm Thị Hoa',
        email: 'hoa.pham@gmail.com',
        phone: '0909123456',
        hasService: false,
        registeredDate: '2024-03-05',
        status: 'active'
    },
    {
        id: '4',
        name: 'Lê Thị Lan',
        email: 'lan.le@gmail.com',
        phone: '0911222333',
        hasService: true,
        registeredDate: '2024-01-20',
        lastVisit: '2024-06-18',
        status: 'active'
    },
    {
        id: '5',
        name: 'Hoàng Thị Thu',
        email: 'thu.hoang@gmail.com',
        phone: '0933444555',
        hasService: true,
        registeredDate: '2024-04-12',
        lastVisit: '2024-06-21',
        status: 'inactive'
    }
];

const mockServices = [
    {
        id: '1',
        name: 'Khám định kỳ - IVF',
        description: 'Khám định kỳ cho quá trình thụ tinh trong ống nghiệm',
        duration: 60,
        price: 500000,
        category: 'IVF',
        isActive: true,
        createdDate: '2024-01-01'
    },
    {
        id: '2',
        name: 'Tư vấn lần đầu',
        description: 'Tư vấn ban đầu về các phương pháp điều trị',
        duration: 45,
        price: 300000,
        category: 'Tư vấn',
        isActive: true,
        createdDate: '2024-01-01'
    },
    {
        id: '3',
        name: 'Theo dõi kích thích - IVF',
        description: 'Theo dõi quá trình kích thích buồng trứng',
        duration: 30,
        price: 400000,
        category: 'IVF',
        isActive: true,
        createdDate: '2024-01-01'
    },
    {
        id: '4',
        name: 'Chuyên phỏi - IVF',
        description: 'Chuyên khoa phổi trong quá trình IVF',
        duration: 90,
        price: 700000,
        category: 'Chuyên khoa',
        isActive: true,
        createdDate: '2024-01-01'
    },
    {
        id: '5',
        name: 'Kiểm tra sau phẫu thuật',
        description: 'Kiểm tra tình trạng sau các ca phẫu thuật',
        duration: 40,
        price: 350000,
        category: 'Kiểm tra',
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
let services = JSON.parse(localStorage.getItem('services')) || mockServices;
let currentEditingService = null;
let filteredPatients = [...patients];
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

function formatDuration(minutes) {
    if (minutes < 60) {
        return `${minutes} phút`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}p` : `${hours} giờ`;
}

function saveToLocalStorage() {
    localStorage.setItem('patients', JSON.stringify(patients));
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
    const tabContents = document.querySelectorAll('.tab-content');
    
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const tabId = item.getAttribute('data-tab');
            
            // Update active nav item
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            
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
        case 'patients':
            loadPatients();
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