package com.example.project.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.project.entity.Booking;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Integer> {
    List<Booking> findByCusIdOrderByCreatedAt(Integer cusId);

    // Lấy booking theo bác sĩ, sắp xếp theo ngày và giờ
    List<Booking> findByDocIdOrderByCreatedAt(Integer docId);

    // Lấy booking theo bác sĩ và trạng thái
    List<Booking> findByDocIdAndBookStatusOrderByCreatedAt(Integer docId, String bookStatus);

    // Lấy booking theo bác sĩ và ngày
    List<Booking> findByDocIdAndCreatedAt(Integer docId, LocalDate createdAt);

    // Đếm số booking theo trạng thái
    long countByDocIdAndBookStatus(Integer docId, String bookStatus);

    List<Booking> findByCusIdOrderByCreatedAtDesc(Integer cusId);

}