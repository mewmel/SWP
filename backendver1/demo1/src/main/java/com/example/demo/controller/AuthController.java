package com.example.demo.controller;

import com.example.demo.Service.CustomerService;
import com.example.demo.dto.LoginRequest;
import com.example.demo.dto.RegisterRequest;
import com.example.demo.entity.Customer;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
public class AuthController {
//    private final CustomerService customerService;
//
//    public AuthController(CustomerService customerService) {
//        this.customerService = customerService;
//    }
//
//    @PostMapping("/login1")
//    public ResponseEntity<?> login(@RequestBody LoginRequest dto) {
//        Customer customer = customerService.login(dto.getEmail(), dto.getPassword());
//        if (customer == null) {
//            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Sai tài khoản hoặc mật khẩu");
//        }
//        return ResponseEntity.ok(customer);
//    }
//
//    @PostMapping("/register1")
//    public ResponseEntity<?> register(@RequestBody RegisterRequest dto){
//        try {
//            Customer created = customerService.register(dto);
//            return ResponseEntity.ok(created);
//        } catch (RuntimeException ex) {
//            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
//        }
//    }
}
