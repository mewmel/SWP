package com.example.demo.controller;

import com.example.demo.Service.CustomerService;
import com.example.demo.dto.LoginRequest;
import com.example.demo.entity.Customer;
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
            // You may want to return a DTO instead of the entity for security
            return ResponseEntity.ok(customer.get());
        } else {
            return ResponseEntity.status(401).body("Invalid email or password, or account is inactive.");
        }
    }
}