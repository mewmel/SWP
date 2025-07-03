package com.example.project.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.project.dto.DocFullProfile;
import com.example.project.entity.Doctor;
import com.example.project.repository.DoctorRepository;
import com.example.project.service.DoctorManagementService;




@RestController
@RequestMapping("/api")
public class DoctorController {
    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private DoctorManagementService doctorManagementService;




    @GetMapping("/doctors")
    public List<Doctor> getAllDoctors() {
        return doctorRepository.findAll();
    }

    @GetMapping("/doctors/{id}")
    public Doctor getDoctorById(@PathVariable Integer id) {
        return doctorRepository.findById(id).orElse(null);
    }


    /**
     * GET  /api/doctor/full-profile/{docId}
     * Trả về đầy đủ thông tin hồ sơ bác sĩ, bao gồm:
     *   - Thông tin cá nhân
     *   - Danh sách dịch vụ (currentServices)
     *   - Ảnh (nếu có)
     */
@GetMapping("/doctor/full-profile/{docId}")
public ResponseEntity<?> getFullProfile(@PathVariable Integer docId) {
    try {
        DocFullProfile profile = doctorManagementService.getFullProfile(docId);
        return ResponseEntity.ok(profile);
    } catch (RuntimeException ex) {
        Map<String, Object> error = new HashMap<>();
        error.put("message", "Không tìm thấy bác sĩ");
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error); // Trả về JSON thay vì rỗng
    }
}




}