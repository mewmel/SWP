package com.example.project.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.project.entity.Manager;

public interface ManagerRepository extends JpaRepository<Manager, Integer> {
    Optional<Manager> findByMaEmail(String maEmail);
}