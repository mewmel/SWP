package com.example.project.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.project.entity.Doctor;

public interface DoctorRepository extends JpaRepository<Doctor, Integer> {
    // Có thể bổ sung các phương thức tìm kiếm nếu muốn

}