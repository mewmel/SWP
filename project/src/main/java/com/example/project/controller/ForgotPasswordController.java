package com.example.project.controller;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import com.example.project.entity.Customer;
import com.example.project.repository.CustomerRepository;
import com.example.project.service.OtpService;

@RestController
@RequestMapping("/api/forgot-password")
public class ForgotPasswordController {

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private OtpService otpService;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    /**
     * API gửi OTP cho quên mật khẩu
     * POST /api/forgot-password/send-otp
     */
    @PostMapping("/send-otp")
    public ResponseEntity<Map<String, Object>> sendOtp(@RequestBody Map<String, String> request) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            String email = request.get("email");
            String newPassword = request.get("newPassword");
            
            if (email == null || email.trim().isEmpty()) {
                response.put("success", false);
                response.put("message", "Email không được để trống!");
                return ResponseEntity.badRequest().body(response);
            }

            if (newPassword == null || newPassword.trim().isEmpty()) {
                response.put("success", false);
                response.put("message", "Mật khẩu mới không được để trống!");
                return ResponseEntity.badRequest().body(response);
            }

            if (newPassword.length() < 6) {
                response.put("success", false);
                response.put("message", "Mật khẩu phải có ít nhất 6 ký tự!");
                return ResponseEntity.badRequest().body(response);
            }

            // Kiểm tra email có tồn tại trong database không
            Optional<Customer> customerOpt = customerRepository.findByCusEmail(email.trim());
            if (!customerOpt.isPresent()) {
                response.put("success", false);
                response.put("message", "Email không tồn tại trong hệ thống!");
                return ResponseEntity.badRequest().body(response);
            }

            Customer customer = customerOpt.get();
            
            // Gửi OTP
            otpService.sendOtp(customer.getCusId(), email);
            
            response.put("success", true);
            response.put("message", "Mã OTP đã được gửi đến email của bạn!");
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            e.printStackTrace();
            response.put("success", false);
            response.put("message", "Lỗi khi gửi OTP: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    /**
     * API đặt lại mật khẩu với OTP
     * POST /api/forgot-password/reset-password
     */
    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, Object>> resetPassword(@RequestBody Map<String, String> request) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            String email = request.get("email");
            String newPassword = request.get("newPassword");
            String otp = request.get("otp");
            
            // Validation
            if (email == null || email.trim().isEmpty()) {
                response.put("success", false);
                response.put("message", "Email không được để trống!");
                return ResponseEntity.badRequest().body(response);
            }
            
            if (newPassword == null || newPassword.trim().isEmpty()) {
                response.put("success", false);
                response.put("message", "Mật khẩu mới không được để trống!");
                return ResponseEntity.badRequest().body(response);
            }
            
            if (newPassword.length() < 6) {
                response.put("success", false);
                response.put("message", "Mật khẩu phải có ít nhất 6 ký tự!");
                return ResponseEntity.badRequest().body(response);
            }
            
            if (otp == null || otp.trim().isEmpty()) {
                response.put("success", false);
                response.put("message", "Mã OTP không được để trống!");
                return ResponseEntity.badRequest().body(response);
            }
            
            if (!otp.matches("\\d{6}")) {
                response.put("success", false);
                response.put("message", "Mã OTP phải là 6 chữ số!");
                return ResponseEntity.badRequest().body(response);
            }

            // Tìm customer theo email
            Optional<Customer> customerOpt = customerRepository.findByCusEmail(email.trim());
            if (!customerOpt.isPresent()) {
                response.put("success", false);
                response.put("message", "Email không tồn tại trong hệ thống!");
                return ResponseEntity.badRequest().body(response);
            }

            Customer customer = customerOpt.get();
            
            // Xác thực OTP
            if (!otpService.verifyOtp(customer.getCusId(), otp.trim())) {
                response.put("success", false);
                response.put("message", "Mã OTP không hợp lệ hoặc đã hết hạn!");
                return ResponseEntity.badRequest().body(response);
            }
            
            // Cập nhật mật khẩu mới
            customer.setCusPassword(passwordEncoder.encode(newPassword.trim()));
            customerRepository.save(customer);
            
            response.put("success", true);
            response.put("message", "Đặt lại mật khẩu thành công! Bạn có thể đăng nhập với mật khẩu mới.");
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            e.printStackTrace();
            response.put("success", false);
            response.put("message", "Lỗi khi đặt lại mật khẩu: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    /**
     * API test để kiểm tra server có hoạt động không
     * GET /api/forgot-password/test
     */
    @GetMapping("/test")
    public ResponseEntity<Map<String, Object>> test() {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Server is running!");
        response.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.ok(response);
    }


} 