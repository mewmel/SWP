// Patient data
        let allPatients = [];
        let filteredPatients = [];
        let currentDoctorId = null;

function showNotification(message, type) {
    // type: 'success', 'error', 'info', ...
    let prefix = '';
    if (type === 'success') prefix = '✅ ';
    else if (type === 'error') prefix = '❌ ';
    else if (type === 'info') prefix = 'ℹ️ ';
    alert(prefix + message);
}


        // Initialize page
        document.addEventListener('DOMContentLoaded', function () {
            // Get doctor ID from localStorage (set during login)
            currentDoctorId = localStorage.getItem('docId');
            if (!currentDoctorId) {
                alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
                window.location.href = 'index.html';
                return;
            }

            loadPatientDataFromAPI();
        });

        // Load patient data from API
        async function loadPatientDataFromAPI() {
            try {
                console.log('Loading patients for doctor:', currentDoctorId);
                
                // Get all bookings for current doctor
                const response = await fetch(`/api/booking/doctor/${currentDoctorId}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch bookings');
                }
                
                const bookings = await response.json();
                console.log('Fetched bookings:', bookings);
                
                // Extract unique customer IDs and get customer details
                const uniqueCustomers = new Map();
                
                for (const booking of bookings) {
                    if (!uniqueCustomers.has(booking.cusId)) {
                        try {
                            // Get customer full record
                            const customerResponse = await fetch(`/api/customer/full-record/${booking.cusId}`);
                            if (customerResponse.ok) {
                                const customerData = await customerResponse.json();
                                
                                // Add booking status info
                                customerData.bookStatus = booking.bookStatus;
                                customerData.lastVisit = booking.createdAt;
                                customerData.bookId = booking.bookId;
                                customerData.serId = booking.serId; // Add serId from booking
                                
                                uniqueCustomers.set(booking.cusId, customerData);
                            }
                        } catch (error) {
                            console.error(`Error fetching customer ${booking.cusId}:`, error);
                        }
                    }
                }
                
                // Convert map to array
                allPatients = Array.from(uniqueCustomers.values());
                filteredPatients = [...allPatients];
                
                console.log('Loaded patients:', allPatients);
                renderPatientList();
                
            } catch (error) {
                console.error('Error loading patient data:', error);
                // Fallback to sample data if API fails
                loadSampleData();
            }
        }

        // Fallback sample data
        function loadSampleData() {
            allPatients = [
                {
                    cusId: 1,
                    cusFullName: 'Trần Anh Thư',
                    cusGender: 'F',
                    cusDate: '2004-09-26',
                    cusEmail: 'thutase180353@fpt.edu.vn',
                    cusPhone: '0352020737',
                    cusAddress: 'HCMC',
                    cusStatus: 'active',
                    cusOccupation: 'Con sen',
                    emergencyContact: 'Mơ',
                    lastVisit: '2024-06-25',
                    bookStatus: 'completed',
                    serId: 1, // Add sample serId
                    bookId: 1 // Add sample bookId
                }
            ];
            filteredPatients = [...allPatients];
            renderPatientList();
        }

        // Render patient list
        function renderPatientList() {
            const tableBody = document.getElementById('patientTableBody');
            tableBody.innerHTML = '';

            if (filteredPatients.length === 0) {
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="7" style="text-align: center; padding: 2rem; color: #64748b;">
                            <i class="fas fa-users" style="font-size: 2rem; margin-bottom: 0.5rem; display: block;"></i>
                            Không có bệnh nhân nào
                        </td>
                    </tr>
                `;
                return;
            }

            filteredPatients.forEach(patient => {
                const age = calculateAge(patient.cusDate);
                const lastVisit = formatDate(patient.lastVisit);
                const genderText = patient.cusGender === 'F' ? 'Nữ' : 'Nam';
                
                // Determine status based on booking status
                let statusText, statusClass;
                if (patient.bookStatus === 'completed') {
                    statusText = 'Đã checkout';
                    statusClass = 'completed';
                } else if (patient.bookStatus === 'confirmed') {
                    statusText = 'Đã đến khám';
                    statusClass = 'pending';
                } else {
                    statusText = 'Chưa checkout';
                    statusClass = 'pending';
                }

                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>
                        <div class="patient-info">
                            <div class="patient-avatar">
                                <i class="fas fa-user"></i>
                            </div>
                            <div class="patient-details">
                                <h4>${patient.cusFullName}</h4>
                                <p>BN${String(patient.cusId).padStart(3, '0')}</p>
                            </div>
                        </div>
                    </td>
                    <td>${age}</td>
                    <td>${genderText}</td>
                    <td>${formatPhoneNumber(patient.cusPhone)}</td>
                    <td>${lastVisit}</td>
                    <td>
                        <span class="status-badge ${statusClass}">${statusText}</span>
                    </td>
                    <td>
                        <div class="action-buttons">
                            ${patient.bookStatus === 'completed' 
                                ? `<button class="btn-action btn-view" onclick="viewPatientRecord(${patient.cusId}, ${patient.bookId})">
                                    <i class="fas fa-eye"></i> Xem hồ sơ
                                   </button>`
                                : `<button class="btn-action btn-disabled" disabled>
                                    <i class="fas fa-clock"></i> Chưa checkout
                                   </button>`
                            }
                            <button class="btn-action btn-edit" onclick="openNextAppointmentModal(${patient.cusId}, '${patient.cusFullName}', 'SĐT: ${formatPhoneNumber(patient.cusPhone)} - ${genderText}', ${patient.serId})">
                                <i class="fas fa-calendar-plus"></i> Hẹn khám lại
                            </button>
                        </div>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        }

        // Calculate age
        function calculateAge(birthDate) {
            if (!birthDate) return 'N/A';
            const today = new Date();
            const birth = new Date(birthDate);
            let age = today.getFullYear() - birth.getFullYear();
            const monthDiff = today.getMonth() - birth.getMonth();
            
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
                age--;
            }
            return age;
        }

        // Format date
        function formatDate(dateString) {
            if (!dateString) return 'N/A';
            const date = new Date(dateString);
            return date.toLocaleDateString('vi-VN');
        }

        // Format date and time
        function formatDateTime(dateString) {
            if (!dateString) return 'N/A';
            const date = new Date(dateString);
            return date.toLocaleDateString('vi-VN') + ' ' + date.toLocaleTimeString('vi-VN', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
        }

        // Format date and time for datetime-local input
        function formatDateTimeForInput(dateString) {
            if (!dateString) return '';
            const date = new Date(dateString);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            return `${year}-${month}-${day}T${hours}:${minutes}`;
        }

        // Format phone number
        function formatPhoneNumber(phone) {
            if (!phone) return 'N/A';
            const phoneStr = phone.toString();
            if (phoneStr.length === 10) {
                return phoneStr.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3');
            }
            return phoneStr;
        }

        // Search patients
        function searchPatients() {
            const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
            applyFilters();
        }

        // Filter patients
        function filterPatients() {
            applyFilters();
        }

        // Apply all filters
        function applyFilters() {
            const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
            const statusFilter = document.getElementById('statusFilter').value;
            const genderFilter = document.getElementById('genderFilter').value;
            
            filteredPatients = allPatients.filter(patient => {
                const searchMatch = searchTerm === '' || 
                    patient.cusFullName.toLowerCase().includes(searchTerm) ||
                    patient.cusPhone.includes(searchTerm);
                
                // Map status filter to bookStatus
                let statusMatch = true;
                if (statusFilter === 'completed') {
                    statusMatch = patient.bookStatus === 'completed';
                } else if (statusFilter === 'pending') {
                    statusMatch = patient.bookStatus !== 'completed';
                }
                
                const genderMatch = genderFilter === 'all' || patient.cusGender === genderFilter;
                
                return searchMatch && statusMatch && genderMatch;
            });
            
            renderPatientList();
        }

        // Enhanced API integration and modal management
        let currentPatientData = null;
        let drugCounter = 0;
        let selectedSubId = null;
        let selectedSubName = '';

        // Tab switching functionality
        function switchTab(tabName) {
            // Remove active class from all tabs and tab contents
            document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

            // Add active class to clicked tab and corresponding content
            event.target.classList.add('active');
            document.getElementById(tabName + 'Tab').classList.add('active');

            // Load data for the selected tab if not already loaded
            if (currentPatientData && currentPatientData.bookId) {
                switch(tabName) {
                    case 'current':
                        // Refresh current tab data
                        loadExistingBookingSteps(currentPatientData.bookId);
                        break;
                    case 'history':
                        loadMedicalHistory(currentPatientData);
                        break;
                    case 'treatment':
                        loadTreatmentPlan(currentPatientData);
                        break;
                    case 'prescription':
                        loadExistingPrescriptionData(currentPatientData.bookId);
                        fillPrescriptionHeader();
                        break;
                    case 'tests':
                        loadAndRenderTestResults(currentPatientData.bookId);
                        break;
                }
            }
        }

        // Enhanced patient record viewing with multiple API calls
        async function viewPatientRecord(cusId, bookId) {
            try {
                showLoading();
                
                console.log('Loading patient record for cusId:', cusId, 'bookId:', bookId);
                
                // Show modal first
                document.getElementById('patientModal').style.display = 'block';
                
                // Store for later use
                currentPatientData = { cusId, bookId };
                
                // Get patient data first
                const customerResponse = await fetch(`/api/customer/full-record/${cusId}`);
                if (!customerResponse.ok) {
                    throw new Error('Failed to fetch patient data');
                }

                const patientData = await customerResponse.json();
                patientData.bookId = bookId;
                currentPatientData = patientData;

                console.log('Patient data loaded:', patientData);

                // Populate basic patient information
                populatePatientInfo(patientData);
                
                // Populate current examination tab
                populateCurrentExamination(patientData, []);
                
                // CRITICAL: Load existing completed steps FIRST
                if (bookId) {
                    console.log('Loading booking steps for bookId:', bookId);
                    await loadExistingBookingSteps(bookId);
                    
                    // Then setup service selection 
                    setupServiceSelection(bookId);
                    
                    // Load other data
                    loadAndRenderTestResults(bookId);
                    await loadExistingPrescriptionData(bookId);
                }
                
                hideLoading();
                
            } catch (error) {
                console.error('Error loading patient record:', error);
                hideLoading();
                showErrorMessage('Không thể tải hồ sơ bệnh nhân. Vui lòng thử lại sau.');
            }
        }

        function populatePatientInfo(patientData) {
            // Basic patient information - using correct field names
            document.getElementById('patientName').textContent = patientData.cusFullName || patientData.customerName || 'N/A';
            document.getElementById('cusId').textContent = 'BN' + String(patientData.cusId || '000').padStart(3, '0');
            document.getElementById('patientGender').textContent = patientData.cusGender === 'M' ? 'Nam' : (patientData.cusGender === 'F' ? 'Nữ' : 'N/A');
            document.getElementById('patientBirthDate').textContent = formatDate(patientData.cusDate) || 'N/A';
            document.getElementById('patientPhone').textContent = patientData.cusPhone || patientData.phoneNumber || 'N/A';
            document.getElementById('patientEmail').textContent = patientData.cusEmail || patientData.email || 'N/A';
            document.getElementById('patientAddress').textContent = patientData.cusAddress || patientData.address || 'N/A';
            document.getElementById('patientOccupation').textContent = patientData.cusOccupation || patientData.occupation || 'N/A';
            document.getElementById('emergencyContact').textContent = patientData.emergencyContact || 'N/A';

            // Current status based on latest booking
            const statusElement = document.getElementById('currentStatus');
            if (patientData.bookStatus) {
                const statusText = getBookingStatusText(patientData.bookStatus);
                const statusClass = getBookingStatusClass(patientData.bookStatus);
                statusElement.textContent = statusText;
                statusElement.className = `status-badge ${statusClass}`;
            } else if (patientData.currentBooking) {
                const statusText = getBookingStatusText(patientData.currentBooking.bookStatus);
                const statusClass = getBookingStatusClass(patientData.currentBooking.bookStatus);
                statusElement.textContent = statusText;
                statusElement.className = `status-badge ${statusClass}`;
            } else {
                statusElement.textContent = 'Không có lịch hẹn';
                statusElement.className = 'status-badge inactive';
            }
        }

        function populateCurrentExamination(patientData, bookingSteps) {
            // Booking information
            if (patientData.currentBooking) {
                const booking = patientData.currentBooking;
                
                // Map booking type to Vietnamese
                const bookingTypeMap = {
                    'initial': 'Khám lần đầu',
                    'follow-up': 'Tái khám',
                    'consultation': 'Tư vấn'
                };
                document.getElementById('bookType').value = booking.bookType; // Use value for select
                document.getElementById('bookingNote').value = booking.note || ''; // Use value for textarea

                // Booking status
                const statusText = getBookingStatusText(booking.bookStatus);
                const statusClass = getBookingStatusClass(booking.bookStatus);
                const statusElement = document.getElementById('bookStatus');
                statusElement.value = booking.bookStatus; // Use value for select
                statusElement.className = `status-badge ${statusClass}`;

                // Service name
                document.getElementById('serviceName').textContent = booking.serviceName || 'N/A';
                document.getElementById('recordCreatedDate').value = booking.createdAt ? formatDateTimeForInput(booking.createdAt) : ''; // Use formatDateTimeForInput for datetime-local
            } else {
                document.getElementById('bookType').value = 'initial'; // Reset select
                document.getElementById('bookingNote').value = ''; // Reset textarea
                document.getElementById('serviceName').textContent = 'N/A';
                document.getElementById('recordCreatedDate').value = ''; // Reset datetime-local
            }

            // Medical record information
            if (patientData.currentMedicalRecord) {
                const record = patientData.currentMedicalRecord;
                
                // Record status
                const recordStatusMap = {
                    'active': 'Đang điều trị',
                    'pending': 'Chờ xử lý',
                    'closed': 'Đã kết thúc',
                    'completed': 'Hoàn thành'
                };
                const recordStatusElement = document.getElementById('recordStatus');
                recordStatusElement.value = record.recordStatus; // Use value for select
                recordStatusElement.className = `status-badge ${record.recordStatus === 'active' ? 'pending' : 'completed'}`;

                document.getElementById('diagnosis').value = record.diagnosis || ''; // Use value for textarea
                document.getElementById('treatmentPlan').value = record.treatmentPlan || ''; // Use value for textarea
                document.getElementById('dischargeDate').value = record.dischargeDate ? formatDateTimeForInput(record.dischargeDate) : ''; // Use formatDateTimeForInput for datetime-local
                document.getElementById('medicalNote').value = record.medicalNotes || ''; // Use value for textarea
            } else {
                document.getElementById('recordStatus').value = 'active'; // Reset select
                document.getElementById('diagnosis').value = ''; // Reset textarea
                document.getElementById('treatmentPlan').value = ''; // Reset textarea
                document.getElementById('dischargeDate').value = ''; // Reset datetime-local
                document.getElementById('medicalNote').value = ''; // Reset textarea
            }

            // Populate booking steps
            populateBookingSteps(bookingSteps);
        }

        function populateBookingSteps(bookingSteps) {
            const stepsContainer = document.getElementById('completedStepsList');
            const emptySteps = document.getElementById('emptySteps');
            
            stepsContainer.innerHTML = '';
            
            if (bookingSteps && bookingSteps.length > 0) {
                emptySteps.style.display = 'none';
                
                bookingSteps.forEach((step, index) => {
                    const stepElement = createStepElement(step, index + 1);
                    stepsContainer.appendChild(stepElement);
                });
            } else {
                emptySteps.style.display = 'block';
            }
        }

        function createStepElement(step, stepNumber) {
            const stepDiv = document.createElement('div');
            stepDiv.className = 'step-item';
            
            const statusText = step.stepStatus === 'completed' ? 'Hoàn thành' : 
                              step.stepStatus === 'pending' ? 'Đang thực hiện' : 'Chưa bắt đầu';
            const statusClass = step.stepStatus === 'completed' ? 'completed' : 'pending';
            
            stepDiv.innerHTML = `
                <div class="step-header">
                    <div class="step-info">
                        <strong>Bước ${stepNumber}: ${step.subServiceName || 'Dịch vụ không xác định'}</strong>
                        <span class="step-time">${formatDateTime(step.performedAt) || 'Chưa thực hiện'}</span>
                    </div>
                    <div class="step-actions">
                        <span class="step-status ${statusClass}">${statusText}</span>
                    </div>
                </div>
                <div class="step-summary">
                    <p><strong>Kết quả:</strong> ${step.stepResult || 'Chưa có kết quả'}</p>
                    <p><strong>Ghi chú:</strong> ${step.stepNote || 'Không có ghi chú'}</p>
                </div>
            `;
            
            return stepDiv;
        }

        async function loadMedicalHistory(patientData) {
            const historyContent = document.getElementById('historyContent');
            
            try {
                // Show loading
                historyContent.innerHTML = '<div style="text-align: center; padding: 2rem;"><i class="fas fa-spinner fa-spin"></i> Đang tải lịch sử khám...</div>';
                
                // Fetch medical history
                const response = await fetch(`/api/customer/${patientData.cusId}/medical-history`);
                
                if (response.ok) {
                    const historyData = await response.json();
                    renderMedicalHistory(historyData);
                } else {
                    // Use sample data if API not available
                    renderSampleHistory();
                }
            } catch (error) {
                console.error('Error loading medical history:', error);
                renderSampleHistory();
            }
        }

        function renderMedicalHistory(historyData) {
            const historyContent = document.getElementById('historyContent');
            
            if (historyData && historyData.length > 0) {
                let historyHtml = '';
                historyData.forEach(record => {
                    historyHtml += `
                        <div class="history-item">
                            <div class="history-header">
                                <div class="history-date">${formatDate(record.createdAt)}</div>
                                <div class="history-status ${record.recordStatus}">${record.recordStatus === 'active' ? 'Đang điều trị' : 'Đã kết thúc'}</div>
                            </div>
                            <div class="history-content">
                                <div class="history-info">
                                    <p><strong>Mã hồ sơ:</strong> MR${String(record.recordId).padStart(3, '0')}</p>
                                    <p><strong>Dịch vụ:</strong> ${record.serviceName || 'N/A'}</p>
                                    <p><strong>Bác sĩ điều trị:</strong> ${record.doctorName || 'N/A'}</p>
                                </div>
                                <div class="history-details">
                                    <p><strong>Chẩn đoán:</strong> ${record.diagnosis || 'N/A'}</p>
                                    <p><strong>Kế hoạch điều trị:</strong> ${record.treatmentPlan || 'N/A'}</p>
                                    <p><strong>Ngày dự kiến kết thúc:</strong> ${formatDate(record.dischargeDate) || 'N/A'}</p>
                                </div>
                                <div class="history-notes">
                                    <p><strong>Ghi chú:</strong> ${record.medicalNotes || 'Không có ghi chú'}</p>
                                </div>
                            </div>
                        </div>
                    `;
                });
                historyContent.innerHTML = historyHtml;
            } else {
                renderSampleHistory();
            }
        }

        function renderSampleHistory() {
            document.getElementById('historyContent').innerHTML = `
                <div style="text-align: center; padding: 2rem; color: #64748b;">
                    <i class="fas fa-history" style="font-size: 2rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                    <p>Chưa có lịch sử bệnh án</p>
                </div>
            `;
        }

        async function loadTreatmentPlan(patientData) {
            const treatmentContent = document.getElementById('treatmentContent');
            
            try {
                treatmentContent.innerHTML = '<div style="text-align: center; padding: 2rem;"><i class="fas fa-spinner fa-spin"></i> Đang tải kế hoạch điều trị...</div>';
                
                // Fetch treatment plan using bookId
                let treatmentData = null;
                if (patientData.bookId) {
                    const response = await fetch(`/api/booking-steps/by-booking/${patientData.bookId}`);
                    if (response.ok) {
                        treatmentData = await response.json();
                    }
                }
                
                renderTreatmentPlan(treatmentData, patientData);
            } catch (error) {
                console.error('Error loading treatment plan:', error);
                renderSampleTreatmentPlan();
            }
        }

        function renderTreatmentPlan(treatmentData, patientData) {
            const treatmentContent = document.getElementById('treatmentContent');
            
            if (treatmentData && treatmentData.length > 0) {
                let treatmentHtml = `
                    <div class="current-service">
                        <h5><i class="fas fa-medical-kit"></i> Dịch vụ hiện tại</h5>
                        <div class="service-card">
                            <h6>${patientData.currentBooking?.serviceName || 'Dịch vụ điều trị'}</h6>
                            <p class="service-description">Các bước điều trị được thực hiện theo kế hoạch của bác sĩ</p>
                        </div>
                    </div>
                    
                    <div class="sub-services">
                        <h5><i class="fas fa-list-check"></i> Các bước điều trị chi tiết</h5>
                `;
                
                treatmentData.forEach((step, index) => {
                    const statusClass = step.stepStatus === 'completed' ? 'completed' : 
                                      step.stepStatus === 'pending' ? 'current' : 'pending';
                    const statusIcon = step.stepStatus === 'completed' ? 'fa-check-circle' : 
                                      step.stepStatus === 'pending' ? 'fa-clock' : 'fa-circle';
                    
                    treatmentHtml += `
                        <div class="sub-service-item ${statusClass}">
                            <div class="sub-service-header">
                                <span class="step-number">${index + 1}</span>
                                <div class="sub-service-info">
                                    <h6>${step.subServiceName || `Bước ${index + 1}`}</h6>
                                    <p>${step.stepResult || 'Đang thực hiện theo kế hoạch'}</p>
                                </div>
                                <div class="sub-service-details">
                                    <span class="estimated-day">${formatDate(step.performedAt) || 'Dự kiến'}</span>
                                </div>
                                <span class="status-icon ${statusClass}"><i class="fas ${statusIcon}"></i></span>
                            </div>
                        </div>
                    `;
                });
                
                const completedSteps = treatmentData.filter(step => step.stepStatus === 'completed').length;
                const pendingSteps = treatmentData.filter(step => step.stepStatus === 'pending').length;
                
                treatmentHtml += `
                        </div>
                        <div class="treatment-summary">
                            <h5><i class="fas fa-chart-pie"></i> Tổng quan điều trị</h5>
                            <div class="summary-grid">
                                <div class="summary-item">
                                    <span class="summary-label">Tổng số bước:</span>
                                    <span class="summary-value">${treatmentData.length}</span>
                                </div>
                                <div class="summary-item">
                                    <span class="summary-label">Đã hoàn thành:</span>
                                    <span class="summary-value">${completedSteps}</span>
                                </div>
                                <div class="summary-item">
                                    <span class="summary-label">Đang thực hiện:</span>
                                    <span class="summary-value">${pendingSteps}</span>
                                </div>
                            </div>
                        </div>
                `;
                
                treatmentContent.innerHTML = treatmentHtml;
            } else {
                renderSampleTreatmentPlan();
            }
        }

        function renderSampleTreatmentPlan() {
            document.getElementById('treatmentContent').innerHTML = `
                <div style="text-align: center; padding: 2rem; color: #64748b;">
                    <i class="fas fa-tasks" style="font-size: 2rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                    <p>Chưa có kế hoạch điều trị</p>
                </div>
            `;
        }

        async function loadPrescriptionData(patientData) {
            const prescriptionContent = document.getElementById('prescriptionContent');
            
            try {
                prescriptionContent.innerHTML = '<div style="text-align: center; padding: 2rem;"><i class="fas fa-spinner fa-spin"></i> Đang tải đơn thuốc...</div>';
                
                let prescriptionData = null;
                if (patientData.bookId) {
                    const response = await fetch(`/api/drugs/by-booking/${patientData.bookId}`);
                    if (response.ok) {
                        prescriptionData = await response.json();
                    }
                }
                
                renderPrescriptionData(prescriptionData);
            } catch (error) {
                console.error('Error loading prescription data:', error);
                renderSamplePrescription();
            }
        }

        function renderPrescriptionData(prescriptionData) {
            const prescriptionContent = document.getElementById('prescriptionContent');
            
            if (prescriptionData && prescriptionData.length > 0) {
                let prescriptionHtml = `
                    <div class="prescription-header">
                        <div class="prescription-info">
                            <div class="record-grid">
                                <div class="record-section">
                                    <label><i class="fas fa-calendar-alt"></i> Ngày kê đơn:</label>
                                    <span>${formatDateTime(prescriptionData[0].createdAt)}</span>
                                </div>
                                <div class="record-section">
                                    <label><i class="fas fa-hashtag"></i> Số đơn thuốc:</label>
                                    <span>DT${String(prescriptionData[0].drugId).padStart(3, '0')}</span>
                                </div>
                            </div>
                            <div class="record-section">
                                <label><i class="fas fa-stethoscope"></i> Ghi chú đơn thuốc:</label>
                                <div style="background: #f8fafc; padding: 0.75rem; border-radius: 6px; border: 1px solid #e2e8f0;">
                                    ${prescriptionData[0].drugNote || 'Không có ghi chú'}
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="drug-prescription">
                        <h5><i class="fas fa-list-ul"></i> Danh sách thuốc kê đơn</h5>
                        <div class="drugs-list">
                `;
                
                // Group drugs by prescription
                prescriptionData.forEach(drug => {
                    if (drug.drugItems && drug.drugItems.length > 0) {
                        drug.drugItems.forEach(item => {
                            prescriptionHtml += `
                                <div class="drug-item" style="background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem; margin-bottom: 1rem;">
                                    <div class="drug-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                                        <h6 style="margin: 0; color: #1e293b; font-weight: 600;">${item.itemName}</h6>
                                        <span style="background: #f0fdf4; color: #166534; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.8rem; font-weight: 500;">
                                            ${item.quantity} ${item.unit || 'viên'}
                                        </span>
                                    </div>
                                    <div class="drug-details" style="color: #6b7280; font-size: 0.9rem;">
                                        <p style="margin: 0.25rem 0;"><strong>Liều dùng:</strong> ${item.dosage || 'Theo chỉ định bác sĩ'}</p>
                                        <p style="margin: 0.25rem 0;"><strong>Cách dùng:</strong> ${item.instructions || 'Uống sau ăn'}</p>
                                        <p style="margin: 0.25rem 0;"><strong>Ghi chú:</strong> ${item.note || 'Không có ghi chú đặc biệt'}</p>
                                    </div>
                                </div>
                            `;
                        });
                    }
                });
                
                prescriptionHtml += `
                        </div>
                    </div>
                `;
                
                prescriptionContent.innerHTML = prescriptionHtml;
            } else {
                renderSamplePrescription();
            }
        }

        function renderSamplePrescription() {
            document.getElementById('prescriptionContent').innerHTML = `
                <div style="text-align: center; padding: 2rem; color: #64748b;">
                    <i class="fas fa-pills" style="font-size: 2rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                    <p>Chưa có đơn thuốc</p>
                </div>
            `;
        }

        async function loadTestResults(patientData) {
            const testResultsContent = document.getElementById('testResultsContent');
            
            try {
                testResultsContent.innerHTML = '<div style="text-align: center; padding: 2rem;"><i class="fas fa-spinner fa-spin"></i> Đang tải kết quả xét nghiệm...</div>';
                
                let testData = null;
                if (patientData.bookId) {
                    const response = await fetch(`/api/booking-steps/test-results/${patientData.bookId}`);
                    if (response.ok) {
                        testData = await response.json();
                    }
                }
                
                renderTestResults(testData);
            } catch (error) {
                console.error('Error loading test results:', error);
                renderSampleTestResults();
            }
        }

        function renderTestResults(testData) {
            const testResultsContent = document.getElementById('testResultsContent');
            
            if (testData && testData.length > 0) {
                let testHtml = `
                    <div class="booking-steps-results">
                        <h5><i class="fas fa-vial"></i> Kết quả các bước đã thực hiện</h5>
                `;
                
                testData.forEach(test => {
                    const statusClass = test.stepStatus === 'completed' ? 'completed' : 'pending';
                    
                    testHtml += `
                        <div class="step-result-item" style="background: white; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 1rem; padding: 1rem;">
                            <div class="step-result-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                                <div class="step-info">
                                    <h6 style="margin: 0; color: #1e293b; font-weight: 600;">${test.subServiceName}</h6>
                                    <span style="color: #64748b; font-size: 0.9rem;">${formatDateTime(test.performedAt)}</span>
                                </div>
                                <span class="step-status ${statusClass}" style="padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.8rem; font-weight: 500;">
                                    ${test.stepStatus === 'completed' ? 'Hoàn thành' : 'Đang chờ'}
                                </span>
                            </div>
                            <div class="step-result-content">
                                <div class="result-summary" style="background: #f8fafc; padding: 1rem; border-radius: 6px; margin-bottom: 1rem;">
                                    <p style="margin: 0; color: #374151;"><strong>Kết quả:</strong> ${test.stepResult || 'Chưa có kết quả'}</p>
                                </div>
                                <div class="result-note" style="color: #6b7280;">
                                    <strong>Ghi chú:</strong> ${test.stepNote || 'Không có ghi chú đặc biệt'}
                                </div>
                            </div>
                        </div>
                    `;
                });
                
                testHtml += `</div>`;
                testResultsContent.innerHTML = testHtml;
            } else {
                renderSampleTestResults();
            }
        }

        function renderSampleTestResults() {
            document.getElementById('testResultsContent').innerHTML = `
                <div style="text-align: center; padding: 2rem; color: #64748b;">
                    <i class="fas fa-flask" style="font-size: 2rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                    <p>Chưa có kết quả xét nghiệm</p>
                </div>
            `;
        }

        // Helper function to show loading
        function showLoading() {
            const loadingDiv = document.createElement('div');
            loadingDiv.id = 'loadingOverlay';
            loadingDiv.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                color: white;
                font-size: 1.2rem;
            `;
            loadingDiv.innerHTML = '<div><i class="fas fa-spinner fa-spin"></i> Đang tải...</div>';
            document.body.appendChild(loadingDiv);
        }

        function hideLoading() {
            const loading = document.getElementById('loadingOverlay');
            if (loading) {
                loading.remove();
            }
        }

        function showErrorMessage(message) {
            alert(message); // Simple alert for now, can be enhanced with better UI
        }

        // Helper functions for booking status
        function getBookingStatusText(status) {
            switch (status) {
                case 'completed':
                    return 'Đã checkout';
                case 'confirmed':
                    return 'Đã đến khám';
                case 'pending':
                    return 'Chưa checkout';
                default:
                    return status;
            }
        }

        function getBookingStatusClass(status) {
            switch (status) {
                case 'completed':
                    return 'completed';
                case 'confirmed':
                    return 'pending';
                case 'pending':
                    return 'pending';
                default:
                    return '';
            }
        }

        // Edit patient record
        function editPatientRecord(cusId) {
            window.location.href = `bac-si-dashboard.html?editPatient=${cusId}`;
        }

        // View full record
        function viewFullRecord() {
            const cusId = document.getElementById('cusId').textContent.replace('BN', '').replace(/^0+/, '');
            window.location.href = `bac-si-dashboard.html?viewPatient=${cusId}`;
        }

        // Close modal
        function closeModal() {
            document.getElementById('patientModal').style.display = 'none';
            
            // Clear current patient data to force fresh load next time
            currentPatientData = null;
            
            // Clear localStorage cache
            localStorage.removeItem('drugId');
            
            // Reset form states
            const stepForm = document.getElementById('stepForm');
            if (stepForm) stepForm.style.display = 'none';
            
            // Clear any editing states
            window.currentEditingStepData = null;
            window.currentEditingStepId = null;
        }

        // Refresh patient list
        function refreshPatientList() {
            document.getElementById('searchInput').value = '';
            document.getElementById('statusFilter').value = 'all';
            document.getElementById('genderFilter').value = 'all';
            loadPatientDataFromAPI();
        }

        // Logout function
        function logout() {
            if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
                localStorage.clear();
                window.location.href = 'index.html';
            }
        }

        // Close modal when clicking outside
        window.onclick = function(event) {
            const modal = document.getElementById('patientModal');
            if (event.target === modal) {
                closeModal();
            }
        }

        // Save patient record
        async function savePatientRecord() {
            if (!currentPatientData) {
                showErrorMessage('Không có dữ liệu bệnh nhân để lưu');
                return;
            }

            try {
                showLoading();

                // Collect form data
                const recordData = {
                    bookType: document.getElementById('bookType').value,
                    bookStatus: document.getElementById('bookStatus').value,
                    bookingNote: document.getElementById('bookingNote').value,
                    recordStatus: document.getElementById('recordStatus').value,
                    recordCreatedDate: document.getElementById('recordCreatedDate').value,
                    diagnosis: document.getElementById('diagnosis').value,
                    treatmentPlan: document.getElementById('treatmentPlan').value,
                    dischargeDate: document.getElementById('dischargeDate').value,
                    medicalNote: document.getElementById('medicalNote').value
                };

                console.log('Saving patient record:', recordData);

                // Update booking if bookId exists
                if (currentPatientData.bookId) {
                    const bookingUpdateResponse = await fetch(`/api/booking/update/${currentPatientData.bookId}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            bookType: recordData.bookType,
                            bookStatus: recordData.bookStatus,
                            note: recordData.bookingNote
                        })
                    });

                    if (!bookingUpdateResponse.ok) {
                        console.warn('Failed to update booking, continuing with medical record update');
                    }
                }

                // Update medical record if exists
                if (currentPatientData.currentMedicalRecord) {
                    const recordUpdateResponse = await fetch(`/api/medical-records/update/${currentPatientData.currentMedicalRecord.recordId}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            recordStatus: recordData.recordStatus,
                            diagnosis: recordData.diagnosis,
                            treatmentPlan: recordData.treatmentPlan,
                            dischargeDate: recordData.dischargeDate,
                            medicalNotes: recordData.medicalNote
                        })
                    });

                    if (!recordUpdateResponse.ok) {
                        console.warn('Failed to update medical record');
                    }
                }

                hideLoading();
                alert('Đã lưu thông tin bệnh nhân thành công!');
                
                // Refresh patient list
                refreshPatientList();

            } catch (error) {
                console.error('Error saving patient record:', error);
                hideLoading();
                showErrorMessage('Có lỗi xảy ra khi lưu thông tin. Vui lòng thử lại.');
            }
        }

        // Cancel changes
        function cancelChanges() {
            if (confirm('Bạn có chắc chắn muốn hủy tất cả thay đổi?')) {
                // Repopulate with original data
                if (currentPatientData) {
                    populateCurrentExamination(currentPatientData, []);
                }
            }
        }

        // Print record
        function printRecord() {
            if (!currentPatientData) {
                showErrorMessage('Không có dữ liệu để in');
                return;
            }

            // Create print window
            const printWindow = window.open('', '_blank', 'width=800,height=600');
            
            const printContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Hồ sơ bệnh án - ${document.getElementById('patientName').textContent}</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; }
                        .header { text-align: center; margin-bottom: 20px; border-bottom: 1px solid #ccc; padding-bottom: 10px; }
                        .patient-info { margin-bottom: 20px; }
                        .section { margin-bottom: 15px; }
                        .label { font-weight: bold; }
                        table { width: 100%; border-collapse: collapse; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                        th { background-color: #f2f2f2; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h2>HỒ SƠ BỆNH ÁN</h2>
                        <p>Phòng khám Hiếm muộn ABC</p>
                        <p>Ngày in: ${new Date().toLocaleDateString('vi-VN')}</p>
                    </div>
                    
                    <div class="patient-info">
                        <h3>THÔNG TIN BỆNH NHÂN</h3>
                        <table>
                            <tr><td class="label">Họ tên:</td><td>${document.getElementById('patientName').textContent}</td></tr>
                            <tr><td class="label">Mã BN:</td><td>${document.getElementById('cusId').textContent}</td></tr>
                            <tr><td class="label">Giới tính:</td><td>${document.getElementById('patientGender').textContent}</td></tr>
                            <tr><td class="label">Ngày sinh:</td><td>${document.getElementById('patientBirthDate').textContent}</td></tr>
                            <tr><td class="label">Số điện thoại:</td><td>${document.getElementById('patientPhone').textContent}</td></tr>
                            <tr><td class="label">Địa chỉ:</td><td>${document.getElementById('patientAddress').textContent}</td></tr>
                        </table>
                    </div>

                    <div class="medical-info">
                        <h3>THÔNG TIN KHÁM BỆNH</h3>
                        <table>
                            <tr><td class="label">Loại đặt lịch:</td><td>${document.getElementById('bookType').options[document.getElementById('bookType').selectedIndex].text}</td></tr>
                            <tr><td class="label">Trạng thái:</td><td>${document.getElementById('bookStatus').options[document.getElementById('bookStatus').selectedIndex].text}</td></tr>
                            <tr><td class="label">Dịch vụ:</td><td>${document.getElementById('serviceName').textContent}</td></tr>
                            <tr><td class="label">Chẩn đoán:</td><td>${document.getElementById('diagnosis').value}</td></tr>
                            <tr><td class="label">Kế hoạch điều trị:</td><td>${document.getElementById('treatmentPlan').value}</td></tr>
                            <tr><td class="label">Ghi chú:</td><td>${document.getElementById('medicalNote').value}</td></tr>
                        </table>
                    </div>

                    <div class="footer" style="margin-top: 30px; text-align: right;">
                        <p>Bác sĩ điều trị: BS. Nguyễn Ngọc Khánh Linh</p>
                        <p>Chữ ký: ________________</p>
                    </div>
                </body>
                </html>
            `;

            printWindow.document.write(printContent);
            printWindow.document.close();
            printWindow.focus();
            printWindow.print();
        }

        // ========== SERVICE SELECTION AND STEP FORM ==========
        function setupServiceSelection(bookId) {
            const serviceSelect = document.getElementById('serviceSelect');
            const stepForm = document.getElementById('stepForm');
            const selectedServiceTitle = document.getElementById('selectedServiceTitle');
            const emptyStepsDiv = document.getElementById('emptySteps');

            if (!serviceSelect || !stepForm) return;

            // 1. Fetch subservice list
            fetch(`/api/booking-steps/${bookId}/subservice-of-visit`)
                .then(res => {
                    if (!res.ok) throw new Error(`API lỗi: ${res.status}`);
                    return res.json();
                })
                .then(async subs => {
                    serviceSelect.innerHTML = '<option value="">-- Chọn dịch vụ/bước --</option>';
                    if (!Array.isArray(subs) || subs.length === 0) {
                        serviceSelect.innerHTML = '<option value="">Không có bước nào</option>';
                        if (emptyStepsDiv) emptyStepsDiv.style.display = '';
                        return;
                    }
                    for (const sub of subs) {
                        const opt = document.createElement('option');
                        opt.value = sub.subId;
                        opt.textContent = sub.subName;
                        serviceSelect.appendChild(opt);

                        try {
                            await fetch(`/api/booking-steps/set-pending/${bookId}/${sub.subId}`, {
                                method: 'PUT',
                                body: JSON.stringify({
                                    stepStatus: 'pending',
                                    performedAt: new Date().toISOString(),
                                    note: 'Đang tiến hành...',
                                }),
                                headers: { 'Content-Type': 'application/json' }
                            });
                        } catch (e) {
                            console.error('Lỗi update step:', bookId, sub.subId, e);
                        }
                    }

                    // Gán lại onchange sau khi render options!
                    serviceSelect.onchange = function () {
                        const selectedOption = this.options[this.selectedIndex];
                        if (this.value) {
                            selectedSubId = this.value;
                            selectedSubName = selectedOption.textContent;

                            selectedServiceTitle.innerHTML = `<i class="fas fa-edit"></i> Thực hiện: ${selectedSubName}`;
                            stepForm.style.display = 'block';
                            document.getElementById('performedAt').value = getLocalDateTimeValue();
                            document.getElementById('stepResult').value = '';
                            document.getElementById('stepNote').value = '';
                            document.getElementById('stepStatus').value = 'pending';
                        } else {
                            stepForm.style.display = 'none';
                            selectedSubId = null;
                            selectedSubName = '';
                        }
                    };

                    // Nếu cần mặc định ẩn form
                    stepForm.style.display = 'none';
                })
                .catch(err => {
                    console.error('Lỗi lấy subservice:', err);
                    serviceSelect.innerHTML = '<option value="">Không có bước nào</option>';
                    if (emptyStepsDiv) emptyStepsDiv.style.display = '';
                });
        }

        // Get current local date and time in the format YYYY-MM-DDTHH:MM
        function getLocalDateTimeValue() {
            const now = new Date();
            const year = now.getFullYear();
            const month = (now.getMonth() + 1).toString().padStart(2, '0');
            const day = now.getDate().toString().padStart(2, '0');
            const hour = now.getHours().toString().padStart(2, '0');
            const min = now.getMinutes().toString().padStart(2, '0');
            return `${year}-${month}-${day}T${hour}:${min}`;
        }

        // ========== BOOKING STEP MANAGEMENT ==========
        window.saveBookingStep = async function () {
            const serviceSelect = document.getElementById('serviceSelect');
            const performedAt = document.getElementById('performedAt').value;
            const stepStatus = document.getElementById('stepStatus').value;
            const stepResult = document.getElementById('stepResult').value;
            const stepNote = document.getElementById('stepNote').value;

            if (!serviceSelect.value || !performedAt || !stepResult) {
                alert('Vui lòng điền đầy đủ thông tin bắt buộc!');
                return;
            }

            const subId = serviceSelect.value;
            const subName = serviceSelect.options[serviceSelect.selectedIndex].textContent;
            const bookId = currentPatientData?.bookId;

            if (!bookId) {
                alert('Không tìm thấy thông tin booking!');
                return;
            }

            try {
                // Prepare data for API
                const stepData = {
                    subId: parseInt(subId),
                    performedAt: performedAt,
                    stepResult: stepResult,
                    stepNote: stepNote,
                    stepStatus: stepStatus
                };

                // Call API to save/update step
                let response;
                if (window.currentEditingStepData && window.currentEditingStepData.bookingStepId) {
                    // Update existing step
                    response = await fetch(`/api/booking-steps/update-with-booking/${bookId}/${subId}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(stepData)
                    });
                } else {
                    // Create new step  
                    response = await fetch(`/api/booking-steps/update-with-booking/${bookId}/${subId}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(stepData)
                    });
                }

                if (!response.ok) {
                    throw new Error('Failed to save booking step');
                }

                // Refresh the steps list from API
                await loadExistingBookingSteps(bookId);
                
                // Clear form
                cancelStepForm();
                
                // Clear editing data
                window.currentEditingStepData = null;

                alert('Đã lưu bước thực hiện thành công!');

            } catch (error) {
                console.error('Error saving booking step:', error);
                alert('Có lỗi xảy ra khi lưu bước thực hiện!');
            }
        };

        window.cancelStepForm = function () {
            const stepForm = document.getElementById('stepForm');
            const serviceSelect = document.getElementById('serviceSelect');
            if (stepForm) stepForm.style.display = 'none';
            if (serviceSelect) serviceSelect.value = '';
            const stepResult = document.getElementById('stepResult');
            const stepNote = document.getElementById('stepNote');
            const stepStatus = document.getElementById('stepStatus');
            if (stepResult) stepResult.value = '';
            if (stepNote) stepNote.value = '';
            if (stepStatus) stepStatus.value = 'pending';
            window.currentEditingStepId = null;

            updateEmptyStepsNotice();
        };

        window.editStep = function (stepId) {
            const stepsList = document.getElementById('completedStepsList');
            const stepItem = stepsList.querySelector(`[data-step-id="${stepId}"]`);
            if (stepItem) {
                const serviceSelect = document.getElementById('serviceSelect');
                const selectedServiceTitle = document.getElementById('selectedServiceTitle');
                const subId = stepItem.getAttribute('data-sub-id');
                const subName = stepItem.getAttribute('data-sub-name');
                const stepResult = stepItem.querySelector('.step-result').textContent;
                const stepNote = stepItem.querySelector('.step-note').textContent;

                // Chọn đúng dịch vụ
                serviceSelect.value = subId;
                selectedServiceTitle.innerHTML = `<i class="fas fa-edit"></i> Chỉnh sửa: ${subName}`;
                document.getElementById('stepResult').value = stepResult;
                document.getElementById('stepNote').value = stepNote;

                // Show form
                document.getElementById('stepForm').style.display = 'block';

                // Store editing step ID for later removal
                window.currentEditingStepId = stepId;
            }
        };

        function updateEmptyStepsNotice() {
            const stepsList = document.getElementById('completedStepsList');
            const emptyDiv = document.getElementById('emptySteps');
            if (!stepsList || !emptyDiv) return;
            
            // Đếm số node KHÔNG phải template
            const realItems = Array.from(stepsList.children).filter(child => !child.classList.contains('step-template'));
            if (realItems.length === 0) {
                emptyDiv.style.display = '';
            } else {
                emptyDiv.style.display = 'none';
            }
        }

        // ========== PRESCRIPTION TAB FUNCTIONS ==========
        window.addDrugPrescription = function () {
            drugCounter++;
            const drugsList = document.getElementById('drugsList');
            if (!drugsList) return;

            const itemId = `drugItem${drugCounter}`;

            const newDrugItem = document.createElement('div');
            newDrugItem.className = 'drug-item';
            newDrugItem.innerHTML = `
                <div class="drug-header">
                    <h6><i class="fas fa-capsules"></i> Thuốc #${drugCounter}</h6>
                    <button type="button" class="btn-remove-drug" onclick="removeDrugPrescription(this)" title="Xóa thuốc này">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                <div class="drug-content">
                    <div class="record-grid">
                        <div class="record-section">
                            <label><i class="fas fa-pills"></i> Tên thuốc:</label>
                            <input type="text" placeholder="Nhập tên thuốc..." id="drugName-${itemId}" class="form-control">
                        </div>
                        <div class="record-section">
                            <label><i class="fas fa-weight"></i> Hàm lượng:</label>
                            <input type="text" placeholder="Ví dụ: 5mg" id="dosage-${itemId}" class="form-control">
                        </div>
                    </div>
                    <div class="record-grid">
                        <div class="record-section">
                            <label><i class="fas fa-clock"></i> Tần suất sử dụng:</label>
                            <input type="text" placeholder="Ví dụ: 2 lần/ngày" id="frequency-${itemId}" class="form-control">
                        </div>
                        <div class="record-section">
                            <label><i class="fas fa-calendar-days"></i> Thời gian dùng:</label>
                            <input type="text" placeholder="Ví dụ: 30 ngày" value="30 ngày" id="duration-${itemId}" class="form-control">
                        </div>
                    </div>
                    <div class="record-section">
                        <label><i class="fas fa-comment-medical"></i> Hướng dẫn sử dụng & Lưu ý:</label>
                        <textarea rows="2" placeholder="Ghi chú cách sử dụng thuốc..." id="drugItemNote-${itemId}" class="form-control"></textarea>
                    </div>
                </div>
            `;

            drugsList.appendChild(newDrugItem);
            updatePrescriptionSummary();
        };

        window.removeDrugPrescription = function (button) {
            const drugItem = button.closest('.drug-item');
            if (!drugItem) return;

            if (confirm('Bạn có chắc chắn muốn xóa thuốc này?')) {
                drugItem.style.transition = 'all 0.3s ease';
                drugItem.style.opacity = '0';
                drugItem.style.transform = 'translateX(-20px)';

                setTimeout(() => {
                    drugItem.remove();
                    updatePrescriptionSummary();
                    renumberDrugs();
                }, 300);
            }
        };

        function renumberDrugs() {
            const items = document.querySelectorAll('#drugsList .drug-item');
            items.forEach((item, idx) => {
                const header = item.querySelector('.drug-header h6');
                if (header) header.innerHTML = `<i class="fas fa-capsules"></i> Thuốc #${idx + 1}`;
            });
        }

        function updatePrescriptionSummary() {
            const items = document.querySelectorAll('#drugsList .drug-item');
            const count = items.length;
            const statNumber = document.querySelector('.summary-stats .stat-number');
            if (statNumber) statNumber.textContent = count;
        }

        function fillPrescriptionHeader() {
            const nameInput = document.getElementById('prescribingDoctorName');
            const dateInput = document.getElementById('prescriptionDate');
            const numberInput = document.getElementById('prescriptionNumber');

            const fullName = localStorage.getItem('docFullName');
            const drugId = localStorage.getItem('drugId') || '';

            if (nameInput) nameInput.value = fullName || '';
            if (dateInput) dateInput.value = getLocalDateTimeValue();
            if (numberInput) numberInput.value = drugId;
        }

        function collectPrescriptionData() {
            const drugs = [];
            const drugItems = document.querySelectorAll('#drugsList .drug-item');

            drugItems.forEach(item => {
                const drugNameInput = item.querySelector('input[id^="drugName-"]');
                const dosageInput = item.querySelector('input[id^="dosage-"]');
                const frequencyInput = item.querySelector('input[id^="frequency-"]');
                const durationInput = item.querySelector('input[id^="duration-"]');
                const instructionsTextarea = item.querySelector('textarea[id^="drugItemNote-"]');

                const drugName = drugNameInput?.value?.trim() || '';
                const dosage = dosageInput?.value?.trim() || '';
                const frequency = frequencyInput?.value?.trim() || '';
                const duration = durationInput?.value?.trim() || '';
                const drugItemNote = instructionsTextarea?.value?.trim() || '';

                if (drugName !== '') {
                    drugs.push({
                        drugName,
                        dosage,
                        frequency,
                        duration,
                        drugItemNote,
                    });
                }
            });

            return {
                prescriptionNumber: document.getElementById('prescriptionNumber')?.value || '',
                prescriptionDate: document.getElementById('prescriptionDate')?.value || '',
                doctorName: document.getElementById('prescribingDoctorName')?.value || '',
                diagnosis: document.getElementById('prescriptionDiagnosis')?.value || '',
                drugs: drugs,
                generalNotes: document.getElementById('generalNotes')?.value || '',
            };
        }

        window.savePrescription = async function () {
            const data = collectPrescriptionData();
            const drugId = localStorage.getItem('drugId') || '';

            if (!data.prescriptionNumber) {
                showNotification('❌ Không tìm thấy prescriptionNumber. Vui lòng kiểm tra lại.', 'error');
                return;
            }

            try {
                // 1. Cập nhật bảng Drug
                const updateDrugRes = await fetch(`/api/drugs/update/${drugId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        createdAt: data.prescriptionDate || new Date().toISOString(),
                        note: data.diagnosis || ''
                    })
                });

                if (!updateDrugRes.ok) throw new Error('Không thể cập nhật đơn thuốc');

                // 2. Tạo mới các bản ghi DrugItem
                const drugItemsPayload = data.drugs.map(item => ({
                    drugName: item.drugName,
                    dosage: item.dosage,
                    frequency: item.frequency,
                    duration: item.duration,
                    drugItemNote: item.drugItemNote
                }));

                const drugItemRes = await fetch(`/api/drug-items/create/${drugId}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(drugItemsPayload)
                });

                if (!drugItemRes.ok) throw new Error('Không thể lưu thuốc con');

                showNotification('💊 Đã lưu đơn thuốc thành công!', 'success');
            } catch (err) {
                console.error(err);
                showNotification('❌ Có lỗi khi lưu đơn thuốc', 'error');
            }
        };

        window.previewPrescription = function () {
            const prescriptionData = collectPrescriptionData();

            const previewContent = `
                <div style="max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background: white;">
                    <h3 style="text-align: center; margin-bottom: 20px;">Xem trước đơn thuốc</h3>
                    <div style="margin-bottom: 15px;">
                        <strong>Chẩn đoán:</strong> ${prescriptionData.diagnosis}
                    </div>
                    <div style="margin-bottom: 15px;">
                        <strong>Danh sách thuốc:</strong>
                        <ul style="margin-left: 20px;">
                            ${prescriptionData.drugs.map((drug, index) => `
                                <li style="margin-bottom: 10px;">
                                    <strong>${drug.drugName} ${drug.dosage}</strong><br>
                                    ${drug.frequency}, ${drug.duration}<br>
                                    <em>${drug.drugItemNote}</em>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                    <div style="margin-bottom: 15px;">
                        <strong>Lời dặn:</strong> ${prescriptionData.generalNotes}
                    </div>
                    <div style="text-align: center; margin-top: 20px;">
                        <button onclick="this.parentElement.parentElement.remove()" style="padding: 8px 16px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer;">Đóng</button>
                    </div>
                </div>
            `;

            const overlay = document.createElement('div');
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.6);
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
            `;
            overlay.innerHTML = previewContent;

            overlay.addEventListener('click', function (e) {
                if (e.target === overlay) {
                    overlay.remove();
                }
            });

            document.body.appendChild(overlay);
        };

        // ========== EDITABLE TEST RESULTS FUNCTIONS ==========
        window.addNewTestItem = function () {
            const testContainer = document.querySelector('.booking-steps-results');
            const testCount = testContainer.querySelectorAll('.step-result-item').length + 1;

            const newTestItem = document.createElement('div');
            newTestItem.className = 'step-result-item';
            newTestItem.innerHTML = `
                <div class="step-result-header">
                    <div class="step-info">
                        <h6 contenteditable="true" class="editable-title">Xét nghiệm mới ${testCount}</h6>
                        <input type="datetime-local" class="editable-date" value="${getLocalDateTimeValue()}">
                    </div>
                    <select class="step-status-select">
                        <option value="completed">Hoàn thành</option>
                        <option value="pending" selected>Đang chờ</option>
                        <option value="cancelled">Đã hủy</option>
                    </select>
                </div>
                <div class="step-result-content">
                    <div class="result-grid">
                        ${createResultItemHtml()}
                    </div>
                    <button type="button" class="add-test-item-btn" onclick="addTestResultRow(this)" style="margin-top: 8px; padding: 8px 16px; font-size: 0.8rem;">
                        <i class="fas fa-plus"></i> Thêm chỉ số
                    </button>
                    <div class="result-note">
                        <strong>Ghi chú:</strong> 
                        <textarea class="editable-note" placeholder="Nhập ghi chú..."></textarea>
                    </div>
                    <button type="button" class="remove-test-item-btn" onclick="removeTestItem(this)" style="margin-top: 16px;">
                        <i class="fas fa-trash"></i> Xóa toàn bộ xét nghiệm
                    </button>
                </div>
            `;
            testContainer.appendChild(newTestItem);
            showNotification('Đã thêm xét nghiệm mới!', 'success');
        };

        function createResultItemHtml(label = '', value = '', unit = '', status = 'Bình thường', editable = true) {
            return `
                <div class="result-item">
                    <input type="text" class="editable-label" value="${label}" placeholder="Tên chỉ số" ${editable ? '' : 'readonly'}>
                    :
                    <input type="text" class="editable-result" value="${value}" placeholder="Giá trị" ${editable ? '' : 'readonly'}>
                    <select class="unit-select" ${editable ? '' : 'disabled'}>
                        <option value="triệu/ml"${unit === 'triệu/ml' ? ' selected' : ''}>triệu/ml</option>
                        <option value="mg/ml"${unit === 'mg/ml' ? ' selected' : ''}>mg/ml</option>
                        <option value="mIU/ml"${unit === 'mIU/ml' ? ' selected' : ''}>mIU/ml</option>
                        <option value="ng/ml"${unit === 'ng/ml' ? ' selected' : ''}>ng/ml</option>
                        <option value="pg/ml"${unit === 'pg/ml' ? ' selected' : ''}>pg/ml</option>
                        <option value="%"${unit === '%' ? ' selected' : ''}>%</option>
                    </select>
                    <select class="status-select" ${editable ? '' : 'disabled'}>
                        <option value="Bình thường"${status === 'Bình thường' ? ' selected' : ''}>Bình thường</option>
                        <option value="Cao"${status === 'Cao' ? ' selected' : ''}>Cao</option>
                        <option value="Thấp"${status === 'Thấp' ? ' selected' : ''}>Thấp</option>
                        <option value="Bất thường"${status === 'Bất thường' ? ' selected' : ''}>Bất thường</option>
                    </select>
                    ${editable ? `
                        <button type="button" class="remove-test-item-btn" onclick="removeTestResultItem(this)">
                            <i class="fas fa-trash"></i> Xóa
                        </button>
                    ` : ''}
                </div>
            `;
        }

        // Add test result row to existing test
        window.addTestResultRow = function (button) {
            const resultGrid = button.parentElement.querySelector('.result-grid');
            resultGrid.insertAdjacentHTML('beforeend', createResultItemHtml());
        };

        // Remove individual test result item
        window.removeTestResultItem = function (button) {
            if (confirm('Bạn có chắc chắn muốn xóa chỉ số này?')) {
                button.closest('.result-item').remove();
            }
        };

        // Remove entire test item
        window.removeTestItem = function (button) {
            if (confirm('Bạn có chắc chắn muốn xóa toàn bộ xét nghiệm này?')) {
                button.closest('.step-result-item').remove();
                showNotification('Đã xóa xét nghiệm!', 'info');
            }
        };

        // Save all test results
        window.saveAllTestResults = function () {
            const testItems = document.querySelectorAll('.step-result-item');
            const testResults = [];
            testItems.forEach(item => {
                const bookingStepId = item.dataset.bookingStepId || null;
                const subId = item.dataset.subId;
                const subName = item.querySelector('.editable-title').textContent.trim();
                const performedAt = item.querySelector('.editable-date').value;
                const stepStatus = item.querySelector('.step-status-select').value;
                const note = item.querySelector('.editable-note').value;

                const results = [];
                item.querySelectorAll('.result-item').forEach(resultItem => {
                    results.push({
                        indexName: resultItem.querySelector('.editable-label').value.trim(),
                        value: resultItem.querySelector('.editable-result').value.trim(),
                        unit: resultItem.querySelector('.unit-select').value,
                        status: resultItem.querySelector('.status-select').value
                    });
                });

                testResults.push({
                    bookingStepId,
                    subId,
                    subName,
                    performedAt,
                    results,
                    note,
                    stepStatus
                });
            });

            console.log("Test Results Payload:", testResults);

            // Gửi về backend
            fetch('/api/booking-steps/save-test-results', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(testResults)
            })
            .then(async res => {
                if (!res.ok) {
                    const errMsg = await res.text();
                    console.error("API save-test-results error:", errMsg);
                    throw new Error(errMsg);
                }
                return res.json();
            })
            .then(data => {
                showNotification('Đã lưu tất cả kết quả xét nghiệm!', 'success');
            })
            .catch((err) => {
                alert('Lưu thất bại!');
                console.error('Lỗi khi lưu test results:', err);
            });
        };

        // Render test results from backend
        window.renderTestResults = function (testResults) {
            const testContainer = document.querySelector('.booking-steps-results');
            testContainer.innerHTML = '';

            testResults.forEach(test => {
                const isEditable = test.stepStatus !== 'completed';
                const newTestItem = document.createElement('div');
                newTestItem.className = 'step-result-item';
                newTestItem.dataset.bookingStepId = test.bookingStepId || '';
                newTestItem.dataset.subId = test.subId;

                const titleReadOnly = isEditable ? 'contenteditable="true"' : 'contenteditable="false"';
                const addRowBtn = isEditable ? `
                    <button type="button" class="add-test-item-btn" onclick="addTestResultRow(this)" style="margin-top: 8px; padding: 8px 16px; font-size: 0.8rem;">
                        <i class="fas fa-plus"></i> Thêm chỉ số
                    </button>` : '';

                newTestItem.innerHTML = `
                    <div class="step-result-header">
                        <div class="step-info">
                            <h6 ${titleReadOnly} class="editable-title">${test.subName || ''}</h6>
                            <input type="datetime-local" class="editable-date" value="${formatDateTimeLocal(test.performedAt)}" ${isEditable ? '' : 'readonly'}>
                        </div>
                        <select class="step-status-select" ${isEditable ? '' : 'disabled'}>
                            <option value="completed"${test.stepStatus === 'completed' ? ' selected' : ''}>Hoàn thành</option>
                            <option value="pending"${test.stepStatus === 'pending' ? ' selected' : ''}>Đang chờ</option>
                            <option value="cancelled"${test.stepStatus === 'inactive' ? ' selected' : ''}>Không kích hoạt</option>
                        </select>
                    </div>
                    <div class="step-result-content">
                        <div class="result-grid"></div>
                        ${addRowBtn}
                        <div class="result-note">
                            <strong>Ghi chú:</strong>
                            <textarea class="editable-note" placeholder="Nhập ghi chú..." ${isEditable ? '' : 'readonly'}>${test.note || ''}</textarea>
                        </div>
                        ${isEditable ? `<button type="button" class="remove-test-item-btn" onclick="removeTestItem(this)" style="margin-top: 16px;"><i class="fas fa-trash"></i> Xóa toàn bộ xét nghiệm</button>` : ''}
                    </div>
                `;

                // Render từng result-item
                const grid = newTestItem.querySelector('.result-grid');
                (test.results || []).forEach(res => {
                    grid.insertAdjacentHTML('beforeend', createResultItemHtml(
                        res.indexName || '',
                        res.value || '',
                        res.unit || '',
                        res.status || 'Bình thường',
                        isEditable
                    ));
                });
                if (!test.results || !test.results.length) {
                    grid.insertAdjacentHTML('beforeend', createResultItemHtml('', '', '', 'Bình thường', isEditable));
                }
                testContainer.appendChild(newTestItem);
            });
        };

        function formatDateTimeLocal(isoString) {
            if (!isoString) return '';
            const date = new Date(isoString);
            return date.toISOString().slice(0, 16);
        }

        async function loadAndRenderTestResults(bookId) {
            try {
                const res = await fetch(`/api/booking-steps/test-results/${bookId}`);
                if (!res.ok) throw new Error('API error');
                const data = await res.json();
                console.log('Test Results API:', data);
                window.renderTestResults(data);
            } catch (e) {
                window.renderTestResults([]);
            }
        }

        // ========== ENHANCED VIEWPATIENTRECORD FUNCTION ==========
        // Enhanced patient record viewing with multiple API calls
        async function viewPatientRecord(cusId, bookId) {
            try {
                showLoading();
                
                console.log('Loading patient record for cusId:', cusId, 'bookId:', bookId);
                
                // Show modal first
                document.getElementById('patientModal').style.display = 'block';
                
                // Store for later use
                currentPatientData = { cusId, bookId };
                
                // Get patient data first
                const customerResponse = await fetch(`/api/customer/full-record/${cusId}`);
                if (!customerResponse.ok) {
                    throw new Error('Failed to fetch patient data');
                }

                const patientData = await customerResponse.json();
                patientData.bookId = bookId;
                currentPatientData = patientData;

                console.log('Patient data loaded:', patientData);

                // Populate basic patient information
                populatePatientInfo(patientData);
                
                // Populate current examination tab
                populateCurrentExamination(patientData, []);
                
                // CRITICAL: Load existing completed steps FIRST
                if (bookId) {
                    console.log('Loading booking steps for bookId:', bookId);
                    await loadExistingBookingSteps(bookId);
                    
                    // Then setup service selection 
                    setupServiceSelection(bookId);
                    
                    // Load other data
                    loadAndRenderTestResults(bookId);
                    await loadExistingPrescriptionData(bookId);
                }
                
                hideLoading();
                
            } catch (error) {
                console.error('Error loading patient record:', error);
                hideLoading();
                showErrorMessage('Không thể tải hồ sơ bệnh nhân. Vui lòng thử lại sau.');
            }
        }

        // Load existing booking steps from API with enhanced debugging
        async function loadExistingBookingSteps(bookId) {
            if (!bookId) {
                console.log('No bookId provided, skipping steps load');
                return;
            }

            try {
                console.log('Fetching booking steps from API for bookId:', bookId);
                const response = await fetch(`/api/booking-steps/by-booking/${bookId}`);
                
                console.log('API Response status:', response.status);
                
                if (!response.ok) {
                    console.error('API response not OK:', response.status, response.statusText);
                    return;
                }

                const steps = await response.json();
                console.log('Raw API response - booking steps:', steps);

                const stepsList = document.getElementById('completedStepsList');
                const stepTemplate = stepsList.querySelector('.step-template');
                const emptySteps = document.getElementById('emptySteps');

                if (!stepsList || !stepTemplate) {
                    console.error('Required DOM elements not found');
                    return;
                }

                // Clear existing steps (except template)
                const existingSteps = stepsList.querySelectorAll('.step-item:not(.step-template)');
                console.log('Clearing existing steps:', existingSteps.length);
                existingSteps.forEach(step => step.remove());

                if (steps && Array.isArray(steps) && steps.length > 0) {
                    console.log('Creating', steps.length, 'step elements');
                    
                    steps.forEach((step, index) => {
                        console.log(`Creating step ${index + 1}:`, step);
                        const stepElement = createStepElementFromAPI(step, stepTemplate, index + 1);
                        stepsList.appendChild(stepElement);
                    });
                    
                    if (emptySteps) emptySteps.style.display = 'none';
                    console.log('Steps loaded successfully');
                } else {
                    console.log('No steps found or empty array');
                    if (emptySteps) emptySteps.style.display = 'block';
                }

            } catch (error) {
                console.error('Error loading booking steps:', error);
                // Show error message to user
                const stepsList = document.getElementById('completedStepsList');
                if (stepsList) {
                    const errorDiv = document.createElement('div');
                    errorDiv.style.cssText = 'text-align: center; padding: 2rem; color: #ef4444;';
                    errorDiv.innerHTML = `
                        <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                        <p>Không thể tải dữ liệu các bước điều trị</p>
                        <p style="font-size: 0.9rem; color: #6b7280;">Error: ${error.message}</p>
                    `;
                    stepsList.appendChild(errorDiv);
                }
            }
        }

        // Create step element from API data
        function createStepElementFromAPI(step, template, stepNumber) {
            const newStepItem = template.cloneNode(true);
            newStepItem.style.display = '';
            newStepItem.classList.remove('step-template');
            newStepItem.classList.add('step-item');
            
            // Add status class
            if (step.stepStatus) {
                newStepItem.classList.add(step.stepStatus);
            }
            
            newStepItem.setAttribute('data-step-id', step.bookingStepId || Date.now());
            newStepItem.setAttribute('data-sub-id', step.subId || '');
            newStepItem.setAttribute('data-sub-name', step.subServiceName || '');

            // Populate step info
            const stepInfo = newStepItem.querySelector('.step-info strong');
            if (stepInfo) {
                stepInfo.textContent = `Bước ${stepNumber}: ${step.subServiceName || 'Dịch vụ không xác định'}`;
            }

            // Format and set time
            const stepTime = newStepItem.querySelector('.step-time');
            if (stepTime) {
                stepTime.textContent = formatDateTime(step.performedAt) || 'Chưa thực hiện';
            }

            // Set status
            const stepStatus = newStepItem.querySelector('.step-status');
            if (stepStatus) {
                const statusText = getStepStatusText(step.stepStatus);
                const statusClass = getStepStatusClass(step.stepStatus);
                stepStatus.textContent = statusText;
                stepStatus.className = `step-status ${statusClass}`;
                stepStatus.setAttribute('data-status', step.stepStatus || 'pending');
            }

            // Set result and note
            const stepResult = newStepItem.querySelector('.step-result');
            if (stepResult) {
                stepResult.textContent = step.stepResult || 'Chưa có kết quả';
            }

            const stepNote = newStepItem.querySelector('.step-note');
            if (stepNote) {
                stepNote.textContent = step.stepNote || 'Không có ghi chú';
            }

            // Add edit button functionality
            const editBtn = newStepItem.querySelector('.btn-edit-step');
            if (editBtn) {
                editBtn.onclick = function () {
                    editExistingStep(step);
                };
            }

            return newStepItem;
        }

        // Helper functions for step status
        function getStepStatusText(status) {
            switch (status) {
                case 'completed':
                    return 'Hoàn thành';
                case 'pending':
                    return 'Đang thực hiện';
                case 'inactive':
                    return 'Không hoạt động';
                default:
                    return 'Chưa bắt đầu';
            }
        }

        function getStepStatusClass(status) {
            switch (status) {
                case 'completed':
                    return 'completed';
                case 'pending':
                    return 'pending';
                case 'inactive':
                    return 'inactive';
                default:
                    return 'pending';
            }
        }

        // Edit existing step from API data
        function editExistingStep(stepData) {
            const serviceSelect = document.getElementById('serviceSelect');
            const selectedServiceTitle = document.getElementById('selectedServiceTitle');
            const stepForm = document.getElementById('stepForm');

            if (!serviceSelect || !stepForm) return;

            // Set service selection
            if (stepData.subId) {
                serviceSelect.value = stepData.subId;
                selectedSubId = stepData.subId;
                selectedSubName = stepData.subServiceName;
            }

            // Update form title
            if (selectedServiceTitle) {
                selectedServiceTitle.innerHTML = `<i class="fas fa-edit"></i> Chỉnh sửa: ${stepData.subServiceName || 'Bước điều trị'}`;
            }

            // Populate form fields
            const performedAtInput = document.getElementById('performedAt');
            if (performedAtInput && stepData.performedAt) {
                performedAtInput.value = formatDateTimeForInput(stepData.performedAt);
            }

            const stepStatusSelect = document.getElementById('stepStatus');
            if (stepStatusSelect) {
                stepStatusSelect.value = stepData.stepStatus || 'pending';
            }

            const stepResultTextarea = document.getElementById('stepResult');
            if (stepResultTextarea) {
                stepResultTextarea.value = stepData.stepResult || '';
            }

            const stepNoteTextarea = document.getElementById('stepNote');
            if (stepNoteTextarea) {
                stepNoteTextarea.value = stepData.stepNote || '';
            }

            // Show form
            stepForm.style.display = 'block';

            // Store editing data
            window.currentEditingStepData = stepData;
        }

        // Load existing prescription data
        async function loadExistingPrescriptionData(bookId) {
            if (!bookId) return;

            try {
                const response = await fetch(`/api/drugs/by-booking/${bookId}`);
                if (!response.ok) return;

                const drugData = await response.json();
                console.log('Loaded prescription data:', drugData);

                if (drugData && drugData.length > 0) {
                    // Populate prescription header
                    const prescriptionNumber = document.getElementById('prescriptionNumber');
                    const prescriptionDate = document.getElementById('prescriptionDate');
                    const prescriptionDiagnosis = document.getElementById('prescriptionDiagnosis');
                    const generalNotes = document.getElementById('generalNotes');

                    if (drugData[0].drugId && prescriptionNumber) {
                        prescriptionNumber.value = drugData[0].drugId;
                        localStorage.setItem('drugId', drugData[0].drugId);
                    }

                    if (drugData[0].createdAt && prescriptionDate) {
                        prescriptionDate.value = formatDateTimeForInput(drugData[0].createdAt);
                    }

                    if (drugData[0].drugNote && prescriptionDiagnosis) {
                        prescriptionDiagnosis.value = drugData[0].drugNote;
                    }

                    // Load drug items
                    const drugsList = document.getElementById('drugsList');
                    if (drugsList && drugData[0].drugItems) {
                        drugsList.innerHTML = ''; // Clear existing
                        drugCounter = 0;

                        drugData[0].drugItems.forEach(item => {
                            addExistingDrugItem(item);
                        });

                        updatePrescriptionSummary();
                    }
                }

            } catch (error) {
                console.error('Error loading prescription data:', error);
            }
        }

        // Add existing drug item from API data
        function addExistingDrugItem(drugItem) {
            drugCounter++;
            const drugsList = document.getElementById('drugsList');
            if (!drugsList) return;

            const itemId = `drugItem${drugCounter}`;

            const newDrugItem = document.createElement('div');
            newDrugItem.className = 'drug-item';
            newDrugItem.innerHTML = `
                <div class="drug-header">
                    <h6><i class="fas fa-capsules"></i> Thuốc #${drugCounter}</h6>
                    <button type="button" class="btn-remove-drug" onclick="removeDrugPrescription(this)" title="Xóa thuốc này">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                <div class="drug-content">
                    <div class="record-grid">
                        <div class="record-section">
                            <label><i class="fas fa-pills"></i> Tên thuốc:</label>
                            <input type="text" value="${drugItem.itemName || ''}" id="drugName-${itemId}" class="form-control">
                        </div>
                        <div class="record-section">
                            <label><i class="fas fa-weight"></i> Hàm lượng:</label>
                            <input type="text" value="${drugItem.dosage || ''}" id="dosage-${itemId}" class="form-control">
                        </div>
                    </div>
                    <div class="record-grid">
                        <div class="record-section">
                            <label><i class="fas fa-clock"></i> Tần suất sử dụng:</label>
                            <input type="text" value="${drugItem.instructions || ''}" id="frequency-${itemId}" class="form-control">
                        </div>
                        <div class="record-section">
                            <label><i class="fas fa-calendar-days"></i> Thời gian dùng:</label>
                            <input type="text" value="${drugItem.quantity || '30 ngày'}" id="duration-${itemId}" class="form-control">
                        </div>
                    </div>
                    <div class="record-section">
                        <label><i class="fas fa-comment-medical"></i> Hướng dẫn sử dụng & Lưu ý:</label>
                        <textarea rows="2" id="drugItemNote-${itemId}" class="form-control">${drugItem.note || ''}</textarea>
                    </div>
                </div>
            `;

            drugsList.appendChild(newDrugItem);
        }

        // Force refresh all patient data
        window.forceRefreshPatientData = async function() {
            if (!currentPatientData || !currentPatientData.bookId) {
                console.log('No current patient data to refresh');
                return;
            }

            const { cusId, bookId } = currentPatientData;
            console.log('Force refreshing data for cusId:', cusId, 'bookId:', bookId);

            try {
                showLoading();
                
                // Clear current data
                currentPatientData = null;
                
                // Reset modal state
                document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
                
                // Set current tab as active
                document.querySelector('.tab-btn').classList.add('active');
                document.getElementById('currentTab').classList.add('active');
                
                // Reload patient record with fresh data
                await viewPatientRecord(cusId, bookId);
                
                hideLoading();
                
                alert('Đã làm mới dữ liệu thành công!');
                
            } catch (error) {
                console.error('Error refreshing patient data:', error);
                hideLoading();
                alert('Có lỗi khi làm mới dữ liệu!');
            }
        };

        // Update close modal when clicking outside
        window.onclick = function(event) {
            const modal = document.getElementById('patientModal');
            const nextAppModal = document.getElementById('nextAppointmentModal');
            if (event.target === modal) {
                closeModal();
            }
            if (event.target === nextAppModal) {
                closeNextAppointmentModal();
            }
        }

        // ========== NEXT APPOINTMENT FUNCTIONS ==========
        
        let currentNextAppPatient = null;

        // Open next appointment modal for specific patient
        window.openNextAppointmentModal = function(cusId, patientName, patientInfo, serId) {
            currentNextAppPatient = { cusId, patientName, patientInfo, serId };
            
            // Update patient info in modal
            document.getElementById('nextAppPatientName').textContent = patientName;
            document.getElementById('nextAppPatientInfo').textContent = patientInfo;
            
            // Initialize form
            initializeNextAppointmentForm();
            
            // Show modal
            document.getElementById('nextAppointmentModal').classList.add('flex');
        };

        // Close next appointment modal
        window.closeNextAppointmentModal = function() {
            document.getElementById('nextAppointmentModal').classList.remove('flex');
            currentNextAppPatient = null;
            clearNextAppointmentForm();
        };

        // Initialize next appointment form
        function initializeNextAppointmentForm() {
            // Set minimum date to today
            const today = new Date().toISOString().split('T')[0];
            const nextAppDate = document.getElementById('nextAppDate');
            if (nextAppDate) {
                nextAppDate.setAttribute('min', today);
                nextAppDate.value = '';
            }
            
            // Clear other fields
            document.getElementById('nextAppTime').value = '';
            document.getElementById('nextAppNote').value = '';
            
            // Clear any existing checkboxes
            const checkboxes = document.querySelectorAll('#nextAppServiceList .service-checkbox');
            checkboxes.forEach(checkbox => {
                checkbox.checked = false;
            });
            
            // Clear summary
            const summaryDiv = document.getElementById('selectedServicesSummary');
            if (summaryDiv) {
                summaryDiv.style.display = 'none';
            }
            
            // Load services
            loadServicesForNextAppointment();
        }

        // Load SubServices for next appointment (filtered by current patient's service)
        async function loadServicesForNextAppointment() {
            try {
                if (!currentNextAppPatient || !currentNextAppPatient.serId) {
                    throw new Error('Không tìm thấy thông tin dịch vụ của bệnh nhân');
                }
                
                const response = await fetch(`/api/subservices/by-service/${currentNextAppPatient.serId}`);
                if (!response.ok) throw new Error('Failed to load subservices');
                
                const subServices = await response.json();
                const serviceContainer = document.getElementById('nextAppServiceList');
                
                if (serviceContainer) {
                    if (subServices.length > 0) {
                        let serviceHtml = '';
                        
                        subServices.forEach(subService => {
                            serviceHtml += `
                                <div class="service-checkbox-item" style="margin-bottom: 0.5rem; padding: 0.5rem; border: 1px solid #e5e7eb; border-radius: 4px; background: #f8fafc;">
                                    <label style="display: flex; align-items: center; cursor: pointer; margin: 0;">
                                        <input type="checkbox" 
                                               value="${subService.subId}" 
                                               data-name="${subService.subName}"
                                               data-price="${subService.subPrice}"
                                               class="service-checkbox" 
                                               style="margin-right: 0.5rem;">
                                        <div style="flex: 1;">
                                            <div style="font-weight: 500; color: #2d3748;">${subService.subName}</div>
                                            <div style="font-size: 0.9rem; color: #10b981; font-weight: 600;">${subService.subPrice.toLocaleString()}đ</div>
                                        </div>
                                    </label>
                                </div>
                            `;
                        });
                        
                        serviceContainer.innerHTML = serviceHtml;
                        
                        // Add event listeners to checkboxes
                        setTimeout(() => {
                            addServiceCheckboxListeners();
                            updateSelectedServicesSummary();
                        }, 100);
                    } else {
                        serviceContainer.innerHTML = `
                            <div style="text-align: center; padding: 1rem; color: #666;">
                                <i class="fas fa-info-circle"></i> Không có dịch vụ nào
                            </div>
                        `;
                    }
                }
            } catch (error) {
                console.error('Error loading subservices:', error);
                const serviceContainer = document.getElementById('nextAppServiceList');
                if (serviceContainer) {
                    serviceContainer.innerHTML = `
                        <div style="text-align: center; padding: 1rem; color: #ef4444;">
                            <i class="fas fa-exclamation-triangle"></i> Không thể tải danh sách dịch vụ
                        </div>
                    `;
                }
                showNotification('Không thể tải danh sách dịch vụ!', 'error');
            }
        }


                // // Get customer info for booking
                // const customerResponse = await fetch(`/api/customer/full-record/${currentNextAppPatient.cusId}`);
                // if (!customerResponse.ok) throw new Error('Cannot get customer info');
                
                // const customerData = await customerResponse.json();

                // const recordId = customerData.recordId;
                // const appointmentId = result.bookId;


        // Schedule next appointment
        // window.scheduleNextAppointment = async function() {
        //     if (!currentNextAppPatient) {
        //         showNotification('Không tìm thấy thông tin bệnh nhân!', 'error');
        //         return;
        //     }

        //     const docId = localStorage.getItem('docId');
            
        //     // Get form data
        //     const appointmentDate = document.getElementById('nextAppDate').value;
        //     const appointmentTime = document.getElementById('nextAppTime').value;
        //     const selectedServices = getSelectedServices();
        //     const note = document.getElementById('nextAppNote').value;
            
        //     // Validation
        //     if (!appointmentDate || !appointmentTime || selectedServices.length === 0) {
        //         showNotification('Vui lòng điền đầy đủ thông tin: ngày, giờ và ít nhất một dịch vụ!', 'error');
        //         return;
        //     }
            
        //     if (!docId) {
        //         showNotification('Không tìm thấy thông tin bác sĩ!', 'error');
        //         return;
        //     }
            
        //     // Parse time range
        //     const [startTime, endTime] = appointmentTime.split('-');
            
        //     try {
        //         const appointmentResponse = await fetch('/api/appointment', {
        //             method: 'POST',
        //             headers: {
        //                 'Content-Type': 'application/json'
        //             },
        //             body: JSON.stringify({
        //                 appointmentDate,
        //                 startTime: startTime.trim(),
        //                 endTime: endTime.trim(),
        //             })
        //         });
        //         if (!appointmentResponse.ok) throw new Error('Cannot create appointment');

        //         const appointmentData = await appointmentResponse.json();
        //         const slotId = appointmentData.slotId;

                
        //         // Prepare service list for note
        //         const serviceNames = selectedServices.map(service => service.subName).join(', ');
        //         const totalPrice = selectedServices.reduce((total, service) => total + service.subPrice, 0);
                
        //         // Prepare booking data with multiple services info
        //         const bookingData = {
        //             cusId: currentNextAppPatient.cusId,
        //             docId: parseInt(docId),
        //             slotId: slotId, 
        //             note: note || `Tái khám theo lịch hẹn - Dịch vụ: ${serviceNames} (Tổng: ${totalPrice.toLocaleString()}đ)`,
        //             bookType: 'follow-up',
        //             serId: currentNextAppPatient.serId // Use current patient's service ID
        //         };
                
        //         console.log('Booking data:', bookingData);
        //         console.log('Selected services:', selectedServices);
                
        //         // Create booking
        //         const bookingResponse = await fetch('/api/booking/create-initial-booking', {
        //             method: 'POST',
        //             headers: {
        //                 'Content-Type': 'application/json'
        //             },
        //             body: JSON.stringify(bookingData)
        //         });

        //         if (!bookingResponse.ok) {
        //             const errorText = await bookingResponse.text();
        //             throw new Error(errorText || 'Không thể tạo lịch hẹn');
        //         }

        //         const bookingresult = await bookingResponse.json();
        //         const bookId = bookingresult.bookingId;

        //         const stepResponse = await fetch(`/api/booking-steps/create-step-for-initial-booking/${bookId}`, {
        //             method: 'POST',
        //             headers: {
        //                 'Content-Type': 'application/json'
        //             },
        //             body: JSON.stringify({
        //                 bookId: bookId,
        //                 subId: selectedServices.map(service => service.subId),
        //                 stepStatus: 'inactive',
        //             })
        //         });

        //         if (stepResponse.ok) {
        //             const serviceCount = selectedServices.length;
        //             const serviceText = serviceCount === 1 ? 'dịch vụ' : `${serviceCount} dịch vụ`;
        //             showNotification(`✅ Đã đặt lịch hẹn lại thành công cho ${serviceText}: ${serviceNames}! Email xác nhận đã được gửi cho bệnh nhân.`, 'success');
        //             closeNextAppointmentModal();
        //             // bổ sung thêm một cái là sau khi tạo lịch hẹn khám thành công thì gán bookId vào recordId ở cái bảng MedicalRecordBooking 
        //         } else {
        //             throw new Error('Booking creation failed');
        //         }
                
        //     } catch (error) {
        //         console.error('Error creating next appointment:', error);
        //         showNotification('❌ Lỗi khi tạo lịch hẹn: ' + error.message, 'error');
        //     }
        // };


    // Schedule next appointment
    window.scheduleNextAppointment = async function() {
        if (!currentNextAppPatient) {
            showNotification('Không tìm thấy thông tin bệnh nhân!', 'error');
            return;
        }

        const docId = localStorage.getItem('docId');
        const appointmentDate = document.getElementById('nextAppDate').value;
        const appointmentTime = document.getElementById('nextAppTime').value;
        const selectedServices = getSelectedServices(); // các subservice
        const note = document.getElementById('nextAppNote').value;
        
        // Validation
        if (!appointmentDate || !appointmentTime || selectedServices.length === 0) {
            showNotification('Vui lòng điền đầy đủ thông tin: ngày, giờ và ít nhất một dịch vụ!', 'error');
            return;
        }
        if (!docId) {
            showNotification('Không tìm thấy thông tin bác sĩ!', 'error');
            return;
        }

        function toTimeString(str) {
            // Nếu đã có giây thì return luôn
            if (str.match(/^\d{2}:\d{2}:\d{2}$/)) return str;
            // Nếu chỉ có giờ:phút
            if (str.match(/^\d{2}:\d{2}$/)) return str + ":00";
            return str; // fallback, giữ nguyên
        }  

        const [startTimeRaw, endTimeRaw] = appointmentTime.split('-').map(s => s.trim());
        const startTime = toTimeString(startTimeRaw);
        const endTime = toTimeString(endTimeRaw);


        try {
            console.log({
    docId,
    workDate: appointmentDate,
    startTime,
    endTime
});
            // 1. Lấy slotId theo ngày + startTime + endTime + docId
            const slotResponse = await fetch('/api/workslots/get-slot-id-by-date-time', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    docId: parseInt(docId), // nhớ lấy từ localStorage hoặc biến
                    workDate: appointmentDate,
                    startTime,
                    endTime,
                })
            });
            const slotText = await slotResponse.text();

            if (!slotResponse.ok) {
                // Tùy backend trả về lỗi như thế nào mà bắt
                showNotification(slotText || 'Không thể tìm khung giờ phù hợp!', 'error');
                return;
            }

            const slotData = JSON.parse(slotText);

            // Nếu không có slotId, báo lỗi luôn
            if (!slotData.slotId) {
                showNotification('Không tìm thấy khung giờ phù hợp! Vui lòng chọn lại.', 'error');
                return;
            }

            const slotId = slotData.slotId;

            // 2. Tạo Booking với serId như cũ
            const bookingData = {
                cusId: currentNextAppPatient.cusId,
                docId: parseInt(docId),
                slotId: slotId, 
                note: note || `Tái khám theo lịch hẹn`,
                bookType: 'follow-up',
                serId: currentNextAppPatient.serId // giữ nguyên
            };

            const bookingResponse = await fetch('/api/booking/create-initial-booking', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bookingData)
            });

            const bookingText = await bookingResponse.text();
            if (!bookingResponse.ok) throw new Error(bookingText || 'Không thể tạo lịch hẹn');

            const bookingResult = JSON.parse(bookingText);
            const bookId = bookingResult.bookId;

            // 3. Tạo n BookingStep cho từng subservice
            for (const service of selectedServices) {
                const stepResponse = await fetch('/api/booking-steps/create-step-for-initial-booking', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        bookId: bookId,
                        subId: service.subId,
                        stepStatus: 'inactive',
                    })
                });
                if (!stepResponse.ok) {
                    throw new Error('Tạo các bước dịch vụ không thành công!');
                }
            }

            // 4. Thông báo thành công, reset form
            const serviceNames = selectedServices.map(s => s.subName).join(', ');
            showNotification(`✅ Đã đặt lịch hẹn lại thành công cho ${selectedServices.length} dịch vụ: ${serviceNames}! Email xác nhận đã được gửi cho bệnh nhân.`, 'success');
            closeNextAppointmentModal();
            document.getElementById('nextAppDate').value = '';
            document.getElementById('nextAppTime').value = '';
            document.getElementById('nextAppNote').value = '';
            if (typeof resetServiceSelection === 'function') resetServiceSelection();

        } catch (error) {
            console.error('Error creating next appointment:', error);
            showNotification('❌ Lỗi khi tạo lịch hẹn: ' + error.message, 'error');
        }
    };

    
        // Get selected services
        function getSelectedServices() {
            const selectedServices = [];
            const checkboxes = document.querySelectorAll('#nextAppServiceList .service-checkbox:checked');
            
            checkboxes.forEach(checkbox => {
                selectedServices.push({
                    subId: parseInt(checkbox.value),
                    subName: checkbox.dataset.name,
                    subPrice: parseInt(checkbox.dataset.price)
                });
            });
            
            return selectedServices;
        }

        // Update selected services summary
        function updateSelectedServicesSummary() {
            const selectedServices = getSelectedServices();
            const summaryDiv = document.getElementById('selectedServicesSummary');
            const summaryText = document.getElementById('summaryText');
            
            if (selectedServices.length === 0) {
                summaryDiv.style.display = 'none';
            } else {
                const count = selectedServices.length;
                const totalPrice = selectedServices.reduce((total, service) => total + service.subPrice, 0);
                const serviceText = count === 1 ? 'dịch vụ' : 'dịch vụ';
                
                summaryText.textContent = `Đã chọn ${count} ${serviceText} - Tổng: ${totalPrice.toLocaleString()}đ`;
                summaryDiv.style.display = 'block';
            }
        }

        // Add event listener to service checkboxes
        function addServiceCheckboxListeners() {
            const checkboxes = document.querySelectorAll('#nextAppServiceList .service-checkbox');
            checkboxes.forEach(checkbox => {
                checkbox.addEventListener('change', updateSelectedServicesSummary);
            });
        }

        // Clear next appointment form
        window.clearNextAppointmentForm = function() {
            document.getElementById('nextAppDate').value = '';
            document.getElementById('nextAppTime').value = '';
            document.getElementById('nextAppNote').value = '';
            
            // Clear all checkboxes
            const checkboxes = document.querySelectorAll('#nextAppServiceList .service-checkbox');
            checkboxes.forEach(checkbox => {
                checkbox.checked = false;
            });
            
            // Update summary
            updateSelectedServicesSummary();
            
            showNotification('🗑️ Đã xóa form hẹn khám lại', 'info');
        };