package com.example.project.repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import com.example.project.entity.BookingStep;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
;

public interface BookingStepRepository extends JpaRepository<BookingStep, Integer> {
    List<BookingStep> findByBookId(Integer bookId);
    // Nếu performedAt là LocalDateTime
    List<BookingStep> findByPerformedAtBetween(LocalDateTime start, LocalDateTime end);

    @Query("SELECT s FROM BookingStep s JOIN Booking b ON s.bookId = b.bookId WHERE b.cusId = :cusId")
    List<BookingStep> findByCusId(@Param("cusId") Integer cusId);
}