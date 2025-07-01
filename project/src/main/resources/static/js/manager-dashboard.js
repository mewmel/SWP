function showDoctorDetail(doctorId) {
    // doctorId truyền vào dạng BS001, BS002 ...
    const doctorIdNum = doctorId.replace(/^BS/, '').replace(/^0+/, '');

    fetch(`/api/doctors/${doctorIdNum}`)
        .then(res => {
            if (!res.ok) throw new Error('Không tìm thấy thông tin bác sĩ!');
            return res.json();
        })
        .then(doctor => {
            document.getElementById('detailDoctorName').textContent = doctor.docFullName || '';
            document.getElementById('detailDoctorId').textContent = doctorId;
            document.getElementById('detailDoctorDept').textContent = doctor.expertise || '';
            document.getElementById('detailDoctorExp').textContent = doctor.profileDescription || '';
            document.getElementById('detailDoctorJoinDate').textContent = ''; // Có thể thêm trường ngày vào làm nếu backend trả về
            document.getElementById('totalPatients').textContent = '0'; // Nếu backend có thì truyền vào
            document.getElementById('successRate').textContent = '0%';
            document.getElementById('avgRating').textContent = '5.0';

            // Clear các phần không có dữ liệu thực (nếu chưa có API)
            document.getElementById('doctorActivities').innerHTML = '';
            document.getElementById('doctorWeeklySchedule').innerHTML = '';
            document.getElementById('recentReviews').innerHTML = '';

            // Show modal
            const modal = document.getElementById('doctorDetailModal');
            modal.style.display = 'flex';
            console.log('Modal shown');
        })
        .catch(e => {
            alert(e.message);
        });
}

function showRatingModal(doctorId) {
    const doctorIdNum = doctorId.replace(/^BS/, '').replace(/^0+/, '');

    fetch(`/api/doctors/${doctorIdNum}`)
        .then(res => {
            if (!res.ok) throw new Error('Không tìm thấy thông tin bác sĩ!');
            return res.json();
        })
        .then(doctor => {
            document.getElementById('rateDoctorName').textContent = doctor.docFullName || '';

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
        })
        .catch(e => {
            alert(e.message);
        });
}