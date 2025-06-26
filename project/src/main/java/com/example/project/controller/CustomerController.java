package com.example.project.controller;

import java.util.Arrays;
import java.util.Optional;

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
import com.example.project.dto.CurrentBooking;
import com.example.project.dto.MedicalRecord;
import com.example.project.repository.BookingRepository;    

import com.example.project.entity.Booking;
import com.example.project.entity.Customer;
import com.example.project.repository.CustomerRepository;
import com.example.project.repository.MedicalRecordRepository;

@RestController
@RequestMapping("/api/customer")
@CrossOrigin // Cho phép truy cập từ front-end
public class CustomerController {

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private MedicalRecordRepository medicalRecordRepository;

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

@Autowired
    private MedicalRecordRepository medicalRecordRepository;

    @GetMapping("/full-record/{cusId}")
    public ResponseEntity<PatientFullRecordDTO> getFullRecord(@PathVariable Integer cusId) {
        // 1. Tìm customer
        Optional<Customer> optional = customerRepository.findById(cusId);
        if (!optional.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        Customer customer = optional.get();

        // 2. Lấy booking hiện tại (ví dụ lấy booking có status = 'confirmed' hoặc 'ongoing', mới nhất)
        Booking booking = bookingRepository
            .findTopByCusIdAndBookStatusInOrderByBookDateDesc(
                cusId, Arrays.asList("confirmed", "ongoing")
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
        dto.setCusDate(customer.getCusDate());
        dto.setCusEmail(customer.getCusEmail());
        dto.setCusPhone(customer.getCusPhone());
        dto.setCusAddress(customer.getCusAddress());
        dto.setCusOccupation(customer.getCusOccupation());
        dto.setEmergencyContact(customer.getEmergencyContact());
        dto.setCusStatus(customer.getCusStatus());

        // MedicalRecord
        if (medicalRecord != null) {
            MedicalRecord medicalRecordDTO = new MedicalRecord();
            medicalRecordDTO.setRecordId(medicalRecord.getRecordId());
            medicalRecordDTO.setDiagnosis(medicalRecord.getDiagnosis());
            medicalRecordDTO.setTreatmentPlan(medicalRecord.getTreatmentPlan());
            medicalRecordDTO.setNotes(medicalRecord.getNotes());
            medicalRecordDTO.setRecordStatus(medicalRecord.getRecordStatus());
            medicalRecordDTO.setDischargeDate(medicalRecord.getDischargeDate());
            dto.setMedicalRecord(medicalRecordDTO);
        }

        // Booking
        if (booking != null) {
            CurrentBooking bookingDTO = new CurrentBooking();
            bookingDTO.setBookType(booking.getBookType());
            bookingDTO.setBookStatus(booking.getBookStatus());
            bookingDTO.setNote(booking.getNote());
            bookingDTO.setSerName(booking.getSerName());
            dto.setCurrentBooking(bookingDTO);
        }

        return ResponseEntity.ok(dto);
    }

}