package com.example.demo.Service;

import com.example.demo.dto.RegisterRequest;
import com.example.demo.entity.Customer;
import com.example.demo.repository.CustomerRepository;
import org.springframework.stereotype.Service;

@Service
public class CustomerService {
    private final CustomerRepository customerRepository;

    public CustomerService(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    public Customer login(String email, String password) {
        return customerRepository.findByCusEmailAndCusPassword(email, password).orElse(null);
    }

    public Customer register(RegisterRequest dto) {
        if (customerRepository.findByCusEmail(dto.getEmail()).isPresent()) {
            throw new RuntimeException("Email đã tồn tại");
        }

        Customer customer = new Customer();
        customer.setCusFullName(dto.getFullName());
        customer.setCusGender(dto.getGender());
        customer.setCusDate(dto.getDob());
        customer.setCusEmail(dto.getEmail());
        customer.setCusPhone(dto.getPhone());
        customer.setCusPassword(dto.getPassword());
        customer.setCusAddress(dto.getAddress());
        customer.setCusStatus(true); // mặc định active

        return customerRepository.save(customer);
    }
}
