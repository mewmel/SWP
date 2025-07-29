package com.example.project.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.project.entity.Doctor;

public interface DoctorRepository extends JpaRepository<Doctor, Integer>{
   Optional<Doctor> findByDocEmail(String docEmail);
   Optional<Doctor> findByDocId(Integer docId);
}