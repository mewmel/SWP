package com.example.project.controller;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.project.dto.MedicalHistoryDTO;
import com.example.project.entity.Booking;
import com.example.project.entity.MedicalRecord;
import com.example.project.entity.WorkSlot;
import com.example.project.repository.BookingRepository;
import com.example.project.repository.BookingStepRepository;
import com.example.project.repository.MedicalRecordBookingRepository;
import com.example.project.repository.MedicalRecordRepository;
import com.example.project.repository.SubServiceRepository;
import com.example.project.repository.WorkSlotRepository;
import com.example.project.service.MedicalRecordService;

@RestController
@RequestMapping("/api/medical-records")
public class MedicalRecordController {
    @Autowired
    private MedicalRecordRepository medicalRecordRepository;

    @Autowired
    private MedicalRecordService medicalRecordService;

    @Autowired
    private MedicalRecordBookingRepository medicalRecordBookingRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private SubServiceRepository subServiceRepository;

    @Autowired
    private WorkSlotRepository workSlotRepository;

    @Autowired
    private BookingStepRepository bookingStepRepository;



    @GetMapping("/exist")
    public Map<String, Object> checkMedicalRecordExist(
            @RequestParam Integer cusId,
            @RequestParam Integer serId) {
        boolean exists = medicalRecordRepository.existsByCusIdAndSerId(cusId, serId);
        Map<String, Object> resp = new HashMap<>();
        resp.put("exists", exists);
        return resp;
    }

    // ✅ API MỚI: Lấy danh sách bệnh nhân có medical record của doctor
    @GetMapping("/patients-by-doctor/{docId}")
    public ResponseEntity<List<Map<String, Object>>> getPatientsWithMedicalRecordsByDoctor(@PathVariable Integer docId) {
        try {
            List<Map<String, Object>> patients = medicalRecordService.getPatientsWithMedicalRecordsByDoctor(docId);
            return ResponseEntity.ok(patients);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }

@PostMapping("/create/{serId}")
public Map<String, Object> createMedicalRecord(@PathVariable Integer serId, @RequestBody MedicalRecord request) {
    // Gán lại serId và set các trường mặc định
    request.setSerId(serId);
    request.setCreatedAt(java.time.LocalDateTime.now());

    if (request.getRecordStatus() == null || request.getRecordStatus().isEmpty()) {
        request.setRecordStatus("active");
    }

    MedicalRecord saved = medicalRecordRepository.save(request);

    Map<String, Object> resp = new HashMap<>();
    resp.put("status", "success");
    resp.put("message", "Đã tạo hồ sơ bệnh án cho dịch vụ " + serId);
    resp.put("recordId", saved.getRecordId()); // trả thêm id nếu cần dùng JS
    return resp;
}

    // PUT /api/medical-records/update-with-booking/{recordId}
    @PutMapping("/update-with-booking/{recordId}")
    public ResponseEntity<?> updateMedicalRecord(
            @PathVariable Integer recordId, @RequestBody MedicalRecord req) {
        boolean ok = medicalRecordService.updateMedicalRecord(recordId, req);
        if (ok) return ResponseEntity.ok().build();
        return ResponseEntity.status(404).body("Medical record not found");
    }


    // Lấy chi tiết MedicalRecord theo recordId
@GetMapping("/{recordId}")
public ResponseEntity<MedicalRecord> getMedicalRecordById(@PathVariable Integer recordId) {
    return medicalRecordRepository.findById(recordId)
        .map(record -> ResponseEntity.ok(record))
        .orElse(ResponseEntity.status(404).build());
}



@GetMapping("/customer/{recordId}/medical-history")
public ResponseEntity<?> getMedicalHistoryByRecordId(@PathVariable Integer recordId) {
    try {
        // B1: Lấy các bookId từ MedicalRecordBooking
        List<Integer> bookIds = medicalRecordBookingRepository.findByIdRecordId(recordId)
                .stream()
                .map(link -> link.getId().getBookId())
                .toList();

        if (bookIds.isEmpty()) {
            return ResponseEntity.ok(List.of());
        }

        // B2: Lấy danh sách Booking
        List<Booking> bookings = bookingRepository.findAllById(bookIds);

        // B3: Duyệt từng booking → tạo DTO
        List<MedicalHistoryDTO> result = new ArrayList<>();

        for (Booking booking : bookings) {
            String date = "";
            String time = "";

            // Lấy WorkSlot nếu có
            if (booking.getSlotId() != null) {
                Optional<WorkSlot> optionalSlot = workSlotRepository.findById(booking.getSlotId());
                if (optionalSlot.isPresent()) {
                    WorkSlot slot = optionalSlot.get();
                    date = slot.getWorkDate().toString();
                    time = slot.getStartTime() + " - " + slot.getEndTime();
                }
            }

            // Lấy tên sub-service từ BookingStep
// Lấy danh sách tên sub-service theo bookId
List<String> subNames = bookingStepRepository.findSubNamesByBookId(booking.getBookId());

            result.add(new MedicalHistoryDTO(
                booking.getBookId(),
                booking.getBookType(),
                booking.getBookStatus(),
                date,
                time,
                subNames
            ));
        }

        return ResponseEntity.ok(result);
    } catch (Exception e) {
        e.printStackTrace(); // log rõ ra console
        return ResponseEntity.status(500).body("Lỗi khi lấy lịch sử khám: " + e.getMessage());
    }
}


}




