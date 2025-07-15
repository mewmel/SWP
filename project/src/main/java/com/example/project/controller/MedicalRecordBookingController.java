package com.example.project.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.project.entity.MedicalRecordBooking;
import com.example.project.repository.MedicalRecordBookingRepository;

@RestController
@RequestMapping("/api/medical-records-booking")
public class MedicalRecordBookingController {
    @Autowired
    private MedicalRecordBookingRepository medicalRecordBookingRepository;

    // POST /api/medical-records-booking/create/{recordId},{bookId}
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
}

    