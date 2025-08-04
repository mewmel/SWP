package com.example.project.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.project.entity.MedicalRecord;

public interface MedicalRecordRepository extends JpaRepository<MedicalRecord, Integer> {
    // Tìm MedicalRecord theo ID của Customer
    Optional<MedicalRecord> findByCusId(Integer cusId);

    @Query("SELECT m FROM MedicalRecord m WHERE m.cusId = :cusId AND m.recordStatus = 'active'")
    Optional<MedicalRecord> findActiveByCusId(@Param("cusId") Integer cusId);

    // Lấy hồ sơ bệnh án mới nhất của 1 customer theo ngày tạo giảm dần
    Optional<MedicalRecord> findTopByCusIdOrderByCreatedAtDesc(Integer cusId);

    // Kiểm tra xem customer đã có MedicalRecord cho dịch vụ cụ thể chưa
    boolean existsByCusIdAndSerId(Integer cusId, Integer serId);

    // Lấy tất cả MedicalRecord của doctor theo ngày tạo giảm dần
    List<MedicalRecord> findByDocIdOrderByCreatedAtDesc(Integer docId);

}