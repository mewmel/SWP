package com.example.project.service;

import com.example.project.dto.LoginRequest;
import com.example.project.dto.RegisterRequest;
import com.example.project.entity.Customer;
import com.example.project.repository.CustomerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Optional;
import java.util.regex.Pattern;

@Service
public class CustomerService {
    @Autowired
    private CustomerRepository customerRepository;

    private BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public Optional<Customer> login(LoginRequest request) {
        Optional<Customer> customerOpt = customerRepository.findByCusEmail(request.getCusEmail());
        if (customerOpt.isPresent()) {
            Customer customer = customerOpt.get();
            if (passwordEncoder.matches(request.getCusPassword(), customer.getCusPassword())) {
                return Optional.of(customer);
            }
        }
        return Optional.empty();
    }

    public String register(RegisterRequest req) {
        // Validate
        if (req.getCusFullName() == null || req.getCusFullName().isEmpty()
                || req.getCusEmail() == null || req.getCusEmail().isEmpty()
                || req.getCusPassword() == null || req.getCusPassword().isEmpty()
                || req.getConfirmPassword() == null || req.getConfirmPassword().isEmpty()
                || req.getCusPhone() == null || req.getCusPhone().isEmpty()
                || req.getCusDob() == null || req.getCusDob().isEmpty()) {
            return "Vui lòng nhập đầy đủ tất cả các trường!";
        }
        if (!isValidEmail(req.getCusEmail())) {
            return "Email không hợp lệ!";
        }
        if (!isValidPhone(req.getCusPhone())) {
            return "Số điện thoại không hợp lệ!";
        }
        if (!req.getCusPassword().equals(req.getConfirmPassword())) {
            return "Mật khẩu xác nhận không khớp!";
        }
        if (customerRepository.findByCusEmail(req.getCusEmail()).isPresent()) {
            return "email_exists";
        }

        LocalDate dob = null;
        try {
            dob = LocalDate.parse(req.getCusDob());
        } catch (Exception ex) {
            return "Ngày sinh không hợp lệ!";
        }

        Customer customer = new Customer();
        customer.setCusFullName(req.getCusFullName());
        customer.setCusEmail(req.getCusEmail());
        customer.setCusPassword(passwordEncoder.encode(req.getCusPassword()));
        customer.setCusPhone(req.getCusPhone());
        customer.setCusDate(dob);
        customer.setCusGender(null);
        customer.setCusAddress(null);
        customer.setCusStatus("active"); // chỉ set là  "active" hoặc "inactive"

        customerRepository.save(customer);
        return "success";
    }

    private boolean isValidEmail(String email) {
        return Pattern.matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$", email);
    }
    private boolean isValidPhone(String phone) {
        return Pattern.matches("^(0|\\+84)\\d{9,10}$", phone);
    }

    public Customer findOrCreateGoogleUser(String email, String name) {
        Optional<Customer> customerOpt = customerRepository.findByCusEmail(email);
        if (customerOpt.isPresent()) {
            return customerOpt.get();
        } else {
            Customer customer = new Customer();
            customer.setCusFullName(name);
            customer.setCusEmail(email);
            customer.setCusStatus("active");
            customerRepository.save(customer);
            return customer;
        }
    }
}
