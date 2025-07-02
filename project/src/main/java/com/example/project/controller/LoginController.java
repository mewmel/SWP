package com.example.project.controller;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.project.dto.LoginRequest;
import com.example.project.entity.Customer;
import com.example.project.entity.Doctor;
import com.example.project.entity.Manager;
import com.example.project.service.CustomerService;
import com.example.project.service.DoctorManagementService;
import com.example.project.service.ManagerService;

@RestController
@RequestMapping("/api/auth")
public class LoginController {
    @Autowired
    private CustomerService customerService;

    @Autowired
    private DoctorManagementService doctorService; 
    
    @Autowired
    private ManagerService managerService; 

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        String email = request.getCusEmail();
        String password = request.getCusPassword();
        
        // 1. Kiểm tra trong bảng Customer trước
        Optional<Customer> customer = customerService.login(request);
        if (customer.isPresent()) {
            return ResponseEntity.ok(customer.get());
        }
        
        // 2. Kiểm tra trong bảng Doctor
        Optional<Doctor> doctor = doctorService.login(email, password);
        if (doctor.isPresent()) {
            return ResponseEntity.ok(doctor.get());
        }
        
        // 3. Kiểm tra trong bảng Manager
        Optional<Manager> manager = managerService.login(email, password);
        if (manager.isPresent()) {
            return ResponseEntity.ok(manager.get());
        }
        
        // Không tìm thấy trong bảng nào
        return ResponseEntity.status(401).body("Invalid email or password, or account is inactive.");
    }
}