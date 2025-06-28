package com.example.project.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.project.entity.SubService;

public interface SubServiceRepository extends JpaRepository<SubService, Integer> {
    List<SubService> findBySerId(Integer serId);
}