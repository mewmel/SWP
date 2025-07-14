package com.example.project.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.project.entity.Drug;


public interface DrugRepository extends JpaRepository<Drug, Integer> {
    Optional<Drug> findByBookId(Integer bookId);
}
