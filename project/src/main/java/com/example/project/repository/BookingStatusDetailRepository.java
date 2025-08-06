package com.example.project.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.project.entity.BookingStatusDetail;

@Repository
public interface BookingStatusDetailRepository extends JpaRepository<BookingStatusDetail, Integer> {
    
    Optional<BookingStatusDetail> findByBookId(Integer bookId);
    
    boolean existsByBookId(Integer bookId);
}
