package com.example.project.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.project.entity.Feedback;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Integer> {
    
    // Tìm feedback theo customer ID
    List<Feedback> findByCusIdOrderByFeedbackDateDesc(Integer cusId);
    
    // Tìm feedback theo doctor ID
    List<Feedback> findByDocIdOrderByFeedbackDateDesc(Integer docId);
    
    // Kiểm tra customer đã feedback cho doctor và service chưa
    boolean existsByCusIdAndDocIdAndSerId(Integer cusId, Integer docId, Integer serId);
    
    // Lấy feedback với thông tin doctor và service name
    @Query("SELECT f.feedbackId, f.rating, f.comment, f.feedbackDate, " +
           "d.docFullName, s.serName " +
           "FROM Feedback f " +
           "JOIN Doctor d ON f.docId = d.docId " +
           "JOIN Service s ON f.serId = s.serId " +
           "WHERE f.cusId = :cusId " +
           "ORDER BY f.feedbackDate DESC")
    List<Object[]> findFeedbackHistoryByCusId(@Param("cusId") Integer cusId);
    
    // Lấy testimonials tốt nhất để hiển thị trên homepage
    @Query(value = "SELECT f.rating, f.comment, f.feedbackDate, " +
           "d.docFullName, s.serName, c.cusFullName " +
           "FROM Feedback f " +
           "JOIN Doctor d ON f.docId = d.docId " +
           "JOIN Service s ON f.serId = s.serId " +
           "JOIN Customer c ON f.cusId = c.cusId " +
           "WHERE f.rating >= 4 AND f.comment IS NOT NULL AND f.comment != '' " +
           "ORDER BY f.rating DESC, f.feedbackDate DESC", nativeQuery = true)
    List<Object[]> findTestimonialsForHomepage();
} 