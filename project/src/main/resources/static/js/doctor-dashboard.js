// Doctor Dashboard JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Treatment Success Chart
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
    }

    // Interactive features for action items
    document.querySelectorAll('.action-item').forEach(item => {
        item.addEventListener('click', function() {
            const action = this.textContent.trim();
            showNotification(`Chức năng "${action}" sẽ được phát triển!`, 'info');
        });
    });

    // Doctor Notification System
    const doctorNotificationBtn = document.getElementById('doctorNotificationBtn');
    const doctorNotificationDropdown = document.getElementById('doctorNotificationDropdown');

    if (doctorNotificationBtn && doctorNotificationDropdown) {
        const doctorBadge = doctorNotificationBtn.querySelector('.notification-badge');

        doctorNotificationBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            doctorNotificationDropdown.classList.toggle('show');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!doctorNotificationDropdown.contains(e.target) && !doctorNotificationBtn.contains(e.target)) {
                doctorNotificationDropdown.classList.remove('show');
            }
        });

        // Mark notifications as read when dropdown opens
        doctorNotificationDropdown.addEventListener('click', function() {
            const unreadItems = this.querySelectorAll('.notification-dropdown-item.unread');
            let unreadCount = unreadItems.length;
            
            unreadItems.forEach((item, index) => {
                setTimeout(() => {
                    item.classList.remove('unread');
                    unreadCount--;
                    if (doctorBadge) {
                        doctorBadge.textContent = unreadCount;
                        if (unreadCount === 0) {
                            doctorBadge.style.display = 'none';
                        }
                    }
                }, (index + 1) * 500);
            });
        });

        // ESC key to close notification
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                doctorNotificationDropdown.classList.remove('show');
            }
        });
    }

    // Schedule item interactions
    document.querySelectorAll('.btn-small').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const scheduleItem = this.closest('.schedule-item');
            const patientName = scheduleItem.querySelector('strong').textContent;
            
            if (this.textContent.includes('Xem hồ sơ')) {
                showNotification(`Mở hồ sơ của ${patientName}`, 'success');
            } else if (this.textContent.includes('Đang khám')) {
                showNotification(`${patientName} đang trong quá trình khám`, 'info');
            }
        });
    });

    // Add hover effects to schedule items
    document.querySelectorAll('.schedule-item').forEach(item => {
        item.addEventListener('click', function() {
            if (!this.classList.contains('current')) {
                const patientName = this.querySelector('strong').textContent;
                const appointmentType = this.querySelector('.appointment-type').textContent;
                showNotification(`Chi tiết: ${patientName} - ${appointmentType}`, 'info');
            }
        });
    });

    // Add new notification function
    function addNewNotification(title, description, type = 'info') {
        const dropdown = document.getElementById('doctorNotificationDropdown');
        const notificationBody = dropdown?.querySelector('.notification-dropdown-body');
        const badge = document.querySelector('#doctorNotificationBtn .notification-badge');
        
        if (notificationBody) {
            const iconMap = {
                'info': 'fas fa-info-circle',
                'warning': 'fas fa-exclamation-triangle',
                'success': 'fas fa-check-circle',
                'appointment': 'fas fa-calendar-plus',
                'patient': 'fas fa-user-injured'
            };

            const newNotification = document.createElement('div');
            newNotification.className = 'notification-dropdown-item unread';
            newNotification.innerHTML = `
                <div class="notification-avatar">
                    <i class="${iconMap[type] || iconMap.info}"></i>
                </div>
                <div class="notification-content">
                    <div class="notification-title">${title}</div>
                    <div class="notification-description">${description}</div>
                    <div class="notification-time">Vừa xong</div>
                </div>
            `;

            notificationBody.insertBefore(newNotification, notificationBody.firstChild);

            // Update badge
            if (badge) {
                const currentCount = parseInt(badge.textContent) || 0;
                badge.textContent = currentCount + 1;
                badge.style.display = 'block';
            }
        }
    }

    // Notification display function
    function showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification-toast notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close">&times;</button>
        `;

        // Add styles if not exists
        if (!document.querySelector('#notification-toast-styles')) {
            const styles = document.createElement('style');
            styles.id = 'notification-toast-styles';
            styles.textContent = `
                .notification-toast {
                    position: fixed;
                    top: 80px;
                    right: 20px;
                    background: white;
                    border-left: 4px solid #2196f3;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                    border-radius: 8px;
                    padding: 16px;
                    max-width: 300px;
                    z-index: 1000;
                    animation: slideIn 0.3s ease;
                }
                .notification-toast.notification-success { border-left-color: #4caf50; }
                .notification-toast.notification-warning { border-left-color: #ff9800; }
                .notification-toast.notification-error { border-left-color: #f44336; }
                .notification-content {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .notification-close {
                    position: absolute;
                    top: 8px;
                    right: 8px;
                    background: none;
                    border: none;
                    font-size: 16px;
                    cursor: pointer;
                    color: #999;
                }
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(styles);
        }

        document.body.appendChild(notification);

        // Auto remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideIn 0.3s ease reverse';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);

        // Close button
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.style.animation = 'slideIn 0.3s ease reverse';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        });
    }

    // Simulate real-time notifications (for demo)
    let notificationInterval;
    function startNotificationDemo() {
        const notifications = [
            { title: 'Lịch hẹn mới', description: 'BN Trần Thị Lan đặt lịch khám ngày mai', type: 'appointment' },
            { title: 'Kết quả xét nghiệm', description: 'BN Nguyễn Văn A có kết quả mới', type: 'info' },
            { title: 'Cảnh báo thuốc', description: 'BN Phạm Thị B chưa tiêm thuốc đúng giờ', type: 'warning' },
            { title: 'Chu kỳ hoàn thành', description: 'BN Lê Thị C hoàn thành chu kỳ IVF thành công', type: 'success' }
        ];

        notificationInterval = setInterval(() => {
            const randomNotification = notifications[Math.floor(Math.random() * notifications.length)];
            addNewNotification(randomNotification.title, randomNotification.description, randomNotification.type);
        }, 30000); // Every 30 seconds
    }

    // Start demo notifications after 5 seconds
    setTimeout(startNotificationDemo, 5000);

    // Export functions for external use
    window.doctorDashboard = {
        addNewNotification,
        showNotification
    };
});