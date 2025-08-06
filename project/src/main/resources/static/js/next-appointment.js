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

        // Load patient data from API - ✅ SỬ DỤNG API MỚI
        async function loadPatientDataFromAPI() {
            try {
                console.log('🔍 Loading patients with medical records for doctor:', currentDoctorId);
                
                // ✅ Gọi API mới - chỉ 1 lần call duy nhất!
                console.log('📡 DEBUG: Calling API:', `/api/medical-records/patients-by-doctor/${currentDoctorId}`);
                const response = await fetch(`/api/medical-records/patients-by-doctor/${currentDoctorId}`);
                console.log('📡 DEBUG: API Response status:', response.status);
                console.log('📡 DEBUG: API Response ok:', response.ok);
                
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('❌ DEBUG: API Error response:', errorText);
                    throw new Error('Failed to fetch patients with medical records: ' + response.status);
                }
                
                const patients = await response.json();
                console.log('📋 DEBUG: Raw API response:', patients);
                console.log('📋 DEBUG: Response type:', typeof patients);
                console.log('📋 DEBUG: Is array:', Array.isArray(patients));
                console.log('📋 DEBUG: Length:', patients?.length || 'N/A');
                
                // Gán trực tiếp vào variables
                allPatients = patients || [];
                filteredPatients = [...allPatients];
                
                console.log('✅ DEBUG: Final allPatients:', allPatients);
                console.log('📊 DEBUG: Total patients with medical records loaded:', allPatients.length);
                renderPatientList();
                
            } catch (error) {
                console.error('❌ Error loading patient data:', error);
                // // Fallback to sample data if API fails
                // loadSampleData();
            }
        }

        // Fallback sample data
        // function loadSampleData() {
        //     allPatients = [
        //         {
        //             cusId: 1,
        //             cusFullName: 'Trần Anh Thư',
        //             cusGender: 'F',
        //             cusDate: '2004-09-26',
        //             cusEmail: 'thutase180353@fpt.edu.vn',
        //             cusPhone: '0352020737',
        //             cusAddress: 'HCMC',
        //             cusStatus: 'active',
        //             cusOccupation: 'Con sen',
        //             emergencyContact: 'Mơ',
        //             lastVisit: '2024-06-25',
        //             bookStatus: 'completed',
        //             recordStatus: 'active', // Add recordStatus
        //             serviceName: 'Khám tiền đăng ký điều trị IVF-IUI', // Add serviceName
        //             serId: 1,
        //             bookId: 1,
        //             recordId: 1
        //         }
        //     ];
        //     filteredPatients = [...allPatients];
        //     renderPatientList();
        // }

        // Render patient list
        function renderPatientList() {
            console.log('🎨 DEBUG: renderPatientList() called');
            console.log('📋 DEBUG: filteredPatients.length:', filteredPatients.length);
            console.log('📋 DEBUG: filteredPatients data:', filteredPatients);
            
            const tableBody = document.getElementById('patientTableBody');
            console.log('🔍 DEBUG: tableBody element found:', !!tableBody);
            
            if (!tableBody) {
                console.error('❌ DEBUG: patientTableBody element not found!');
                return;
            }
            
            tableBody.innerHTML = '';

            if (filteredPatients.length === 0) {
                console.log('📋 DEBUG: No patients to display - showing empty message');
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="5" style="text-align: center; padding: 2rem; color: #64748b;">
                            <i class="fas fa-users" style="font-size: 2rem; margin-bottom: 0.5rem; display: block;"></i>
                            Không có bệnh nhân nào
                        </td>
                    </tr>
                `;
                return;
            }
            
            console.log('👥 DEBUG: Rendering', filteredPatients.length, 'patients');

            filteredPatients.forEach(patient => {
                const lastVisit = formatDate(patient.lastVisit);
                
                // Determine status based on recordStatus instead of bookStatus
                let statusText, statusClass;
                if (patient.recordStatus === 'active') {
                    statusText = 'Đang điều trị';
                    statusClass = 'pending';
                } else if (patient.recordStatus === 'closed') {
                    statusText = 'Đã đóng';
                    statusClass = 'completed';
                } else if (patient.recordStatus === 'pending') {
                    statusText = 'Chờ xử lý';
                    statusClass = 'pending';
                } else {
                    statusText = patient.recordStatus || 'Không xác định';
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
                    <td>${patient.serviceName || 'N/A'}</td>
                    <td>${lastVisit}</td>
                    <td>
                        <span class="status-badge ${statusClass}">${statusText}</span>
                    </td>
                    <td>
                        <div class="action-buttons">
                            ${patient.recordStatus === 'closed' 
                                ? `<button class="btn-action btn-view" onclick="viewPatientRecord(${patient.cusId}, ${patient.bookId}, ${patient.recordId})">
                                    <i class="fas fa-eye"></i> Xem hồ sơ
                                   </button>`
                                : `<button class="btn-action btn-view" onclick="viewPatientRecord(${patient.cusId}, ${patient.bookId}, ${patient.recordId})">
                                    <i class="fas fa-edit"></i> Sửa hồ sơ
                                   </button>`
                            }
                            <button class="btn-action btn-edit" onclick="openNextAppointmentModal(${patient.cusId}, '${patient.cusFullName}', 'Dịch vụ: ${patient.serviceName || 'N/A'}', ${patient.serId})">
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
            if (!dateString) {
                console.log('🔍 formatDateTimeForInput: empty dateString, returning empty string');
                return '';
            }
            
            try {
                const date = new Date(dateString);
                if (isNaN(date.getTime())) {
                    console.log('🔍 formatDateTimeForInput: invalid date, returning empty string');
                    return '';
                }
                
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                const hours = String(date.getHours()).padStart(2, '0');
                const minutes = String(date.getMinutes()).padStart(2, '0');
                const result = `${year}-${month}-${day}T${hours}:${minutes}`;
                console.log('🔍 formatDateTimeForInput:', dateString, '->', result);
                return result;
            } catch (error) {
                console.error('❌ formatDateTimeForInput error:', error);
                return '';
            }
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
            
            filteredPatients = allPatients.filter(patient => {
                const searchMatch = searchTerm === '' || 
                    patient.cusFullName.toLowerCase().includes(searchTerm) ||
                    (patient.serviceName && patient.serviceName.toLowerCase().includes(searchTerm));
                
                // Map status filter to recordStatus - chỉ còn 'active' và 'closed'
                let statusMatch = true;
                if (statusFilter === 'active') {
                    statusMatch = patient.recordStatus === 'active';
                } else if (statusFilter === 'closed') {
                    statusMatch = patient.recordStatus === 'closed';
                }
                // Xóa check cho 'pending' vì đã bỏ khỏi database schema
                
                return searchMatch && statusMatch;
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
            console.log('� === SWITCHING TAB ===');
            console.log('🔍 Tab name:', tabName);
            console.log('🔍 Current patient data:', currentPatientData);
            console.log('🔍 BookId:', currentPatientData?.bookId);
            console.log('🔍 RecordId:', currentPatientData?.recordId);
            
            // Remove active class from all tabs and tab contents
            document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

            // Add active class to clicked tab and corresponding content
            event.target.classList.add('active');
            const tabElement = document.getElementById(tabName + 'Tab');
            console.log('🔍 Tab element found:', !!tabElement);
            if (tabElement) {
                tabElement.classList.add('active');
            } else {
                console.error('❌ Tab element not found:', tabName + 'Tab');
                return;
            }

            // Load data for the selected tab if not already loaded
            if (currentPatientData && currentPatientData.recordId) {
                console.log('✅ Loading data for tab:', tabName, 'with recordId:', currentPatientData.recordId);
                switch(tabName) {
                    case 'current':
                        // Refresh current tab data  
                        console.log('📋 Loading current tab data...');
                        loadAndRenderTestResults(currentPatientData.recordId);
                        break;
                    case 'history':
                        console.log('📋 Loading history tab data...');
                        console.log('🔍 Loading history for recordId:', currentPatientData.recordId);
                        loadMedicalHistory(currentPatientData.recordId);
                        break;
                    case 'treatment':
                        console.log('📋 Loading treatment tab data...');
                        loadTreatmentPlan(currentPatientData);
                        break;
                    case 'prescription':
                        console.log('📋 Loading prescription tab data...');
                        console.log('🔍 Loading prescription data for recordId:', currentPatientData.recordId);
                        loadExistingPrescriptionData(currentPatientData.recordId);
                        // fillPrescriptionHeader() sẽ được gọi trong loadExistingPrescriptionData nếu cần
                        break;
                    case 'tests':
                        console.log('📋 Loading tests tab data...');
                        loadAndRenderTestResults(currentPatientData.recordId);
                        break;
                    default:
                        console.warn('⚠️ Unknown tab name:', tabName);
                }
            } else {
                console.log('❌ No current patient data or recordId available');
                console.log('- currentPatientData:', currentPatientData);
                console.log('- recordId:', currentPatientData?.recordId);
            }
            
            console.log('🔄 === TAB SWITCH COMPLETE ===');
        }

        // Enhanced patient record viewing - ✅ FIXED: Sử dụng dữ liệu đã load  
        async function viewPatientRecord(cusId, bookId, recordId) {
            if(recordId) {
            try {
                showLoading();
                
                console.log('🔍 Loading patient record for cusId:', cusId, 'bookId:', bookId, 'recordId:', recordId);
                
                // Show modal and ensure it's visible
                const modal = document.getElementById('patientModal');
                if (!modal) {
                    console.error('❌ Patient modal not found');
                    return;
                }
                modal.style.display = 'block';
                modal.classList.add('flex');
                console.log('✅ Modal displayed');
                
                // Wait a moment for modal to render
                await new Promise(resolve => setTimeout(resolve, 50));
                
                // Store for later use
                currentPatientData = { cusId, bookId, recordId };
                
                // ✅ FIX: Lấy patient data từ danh sách đã load thay vì gọi API
                console.log('🔍 DEBUG: Searching for patient in allPatients with cusId:', cusId);
                console.log('📋 DEBUG: allPatients array:', allPatients);
                console.log('📋 DEBUG: allPatients.length:', allPatients.length);
                
                let patientData = allPatients.find(p => p.cusId === cusId);
                console.log('🎯 DEBUG: Found patient data:', patientData);
                
                if (!patientData) {
                    console.error('❌ DEBUG: Patient not found in loaded list for cusId:', cusId);
                    throw new Error('Patient not found in loaded list');
                }
                
                patientData.bookId = bookId;
                patientData.recordId = recordId;
                currentPatientData = patientData;

                // Lưu thông tin cần thiết vào localStorage cho việc lưu đơn thuốc
                localStorage.setItem('currentBookId', bookId);
                localStorage.setItem('currentCusId', cusId);
                
                // Xóa drugId cũ để đảm bảo tạo đơn thuốc mới nếu cần
                localStorage.removeItem('drugId');
                
                // Reset prescription modification flag
                window.prescriptionModified = false;

                console.log('✅ Patient data from loaded list:', patientData);

                // Populate basic patient information
                populatePatientInfo(patientData);
                
                // Load medical record data FIRST
                if (bookId && recordId) {
                    console.log('Loading medical record data for recordId:', recordId);

                    const res = await fetch(`/api/medical-records/${recordId}`);
                    if (!res.ok) throw new Error('Không tìm thấy hồ sơ bệnh án');
                    const record = await res.json();
                    console.log('🎯 DEBUG: Loaded medical record:', record);

                    // Store the medical record data for later use
                    currentPatientData.currentMedicalRecord = record;

                    // Gán TRỰC TIẾP vào UI tab "Hồ sơ bệnh án" với error handling
                    console.log('🔍 Setting medical record fields:');
                    
                    const recordStatusEl = document.getElementById('recordStatus');
                    if (recordStatusEl) {
                        recordStatusEl.value = record.recordStatus || '';
                        console.log('✅ recordStatus set to:', recordStatusEl.value);
                    } else {
                        console.error('❌ Element recordStatus not found');
                    }
                    
                    const recordCreatedDateEl = document.getElementById('recordCreatedDate');
                    if (recordCreatedDateEl) {
                        recordCreatedDateEl.value = formatDateTimeForInput(record.createdAt);
                        console.log('✅ recordCreatedDate set to:', recordCreatedDateEl.value);
                    } else {
                        console.error('❌ Element recordCreatedDate not found');
                    }
                    
                    const diagnosisEl = document.getElementById('diagnosis');
                    if (diagnosisEl) {
                        diagnosisEl.value = record.diagnosis || '';
                        console.log('✅ diagnosis set to:', diagnosisEl.value);
                    } else {
                        console.error('❌ Element diagnosis not found');
                    }
                    
                    const treatmentPlanEl = document.getElementById('treatmentPlan');
                    if (treatmentPlanEl) {
                        treatmentPlanEl.value = record.treatmentPlan || '';
                        console.log('✅ treatmentPlan set to:', treatmentPlanEl.value);
                    } else {
                        console.error('❌ Element treatmentPlan not found');
                    }
                    
                    const dischargeDateEl = document.getElementById('dischargeDate');
                    if (dischargeDateEl) {
                        dischargeDateEl.value = formatDateTimeForInput(record.dischargeDate);
                        console.log('✅ dischargeDate set to:', dischargeDateEl.value);
                    } else {
                        console.error('❌ Element dischargeDate not found');
                    }
                    
                    const medicalNoteEl = document.getElementById('medicalNote');
                    if (medicalNoteEl) {
                        medicalNoteEl.value = record.note || '';  // FIX: Dùng record.note thay vì record.medicalNotes
                        console.log('✅ medicalNote set to:', medicalNoteEl.value);
                    } else {
                        console.error('❌ Element medicalNote not found');
                    }
                    
                    // Verify all fields are populated after a short delay
                    setTimeout(() => {
                        console.log('🔍 Verifying all medical record fields after 100ms:');
                        const verificationFields = ['recordStatus', 'recordCreatedDate', 'diagnosis', 'treatmentPlan', 'dischargeDate', 'medicalNote'];
                        verificationFields.forEach(fieldId => {
                            const element = document.getElementById(fieldId);
                            if (element) {
                                console.log(`✅ ${fieldId}: "${element.value}" (visible: ${element.offsetParent !== null})`);
                            } else {
                                console.error(`❌ ${fieldId}: Element not found`);
                            }
                        });
                    }, 100);
                        
                    // Load test results and prescription data
                    loadAndRenderTestResults(recordId);
                    await loadExistingPrescriptionData(recordId);
                }
                
                // Populate current examination tab AFTER loading medical record data
                populateCurrentExamination(patientData, []);
                
                hideLoading();
                
            } catch (error) {
                console.error('❌ Error loading patient record:', error);
                hideLoading();
                showErrorMessage('Không thể tải hồ sơ bệnh nhân. Vui lòng thử lại sau.');
            }
        }}

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

            // Current status based on recordStatus instead of bookStatus
            const statusElement = document.getElementById('currentStatus');
            if (patientData.recordStatus) {
                let statusText, statusClass;
                if (patientData.recordStatus === 'active') {
                    statusText = 'Đang điều trị';
                    statusClass = 'pending';
                } else if (patientData.recordStatus === 'closed') {
                    statusText = 'Đã đóng';
                    statusClass = 'completed';
                } else if (patientData.recordStatus === 'pending') {
                    statusText = 'Chờ xử lý';
                    statusClass = 'pending';
                } else {
                    statusText = patientData.recordStatus;
                    statusClass = 'pending';
                }
                statusElement.textContent = statusText;
                statusElement.className = `status-badge ${statusClass}`;
            } else {
                statusElement.textContent = 'Không có hồ sơ';
                statusElement.className = 'status-badge inactive';
            }
        }

        // Debug function to test medical record field population
        window.testMedicalRecordFields = function() {
            console.log('🧪 Testing medical record field population...');
            
            const testRecord = {
                recordStatus: 'active',
                createdAt: '2024-12-06T10:30:00',
                diagnosis: 'Test diagnosis content',
                treatmentPlan: 'Test treatment plan content',
                dischargeDate: '2024-12-20T15:00:00',
                note: 'Test medical note content'
            };
            
            console.log('🧪 Test record data:', testRecord);
            
            // Test setting each field
            const fields = [
                { id: 'recordStatus', value: testRecord.recordStatus },
                { id: 'recordCreatedDate', value: formatDateTimeForInput(testRecord.createdAt) },
                { id: 'diagnosis', value: testRecord.diagnosis },
                { id: 'treatmentPlan', value: testRecord.treatmentPlan },
                { id: 'dischargeDate', value: formatDateTimeForInput(testRecord.dischargeDate) },
                { id: 'medicalNote', value: testRecord.note }
            ];
            
            fields.forEach(field => {
                const element = document.getElementById(field.id);
                if (element) {
                    element.value = field.value;
                    console.log(`✅ ${field.id}: "${element.value}"`);
                } else {
                    console.error(`❌ ${field.id}: Element not found`);
                }
            });
            
            console.log('🧪 Test completed. Check the modal fields!');
        };

        function populateCurrentExamination(patientData, bookingSteps) {
            // Only populate service name - NOT medical record fields to avoid overwriting
            console.log('🔍 populateCurrentExamination called - only setting service name');
            
            // Service name
            document.getElementById('serviceName').textContent = patientData.serviceName || 'Chưa xác định';
            
            console.log('✅ populateCurrentExamination completed - medical record fields preserved');
        }

        async function loadMedicalHistory(recordId) {
            try {
                console.log('🔍 Loading medical history for recordId:', recordId);
                const res = await fetch(`/api/medical-records/customer/${recordId}/medical-history`);
                if (!res.ok) {
                    console.error('❌ API Error:', res.status, res.statusText);
                    throw new Error("Lỗi server: " + res.status);
                }
                const history = await res.json();
                console.log('✅ Lấy lịch sử khám thành công:', history);
                renderMedicalHistory(history);
            } catch (err) {
                console.error("❌ Error loading medical history:", err);
                showNotification("Không thể tải lịch sử khám: " + err.message, "error");
            }
        }


function renderMedicalHistory(historyData) {
    console.log('🎨 renderMedicalHistory called with data:', historyData);
    
    const historyContainer = document.getElementById('medical-history-content');
    if (!historyContainer) {
        console.error('❌ Không tìm thấy element #medical-history-content trong DOM');
        console.log('🔍 Available elements with "history" in id:', 
            Array.from(document.querySelectorAll('[id*="history"]')).map(el => el.id));
        
        // Try alternative container
        const historyTab = document.getElementById('historyTab');
        if (historyTab) {
            console.log('✅ Found historyTab, creating medical-history-content div');
            const newContainer = document.createElement('div');
            newContainer.id = 'medical-history-content';
            newContainer.style.padding = '1rem';
            historyTab.appendChild(newContainer);
            renderMedicalHistoryContent(newContainer, historyData);
        } else {
            console.error('❌ Neither #medical-history-content nor #historyTab found');
        }
        return;
    }

    renderMedicalHistoryContent(historyContainer, historyData);
}

function renderMedicalHistoryContent(container, historyData) {
    console.log('📋 Rendering history data:', historyData);
    
    if (!historyData || historyData.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: #64748b;">
                <i class="fas fa-history" style="font-size: 2rem; margin-bottom: 0.5rem; display: block;"></i>
                <p>Không có lịch sử khám.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div class="history-header">
            <h4><i class="fas fa-history"></i> Lịch sử khám bệnh</h4>
            <p>Tổng cộng: ${historyData.length} lần khám</p>
        </div>
        <div class="history-list">
            ${historyData.map((item, index) => `
                <div class="history-item" style="background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem; margin-bottom: 1rem;">
                    <div class="history-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                        <h6 style="margin: 0; color: #1e293b;">Lần khám #${index + 1}</h6>
                        <span style="background: #e0f2fe; color: #006064; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.8rem;">
                            ${item.bookStatus || 'N/A'}
                        </span>
                    </div>
                    <div class="history-details" style="color: #6b7280; font-size: 0.9rem;">
                        <p style="margin: 0.25rem 0;"><strong>Mã đặt:</strong> BK${String(item.bookId || '000').padStart(3, '0')}</p>
                        <p style="margin: 0.25rem 0;"><strong>Loại:</strong> ${item.bookType || 'N/A'}</p>
                        <p style="margin: 0.25rem 0;"><strong>Thời gian:</strong> ${item.date || 'N/A'} | ${item.time || 'N/A'}</p>
                        <p style="margin: 0.25rem 0;"><strong>Dịch vụ con:</strong> ${(item.subNames || []).join(', ') || 'Không có'}</p>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}



        async function loadTreatmentPlan(patientData) {
            const treatmentContent = document.getElementById('treatmentContent');
            
            try {
                treatmentContent.innerHTML = '<div style="text-align: center; padding: 2rem;"><i class="fas fa-spinner fa-spin"></i> Đang tải kế hoạch điều trị...</div>';
                
                // Fetch treatment progress using recordId or fallback to bookId
                let treatmentProgressData = null;
                if (patientData.recordId) {
                    console.log('🔍 Using recordId for treatment progress:', patientData.recordId);
                    const response = await fetch(`/api/booking-steps/treatment-progress-by-record/${patientData.recordId}`);
                    if (response.ok) {
                        treatmentProgressData = await response.json();
                    }
                } else if (patientData.bookId) {
                    console.log('🔍 Fallback to bookId for treatment progress:', patientData.bookId);
                    const response = await fetch(`/api/booking-steps/treatment-progress/${patientData.bookId}`);
                    if (response.ok) {
                        treatmentProgressData = await response.json();
                    }
                } else {
                    console.warn('⚠️ Neither recordId nor bookId available for treatment progress');
                }
                
                renderTreatmentPlan(treatmentProgressData, patientData);
            } catch (error) {
                console.error('Error loading treatment plan:', error);
                renderSampleTreatmentPlan();
            }
        }

        function renderTreatmentPlan(treatmentProgressData, patientData) {
            const treatmentContent = document.getElementById('treatmentContent');

            if (!treatmentProgressData || !treatmentProgressData.subServiceDetails) {
                renderSampleTreatmentPlan();
                return;
            }

            // Lấy dữ liệu từ API mới
            const {
                totalSubServices,
                completedSubServices,
                pendingSubServices,
                inactiveSubServices,
                progressPercentage,
                subServiceDetails
            } = treatmentProgressData;

            let treatmentHtml = `
                <!-- Treatment Header -->
                <div class="treatment-header">
                    <h3><i class="fas fa-stethoscope"></i> Kế hoạch điều trị</h3>
                    <p>${patientData?.serviceName || 'Dịch vụ điều trị'}</p>
                    </div>

                <!-- Stats Grid -->
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-number">${totalSubServices}</div>
                        <div class="stat-label">Tổng dịch vụ</div>
                </div>
                    <div class="stat-card">
                        <div class="stat-number">${completedSubServices}</div>
                        <div class="stat-label">Hoàn thành</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">${pendingSubServices}</div>
                        <div class="stat-label">Đang thực hiện</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">${inactiveSubServices}</div>
                        <div class="stat-label">Chờ thực hiện</div>
                    </div>
                </div>

                <!-- Progress Section -->
                <div class="progress-section">
                    <div class="progress-header">
                        <div class="progress-title">Tiến độ điều trị</div>
                        <div class="progress-percentage">${progressPercentage}%</div>
                                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progressPercentage}%"></div>
                                    </div>
                                </div>

                <!-- Steps Container -->
                <div class="steps-container">
                    <div class="steps-title">
                        <i class="fas fa-list-check"></i>
                        Các dịch vụ điều trị
                            </div>
                        `;

            let stepCounter = 1;
            subServiceDetails.forEach((subService, index) => {
                const statusClass = subService.stepStatus === 'completed' ? 'completed'
                    : subService.stepStatus === 'pending' ? 'current'
                        : 'pending';
                
                const statusText = subService.stepStatus === 'completed' ? 'Hoàn thành'
                    : subService.stepStatus === 'pending' ? 'Đang thực hiện'
                        : 'Chờ thực hiện';

            treatmentHtml += `
                    <div class="step-item ${statusClass}">
                        <div class="step-number ${statusClass}">${stepCounter}</div>
                        <div class="step-content">
                            <div class="step-name">${subService.subName || `Dịch vụ ${stepCounter}`}</div>
                            <div class="step-description">${subService.subDescription || 'Đang thực hiện theo kế hoạch'}</div>
                            <div class="step-date">${formatDate(subService.performedAt) || 'Dự kiến thực hiện'}</div>
                            ${subService.result ? `<div class="step-result">${formatStepResult(subService.result)}</div>` : ''}
                            ${subService.note ? `<div class="step-note">Ghi chú: ${subService.note}</div>` : ''}
                        </div>
                        <div class="step-status ${statusClass}">${statusText}</div>
                </div>
            `;
                stepCounter++;
            });

            treatmentHtml += `</div>`;

            treatmentContent.innerHTML = treatmentHtml;
        }

        function renderSampleTreatmentPlan() {
            document.getElementById('treatmentContent').innerHTML = `
                <div class="treatment-empty">
                    <i class="fas fa-clipboard-list"></i>
                    <h3>Chưa có kế hoạch điều trị</h3>
                    <p>Bệnh nhân chưa có kế hoạch điều trị nào được thiết lập.</p>
                </div>
            `;
        }

        async function loadPrescriptionData(patientData) {
            const prescriptionContent = document.getElementById('prescriptionTab');
            
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
            const prescriptionContent = document.getElementById('prescriptionTab');
            
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
                                        <h6 style="margin: 0; color: #1e293b; font-weight: 600;">${item.drugName || 'Tên thuốc'}</h6>
                                        <span style="background: #f0fdf4; color: #166534; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.8rem; font-weight: 500;">
                                            ${item.dosage || 'Liều dùng'}
                                        </span>
                                    </div>
                                    <div class="drug-details" style="color: #6b7280; font-size: 0.9rem;">
                                        <p style="margin: 0.25rem 0;"><strong>Liều dùng:</strong> ${item.dosage || 'Theo chỉ định bác sĩ'}</p>
                                        <p style="margin: 0.25rem 0;"><strong>Tần suất:</strong> ${item.frequency || 'Theo chỉ định'}</p>
                                        <p style="margin: 0.25rem 0;"><strong>Thời gian:</strong> ${item.duration || 'Theo chỉ định'}</p>
                                        <p style="margin: 0.25rem 0;"><strong>Ghi chú:</strong> ${item.drugItemNote || 'Không có ghi chú đặc biệt'}</p>
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
            document.getElementById('prescriptionTab').innerHTML = `
                <div style="text-align: center; padding: 2rem; color: #64748b;">
                    <i class="fas fa-pills" style="font-size: 2rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                    <p>Chưa có đơn thuốc</p>
                </div>
            `;
        }

        async function loadTestResults(patientData) {
            const testResultsContent = document.getElementById('testsTab');
            
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
            console.log('🔍 renderTestResults called with data:', testData);
            
            // Tìm element chứa test results trong tab "Xét nghiệm"
            const testResultsContent = document.querySelector('#testsTab .booking-steps-results');
            
            if (!testResultsContent) {
                console.error('❌ Không tìm thấy element chứa test results');
                return;
            }
            
            console.log('✅ Found test results container:', testResultsContent);
            
            if (testData && testData.length > 0) {
                let testHtml = `
                    <!-- Test Results Header -->
                    <div class="test-results-header">
                        <h3><i class="fas fa-flask"></i> Kết quả xét nghiệm</h3>
                        <p>Xem chi tiết các kết quả xét nghiệm đã thực hiện</p>
                    </div>

                    <!-- Test Results Container -->
                    <div class="test-results-container">
                        <div class="test-results-title">
                            <i class="fas fa-vial"></i>
                            Danh sách xét nghiệm
                        </div>
                `;
                
                testData.forEach(test => {
                    const statusClass = test.stepStatus === 'completed' ? 'completed' : 'pending';
                    const statusText = test.stepStatus === 'completed' ? 'Hoàn thành' : 'Đang thực hiện';
                    
                    testHtml += `
                        <div class="test-result-item ${statusClass}">
                            <div class="test-result-header">
                                <div>
                                    <div class="test-result-name">${test.subServiceName}</div>
                                    <div class="test-result-date">${formatDateTime(test.performedAt)}</div>
                                </div>
                                <div class="test-result-status ${statusClass}">${statusText}</div>
                            </div>
                            <div class="test-result-content">
                                ${formatTestResult(test.stepResult)}
                                ${test.stepNote ? `<div class="test-result-note"><strong>Ghi chú:</strong> ${test.stepNote}</div>` : ''}
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

        // Helper function to format test result JSON
        function formatTestResult(resultString) {
            console.log('🔍 formatTestResult called with:', resultString);
            
            if (!resultString) {
                console.log('❌ No result string provided');
                return '<div class="raw-result">Chưa có kết quả</div>';
            }

            try {
                // Try to parse as JSON
                const results = JSON.parse(resultString);
                console.log('✅ Parsed JSON successfully:', results);
                
                if (Array.isArray(results) && results.length > 0) {
                    // Check if it's the expected format with indexName, unit, status, value
                    if (results[0].indexName && results[0].unit && results[0].status && results[0].value) {
                        console.log('✅ Expected format detected, formatting results...');
                        let formattedHtml = '<div class="formatted-results">';
                        
                        results.forEach((item, index) => {
                            const statusClass = getStatusClass(item.status);
                            console.log(`📊 Formatting item ${index}:`, item, 'status class:', statusClass);
                            formattedHtml += `
                                <div class="result-item">
                                    <div class="result-label">${item.indexName}</div>
                                    <div class="result-value">${item.value}</div>
                                    <div class="result-unit">${item.unit}</div>
                                    <div class="result-status ${statusClass}">${item.status}</div>
                                </div>
                            `;
                        });
                        
                        formattedHtml += '</div>';
                        console.log('✅ Formatted HTML generated');
                        return formattedHtml;
                    } else {
                        console.log('❌ Unexpected format, showing as formatted JSON');
                    }
                }
                
                // If not the expected format, show as formatted JSON
                return `<div class="raw-result">${JSON.stringify(results, null, 2)}</div>`;
                
            } catch (error) {
                console.error('❌ Error parsing JSON:', error);
                // If not valid JSON, show as plain text
                return `<div class="raw-result">${resultString}</div>`;
            }
        }

        // Helper function to get status class
        function getStatusClass(status) {
            if (!status) return 'normal';
            
            const statusLower = status.toLowerCase();
            if (statusLower.includes('bình thường') || statusLower.includes('normal')) return 'normal';
            if (statusLower.includes('cao') || statusLower.includes('high')) return 'high';
            if (statusLower.includes('thấp') || statusLower.includes('low')) return 'low';
            if (statusLower.includes('bất thường') || statusLower.includes('abnormal')) return 'abnormal';
            
            return 'normal';
        }

        // Helper function to format step result JSON for treatment tab
        function formatStepResult(resultString) {
            if (!resultString) {
                return 'Đang thực hiện theo kế hoạch';
            }

            try {
                // Try to parse as JSON
                const results = JSON.parse(resultString);
                
                if (Array.isArray(results) && results.length > 0) {
                    // Check if it's the expected format with indexName, unit, status, value
                    if (results[0].indexName && results[0].unit && results[0].status && results[0].value) {
                        let formattedText = '';
                        
                        results.forEach((item, index) => {
                            if (index > 0) formattedText += ', ';
                            formattedText += `${item.indexName}: ${item.value} ${item.unit} (${item.status})`;
                        });
                        
                        return formattedText;
                    }
                }
                
                // If not the expected format, return as is
                return resultString;
                
            } catch (error) {
                // If not valid JSON, return as plain text
                return resultString;
            }
        }

        // Test function to verify formatting works
        function testFormatTestResult() {
            const testJson = '[{"indexName":"uihui","unit":"mg/ml","status":"Bình thường","value":"1.2"},{"indexName":"1323","unit":"mg/ml","status":"Bình thường","value":"33"}]';
            console.log('🧪 Testing formatTestResult with:', testJson);
            const result = formatTestResult(testJson);
            console.log('🧪 Test result:', result);
            
            // Hiển thị kết quả test trong tab "Xét nghiệm"
            const testResultsContent = document.querySelector('#testsTab .booking-steps-results');
            if (testResultsContent) {
                testResultsContent.innerHTML = `
                    <div class="test-results-header">
                        <h3><i class="fas fa-flask"></i> Test Format Results</h3>
                        <p>Kết quả test format JSON</p>
                    </div>
                    <div class="test-results-container">
                        <div class="test-results-title">
                            <i class="fas fa-vial"></i>
                            Test Data
                        </div>
                        <div class="test-result-item completed">
                            <div class="test-result-header">
                                <div>
                                    <div class="test-result-name">Test Xét nghiệm</div>
                                    <div class="test-result-date">${new Date().toLocaleString()}</div>
                                </div>
                                <div class="test-result-status completed">Test</div>
                            </div>
                            <div class="test-result-content">
                                ${result}
                            </div>
                        </div>
                    </div>
                `;
            }
            
            return result;
        }

        // Test function for treatment tab formatting
        function testTreatmentFormat() {
            const testJson = '[{"indexName":"uihui","unit":"mg/ml","status":"Bình thường","value":"1.2"},{"indexName":"1323","unit":"mg/ml","status":"Bình thường","value":"33"}]';
            console.log('🧪 Testing formatStepResult with:', testJson);
            const result = formatStepResult(testJson);
            console.log('🧪 Treatment format result:', result);
            alert('Treatment format result: ' + result);
            return result;
        }

        function renderSampleTestResults() {
            const testResultsContent = document.querySelector('#testsTab .booking-steps-results');
            
            if (!testResultsContent) {
                console.error('Không tìm thấy element chứa test results');
                return;
            }
            
            testResultsContent.innerHTML = `
                <div class="test-results-empty">
                    <i class="fas fa-flask"></i>
                    <h3>Chưa có kết quả xét nghiệm</h3>
                    <p>Bệnh nhân chưa có kết quả xét nghiệm nào được thực hiện.</p>
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
            const searchInput = document.getElementById('searchInput');
            const statusFilter = document.getElementById('statusFilter');
            const genderFilter = document.getElementById('genderFilter');
            
            if (searchInput) searchInput.value = '';
            if (statusFilter) statusFilter.value = 'all';
            if (genderFilter) genderFilter.value = 'all';
            
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

        // Save patient record - Comprehensive save function
        async function savePatientRecord() {
            if (!currentPatientData) {
                showErrorMessage('Không có dữ liệu bệnh nhân để lưu');
                return;
            }

            // Kiểm tra xem có đang trong quá trình lưu không
            if (window.isSavingPatientRecord) {
                console.log('⚠️ DEBUG: Already saving patient record, skipping...');
                return;
            }
            
            window.isSavingPatientRecord = true;

            try {
                showLoading();

                // 1. Collect medical record form data
                const recordData = {
                    recordStatus: document.getElementById('recordStatus').value,
                    recordCreatedDate: document.getElementById('recordCreatedDate').value,
                    diagnosis: document.getElementById('diagnosis').value,
                    treatmentPlan: document.getElementById('treatmentPlan').value,
                    dischargeDate: document.getElementById('dischargeDate').value,
                    medicalNote: document.getElementById('medicalNote').value
                };

                console.log('Saving patient record:', recordData);

                let saveResults = {
                    medicalRecord: false,
                    prescription: false,
                    testResults: false
                };

                let hasChanges = false;

                // 2. Update medical record if exists and has changes
                console.log('🔍 DEBUG: currentPatientData:', currentPatientData);
                console.log('🔍 DEBUG: currentMedicalRecord:', currentPatientData.currentMedicalRecord);
                
                if (currentPatientData.currentMedicalRecord && currentPatientData.currentMedicalRecord.recordId) {
                    try {
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

                        if (recordUpdateResponse.ok) {
                            const responseData = await recordUpdateResponse.json();
                            console.log('Medical record updated successfully:', responseData);
                            saveResults.medicalRecord = true;
                            hasChanges = true;
                        } else {
                            const errorData = await recordUpdateResponse.json();
                            console.error('Failed to update medical record:', errorData);
                            showErrorMessage('Lỗi khi cập nhật hồ sơ: ' + (errorData.message || 'Không xác định'));
                        }
                    } catch (error) {
                        console.error('Error updating medical record:', error);
                    }
                } else if (currentPatientData.serId) {
                    // Create new medical record if it doesn't exist
                    try {
                        const recordCreateResponse = await fetch(`/api/medical-records/create/${currentPatientData.serId}`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                cusId: currentPatientData.cusId,
                                serId: currentPatientData.serId,
                                recordStatus: recordData.recordStatus,
                                diagnosis: recordData.diagnosis,
                                treatmentPlan: recordData.treatmentPlan,
                                dischargeDate: recordData.dischargeDate,
                                note: recordData.medicalNote
                            })
                        });

                        if (recordCreateResponse.ok) {
                            const responseData = await recordCreateResponse.json();
                            console.log('Medical record created successfully:', responseData);
                            saveResults.medicalRecord = true;
                            hasChanges = true;
                            
                            // Update currentPatientData with the new record
                            if (responseData.recordId) {
                                currentPatientData.currentMedicalRecord = { recordId: responseData.recordId };
                            }
                        } else {
                            const errorData = await recordCreateResponse.json();
                            console.error('Failed to create medical record:', errorData);
                            showErrorMessage('Lỗi khi tạo hồ sơ: ' + (errorData.message || 'Không xác định'));
                        }
                    } catch (error) {
                        console.error('Error creating medical record:', error);
                    }
                }

                // 3. Save prescription if exists and has changes
                // LƯU Ý: Đơn thuốc sẽ được lưu riêng bằng button "Lưu đơn thuốc"
                // Không lưu đơn thuốc ở đây để tránh duplicate
                console.log('🔍 DEBUG: Skipping prescription save in savePatientRecord - use dedicated savePrescription button');

                // 4. Save test results if exists and has changes
                const testResultsContainer = document.querySelector('.booking-steps-results');
                console.log('🔍 DEBUG: Test results container found:', !!testResultsContainer);
                
                if (testResultsContainer) {
                    try {
                        const testResults = collectTestResultsData();
                        console.log('🔍 DEBUG: Collected test results:', testResults);
                        
                        if (testResults && testResults.length > 0) {
                            const testResultsResponse = await fetch('/api/booking-steps/save-test-results', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(testResults)
                            });

                            if (testResultsResponse.ok) {
                                console.log('Test results saved successfully');
                                saveResults.testResults = true;
                                hasChanges = true;
                            }
                        }
                    } catch (error) {
                        console.error('Error saving test results:', error);
                    }
                }

                hideLoading();

                // 5. Show success message based on what was saved
                console.log('🔍 DEBUG: Final save results:', { hasChanges, saveResults });
                
                if (hasChanges) {
                    let message = 'Đã lưu thành công: ';
                    const items = [];
                    if (saveResults.medicalRecord) items.push('hồ sơ bệnh án');
                    if (saveResults.testResults) items.push('kết quả xét nghiệm');
                    
                    message += items.join(', ');
                    showNotification(message, 'success');
                
                // Refresh patient list
                refreshPatientList();
                    
                    // Reload modal data to show the updated information
                    if (currentPatientData && currentPatientData.cusId && currentPatientData.bookId) {
                        setTimeout(async () => {
                            try {
                                // Reload the medical record data
                                if (currentPatientData.currentMedicalRecord && currentPatientData.currentMedicalRecord.recordId) {
                                    const res = await fetch(`/api/medical-records/${currentPatientData.currentMedicalRecord.recordId}`);
                                    if (res.ok) {
                                        const record = await res.json();
                                        currentPatientData.currentMedicalRecord = record;
                                        
                                        // Update UI with fresh data
                                        document.getElementById('recordStatus').value = record.recordStatus || '';
                                        document.getElementById('recordCreatedDate').value = formatDateTimeForInput(record.createdAt);
                                        document.getElementById('diagnosis').value = record.diagnosis || '';
                                        document.getElementById('treatmentPlan').value = record.treatmentPlan || '';
                                        document.getElementById('dischargeDate').value = formatDateTimeForInput(record.dischargeDate);
                                        document.getElementById('medicalNote').value = record.note || '';
                                    }
                                }
                                
                                // Reload test results only (prescription is managed separately)
                                loadAndRenderTestResults(currentPatientData.bookId);
                                
                            } catch (error) {
                                console.error('Error reloading modal data:', error);
                            }
                        }, 500);
                    }
                    
                    // Close modal after successful save
                    setTimeout(() => {
                        closeModal();
                    }, 3000);
                } else {
                    showNotification('Không có thay đổi nào để lưu', 'info');
                }

            } catch (error) {
                console.error('Error saving patient record:', error);
                hideLoading();
                showErrorMessage('Có lỗi xảy ra khi lưu thông tin. Vui lòng thử lại.');
            } finally {
                window.isSavingPatientRecord = false;
            }
        }

        // Helper function to collect test results data
        function collectTestResultsData() {
            const testResults = [];
            const testResultItems = document.querySelectorAll('.test-result-item');
            
            console.log('🔍 DEBUG: Found test result items:', testResultItems.length);
            
            testResultItems.forEach((item, index) => {
                const bookingStepId = item.getAttribute('data-booking-step-id');
                const subId = item.getAttribute('data-sub-id');
                const performedAt = item.querySelector('.editable-date')?.value;
                const stepStatus = item.querySelector('.step-status-select')?.value;
                const note = item.querySelector('.editable-note')?.value;
                
                console.log(`🔍 DEBUG: Item ${index}:`, { bookingStepId, subId, performedAt, stepStatus, note });
                
                const results = [];
                const resultItems = item.querySelectorAll('.result-item');
                console.log(`🔍 DEBUG: Item ${index} has ${resultItems.length} result items`);
                
                resultItems.forEach((resultItem, resultIndex) => {
                    const label = resultItem.querySelector('.editable-label')?.value;
                    const value = resultItem.querySelector('.editable-result')?.value;
                    const unit = resultItem.querySelector('.unit-select')?.value;
                    const status = resultItem.querySelector('.status-select')?.value;
                    
                    console.log(`🔍 DEBUG: Result ${resultIndex}:`, { label, value, unit, status });
                    
                    if (label && value) {
                        results.push({
                            indexName: label,
                            value: value,
                            unit: unit || '',
                            status: status || 'Bình thường'
                        });
                    }
                });
                
                if (bookingStepId && subId) {
                    testResults.push({
                        bookingStepId: parseInt(bookingStepId),
                        subId: parseInt(subId),
                        bookId: currentPatientData.bookId, // Add bookId for new steps
                        performedAt: performedAt,
                        stepStatus: stepStatus || 'completed',
                        note: note || '',
                        results: results
                    });
                }
            });
            
            console.log('🔍 DEBUG: Final test results to save:', testResults);
            return testResults;
        }

        // Save all test results function (for the "Lưu tất cả" button)
        window.saveAllTestResults = async function() {
            try {
                showLoading();
                
                const testResults = collectTestResultsData();
                if (testResults && testResults.length > 0) {
                    const testResultsResponse = await fetch('/api/booking-steps/save-test-results', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(testResults)
                    });

                    if (testResultsResponse.ok) {
                        console.log('All test results saved successfully');
                        showNotification('Đã lưu tất cả kết quả xét nghiệm thành công!', 'success');
                    } else {
                        const errorData = await testResultsResponse.json();
                        console.error('Failed to save test results:', errorData);
                        showErrorMessage('Lỗi khi lưu kết quả xét nghiệm: ' + (errorData.message || 'Không xác định'));
                    }
                } else {
                    showNotification('Không có kết quả xét nghiệm nào để lưu', 'info');
                }
                
                hideLoading();
            } catch (error) {
                console.error('Error saving all test results:', error);
                hideLoading();
                showErrorMessage('Có lỗi xảy ra khi lưu kết quả xét nghiệm. Vui lòng thử lại.');
            }
        };

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
                        <h3>HỒ SƠ BỆNH ÁN</h3>
                        <table>
                            <tr><td class="label">Trạng thái hồ sơ:</td><td>${document.getElementById('recordStatus').options[document.getElementById('recordStatus').selectedIndex].text}</td></tr>
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
            
            // Đánh dấu rằng có thay đổi trong UI
            window.prescriptionModified = true;
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
                    console.log('💊 DEBUG: Drug item removed from UI only - will be saved when clicking "Lưu đơn thuốc"');
                    console.log('💊 DEBUG: Current drugId in localStorage:', localStorage.getItem('drugId'));
                    
                    // Đánh dấu rằng có thay đổi trong UI
                    window.prescriptionModified = true;
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

        function fillPrescriptionHeader() {
            const nameInput = document.getElementById('prescribingDoctorName');
            const dateInput = document.getElementById('prescriptionDate');
            const numberInput = document.getElementById('prescriptionNumber');

            const fullName = localStorage.getItem('docFullName');
            const drugId = localStorage.getItem('drugId') || '';

            if (nameInput) nameInput.value = fullName || '';
            if (dateInput) dateInput.value = getLocalDateTimeValue();
            if (numberInput) numberInput.value = drugId;
            
            // Thêm event listeners để track thay đổi
            addPrescriptionChangeListeners();
        }
        
        function addPrescriptionChangeListeners() {
            // Track thay đổi trong prescription header
            const prescriptionInputs = [
                'prescriptionDate',
                'prescriptionDiagnosis',
                'generalNotes'
            ];
            
            prescriptionInputs.forEach(inputId => {
                const input = document.getElementById(inputId);
                if (input) {
                    input.addEventListener('input', () => {
                        window.prescriptionModified = true;
                        console.log('💊 DEBUG: Prescription header modified');
                    });
                }
            });
            
            // Track thay đổi trong drug items
            const drugInputs = document.querySelectorAll('#drugsList input, #drugsList textarea');
            drugInputs.forEach(input => {
                input.addEventListener('input', () => {
                    window.prescriptionModified = true;
                    console.log('💊 DEBUG: Drug item modified');
                });
            });
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
            console.log('💊 DEBUG: savePrescription() called');
            
            // Kiểm tra xem có đang trong quá trình lưu không
            if (window.isSavingPrescription) {
                console.log('⚠️ DEBUG: Already saving prescription, skipping...');
                return;
            }
            
            window.isSavingPrescription = true;
            
            const data = collectPrescriptionData();
            const drugId = localStorage.getItem('drugId') || '';
            const bookId = localStorage.getItem('currentBookId') || '';
            const docId = localStorage.getItem('docId') || '';
            const cusId = localStorage.getItem('currentCusId') || '';
            
            // Kiểm tra xem có thay đổi thực sự không (chỉ áp dụng cho update, không áp dụng cho create mới)
            if (!window.prescriptionModified && drugId && data.drugs.length === 0) {
                console.log('💊 DEBUG: No changes detected and no drugs, skipping save');
                showNotification('ℹ️ Không có thay đổi nào để lưu', 'info');
                return;
            }
            
            console.log('💊 DEBUG: Collected data:', data);
            console.log('💊 DEBUG: drugId from localStorage:', drugId);
            console.log('💊 DEBUG: bookId from localStorage:', bookId);
            console.log('💊 DEBUG: docId from localStorage:', docId);
            console.log('💊 DEBUG: cusId from localStorage:', cusId);

            // Không cần kiểm tra prescriptionNumber vì nó sẽ được tạo tự động
            // khi tạo đơn thuốc mới hoặc đã có sẵn khi cập nhật đơn thuốc cũ

            if (!bookId || !docId || !cusId) {
                showNotification('❌ Thiếu thông tin booking, doctor hoặc customer. Vui lòng kiểm tra lại.', 'error');
                return;
            }

            try {
                let currentDrugId = drugId;
                console.log('💊 DEBUG: Starting savePrescription with drugId:', drugId);
                console.log('💊 DEBUG: Starting savePrescription with currentDrugId:', currentDrugId);

                // Nếu không có drugId, tạo đơn thuốc mới
                if (!drugId) {
                    console.log('🆕 DEBUG: Creating new prescription for bookId:', bookId);
                    
                    const createDrugRes = await fetch(`/api/drugs/create/${bookId}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            docId: parseInt(docId),
                            cusId: parseInt(cusId),
                            bookId: parseInt(bookId),
                            drugNote: data.diagnosis || '',
                            createdAt: data.prescriptionDate ? new Date(data.prescriptionDate).toISOString() : new Date().toISOString()
                        })
                    });

                    if (!createDrugRes.ok) {
                        const errorText = await createDrugRes.text();
                        throw new Error('Không thể tạo đơn thuốc mới: ' + errorText);
                    }

                    currentDrugId = await createDrugRes.text();
                    console.log('✅ DEBUG: Created new drug with ID:', currentDrugId);
                    
                    // Lưu drugId mới vào localStorage
                    localStorage.setItem('drugId', currentDrugId);
                    
                    // Cập nhật prescriptionNumber trong form
                    const prescriptionNumberInput = document.getElementById('prescriptionNumber');
                    if (prescriptionNumberInput) {
                        prescriptionNumberInput.value = currentDrugId;
                        console.log('✅ DEBUG: Updated prescriptionNumber in form:', currentDrugId);
                    }
                } else {
                    console.log('🔄 DEBUG: Updating existing prescription with drugId:', drugId);
                    
                    // Kiểm tra xem drug có tồn tại không trước khi update
                    const checkDrugRes = await fetch(`/api/drugs/by-booking/${bookId}`);
                    if (checkDrugRes.ok) {
                        const existingDrugs = await checkDrugRes.json();
                        if (existingDrugs.length > 0 && existingDrugs[0].drugId == drugId) {
                            console.log('✅ DEBUG: Drug exists, proceeding with update');
                        } else {
                            console.log('⚠️ DEBUG: Drug not found, will create new one');
                            // Nếu drug không tồn tại, xóa drugId khỏi localStorage và tạo mới
                            localStorage.removeItem('drugId');
                            currentDrugId = null;
                            
                            // Tạo đơn thuốc mới
                            const createDrugRes = await fetch(`/api/drugs/create/${bookId}`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    docId: parseInt(docId),
                                    cusId: parseInt(cusId),
                                    bookId: parseInt(bookId),
                                    drugNote: data.diagnosis || '',
                                    createdAt: data.prescriptionDate ? new Date(data.prescriptionDate).toISOString() : new Date().toISOString()
                                })
                            });

                            if (!createDrugRes.ok) {
                                const errorText = await createDrugRes.text();
                                throw new Error('Không thể tạo đơn thuốc mới: ' + errorText);
                            }

                            currentDrugId = await createDrugRes.text();
                            console.log('✅ DEBUG: Created new drug with ID:', currentDrugId);
                            
                            // Lưu drugId mới vào localStorage
                            localStorage.setItem('drugId', currentDrugId);
                            
                            // Cập nhật prescriptionNumber trong form
                            const prescriptionNumberInput = document.getElementById('prescriptionNumber');
                            if (prescriptionNumberInput) {
                                prescriptionNumberInput.value = currentDrugId;
                                console.log('✅ DEBUG: Updated prescriptionNumber in form:', currentDrugId);
                            }
                        }
                    }
                    
                    // Cập nhật đơn thuốc hiện có
                    const updateDrugRes = await fetch(`/api/drugs/update/${currentDrugId || drugId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                            createdAt: data.prescriptionDate ? new Date(data.prescriptionDate).toISOString().replace('.000Z', '') : new Date().toISOString().replace('.000Z', ''),
                        note: data.diagnosis || ''
                    })
                });

                    if (!updateDrugRes.ok) {
                        const errorText = await updateDrugRes.text();
                        throw new Error('Không thể cập nhật đơn thuốc: ' + errorText);
                    }
                }

                // Xóa drug items cũ trước khi tạo mới (nếu có)
                if (currentDrugId) {
                    console.log('🗑️ DEBUG: Deleting old drug items for drugId:', currentDrugId);
                    const deleteOldItemsRes = await fetch(`/api/drug-items/delete-by-drug/${currentDrugId}`, {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' }
                    });
                    
                    if (!deleteOldItemsRes.ok) {
                        console.log('⚠️ DEBUG: Could not delete old drug items, but continuing...');
                    } else {
                        console.log('✅ DEBUG: Old drug items deleted successfully');
                    }
                }

                // Tạo mới các bản ghi DrugItem
                const drugItemsPayload = data.drugs.map(item => ({
                    drugName: item.drugName,
                    dosage: item.dosage,
                    frequency: item.frequency,
                    duration: item.duration,
                    drugItemNote: item.drugItemNote
                }));

                console.log('💊 DEBUG: Creating drug items for drugId:', currentDrugId);
                console.log('💊 DEBUG: Drug items payload:', drugItemsPayload);

                const drugItemRes = await fetch(`/api/drug-items/create/${currentDrugId}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(drugItemsPayload)
                });

                if (!drugItemRes.ok) {
                    const errorText = await drugItemRes.text();
                    throw new Error('Không thể lưu thuốc con: ' + errorText);
                }

                showNotification('💊 Đã lưu đơn thuốc thành công!', 'success');
                
                // Reset flag sau khi save thành công
                window.prescriptionModified = false;
                console.log('💊 DEBUG: Prescription saved successfully, reset modification flag');
            } catch (err) {
                console.error('❌ DEBUG: Error saving prescription:', err);
                showNotification('❌ Có lỗi khi lưu đơn thuốc: ' + err.message, 'error');
            } finally {
                window.isSavingPrescription = false;
            }
        };

        // Thêm chức năng xóa đơn thuốc
        window.deletePrescription = async function () {
            // Kiểm tra xem có đang trong quá trình xóa không
            if (window.isDeletingPrescription) {
                console.log('⚠️ DEBUG: Already deleting prescription, skipping...');
                return;
            }
            
            window.isDeletingPrescription = true;
            
            const drugId = localStorage.getItem('drugId');
            
            if (!drugId) {
                showNotification('❌ Không tìm thấy đơn thuốc để xóa', 'error');
                window.isDeletingPrescription = false;
                return;
            }

            // Hiển thị hộp thoại xác nhận
            const confirmed = confirm('⚠️ Bạn có chắc chắn muốn xóa đơn thuốc này không?\n\nHành động này không thể hoàn tác!');
            
            if (!confirmed) {
                return;
            }

            try {
                console.log('🗑️ DEBUG: Deleting prescription with drugId:', drugId);
                
                const response = await fetch(`/api/drugs/${drugId}`, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' }
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Lỗi xóa đơn thuốc: ${errorText}`);
                }

                const result = await response.text();
                console.log('✅ DEBUG: Delete prescription response:', result);

                // Xóa drugId khỏi localStorage
                localStorage.removeItem('drugId');
                
                // Xóa tất cả drug items khỏi UI
                const drugsList = document.getElementById('drugsList');
                if (drugsList) {
                    drugsList.innerHTML = '';
                    drugCounter = 0;
                }

                // Reset các trường header
                const prescriptionNumber = document.getElementById('prescriptionNumber');
                const prescriptionDate = document.getElementById('prescriptionDate');
                const prescriptionDiagnosis = document.getElementById('prescriptionDiagnosis');
                const generalNotes = document.getElementById('generalNotes');

                if (prescriptionNumber) prescriptionNumber.value = '';
                if (prescriptionDate) prescriptionDate.value = '';
                if (prescriptionDiagnosis) prescriptionDiagnosis.value = '';
                if (generalNotes) generalNotes.value = '';

                // Cập nhật summary
                updatePrescriptionSummary();

                showNotification('🗑️ Đã xóa đơn thuốc thành công!', 'success');
                
            } catch (error) {
                console.error('❌ DEBUG: Error deleting prescription:', error);
                showNotification(`❌ Lỗi xóa đơn thuốc: ${error.message}`, 'error');
            } finally {
                window.isDeletingPrescription = false;
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

        async function loadAndRenderTestResults(recordId) {
            console.log('🔍 loadAndRenderTestResults called with recordId:', recordId);
            try {
                // Sử dụng recordId thay vì bookId cho API endpoint
                const res = await fetch(`/api/booking-steps/test-results-by-record/${recordId}`);
                console.log('📡 API response status:', res.status);
                if (!res.ok) {
                    console.warn('⚠️ No test results API for recordId, fallback to empty data');
                    renderTestResults([]);
                    return;
                }
                const data = await res.json();
                console.log('📊 Test Results API data:', data);
                renderTestResults(data);
            } catch (e) {
                console.error('❌ Error loading test results:', e);
                renderTestResults([]);
            }
        }

        // Load existing prescription data
        async function loadExistingPrescriptionData(recordId) {
            // Reset prescription modification flag
            window.prescriptionModified = false;
            
            if (!recordId) {
                console.log('❌ No recordId provided for loading prescription data');
                // Gọi fillPrescriptionHeader để điền thông tin cơ bản cho đơn thuốc mới
                fillPrescriptionHeader();
                return;
            }

            try {
                console.log('🔍 Loading prescription data for recordId:', recordId);
                
                // First, get the bookId from recordId using MedicalRecordBooking
                const bookIdResponse = await fetch(`/api/medical-record-booking/by-record/${recordId}`);
                if (!bookIdResponse.ok) {
                    console.log('❌ Failed to get bookId from recordId:', bookIdResponse.status);
                    fillPrescriptionHeader();
                    return;
                }
                
                const bookIds = await bookIdResponse.json();
                if (!bookIds || bookIds.length === 0) {
                    console.log('❌ No bookIds found for recordId:', recordId);
                    fillPrescriptionHeader();
                    return;
                }
                
                // Use the first (or latest) bookId
                const bookId = bookIds[0];
                console.log('✅ Found bookId:', bookId, 'for recordId:', recordId);
                
                // Store bookId in localStorage for later use
                localStorage.setItem('currentBookId', bookId);
                
                // Also store cusId if available from currentPatientData
                if (currentPatientData && currentPatientData.cusId) {
                    localStorage.setItem('currentCusId', currentPatientData.cusId);
                }
                
                // Also store docId if available from localStorage
                const docId = localStorage.getItem('docId');
                if (docId) {
                    localStorage.setItem('docId', docId);
                }
                
                // Now get drugs using the correct API endpoint
                const response = await fetch(`/api/drugs/by-booking/${bookId}`);
                
                if (!response.ok) {
                    if (response.status === 404) {
                        console.log('❌ No prescription data found for this booking (404)');
                        // Gọi fillPrescriptionHeader để điền thông tin cơ bản cho đơn thuốc mới
                        fillPrescriptionHeader();
                        return;
                    } else {
                        console.log('❌ Failed to load prescription data, response not ok:', response.status);
                        return;
                    }
                }

                const drugData = await response.json();
                console.log('✅ Loaded prescription data:', drugData);

                if (drugData && drugData.length > 0 && drugData[0]) {
                    console.log('✅ Found prescription data, processing...');
                    
                    // Populate prescription header
                    const prescriptionNumber = document.getElementById('prescriptionNumber');
                    const prescriptionDate = document.getElementById('prescriptionDate');
                    const prescriptionDiagnosis = document.getElementById('prescriptionDiagnosis');
                    const generalNotes = document.getElementById('generalNotes');

                    console.log('🔍 Checking prescription header elements:');
                    console.log('- prescriptionNumber:', prescriptionNumber);
                    console.log('- prescriptionDate:', prescriptionDate);
                    console.log('- prescriptionDiagnosis:', prescriptionDiagnosis);
                    console.log('- generalNotes:', generalNotes);

                    if (drugData[0].drugId && prescriptionNumber) {
                        prescriptionNumber.value = drugData[0].drugId;
                        localStorage.setItem('drugId', drugData[0].drugId);
                        console.log('✅ Set prescription number:', drugData[0].drugId);
                    } else {
                        console.log('❌ No drugId found in drugData[0] or prescriptionNumber element not found');
                        // Gọi fillPrescriptionHeader để điền thông tin cơ bản cho đơn thuốc mới
                        fillPrescriptionHeader();
                    }

                    if (drugData[0].createdAt && prescriptionDate) {
                        prescriptionDate.value = formatDateTimeForInput(drugData[0].createdAt);
                        console.log('✅ Set prescription date:', drugData[0].createdAt);
                    }

                    if (drugData[0].drugNote && prescriptionDiagnosis) {
                        prescriptionDiagnosis.value = drugData[0].drugNote;
                        console.log('✅ Set prescription diagnosis:', drugData[0].drugNote);
                    }

                    // Load drug items
                    const drugsList = document.getElementById('drugsList');
                    console.log('🔍 drugsList element:', drugsList);
                    
                    if (!drugsList) {
                        console.log('❌ drugsList element not found');
                        return;
                    }
                    
                    if (drugData[0].drugItems) {
                        console.log('✅ Loading drug items:', drugData[0].drugItems);
                        console.log('✅ Number of drug items:', drugData[0].drugItems.length);
                        drugsList.innerHTML = ''; // Clear existing
                        drugCounter = 0; // Reset drug counter

                        drugData[0].drugItems.forEach((item, index) => {
                            console.log(`✅ Adding drug item ${index + 1}:`, item);
                            addExistingDrugItem(item);
                        });

                        updatePrescriptionSummary();
                        console.log('✅ Finished loading prescription data');
                        console.log('✅ Final drugsList innerHTML length:', drugsList.innerHTML.length);
                        
                        // Add event listeners for prescription changes
                        addPrescriptionChangeListeners();
                    } else {
                        console.log('❌ No drug items found');
                        console.log('- drugItems exists:', !!(drugData[0] && drugData[0].drugItems));
                        if (drugData[0]) {
                            console.log('- drugData[0].drugItems:', drugData[0].drugItems);
                        }
                        // Reset drug counter and clear list
                        drugCounter = 0;
                        drugsList.innerHTML = '';
                        
                        // Reset prescription modification flag
                        window.prescriptionModified = false;
                        
                        // Update prescription summary
                        updatePrescriptionSummary();
                        
                        // Gọi fillPrescriptionHeader để điền thông tin cơ bản cho đơn thuốc mới
                        fillPrescriptionHeader();
                        
                        // Add event listeners for prescription changes
                        addPrescriptionChangeListeners();
                    }
                } else {
                    console.log('❌ No prescription data found for this booking');
                    // Reset drug counter and clear list
                    drugCounter = 0;
                    const drugsList = document.getElementById('drugsList');
                    if (drugsList) {
                        drugsList.innerHTML = '';
                    }
                    
                    // Reset prescription modification flag
                    window.prescriptionModified = false;
                    
                    // Update prescription summary
                    updatePrescriptionSummary();
                    
                    // Gọi fillPrescriptionHeader để điền thông tin cơ bản cho đơn thuốc mới
                    fillPrescriptionHeader();
                    
                    // Add event listeners for prescription changes
                    addPrescriptionChangeListeners();
                }

            } catch (error) {
                console.error('Error loading prescription data:', error);
                // Reset drug counter and clear list
                drugCounter = 0;
                const drugsList = document.getElementById('drugsList');
                if (drugsList) {
                    drugsList.innerHTML = '';
                }
                
                // Reset prescription modification flag
                window.prescriptionModified = false;
                
                // Update prescription summary
                updatePrescriptionSummary();
                
                // Gọi fillPrescriptionHeader để điền thông tin cơ bản cho đơn thuốc mới
                fillPrescriptionHeader();
                
                // Add event listeners for prescription changes
                addPrescriptionChangeListeners();
            }
        }

        // Add existing drug item from API data
        function addExistingDrugItem(drugItem) {
            console.log('🔍 Adding existing drug item:', drugItem);
            drugCounter++;
            const drugsList = document.getElementById('drugsList');
            if (!drugsList) {
                console.log('❌ drugsList element not found');
                return;
            }

            const itemId = `drugItem${drugCounter}`;
            console.log('✅ Creating drug item with ID:', itemId);

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
                            <input type="text" value="${drugItem.drugName || ''}" id="drugName-${itemId}" class="form-control">
                        </div>
                        <div class="record-section">
                            <label><i class="fas fa-weight"></i> Hàm lượng:</label>
                            <input type="text" value="${drugItem.dosage || ''}" id="dosage-${itemId}" class="form-control">
                        </div>
                    </div>
                    <div class="record-grid">
                        <div class="record-section">
                            <label><i class="fas fa-clock"></i> Tần suất sử dụng:</label>
                            <input type="text" value="${drugItem.frequency || ''}" id="frequency-${itemId}" class="form-control">
                        </div>
                        <div class="record-section">
                            <label><i class="fas fa-calendar-days"></i> Thời gian dùng:</label>
                            <input type="text" value="${drugItem.duration || '30 ngày'}" id="duration-${itemId}" class="form-control">
                        </div>
                    </div>
                    <div class="record-section">
                        <label><i class="fas fa-comment-medical"></i> Hướng dẫn sử dụng & Lưu ý:</label>
                        <textarea rows="2" id="drugItemNote-${itemId}" class="form-control">${drugItem.drugItemNote || ''}</textarea>
                    </div>
                </div>
            `;

            console.log('✅ Created drug item HTML:', newDrugItem.outerHTML);
            drugsList.appendChild(newDrugItem);
            console.log('✅ Added drug item to drugsList. Total children:', drugsList.children.length);
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

    // Schedule next appointment
    function toTimeString(str) {
    if (/^\d{2}:\d{2}:\d{2}$/.test(str)) return str;       // HH:mm:ss
    if (/^\d{2}:\d{2}$/.test(str)) return str + ":00";     // HH:mm
    return str; // fallback
}

window.scheduleNextAppointment = async function() {
    if (!currentNextAppPatient) {
        showNotification('Không tìm thấy thông tin bệnh nhân!', 'error');
        return;
    }

    const docId = localStorage.getItem('docId');
    const appointmentDate = document.getElementById('nextAppDate').value;
    const appointmentTime = document.getElementById('nextAppTime').value;
    const selectedServices = getSelectedServices();
    const note = document.getElementById('nextAppNote').value;

    if (!appointmentDate || !appointmentTime || selectedServices.length === 0) {
        showNotification('Vui lòng điền đầy đủ thông tin: ngày, giờ và ít nhất một dịch vụ!', 'error');
        return;
    }
    if (!docId) {
        showNotification('Không tìm thấy thông tin bác sĩ!', 'error');
        return;
    }

    showFollowUpLoadingOverlay();

    const [startTimeRaw, endTimeRaw] = appointmentTime.split('-').map(s => s.trim());
    const startTime = toTimeString(startTimeRaw);
    const endTime = toTimeString(endTimeRaw);

    console
.log('Scheduling next appointment with data:', {
        docId,
        appointmentDate,
        startTime,
        endTime,
        selectedServices,
        note
    });

    try {
        // 1. Lấy slotId
        const slotResponse = await fetch('/api/workslots/get-slot-id-by-date-time', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                docId: parseInt(docId),
                workDate: appointmentDate,
                startTime,
                endTime
            })
        });

        const slotData = await slotResponse.json().catch(() => null);

        if (!slotResponse.ok || !slotData || !slotData.slotId) {
            const msg = slotData?.error || 'Không tìm thấy khung giờ phù hợp!';
            showFollowUpBookingError(msg + '<br>Vui lòng chọn thời gian khác hoặc liên hệ hỗ trợ.');
            return;
        }

        const slotId = slotData.slotId;

        // 2. Tạo booking
        const bookingData = {
            cusId: currentNextAppPatient.cusId,
            docId: parseInt(docId),
            slotId,
            note: note || 'Tái khám theo lịch hẹn',
            bookType: 'follow-up',
            serId: currentNextAppPatient.serId,
            workDate: appointmentDate,
            startTime,
            endTime
        };

        const bookingResponse = await fetch('/api/booking/create-follow-up-booking', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bookingData)
        });

        const bookingResult = await bookingResponse.json().catch(() => null);
        if (!bookingResponse.ok || !bookingResult?.bookId) {
            throw new Error(bookingResult?.error || 'Không thể tạo lịch hẹn');
        }

        const followBookId = bookingResult.bookId;

        // 3. Liên kết MedicalRecord
        const patientObj = allPatients.find(p => p.cusId === currentNextAppPatient.cusId);
        const recordId = patientObj?.recordId;

        if (!recordId) {
            showFollowUpBookingError('Không tìm thấy ID hồ sơ bệnh án!<br>Vui lòng thử lại.');
            return;
        }

        const medicalRecordResponse = await fetch(`/api/medical-record-booking/create/${recordId},${followBookId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ recordId, recobookId: followBookId })
        });

        if (!medicalRecordResponse.ok) {
            console.error('Error linking MedicalRecordBooking:', await medicalRecordResponse.text());
            showFollowUpBookingError('❌ Không thể liên kết lịch hẹn với hồ sơ bệnh án. Vui lòng thử lại sau.');
            return;
        }

        // 4. Tạo bookingStep cho subServices
        for (const service of selectedServices) {
            const stepResponse = await fetch('/api/booking-steps/create-step-for-initial-booking', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    bookId: followBookId,
                    subId: service.subId,
                    stepStatus: 'inactive'
                })
            });
            if (!stepResponse.ok) throw new Error('Tạo các bước dịch vụ không thành công!');
        }

        // 5. Thành công
        const serviceNames = selectedServices.map(s => s.subName).join(', ');
        showFollowUpBookingSuccess(serviceNames, selectedServices.length);

        setTimeout(() => {
            closeNextAppointmentModal();
            document.getElementById('nextAppDate').value = '';
            document.getElementById('nextAppTime').value = '';
            document.getElementById('nextAppNote').value = '';
        }, 100);

    } catch (error) {
        console.error('Error creating next appointment:', error);
        showFollowUpBookingError('❌ Lỗi khi tạo lịch hẹn: ' + error.message + '<br>Vui lòng kiểm tra lại thông tin và thử lại.');
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
        };

        // ========== Follow-up Booking Loading Functions ===========
        window.showFollowUpLoadingOverlay = function() {
            const overlay = document.getElementById('followUpLoadingOverlay');
            const loadingContent = overlay.querySelector('.booking-loading-content');
            const successContent = overlay.querySelector('.booking-success-content');
            const errorContent = overlay.querySelector('.booking-error-content');

            // Reset states
            loadingContent.style.display = 'block';
            successContent.style.display = 'none';
            errorContent.style.display = 'none';

            // Show overlay
            overlay.classList.add('show');

                         // Simulate progress steps for follow-up booking
             window.simulateFollowUpProgressSteps();
                 }

                  window.simulateFollowUpProgressSteps = function() {
             const steps = document.querySelectorAll('#followUpLoadingOverlay .progress-step');
             steps.forEach(step => {
                 step.classList.remove('active', 'completed');
             });

             // Step 1: Creating booking
             steps[0].classList.add('active');
             setTimeout(() => {
                 steps[0].classList.remove('active');
                 steps[0].classList.add('completed');
                 steps[1].classList.add('active');
             }, 1000);

             // Step 2: Creating booking steps
             setTimeout(() => {
                 steps[1].classList.remove('active');
                 steps[1].classList.add('completed');
                 steps[2].classList.add('active');
             }, 2000);

             // Step 3: Sending notification (completed in success/error functions)
         }

                  window.showFollowUpBookingSuccess = function(serviceNames, serviceCount) {
             const overlay = document.getElementById('followUpLoadingOverlay');
             const loadingContent = overlay.querySelector('.booking-loading-content');
             const successContent = overlay.querySelector('.booking-success-content');
             const steps = document.querySelectorAll('#followUpLoadingOverlay .progress-step');

             // Complete final step (now step 3)
             steps[2].classList.remove('active');
             steps[2].classList.add('completed');

            setTimeout(() => {
                loadingContent.style.display = 'none';
                successContent.style.display = 'block';
                
                // Update success message with service details
                const successMessage = successContent.querySelector('.success-message');
                successMessage.innerHTML = `
                    Lịch tái khám đã được tạo cho <strong>${serviceCount} dịch vụ: ${serviceNames}</strong>.<br>
                    Thông báo đã được gửi đến bệnh nhân qua email.
                `;
            }, 1000);
                 }

         window.showFollowUpBookingError = function(errorMessage) {
            const overlay = document.getElementById('followUpLoadingOverlay');
            const loadingContent = overlay.querySelector('.booking-loading-content');
            const errorContent = overlay.querySelector('.booking-error-content');
            const errorMessageElement = errorContent.querySelector('#errorMessageText');

            loadingContent.style.display = 'none';
            errorContent.style.display = 'block';
            
            // Update error message
            errorMessageElement.innerHTML = errorMessage || 'Có lỗi xảy ra trong quá trình đặt lịch tái khám.<br>Vui lòng thử lại sau.';
                 }

         window.closeFollowUpLoadingOverlay = function() {
            const overlay = document.getElementById('followUpLoadingOverlay');
            overlay.classList.remove('show');
            
            // Reset overlay state for next use
            setTimeout(() => {
                const loadingContent = overlay.querySelector('.booking-loading-content');
                const successContent = overlay.querySelector('.booking-success-content');
                const errorContent = overlay.querySelector('.booking-error-content');
                const steps = document.querySelectorAll('#followUpLoadingOverlay .progress-step');
                
                loadingContent.style.display = 'block';
                successContent.style.display = 'none';
                errorContent.style.display = 'none';
                
                steps.forEach(step => {
                    step.classList.remove('active', 'completed');
                });
            }, 300);
        }

        // Expose functions to global scope for use in bac-si-dashboard.html
        window.loadTreatmentPlan = loadTreatmentPlan;
        
        // ========== MEDICAL HISTORY TEST FUNCTIONS ==========
        
        // Test function for medical history
        window.testLoadMedicalHistory = async function(recordId) {
            console.log('🧪 Testing loadMedicalHistory with recordId:', recordId);
            
            if (!recordId && currentPatientData) {
                recordId = currentPatientData.recordId;
                console.log('🔍 Using recordId from currentPatientData:', recordId);
            }
            
            if (!recordId) {
                console.error('❌ No recordId provided');
                alert('No recordId provided for testing');
                return;
            }
            
            try {
                await loadMedicalHistory(recordId);
                console.log('✅ Test completed successfully');
                alert('Medical history test completed - check console for details');
            } catch (error) {
                console.error('❌ Test failed:', error);
                alert('Medical history test failed: ' + error.message);
            }
        };
        
        // Helper function to debug medical history element
        window.debugMedicalHistoryElement = function() {
            console.log('🔍 === DEBUGGING MEDICAL HISTORY ELEMENTS ===');
            
            const historyContainer = document.getElementById('medical-history-content');
            console.log('📋 #medical-history-content element:', historyContainer);
            
            const historyTab = document.getElementById('historyTab');
            console.log('📋 #historyTab element:', historyTab);
            
            const allHistoryElements = Array.from(document.querySelectorAll('[id*="history"]'));
            console.log('📋 All elements with "history" in id:', allHistoryElements.map(el => ({ id: el.id, tag: el.tagName })));
            
            if (historyTab) {
                console.log('📋 historyTab innerHTML preview:', historyTab.innerHTML.substring(0, 200) + '...');
            }
            
            console.log('🔍 === DEBUG COMPLETE ===');
        };