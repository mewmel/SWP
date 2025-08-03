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

    // ✅ API MỚI: Cập nhật hồ sơ bệnh án đơn giản
    @PutMapping("/update/{recordId}")
    public ResponseEntity<?> updateMedicalRecordSimple(
            @PathVariable Integer recordId, @RequestBody Map<String, Object> request) {
        try {
            System.out.println("🔍 DEBUG: Updating medical record " + recordId + " with request: " + request);
            
            Optional<MedicalRecord> optionalRecord = medicalRecordRepository.findById(recordId);
            if (optionalRecord.isEmpty()) {
                System.out.println("❌ DEBUG: Medical record not found for ID: " + recordId);
                return ResponseEntity.status(404).body("Medical record not found");
            }

            MedicalRecord record = optionalRecord.get();
            System.out.println("🔍 DEBUG: Found existing record: " + record);
            
            // Cập nhật các trường từ request
            if (request.containsKey("recordStatus")) {
                String newStatus = (String) request.get("recordStatus");
                System.out.println("🔍 DEBUG: Updating recordStatus from '" + record.getRecordStatus() + "' to '" + newStatus + "'");
                record.setRecordStatus(newStatus);
            }
            if (request.containsKey("diagnosis")) {
                String newDiagnosis = (String) request.get("diagnosis");
                System.out.println("🔍 DEBUG: Updating diagnosis from '" + record.getDiagnosis() + "' to '" + newDiagnosis + "'");
                record.setDiagnosis(newDiagnosis);
            }
            if (request.containsKey("treatmentPlan")) {
                String newPlan = (String) request.get("treatmentPlan");
                System.out.println("🔍 DEBUG: Updating treatmentPlan from '" + record.getTreatmentPlan() + "' to '" + newPlan + "'");
                record.setTreatmentPlan(newPlan);
            }
            if (request.containsKey("dischargeDate")) {
                String dischargeDateStr = (String) request.get("dischargeDate");
                if (dischargeDateStr != null && !dischargeDateStr.isEmpty()) {
                    System.out.println("🔍 DEBUG: Updating dischargeDate to: " + dischargeDateStr);
                    record.setDischargeDate(java.time.LocalDateTime.parse(dischargeDateStr.replace("Z", "")));
                }
            }
            if (request.containsKey("medicalNotes")) {
                String newNotes = (String) request.get("medicalNotes");
                System.out.println("🔍 DEBUG: Updating note from '" + record.getNote() + "' to '" + newNotes + "'");
                record.setNote(newNotes);
            }
            if (request.containsKey("note")) {
                String newNote = (String) request.get("note");
                System.out.println("🔍 DEBUG: Updating note from '" + record.getNote() + "' to '" + newNote + "'");
                record.setNote(newNote);
            }

            MedicalRecord savedRecord = medicalRecordRepository.save(record);
            System.out.println("✅ DEBUG: Record saved successfully: " + savedRecord);
            
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Cập nhật hồ sơ bệnh án thành công");
            response.put("recordId", recordId);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.out.println("❌ DEBUG: Error updating medical record: " + e.getMessage());
            e.printStackTrace();
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", "error");
            errorResponse.put("message", "Có lỗi xảy ra khi cập nhật hồ sơ: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }


    // Lấy chi tiết MedicalRecord theo recordId
@GetMapping("/{recordId}")
public ResponseEntity<MedicalRecord> getMedicalRecordById(@PathVariable Integer recordId) {
    System.out.println("🔍 DEBUG: Getting medical record by ID: " + recordId);
    
    Optional<MedicalRecord> optionalRecord = medicalRecordRepository.findById(recordId);
    if (optionalRecord.isPresent()) {
        MedicalRecord record = optionalRecord.get();
        System.out.println("✅ DEBUG: Found medical record: " + record);
        return ResponseEntity.ok(record);
    } else {
        System.out.println("❌ DEBUG: Medical record not found for ID: " + recordId);
        return ResponseEntity.status(404).build();
    }
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