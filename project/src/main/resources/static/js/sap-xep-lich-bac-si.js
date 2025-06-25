// Enhanced JavaScript for schedule management
    const doctors = [
      { id: 'BS001', name: 'BS. Nguyễn Văn A' },
      { id: 'BS002', name: 'BS. Trần Thị B' },
      { id: 'BS003', name: 'BS. Lê Văn C' },
      { id: 'BS004', name: 'BS. Phạm Thị D' },
      { id: 'BS005', name: 'BS. Hoàng Văn E' },
      { id: 'BS006', name: 'BS. Đặng Thị F' }
    ];

    // Time slots configuration organized by sessions
    const timeSessions = {
      'T2': {
        morning: ['08:00-09:00', '09:00-10:00', '10:00-11:00', '11:00-12:00'],
        afternoon: ['14:00-15:00', '15:00-16:00', '16:00-17:00']
      },
      'T3': {
        morning: ['08:00-09:00', '09:00-10:00', '10:00-11:00', '11:00-12:00'],
        afternoon: ['14:00-15:00', '15:00-16:00', '16:00-17:00']
      },
      'T4': {
        morning: ['08:00-09:00', '09:00-10:00', '10:00-11:00', '11:00-12:00'],
        afternoon: ['14:00-15:00', '15:00-16:00', '16:00-17:00']
      },
      'T5': {
        morning: ['08:00-09:00', '09:00-10:00', '10:00-11:00', '11:00-12:00'],
        afternoon: ['14:00-15:00', '15:00-16:00', '16:00-17:00']
      },
      'T6': {
        morning: ['08:00-09:00', '09:00-10:00', '10:00-11:00', '11:00-12:00'],
        afternoon: ['14:00-15:00', '15:00-16:00', '16:00-17:00']
      },
      'T7': {
        morning: ['08:00-09:00', '09:00-10:00', '10:00-11:00', '11:00-12:00'],
        afternoon: []
      },
      'CN': {
        morning: ['08:00-09:00', '09:00-10:00', '10:00-11:00', '11:00-12:00'],
        afternoon: []
      }
    };

    // Enhanced schedule data with time slots
    const doctorSchedules = {
      'BS001': {
        'T2': { '08:00-09:00': true, '09:00-10:00': false, '10:00-11:00': true, '11:00-12:00': false, '14:00-15:00': false, '15:00-16:00': true, '16:00-17:00': false },
        'T3': { '08:00-09:00': true, '09:00-10:00': true, '10:00-11:00': false, '11:00-12:00': true, '14:00-15:00': true, '15:00-16:00': true, '16:00-17:00': false },
        'T4': { '08:00-09:00': false, '09:00-10:00': false, '10:00-11:00': false, '11:00-12:00': false, '14:00-15:00': true, '15:00-16:00': true, '16:00-17:00': true },
        'T5': { '08:00-09:00': true, '09:00-10:00': false, '10:00-11:00': true, '11:00-12:00': false, '14:00-15:00': false, '15:00-16:00': false, '16:00-17:00': false },
        'T6': { '08:00-09:00': false, '09:00-10:00': false, '10:00-11:00': false, '11:00-12:00': false, '14:00-15:00': false, '15:00-16:00': false, '16:00-17:00': false },
        'T7': { '08:00-09:00': false, '09:00-10:00': false, '10:00-11:00': false, '11:00-12:00': false },
        'CN': { '08:00-09:00': false, '09:00-10:00': false, '10:00-11:00': false, '11:00-12:00': false }
      },
      'BS002': {
        'T2': { '08:00-09:00': false, '09:00-10:00': false, '10:00-11:00': false, '11:00-12:00': false, '14:00-15:00': true, '15:00-16:00': true, '16:00-17:00': false },
        'T3': { '08:00-09:00': true, '09:00-10:00': true, '10:00-11:00': false, '11:00-12:00': false, '14:00-15:00': true, '15:00-16:00': false, '16:00-17:00': true },
        'T4': { '08:00-09:00': true, '09:00-10:00': false, '10:00-11:00': true, '11:00-12:00': false, '14:00-15:00': false, '15:00-16:00': false, '16:00-17:00': false },
        'T5': { '08:00-09:00': false, '09:00-10:00': false, '10:00-11:00': false, '11:00-12:00': false, '14:00-15:00': true, '15:00-16:00': true, '16:00-17:00': false },
        'T6': { '08:00-09:00': true, '09:00-10:00': false, '10:00-11:00': true, '11:00-12:00': false, '14:00-15:00': true, '15:00-16:00': false, '16:00-17:00': true },
        'T7': { '08:00-09:00': false, '09:00-10:00': false, '10:00-11:00': false, '11:00-12:00': false },
        'CN': { '08:00-09:00': false, '09:00-10:00': false, '10:00-11:00': false, '11:00-12:00': false }
      },
      'BS003': {
        'T2': { '08:00-09:00': true, '09:00-10:00': false, '10:00-11:00': false, '11:00-12:00': true, '14:00-15:00': false, '15:00-16:00': false, '16:00-17:00': false },
        'T3': { '08:00-09:00': false, '09:00-10:00': false, '10:00-11:00': false, '11:00-12:00': false, '14:00-15:00': true, '15:00-16:00': false, '16:00-17:00': true },
        'T4': { '08:00-09:00': true, '09:00-10:00': true, '10:00-11:00': false, '11:00-12:00': false, '14:00-15:00': true, '15:00-16:00': true, '16:00-17:00': false },
        'T5': { '08:00-09:00': false, '09:00-10:00': false, '10:00-11:00': false, '11:00-12:00': false, '14:00-15:00': false, '15:00-16:00': false, '16:00-17:00': false },
        'T6': { '08:00-09:00': true, '09:00-10:00': false, '10:00-11:00': false, '11:00-12:00': false, '14:00-15:00': false, '15:00-16:00': false, '16:00-17:00': false },
        'T7': { '08:00-09:00': false, '09:00-10:00': false, '10:00-11:00': false, '11:00-12:00': false },
        'CN': { '08:00-09:00': false, '09:00-10:00': false, '10:00-11:00': false, '11:00-12:00': false }
      },
      'BS004': {
        'T2': { '08:00-09:00': false, '09:00-10:00': false, '10:00-11:00': false, '11:00-12:00': false, '14:00-15:00': false, '15:00-16:00': false, '16:00-17:00': false },
        'T3': { '08:00-09:00': true, '09:00-10:00': false, '10:00-11:00': false, '11:00-12:00': false, '14:00-15:00': false, '15:00-16:00': false, '16:00-17:00': false },
        'T4': { '08:00-09:00': false, '09:00-10:00': false, '10:00-11:00': false, '11:00-12:00': false, '14:00-15:00': true, '15:00-16:00': false, '16:00-17:00': false },
        'T5': { '08:00-09:00': true, '09:00-10:00': false, '10:00-11:00': true, '11:00-12:00': false, '14:00-15:00': true, '15:00-16:00': false, '16:00-17:00': true },
        'T6': { '08:00-09:00': false, '09:00-10:00': false, '10:00-11:00': false, '11:00-12:00': false, '14:00-15:00': true, '15:00-16:00': false, '16:00-17:00': false },
        'T7': { '08:00-09:00': false, '09:00-10:00': false, '10:00-11:00': false, '11:00-12:00': false },
        'CN': { '08:00-09:00': false, '09:00-10:00': false, '10:00-11:00': false, '11:00-12:00': false }
      },
      'BS005': {
        'T2': { '08:00-09:00': true, '09:00-10:00': true, '10:00-11:00': false, '11:00-12:00': false, '14:00-15:00': true, '15:00-16:00': true, '16:00-17:00': false },
        'T3': { '08:00-09:00': false, '09:00-10:00': false, '10:00-11:00': false, '11:00-12:00': false, '14:00-15:00': false, '15:00-16:00': false, '16:00-17:00': false },
        'T4': { '08:00-09:00': true, '09:00-10:00': false, '10:00-11:00': false, '11:00-12:00': false, '14:00-15:00': false, '15:00-16:00': false, '16:00-17:00': false },
        'T5': { '08:00-09:00': false, '09:00-10:00': false, '10:00-11:00': false, '11:00-12:00': false, '14:00-15:00': true, '15:00-16:00': false, '16:00-17:00': false },
        'T6': { '08:00-09:00': true, '09:00-10:00': false, '10:00-11:00': false, '11:00-12:00': false, '14:00-15:00': false, '15:00-16:00': false, '16:00-17:00': false },
        'T7': { '08:00-09:00': false, '09:00-10:00': false, '10:00-11:00': false, '11:00-12:00': false },
        'CN': { '08:00-09:00': false, '09:00-10:00': false, '10:00-11:00': false, '11:00-12:00': false }
      },
      'BS006': {
        'T2': { '08:00-09:00': false, '09:00-10:00': false, '10:00-11:00': false, '11:00-12:00': false, '14:00-15:00': true, '15:00-16:00': false, '16:00-17:00': false },
        'T3': { '08:00-09:00': true, '09:00-10:00': false, '10:00-11:00': false, '11:00-12:00': false, '14:00-15:00': false, '15:00-16:00': false, '16:00-17:00': false },
        'T4': { '08:00-09:00': false, '09:00-10:00': false, '10:00-11:00': false, '11:00-12:00': false, '14:00-15:00': false, '15:00-16:00': false, '16:00-17:00': false },
        'T5': { '08:00-09:00': true, '09:00-10:00': false, '10:00-11:00': false, '11:00-12:00': false, '14:00-15:00': false, '15:00-16:00': false, '16:00-17:00': false },
        'T6': { '08:00-09:00': false, '09:00-10:00': false, '10:00-11:00': false, '11:00-12:00': false, '14:00-15:00': true, '15:00-16:00': false, '16:00-17:00': false },
        'T7': { '08:00-09:00': false, '09:00-10:00': false, '10:00-11:00': false, '11:00-12:00': false },
        'CN': { '08:00-09:00': false, '09:00-10:00': false, '10:00-11:00': false, '11:00-12:00': false }
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
          sessions.morning.forEach(slot => {
            totalSlots++;
            if (doctorSchedules[doctor.id]?.[day]?.[slot]) workingSlots++;
          });
          sessions.afternoon.forEach(slot => {
            totalSlots++;
            if (doctorSchedules[doctor.id]?.[day]?.[slot]) workingSlots++;
          });
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
      
      // Morning slots
      sessions.morning.forEach((slot, index) => {
        const isSelected = doctorSchedules[doctorId]?.[day]?.[slot] || false;
        const slotClass = dayIndex >= 5 ? 'weekend-slot' : 'morning-slot';
        
        slotsHTML += `
          <div class="time-slot ${slotClass} ${isSelected ? 'selected' : ''}" 
               data-doctor="${doctorId}" data-day="${day}" data-slot="${slot}"
               onclick="toggleTimeSlot(this)">
            <p class="slot-time">${slot}</p>
          </div>
        `;
      });
      
      // Session divider for weekdays
      if (sessions.afternoon.length > 0) {
        slotsHTML += '<div class="session-divider"></div>';
      }
      
      // Afternoon slots
      sessions.afternoon.forEach((slot, index) => {
        const isSelected = doctorSchedules[doctorId]?.[day]?.[slot] || false;
        
        slotsHTML += `
          <div class="time-slot afternoon-slot ${isSelected ? 'selected' : ''}" 
               data-doctor="${doctorId}" data-day="${day}" data-slot="${slot}"
               onclick="toggleTimeSlot(this)">
            <p class="slot-time">${slot}</p>
          </div>
        `;
      });
      
      return slotsHTML;
    }
    
    function toggleTimeSlot(element) {
      const doctor = element.getAttribute('data-doctor');
      const day = element.getAttribute('data-day');
      const slot = element.getAttribute('data-slot');
      
      // Toggle selection
      const isSelected = element.classList.contains('selected');
      
      if (isSelected) {
        element.classList.remove('selected');
        doctorSchedules[doctor][day][slot] = false;
      } else {
        element.classList.add('selected');
        if (!doctorSchedules[doctor]) doctorSchedules[doctor] = {};
        if (!doctorSchedules[doctor][day]) doctorSchedules[doctor][day] = {};
        doctorSchedules[doctor][day][slot] = true;
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
        sessions.morning.forEach(slot => {
          totalSlots++;
          if (doctorSchedules[doctorId]?.[day]?.[slot]) workingSlots++;
        });
        sessions.afternoon.forEach(slot => {
          totalSlots++;
          if (doctorSchedules[doctorId]?.[day]?.[slot]) workingSlots++;
        });
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
        totalPossibleShifts += (sessions.morning.length + sessions.afternoon.length) * doctors.length;
      });
      
      doctors.forEach(doctor => {
        let hasAnyShift = false;
        days.forEach(day => {
          const sessions = timeSessions[day];
          
          // Check morning slots
          sessions.morning.forEach(slot => {
            if (doctorSchedules[doctor.id]?.[day]?.[slot]) {
              totalShifts++;
              hasAnyShift = true;
            }
          });
          
          // Check afternoon slots
          sessions.afternoon.forEach(slot => {
            if (doctorSchedules[doctor.id]?.[day]?.[slot]) {
              totalShifts++;
              hasAnyShift = true;
            }
          });
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
          const slotTime = slot.getAttribute('data-slot');
          const isSelected = slot.classList.contains('selected');
          
          if (!doctorSchedules[doctor]) doctorSchedules[doctor] = {};
          if (!doctorSchedules[doctor][day]) doctorSchedules[doctor][day] = {};
          doctorSchedules[doctor][day][slotTime] = isSelected;
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
            sessions.morning.forEach(slot => {
              doctorSchedules[doctor.id][day][slot] = false;
            });
            sessions.afternoon.forEach(slot => {
              doctorSchedules[doctor.id][day][slot] = false;
            });
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
          const slotTime = slot.getAttribute('data-slot');
          
          if (!doctorSchedules[doctor]) doctorSchedules[doctor] = {};
          if (!doctorSchedules[doctor][day]) doctorSchedules[doctor][day] = {};
          doctorSchedules[doctor][day][slotTime] = true;
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
          const slotTime = slot.getAttribute('data-slot');
          
          if (doctorSchedules[doctor] && doctorSchedules[doctor][day]) {
            doctorSchedules[doctor][day][slotTime] = false;
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
      `;
      document.head.appendChild(style);
    }); 