package com.example.project.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.project.dto.BookingWithSlot;
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


        @Query("SELECT new com.example.project.dto.BookingWithSlot(b.bookId, b.cusId, b.docId, b.bookType, b.bookStatus, b.createdAt, b.note, w.workDate, w.startTime, w.endTime) " +
       "FROM Booking b JOIN WorkSlot w ON b.slotId = w.slotId " +
       "WHERE b.docId = :docId AND b.bookStatus = :status AND w.workDate = :today")
        List<BookingWithSlot> findBookingWithSlotByDocIdAndBookStatusAndWorkDate(
                @Param("docId") Integer docId,
                @Param("status") String status,
                @Param("today") LocalDate today
);

}