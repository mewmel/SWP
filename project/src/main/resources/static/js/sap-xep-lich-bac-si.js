// Simplified JavaScript for schedule management with only 2 shifts
const doctors = [
  { id: 'BS001', name: 'BS. Nguyễn Văn A' },
  { id: 'BS002', name: 'BS. Trần Thị B' },
  { id: 'BS003', name: 'BS. Lê Văn C' },
  { id: 'BS004', name: 'BS. Phạm Thị D' },
  { id: 'BS005', name: 'BS. Hoàng Văn E' },
  { id: 'BS006', name: 'BS. Đặng Thị F' }
];

// Simplified time sessions with only 2 shifts per day
const timeSessions = {
  'T2': {
    morning: ['08:00-12:00'],
    afternoon: ['14:00-17:00']
  },
  'T3': {
    morning: ['08:00-12:00'],
    afternoon: ['14:00-17:00']
  },
  'T4': {
    morning: ['08:00-12:00'],
    afternoon: ['14:00-17:00']
  },
  'T5': {
    morning: ['08:00-12:00'],
    afternoon: ['14:00-17:00']
  },
  'T6': {
    morning: ['08:00-12:00'],
    afternoon: ['14:00-17:00']
  },
  'T7': {
    morning: ['08:00-12:00'],
    afternoon: [] // Weekend only morning
  },
  'CN': {
    morning: ['08:00-12:00'],
    afternoon: [] // Weekend only morning
  }
};

// Simplified schedule data with only 2 shifts
const doctorSchedules = {
  'BS001': {
    'T2': { 'morning': true, 'afternoon': false },
    'T3': { 'morning': true, 'afternoon': true },
    'T4': { 'morning': false, 'afternoon': true },
    'T5': { 'morning': true, 'afternoon': false },
    'T6': { 'morning': false, 'afternoon': false },
    'T7': { 'morning': false },
    'CN': { 'morning': false }
  },
  'BS002': {
    'T2': { 'morning': false, 'afternoon': true },
    'T3': { 'morning': true, 'afternoon': true },
    'T4': { 'morning': true, 'afternoon': false },
    'T5': { 'morning': false, 'afternoon': true },
    'T6': { 'morning': true, 'afternoon': true },
    'T7': { 'morning': false },
    'CN': { 'morning': false }
  },
  'BS003': {
    'T2': { 'morning': true, 'afternoon': false },
    'T3': { 'morning': false, 'afternoon': true },
    'T4': { 'morning': true, 'afternoon': true },
    'T5': { 'morning': false, 'afternoon': false },
    'T6': { 'morning': true, 'afternoon': false },
    'T7': { 'morning': false },
    'CN': { 'morning': false }
  },
  'BS004': {
    'T2': { 'morning': false, 'afternoon': false },
    'T3': { 'morning': true, 'afternoon': false },
    'T4': { 'morning': false, 'afternoon': true },
    'T5': { 'morning': true, 'afternoon': true },
    'T6': { 'morning': false, 'afternoon': true },
    'T7': { 'morning': false },
    'CN': { 'morning': false }
  },
  'BS005': {
    'T2': { 'morning': true, 'afternoon': true },
    'T3': { 'morning': false, 'afternoon': false },
    'T4': { 'morning': true, 'afternoon': false },
    'T5': { 'morning': false, 'afternoon': true },
    'T6': { 'morning': true, 'afternoon': false },
    'T7': { 'morning': false },
    'CN': { 'morning': false }
  },
  'BS006': {
    'T2': { 'morning': false, 'afternoon': true },
    'T3': { 'morning': true, 'afternoon': false },
    'T4': { 'morning': false, 'afternoon': false },
    'T5': { 'morning': true, 'afternoon': false },
    'T6': { 'morning': false, 'afternoon': true },
    'T7': { 'morning': false },
    'CN': { 'morning': false }
  }
};

const days = ['T2','T3','T4','T5','T6','T7','CN'];
const dayNames = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];

function showLoading() {
  document.getElementById('loadingOverlay').style.display = 'flex';
}

function hideLoading() {
  document.getElementById('loadingOverlay').style.display = 'none';
}

function renderDoctorCards() {
  const doctorsGrid = document.getElementById('doctorsGrid');
  doctorsGrid.innerHTML = '';
  
  doctors.forEach(doctor => {
    // Calculate doctor stats
    let totalSlots = 0;
    let workingSlots = 0;
    
    days.forEach(day => {
      const sessions = timeSessions[day];
      // Morning shift
      if (sessions.morning.length > 0) {
        totalSlots++;
        if (doctorSchedules[doctor.id]?.[day]?.morning) workingSlots++;
      }
      // Afternoon shift
      if (sessions.afternoon.length > 0) {
        totalSlots++;
        if (doctorSchedules[doctor.id]?.[day]?.afternoon) workingSlots++;
      }
    });
    
    const workingPercentage = Math.round((workingSlots / totalSlots) * 100);
    const doctorInitials = doctor.name.split(' ').map(n => n.charAt(0)).join('').toUpperCase();
    
    // Create doctor card
    const doctorCard = document.createElement('div');
    doctorCard.className = 'doctor-card';
    
    doctorCard.innerHTML = `
      <div class="doctor-header">
        <div class="doctor-avatar">${doctorInitials}</div>
        <div class="doctor-info">
          <h4>${doctor.name}</h4>
          <p class="doctor-stats">${workingSlots}/${totalSlots} ca làm việc (${workingPercentage}%)</p>
        </div>
      </div>
      <div class="week-schedule">
        ${days.map((day, dayIndex) => `
          <div class="day-column">
            <div class="day-header ${dayIndex >= 5 ? 'weekend' : 'weekday'}">
              ${dayNames[dayIndex]}
            </div>
            <div class="time-slots">
              ${renderDayTimeSlots(doctor.id, day, dayIndex)}
            </div>
          </div>
        `).join('')}
      </div>
    `;
    
    doctorsGrid.appendChild(doctorCard);
  });
  
  updateStats();
}

function renderDayTimeSlots(doctorId, day, dayIndex) {
  const sessions = timeSessions[day];
  let slotsHTML = '';
  
  // Morning shift
  if (sessions.morning.length > 0) {
    const isMorningSelected = doctorSchedules[doctorId]?.[day]?.morning || false;
    const slotClass = dayIndex >= 5 ? 'weekend-slot' : 'morning-slot';
    
    slotsHTML += `
      <div class="time-slot ${slotClass} ${isMorningSelected ? 'selected' : ''}" 
           data-doctor="${doctorId}" data-day="${day}" data-shift="morning"
           onclick="toggleTimeSlot(this)">
        <p class="slot-time">🌅 Ca sáng</p>
        <p class="slot-hours">08:00-12:00</p>
      </div>
    `;
  }
  
  // Afternoon shift (only for weekdays)
  if (sessions.afternoon.length > 0) {
    const isAfternoonSelected = doctorSchedules[doctorId]?.[day]?.afternoon || false;
    
    slotsHTML += `
      <div class="time-slot afternoon-slot ${isAfternoonSelected ? 'selected' : ''}" 
           data-doctor="${doctorId}" data-day="${day}" data-shift="afternoon"
           onclick="toggleTimeSlot(this)">
        <p class="slot-time">🌆 Ca chiều</p>
        <p class="slot-hours">14:00-17:00</p>
      </div>
    `;
  }
  
  return slotsHTML;
}

function toggleTimeSlot(element) {
  const doctor = element.getAttribute('data-doctor');
  const day = element.getAttribute('data-day');
  const shift = element.getAttribute('data-shift');
  
  // Toggle selection
  const isSelected = element.classList.contains('selected');
  
  if (isSelected) {
    element.classList.remove('selected');
    doctorSchedules[doctor][day][shift] = false;
  } else {
    element.classList.add('selected');
    if (!doctorSchedules[doctor]) doctorSchedules[doctor] = {};
    if (!doctorSchedules[doctor][day]) doctorSchedules[doctor][day] = {};
    doctorSchedules[doctor][day][shift] = true;
  }
  
  // Update doctor stats in real-time
  updateDoctorStats(doctor);
  updateStats();
}

function updateDoctorStats(doctorId) {
  const doctorCard = document.querySelector(`[data-doctor="${doctorId}"]`).closest('.doctor-card');
  if (!doctorCard) return;
  
  let totalSlots = 0;
  let workingSlots = 0;
  
  days.forEach(day => {
    const sessions = timeSessions[day];
    // Morning shift
    if (sessions.morning.length > 0) {
      totalSlots++;
      if (doctorSchedules[doctorId]?.[day]?.morning) workingSlots++;
    }
    // Afternoon shift
    if (sessions.afternoon.length > 0) {
      totalSlots++;
      if (doctorSchedules[doctorId]?.[day]?.afternoon) workingSlots++;
    }
  });
  
  const workingPercentage = Math.round((workingSlots / totalSlots) * 100);
  const statsElement = doctorCard.querySelector('.doctor-stats');
  if (statsElement) {
    statsElement.textContent = `${workingSlots}/${totalSlots} ca làm việc (${workingPercentage}%)`;
  }
}

function updateStats() {
  let workingDoctors = 0;
  let totalShifts = 0;
  let totalPossibleShifts = 0;
  
  // Calculate total possible shifts
  days.forEach(day => {
    const sessions = timeSessions[day];
    if (sessions.morning.length > 0) totalPossibleShifts += doctors.length;
    if (sessions.afternoon.length > 0) totalPossibleShifts += doctors.length;
  });
  
  doctors.forEach(doctor => {
    let hasAnyShift = false;
    days.forEach(day => {
      const sessions = timeSessions[day];
      
      // Check morning shift
      if (sessions.morning.length > 0 && doctorSchedules[doctor.id]?.[day]?.morning) {
        totalShifts++;
        hasAnyShift = true;
      }
      
      // Check afternoon shift
      if (sessions.afternoon.length > 0 && doctorSchedules[doctor.id]?.[day]?.afternoon) {
        totalShifts++;
        hasAnyShift = true;
      }
    });
    if (hasAnyShift) workingDoctors++;
  });
  
  const coverageRate = Math.round((totalShifts / totalPossibleShifts) * 100);
  
  document.getElementById('totalDoctors').textContent = doctors.length;
  document.getElementById('workingDoctors').textContent = workingDoctors;
  document.getElementById('totalShifts').textContent = totalShifts;
  document.getElementById('coverageRate').textContent = coverageRate + '%';
}

function saveAllSchedule() {
  showLoading();
  
  // Simulate API call delay
  setTimeout(() => {
    document.querySelectorAll('.time-slot').forEach(slot => {
      const doctor = slot.getAttribute('data-doctor');
      const day = slot.getAttribute('data-day');
      const shift = slot.getAttribute('data-shift');
      const isSelected = slot.classList.contains('selected');
      
      if (!doctorSchedules[doctor]) doctorSchedules[doctor] = {};
      if (!doctorSchedules[doctor][day]) doctorSchedules[doctor][day] = {};
      doctorSchedules[doctor][day][shift] = isSelected;
    });
    
    hideLoading();
    showSuccessMessage('Đã lưu lịch làm việc cho tất cả bác sĩ thành công!');
    updateStats();
  }, 1500);
}

function showSuccessMessage(message) {
  // Simple success notification
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #10b981;
    color: white;
    padding: 16px 24px;
    border-radius: 8px;
    font-weight: 500;
    z-index: 10000;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    animation: slideIn 0.3s ease;
  `;
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, 3000);
}

// Event listeners
document.getElementById('saveAllScheduleBtn').addEventListener('click', saveAllSchedule);

document.getElementById('resetScheduleBtn').addEventListener('click', function() {
  if (confirm('Bạn có chắc chắn muốn đặt lại tất cả lịch làm việc?')) {
    doctors.forEach(doctor => {
      days.forEach(day => {
        if (!doctorSchedules[doctor.id]) doctorSchedules[doctor.id] = {};
        if (!doctorSchedules[doctor.id][day]) doctorSchedules[doctor.id][day] = {};
        
        const sessions = timeSessions[day];
        if (sessions.morning.length > 0) {
          doctorSchedules[doctor.id][day].morning = false;
        }
        if (sessions.afternoon.length > 0) {
          doctorSchedules[doctor.id][day].afternoon = false;
        }
      });
    });
    renderDoctorCards();
    showSuccessMessage('Đã đặt lại tất cả lịch làm việc!');
  }
});

document.getElementById('selectAllBtn').addEventListener('click', function() {
  document.querySelectorAll('.time-slot').forEach(slot => {
    if (!slot.classList.contains('selected')) {
      slot.classList.add('selected');
      const doctor = slot.getAttribute('data-doctor');
      const day = slot.getAttribute('data-day');
      const shift = slot.getAttribute('data-shift');
      
      if (!doctorSchedules[doctor]) doctorSchedules[doctor] = {};
      if (!doctorSchedules[doctor][day]) doctorSchedules[doctor][day] = {};
      doctorSchedules[doctor][day][shift] = true;
    }
  });
  
  // Update all doctor stats
  doctors.forEach(doctor => updateDoctorStats(doctor.id));
  updateStats();
});

document.getElementById('clearAllBtn').addEventListener('click', function() {
  document.querySelectorAll('.time-slot').forEach(slot => {
    if (slot.classList.contains('selected')) {
      slot.classList.remove('selected');
      const doctor = slot.getAttribute('data-doctor');
      const day = slot.getAttribute('data-day');
      const shift = slot.getAttribute('data-shift');
      
      if (doctorSchedules[doctor] && doctorSchedules[doctor][day]) {
        doctorSchedules[doctor][day][shift] = false;
      }
    }
  });
  
  // Update all doctor stats
  doctors.forEach(doctor => updateDoctorStats(doctor.id));
  updateStats();
});

// Week navigation (dummy functionality)
document.getElementById('prevWeek').addEventListener('click', function() {
  showSuccessMessage('Chuyển đến tuần trước');
});

document.getElementById('nextWeek').addEventListener('click', function() {
  showSuccessMessage('Chuyển đến tuần sau');
});

// Initialize
document.addEventListener('DOMContentLoaded', function() {
  renderDoctorCards();
  
  // Add CSS for animations
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    
    .slot-hours {
      font-size: 11px;
      color: #64748b;
      margin: 0;
      margin-top: 2px;
    }
  `;
  document.head.appendChild(style);
}); 

// ========================= LEAVE MANAGEMENT =========================

// Sample leave requests data
const leaveRequests = [
  {
    id: 1,
    doctorId: 'BS001',
    doctorName: 'Bác sĩ Nguyễn Ngọc Khánh Linh',
    doctorSpecialty: 'Sản Phụ khoa',
    doctorEmail: 'linh.nguyen@hospital.com',
    leaveType: 'Nghỉ phép năm',
    startDate: '2024-12-22',
    endDate: '2024-12-24',
    days: 3,
    reason: 'Nghỉ lễ Giáng sinh cùng gia đình',
    submitDate: '2024-12-18 14:30:00',
    status: 'pending',
    attachment: null
  },
  {
    id: 2,
    doctorId: 'BS002',
    doctorName: 'Bác sĩ Trương Quốc Lập',
    doctorSpecialty: 'IUI',
    doctorEmail: 'lap.truong@hospital.com',
    leaveType: 'Nghỉ ốm',
    startDate: '2024-12-26',
    endDate: '2024-12-27',
    days: 2,
    reason: 'Cảm cúm, cần nghỉ ngơi điều trị',
    submitDate: '2024-12-20 09:15:00',
    status: 'pending',
    attachment: 'medical_certificate.pdf'
  },
  {
    id: 3,
    doctorId: 'BS003',
    doctorName: 'Bác sĩ Tất Vĩnh Hùng',
    doctorSpecialty: 'IVF',
    doctorEmail: 'hung.tat@hospital.com',
    leaveType: 'Nghỉ phép cá nhân',
    startDate: '2024-12-15',
    endDate: '2024-12-16',
    days: 2,
    reason: 'Tham dự hội nghị y khoa tại Hà Nội',
    submitDate: '2024-12-10 11:20:00',
    status: 'approved',
    approvedDate: '2024-12-12 16:45:00',
    approvedBy: 'Quản lý A',
    attachment: 'conference_invitation.pdf'
  }
];

let currentRejectingLeaveId = null;
let currentDetailLeaveId = null;

// Initialize leave management
function initializeLeaveManagement() {
  populateDoctorFilter();
  setupLeaveFilters();
  updateLeaveStats();
}

// Populate doctor filter dropdown
function populateDoctorFilter() {
  const doctorFilter = document.getElementById('doctorFilter');
  if (!doctorFilter) return;
  
  // Clear existing options except "Tất cả bác sĩ"
  while (doctorFilter.children.length > 1) {
    doctorFilter.removeChild(doctorFilter.lastChild);
  }
  
  // Add doctors from leave requests
  const doctorsWithLeaves = [...new Set(leaveRequests.map(req => req.doctorName))];
  doctorsWithLeaves.forEach(doctorName => {
    const option = document.createElement('option');
    option.value = doctorName;
    option.textContent = doctorName;
    doctorFilter.appendChild(option);
  });
}

// Setup filter event listeners
function setupLeaveFilters() {
  const statusFilter = document.getElementById('statusFilter');
  const doctorFilter = document.getElementById('doctorFilter');
  
  if (statusFilter) {
    statusFilter.addEventListener('change', filterLeaveRequests);
  }
  
  if (doctorFilter) {
    doctorFilter.addEventListener('change', filterLeaveRequests);
  }
}

// Filter leave requests based on status and doctor
function filterLeaveRequests() {
  const statusFilter = document.getElementById('statusFilter');
  const doctorFilter = document.getElementById('doctorFilter');
  
  if (!statusFilter || !doctorFilter) return;
  
  const selectedStatus = statusFilter.value;
  const selectedDoctor = doctorFilter.value;
  
  const filteredRequests = leaveRequests.filter(request => {
    const statusMatch = selectedStatus === 'all' || request.status === selectedStatus;
    const doctorMatch = selectedDoctor === 'all' || request.doctorName === selectedDoctor;
    return statusMatch && doctorMatch;
  });
  
  renderLeaveRequests(filteredRequests);
  updateLeaveStats(filteredRequests);
}

// Render leave requests in the container
function renderLeaveRequests(requests = leaveRequests) {
  const container = document.querySelector('.leave-requests-container');
  if (!container) return;
  
  if (requests.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 40px; color: #6b7280;">
        <i class="fas fa-inbox" style="font-size: 48px; margin-bottom: 16px; opacity: 0.5;"></i>
        <p style="font-size: 16px; margin: 0;">Không có đơn nghỉ phép nào</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = requests.map(request => createLeaveRequestCard(request)).join('');
}

// Create individual leave request card HTML
function createLeaveRequestCard(request) {
  const statusClass = request.status;
  const statusIcon = {
    pending: 'fas fa-clock',
    approved: 'fas fa-check-circle',
    rejected: 'fas fa-times-circle'
  }[request.status];
  
  const statusText = {
    pending: 'Chờ duyệt',
    approved: 'Đã duyệt',
    rejected: 'Đã từ chối'
  }[request.status];
  
  const actionButtons = request.status === 'pending' ? `
    <button class="btn-action approve" onclick="approveLeave(${request.id})">
      <i class="fas fa-check"></i>
      Duyệt
    </button>
    <button class="btn-action reject" onclick="showRejectModal(${request.id})">
      <i class="fas fa-times"></i>
      Từ chối
    </button>
  ` : '';
  
  return `
    <div class="leave-request-card ${statusClass}">
      <div class="leave-card-header">
        <div class="doctor-info">
          <div class="doctor-avatar">
            <i class="fas fa-user-md"></i>
          </div>
          <div class="doctor-details">
            <h4>${request.doctorName}</h4>
            <p>Chuyên khoa: ${request.doctorSpecialty}</p>
          </div>
        </div>
        <div class="leave-status">
          <span class="status-badge ${statusClass}">
            <i class="${statusIcon}"></i>
            ${statusText}
          </span>
        </div>
      </div>
      <div class="leave-card-body">
        <div class="leave-details">
          <div class="leave-detail-item">
            <i class="fas fa-calendar-day"></i>
            <div>
              <strong>Thời gian nghỉ:</strong>
              <span>${formatDateRange(request.startDate, request.endDate)} (${request.days} ngày)</span>
            </div>
          </div>
          <div class="leave-detail-item">
            <i class="fas fa-tag"></i>
            <div>
              <strong>Loại nghỉ phép:</strong>
              <span>${request.leaveType}</span>
            </div>
          </div>
          <div class="leave-detail-item">
            <i class="fas fa-comment"></i>
            <div>
              <strong>Lý do:</strong>
              <span>${request.reason}</span>
            </div>
          </div>
          <div class="leave-detail-item">
            <i class="fas fa-clock"></i>
            <div>
              <strong>Ngày đăng ký:</strong>
              <span>${formatDateTime(request.submitDate)}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="leave-card-actions">
        ${actionButtons}
        <button class="btn-action view-detail" onclick="viewLeaveDetail(${request.id})">
          <i class="fas fa-eye"></i>
          Chi tiết
        </button>
      </div>
    </div>
  `;
}

// Update leave statistics
function updateLeaveStats(requests = leaveRequests) {
  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const approvedCount = requests.filter(r => r.status === 'approved').length;
  const rejectedCount = requests.filter(r => r.status === 'rejected').length;
  const totalCount = requests.length;
  
  const pendingElement = document.getElementById('pendingCount');
  const approvedElement = document.getElementById('approvedCount');
  const rejectedElement = document.getElementById('rejectedCount');
  const totalElement = document.getElementById('totalLeaveCount');
  
  if (pendingElement) pendingElement.textContent = pendingCount;
  if (approvedElement) approvedElement.textContent = approvedCount;
  if (rejectedElement) rejectedElement.textContent = rejectedCount;
  if (totalElement) totalElement.textContent = totalCount;
}

// Approve leave request
function approveLeave(leaveId) {
  const request = leaveRequests.find(r => r.id === leaveId);
  if (!request) return;
  
  if (confirm(`Bạn có chắc chắn muốn duyệt đơn nghỉ phép của ${request.doctorName}?`)) {
    showLoading();
    
    // Simulate API call
    setTimeout(() => {
      request.status = 'approved';
      request.approvedDate = new Date().toISOString();
      request.approvedBy = 'Quản lý hiện tại';
      
      hideLoading();
      showSuccessMessage(`Đã duyệt đơn nghỉ phép của ${request.doctorName}!`);
      
      // Refresh display
      filterLeaveRequests();
    }, 1000);
  }
}

// Show reject modal
function showRejectModal(leaveId) {
  const request = leaveRequests.find(r => r.id === leaveId);
  if (!request) return;
  
  currentRejectingLeaveId = leaveId;
  
  // Populate modal with request info
  document.getElementById('rejectDoctorName').textContent = request.doctorName;
  document.getElementById('rejectLeaveDates').textContent = 
    `${formatDateRange(request.startDate, request.endDate)} (${request.days} ngày)`;
  
  // Clear reason textarea
  document.getElementById('rejectReason').value = '';
  
  // Show modal
  document.getElementById('rejectLeaveModal').style.display = 'block';
}

// Close reject modal
function closeRejectModal() {
  document.getElementById('rejectLeaveModal').style.display = 'none';
  currentRejectingLeaveId = null;
}

// Confirm reject leave
function confirmRejectLeave() {
  const reason = document.getElementById('rejectReason').value.trim();
  
  if (!reason) {
    alert('Vui lòng nhập lý do từ chối!');
    return;
  }
  
  if (!currentRejectingLeaveId) return;
  
  const request = leaveRequests.find(r => r.id === currentRejectingLeaveId);
  if (!request) return;
  
  showLoading();
  closeRejectModal();
  
  // Simulate API call
  setTimeout(() => {
    request.status = 'rejected';
    request.rejectedDate = new Date().toISOString();
    request.rejectedBy = 'Quản lý hiện tại';
    request.rejectReason = reason;
    
    hideLoading();
    showSuccessMessage(`Đã từ chối đơn nghỉ phép của ${request.doctorName}!`);
    
    // Refresh display
    filterLeaveRequests();
  }, 1000);
}

// View leave detail
function viewLeaveDetail(leaveId) {
  const request = leaveRequests.find(r => r.id === leaveId);
  if (!request) return;
  
  currentDetailLeaveId = leaveId;
  
  // Populate detail modal
  document.getElementById('detailDoctorName').textContent = request.doctorName;
  document.getElementById('detailDoctorSpecialty').textContent = request.doctorSpecialty;
  document.getElementById('detailDoctorEmail').textContent = request.doctorEmail;
  document.getElementById('detailLeaveType').textContent = request.leaveType;
  document.getElementById('detailLeaveDuration').textContent = 
    `${formatDateRange(request.startDate, request.endDate)}`;
  document.getElementById('detailLeaveDays').textContent = `${request.days} ngày`;
  document.getElementById('detailSubmitDate').textContent = formatDateTime(request.submitDate);
  document.getElementById('detailLeaveReason').textContent = request.reason;
  
  // Handle attachment
  const attachmentSection = document.getElementById('attachmentSection');
  if (request.attachment) {
    attachmentSection.style.display = 'block';
    const attachmentLink = document.getElementById('detailAttachment');
    attachmentLink.href = '#';
    attachmentLink.querySelector('span').textContent = request.attachment;
  } else {
    attachmentSection.style.display = 'none';
  }
  
  // Handle manager response
  const managerResponseSection = document.getElementById('managerResponseSection');
  if (request.status !== 'pending') {
    managerResponseSection.style.display = 'block';
    document.getElementById('detailManagerName').textContent = 
      request.approvedBy || request.rejectedBy || 'N/A';
    document.getElementById('detailResponseDate').textContent = 
      formatDateTime(request.approvedDate || request.rejectedDate);
    document.getElementById('detailManagerResponse').textContent = 
      request.rejectReason || 'Đơn nghỉ phép đã được duyệt.';
  } else {
    managerResponseSection.style.display = 'none';
  }
  
  // Show/hide action buttons
  const detailActions = document.getElementById('detailActions');
  if (request.status === 'pending') {
    detailActions.style.display = 'flex';
  } else {
    detailActions.style.display = 'none';
  }
  
  // Show modal
  document.getElementById('leaveDetailModal').style.display = 'block';
}

// Close detail modal
function closeDetailModal() {
  document.getElementById('leaveDetailModal').style.display = 'none';
  currentDetailLeaveId = null;
}

// Approve from detail modal
function approveFromDetail() {
  if (currentDetailLeaveId) {
    closeDetailModal();
    approveLeave(currentDetailLeaveId);
  }
}

// Reject from detail modal
function rejectFromDetail() {
  if (currentDetailLeaveId) {
    closeDetailModal();
    showRejectModal(currentDetailLeaveId);
  }
}

// Utility functions
function formatDateRange(startDate, endDate) {
  const start = new Date(startDate).toLocaleDateString('vi-VN');
  const end = new Date(endDate).toLocaleDateString('vi-VN');
  return `${start} - ${end}`;
}

function formatDateTime(dateTimeString) {
  return new Date(dateTimeString).toLocaleString('vi-VN');
}

// Close modals when clicking outside
window.onclick = function(event) {
  const rejectModal = document.getElementById('rejectLeaveModal');
  const detailModal = document.getElementById('leaveDetailModal');
  
  if (event.target === rejectModal) {
    closeRejectModal();
  }
  if (event.target === detailModal) {
    closeDetailModal();
  }
}

// Scroll to section function
function scrollToSection(sectionId) {
  const section = document.getElementById(sectionId);
  if (section) {
    section.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
    
    // Add a subtle highlight effect
    section.style.transition = 'box-shadow 0.3s ease';
    section.style.boxShadow = '0 0 20px rgba(74, 144, 226, 0.3)';
    
    setTimeout(() => {
      section.style.boxShadow = '';
    }, 2000);
  }
}

// Initialize leave management when page loads
document.addEventListener('DOMContentLoaded', function() {
  initializeLeaveManagement();
});