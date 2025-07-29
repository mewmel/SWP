package com.example.project.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.project.entity.Service;

public interface ServiceRepository extends JpaRepository<Service, Integer> {
    Optional<Service> findBySerId(Integer serId);
}