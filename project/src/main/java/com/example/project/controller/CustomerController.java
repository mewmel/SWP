package com.example.project.controller;

import com.example.project.entity.Customer;
import com.example.project.repository.CustomerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

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
}