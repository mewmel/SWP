package com.example.project.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.project.entity.BookingRevenueDetail;

@Repository
public interface BookingRevenueDetailRepository extends JpaRepository<BookingRevenueDetail, Integer> {
    
    // Tìm tất cả detail theo bookId
    List<BookingRevenueDetail> findByBookId(Integer bookId);
    
    // Tìm detail theo service ID
    List<BookingRevenueDetail> findBySerId(Integer serId);
    
    // Tìm detail theo sub-service ID
    List<BookingRevenueDetail> findBySubId(Integer subId);
    
}
