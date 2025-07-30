package com.example.project.controller;

import java.util.Optional;
import java.util.Map;
import java.util.HashMap;
import java.util.List;
import java.util.ArrayList;

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

import com.example.project.dto.CusCurrentBooking;
import com.example.project.entity.Booking;
import com.example.project.entity.Customer;
import com.example.project.entity.MedicalRecord;
import com.example.project.entity.Service;
import com.example.project.repository.BookingRepository;
import com.example.project.repository.CustomerRepository;
import com.example.project.repository.DrugRepository;
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

    @Autowired
    private DrugRepository drugRepository;


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

    @GetMapping("/full-record/{cusId},{bookId}")
public ResponseEntity<CusCurrentBooking> getFullRecord(@PathVariable Integer cusId, @PathVariable Integer bookId) {
    try {
    // 1. Tìm customer
    Optional<Customer> optional = customerRepository.findById(cusId);
    if (!optional.isPresent()) {
        return ResponseEntity.notFound().build();
    }
    Customer customer = optional.get();

    // 2. Lấy booking hiện tại (ví dụ lấy booking có status = 'confirmed' hoặc 'ongoing', mới nhất)//sửa lại thành ongoing
    Booking booking = bookingRepository.findByBookId(bookId)
        .orElse(null );

    // 3. Lấy hồ sơ bệnh án 
    MedicalRecord medicalRecord = medicalRecordRepository
        .findByCusId(cusId)
        .orElse(null);

    // 4. Map sang DTO
    CusCurrentBooking dto = new CusCurrentBooking();
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
        CusCurrentBooking.CurrentMedicalRecord medicalRecordDTO = new CusCurrentBooking.CurrentMedicalRecord();
        medicalRecordDTO.setRecordId(medicalRecord.getRecordId());
        medicalRecordDTO.setDiagnosis(medicalRecord.getDiagnosis());
        medicalRecordDTO.setTreatmentPlan(medicalRecord.getTreatmentPlan());
        medicalRecordDTO.setMedicalNotes(medicalRecord.getNote());
        medicalRecordDTO.setRecordStatus(medicalRecord.getRecordStatus());
        // Xử lý LocalDate -> String nếu là LocalDate
                if (medicalRecord.getCreatedAt() != null) {
            medicalRecordDTO.setCreatedAt(medicalRecord.getCreatedAt());
        }
                if (medicalRecord.getDischargeDate() != null) {
            medicalRecordDTO.setDischargeDate(medicalRecord.getDischargeDate());
        }

        dto.setCurrentMedicalRecord(medicalRecordDTO);
    }

    // Booking
    if (booking != null) {
        CusCurrentBooking.CurrentBooking bookingDTO = new CusCurrentBooking.CurrentBooking();
        bookingDTO.setBookId(booking.getBookId());
        bookingDTO.setBookType(booking.getBookType());
        bookingDTO.setBookStatus(booking.getBookStatus());
        bookingDTO.setNote(booking.getNote());
         // Lấy tên dịch vụ
    Service service = null;
    if (booking.getSerId() != null) {
        service = serviceRepository.findById(booking.getSerId()).orElse(null);
    }

    // lấy drugId từ booking nếu có
    if (booking.getDrugId() != null) {  
        dto.setDrugId(booking.getDrugId());
    } else {
        dto.setDrugId(null); // hoặc để null nếu không có
    }
        // Gán tên dịch vụ vào DTO
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
public ResponseEntity<?> updateFullRecord(@PathVariable Integer cusId, @RequestBody CusCurrentBooking updateDto) {
    try {
        // 1. Update Booking (nếu có truyền currentBooking)
        if (updateDto.getCurrentBooking() != null) {
            CusCurrentBooking.CurrentBooking b = updateDto.getCurrentBooking();
            if (b.getBookId() > 0) {
                Optional<Booking> bookingOpt = bookingRepository.findById(b.getBookId());
                if (bookingOpt.isPresent()) {
                    Booking booking = bookingOpt.get();
                    booking.setBookType(b.getBookType());
                    booking.setBookStatus(b.getBookStatus());
                    booking.setNote(b.getNote());
                    bookingRepository.save(booking);
                }
            }
        }

        // 2. Update MedicalRecord (nếu có truyền currentMedicalRecord)
        if (updateDto.getCurrentMedicalRecord() != null) {
            CusCurrentBooking.CurrentMedicalRecord mr = updateDto.getCurrentMedicalRecord();
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

    /**
     * API lấy tổng số bệnh nhân (chỉ đếm tài khoản active)
     * GET /api/customer/count
     */
    @GetMapping("/count")
    public ResponseEntity<Map<String, Object>> getCustomerCount() {
        try {
            // Chỉ đếm những bệnh nhân có trạng thái active hoặc null (mặc định là active)
            long totalActiveCustomers = customerRepository.findAll().stream()
                .filter(customer -> "active".equals(customer.getCusStatus()) || 
                                  customer.getCusStatus() == null)
                .count();
            
            Map<String, Object> response = new HashMap<>();
            response.put("totalCustomers", totalActiveCustomers);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Lỗi khi lấy số lượng bệnh nhân"));
        }
    }

    /**
     * API lấy danh sách tất cả bệnh nhân cho quản lý (chỉ trả về tài khoản active)
     * GET /api/customer/all
     */
    @GetMapping("/all")
    public ResponseEntity<List<Map<String, Object>>> getAllCustomers() {
        try {
            List<Customer> allCustomers = customerRepository.findAll();
            List<Map<String, Object>> customerList = new ArrayList<>();
            
            for (Customer customer : allCustomers) {
                // Chỉ xử lý những bệnh nhân có trạng thái active hoặc null (mặc định là active)
                if ("active".equals(customer.getCusStatus()) || customer.getCusStatus() == null) {
                    Map<String, Object> customerData = new HashMap<>();
                    customerData.put("cusId", customer.getCusId());
                    customerData.put("cusFullName", customer.getCusFullName());
                    customerData.put("cusGender", customer.getCusGender());
                    customerData.put("cusDate", customer.getCusDate());
                    customerData.put("cusEmail", customer.getCusEmail());
                    customerData.put("cusPhone", customer.getCusPhone());
                    customerData.put("cusAddress", customer.getCusAddress());
                    customerData.put("cusStatus", customer.getCusStatus());
                    customerData.put("cusOccupation", customer.getCusOccupation());
                    customerData.put("emergencyContact", customer.getEmergencyContact());
                    customerData.put("cusProvider", customer.getCusProvider());
                    
                    // Kiểm tra xem bệnh nhân có booking nào không
                    List<Booking> customerBookings = bookingRepository.findByCusIdOrderByBookIdDesc(customer.getCusId());
                    customerData.put("hasBookings", !customerBookings.isEmpty());
                    customerData.put("totalBookings", customerBookings.size());
                    
                    // Lấy booking gần nhất (đã được sắp xếp theo BookId giảm dần)
                    if (!customerBookings.isEmpty()) {
                        Booking latestBooking = customerBookings.get(0);
                        customerData.put("lastBookingDate", latestBooking.getCreatedAt());
                        customerData.put("lastBookingStatus", latestBooking.getBookStatus());
                    }
                    
                    customerList.add(customerData);
                }
            }
            
            return ResponseEntity.ok(customerList);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    /**
     * API cập nhật trạng thái bệnh nhân (active/inactive)
     * PUT /api/customer/{cusId}/status
     */
    @PutMapping("/{cusId}/status")
    public ResponseEntity<Map<String, Object>> updateCustomerStatus(
            @PathVariable Integer cusId,
            @RequestBody Map<String, String> request) {
        try {
            String status = request.get("status");
            if (status == null || (!status.equals("active") && !status.equals("inactive"))) {
                Map<String, Object> error = new HashMap<>();
                error.put("error", "Trạng thái không hợp lệ. Phải là 'active' hoặc 'inactive'");
                return ResponseEntity.badRequest().body(error);
            }

            Optional<Customer> customerOpt = customerRepository.findById(cusId);
            if (customerOpt.isEmpty()) {
                Map<String, Object> error = new HashMap<>();
                error.put("error", "Không tìm thấy bệnh nhân với ID: " + cusId);
                return ResponseEntity.notFound().build();
            }

            Customer customer = customerOpt.get();
            customer.setCusStatus(status);
            customerRepository.save(customer);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Cập nhật trạng thái bệnh nhân thành công");
            response.put("cusId", cusId);
            response.put("status", status);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Lỗi khi cập nhật trạng thái bệnh nhân");
            return ResponseEntity.status(500).body(error);
        }
    }
}