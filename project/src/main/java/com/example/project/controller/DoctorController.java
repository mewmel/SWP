package com.example.project.controller;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.project.dto.DocFullProfile;
import com.example.project.entity.Doctor;
import com.example.project.entity.WorkSlot;
import com.example.project.repository.DoctorRepository;
import com.example.project.repository.WorkSlotRepository;
import com.example.project.service.DoctorManagementService;

@RestController
@RequestMapping("/api")
public class DoctorController {
    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private DoctorManagementService doctorManagementService;

    @Autowired
    private WorkSlotRepository workSlotRepository;

    @GetMapping("/doctors")
    public List<Doctor> getAllDoctors() {
        return doctorRepository.findAll();
    }

    @GetMapping("/doctors/{id}")
    public Doctor getDoctorById(@PathVariable Integer id) {
        return doctorRepository.findById(id).orElse(null);
    }

    @PostMapping("/doctors")
    public Doctor createDoctor(@RequestBody Doctor doctor) {
        return doctorManagementService.createDoctor(doctor);
    }

    @PutMapping("/doctors/{id}")
    public Optional<Doctor> updateDoctor(@PathVariable Integer id, @RequestBody Doctor doctor) {
        return doctorManagementService.updateDoctor(id, doctor);
    }

    /**
     * GET  /api/doctor/full-profile/{docId}
     * Trả về đầy đủ thông tin hồ sơ bác sĩ, bao gồm:
     *   - Thông tin cá nhân
     *   - Danh sách dịch vụ (currentServices)
     *   - Ảnh (nếu có)
     */
    @GetMapping("/doctors/full-profile/{docId}")
    public ResponseEntity<?> getFullProfile(@PathVariable Integer docId) {
        try {
            DocFullProfile profile = doctorManagementService.getFullProfile(docId);
            return ResponseEntity.ok(profile);
        } catch (RuntimeException ex) {
            Map<String, Object> error = new HashMap<>();
            error.put("message", "Không tìm thấy bác sĩ");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    /**
     * API mới: lấy tất cả work slot của 1 bác sĩ trong khoảng ngày bất kỳ (KHÔNG lọc status)
     * GET /api/doctors/{docId}/all-slots?from=yyyy-MM-dd&to=yyyy-MM-dd
     */
    @GetMapping("/doctors/{docId}/all-slots")
    public List<WorkSlot> getAllWorkSlotsForDoctorInRange(
            @PathVariable Integer docId,
            @RequestParam("from") String from,
            @RequestParam("to") String to) {
        LocalDate fromDate = LocalDate.parse(from);
        LocalDate toDate = LocalDate.parse(to);
        return workSlotRepository.findAllSlotsByDoctorAndDateRange(docId, fromDate, toDate);
    }
}