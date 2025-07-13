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
     * ✅ Lấy danh sách bệnh nhân có medical record của doctor cụ thể
     */
    public List<Map<String, Object>> getPatientsWithMedicalRecordsByDoctor(Integer docId) {
        List<Map<String, Object>> result = new ArrayList<>();
        
        try {
            // 1. Lấy tất cả booking của doctor này
            List<Booking> bookings = bookingRepository.findByDocIdOrderByCreatedAt(docId);
            
            // 2. Lọc các customer unique đã có medical record
            Map<Integer, Booking> uniqueCustomers = new HashMap<>();
            
            for (Booking booking : bookings) {
                Integer cusId = booking.getCusId();
                
                // Kiểm tra customer này đã có medical record chưa
                Optional<MedicalRecord> medicalRecordOpt = medicalRecordRepository.findTopByCusIdOrderByCreatedAtDesc(cusId);
                
                if (medicalRecordOpt.isPresent() && !uniqueCustomers.containsKey(cusId)) {
                    uniqueCustomers.put(cusId, booking);
                }
            }
            
            // 3. Tạo response data cho từng customer
            for (Map.Entry<Integer, Booking> entry : uniqueCustomers.entrySet()) {
                Integer cusId = entry.getKey();
                Booking booking = entry.getValue();
                
                // Lấy thông tin customer
                Optional<Customer> customerOpt = customerRepository.findById(cusId);
                if (customerOpt.isPresent()) {
                    Customer customer = customerOpt.get();
                    
                    // Tạo response object
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
                    
                    // Booking info
                    patientData.put("bookStatus", booking.getBookStatus());
                    patientData.put("lastVisit", booking.getCreatedAt());
                    patientData.put("bookId", booking.getBookId());
                    patientData.put("serId", booking.getSerId());
                    
                    // Service name
                    com.example.project.entity.Service service = serviceRepository.findById(booking.getSerId()).orElse(null);
                    patientData.put("serviceName", service != null ? service.getSerName() : "N/A");
                    
                    result.add(patientData);
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
