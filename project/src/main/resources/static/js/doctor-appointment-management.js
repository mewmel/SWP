// document.addEventListener('DOMContentLoaded', function() {
//     // Kiểm tra đăng nhập
//     const docId = localStorage.getItem('docId');
//     const docFullName = localStorage.getItem('docFullName');

//     if (!docId) {
//         window.location.href = 'index.html';
//         return;
//     }

//     // Hiển thị tên bác sĩ
//     const userNameSpan = document.querySelector('.user-name');
//     if (userNameSpan && docFullName) {
//         userNameSpan.textContent = docFullName;
//         document.querySelector('.user-menu').style.display = 'flex';
//     }

//     // Load appointments khi trang được tải
//     loadAppointments();

//     // Xử lý đăng xuất
//     const logoutBtn = document.querySelector('.logout-btn');
//     if (logoutBtn) {
//         logoutBtn.addEventListener('click', function(e) {
//             e.preventDefault();
//             localStorage.clear();
//             window.location.href = 'index.html';
//         });
//     }


// let currentAppointments = [];
// let currentBookId = null;

// // Load appointments từ API - SỬA URL
// async function loadAppointments() {
//     const docId = localStorage.getItem('docId');
//     if (!docId) return;

//     showLoading();

//     try {
//         const response = await fetch(`/api/booking/doctor/${docId}`);
//         if (!response.ok) throw new Error('Không thể tải danh sách lịch hẹn');

//         currentAppointments = await response.json();
//         displayAppointments(currentAppointments);
//         updatePendingCount();

//     } catch (error) {
//         console.error('Error loading appointments:', error);
//         showError('Không thể tải danh sách lịch hẹn. Vui lòng thử lại.');
//         currentAppointments = [];
//         displayAppointments([]);
//     } finally {
//         hideLoading();
//     }
// }

// // Hiển thị danh sách bookings - SỬA: Dùng template thay vì innerHTML
// function displayAppointments(bookings) {
//     const container = document.getElementById('appointmentsList');
//     const noAppointments = document.getElementById('noAppointments');
//     const template = document.getElementById('bookingTemplate');

//     // Clear container trừ template
//     const existingCards = container.querySelectorAll('.appointment-card:not(.template)');
//     existingCards.forEach(card => card.remove());

//     if (!bookings || bookings.length === 0) {
//         noAppointments.style.display = 'block';
//         return;
//     }

//     noAppointments.style.display = 'none';

//     // Clone template cho mỗi booking
//     bookings.forEach(booking => {
//         const card = template.cloneNode(true);
//         card.classList.remove('template');
//         card.style.display = 'block';
//         card.id = `booking-${booking.bookId}`;

//         // Fill data vào các element
//         card.querySelector('#patientName').textContent = `Booking #${booking.bookId}`;
//         card.querySelector('#appointmentTime').textContent = formatDateTime(booking.bookDate, booking.bookTime);
//         card.querySelector('#customerId').textContent = booking.cusId || 'N/A';
//         card.querySelector('#serviceId').textContent = booking.serviceId || 'N/A';

//         const statusBadge = card.querySelector('#statusBadge');
//         statusBadge.textContent = getStatusText(booking.bookStatus);
//         statusBadge.className = `status-badge status-${booking.bookStatus.toLowerCase()}`;

//         // Handle note
//         const noteDiv = card.querySelector('#appointmentNote');
//         if (booking.note) {
//             noteDiv.style.display = 'block';
//             card.querySelector('#noteText').textContent = booking.note;
//         } else {
//             noteDiv.style.display = 'none';
//         }

//         // Handle buttons
//         const btnView = card.querySelector('#btnView');
//         const btnConfirm = card.querySelector('#btnConfirm');
//         const btnReject = card.querySelector('#btnReject');

//         // Set unique IDs
//         btnView.id = `btnView-${booking.bookId}`;
//         btnConfirm.id = `btnConfirm-${booking.bookId}`;
//         btnReject.id = `btnReject-${booking.bookId}`;

//         // Add event listeners
//         btnView.onclick = () => showAppointmentDetail(booking.bookId);
//         card.onclick = () => showAppointmentDetail(booking.bookId);

//         if (booking.bookStatus === 'pending') {
//             btnConfirm.style.display = 'inline-block';
//             btnReject.style.display = 'inline-block';

//             btnConfirm.onclick = (e) => {
//                 e.stopPropagation();
//                 quickConfirm(booking.bookId);
//             };
//             btnReject.onclick = (e) => {
//                 e.stopPropagation();
//                 quickReject(booking.bookId);
//             };
//         } else {
//             btnConfirm.style.display = 'none';
//             btnReject.style.display = 'none';
//         }

//         // Add to container
//         container.appendChild(card);
//     });
// }

// // Hiển thị chi tiết booking - SỬA URL VÀ VARIABLE
// async function showAppointmentDetail(bookId) {
//     currentBookId = bookId;

//     try {
//         // SỬA: Dùng API booking
//         const response = await fetch(`/api/booking/${bookId}`);
//         if (!response.ok) throw new Error('Không thể tải chi tiết lịch hẹn');

//         const booking = await response.json();

//         // Fill dữ liệu vào modal - SỬA: Dùng booking fields
//         document.getElementById('detailPatientName').textContent = `Customer ID: ${booking.cusId}`;
//         document.getElementById('detailPatientPhone').textContent = 'N/A';
//         document.getElementById('detailPatientEmail').textContent = 'N/A';
//         document.getElementById('detailPatientAge').textContent = 'N/A';

//         document.getElementById('detailAppointmentDate').textContent = formatDate(booking.bookDate);
//         document.getElementById('detailAppointmentTime').textContent = booking.bookTime;
//         document.getElementById('detailService').textContent = `Service ID: ${booking.serviceId || 'N/A'}`;

//         const statusElement = document.getElementById('detailStatus');
//         statusElement.textContent = getStatusText(booking.bookStatus);
//         statusElement.className = `status-badge status-${booking.bookStatus.toLowerCase()}`;

//         document.getElementById('detailNote').textContent = booking.note || 'Không có ghi chú';
//         document.getElementById('doctorNote').value = booking.doctorNote || '';

//         // Hiển thị/ẩn action buttons
//         const actionButtons = document.getElementById('appointmentActions');
//         if (booking.bookStatus === 'pending') {
//             actionButtons.style.display = 'flex';
//         } else {
//             actionButtons.style.display = 'none';
//         }

//         // Hiển thị modal
//         document.getElementById('appointmentDetailModal').style.display = 'block';

//     } catch (error) {
//         console.error('Error loading appointment detail:', error);
//         showError('Không thể tải chi tiết lịch hẹn');
//     }
// }

// // Xác nhận booking - SỬA API
// async function confirmAppointment() {
//     if (!currentBookId) return;

//     const doctorNote = document.getElementById('doctorNote').value.trim();

//     try {
//         // SỬA: Dùng API status mới
//         const response = await fetch(`/api/booking/${currentBookId}/status?status=confirmed${doctorNote ? '&doctorNote=' + encodeURIComponent(doctorNote) : ''}`, {
//             method: 'PUT'
//         });

//         if (!response.ok) {
//             const errorText = await response.text();
//             throw new Error(errorText || 'Không thể xác nhận lịch hẹn');
//         }

//         showSuccess('Đã xác nhận lịch hẹn thành công!');
//         closeDetailModal();
//         loadAppointments();

//     } catch (error) {
//         console.error('Error confirming appointment:', error);
//         showError('Không thể xác nhận lịch hẹn. Vui lòng thử lại.');
//     }
// }

// // Từ chối booking - SỬA API
// async function rejectAppointment() {
//     if (!currentBookId) return;

//     const doctorNote = document.getElementById('doctorNote').value.trim();
//     if (!doctorNote) {
//         showError('Vui lòng nhập lý do từ chối!');
//         return;
//     }

//     try {
//         // SỬA: Dùng API status mới
//         const response = await fetch(`/api/booking/${currentBookId}/status?status=rejected&doctorNote=${encodeURIComponent(doctorNote)}`, {
//             method: 'PUT'
//         });

//         if (!response.ok) {
//             const errorText = await response.text();
//             throw new Error(errorText || 'Không thể từ chối lịch hẹn');
//         }

//         showSuccess('Đã từ chối lịch hẹn!');
//         closeDetailModal();
//         loadAppointments();

//     } catch (error) {
//         console.error('Error rejecting appointment:', error);
//         showError('Không thể từ chối lịch hẹn. Vui lòng thử lại.');
//     }
// }

// // Quick actions - SỬA API
// async function quickConfirm(bookId) {
//     try {
//         // SỬA: Dùng API status mới
//         const response = await fetch(`/api/booking/${bookId}/status?status=confirmed&doctorNote=Đã xác nhận nhanh`, {
//             method: 'PUT'
//         });

//         if (!response.ok) {
//             const errorText = await response.text();
//             throw new Error(errorText || 'Không thể xác nhận lịch hẹn');
//         }

//         showSuccess('Đã xác nhận booking!');
//         loadAppointments();

//     } catch (error) {
//         console.error('Error confirming booking:', error);
//         showError('Không thể xác nhận booking');
//     }
// }

// async function quickReject(bookId) {
//     const reason = prompt('Nhập lý do từ chối:');
//     if (!reason) return;

//     try {
//         // SỬA: Dùng API status mới
//         const response = await fetch(`/api/booking/${bookId}/status?status=rejected&doctorNote=${encodeURIComponent(reason)}`, {
//             method: 'PUT'
//         });

//         if (!response.ok) {
//             const errorText = await response.text();
//             throw new Error(errorText || 'Không thể từ chối booking');
//         }

//         showSuccess('Đã từ chối booking!');
//         loadAppointments();

//     } catch (error) {
//         console.error('Error rejecting booking:', error);
//         showError('Không thể từ chối booking');
//     }
// }

// // Filter appointments
// function filterAppointments() {
//     const statusFilter = document.getElementById('statusFilter').value;
//     const dateFilter = document.getElementById('dateFilter').value;

//     let filtered = currentAppointments;

//     if (statusFilter !== 'all') {
//         filtered = filtered.filter(apt => apt.bookStatus === statusFilter);
//     }

//     if (dateFilter) {
//         filtered = filtered.filter(apt => {
//             const aptDate = new Date(apt.bookDate).toISOString().split('T')[0];
//             return aptDate === dateFilter;
//         });
//     }

//     displayAppointments(filtered);
// }

// // Search appointments
// function searchAppointments() {
//     const searchTerm = document.getElementById('searchPatient').value.toLowerCase();

//     const filtered = currentAppointments.filter(apt =>
//         apt.bookId.toString().includes(searchTerm) ||
//         (apt.cusId && apt.cusId.toString().includes(searchTerm))
//     );

//     displayAppointments(filtered);
// }

// // Close modal - SỬA VARIABLE NAME
// function closeDetailModal() {
//     document.getElementById('appointmentDetailModal').style.display = 'none';
//     currentBookId = null;
// }

// // Utility functions
// function formatDateTime(date, time) {
//     return `${formatDate(date)} ${time}`;
// }

// function formatDate(dateString) {
//     if (!dateString) return 'N/A';
//     const date = new Date(dateString);
//     return date.toLocaleDateString('vi-VN');
// }

// function calculateAge(dobString) {
//     if (!dobString) return 'N/A';
//     const dob = new Date(dobString);
//     const now = new Date();
//     let age = now.getFullYear() - dob.getFullYear();
//     const monthDiff = now.getMonth() - dob.getMonth();
//     if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < dob.getDate())) {
//         age--;
//     }
//     return age;
// }

// function getStatusText(status) {
//     const statusMap = {
//         'pending': 'Chờ xác nhận',
//         'confirmed': 'Đã xác nhận',
//         'rejected': 'Đã từ chối',
//         'completed': 'Đã hoàn thành'
//     };
//     return statusMap[status] || status;
// }

// function updatePendingCount() {
//     const pendingCount = currentAppointments.filter(apt => apt.bookStatus === 'pending').length;
//     document.getElementById('pendingCount').textContent = pendingCount;
// }

// function showLoading() {
//     document.getElementById('loadingSpinner').style.display = 'block';
// }

// function hideLoading() {
//     document.getElementById('loadingSpinner').style.display = 'none';
// }

// function showSuccess(message) {
//     if (typeof showNotification === 'function') {
//         showNotification(message, 'success');
//     } else {
//         alert(message);
//     }
// }

// function showError(message) {
//     if (typeof showNotification === 'function') {
//         showNotification(message, 'error');
//     } else {
//         alert(message);
//     }
// }

// // Close modal when clicking outside
// window.onclick = function(event) {
//     const modal = document.getElementById('appointmentDetailModal');
//     if (event.target === modal) {
//         closeDetailModal();
//     }
// }

// });
document.addEventListener('DOMContentLoaded', function() {
    // Kiểm tra đăng nhập
    const docId = localStorage.getItem('docId');
    const docFullName = localStorage.getItem('docFullName');

    if (!docId) {
        window.location.href = 'index.html';
        return;
    }

    // Hiển thị tên bác sĩ
    const userNameSpan = document.querySelector('.user-name');
    if (userNameSpan && docFullName) {
        userNameSpan.textContent = docFullName;
        document.querySelector('.user-menu').style.display = 'flex';
    }

    // Load bookings khi trang được tải
    loadBookings();

    // Xử lý đăng xuất
    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            localStorage.clear();
            window.location.href = 'index.html';
        });
    }
});

let currentBookings = [];
let currentBookId = null;

// ===== MAKE FUNCTIONS GLOBAL =====
window.loadBookings = loadBookings;
window.filterBookings = filterBookings;
window.showBookingDetail = showBookingDetail;
window.confirmBooking = confirmBooking;
window.rejectBooking = rejectBooking;
window.closeDetailModal = closeDetailModal;

// Load bookings từ API
async function loadBookings() {
    const docId = localStorage.getItem('docId');
    if (!docId) return;

    showLoading();

    try {
        const response = await fetch(`/api/booking/doctor/${docId}`);
        if (!response.ok) throw new Error('Không thể tải danh sách booking');

        currentBookings = await response.json();
        displayBookings(currentBookings);
        updatePendingCount();

    } catch (error) {
        console.error('Error loading bookings:', error);
        showError('Không thể tải danh sách booking. Vui lòng thử lại.');
        currentBookings = [];
        displayBookings([]);
    } finally {
        hideLoading();
    }
}

// Hiển thị danh sách bookings
function displayBookings(bookings) {
    const container = document.getElementById('appointmentsList');
    const noBookings = document.getElementById('noAppointments');
    const template = document.getElementById('bookingTemplate');

    // Clear container trừ template
    const existingCards = container.querySelectorAll('.appointment-card:not(.template)');
    existingCards.forEach(card => card.remove());

    if (!bookings || bookings.length === 0) {
        noBookings.style.display = 'block';
        return;
    }

    noBookings.style.display = 'none';

    // Clone template cho mỗi booking
    bookings.forEach(booking => {
        const card = template.cloneNode(true);
        card.classList.remove('template');
        card.style.display = 'block';
        card.id = `booking-${booking.bookId}`;

        // Fill data vào các element
        card.querySelector('#patientName').textContent = `Booking #${booking.bookId}`;
        card.querySelector('#appointmentTime').textContent = formatDateTime(booking.bookDate, booking.bookTime);
        card.querySelector('#customerId').textContent = booking.cusId || 'N/A';
        card.querySelector('#serviceId').textContent = booking.serviceId || 'N/A';

        const statusBadge = card.querySelector('#statusBadge');
        statusBadge.textContent = getStatusText(booking.bookStatus);
        statusBadge.className = `status-badge status-${booking.bookStatus.toLowerCase()}`;

        // Handle note
        const noteDiv = card.querySelector('#appointmentNote');
        if (booking.note) {
            noteDiv.style.display = 'block';
            card.querySelector('#noteText').textContent = booking.note;
        } else {
            noteDiv.style.display = 'none';
        }

        // Handle buttons
        const btnView = card.querySelector('#btnView');
        const btnConfirm = card.querySelector('#btnConfirm');
        const btnReject = card.querySelector('#btnReject');

        // Set unique IDs
        btnView.id = `btnView-${booking.bookId}`;
        btnConfirm.id = `btnConfirm-${booking.bookId}`;
        btnReject.id = `btnReject-${booking.bookId}`;

        // Add event listeners
        btnView.onclick = () => showBookingDetail(booking.bookId);
        card.onclick = () => showBookingDetail(booking.bookId);

        if (booking.bookStatus === 'pending') {
            btnConfirm.style.display = 'inline-block';
            btnReject.style.display = 'inline-block';

            btnConfirm.onclick = (e) => {
                e.stopPropagation();
                quickConfirm(booking.bookId);
            };
            btnReject.onclick = (e) => {
                e.stopPropagation();
                quickReject(booking.bookId);
            };
        } else {
            btnConfirm.style.display = 'none';
            btnReject.style.display = 'none';
        }

        container.appendChild(card);
    });
}

// Hiển thị chi tiết booking
async function showBookingDetail(bookId) {
    currentBookId = bookId;

    try {
        const response = await fetch(`/api/booking/${bookId}`);
        if (!response.ok) throw new Error('Không thể tải chi tiết booking');

        const booking = await response.json();

        // Fill dữ liệu vào modal
        document.getElementById('detailPatientName').textContent = `Customer ID: ${booking.cusId}`;
        document.getElementById('detailPatientPhone').textContent = 'N/A';
        document.getElementById('detailPatientEmail').textContent = 'N/A';
        document.getElementById('detailPatientAge').textContent = 'N/A';

        document.getElementById('detailAppointmentDate').textContent = formatDate(booking.bookDate);
        document.getElementById('detailAppointmentTime').textContent = booking.bookTime;
        document.getElementById('detailService').textContent = `Service ID: ${booking.serviceId || 'N/A'}`;

        const statusElement = document.getElementById('detailStatus');
        statusElement.textContent = getStatusText(booking.bookStatus);
        statusElement.className = `status-badge status-${booking.bookStatus.toLowerCase()}`;

        document.getElementById('detailNote').textContent = booking.note || 'Không có ghi chú';
        document.getElementById('doctorNote').value = booking.doctorNote || '';

        // Hiển thị/ẩn action buttons
        const actionButtons = document.getElementById('appointmentActions');
        if (booking.bookStatus === 'pending') {
            actionButtons.style.display = 'flex';
        } else {
            actionButtons.style.display = 'none';
        }

        document.getElementById('appointmentDetailModal').style.display = 'block';

    } catch (error) {
        console.error('Error loading booking detail:', error);
        showError('Không thể tải chi tiết booking');
    }
}

// Xác nhận booking
async function confirmBooking() {
    if (!currentBookId) return;

    const doctorNote = document.getElementById('doctorNote').value.trim();

    try {
        // 1. Đổi trạng thái booking
        const response = await fetch(`/api/booking/${currentBookId}/status?status=confirmed${doctorNote ? '&doctorNote=' + encodeURIComponent(doctorNote) : ''}`, {
            method: 'PUT'
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Không thể xác nhận booking');
        }

        // 2. Sau khi xác nhận thành công, mới tạo booking step
        await createBookingStep(currentBookId);

        showSuccess('Đã xác nhận booking và tạo bước điều trị thành công!');
        closeDetailModal();
        loadBookings();

    } catch (error) {
        console.error('Error confirming booking:', error);
        showError('Không thể xác nhận booking hoặc tạo bước điều trị. Vui lòng thử lại.');
    }
}

// Tạo booking step bằng API riêng (gọi sau khi xác nhận booking)
async function createBookingStep(bookId) {
    try {
        const resp = await fetch(`/api/booking-steps/create/${bookId}`, {
            method: 'POST'
        });
        if (!resp.ok) {
            const msg = await resp.text();
            throw new Error(msg || 'Không tạo được bước điều trị');
        }
    } catch (error) {
        // Có thể log hoặc hiển thị lỗi riêng nếu muốn
        console.error('Error creating booking step:', error);
    }
}

// Từ chối booking
async function rejectBooking() {
    if (!currentBookId) return;

    const doctorNote = document.getElementById('doctorNote').value.trim();
    if (!doctorNote) {
        showError('Vui lòng nhập lý do từ chối!');
        return;
    }

    try {
        const response = await fetch(`/api/booking/${currentBookId}/status?status=rejected&doctorNote=${encodeURIComponent(doctorNote)}`, {
            method: 'PUT'
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Không thể từ chối booking');
        }

        showSuccess('Đã từ chối booking!');
        closeDetailModal();
        loadBookings();

    } catch (error) {
        console.error('Error rejecting booking:', error);
        showError('Không thể từ chối booking. Vui lòng thử lại.');
    }
}

// Quick actions
async function quickConfirm(bookId) {
    try {
        // 1. Đổi trạng thái
        const response = await fetch(`/api/booking/${bookId}/status?status=confirmed&doctorNote=Đã xác nhận nhanh`, {
            method: 'PUT'
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Không thể xác nhận booking');
        }

        // 2. Sau khi xác nhận thành công, mới tạo booking step
        await createBookingStep(bookId);

        showSuccess('Đã xác nhận booking và tạo bước điều trị!');
        loadBookings();

    } catch (error) {
        console.error('Error confirming booking:', error);
        showError('Không thể xác nhận booking hoặc tạo bước điều trị');
    }
}

async function quickReject(bookId) {
    const reason = prompt('Nhập lý do từ chối:');
    if (!reason) return;

    try {
        const response = await fetch(`/api/booking/${bookId}/status?status=rejected&doctorNote=${encodeURIComponent(reason)}`, {
            method: 'PUT'
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Không thể từ chối booking');
        }

        showSuccess('Đã từ chối booking!');
        loadBookings();

    } catch (error) {
        console.error('Error rejecting booking:', error);
        showError('Không thể từ chối booking');
    }
}

// Filter bookings
function filterBookings() {
    const statusFilter = document.getElementById('statusFilter').value;
    const dateFilter = document.getElementById('dateFilter').value;

    let filtered = currentBookings;

    if (statusFilter !== 'all') {
        filtered = filtered.filter(booking => booking.bookStatus === statusFilter);
    }

    if (dateFilter) {
        filtered = filtered.filter(booking => {
            const bookingDate = new Date(booking.bookDate).toISOString().split('T')[0];
            return bookingDate === dateFilter;
        });
    }

    displayBookings(filtered);
}

function closeDetailModal() {
    document.getElementById('appointmentDetailModal').style.display = 'none';
    currentBookId = null;
}

// Utility functions
function formatDateTime(date, time) {
    return `${formatDate(date)} ${time}`;
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
}

function getStatusText(status) {
    const statusMap = {
        'pending': 'Chờ xác nhận',
        'confirmed': 'Đã xác nhận',
        'rejected': 'Đã từ chối',
        'completed': 'Đã hoàn thành'
    };
    return statusMap[status] || status;
}

function updatePendingCount() {
    const pendingCount = currentBookings.filter(booking => booking.bookStatus === 'pending').length;
    const pendingElement = document.getElementById('pendingCount');
    if (pendingElement) {
        pendingElement.textContent = pendingCount;
    }
}

function showLoading() {
    const loader = document.getElementById('loadingSpinner');
    if (loader) loader.style.display = 'block';
}

function hideLoading() {
    const loader = document.getElementById('loadingSpinner');
    if (loader) loader.style.display = 'none';
}

function showSuccess(message) {
    if (typeof showNotification === 'function') {
        showNotification(message, 'success');
    } else {
        alert(message);
    }
}

function showError(message) {
    if (typeof showNotification === 'function') {
        showNotification(message, 'error');
    } else {
        alert(message);
    }
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('appointmentDetailModal');
    if (event.target === modal) {
        closeDetailModal();
    }
}