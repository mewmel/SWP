package com.example.project.repository;

import com.example.project.entity.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DoctorRepository extends JpaRepository<Doctor, Integer> {
    // Có thể bổ sung các phương thức tìm kiếm nếu muốn
}