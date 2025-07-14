package com.example.project.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.project.entity.BookingStep;

public interface BookingStepRepository extends JpaRepository<BookingStep, Integer> {
    List<BookingStep> findByBookId(Integer bookId);

    // Nếu performedAt là LocalDateTime
    List<BookingStep> findByPerformedAtBetween(LocalDateTime start, LocalDateTime end);

    @Query("SELECT s FROM BookingStep s JOIN Booking b ON s.bookId = b.bookId WHERE b.cusId = :cusId")
    List<BookingStep> findByCusId(@Param("cusId") Integer cusId);    

@Query(value = "SELECT bs.bookingStepId, bs.subId, ss.subName, bs.result, bs.note, bs.drugId, bs.stepStatus " +
        "FROM BookingStep bs JOIN SubService ss ON bs.subId = ss.subId " +
        "WHERE bs.bookId = :bookId AND bs.stepStatus = 'inactive'", nativeQuery = true)
List<Object[]> findInactiveStepDTOByBookId(@Param("bookId") Integer bookId);

@Query(
  value = "SELECT bs.* FROM BookingStep bs " +
          "JOIN SubService ss ON bs.subId = ss.subId " +
          "WHERE bs.bookId = :bookId AND ss.subId = :subId",
  nativeQuery = true
)
Optional<BookingStep> findByBookIdAndSubId(@Param("bookId") Integer bookId, @Param("subId") Integer subId);






}