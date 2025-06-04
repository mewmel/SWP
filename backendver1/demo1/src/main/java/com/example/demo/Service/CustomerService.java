package com.example.demo.Service;

import com.example.demo.dto.LoginRequest;
import com.example.demo.entity.Customer;
import com.example.demo.repository.CustomerRepository;
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
            if (customer.getCusPassword().equals(request.getCusPassword()) && customer.isCusStatus()) {
                return Optional.of(customer);
            }
        }
        return Optional.empty();
    }
}