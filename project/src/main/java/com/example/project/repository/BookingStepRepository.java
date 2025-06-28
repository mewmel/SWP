package com.example.project.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.project.entity.BookingStep;

public interface BookingStepRepository extends JpaRepository<BookingStep, Integer> {
    List<BookingStep> findByBookId(Integer bookId);

@Query(value = "SELECT bs.bookingStepId, bs.subId, ss.subName, bs.result, bs.note, bs.drugId, bs.stepStatus " +
        "FROM BookingStep bs JOIN SubService ss ON bs.subId = ss.subId " +
        "WHERE bs.bookId = :bookId AND bs.stepStatus = 'inactive'", nativeQuery = true)
List<Object[]> findInactiveStepDTOByBookId(@Param("bookId") Integer bookId);

  @Query("""
    SELECT bs 
      FROM BookingStep bs
      JOIN FETCH bs.subService ss
     WHERE bs.bookId = :bookId
    """)
  List<BookingStep> findWithSubServiceByBookingId(@Param("bookId") Integer bookId);

}