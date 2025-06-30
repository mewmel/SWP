package com.example.project.controller;

import java.util.HashMap;
import java.util.Map;

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

import com.example.project.entity.MedicalRecord;
import com.example.project.repository.MedicalRecordRepository;
import com.example.project.service.MedicalRecordService;

@RestController
@RequestMapping("/api/medical-records")
public class MedicalRecordController {
    @Autowired
    private MedicalRecordRepository medicalRecordRepository;

    @Autowired
    private MedicalRecordService medicalRecordService;

        @GetMapping("/exist")
    public Map<String, Object> checkMedicalRecordExist(
            @RequestParam Integer cusId,
            @RequestParam Integer serId) {
        boolean exists = medicalRecordRepository.existsByCusIdAndSerId(cusId, serId);
        Map<String, Object> resp = new HashMap<>();
        resp.put("exists", exists);
        return resp;
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


}




