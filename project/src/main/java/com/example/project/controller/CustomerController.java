package com.example.project.controller;

import java.util.Optional;

import org.apache.commons.lang3.RandomStringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.project.dto.RegisterRequest;
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

@PutMapping("/{id}")
public ResponseEntity<Customer> updateCustomer(@PathVariable Integer id, @RequestBody Customer updatedData) {
    Optional<Customer> optional = customerRepository.findById(id);
    if (!optional.isPresent()) {
        return ResponseEntity.notFound().build();
    }

    Customer customer = optional.get();

    customer.setCusFullName(updatedData.getCusFullName());
    customer.setCusGender(updatedData.getCusGender());
    customer.setCusDate(updatedData.getCusDate());  
    customer.setCusPhone(updatedData.getCusPhone());
    customer.setCusAddress(updatedData.getCusAddress());        
    customer.setCusOccupation(updatedData.getCusOccupation());
    customer.setEmergencyContact(updatedData.getEmergencyContact());


    Customer saved = customerRepository.save(customer);
    return ResponseEntity.ok(saved);
}


    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody RegisterRequest req) {
        String email = req.getCusEmail();
        Optional<Customer> optCustomer = customerRepository.findByCusEmailAndCusProvider(email, "local");
        if (optCustomer.isEmpty()) {
            return ResponseEntity.badRequest().body("Email không tồn tại!");
    }
    Customer customer = optCustomer.get();
    // Tạo mật khẩu mới
    String rawPassword = RandomStringUtils.randomAlphanumeric(8);
    customer.setCusPassword(passwordEncoder.encode(rawPassword));
    customerRepository.save(customer);

    // Gửi email
    sendAccountEmail(customer.getCusEmail(), rawPassword);

    return ResponseEntity.ok("Đã gửi mật khẩu mới đến email của bạn.");
    }

}