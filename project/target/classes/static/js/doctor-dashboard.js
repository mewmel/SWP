// Bảng điều khiển bác sĩ - JavaScript
// Chứa các chức năng riêng cho dashboard bác sĩ

document.addEventListener('DOMContentLoaded', function() {
    // Chờ script.js load xong trước khi khởi tạo doctor dashboard
    setTimeout(function() {
        initDoctorDashboard();
    }, 200);
});

function initDoctorDashboard() {
    // Bắt buộc hiển thị chuông thông báo cho trang bác sĩ (override script.js logic)
    forceShowNotification();
    
    // Khởi tạo biểu đồ
    initTreatmentChart();
    
    // Khởi tạo tương tác dashboard
    initDashboardInteractions();
    
    // Khởi tạo hệ thống thông báo riêng cho bác sĩ
    initDoctorNotifications();
    
    console.log('Doctor Dashboard loaded successfully!');
}

// Hàm bắt buộc hiển thị chuông thông báo cho trang bác sĩ
function forceShowNotification() {
    const notificationWrapper = document.querySelector('.notification-wrapper');
    if (notificationWrapper) {
        notificationWrapper.style.display = 'block';
        notificationWrapper.style.visibility = 'visible';
        notificationWrapper.style.opacity = '1';
        
        // Đảm bảo chuông luôn hiển thị ngay cả khi script.js cố ẩn
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                    const target = mutation.target;
                    if (target.classList.contains('notification-wrapper')) {
                        if (target.style.display === 'none') {
                            target.style.display = 'block';
                            target.style.visibility = 'visible';
                            target.style.opacity = '1';
                        }
                    }
                }
            });
        });
        
        observer.observe(notificationWrapper, {
            attributes: true,
            attributeFilter: ['style']
        });
        
        console.log('Đã bắt buộc hiển thị chuông thông báo cho bác sĩ');
    }
}

// Khởi tạo biểu đồ điều trị
function initTreatmentChart() {
    const ctx = document.getElementById('treatmentChart');
    if (ctx) {
        const treatmentChart = new Chart(ctx.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: ['Thành công', 'Đang điều trị', 'Tạm hoãn'],
                datasets: [{
                    data: [78, 15, 7],
                    backgroundColor: [
                        'rgba(33, 150, 243, 0.8)',
                        'rgba(76, 175, 80, 0.8)', 
                        'rgba(255, 152, 0, 0.8)'
                    ],
                    borderColor: [
                        'rgb(33, 150, 243)',
                        'rgb(76, 175, 80)',
                        'rgb(255, 152, 0)'
                    ],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
        console.log('Biểu đồ điều trị đã được khởi tạo');
    }
}

// Khởi tạo tương tác dashboard
function initDashboardInteractions() {
    // Tương tác với các mục hành động sử dụng showNotification từ script.js
    document.querySelectorAll('.action-item').forEach(item => {
        item.addEventListener('click', function() {
            const action = this.textContent.trim();
            if (typeof showNotification === 'function') {
                showNotification(`Chức năng "${action}" sẽ được phát triển!`, 'info');
            }
        });
    });

    // Tương tác với các mục lịch khám
    document.querySelectorAll('.btn-small').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const scheduleItem = this.closest('.schedule-item');
            const patientName = scheduleItem.querySelector('strong').textContent;
            
            if (this.textContent.includes('Xem hồ sơ')) {
                if (typeof showNotification === 'function') {
                    showNotification(`Mở hồ sơ của ${patientName}`, 'success');
                }
            } else if (this.textContent.includes('Đang khám')) {
                if (typeof showNotification === 'function') {
                    showNotification(`${patientName} đang trong quá trình khám`, 'info');
                }
            }
        });
    });

    // Thêm hiệu ứng khi click vào các mục lịch
    document.querySelectorAll('.schedule-item').forEach(item => {
        item.addEventListener('click', function() {
            if (!this.classList.contains('current')) {
                const patientName = this.querySelector('strong').textContent;
                const appointmentType = this.querySelector('.appointment-type').textContent;
                if (typeof showNotification === 'function') {
                    showNotification(`Chi tiết: ${patientName} - ${appointmentType}`, 'info');
                }
            }
        });
    });
    
    console.log('Tương tác dashboard đã được khởi tạo');
}

// Hàm khởi tạo thông báo đặc biệt cho bác sĩ
function initDoctorNotifications() {
    // Thêm function đặc biệt cho bác sĩ sử dụng addNewNotification từ script.js
    window.addDoctorNotification = function(title, description, type = 'appointment') {
        // Mapping type cho bác sĩ
        let notificationType;
        switch(type) {
            case 'urgent-patient':
                notificationType = 'injection';
                break;
            case 'new-appointment':
                notificationType = 'appointment';
                break;
            case 'test-result':
                notificationType = 'test';
                break;
            case 'medication-alert':
                notificationType = 'injection';
                break;
            default:
                notificationType = 'message';
        }

        // Sử dụng function có sẵn trong script.js
        if (typeof addNewNotification === 'function') {
            addNewNotification(title, description, notificationType);
        }
    };

    // Function test thông báo cho bác sĩ
    window.testDoctorNotification = function() {
        const doctorNotifications = [
            { 
                title: 'Bệnh nhân cần chú ý khẩn', 
                desc: 'BN Nguyễn Thị Hoa - Phản ứng thuốc bất thường cần xử lý ngay', 
                type: 'urgent-patient' 
            },
            { 
                title: 'Lịch hẹn mới', 
                desc: 'BN Trần Văn Nam đặt lịch tư vấn IVF ngày mai lúc 9:00', 
                type: 'new-appointment' 
            },
            { 
                title: 'Kết quả xét nghiệm cần xem', 
                desc: '3 kết quả xét nghiệm hormone mới cần đánh giá', 
                type: 'test-result' 
            },
            { 
                title: 'Cảnh báo thuốc', 
                desc: 'BN Phạm Thị Lan chưa tiêm Gonal-F theo lịch', 
                type: 'medication-alert' 
            },
            { 
                title: 'Chu kỳ IVF hoàn thành', 
                desc: 'BN Lê Thị Mai hoàn thành chuyển phôi thành công', 
                type: 'new-appointment' 
            }
        ];
        
        const randomNotification = doctorNotifications[Math.floor(Math.random() * doctorNotifications.length)];
        addDoctorNotification(randomNotification.title, randomNotification.desc, randomNotification.type);
        
        // Hiển thị toast notification
        if (typeof showNotification === 'function') {
            showNotification('Đã thêm thông báo mới cho bác sĩ!', 'success');
        }
    };

    // Tự động tạo thông báo demo cho bác sĩ (bỏ comment để test)
    // setInterval(function() {
    //     if (Math.random() > 0.7) { // 30% chance mỗi 15 giây
    //         testDoctorNotification();
    //     }
    // }, 15000);

    // Thêm button test vào console để demo
    console.log('Doctor Notifications initialized! Sử dụng testDoctorNotification() để test thông báo bác sĩ');
}

// Hàm đặc biệt cho dashboard bác sĩ
window.doctorDashboard = {
    // Sử dụng showNotification từ script.js
    showMessage: function(message, type = 'info') {
        if (typeof showNotification === 'function') {
            showNotification(message, type);
        }
    },
    
    // Thêm thông báo cho bác sĩ
    addNotification: function(title, description, type = 'appointment') {
        if (typeof addDoctorNotification === 'function') {
            addDoctorNotification(title, description, type);
        }
    },
    
    // Test function
    test: function() {
        if (typeof testDoctorNotification === 'function') {
            testDoctorNotification();
        }
    },
    
    // Cập nhật thống kê dashboard
    updateStats: function(todayPatients, totalPatients, successRate, pendingTests) {
        const cards = document.querySelectorAll('.overview-card .value');
        if (cards.length >= 4) {
            cards[0].textContent = todayPatients;
            cards[1].textContent = totalPatients;
            cards[2].textContent = successRate + '%';
            cards[3].textContent = pendingTests;
            
            this.showMessage('Đã cập nhật thống kê dashboard!', 'success');
        }
    },
    
    // Thêm bệnh nhân vào lịch trình
    addScheduleItem: function(time, patientName, appointmentType) {
        const scheduleContainer = document.querySelector('.doctor-schedule');
        if (scheduleContainer) {
            const newItem = document.createElement('div');
            newItem.className = 'schedule-item';
            newItem.innerHTML = `
                <div class="schedule-time">${time}</div>
                <div class="schedule-content">
                    <div class="patient-info">
                        <strong>BN: ${patientName}</strong>
                        <span class="appointment-type">${appointmentType}</span>
                    </div>
                    <div class="schedule-actions">
                        <button class="btn-small btn-primary">Xem hồ sơ</button>
                    </div>
                </div>
            `;
            
            scheduleContainer.appendChild(newItem);
            
            // Thêm event listener cho item mới
            const newBtn = newItem.querySelector('.btn-small');
            newBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                if (typeof showNotification === 'function') {
                    showNotification(`Mở hồ sơ của BN: ${patientName}`, 'success');
                }
            });
            
            this.showMessage(`Đã thêm lịch hẹn ${time} - ${patientName}`, 'success');
        }
    }
};
// Bảng điều khiển bác sĩ - JavaScript
// Chứa các chức năng riêng cho dashboard bác sĩ

document.addEventListener('DOMContentLoaded', function() {
    // Chờ script.js load xong trước khi khởi tạo doctor dashboard
    setTimeout(function() {
        initDoctorDashboard();
    }, 200);
});

function initDoctorDashboard() {
    // Bắt buộc hiển thị chuông thông báo cho trang bác sĩ (override script.js logic)
    forceShowNotification();
    
    // Khởi tạo biểu đồ
    initTreatmentChart();
    
    // Khởi tạo tương tác dashboard
    initDashboardInteractions();
    
    // Khởi tạo hệ thống thông báo riêng cho bác sĩ
    initDoctorNotifications();
    
    console.log('Doctor Dashboard loaded successfully!');
}

// Hàm bắt buộc hiển thị chuông thông báo cho trang bác sĩ
function forceShowNotification() {
    const notificationWrapper = document.querySelector('.notification-wrapper');
    if (notificationWrapper) {
        notificationWrapper.style.display = 'block';
        notificationWrapper.style.visibility = 'visible';
        notificationWrapper.style.opacity = '1';
        
        // Đảm bảo chuông luôn hiển thị ngay cả khi script.js cố ẩn
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                    const target = mutation.target;
                    if (target.classList.contains('notification-wrapper')) {
                        if (target.style.display === 'none') {
                            target.style.display = 'block';
                            target.style.visibility = 'visible';
                            target.style.opacity = '1';
                        }
                    }
                }
            });
        });
        
        observer.observe(notificationWrapper, {
            attributes: true,
            attributeFilter: ['style']
        });
        
        console.log('Đã bắt buộc hiển thị chuông thông báo cho bác sĩ');
    }
}

// Khởi tạo biểu đồ điều trị
function initTreatmentChart() {
    const ctx = document.getElementById('treatmentChart');
    if (ctx) {
        const treatmentChart = new Chart(ctx.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: ['Thành công', 'Đang điều trị', 'Tạm hoãn'],
                datasets: [{
                    data: [78, 15, 7],
                    backgroundColor: [
                        'rgba(33, 150, 243, 0.8)',
                        'rgba(76, 175, 80, 0.8)', 
                        'rgba(255, 152, 0, 0.8)'
                    ],
                    borderColor: [
                        'rgb(33, 150, 243)',
                        'rgb(76, 175, 80)',
                        'rgb(255, 152, 0)'
                    ],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
        console.log('Biểu đồ điều trị đã được khởi tạo');
    }
}

// Khởi tạo tương tác dashboard
function initDashboardInteractions() {
    // Tương tác với các mục hành động sử dụng showNotification từ script.js
    document.querySelectorAll('.action-item').forEach(item => {
        item.addEventListener('click', function() {
            const action = this.textContent.trim();
            if (typeof showNotification === 'function') {
                showNotification(`Chức năng "${action}" sẽ được phát triển!`, 'info');
            }
        });
    });

    // Tương tác với các mục lịch khám
    document.querySelectorAll('.btn-small').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const scheduleItem = this.closest('.schedule-item');
            const patientName = scheduleItem.querySelector('strong').textContent;
            
            if (this.textContent.includes('Xem hồ sơ')) {
                if (typeof showNotification === 'function') {
                    showNotification(`Mở hồ sơ của ${patientName}`, 'success');
                }
            } else if (this.textContent.includes('Đang khám')) {
                if (typeof showNotification === 'function') {
                    showNotification(`${patientName} đang trong quá trình khám`, 'info');
                }
            }
        });
    });

    // Thêm hiệu ứng khi click vào các mục lịch
    document.querySelectorAll('.schedule-item').forEach(item => {
        item.addEventListener('click', function() {
            if (!this.classList.contains('current')) {
                const patientName = this.querySelector('strong').textContent;
                const appointmentType = this.querySelector('.appointment-type').textContent;
                if (typeof showNotification === 'function') {
                    showNotification(`Chi tiết: ${patientName} - ${appointmentType}`, 'info');
                }
            }
        });
    });
    
    console.log('Tương tác dashboard đã được khởi tạo');
}

// Hàm khởi tạo thông báo đặc biệt cho bác sĩ
function initDoctorNotifications() {
    // Thêm function đặc biệt cho bác sĩ sử dụng addNewNotification từ script.js
    window.addDoctorNotification = function(title, description, type = 'appointment') {
        // Mapping type cho bác sĩ
        let notificationType;
        switch(type) {
            case 'urgent-patient':
                notificationType = 'injection';
                break;
            case 'new-appointment':
                notificationType = 'appointment';
                break;
            case 'test-result':
                notificationType = 'test';
                break;
            case 'medication-alert':
                notificationType = 'injection';
                break;
            default:
                notificationType = 'message';
        }

        // Sử dụng function có sẵn trong script.js
        if (typeof addNewNotification === 'function') {
            addNewNotification(title, description, notificationType);
        }
    };

    // Function test thông báo cho bác sĩ
    window.testDoctorNotification = function() {
        const doctorNotifications = [
            { 
                title: 'Bệnh nhân cần chú ý khẩn', 
                desc: 'BN Nguyễn Thị Hoa - Phản ứng thuốc bất thường cần xử lý ngay', 
                type: 'urgent-patient' 
            },
            { 
                title: 'Lịch hẹn mới', 
                desc: 'BN Trần Văn Nam đặt lịch tư vấn IVF ngày mai lúc 9:00', 
                type: 'new-appointment' 
            },
            { 
                title: 'Kết quả xét nghiệm cần xem', 
                desc: '3 kết quả xét nghiệm hormone mới cần đánh giá', 
                type: 'test-result' 
            },
            { 
                title: 'Cảnh báo thuốc', 
                desc: 'BN Phạm Thị Lan chưa tiêm Gonal-F theo lịch', 
                type: 'medication-alert' 
            },
            { 
                title: 'Chu kỳ IVF hoàn thành', 
                desc: 'BN Lê Thị Mai hoàn thành chuyển phôi thành công', 
                type: 'new-appointment' 
            }
        ];
        
        const randomNotification = doctorNotifications[Math.floor(Math.random() * doctorNotifications.length)];
        addDoctorNotification(randomNotification.title, randomNotification.desc, randomNotification.type);
        
        // Hiển thị toast notification
        if (typeof showNotification === 'function') {
            showNotification('Đã thêm thông báo mới cho bác sĩ!', 'success');
        }
    };

    // Tự động tạo thông báo demo cho bác sĩ (bỏ comment để test)
    // setInterval(function() {
    //     if (Math.random() > 0.7) { // 30% chance mỗi 15 giây
    //         testDoctorNotification();
    //     }
    // }, 15000);

    // Thêm button test vào console để demo
    console.log('Doctor Notifications initialized! Sử dụng testDoctorNotification() để test thông báo bác sĩ');
}

// Hàm đặc biệt cho dashboard bác sĩ
window.doctorDashboard = {
    // Sử dụng showNotification từ script.js
    showMessage: function(message, type = 'info') {
        if (typeof showNotification === 'function') {
            showNotification(message, type);
        }
    },
    
    // Thêm thông báo cho bác sĩ
    addNotification: function(title, description, type = 'appointment') {
        if (typeof addDoctorNotification === 'function') {
            addDoctorNotification(title, description, type);
        }
    },
    
    // Test function
    test: function() {
        if (typeof testDoctorNotification === 'function') {
            testDoctorNotification();
        }
    },
    
    // Cập nhật thống kê dashboard
    updateStats: function(todayPatients, totalPatients, successRate, pendingTests) {
        const cards = document.querySelectorAll('.overview-card .value');
        if (cards.length >= 4) {
            cards[0].textContent = todayPatients;
            cards[1].textContent = totalPatients;
            cards[2].textContent = successRate + '%';
            cards[3].textContent = pendingTests;
            
            this.showMessage('Đã cập nhật thống kê dashboard!', 'success');
        }
    },
    
    // Thêm bệnh nhân vào lịch trình
    addScheduleItem: function(time, patientName, appointmentType) {
        const scheduleContainer = document.querySelector('.doctor-schedule');
        if (scheduleContainer) {
            const newItem = document.createElement('div');
            newItem.className = 'schedule-item';
            newItem.innerHTML = `
                <div class="schedule-time">${time}</div>
                <div class="schedule-content">
                    <div class="patient-info">
                        <strong>BN: ${patientName}</strong>
                        <span class="appointment-type">${appointmentType}</span>
                    </div>
                    <div class="schedule-actions">
                        <button class="btn-small btn-primary">Xem hồ sơ</button>
                    </div>
                </div>
            `;
            
            scheduleContainer.appendChild(newItem);
            
            // Thêm event listener cho item mới
            const newBtn = newItem.querySelector('.btn-small');
            newBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                if (typeof showNotification === 'function') {
                    showNotification(`Mở hồ sơ của BN: ${patientName}`, 'success');
                }
            });
            
            this.showMessage(`Đã thêm lịch hẹn ${time} - ${patientName}`, 'success');
        }
    }
};

