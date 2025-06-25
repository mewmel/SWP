// Simplified modal functions
function showDoctorDetail(doctorId) {
    console.log('Showing doctor detail for:', doctorId);
    
    // Sample data
    const doctorData = {
        'BS001': { name: 'BS. Nguyễn Văn A', department: 'Sản phụ khoa', experience: '12 năm', rating: 4.9 },
        'BS002': { name: 'BS. Trần Thị B', department: 'Nội tiết', experience: '8 năm', rating: 4.2 },
        'BS003': { name: 'BS. Lê Văn C', department: 'Nhi', experience: '10 năm', rating: 4.7 },
        'BS004': { name: 'BS. Phạm Thị D', department: 'Tim mạch', experience: '15 năm', rating: 4.5 },
        'BS005': { name: 'BS. Hoàng Văn E', department: 'Ngoại khoa', experience: '7 năm', rating: 4.8 },
        'BS006': { name: 'BS. Đặng Thị F', department: 'Da liễu', experience: '6 năm', rating: 4.3 }
    };
    
    const doctor = doctorData[doctorId];
    if (!doctor) {
        alert('Không tìm thấy thông tin bác sĩ!');
        return;
    }
    
    // Update modal content
    document.getElementById('detailDoctorName').textContent = doctor.name;
    document.getElementById('detailDoctorId').textContent = doctorId;
    document.getElementById('detailDoctorDept').textContent = doctor.department;
    document.getElementById('detailDoctorExp').textContent = doctor.experience;
    document.getElementById('detailDoctorJoinDate').textContent = '15/01/2020';
    document.getElementById('totalPatients').textContent = '1250';
    document.getElementById('successRate').textContent = '95%';
    document.getElementById('avgRating').textContent = doctor.rating;
    
    // Sample activities
    document.getElementById('doctorActivities').innerHTML = `
        <div class="activity-item">
            <div class="activity-time">09:00</div>
            <div class="activity-content">
                <div class="activity-action">Khám bệnh</div>
                <div class="activity-patient">Nguyễn Thị A</div>
            </div>
        </div>
        <div class="activity-item">
            <div class="activity-time">10:30</div>
            <div class="activity-content">
                <div class="activity-action">Tư vấn điều trị</div>
                <div class="activity-patient">Trần Văn B</div>
            </div>
        </div>
    `;
    
    // Sample schedule
    document.getElementById('doctorWeeklySchedule').innerHTML = `
        <div class="schedule-grid">
            <div class="day-column">
                <div class="day-header">T2</div>
                <div class="time-slot">08:00-12:00</div>
                <div class="time-slot">14:00-17:00</div>
            </div>
            <div class="day-column">
                <div class="day-header">T3</div>
                <div class="time-slot">08:00-12:00</div>
                <div class="time-slot">14:00-17:00</div>
            </div>
            <div class="day-column">
                <div class="day-header">T4</div>
                <div class="time-slot">08:00-12:00</div>
                <div class="time-slot">14:00-17:00</div>
            </div>
            <div class="day-column">
                <div class="day-header">T5</div>
                <div class="time-slot">08:00-12:00</div>
                <div class="time-slot">14:00-17:00</div>
            </div>
            <div class="day-column">
                <div class="day-header">T6</div>
                <div class="time-slot">08:00-12:00</div>
                <div class="time-slot">14:00-17:00</div>
            </div>
            <div class="day-column">
                <div class="day-header">T7</div>
                <div class="time-slot">08:00-12:00</div>
                <div class="time-slot off">Nghỉ</div>
            </div>
            <div class="day-column">
                <div class="day-header">CN</div>
                <div class="time-slot off">Nghỉ</div>
                <div class="time-slot off">Nghỉ</div>
            </div>
        </div>
    `;
    
    // Sample reviews
    document.getElementById('recentReviews').innerHTML = `
        <div class="review-item">
            <div class="review-header">
                <div class="reviewer-name">Nguyễn Thị A</div>
                <div class="review-rating">⭐⭐⭐⭐⭐</div>
                <div class="review-date">2 ngày trước</div>
            </div>
            <div class="review-content">Bác sĩ rất chuyên nghiệp và tận tâm. Kết quả điều trị rất tốt.</div>
        </div>
        <div class="review-item">
            <div class="review-header">
                <div class="reviewer-name">Trần Văn B</div>
                <div class="review-rating">⭐⭐⭐⭐☆</div>
                <div class="review-date">1 tuần trước</div>
            </div>
            <div class="review-content">Thời gian chờ hơi lâu nhưng bác sĩ khám rất kỹ.</div>
        </div>
    `;
    
    // Show modal
    const modal = document.getElementById('doctorDetailModal');
    modal.style.display = 'flex';
    console.log('Modal shown');
}

function showRatingModal(doctorId) {
    console.log('Showing rating modal for:', doctorId);
    
    // Sample data
    const doctorData = {
        'BS001': 'BS. Nguyễn Văn A',
        'BS002': 'BS. Trần Thị B', 
        'BS003': 'BS. Lê Văn C',
        'BS004': 'BS. Phạm Thị D',
        'BS005': 'BS. Hoàng Văn E',
        'BS006': 'BS. Đặng Thị F'
    };
    
    document.getElementById('rateDoctorName').textContent = doctorData[doctorId];
    
    // Reset form
    document.querySelectorAll('.rating-star').forEach(star => {
        star.textContent = '☆';
        star.classList.remove('selected');
    });
    document.querySelectorAll('.criteria-star').forEach(star => {
        star.textContent = '☆';
        star.classList.remove('selected');
    });
    document.getElementById('ratingText').textContent = 'Chưa chọn đánh giá';
    document.getElementById('ratingComment').value = '';
    document.getElementById('submitRatingBtn').disabled = true;
    
    // Show modal
    const modal = document.getElementById('rateDoctorModal');
    modal.style.display = 'flex';
    console.log('Rating modal shown');
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.style.display = 'none';
}

// Tab functionality
function switchTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(tabName + 'Tab').classList.add('active');
    event.target.classList.add('active');
}

// Rating functionality
let selectedRating = 0;
let criteriaRatings = { expertise: 0, attitude: 0, effectiveness: 0 };

function setRating(rating) {
    selectedRating = rating;
    const ratingTexts = ['', 'Rất tệ', 'Tệ', 'Bình thường', 'Tốt', 'Rất tốt'];
    
    // Update stars
    document.querySelectorAll('.rating-star').forEach((star, index) => {
        if (index < rating) {
            star.textContent = '⭐';
            star.classList.add('selected');
        } else {
            star.textContent = '☆';
            star.classList.remove('selected');
        }
    });
    
    document.getElementById('ratingText').textContent = ratingTexts[rating];
    document.getElementById('submitRatingBtn').disabled = rating === 0;
}

function setCriteriaRating(criteria, rating) {
    criteriaRatings[criteria] = rating;
    
    // Update stars for this criteria
    document.querySelectorAll(`[data-criteria="${criteria}"]`).forEach((star, index) => {
        if (index < rating) {
            star.textContent = '⭐';
            star.classList.add('selected');
        } else {
            star.textContent = '☆';
            star.classList.remove('selected');
        }
    });
}

function submitRating() {
    if (selectedRating === 0) {
        alert('Vui lòng chọn mức đánh giá!');
        return;
    }
    
    const comment = document.getElementById('ratingComment').value;
    console.log('Rating submitted:', {
        rating: selectedRating,
        criteria: criteriaRatings,
        comment: comment
    });
    
    alert('Đánh giá đã được gửi thành công!');
    closeModal('rateDoctorModal');
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('Page loaded');
    
    // Tab functionality
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const tabName = this.dataset.tab;
            switchTab(tabName);
        });
    });
    
    // Rating stars
    document.querySelectorAll('.rating-star').forEach((star, index) => {
        star.addEventListener('click', function() {
            setRating(index + 1);
        });
    });
    
    // Criteria stars
    document.querySelectorAll('.criteria-star').forEach(star => {
        star.addEventListener('click', function() {
            const criteria = this.dataset.criteria;
            const rating = parseInt(this.dataset.rating);
            setCriteriaRating(criteria, rating);
        });
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    });
});

// Update modal close buttons to use the closeModal function
document.addEventListener('DOMContentLoaded', function() {
    // Setup close buttons for modals
    const closeDoctorDetailModal = document.getElementById('closeDoctorDetailModal');
    const closeDoctorDetailBtn = document.getElementById('closeDoctorDetailBtn');
    const closeRateDoctorModal = document.getElementById('closeRateDoctorModal');
    const cancelRatingBtn = document.getElementById('cancelRatingBtn');
    const submitRatingBtn = document.getElementById('submitRatingBtn');
    
    if (closeDoctorDetailModal) {
        closeDoctorDetailModal.onclick = () => closeModal('doctorDetailModal');
    }
    if (closeDoctorDetailBtn) {
        closeDoctorDetailBtn.onclick = () => closeModal('doctorDetailModal');
    }
    if (closeRateDoctorModal) {
        closeRateDoctorModal.onclick = () => closeModal('rateDoctorModal');
    }
    if (cancelRatingBtn) {
        cancelRatingBtn.onclick = () => closeModal('rateDoctorModal');
    }
    if (submitRatingBtn) {
        submitRatingBtn.onclick = submitRating;
    }
});

// Event listeners cho các nút modal mới
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded - initializing...');
    
    // Đợi một chút để đảm bảo tất cả elements đã được render
    setTimeout(function() {
        initializeModalEvents();
    }, 100);
});
// Dữ liệu demo bằng cấp chuyên môn
const doctorDegrees = {
    'BS001': {
        name: 'BS. Nguyễn Văn A',
        degrees: [
            'Bác sĩ Đa khoa - Đại học Y Hà Nội (2012)',
            'Chứng chỉ Sản phụ khoa nâng cao (2015)',
            'Chứng chỉ IVF quốc tế (2018)'
        ],
        specialties: ['Sản phụ khoa', 'Hỗ trợ sinh sản', 'IVF, IUI']
    },
    'BS002': {
        name: 'BS. Trần Thị B',
        degrees: [
            'Bác sĩ Nội tiết - Đại học Y Dược TP.HCM (2013)',
            'Chứng chỉ Nội tiết sinh sản (2016)'
        ],
        specialties: ['Nội tiết', 'Nội tiết sinh sản']
    },
    'BS003': {
        name: 'BS. Lê Văn C',
        degrees: [
            'Bác sĩ Đa khoa - Đại học Y Hà Nội (2014)',
            'Chứng chỉ Nhi khoa (2017)'
        ],
        specialties: ['Nhi', 'Nhi tổng quát']
    },
    'BS004': {
        name: 'BS. Phạm Thị D',
        degrees: [
            'Bác sĩ Đa khoa - Đại học Y Dược TP.HCM (2015)',
            'Chứng chỉ Tim mạch (2018)'
        ],
        specialties: ['Tim mạch', 'Siêu âm tim']
    },
    'BS005': {
        name: 'BS. Hoàng Văn E',
        degrees: [
            'Bác sĩ Đa khoa - Đại học Y Hà Nội (2016)',
            'Chứng chỉ Ngoại khoa (2019)'
        ],
        specialties: ['Ngoại khoa', 'Phẫu thuật tổng quát']
    },
    'BS006': {
        name: 'BS. Đặng Thị F',
        degrees: [
            'Bác sĩ Đa khoa - Đại học Y Dược TP.HCM (2017)',
            'Chứng chỉ Da liễu (2020)'
        ],
        specialties: ['Da liễu', 'Chăm sóc da']
    }
};

// Xử lý nút xem bằng cấp chuyên môn
function openDegreeModal(doctorId) {
    const data = doctorDegrees[doctorId];
    if (!data) return;
    document.getElementById('degreeDoctorName').innerText = data.name;
    let html = '<div><b>Bằng cấp:</b><ul>';
    data.degrees.forEach(d => html += `<li>${d}</li>`);
    html += '</ul></div>';
    html += '<div style="margin-top:10px;"><b>Chuyên môn:</b><ul>';
    data.specialties.forEach(s => html += `<li>${s}</li>`);
    html += '</ul></div>';
    document.getElementById('degreeDetailContent').innerHTML = html;
    document.getElementById('degreeModal').style.display = 'flex';
}

document.addEventListener('DOMContentLoaded', function() {
    // Gắn sự kiện cho nút xem bằng cấp
    document.querySelectorAll('.view-degree-btn').forEach(btn => {
        btn.onclick = function() {
            try {
                openDegreeModal(this.getAttribute('data-doctor'));
            } catch (e) {
                alert('Lỗi khi mở modal bằng cấp: ' + e.message);
            }
        };
    });
    
    // Đóng modal bằng cấp
    document.getElementById('closeDegreeModal').onclick = function() {
        document.getElementById('degreeModal').style.display = 'none';
    };
    document.getElementById('closeDegreeBtn').onclick = function() {
        document.getElementById('degreeModal').style.display = 'none';
    };
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('degreeModal');
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    });

    // Gắn sự kiện cho nút sửa bằng cấp chuyên môn
    let currentEditDoctorId = null;
    document.querySelectorAll('button[title="Sửa"]').forEach(btn => {
        btn.addEventListener('click', function() {
            const doctorId = this.closest('tr').querySelector('.view-degree-btn').getAttribute('data-doctor');
            currentEditDoctorId = doctorId;
            const data = doctorDegrees[doctorId];
            if (!data) return;
            document.getElementById('editDegreeDoctorName').innerText = data.name;
            // Render degree list
            const degreeList = document.getElementById('editDegreeList');
            degreeList.innerHTML = '';
            data.degrees.forEach((deg, idx) => {
                const li = document.createElement('li');
                li.innerHTML = `<input type="text" value="${deg}" data-idx="${idx}" style="width:75%;padding:3px;"> <button type="button" class="btn-danger btn-sm remove-degree-btn" data-idx="${idx}"><i class="fas fa-times"></i></button>`;
                degreeList.appendChild(li);
            });
            // Render specialty list
            const specialtyList = document.getElementById('editSpecialtyList');
            specialtyList.innerHTML = '';
            data.specialties.forEach((sp, idx) => {
                const li = document.createElement('li');
                li.innerHTML = `<input type="text" value="${sp}" data-idx="${idx}" style="width:75%;padding:3px;"> <button type="button" class="btn-danger btn-sm remove-specialty-btn" data-idx="${idx}"><i class="fas fa-times"></i></button>`;
                specialtyList.appendChild(li);
            });
            document.getElementById('editDegreeModal').style.display = 'flex';
        });
    });

    // Đóng modal sửa bằng cấp
    document.getElementById('closeEditDegreeModal').onclick = function() {
        document.getElementById('editDegreeModal').style.display = 'none';
    };
    document.getElementById('cancelEditDegreeBtn').onclick = function() {
        document.getElementById('editDegreeModal').style.display = 'none';
    };
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('editDegreeModal');
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    });

    // Thêm bằng cấp
    document.getElementById('addDegreeBtn').onclick = function() {
        const val = document.getElementById('newDegreeInput').value.trim();
        if (val) {
            const li = document.createElement('li');
            li.innerHTML = `<input type="text" value="${val}" style="width:75%;padding:3px;"> <button type="button" class="btn-danger btn-sm remove-degree-btn"><i class="fas fa-times"></i></button>`;
            document.getElementById('editDegreeList').appendChild(li);
            document.getElementById('newDegreeInput').value = '';
        }
    };
    
    // Thêm chuyên môn
    document.getElementById('addSpecialtyBtn').onclick = function() {
        const val = document.getElementById('newSpecialtyInput').value.trim();
        if (val) {
            const li = document.createElement('li');
            li.innerHTML = `<input type="text" value="${val}" style="width:75%;padding:3px;"> <button type="button" class="btn-danger btn-sm remove-specialty-btn"><i class="fas fa-times"></i></button>`;
            document.getElementById('editSpecialtyList').appendChild(li);
            document.getElementById('newSpecialtyInput').value = '';
        }
    };
    
    // Xóa bằng cấp/chuyên môn
    document.getElementById('editDegreeList').addEventListener('click', function(e) {
        if (e.target.closest('.remove-degree-btn')) {
            e.target.closest('li').remove();
        }
    });
    document.getElementById('editSpecialtyList').addEventListener('click', function(e) {
        if (e.target.closest('.remove-specialty-btn')) {
            e.target.closest('li').remove();
        }
    });

    // Lưu thay đổi
    document.getElementById('saveEditDegreeBtn').onclick = function() {
        if (!currentEditDoctorId) return;
        // Lấy lại danh sách bằng cấp
        const degrees = Array.from(document.querySelectorAll('#editDegreeList input[type="text"]')).map(i => i.value.trim()).filter(Boolean);
        // Lấy lại danh sách chuyên môn
        const specialties = Array.from(document.querySelectorAll('#editSpecialtyList input[type="text"]')).map(i => i.value.trim()).filter(Boolean);
        doctorDegrees[currentEditDoctorId].degrees = degrees;
        doctorDegrees[currentEditDoctorId].specialties = specialties;
        document.getElementById('editDegreeModal').style.display = 'none';
        alert('Đã lưu thay đổi bằng cấp & chuyên môn!');
    };
});