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
    @Query(value = """
        SELECT 
            b.bookId,
            b.createdAt,
            s.serName,
            ISNULL(STUFF((
                SELECT ', ' + ss2.subName
                FROM BookingStep bs2
                JOIN SubService ss2 ON bs2.subId = ss2.subId
                WHERE bs2.bookId = b.bookId
                FOR XML PATH(''), TYPE).value('.', 'NVARCHAR(MAX)'), 1, 2, ''), '') AS subServices
        FROM Booking b
        JOIN Service s ON b.serId = s.serId
        WHERE b.cusId = :cusId
          AND b.bookStatus = 'completed'
        ORDER BY b.createdAt DESC
        """, nativeQuery = true)
    List<Object[]> findCompletedBookingHistory(@Param("cusId") Integer cusId);
    // Lấy booking theo ID
    Optional<Booking> findByBookId(Integer id);

    // Lấy booking theo khách hàng, sắp xếp theo ID giảm dần
    List<Booking> findByCusIdOrderByBookIdDesc(Integer cusId);

    // Lấy booking theo bác sĩ, sắp xếp theo ngày và giờ
    List<Booking> findByDocIdOrderByCreatedAt(Integer docId);

    // Lấy booking theo bác sĩ và trạng thái
    List<Booking> findByDocIdAndBookStatusOrderByBookId(Integer docId, String bookStatus);

    // Lấy booking theo bác sĩ và ngày
    List<Booking> findByDocIdAndCreatedAt(Integer docId, LocalDate createdAt);

    // Đếm số booking theo trạng thái
    long countByDocIdAndBookStatus(Integer docId, String bookStatus);

    // Thêm method để lấy booking theo customer và status
    List<Booking> findByCusIdAndBookStatusOrderByCreatedAtDesc(Integer cusId, String bookStatus);

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
          "JOIN WorkSlot w ON b.slotId = w.slotId " +
          "WHERE b.docId = :docId " +
          "AND b.bookStatus IN ('pending', 'confirmed', 'completed') " +
          "AND w.workDate = :today")
    List<Booking> findBookingsToday(
        @Param("docId") Integer docId,
        @Param("today") LocalDate today
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

    // Query lấy tất cả booking của customer với thông tin WorkSlot (cả lần đầu và tái khám)
    @Query(value = """
        SELECT 
            b.bookId,
            b.bookType,
            b.bookStatus,
            b.note,
            s.serName,
            d.docFullName,
            w.workDate,
            w.startTime,
            w.endTime,
            b.createdAt
        FROM Booking b
        JOIN WorkSlot w ON b.slotId = w.slotId
        JOIN Service s ON b.serId = s.serId
        JOIN Doctor d ON b.docId = d.docId
        WHERE b.cusId = :cusId 
        AND b.bookStatus IN ('pending', 'confirmed', 'completed')
        ORDER BY w.workDate ASC, w.startTime ASC
        """, nativeQuery = true)
    List<Object[]> findAllBookingsWithWorkSlot(@Param("cusId") Integer cusId);

    // Query lấy booking history với SubService info
    @Query(value = """
        SELECT 
            b.bookId,
            b.bookType,
            b.bookStatus,
            b.note,
            s.serName,
            d.docFullName,
            w.workDate,
            w.startTime,
            w.endTime,
            b.createdAt,
            STRING_AGG(sub.subName, ', ') as subServices
        FROM Booking b
        JOIN WorkSlot w ON b.slotId = w.slotId
        JOIN Service s ON b.serId = s.serId
        JOIN Doctor d ON b.docId = d.docId
        LEFT JOIN BookingStep bs ON b.bookId = bs.bookId
        LEFT JOIN SubService sub ON bs.subId = sub.subId
        WHERE b.cusId = :cusId 
        AND b.bookStatus IN ('pending', 'confirmed', 'completed')
        GROUP BY b.bookId, b.bookType, b.bookStatus, b.note, s.serName, 
                 d.docFullName, w.workDate, w.startTime, w.endTime, b.createdAt
        ORDER BY w.workDate ASC, w.startTime ASC
        """, nativeQuery = true)
    List<Object[]> findAllBookingsWithSubServices(@Param("cusId") Integer cusId);


}