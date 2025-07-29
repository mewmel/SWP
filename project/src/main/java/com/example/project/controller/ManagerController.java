package com.example.project.controller;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.project.entity.Manager;
import com.example.project.repository.ManagerRepository;

@RestController
@RequestMapping("/api/manager")
@CrossOrigin
public class ManagerController {

    @Autowired
    private ManagerRepository managerRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    /**
     * API lấy danh sách tất cả quản lý
     * GET /api/manager/all
     */
    @GetMapping("/all")
    public ResponseEntity<List<Map<String, Object>>> getAllManagers() {
        try {
            List<Manager> managers = managerRepository.findAll();
            List<Map<String, Object>> managerList = new ArrayList<>();
            
            for (Manager manager : managers) {
                Map<String, Object> managerData = new HashMap<>();
                managerData.put("maId", manager.getMaId());
                managerData.put("maFullName", manager.getMaFullName());
                managerData.put("maEmail", manager.getMaEmail());
                managerData.put("maPhone", manager.getMaPhone());
                managerData.put("position", manager.getPosition());
                managerData.put("roles", manager.getRoles());
                
                // Thêm thông tin về trạng thái hoạt động (mặc định là active)
                managerData.put("isActive", true); // Quản lý mặc định là active
                
                managerList.add(managerData);
            }
            
            return ResponseEntity.ok(managerList);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    /**
     * API lấy tổng số quản lý
     * GET /api/manager/count
     */
    @GetMapping("/count")
    public ResponseEntity<Map<String, Object>> getManagerCount() {
        try {
            long totalManagers = managerRepository.count();
            Map<String, Object> response = new HashMap<>();
            response.put("totalManagers", totalManagers);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Lỗi khi lấy số lượng quản lý"));
        }
    }

    /**
     * API tạo quản lý mới
     * POST /api/manager
     */
    @PostMapping
    public ResponseEntity<Map<String, Object>> createManager(@RequestBody Map<String, Object> managerData) {
        try {
            // Validate required fields
            String maFullName = (String) managerData.get("maFullName");
            String maEmail = (String) managerData.get("maEmail");
            String maPhone = (String) managerData.get("maPhone");
            String position = (String) managerData.get("position");
            String roles = (String) managerData.get("roles");
            String maPassword = (String) managerData.get("maPassword");
            
            if (maFullName == null || maFullName.trim().isEmpty()) {
                Map<String, Object> error = new HashMap<>();
                error.put("error", "Họ và tên quản lý không được để trống");
                return ResponseEntity.badRequest().body(error);
            }
            
            if (maEmail == null || maEmail.trim().isEmpty()) {
                Map<String, Object> error = new HashMap<>();
                error.put("error", "Email không được để trống");
                return ResponseEntity.badRequest().body(error);
            }
            
            if (maPhone == null || maPhone.trim().isEmpty()) {
                Map<String, Object> error = new HashMap<>();
                error.put("error", "Số điện thoại không được để trống");
                return ResponseEntity.badRequest().body(error);
            }
            
            if (maPassword == null || maPassword.trim().isEmpty()) {
                Map<String, Object> error = new HashMap<>();
                error.put("error", "Mật khẩu không được để trống");
                return ResponseEntity.badRequest().body(error);
            }
            
            // Kiểm tra email đã tồn tại chưa
            Optional<Manager> existingManager = managerRepository.findByMaEmail(maEmail);
            if (existingManager.isPresent()) {
                Map<String, Object> error = new HashMap<>();
                error.put("error", "Email đã được sử dụng bởi quản lý khác");
                return ResponseEntity.badRequest().body(error);
            }
            
            // Tạo quản lý mới
            Manager newManager = new Manager();
            newManager.setMaFullName(maFullName.trim());
            newManager.setMaEmail(maEmail.trim());
            newManager.setMaPhone(maPhone.trim());
            newManager.setPosition(position != null ? position.trim() : null);
            newManager.setRoles(roles != null ? roles.trim() : "manager"); // Mặc định là manager
            
            // Mã hóa mật khẩu bằng BCrypt
            String encodedPassword = passwordEncoder.encode(maPassword.trim());
            newManager.setMaPassword(encodedPassword);
            
            Manager savedManager = managerRepository.save(newManager);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Thêm quản lý thành công");
            response.put("managerId", savedManager.getMaId());
            response.put("managerName", savedManager.getMaFullName());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Lỗi khi thêm quản lý: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    /**
     * API cập nhật thông tin quản lý
     * PUT /api/manager/{maId}
     */
    @PutMapping("/{maId}")
    public ResponseEntity<Map<String, Object>> updateManager(
            @PathVariable Integer maId,
            @RequestBody Map<String, Object> managerData) {
        try {
            // Validate required fields
            String maFullName = (String) managerData.get("maFullName");
            String maEmail = (String) managerData.get("maEmail");
            String maPhone = (String) managerData.get("maPhone");
            String position = (String) managerData.get("position");
            String roles = (String) managerData.get("roles");
            String maPassword = (String) managerData.get("maPassword");
            
            if (maFullName == null || maFullName.trim().isEmpty()) {
                Map<String, Object> error = new HashMap<>();
                error.put("error", "Họ và tên quản lý không được để trống");
                return ResponseEntity.badRequest().body(error);
            }
            
            if (maEmail == null || maEmail.trim().isEmpty()) {
                Map<String, Object> error = new HashMap<>();
                error.put("error", "Email không được để trống");
                return ResponseEntity.badRequest().body(error);
            }
            
            if (maPhone == null || maPhone.trim().isEmpty()) {
                Map<String, Object> error = new HashMap<>();
                error.put("error", "Số điện thoại không được để trống");
                return ResponseEntity.badRequest().body(error);
            }
            
            // Kiểm tra quản lý có tồn tại không
            Optional<Manager> existingManagerOpt = managerRepository.findById(maId);
            if (existingManagerOpt.isEmpty()) {
                Map<String, Object> error = new HashMap<>();
                error.put("error", "Không tìm thấy quản lý với ID: " + maId);
                return ResponseEntity.notFound().build();
            }
            
            Manager existingManager = existingManagerOpt.get();
            
            // Kiểm tra email đã tồn tại chưa (trừ quản lý hiện tại)
            Optional<Manager> emailCheck = managerRepository.findByMaEmail(maEmail);
            if (emailCheck.isPresent() && !emailCheck.get().getMaId().equals(maId)) {
                Map<String, Object> error = new HashMap<>();
                error.put("error", "Email đã được sử dụng bởi quản lý khác");
                return ResponseEntity.badRequest().body(error);
            }
            
            // Cập nhật thông tin quản lý
            existingManager.setMaFullName(maFullName.trim());
            existingManager.setMaEmail(maEmail.trim());
            existingManager.setMaPhone(maPhone.trim());
            existingManager.setPosition(position != null ? position.trim() : null);
            existingManager.setRoles(roles != null ? roles.trim() : "manager");
            
            // Cập nhật mật khẩu nếu có (mã hóa bằng BCrypt)
            if (maPassword != null && !maPassword.trim().isEmpty()) {
                String encodedPassword = passwordEncoder.encode(maPassword.trim());
                existingManager.setMaPassword(encodedPassword);
            }
            
            Manager updatedManager = managerRepository.save(existingManager);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Cập nhật quản lý thành công");
            response.put("managerId", updatedManager.getMaId());
            response.put("managerName", updatedManager.getMaFullName());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Lỗi khi cập nhật quản lý: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
} 