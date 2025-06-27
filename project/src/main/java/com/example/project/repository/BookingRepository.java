package com.example.project.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.project.dto.BookingWithSlotAndCus;
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

@Query("""
  SELECT b 
  FROM Booking b 
  WHERE b.cusId = :cusId 
    AND b.bookStatus IN :statuses 
  ORDER BY b.createdAt DESC
""")
Optional<Booking> findLatestBooking(
  @Param("cusId") Integer cusId,
  @Param("statuses") List<String> statuses
);

@Query("SELECT new com.example.project.dto.BookingWithSlotAndCus(b.bookId, b.cusId, c.cusFullName, b.docId, b.bookType, b.bookStatus, b.createdAt, b.note, w.workDate, w.startTime, w.endTime) " +
       "FROM Booking b " +
       "JOIN WorkSlot w ON b.slotId = w.slotId " +
       "JOIN Customer c ON b.cusId = c.cusId " +
       "WHERE b.docId = :docId AND b.bookStatus = :status AND w.workDate = :today")
        List<BookingWithSlotAndCus> findBookingWithSlotByDocIdAndBookStatusAndWorkDate(
                @Param("docId") Integer docId,
                @Param("status") String status,
                @Param("today") LocalDate today
);



}