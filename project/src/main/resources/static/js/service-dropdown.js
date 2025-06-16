document.addEventListener('DOMContentLoaded', function() {
    fetch('/api/services')
        .then(response => response.json())
        .then(services => {
            const serviceSelect = document.getElementById('service');
            serviceSelect.innerHTML = '<option value="">Chọn dịch vụ</option>';
            const labelMap = {
                2: "Thụ tinh trong ống nghiệm (IVF)",
                3: "Thụ tinh nhân tạo (IUI)",
                4: "Tư vấn ban đầu",
                5: "Tái khám",
                6: "Xét nghiệm sinh sản",
                7: "Siêu âm theo dõi"
            };
            services.forEach(service => {
                if (labelMap[service.serId]) {
                    const option = document.createElement('option');
                    option.value = service.serId;
                    option.textContent = labelMap[service.serId];
                    serviceSelect.appendChild(option);
                }
            });
        })
        .catch(error => {
            console.error('Lỗi lấy danh sách dịch vụ:', error);
        });
});