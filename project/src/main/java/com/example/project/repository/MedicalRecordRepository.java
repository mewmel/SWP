package com.example.project.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.project.entity.MedicalRecord;

public interface MedicalRecordRepository extends JpaRepository<MedicalRecord, Integer> {
    // Tìm MedicalRecord theo ID của Customer
    Optional<MedicalRecord> findByCusId(Integer cusId);


    // Lấy hồ sơ bệnh án mới nhất của 1 customer theo ngày tạo giảm dần
    Optional<MedicalRecord> findTopByCusIdOrderByCreatedAtDesc(Integer cusId);
    boolean existsByCusIdAndSerId(Integer cusId, Integer serId);
}