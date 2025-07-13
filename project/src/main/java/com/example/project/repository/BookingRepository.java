package com.example.project.repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.project.dto.BookingPatientService;
import com.example.project.entity.Booking;


@Repository
public interface BookingRepository extends JpaRepository<Booking, Integer> {
    List<Booking> findByCusIdOrderByBookIdDesc(Integer cusId);

    // Lấy booking theo bác sĩ, sắp xếp theo ngày và giờ
    List<Booking> findByDocIdOrderByCreatedAt(Integer docId);

    // Lấy booking theo bác sĩ và trạng thái
    List<Booking> findByDocIdAndBookStatusOrderByBookId(Integer docId, String bookStatus);

    // Lấy booking theo bác sĩ và ngày
    List<Booking> findByDocIdAndCreatedAt(Integer docId, LocalDate createdAt);

    // Đếm số booking theo trạng thái
    long countByDocIdAndBookStatus(Integer docId, String bookStatus);

    List<Booking> findByCusIdOrderByBookIdAsc(Integer cusId);

    int countBySlotIdAndBookStatusIn(Integer slotId, List<String> status);



    @Query("""
      SELECT b 
      FROM Booking b 
      WHERE b.cusId = :cusId 
        AND b.bookStatus IN :bookStatus 
      ORDER BY b.bookId DESC
    """)
    Optional<Booking> findLatestBooking(
      @Param("cusId") Integer cusId,
      @Param("bookStatus") List<String> bookStatus
    );

    @Query("SELECT b FROM Booking b " +
          "WHERE b.docId = :docId " +
          "AND b.bookStatus IN ('pending', 'confirmed', 'completed') " +
          "AND b.createdAt BETWEEN :startOfDay AND :endOfDay")
    List<Booking> findBookingsToday(
        @Param("docId") Integer docId,
        @Param("startOfDay") LocalDateTime startOfDay,
        @Param("endOfDay") LocalDateTime endOfDay
    );


@Query("""
SELECT new com.example.project.dto.BookingPatientService(
    b.bookId,
    c.cusFullName,
    c.cusPhone,
    c.cusEmail,
    s.serName,
    w.startTime       
)
FROM Booking b
JOIN Customer c ON b.cusId = c.cusId
JOIN Service s ON b.serId = s.serId
JOIN WorkSlot w ON b.slotId = w.slotId
WHERE b.bookId = :bookId
""")
BookingPatientService findBookingPatientServiceByBookId(@Param("bookId") Integer bookId);



}