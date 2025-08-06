package com.example.project.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.project.entity.MedicalRecordBooking;
import com.example.project.repository.MedicalRecordBookingRepository;

@RestController
@RequestMapping("/api/medical-record-booking")
@CrossOrigin
public class MedicalRecordBookingController {
    @Autowired
    private MedicalRecordBookingRepository medicalRecordBookingRepository;

    // POST /api/medical-record-booking/create/{recordId},{bookId}
    @PostMapping("/create/{recordId},{bookId}")
    public ResponseEntity<?> createMedicalRecordBooking(
            @PathVariable Integer recordId,
            @PathVariable Integer bookId) {
        try {
            // Tạo ID
            MedicalRecordBooking.MedicalRecordBookingId id = new MedicalRecordBooking.MedicalRecordBookingId(recordId, bookId);
            // Tạo entity
            MedicalRecordBooking entity = new MedicalRecordBooking();
            entity.setId(id);
            // Lưu vào DB
            medicalRecordBookingRepository.save(entity);

            Map<String, Object> resp = new HashMap<>();
            resp.put("status", "success");
            resp.put("message", "Đã tạo liên kết Booking-MedicalRecord");
            resp.put("bookId", bookId);
            resp.put("recordId", recordId);
            return ResponseEntity.ok(resp);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Không thể tạo liên kết: " + e.getMessage());
        }
    }

    // GET /api/medical-record-booking/by-record/{recordId}
    @GetMapping("/by-record/{recordId}")
    public ResponseEntity<List<Integer>> getBookIdsByRecordId(@PathVariable Integer recordId) {
        try {
            System.out.println("🔍 DEBUG: Getting bookIds for recordId: " + recordId);
            
            // Lấy tất cả MedicalRecordBooking theo recordId
            List<MedicalRecordBooking> medicalRecordBookings = medicalRecordBookingRepository.findByIdRecordId(recordId);
            
            if (medicalRecordBookings.isEmpty()) {
                System.out.println("❌ DEBUG: No MedicalRecordBooking found for recordId: " + recordId);
                return ResponseEntity.ok(List.of());
            }
            
            // Lấy danh sách bookIds
            List<Integer> bookIds = medicalRecordBookings.stream()
                .map(mrb -> mrb.getId().getBookId())
                .collect(Collectors.toList());
            
            System.out.println("✅ DEBUG: Found bookIds: " + bookIds);
            return ResponseEntity.ok(bookIds);
            
        } catch (Exception e) {
            System.out.println("❌ DEBUG: Error getting bookIds: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(List.of());
        }
    }
}