package com.example.project.controller;

import java.util.Arrays;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.project.dto.CusFullRecord;
import com.example.project.entity.Booking;
import com.example.project.entity.Customer;
import com.example.project.entity.MedicalRecord;
import com.example.project.entity.Service;
import com.example.project.repository.BookingRepository;
import com.example.project.repository.CustomerRepository;
import com.example.project.repository.MedicalRecordRepository;
import com.example.project.repository.ServiceRepository;
    
@RestController
@RequestMapping("/api/customer")
@CrossOrigin // Cho phép truy cập từ front-end
public class CustomerController {
    private static final Logger log = LoggerFactory.getLogger(CustomerController.class);

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private MedicalRecordRepository medicalRecordRepository;
    

    @Autowired
    private ServiceRepository serviceRepository;

    // API lấy thông tin theo email (bổ sung)
    @GetMapping("/{email}")
    public Customer getCustomerByEmail(@PathVariable String email) {
        return customerRepository.findByCusEmail(email).orElse(null);
    }

    // API lấy thông tin theo ID để update
@PutMapping("/{id}")
public ResponseEntity<Customer> updateCustomer(@PathVariable Integer id, @RequestBody Customer updatedData) {
    Optional<Customer> optional = customerRepository.findById(id);
    if (!optional.isPresent()) {
        return ResponseEntity.notFound().build();
    }

    Customer customer = optional.get();

    customer.setCusFullName(updatedData.getCusFullName());
    customer.setCusGender(updatedData.getCusGender());
    customer.setCusDate(updatedData.getCusDate());  
    customer.setCusPhone(updatedData.getCusPhone());
    customer.setCusAddress(updatedData.getCusAddress());        
    customer.setCusOccupation(updatedData.getCusOccupation());
    customer.setEmergencyContact(updatedData.getEmergencyContact());


    Customer saved = customerRepository.save(customer);
    return ResponseEntity.ok(saved);
}


    @GetMapping("/full-record/{cusId}")
public ResponseEntity<CusFullRecord> getFullRecord(@PathVariable Integer cusId) {
    try {
    // 1. Tìm customer
    Optional<Customer> optional = customerRepository.findById(cusId);
    if (!optional.isPresent()) {
        return ResponseEntity.notFound().build();
    }
    Customer customer = optional.get();

    // 2. Lấy booking hiện tại (ví dụ lấy booking có status = 'confirmed' hoặc 'ongoing', mới nhất)//sửa lại thành ongoing
    Booking booking = bookingRepository
        .findLatestBooking(
            cusId, Arrays.asList("confirmed")
        )
        .orElse(null);

    // 3. Lấy hồ sơ bệnh án mới nhất
    MedicalRecord medicalRecord = medicalRecordRepository
        .findTopByCusIdOrderByCreatedAtDesc(cusId)
        .orElse(null);

    // 4. Map sang DTO
    CusFullRecord dto = new CusFullRecord();
    dto.setCusId(customer.getCusId());
    dto.setCusFullName(customer.getCusFullName());
    dto.setCusGender(customer.getCusGender());

    // Xử lý LocalDate sang String (yyyy-MM-dd)
    dto.setCusDate(customer.getCusDate() == null ? null : customer.getCusDate().toString());
    dto.setCusEmail(customer.getCusEmail());
    dto.setCusPhone(customer.getCusPhone());
    dto.setCusAddress(customer.getCusAddress());
    dto.setCusOccupation(customer.getCusOccupation());
    dto.setEmergencyContact(customer.getEmergencyContact());
    dto.setCusStatus(customer.getCusStatus());

    // MedicalRecord
    if (medicalRecord != null) {
        CusFullRecord.CurrentMedicalRecord medicalRecordDTO = new CusFullRecord.CurrentMedicalRecord();
        medicalRecordDTO.setRecordId(medicalRecord.getRecordId());
        medicalRecordDTO.setDiagnosis(medicalRecord.getDiagnosis());
        medicalRecordDTO.setTreatmentPlan(medicalRecord.getTreatmentPlan());
        medicalRecordDTO.setMedicalNotes(medicalRecord.getNote());
        medicalRecordDTO.setRecordStatus(medicalRecord.getRecordStatus());
        // Xử lý LocalDate -> String nếu dischargeDate là LocalDate
        if (medicalRecord.getDischargeDate() != null) {
            medicalRecordDTO.setDischargeDate(medicalRecord.getDischargeDate());
        }
        dto.setCurrentMedicalRecord(medicalRecordDTO);
    }

    // Booking
    if (booking != null) {
        CusFullRecord.CurrentBooking bookingDTO = new CusFullRecord.CurrentBooking();
        bookingDTO.setBookId(booking.getBookId());
        bookingDTO.setBookType(booking.getBookType());
        bookingDTO.setBookStatus(booking.getBookStatus());
        bookingDTO.setNote(booking.getNote());
         // Lấy tên dịch vụ
    Service service = null;
    if (booking.getSerId() != null) {
        service = serviceRepository.findById(booking.getSerId()).orElse(null);
    }
    bookingDTO.setSerName(service != null ? service.getSerName() : null);
        dto.setCurrentBooking(bookingDTO);
    }

    return ResponseEntity.ok(dto);

} catch (Exception ex) {
      log.error("Lỗi khi lấy full-record cho cusId={}", cusId, ex);
      return ResponseEntity.status(500).build();
    }

}

@PutMapping("/update-full-record/{cusId}")
public ResponseEntity<?> updateFullRecord(@PathVariable Integer cusId, @RequestBody CusFullRecord updateDto) {
    try {
        // 1. Update Booking (nếu có truyền currentBooking)
        if (updateDto.getCurrentBooking() != null) {
            CusFullRecord.CurrentBooking b = updateDto.getCurrentBooking();
            if (b.getBookId() > 0) {
                Optional<Booking> bookingOpt = bookingRepository.findById(b.getBookId());
                if (bookingOpt.isPresent()) {
                    Booking booking = bookingOpt.get();
                    booking.setBookType(b.getBookType());
                    booking.setBookStatus(b.getBookStatus());
                    booking.setNote(b.getNote());
                    // Nếu muốn cho sửa dịch vụ thì thêm setSerId() ở đây (cần truyền serId lên DTO)
                    bookingRepository.save(booking);
                }
            }
        }

        // 2. Update MedicalRecord (nếu có truyền currentMedicalRecord)
        if (updateDto.getCurrentMedicalRecord() != null) {
            CusFullRecord.CurrentMedicalRecord mr = updateDto.getCurrentMedicalRecord();
            if (mr.getRecordId() > 0) {
                Optional<MedicalRecord> mrOpt = medicalRecordRepository.findById(mr.getRecordId());
                if (mrOpt.isPresent()) {
                    MedicalRecord medRec = mrOpt.get();
                    medRec.setDiagnosis(mr.getDiagnosis());
                    medRec.setTreatmentPlan(mr.getTreatmentPlan());
                    medRec.setNote(mr.getMedicalNotes());
                    medRec.setRecordStatus(mr.getRecordStatus());
                    if (mr.getDischargeDate() != null && !mr.getDischargeDate().equals(null)) {
                        medRec.setDischargeDate(mr.getDischargeDate());
                    }
                    medicalRecordRepository.save(medRec);
                }
            }
        }
        return ResponseEntity.ok("Cập nhật thành công!");
    } catch (Exception ex) {
        ex.printStackTrace();
        return ResponseEntity.status(500).body("Có lỗi xảy ra khi cập nhật hồ sơ.");
    }
}

}





