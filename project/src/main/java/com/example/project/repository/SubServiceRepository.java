package com.example.project.repository;

import com.example.project.entity.SubService;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SubServiceRepository extends JpaRepository<SubService, Integer> {
    List<SubService> findBySerId(Integer serId);
}