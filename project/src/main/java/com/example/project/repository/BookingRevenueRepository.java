package com.example.project.repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.project.entity.BookingRevenue;

@Repository
public interface BookingRevenueRepository extends JpaRepository<BookingRevenue, Integer> {
    
    // Tìm revenue theo bookId (trả về Optional vì mỗi booking chỉ có 1 revenue)
    Optional<BookingRevenue> findByBookId(Integer bookId);
    
    // Tìm tất cả revenue theo bookId (trả về List để phòng trường hợp có nhiều)
    List<BookingRevenue> findAllByBookId(Integer bookId);
    
    // Tính tổng doanh thu thành công
    @Query("SELECT SUM(br.totalAmount) FROM BookingRevenue br WHERE br.revenueStatus = 'success'")
    BigDecimal getTotalRevenue();
    
    // Tính doanh thu theo từng bác sĩ
    @Query("SELECT b.docId, SUM(br.totalAmount) FROM BookingRevenue br " +
           "JOIN Booking b ON br.bookId = b.bookId " +
           "WHERE br.revenueStatus = 'success' " +
           "GROUP BY b.docId")
    List<Object[]> getRevenueByDoctor();
    
    // Tính doanh thu theo bác sĩ cụ thể
    @Query("SELECT SUM(br.totalAmount) FROM BookingRevenue br " +
           "JOIN Booking b ON br.bookId = b.bookId " +
           "WHERE br.revenueStatus = 'success' AND b.docId = :docId")
    BigDecimal getRevenueByDoctorId(@Param("docId") Integer docId);
    
    // Tính doanh thu theo tháng trong 12 tháng gần nhất
    @Query("SELECT YEAR(br.createdAt) as year, MONTH(br.createdAt) as month, " +
           "SUM(br.totalAmount) as revenue " +
           "FROM BookingRevenue br " +
           "WHERE br.revenueStatus = 'success' " +
           "AND br.createdAt >= :startDate " +
           "GROUP BY YEAR(br.createdAt), MONTH(br.createdAt) " +
           "ORDER BY year, month")
    List<Object[]> getMonthlyRevenue(@Param("startDate") java.time.LocalDateTime startDate);
}
