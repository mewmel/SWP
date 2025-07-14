package com.example.project.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.project.dto.ChangePasswordRequest;
import com.example.project.dto.VerifyPasswordRequest;
import com.example.project.service.CustomerService;


@RestController
@RequestMapping("/api/auth")

public class ChangePasswordController {

    @Autowired
    private CustomerService customerService;

    // API verify mật khẩu hiện tại
    @PostMapping("/{id}/verify-cus-password")
    public ResponseEntity<String> verifyPassword(@PathVariable Integer id, @RequestBody VerifyPasswordRequest request) {
        String currentPassword = request.getCurrentPassword();

        if (currentPassword == null || currentPassword.isEmpty()) {
            return ResponseEntity.badRequest().body("Vui lòng nhập mật khẩu hiện tại!");
        }

        boolean isValid = customerService.verifyCurrentPassword(id, currentPassword);
        
        if (isValid) {
            return ResponseEntity.ok("Mật khẩu đúng!");
        } else {
            return ResponseEntity.badRequest().body("Mật khẩu hiện tại không đúng!");
        }
    }

    // API đổi mật khẩu
    @PutMapping("/{email}/change-cus-password")
    public ResponseEntity<String> changePassword(@PathVariable String email, @RequestBody ChangePasswordRequest request) {
        String currentPassword = request.getCurrentPassword();
        String newPassword = request.getNewPassword();
        String otp = request.getOtp();

    if (currentPassword == null) {
        return ResponseEntity
            .badRequest()
            .body("Thiếu mật khẩu hiện tại!");
    }

    // 1. Gọi service; nếu otp == null thì service sẽ gửi mail và trả "OTP_SENT"
    String result = customerService.changeCusPassword(
        email, currentPassword, newPassword, otp
    );

    // 2. Đáp lại tuỳ theo kết quả
    if ("OTP_SENT".equals(result)) {
        return ResponseEntity.ok("OTP_SENT");
    }
        if ("success".equals(result)) {
            return ResponseEntity.ok("Đổi mật khẩu thành công!");
        } else {
            return ResponseEntity.badRequest().body(result);
        }
    }



}