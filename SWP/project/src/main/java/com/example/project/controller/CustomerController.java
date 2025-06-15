package com.example.project.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.project.dto.CustomerUpdateRequest;
import com.example.project.entity.Customer;
import com.example.project.repository.CustomerRepository;

@RestController
@RequestMapping("/api/customer")
@CrossOrigin // Cho phép truy cập từ front-end
public class CustomerController {

    @Autowired
    private CustomerRepository customerRepository;

    // API lấy thông tin theo email (bổ sung)
    @GetMapping("/{email}")
    public Customer getCustomerByEmail(@PathVariable String email) {
        return customerRepository.findByCusEmail(email).orElse(null);
    }

     @PutMapping("/update")
    public ResponseEntity<?> updateProfile(@RequestBody CustomerUpdateRequest req) {
        String result = customerService.updateProfile(req);
        if ("success".equals(result)) {
            return ResponseEntity.ok("Cập nhật thành công!");
        }
        return ResponseEntity.badRequest().body(result);
    }

    
}