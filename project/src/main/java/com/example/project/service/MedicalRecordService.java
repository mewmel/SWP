package com.example.project.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.project.entity.Booking;
import com.example.project.entity.Customer;
import com.example.project.entity.MedicalRecord;
import com.example.project.repository.BookingRepository;
import com.example.project.repository.CustomerRepository;
import com.example.project.repository.MedicalRecordRepository;
import com.example.project.repository.ServiceRepository;
import com.example.project.repository.DoctorRepository;
import com.example.project.dto.CustomerMedicalRecordStatusDto;
import com.example.project.dto.CustomerBookingStatusDto;
import com.example.project.entity.Doctor;

@Service
public class MedicalRecordService {
    @Autowired
    private MedicalRecordRepository medicalRecordRepository;
    
    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private ServiceRepository serviceRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    /**
     * ✅ Lấy tất cả medical records của bệnh nhân mà bác sĩ phụ trách (kể cả closed)
     */
    public List<Map<String, Object>> getPatientsWithMedicalRecordsByDoctor(Integer docId) {
        List<Map<String, Object>> result = new ArrayList<>();
        
        try {
            // 1. Lấy tất cả MedicalRecord của bác sĩ này (kể cả closed)
            List<MedicalRecord> medicalRecords = medicalRecordRepository.findByDocIdOrderByCreatedAtDesc(docId);
            
            // 2. Tạo Map để nhóm medical records theo customer
            Map<Integer, List<MedicalRecord>> recordsByCustomer = new HashMap<>();
            
            for (MedicalRecord record : medicalRecords) {
                Integer cusId = record.getCusId();
                if (!recordsByCustomer.containsKey(cusId)) {
                    recordsByCustomer.put(cusId, new ArrayList<>());
                }
                recordsByCustomer.get(cusId).add(record);
            }
            
            // 3. Tạo response data cho từng customer với tất cả medical records
            for (Map.Entry<Integer, List<MedicalRecord>> entry : recordsByCustomer.entrySet()) {
                Integer cusId = entry.getKey();
                List<MedicalRecord> customerRecords = entry.getValue();
                
                // Lấy thông tin customer
                Optional<Customer> customerOpt = customerRepository.findById(cusId);
                if (customerOpt.isPresent()) {
                    Customer customer = customerOpt.get();
                    
                    // Tạo response object cho từng medical record
                    for (MedicalRecord record : customerRecords) {
                        Map<String, Object> patientData = new HashMap<>();
                        
                        // Customer info
                        patientData.put("cusId", customer.getCusId());
                        patientData.put("cusFullName", customer.getCusFullName());
                        patientData.put("cusGender", customer.getCusGender());
                        patientData.put("cusDate", customer.getCusDate());
                        patientData.put("cusEmail", customer.getCusEmail());
                        patientData.put("cusPhone", customer.getCusPhone());
                        patientData.put("cusAddress", customer.getCusAddress());
                        patientData.put("cusStatus", customer.getCusStatus());
                        patientData.put("cusOccupation", customer.getCusOccupation());
                        patientData.put("emergencyContact", customer.getEmergencyContact());
                        
                        // Medical Record info
                        patientData.put("recordId", record.getRecordId());
                        patientData.put("recordStatus", record.getRecordStatus()); // Bao gồm cả 'closed'
                        patientData.put("recordCreatedAt", record.getCreatedAt());
                        patientData.put("diagnosis", record.getDiagnosis());
                        patientData.put("treatmentPlan", record.getTreatmentPlan());
                        patientData.put("dischargeDate", record.getDischargeDate());
                        patientData.put("note", record.getNote());
                        
                        // Service info từ MedicalRecord
                        com.example.project.entity.Service service = serviceRepository.findById(record.getSerId()).orElse(null);
                        patientData.put("serId", record.getSerId());
                        patientData.put("serviceName", service != null ? service.getSerName() : "N/A");
                        
                        // Thông tin lần khám mới nhất từ booking thuộc recordId này
                        // Lấy booking có bookId lớn nhất thuộc record này thông qua MedicalRecordBooking
                        Optional<Booking> latestBookingOpt = bookingRepository.findLatestBookingByRecordId(record.getRecordId());
                        
                        if (latestBookingOpt.isPresent()) {
                            Booking latestBooking = latestBookingOpt.get();
                            patientData.put("bookId", latestBooking.getBookId());
                            patientData.put("bookStatus", latestBooking.getBookStatus());
                            patientData.put("lastVisit", latestBooking.getCreatedAt());
                        } else {
                            patientData.put("bookId", null);
                            patientData.put("bookStatus", "N/A");
                            patientData.put("lastVisit", record.getCreatedAt()); // Fallback to record date
                        }
                        
                        result.add(patientData);
                    }
                }
            }
            
        } catch (Exception e) {
            e.printStackTrace();
        }
        
        return result;
    }

    public boolean updateMedicalRecord(Integer recordId, MedicalRecord req) {
    MedicalRecord mr = medicalRecordRepository.findById(recordId).orElse(null);
    if (mr == null) return false;
    mr.setRecordStatus(req.getRecordStatus());
    mr.setCreatedAt(req.getCreatedAt());
    mr.setDiagnosis(req.getDiagnosis());
    mr.setTreatmentPlan(req.getTreatmentPlan());
    mr.setDischargeDate(req.getDischargeDate());
    mr.setNote(req.getNote());
    medicalRecordRepository.save(mr);
    return true;
}

    /**
     * ✅ Check trạng thái medical record của customer
     * Trả về thông tin chi tiết nếu có active medical record, ngược lại trả về trạng thái không có
     */
    public CustomerMedicalRecordStatusDto checkCustomerMedicalRecordStatus(Integer cusId) {
        try {
            // Tìm medical record active của customer
            Optional<MedicalRecord> activeRecordOpt = medicalRecordRepository.findActiveByCusId(cusId);
            
            if (activeRecordOpt.isEmpty()) {
                // Không có active medical record
                return new CustomerMedicalRecordStatusDto(false);
            }
            
            MedicalRecord activeRecord = activeRecordOpt.get();
            
            // Lấy thông tin doctor
            Doctor doctor = doctorRepository.findById(activeRecord.getDocId()).orElse(null);
            
            // Lấy thông tin service
            com.example.project.entity.Service service = serviceRepository.findById(activeRecord.getSerId()).orElse(null);
            
            // Tạo response với đầy đủ thông tin
            CustomerMedicalRecordStatusDto response = new CustomerMedicalRecordStatusDto();
            response.setHasActiveMedicalRecord(true);
            response.setRecordId(activeRecord.getRecordId());
            response.setCusId(activeRecord.getCusId());
            response.setDocId(activeRecord.getDocId());
            response.setDocFullName(doctor != null ? doctor.getDocFullName() : "N/A");
            response.setDocEmail(doctor != null ? doctor.getDocEmail() : "N/A");
            response.setDocPhone(doctor != null ? doctor.getDocPhone() : "N/A");
            response.setSerId(activeRecord.getSerId());
            response.setServiceName(service != null ? service.getSerName() : "N/A");
            response.setDiagnosis(activeRecord.getDiagnosis());
            response.setTreatmentPlan(activeRecord.getTreatmentPlan());
            response.setCreatedAt(activeRecord.getCreatedAt() != null ? activeRecord.getCreatedAt().toString() : null);
            response.setNote(activeRecord.getNote());
            
            return response;
            
        } catch (Exception e) {
            e.printStackTrace();
            // Trường hợp lỗi, trả về trạng thái không có
            return new CustomerMedicalRecordStatusDto(false);
        }
    }

    /**
     * ✅ Check trạng thái đặt lịch của customer (cả medical record và booking pending)
     */
    public CustomerBookingStatusDto checkCustomerBookingStatus(Integer cusId) {
        try {
            // 1. Kiểm tra xem customer có medical record nào không (bất kể status)
            List<MedicalRecord> allRecords = medicalRecordRepository.findAll()
                .stream()
                .filter(record -> record.getCusId().equals(cusId))
                .collect(java.util.stream.Collectors.toList());
            
            if (!allRecords.isEmpty()) {
                // Customer đã có medical record, check active
                Optional<MedicalRecord> activeRecordOpt = medicalRecordRepository.findActiveByCusId(cusId);
                
                if (activeRecordOpt.isPresent()) {
                    // Có active medical record
                    MedicalRecord activeRecord = activeRecordOpt.get();
                    Doctor doctor = doctorRepository.findById(activeRecord.getDocId()).orElse(null);
                    com.example.project.entity.Service service = serviceRepository.findById(activeRecord.getSerId()).orElse(null);
                    
                    CustomerBookingStatusDto response = new CustomerBookingStatusDto();
                    response.setStatus("has_active_medical_record");
                    response.setMessage("Customer đang có medical record active");
                    response.setRecordId(activeRecord.getRecordId());
                    response.setDocId(activeRecord.getDocId());
                    response.setDocFullName(doctor != null ? doctor.getDocFullName() : "N/A");
                    response.setDocEmail(doctor != null ? doctor.getDocEmail() : "N/A");
                    response.setDocPhone(doctor != null ? doctor.getDocPhone() : "N/A");
                    response.setSerId(activeRecord.getSerId());
                    response.setServiceName(service != null ? service.getSerName() : "N/A");
                    response.setDiagnosis(activeRecord.getDiagnosis());
                    response.setTreatmentPlan(activeRecord.getTreatmentPlan());
                    response.setCreatedAt(activeRecord.getCreatedAt() != null ? activeRecord.getCreatedAt().toString() : null);
                    response.setNote(activeRecord.getNote());
                    
                    return response;
                } else {
                    // Có medical record nhưng không active (có thể đã closed)
                    // Check booking pending trước khi cho phép đặt lịch mới
                    List<Booking> pendingBookings = bookingRepository.findByCusIdAndBookStatusOrderByCreatedAtDesc(cusId, "pending");
                    
                    if (!pendingBookings.isEmpty()) {
                        // Có booking pending
                        Booking latestPending = pendingBookings.get(0);
                        
                        CustomerBookingStatusDto response = new CustomerBookingStatusDto();
                        response.setStatus("has_pending_booking");
                        response.setMessage("Customer đang có booking pending chờ xác nhận");
                        response.setBookId(latestPending.getBookId());
                        response.setBookStatus(latestPending.getBookStatus());
                        response.setBookCreatedAt(latestPending.getCreatedAt() != null ? latestPending.getCreatedAt().toString() : null);
                        
                        return response;
                    } else {
                        // Medical record đã closed và không có booking pending
                        return new CustomerBookingStatusDto("can_book", "Customer có thể đặt lịch mới");
                    }
                }
            } else {
                // 2. Customer chưa có medical record nào, check booking pending
                List<Booking> pendingBookings = bookingRepository.findByCusIdAndBookStatusOrderByCreatedAtDesc(cusId, "pending");
                
                if (!pendingBookings.isEmpty()) {
                    // Có booking pending
                    Booking latestPending = pendingBookings.get(0);
                    
                    CustomerBookingStatusDto response = new CustomerBookingStatusDto();
                    response.setStatus("has_pending_booking");
                    response.setMessage("Customer đang có booking pending chờ xác nhận");
                    response.setBookId(latestPending.getBookId());
                    response.setBookStatus(latestPending.getBookStatus());
                    response.setBookCreatedAt(latestPending.getCreatedAt() != null ? latestPending.getCreatedAt().toString() : null);
                    // Note: appointmentDate không có trong entity Booking, có thể lấy từ WorkSlot nếu cần
                    
                    return response;
                } else {
                    // Không có medical record và không có booking pending
                    return new CustomerBookingStatusDto("can_book", "Customer có thể đặt lịch mới");
                }
            }
            
        } catch (Exception e) {
            e.printStackTrace();
            return new CustomerBookingStatusDto("can_book", "Có lỗi xảy ra, cho phép đặt lịch");
        }
    }

}
