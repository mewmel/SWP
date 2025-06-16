package com.example.project.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.project.entity.Customer;

public interface CustomerRepository extends JpaRepository<Customer, Integer> {
    Optional<Customer> findByCusEmail(String cusEmail);
    Optional<Customer> findByCusEmailAndCusProvider(String cusEmail, String cusProvider);
    Optional<Customer> findByCusId(Integer cusId);
}
