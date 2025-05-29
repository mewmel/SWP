package com.example.demo.repository;

import com.example.demo.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {
    Customer findByUsernameAndPassword(String username, String password);
    Optional<Customer> findByCusEmailAndCusPassword(String email, String password);
    Optional<Customer> findByCusEmail(String email);
}
