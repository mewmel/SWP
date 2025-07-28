package com.example.project.repository;


import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.project.entity.DrugItem;

public interface DrugItemRepository extends JpaRepository<DrugItem, Integer> {
    List<DrugItem> findByDrugId(Integer drugId);
}