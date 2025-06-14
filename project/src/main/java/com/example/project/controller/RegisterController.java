package com.example.project.controller;

import com.example.project.dto.RegisterRequest;
import com.example.project.service.CustomerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class RegisterController {
    @Autowired
    private CustomerService customerService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest req) {
        // Gọi service để kiểm tra và đăng ký
        String result = customerService.register(req);
        if ("success".equals(result)) {
            return ResponseEntity.ok("Đăng ký thành công!");
        } else if ("email_exists".equals(result)) {
            // Email đã tồn tại, trả về mã lỗi và thông báo rõ ràng
            return ResponseEntity.status(409).body("Email đã tồn tại");
        } else {
            // Lỗi khác (ví dụ thiếu thông tin, mật khẩu không khớp, ...)
            return ResponseEntity.badRequest().body(result);
        }
    }
}