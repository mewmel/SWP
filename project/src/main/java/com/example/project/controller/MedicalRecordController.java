package com.example.project.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.project.entity.MedicalRecord;
import com.example.project.repository.MedicalRecordRepository;

@RestController
@RequestMapping("/api/medical-records")
public class MedicalRecordController {
    @Autowired
    private MedicalRecordRepository medicalRecordRepository;

@PostMapping("/create/{serId}")
public ResponseEntity<MedicalRecord> createMedicalRecord(@PathVariable Integer serId, @RequestBody MedicalRecord request) {
    System.out.println("==> Nhận request tạo MedicalRecord: " + request);
    System.out.println("cusId=" + request.getCusId() + ", docId=" + request.getDocId() + ", serId=" + serId);

    request.setSerId(serId); // Đảm bảo gán đúng serId (nếu cần)
    request.setCreatedAt(java.time.LocalDateTime.now());
    if (request.getRecordStatus() == null || request.getRecordStatus().isEmpty()) {
        request.setRecordStatus("closed");
    }
    MedicalRecord saved = medicalRecordRepository.save(request);
    return ResponseEntity.ok(saved);
}

}




