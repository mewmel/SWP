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

}
