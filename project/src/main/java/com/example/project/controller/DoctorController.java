package com.example.project.controller;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.ArrayList;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
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

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @GetMapping("/doctors")
    public List<Doctor> getAllDoctors() {
        return doctorRepository.findAll();
    }

    @GetMapping("/doctors/{id}")
    public Doctor getDoctorById(@PathVariable Integer id) {
        return doctorRepository.findById(id).orElse(null);
    }

    // Comment out old endpoints to avoid conflict
    /*
    @PostMapping("/doctors")
    public Doctor createDoctor(@RequestBody Doctor doctor) {
        return doctorManagementService.createDoctor(doctor);
    }

    @PutMapping("/doctors/{id}")
    public Optional<Doctor> updateDoctor(@PathVariable Integer id, @RequestBody Doctor doctor) {
        return doctorManagementService.updateDoctor(id, doctor);
    }
    */

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

    /**
     * API lấy danh sách tất cả bác sĩ cho quản lý
     * GET /api/doctors/all
     */
    @GetMapping("/doctors/all")
    public ResponseEntity<List<Map<String, Object>>> getAllDoctorsForManagement() {
        try {
            List<Doctor> doctors = doctorRepository.findAll();
            List<Map<String, Object>> doctorList = new ArrayList<>();
            
            for (Doctor doctor : doctors) {
                Map<String, Object> doctorData = new HashMap<>();
                doctorData.put("docId", doctor.getDocId());
                doctorData.put("docFullName", doctor.getDocFullName());
                doctorData.put("docEmail", doctor.getDocEmail());
                doctorData.put("docPhone", doctor.getDocPhone());
                doctorData.put("expertise", doctor.getExpertise());
                doctorData.put("degree", doctor.getDegree());
                doctorData.put("profileDescription", doctor.getProfileDescription());
                
                // Thêm thông tin về trạng thái hoạt động (mặc định là active)
                doctorData.put("isActive", true); // Bác sĩ mặc định là active
                
                doctorList.add(doctorData);
            }
            
            return ResponseEntity.ok(doctorList);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    /**
     * API tạo bác sĩ mới
     * POST /api/doctors
     */
    @PostMapping("/doctors")
    public ResponseEntity<Map<String, Object>> createDoctor(@RequestBody Map<String, Object> doctorData) {
        try {
            // Validate required fields
            String docFullName = (String) doctorData.get("docFullName");
            String docEmail = (String) doctorData.get("docEmail");
            String docPhone = (String) doctorData.get("docPhone");
            String expertise = (String) doctorData.get("expertise");
            String degree = (String) doctorData.get("degree");
            String profileDescription = (String) doctorData.get("profileDescription");
            String docPassword = (String) doctorData.get("docPassword");
            
            if (docFullName == null || docFullName.trim().isEmpty()) {
                Map<String, Object> error = new HashMap<>();
                error.put("error", "Họ và tên bác sĩ không được để trống");
                return ResponseEntity.badRequest().body(error);
            }
            
            if (docEmail == null || docEmail.trim().isEmpty()) {
                Map<String, Object> error = new HashMap<>();
                error.put("error", "Email không được để trống");
                return ResponseEntity.badRequest().body(error);
            }
            
            if (docPhone == null || docPhone.trim().isEmpty()) {
                Map<String, Object> error = new HashMap<>();
                error.put("error", "Số điện thoại không được để trống");
                return ResponseEntity.badRequest().body(error);
            }

            if (docPassword == null || docPassword.trim().isEmpty()) {
                Map<String, Object> error = new HashMap<>();
                error.put("error", "Mật khẩu không được để trống");
                return ResponseEntity.badRequest().body(error);
            }
            
            // Kiểm tra email đã tồn tại chưa
            Optional<Doctor> existingDoctor = doctorRepository.findByDocEmail(docEmail);
            if (existingDoctor.isPresent()) {
                Map<String, Object> error = new HashMap<>();
                error.put("error", "Email đã được sử dụng bởi bác sĩ khác");
                return ResponseEntity.badRequest().body(error);
            }
            
            // Tạo bác sĩ mới
            Doctor newDoctor = new Doctor();
            newDoctor.setDocFullName(docFullName.trim());
            newDoctor.setDocEmail(docEmail.trim());
            newDoctor.setDocPhone(docPhone.trim());
            newDoctor.setExpertise(expertise != null ? expertise.trim() : null);
            newDoctor.setDegree(degree != null ? degree.trim() : null);
            newDoctor.setProfileDescription(profileDescription != null ? profileDescription.trim() : null);
            // Mã hóa mật khẩu bằng BCrypt
            String encodedPassword = passwordEncoder.encode(docPassword.trim());
            newDoctor.setDocPassword(encodedPassword);
            
            Doctor savedDoctor = doctorRepository.save(newDoctor);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Thêm bác sĩ thành công");
            response.put("doctorId", savedDoctor.getDocId());
            response.put("doctorName", savedDoctor.getDocFullName());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Lỗi khi thêm bác sĩ: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    /**
     * API cập nhật thông tin bác sĩ
     * PUT /api/doctors/{docId}
     */
    @PutMapping("/doctors/update/{docId}")
    public ResponseEntity<Map<String, Object>> updateDoctor(
            @PathVariable Integer docId,
            @RequestBody Map<String, Object> doctorData) {
        try {
            // Validate required fields
            String docFullName = (String) doctorData.get("docFullName");
            String docEmail = (String) doctorData.get("docEmail");
            String docPhone = (String) doctorData.get("docPhone");
            String expertise = (String) doctorData.get("expertise");
            String degree = (String) doctorData.get("degree");
            String profileDescription = (String) doctorData.get("profileDescription");
            String docPassword = (String) doctorData.get("docPassword");
            
            if (docFullName == null || docFullName.trim().isEmpty()) {
                Map<String, Object> error = new HashMap<>();
                error.put("error", "Họ và tên bác sĩ không được để trống");
                return ResponseEntity.badRequest().body(error);
            }
            
            if (docEmail == null || docEmail.trim().isEmpty()) {
                Map<String, Object> error = new HashMap<>();
                error.put("error", "Email không được để trống");
                return ResponseEntity.badRequest().body(error);
            }
            
            if (docPhone == null || docPhone.trim().isEmpty()) {
                Map<String, Object> error = new HashMap<>();
                error.put("error", "Số điện thoại không được để trống");
                return ResponseEntity.badRequest().body(error);
            }
            
            // Kiểm tra bác sĩ có tồn tại không
            Optional<Doctor> existingDoctorOpt = doctorRepository.findById(docId);
            if (existingDoctorOpt.isEmpty()) {
                Map<String, Object> error = new HashMap<>();
                error.put("error", "Không tìm thấy bác sĩ với ID: " + docId);
                return ResponseEntity.notFound().build();
            }
            
            Doctor existingDoctor = existingDoctorOpt.get();
            
            // Kiểm tra email đã tồn tại chưa (trừ bác sĩ hiện tại)
            Optional<Doctor> emailCheck = doctorRepository.findByDocEmail(docEmail);
            if (emailCheck.isPresent() && !emailCheck.get().getDocId().equals(docId)) {
                Map<String, Object> error = new HashMap<>();
                error.put("error", "Email đã được sử dụng bởi bác sĩ khác");
                return ResponseEntity.badRequest().body(error);
            }
            
            // Cập nhật thông tin bác sĩ
            existingDoctor.setDocFullName(docFullName.trim());
            existingDoctor.setDocEmail(docEmail.trim());
            existingDoctor.setDocPhone(docPhone.trim());
            existingDoctor.setExpertise(expertise != null ? expertise.trim() : null);
            existingDoctor.setDegree(degree != null ? degree.trim() : null);
            existingDoctor.setProfileDescription(profileDescription != null ? profileDescription.trim() : null);
            
            // Cập nhật mật khẩu nếu có (mã hóa bằng BCrypt)
            if (docPassword != null && !docPassword.trim().isEmpty()) {
                String encodedPassword = passwordEncoder.encode(docPassword.trim());
                existingDoctor.setDocPassword(encodedPassword);
            }
            
            Doctor updatedDoctor = doctorRepository.save(existingDoctor);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Cập nhật bác sĩ thành công");
            response.put("doctorId", updatedDoctor.getDocId());
            response.put("doctorName", updatedDoctor.getDocFullName());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Lỗi khi cập nhật bác sĩ: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
}