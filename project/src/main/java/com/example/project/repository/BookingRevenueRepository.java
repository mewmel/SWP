package com.example.project.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.project.entity.BookingRevenue;

@Repository
public interface BookingRevenueRepository extends JpaRepository<BookingRevenue, Integer> {
    
    // Tìm revenue theo bookId
    Optional<BookingRevenue> findByBookId(Integer bookId);
    

}
