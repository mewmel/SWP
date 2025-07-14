document.addEventListener('DOMContentLoaded', function () {
    // ========== GIỮ TRẠNG THÁI ĐĂNG NHẬP ==========
    const authButtons = document.querySelector('.auth-buttons');
    const userMenu = document.querySelector('.user-menu');
    const userNameSpan = document.querySelector('.user-name');
    const sidebarUsername = document.querySelector('.sidebar-username');
    const notificationWrapper = document.querySelector('.notification-wrapper');

    // Hiển thị đúng trạng thái đăng nhập khi load lại trang
    const fullName = localStorage.getItem('docFullName');

    if (fullName) {
        if (authButtons) authButtons.style.display = 'none';
        if (userMenu) userMenu.style.display = 'flex';
        if (userNameSpan) userNameSpan.textContent = fullName;
        if (sidebarUsername) sidebarUsername.textContent = fullName;
        if (notificationWrapper) notificationWrapper.style.display = 'block';
    } else {
        if (authButtons) authButtons.style.display = 'flex';
        if (userMenu) userMenu.style.display = 'none';
        if (notificationWrapper) notificationWrapper.style.display = 'none';
    }

    // ========== ĐĂNG XUẤT ==========

    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function (e) {
            e.preventDefault();
            localStorage.clear();
            window.location.href = "index.html";
        });
    }
    let currentBookings = [];
    let currentBookId = null;


    window.loadBookings = loadBookings;
    window.filterBookings = filterBookings;
    window.closeDetailModal = closeDetailModal;
    window.confirmBooking = confirmBooking;

    async function loadBookings() {
        const doctorId = localStorage.getItem('docId');
        if (!doctorId) return;

        const container = document.getElementById('appointmentsList');
        const noAppointments = document.getElementById('noAppointments');
        const template = document.getElementById('bookingTemplate');
        const loadingSpinner = document.getElementById('loadingSpinner');

        if (loadingSpinner) loadingSpinner.style.display = 'block';

        // Xóa các card cũ
        container.querySelectorAll('.appointment-card:not(.template)').forEach(card => card.remove());

        let bookings = [];
        try {
            const res = await fetch(`/api/booking/doctor/${doctorId}`);
            if (res.ok) bookings = await res.json();
        } catch (e) {
            bookings = [];
        }

        currentBookings = bookings;
        if (!bookings || bookings.length === 0) {
            if (noAppointments) noAppointments.style.display = 'block';
            if (loadingSpinner) loadingSpinner.style.display = 'none';
            document.getElementById('pendingCount').textContent = '0';
            return;
        } else {
            if (noAppointments) noAppointments.style.display = 'none';
        }

        // Render từng booking
        for (const booking of bookings) {
            let info = { cusName: '', cusPhone: '', cusEmail: '', serName: '', lastVisitDate: '' };
            try {
                const res = await fetch('/api/booking/patient-service/' + booking.bookId);
                if (res.ok) info = await res.json();
            } catch (err) { }

            const card = template.cloneNode(true);
            card.classList.remove('template');
            card.style.display = 'block';
            card.dataset.bookingId = booking.bookId;

            // Info chính
            card.querySelector('#patientName').textContent = info.cusName || 'N/A';
            card.querySelector('#appointmentTime').textContent = booking.createdAt;
            card.querySelector('#serviceName').textContent = info.serName || 'N/A';
            card.querySelector('#customerId').textContent = booking.cusId || 'N/A';

            // Status
            const statusBadge = card.querySelector('#statusBadge');
            statusBadge.textContent = getStatusText(booking.bookStatus);
            statusBadge.className = 'status-badge ' + statusCssClass(booking.bookStatus);

            // Note
            const noteDiv = card.querySelector('#appointmentNote');
            if (booking.note) {
                noteDiv.style.display = 'block';
                card.querySelector('#noteText').textContent = booking.note;
            } else {
                noteDiv.style.display = 'none';
            }

            // Button View
            card.querySelector('#btnView').onclick = function (e) {
                e.stopPropagation();
                currentBookId = booking.bookId;
                showBookingDetail(booking.bookId, info, booking);
            };

            // Button Confirm
            const btnConfirm = card.querySelector('#btnConfirm');
            if (booking.bookStatus === 'pending') {
                btnConfirm.style.display = 'inline-flex';
                btnConfirm.onclick = function (e) {
                    e.stopPropagation();
                    confirmBooking(booking.bookId);
                }
            } else {
                btnConfirm.style.display = 'none';
            }

            container.appendChild(card);
        }

        updatePendingCount();
        if (loadingSpinner) loadingSpinner.style.display = 'none';
    }

    async function showBookingDetail(bookId, info = null, bookingObj = null) {
        let booking = bookingObj;
        try {
            if (!booking) {
                const res = await fetch('/api/booking/' + bookId);
                if (res.ok) booking = await res.json();
            }
        } catch (e) {
            showError('Không lấy được chi tiết booking!');
            return;
        }
        if (!info) {
            try {
                const res = await fetch('/api/booking/patient-service/' + bookId);
                if (res.ok) info = await res.json();
            } catch (e) { info = {}; }
        }
        // Thông tin bệnh nhân
        document.getElementById('detailPatientName').textContent = info.cusName || 'N/A';
        document.getElementById('detailPatientPhone').textContent = info.cusPhone || 'N/A';
        document.getElementById('detailPatientEmail').textContent = info.cusEmail || 'N/A';

        // Thông tin lịch hẹn
        document.getElementById('detailService').textContent = info.serName || '';
        document.getElementById('detailStatus').textContent = getStatusText(booking.bookStatus);
        document.getElementById('detailStatus').className = 'status-badge ' + statusCssClass(booking.bookStatus);

        // Bước điều trị tái khám
fetch(`/api/booking-steps/${bookId}/subservice-of-visit`)
    .then(res => res.json())
    .then(list => {
        const followUpServiceDiv = document.getElementById('followUpService');
        if (Array.isArray(list) && list.length > 0) {
            // Hiển thị mỗi subService là một badge, hoặc cách nào bạn muốn
            followUpServiceDiv.innerHTML = list
                .map(item => `<span class="badge">${item.subName}</span>`)
                .join('<br>'); 
        } else {
            followUpServiceDiv.textContent = 'Không có bước điều trị';
        }
    })
    .catch(err => {
        document.getElementById('followUpService').textContent = 'Không lấy được bước điều trị';
        console.error('Error fetching follow-up service:', err);
    });

        // Ngày hẹn
        document.getElementById('previousVisit').textContent = info.lastVisitDate
        ? new Date(info.lastVisitDate).toLocaleDateString('vi-VN')
        : '--/--/----';

        // Ghi chú
        document.getElementById('detailNote').textContent = booking.note || 'Không có ghi chú';

        // Show/hide action
        const actionBtns = document.getElementById('appointmentActions');
        if (booking.bookStatus === 'pending') {
            actionBtns.style.display = 'flex';
        } else {
            actionBtns.style.display = 'none';
        }

        // Show modal
        const modal = document.getElementById('appointmentDetailModal');
        modal.style.display = 'flex';
        setTimeout(() => modal.classList.add('show'), 10);
    }

    function closeDetailModal() {
        const modal = document.getElementById('appointmentDetailModal');
        modal.classList.remove('show');
        setTimeout(() => modal.style.display = 'none', 300);
        currentBookId = null;
    }

    async function confirmBooking(bookId = null) {
        const id = bookId || currentBookId;
        if (!id) return;
        try {
            const response = await fetch(`/api/booking/${id}/status?status=confirmed`, { method: 'PUT' });
            if (!response.ok) throw new Error(await response.text() || 'Không thể xác nhận booking');
            await createBookingStep(id);
            showSuccess('Đã xác nhận booking!');
            closeDetailModal();
            loadBookings();
        } catch (err) {
            showError('Không thể xác nhận booking: ' + err.message);
        }
    }

    async function createBookingStep(bookId) {
        try {
            const resp = await fetch(`/api/booking-steps/create/${bookId}`, { method: 'POST' });
            if (!resp.ok) throw new Error(await resp.text() || 'Không tạo được bước điều trị');
        } catch (error) { }
    }

    function filterBookings() {
        const statusFilter = document.getElementById('statusFilter').value;
        const dateFilter = document.getElementById('dateFilter').value;
        let filtered = currentBookings;
        if (statusFilter !== 'all') {
            filtered = filtered.filter(booking => booking.bookStatus === statusFilter);
        }
        if (dateFilter) {
            filtered = filtered.filter(booking => {
                const bookingDate = new Date(booking.createdAt).toISOString().split('T')[0];
                return bookingDate === dateFilter;
            });
        }
        displayBookings(filtered);
    }

    function displayBookings(bookings) {
        const container = document.getElementById('appointmentsList');
        const template = document.getElementById('bookingTemplate');
        container.querySelectorAll('.appointment-card:not(.template)').forEach(card => card.remove());
        for (const booking of bookings) {
            // Có thể reuse code render ở loadBookings nếu muốn
        }
        document.getElementById('pendingCount').textContent = bookings.filter(b => b.bookStatus === 'pending').length;
    }

    function updatePendingCount() {
        const pending = currentBookings.filter(b => b.bookStatus === 'pending').length;
        document.getElementById('pendingCount').textContent = pending;
    }

    // ==== Utils ====
    function formatDate(dateString) {
        if (!dateString) return '--/--/----';
        const d = new Date(dateString);
        if (isNaN(d.getTime())) return '--/--/----';
        return d.toLocaleDateString('vi-VN');
    }
    function formatBookingTime(dateString, timeString) {
        if (!dateString) return '--/--/----';
        const date = new Date(dateString);
        const datePart = date.toLocaleDateString('vi-VN');
        if (timeString) return `${datePart} ${timeString.slice(0, 5)}`;
        return datePart;
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
    function statusCssClass(status) {
        switch (status) {
            case 'pending': return 'pending';
            case 'confirmed': return 'confirmed';
            case 'rejected': return 'rejected';
            default: return '';
        }
    }
    function showSuccess(msg) {
        if (typeof showNotification === 'function') showNotification(msg, 'success');
        else alert(msg);
    }
    function showError(msg) {
        if (typeof showNotification === 'function') showNotification(msg, 'error');
        else alert(msg);
    }

    // ====== CLOSE MODAL WHEN CLICK OUTSIDE ======
    window.onclick = function (event) {
        const modal = document.getElementById('appointmentDetailModal');
        if (event.target === modal) closeDetailModal();
    };
    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') {
            const modal = document.getElementById('appointmentDetailModal');
            if (modal && modal.classList.contains('show')) closeDetailModal();
        }
    });

});