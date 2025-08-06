// Global variables for real data
let allCustomers = [];
let filteredCustomers = [];
let allDoctors = [];
let filteredDoctors = [];
let allManagers = [];
let filteredManagers = [];

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
// Global variables for editing
let currentEditingDoctor = null;
let currentEditingManager = null;
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
    console.log('🔍 Loading dashboard...');
    // Load all stats from database
    loadOverviewStats();
}

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Admin dashboard initialized');
    // Load dashboard stats immediately
    loadDashboard();
});



async function loadOverviewStats() {
    try {
        console.log('🔍 Loading overview stats...');
        const response = await fetch('/api/stats/overview');
        console.log('📊 Response status:', response.status);
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Overview stats data:', data);
            
            // Update total patients count
            const totalPatientsElement = document.getElementById('totalPatientsCount');
            if (totalPatientsElement) {
                totalPatientsElement.textContent = data.totalCustomers || 0;
                totalPatientsElement.style.color = '';
                totalPatientsElement.style.fontWeight = '';
                console.log('✅ Updated total patients count:', data.totalCustomers);
            } else {
                console.warn('⚠️ totalPatientsCount element not found');
            }
            
            // Update available services count
            const availableServicesElement = document.getElementById('availableServicesCount');
            if (availableServicesElement) {
                availableServicesElement.textContent = data.availableServices || 0;
                availableServicesElement.style.color = '';
                availableServicesElement.style.fontWeight = '';
                console.log('✅ Updated available services count:', data.availableServices);
            } else {
                console.warn('⚠️ availableServicesCount element not found');
            }
            
            // Update total staff count
            const totalStaffElement = document.getElementById('totalStaffCount');
            if (totalStaffElement) {
                totalStaffElement.textContent = data.totalStaff || 0;
                totalStaffElement.style.color = '';
                totalStaffElement.style.fontWeight = '';
                console.log('✅ Updated total staff count:', data.totalStaff);
            } else {
                console.warn('⚠️ totalStaffCount element not found');
            }
            
        } else {
            console.error('❌ Failed to load overview stats:', response.status);
            const errorText = await response.text();
            console.error('❌ Error response:', errorText);
            showErrorOnElements(['totalPatientsCount', 'availableServicesCount', 'totalStaffCount']);
        }
    } catch (error) {
        console.error('❌ Error loading overview stats:', error);
        showErrorOnElements(['totalPatientsCount', 'availableServicesCount', 'totalStaffCount']);
    }
}

function showErrorOnElements(elementIds) {
    elementIds.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = 'N/A';
            element.style.color = '#dc3545';
            element.style.fontWeight = 'bold';
        }
    });
}



// Patient Functions
async function loadPatients() {
    try {
        console.log('Loading patients...');
        const response = await fetch('/api/customer/all');
        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);
        
        if (response.ok) {
            const responseText = await response.text();
            console.log('Response text:', responseText);
            
            if (responseText.trim() === '') {
                console.log('Empty response received');
                allCustomers = [];
                filteredCustomers = [];
                renderPatientsTable(filteredCustomers);
                updatePatientsSummary(filteredCustomers);
    initPatientFilters();
                return;
            }
            
            allCustomers = JSON.parse(responseText);
            console.log('Parsed customers:', allCustomers);
            filteredCustomers = [...allCustomers];
            renderPatientsTable(filteredCustomers);
            updatePatientsSummary(filteredCustomers);
            initPatientFilters();
        } else {
            console.error('Failed to load patients:', response.status, response.statusText);
            const errorText = await response.text();
            console.error('Error response:', errorText);
            showToast('Không thể tải danh sách bệnh nhân', 'error');
        }
    } catch (error) {
        console.error('Error loading patients:', error);
        showToast('Lỗi kết nối khi tải danh sách bệnh nhân', 'error');
    }
}

function renderPatientsTable(customers = []) {
    const tbody = document.getElementById('patientsTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = customers.map(customer => `
        <tr>
            <td>
                <div class="patient-info">
                    <div class="patient-details">
                        <h4>${customer.cusFullName || 'Chưa có tên'}</h4>
                        <p>ID: ${customer.cusId}</p>
                    </div>
                </div>
            </td>
            <td>
                <div class="contact-info">
                    <p>${customer.cusEmail || 'Chưa có email'}</p>
                    <p>${customer.cusPhone || 'Chưa có SĐT'}</p>
                </div>
            </td>
            <td>
                <span class="status-badge ${customer.hasBookings ? 'with-service' : 'without-service'}">
                    ${customer.hasBookings ? 'Đã đặt lịch' : 'Chưa đặt lịch'}
                </span>
            </td>
            <td>
                <div>
                    ${customer.cusDate ? formatDate(customer.cusDate) : 'Chưa có ngày sinh'}
                    ${customer.lastBookingDate ? `<div style="font-size: 12px; color: #64748b; margin-top: 2px;">Khám cuối: ${formatDate(customer.lastBookingDate)}</div>` : ''}
                </div>
            </td>
            
            <td>
                <div class="action-buttons">
                    <button class="action-btn view" onclick="viewPatient('${customer.cusId}')" title="Xem chi tiết">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn delete" onclick="deletePatient('${customer.cusId}')" title="Xóa">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function updatePatientsSummary(customers = []) {
    document.getElementById('customerTableTotalCount').textContent = customers.length;
    document.getElementById('customerWithServiceCount').textContent = customers.filter(c => c.hasBookings).length;
    document.getElementById('customerWithoutServiceCount').textContent = customers.filter(c => !c.hasBookings).length;
    document.getElementById('customerActiveCount').textContent = customers.length;
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
    
    filteredCustomers = allCustomers.filter(customer => {
        const matchesSearch = (customer.cusFullName && customer.cusFullName.toLowerCase().includes(searchTerm)) ||
                             (customer.cusEmail && customer.cusEmail.toLowerCase().includes(searchTerm));
        const matchesService = serviceFilter === 'all' ||
                              (serviceFilter === 'withService' && customer.hasBookings) ||
                              (serviceFilter === 'withoutService' && !customer.hasBookings);
        
        return matchesSearch && matchesService;
    });
    
    renderPatientsTable(filteredCustomers);
    updatePatientsSummary(filteredCustomers);
}



function viewPatient(patientId) {
    const customer = allCustomers.find(c => c.cusId == patientId);
    if (!customer) return;
    
    const modal = document.getElementById('patientDetailModal');
    const content = document.getElementById('patientDetailContent');
    
    content.innerHTML = `
        <div class="patient-detail-grid">
            <div class="detail-item">
                <div class="detail-label">Họ và tên</div>
                <div class="detail-value">${customer.cusFullName || 'Chưa có tên'}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Email</div>
                <div class="detail-value">${customer.cusEmail || 'Chưa có email'}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Số điện thoại</div>
                <div class="detail-value">${customer.cusPhone || 'Chưa có SĐT'}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Ngày sinh</div>
                <div class="detail-value">${customer.cusDate ? formatDate(customer.cusDate) : 'Chưa có ngày sinh'}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Giới tính</div>
                <div class="detail-value">${customer.cusGender === 'M' ? 'Nam' : customer.cusGender === 'F' ? 'Nữ' : 'Chưa có'}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Địa chỉ</div>
                <div class="detail-value">${customer.cusAddress || 'Chưa có địa chỉ'}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Nghề nghiệp</div>
                <div class="detail-value">${customer.cusOccupation || 'Chưa có'}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Liên hệ khẩn cấp</div>
                <div class="detail-value">${customer.emergencyContact || 'Chưa có'}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Trạng thái dịch vụ</div>
                <div class="detail-value">
                    <span class="status-badge ${customer.hasBookings ? 'with-service' : 'without-service'}">
                        ${customer.hasBookings ? 'Có dịch vụ' : 'Chưa có dịch vụ'}
                    </span>
                </div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Trạng thái hoạt động</div>
                <div class="detail-value">
                    <span class="status-badge ${customer.cusStatus === 'active' || !customer.cusStatus ? 'active' : 'inactive'}">
                        ${customer.cusStatus === 'active' || !customer.cusStatus ? 'Hoạt động' : 'Không hoạt động'}
                    </span>
                </div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Tổng số lần đặt lịch</div>
                <div class="detail-value">${customer.totalBookings || 0}</div>
            </div>
            ${customer.lastBookingDate ? `
                <div class="detail-item">
                    <div class="detail-label">Lần khám cuối</div>
                    <div class="detail-value">${formatDate(customer.lastBookingDate)} (${customer.lastBookingStatus})</div>
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

async function deletePatient(patientId) {
    const customer = allCustomers.find(c => c.cusId == patientId);
    
    if (!customer) {
        showToast('Không tìm thấy bệnh nhân', 'error');
        return;
    }
    
    if (confirm(`Bạn có chắc chắn muốn xóa bệnh nhân "${customer.cusFullName}"? Bệnh nhân sẽ bị chuyển sang trạng thái inactive.`)) {
        try {
            const response = await fetch(`/api/customer/${patientId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    status: 'inactive'
                })
            });

            if (response.ok) {
                const result = await response.json();
                showToast('Đã xóa bệnh nhân thành công', 'success');
                
                // Reload danh sách bệnh nhân để cập nhật dữ liệu
                await loadPatients();
            } else {
                const error = await response.json();
                showToast(error.error || 'Lỗi khi xóa bệnh nhân', 'error');
            }
        } catch (error) {
            console.error('Error deleting patient:', error);
            showToast('Lỗi kết nối khi xóa bệnh nhân', 'error');
        }
    }
}

// Doctor Functions
async function loadDoctors() {
    try {
        const response = await fetch('/api/doctors/all');
        if (response.ok) {
            allDoctors = await response.json();
            filteredDoctors = [...allDoctors];
            renderDoctorsTable(filteredDoctors);
            updateDoctorsSummary(filteredDoctors);
    initDoctorFilters();
        } else {
            console.error('Failed to load doctors:', response.status);
            showToast('Không thể tải danh sách bác sĩ', 'error');
        }
    } catch (error) {
        console.error('Error loading doctors:', error);
        showToast('Lỗi kết nối khi tải danh sách bác sĩ', 'error');
    }
}

function renderDoctorsTable(doctors = []) {
    const tbody = document.getElementById('doctorsTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = doctors.map(doctor => `
        <tr>
            <td>
                <div class="doctor-info">
                    <div class="doctor-details">
                        <h4>${doctor.docFullName || 'Chưa có tên'}</h4>
                        <p>ID: ${doctor.docId}</p>
                    </div>
                </div>
            </td>
            <td>
                <div class="contact-info">
                    <p>${doctor.docEmail || 'Chưa có email'}</p>
                    <p>${doctor.docPhone || 'Chưa có SĐT'}</p>
                </div>
            </td>
            <td>
                <span class="status-badge category">
                    ${doctor.expertise || 'Chưa có chuyên khoa'}
                </span>
            </td>
            <td>
                <span class="status-badge ${doctor.isActive ? 'active' : 'inactive'}">
                    ${doctor.isActive ? 'Hoạt động' : 'Tạm khóa'}
                </span>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn view" onclick="viewDoctor('${doctor.docId}')" title="Xem chi tiết">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn edit" onclick="editDoctor('${doctor.docId}')" title="Chỉnh sửa">
                        <i class="fas fa-edit"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function updateDoctorsSummary(doctors = []) {
    document.getElementById('totalDoctorsCount').textContent = doctors.length;
    document.getElementById('activeDoctorsCount').textContent = doctors.filter(d => d.isActive).length;
    document.getElementById('inactiveDoctorsCount').textContent = doctors.filter(d => !d.isActive).length;
    
    // Tính số bác sĩ mới trong tháng (tạm thời set 0 vì chưa có ngày tạo)
    document.getElementById('newDoctorsCount').textContent = 0;
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
    
    filteredDoctors = allDoctors.filter(doctor => {
        const matchesSearch = (doctor.docFullName && doctor.docFullName.toLowerCase().includes(searchTerm)) ||
                             (doctor.docEmail && doctor.docEmail.toLowerCase().includes(searchTerm)) ||
                             (doctor.expertise && doctor.expertise.toLowerCase().includes(searchTerm));
        const matchesStatus = statusFilter === 'all' || 
                             (statusFilter === 'active' && doctor.isActive) ||
                             (statusFilter === 'inactive' && !doctor.isActive);
        
        return matchesSearch && matchesStatus;
    });
    
    renderDoctorsTable(filteredDoctors);
    updateDoctorsSummary(filteredDoctors);
}

function viewDoctor(doctorId) {
    const doctor = allDoctors.find(d => d.docId == doctorId);
    if (!doctor) return;
    
    const modal = document.getElementById('patientDetailModal');
    const content = document.getElementById('patientDetailContent');
    const title = modal.querySelector('.modal-header h3');
    
    title.textContent = 'Chi tiết bác sĩ';
    
    content.innerHTML = `
        <div class="patient-detail-grid">
            <div class="detail-item">
                <div class="detail-label">Họ và tên</div>
                <div class="detail-value">${doctor.docFullName || 'Chưa có tên'}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Email</div>
                <div class="detail-value">${doctor.docEmail || 'Chưa có email'}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Số điện thoại</div>
                <div class="detail-value">${doctor.docPhone || 'Chưa có SĐT'}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Bằng cấp</div>
                <div class="detail-value">${doctor.degree || 'Chưa có bằng cấp'}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Chuyên môn</div>
                <div class="detail-value">${doctor.expertise || 'Chưa có chuyên môn'}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Trạng thái</div>
                <div class="detail-value">
                    <span class="status-badge ${doctor.isActive ? 'active' : 'inactive'}">
                        ${doctor.isActive ? 'Hoạt động' : 'Tạm khóa'}
                    </span>
                </div>
            </div>
            <div class="detail-item" style="grid-column: 1 / -1;">
                <div class="detail-label">Mô tả</div>
                <div class="detail-value">${doctor.profileDescription || 'Chưa có mô tả'}</div>
            </div>
        </div>
    `;
    
    modal.classList.add('show');
}

function editDoctor(doctorId) {
    const doctor = allDoctors.find(d => d.docId == doctorId);
    if (!doctor) {
        showToast('Không tìm thấy bác sĩ', 'error');
        return;
    }
    
    currentEditingDoctor = doctor;
    
    const modal = document.getElementById('doctorModal');
    const title = document.getElementById('doctorModalTitle');
    const submitBtn = document.getElementById('doctorSubmitBtn');
    
    // Set title và button text cho chỉnh sửa
    title.textContent = 'Chỉnh sửa thông tin bác sĩ';
    submitBtn.textContent = 'Cập nhật';
    
    // Fill form với dữ liệu hiện tại
    document.getElementById('doctorName').value = doctor.docFullName || '';
    document.getElementById('doctorEmail').value = doctor.docEmail || '';
    document.getElementById('doctorPhone').value = doctor.docPhone || '';
    document.getElementById('doctorSpecialty').value = doctor.expertise || '';
    document.getElementById('doctorDescription').value = doctor.profileDescription || '';
    document.getElementById('doctorPassword').value = ''; // Không hiển thị mật khẩu cũ
    
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    setTimeout(() => modal.classList.add('show'), 10);
}

function deleteDoctor(doctorId) {
    if (confirm('Bạn có chắc chắn muốn xóa bác sĩ này?')) {
        // TODO: Implement API call to delete doctor
        showToast('Chức năng xóa bác sĩ sẽ được cập nhật sau', 'warning');
    }
}

// Manager Functions
async function loadManagers() {
    try {
        const response = await fetch('/api/manager/all');
        if (response.ok) {
            allManagers = await response.json();
            filteredManagers = [...allManagers];
            renderManagersTable(filteredManagers);
            updateManagersSummary(filteredManagers);
    initManagerFilters();
        } else {
            console.error('Failed to load managers:', response.status);
            showToast('Không thể tải danh sách quản lý', 'error');
        }
    } catch (error) {
        console.error('Error loading managers:', error);
        showToast('Lỗi kết nối khi tải danh sách quản lý', 'error');
    }
}

function renderManagersTable(managers = []) {
    const tbody = document.getElementById('managersTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = managers.map(manager => `
        <tr>
            <td>
                <div class="manager-info">
                    <div class="manager-details">
                        <h4>${manager.maFullName || 'Chưa có tên'}</h4>
                        <p>ID: ${manager.maId}</p>
                    </div>
                </div>
            </td>
            <td>
                <div class="contact-info">
                    <p>${manager.maEmail || 'Chưa có email'}</p>
                    <p>${manager.maPhone || 'Chưa có SĐT'}</p>
                </div>
            </td>
            <td>
                <span class="status-badge category">
                    ${manager.roles === 'admin' ? 'Quản trị viên' : 'Quản lý'}
                </span>
            </td>
            <td>
                <div style="font-size: 12px;">
                    ${manager.position || 'Chưa có chức vụ'}
                </div>
            </td>
            <td>
                <span class="status-badge ${manager.isActive ? 'active' : 'inactive'}">
                    ${manager.isActive ? 'Hoạt động' : 'Tạm khóa'}
                </span>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn view" onclick="viewManager('${manager.maId}')" title="Xem chi tiết">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn edit" onclick="editManager('${manager.maId}')" title="Chỉnh sửa">
                        <i class="fas fa-edit"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function updateManagersSummary(managers = []) {
    document.getElementById('totalManagersCount').textContent = managers.length;
    document.getElementById('adminCount').textContent = managers.filter(m => m.roles === 'admin').length;
    document.getElementById('managerCount').textContent = managers.filter(m => m.roles === 'manager').length;
    document.getElementById('supervisorCount').textContent = 0; // Không còn supervisor
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
    
    filteredManagers = allManagers.filter(manager => {
        const matchesSearch = (manager.maFullName && manager.maFullName.toLowerCase().includes(searchTerm)) ||
                             (manager.maEmail && manager.maEmail.toLowerCase().includes(searchTerm));
        const matchesRole = roleFilter === 'all' || manager.roles === roleFilter;
        
        return matchesSearch && matchesRole;
    });
    
    renderManagersTable(filteredManagers);
    updateManagersSummary(filteredManagers);
}

function viewManager(managerId) {
    const manager = allManagers.find(m => m.maId == managerId);
    if (!manager) return;
    
    const modal = document.getElementById('patientDetailModal');
    const content = document.getElementById('patientDetailContent');
    const title = modal.querySelector('.modal-header h3');
    
    title.textContent = 'Chi tiết quản lý';
    
    content.innerHTML = `
        <div class="patient-detail-grid">
            <div class="detail-item">
                <div class="detail-label">Họ và tên</div>
                <div class="detail-value">${manager.maFullName || 'Chưa có tên'}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Email</div>
                <div class="detail-value">${manager.maEmail || 'Chưa có email'}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Số điện thoại</div>
                <div class="detail-value">${manager.maPhone || 'Chưa có SĐT'}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Chức vụ</div>
                <div class="detail-value">${manager.position || 'Chưa có chức vụ'}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Vai trò</div>
                <div class="detail-value">
                    <span class="status-badge category">
                        ${manager.roles === 'admin' ? 'Quản trị viên' : 
                          manager.roles === 'manager' ? 'Quản lý' : 'Giám sát'}
                    </span>
                </div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Trạng thái</div>
                <div class="detail-value">
                    <span class="status-badge ${manager.isActive ? 'active' : 'inactive'}">
                        ${manager.isActive ? 'Hoạt động' : 'Tạm khóa'}
                    </span>
                </div>
            </div>
        </div>
    `;
    
    modal.classList.add('show');
}

function editManager(managerId) {
    const manager = allManagers.find(m => m.maId == managerId);
    if (!manager) {
        showToast('Không tìm thấy quản lý', 'error');
        return;
    }
    
    currentEditingManager = manager;
    
    const modal = document.getElementById('managerModal');
    const title = document.getElementById('managerModalTitle');
    const submitBtn = document.getElementById('managerSubmitBtn');
    
    // Set title và button text cho chỉnh sửa
    title.textContent = 'Chỉnh sửa thông tin quản lý';
    submitBtn.textContent = 'Cập nhật';
    
    // Fill form với dữ liệu hiện tại
    document.getElementById('managerName').value = manager.maFullName || '';
    document.getElementById('managerEmail').value = manager.maEmail || '';
    document.getElementById('managerPhone').value = manager.maPhone || '';
    document.getElementById('managerRole').value = manager.roles || 'manager';
    document.getElementById('managerPassword').value = ''; // Không hiển thị mật khẩu cũ
    
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    setTimeout(() => modal.classList.add('show'), 10);
}

function deleteManager(managerId) {
    if (confirm('Bạn có chắc chắn muốn xóa quản lý này?')) {
        // TODO: Implement API call to delete manager
        showToast('Chức năng xóa quản lý sẽ được cập nhật sau', 'warning');
    }
}

// Service Functions
async function loadServices() {
    try {
        console.log('Loading services...');
        
        // Test API trước
        const testResponse = await fetch('/api/services/test');
        if (testResponse.ok) {
            const testData = await testResponse.json();
            console.log('Test data:', testData);
        }
        
        const response = await fetch('/api/services/hierarchy');
        if (response.ok) {
            const servicesData = await response.json();
            console.log('Services data:', servicesData);
            renderServicesHierarchy(servicesData);
            updateServicesSummary(servicesData);
        } else {
            console.error('Failed to load services:', response.status);
            showToast('Không thể tải danh sách dịch vụ', 'error');
        }
    } catch (error) {
        console.error('Error loading services:', error);
        showToast('Lỗi kết nối khi tải danh sách dịch vụ', 'error');
    }
}

function renderServicesHierarchy(servicesData) {
    const container = document.getElementById('servicesContainer');
    if (!container) {
        console.error('Services container not found');
        return;
    }
    
    console.log('Rendering services hierarchy...');
    console.log('Services data length:', servicesData.length);
    
    if (servicesData.length === 0) {
        container.innerHTML = '<div style="text-align: center; padding: 40px; color: #666;">Không có dữ liệu dịch vụ</div>';
        return;
    }
    
    container.innerHTML = servicesData.map(service => `
        <div class="service-item" style="border: 1px solid #e9ecef; border-radius: 8px; margin-bottom: 15px; overflow: hidden;">
            <div class="service-header" onclick="toggleSubServices('${service.serviceId}')" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; cursor: pointer; display: flex; justify-content: space-between; align-items: center;">
                <div class="service-main-info">
                    <h3 style="margin: 0 0 8px 0; font-size: 18px; font-weight: 600;">${service.serviceName}</h3>
                    <p style="margin: 0; opacity: 0.9; font-size: 14px;">${service.serviceDescription || 'Không có mô tả'}</p>
                </div>
                <div class="service-details" style="display: flex; gap: 20px; align-items: center;">
                    <span class="service-duration" style="background: rgba(255, 255, 255, 0.2); padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 500;">${service.serviceDuration} phút</span>
                    <span class="service-price" style="background: rgba(255, 255, 255, 0.2); padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 500;">${formatCurrency(service.servicePrice)}</span>
                </div>
                <div class="service-toggle">
                    <i class="fas fa-chevron-down" id="toggle-${service.serviceId}" style="font-size: 16px;"></i>
                </div>
            </div>
            <div class="sub-services" id="sub-services-${service.serviceId}" style="background: #f8f9fa; padding: 0; max-height: 0; overflow: hidden; transition: all 0.3s ease;">
                ${service.subServices.map(subService => `
                    <div class="sub-service-item" style="background: white; border: 1px solid #e9ecef; border-radius: 6px; padding: 15px; margin: 10px; display: flex; justify-content: space-between; align-items: center;">
                        <div class="sub-service-info">
                            <h4 style="margin: 0 0 5px 0; font-size: 16px; color: #495057;">${subService.subName}</h4>
                            <p style="margin: 0; color: #6c757d; font-size: 13px;">${subService.subDescription || 'Không có mô tả'}</p>
                        </div>
                        <div class="sub-service-details" style="display: flex; gap: 15px; align-items: center;">
                            <span class="sub-service-duration" style="background: #e9ecef; padding: 4px 10px; border-radius: 15px; font-size: 12px; color: #495057;">${subService.subDuration || 0} ngày</span>
                            <span class="sub-service-price" style="background: #d4edda; color: #155724; font-weight: 600; padding: 4px 10px; border-radius: 15px; font-size: 12px;">${formatCurrency(subService.subPrice)}</span>
                        </div>
                        <div class="sub-service-actions" style="display: flex; gap: 8px;">
                            <button class="action-btn edit" onclick="editSubService('${subService.subId}', '${subService.subName}', ${subService.subPrice})" title="Chỉnh sửa" style="background: #007bff; color: white; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer;">
                        <i class="fas fa-edit"></i>
                    </button>
                </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
}

function updateServicesSummary(servicesData) {
    const totalSubServices = servicesData.reduce((sum, service) => sum + service.subServices.length, 0);
    const totalServices = servicesData.length;
    
    document.getElementById('totalServicesCount').textContent = totalServices;
    document.getElementById('activeServicesCount').textContent = totalServices;
    document.getElementById('categoriesCount').textContent = totalServices;
    document.getElementById('averagePrice').textContent = totalSubServices ;
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

function toggleSubServices(serviceId) {
    console.log('Toggling sub services for service ID:', serviceId);
    const subServicesDiv = document.getElementById(`sub-services-${serviceId}`);
    const toggleIcon = document.getElementById(`toggle-${serviceId}`);
    
    if (!subServicesDiv) {
        console.error('Sub services div not found for service ID:', serviceId);
        return;
    }
    
    if (!toggleIcon) {
        console.error('Toggle icon not found for service ID:', serviceId);
        return;
    }
    
    const currentMaxHeight = subServicesDiv.style.maxHeight;
    if (currentMaxHeight === '0px' || !currentMaxHeight) {
        // Mở dropdown
        subServicesDiv.style.maxHeight = '1000px';
        subServicesDiv.style.padding = '20px';
        subServicesDiv.style.overflow = 'visible';
        toggleIcon.classList.remove('fa-chevron-down');
        toggleIcon.classList.add('fa-chevron-up');
        console.log('Sub services shown');
    } else {
        // Đóng dropdown
        subServicesDiv.style.maxHeight = '0px';
        subServicesDiv.style.padding = '0px';
        subServicesDiv.style.overflow = 'hidden';
        toggleIcon.classList.remove('fa-chevron-up');
        toggleIcon.classList.add('fa-chevron-down');
        console.log('Sub services hidden');
    }
}

function editSubService(subId, subName, subPrice) {
    const newName = prompt('Nhập tên dịch vụ mới:', subName);
    if (newName === null) return; // User cancelled
    
    const newPrice = prompt('Nhập giá mới:', subPrice);
    if (newPrice === null) return; // User cancelled
    
    const price = parseInt(newPrice);
    if (isNaN(price) || price <= 0) {
        showToast('Giá phải là số dương', 'error');
        return;
    }
    
    // Call API to update
    updateSubService(subId, newName, price);
}

async function updateSubService(subId, subName, subPrice) {
    try {
        const response = await fetch(`/api/services/subservice/${subId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                subName: subName,
                subPrice: subPrice
            })
        });

        if (response.ok) {
            showToast('Cập nhật dịch vụ thành công!', 'success');
            // Reload services
            await loadServices();
        } else {
            const error = await response.json();
            showToast(error.error || 'Lỗi khi cập nhật dịch vụ', 'error');
        }
    } catch (error) {
        console.error('Error updating sub service:', error);
        showToast('Lỗi kết nối khi cập nhật dịch vụ', 'error');
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

// Doctor Form Handler
function initDoctorForm() {
    const doctorForm = document.getElementById('doctorForm');
    if (doctorForm) {
        doctorForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = {
                docFullName: document.getElementById('doctorName').value.trim(),
                docEmail: document.getElementById('doctorEmail').value.trim(),
                docPhone: document.getElementById('doctorPhone').value.trim(),
                expertise: document.getElementById('doctorSpecialty').value.trim(),
                degree: document.getElementById('doctorDescription').value.trim(),
                profileDescription: document.getElementById('doctorDescription').value.trim(),
                docPassword: document.getElementById('doctorPassword').value.trim()
            };
            
            // Validate required fields
            if (!formData.docFullName) {
                showToast('Họ và tên bác sĩ không được để trống', 'error');
                return;
            }
            
            if (!formData.docEmail) {
                showToast('Email không được để trống', 'error');
                return;
            }
            
            if (!formData.docPhone) {
                showToast('Số điện thoại không được để trống', 'error');
                return;
            }
            
            try {
                let response;
                let successMessage;
                
                if (currentEditingDoctor) {
                    // Update existing doctor
                    response = await fetch(`/api/doctors/update/${currentEditingDoctor.docId}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(formData)
                    });
                    successMessage = 'Cập nhật bác sĩ thành công!';
                } else {
                    // Create new doctor
                    response = await fetch('/api/doctors', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(formData)
                    });
                    successMessage = 'Thêm bác sĩ thành công!';
                }

                if (response.ok) {
                    const result = await response.json();
                    showToast(successMessage, 'success');
                    
                    // Close modal
                    closeDoctorModal();
                    
                    // Reload danh sách bác sĩ
                    await loadDoctors();
                } else {
                    const error = await response.json();
                    showToast(error.error || 'Lỗi khi xử lý bác sĩ', 'error');
                }
            } catch (error) {
                console.error('Error processing doctor:', error);
                showToast('Lỗi kết nối khi xử lý bác sĩ', 'error');
            }
        });
    }
}

// Manager Form Handler
function initManagerForm() {
    const managerForm = document.getElementById('managerForm');
    if (managerForm) {
        managerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = {
                maFullName: document.getElementById('managerName').value.trim(),
                maEmail: document.getElementById('managerEmail').value.trim(),
                maPhone: document.getElementById('managerPhone').value.trim(),
                position: document.getElementById('managerRole').value.trim(),
                roles: document.getElementById('managerRole').value.trim(),
                maPassword: document.getElementById('managerPassword').value.trim()
            };
            
            // Validate required fields
            if (!formData.maFullName) {
                showToast('Họ và tên quản lý không được để trống', 'error');
                return;
            }
            
            if (!formData.maEmail) {
                showToast('Email không được để trống', 'error');
                return;
            }
            
            if (!formData.maPhone) {
                showToast('Số điện thoại không được để trống', 'error');
                return;
            }
            
            if (!formData.maPassword) {
                showToast('Mật khẩu không được để trống', 'error');
                return;
            }
            
            try {
                let response;
                let successMessage;
                
                if (currentEditingManager) {
                    // Update existing manager
                    response = await fetch(`/api/manager/${currentEditingManager.maId}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(formData)
                    });
                    successMessage = 'Cập nhật quản lý thành công!';
                } else {
                    // Create new manager
                    response = await fetch('/api/manager', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(formData)
                    });
                    successMessage = 'Thêm quản lý thành công!';
                }

                if (response.ok) {
                    const result = await response.json();
                    showToast(successMessage, 'success');
                    
                    // Close modal
                    closeManagerModal();
                    
                    // Reload danh sách quản lý
                    await loadManagers();
                } else {
                    const error = await response.json();
                    showToast(error.error || 'Lỗi khi xử lý quản lý', 'error');
                }
            } catch (error) {
                console.error('Error processing manager:', error);
                showToast('Lỗi kết nối khi xử lý quản lý', 'error');
            }
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
    initDoctorForm();
    initManagerForm();
    
    // Load initial data
    saveToLocalStorage();
});

// Export functions for global access
window.viewPatient = viewPatient;
window.deletePatient = deletePatient;
window.closePatientDetailModal = closePatientDetailModal;

window.editDoctor = editDoctor;
window.viewDoctor = viewDoctor;
window.editManager = editManager;
window.viewManager = viewManager;
window.toggleSubServices = toggleSubServices;
window.editSubService = editSubService;

window.openServiceModal = openServiceModal;
window.closeServiceModal = closeServiceModal;
window.editService = editService;
window.deleteService = deleteService;
window.toggleServiceStatus = toggleServiceStatus;