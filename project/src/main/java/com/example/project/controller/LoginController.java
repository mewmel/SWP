package com.example.project.controller;

import com.example.project.Service.CustomerService;
import com.example.project.dto.LoginRequest;
import com.example.project.entity.Customer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class LoginController {
    @Autowired
    private CustomerService customerService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        Optional<Customer> customer = customerService.login(request);
        if (customer.isPresent()) {
            return ResponseEntity.ok(customer.get()); // status 200
        } else {
            return ResponseEntity.status(401).body("Invalid email or password, or account is inactive.");
        }
    }
}