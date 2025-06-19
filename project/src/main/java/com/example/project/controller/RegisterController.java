package com.example.project.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.project.dto.RegisterRequest;
import com.example.project.service.CustomerService;

@RestController
@RequestMapping("/api/auth")
public class RegisterController {
    @Autowired
    private CustomerService customerService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest req) {
        // Gọi service để kiểm tra và đăng ký
        String result = customerService.register(req);
        if (null == result) {
            // Lỗi khác (ví dụ thiếu thông tin, mật khẩu không khớp, ...)
            return ResponseEntity.badRequest().body(result);
        } else return switch (result) {
            case "success" -> ResponseEntity.ok("Đăng ký thành công!");
            case "email_exists" -> ResponseEntity.status(409).body("Email đã tồn tại");
            default -> ResponseEntity.badRequest().body(result);
        }; // Email đã tồn tại, trả về mã lỗi và thông báo rõ ràng
        // Lỗi khác (ví dụ thiếu thông tin, mật khẩu không khớp, ...)
        
    }
}