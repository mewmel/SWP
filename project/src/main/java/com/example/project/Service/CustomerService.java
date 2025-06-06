package com.example.project.Service;

import com.example.project.dto.LoginRequest;
import com.example.project.entity.Customer;
import com.example.project.repository.CustomerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class CustomerService {
    @Autowired
    private CustomerRepository customerRepository;

    public Optional<Customer> login(LoginRequest request) {
        Optional<Customer> customerOpt = customerRepository.findByCusEmail(request.getCusEmail());
        if (customerOpt.isPresent()) {
            Customer customer = customerOpt.get();
            // Chỉ kiểm tra mật khẩu
            if (customer.getCusPassword().equals(request.getCusPassword())) {
                return Optional.of(customer);
            }
        }
        return Optional.empty();
    }
}