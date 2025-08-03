package com.example.project.controller;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.project.entity.Doctor;
import com.example.project.entity.Feedback;
import com.example.project.repository.BookingRevenueRepository;
import com.example.project.repository.DoctorRepository;
import com.example.project.repository.FeedbackRepository;

@RestController
@RequestMapping("/api/stats")
public class StatsController {

    @Autowired
    private BookingRevenueRepository bookingRevenueRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private FeedbackRepository feedbackRepository;

    // ----------- API TỔNG DOANH THU -----------
    @GetMapping("/total-revenue")
    public ResponseEntity<?> getTotalRevenue() {
        try {
            BigDecimal totalRevenue = bookingRevenueRepository.getTotalRevenue();
            if (totalRevenue == null) {
                totalRevenue = BigDecimal.ZERO;
            }

            Map<String, Object> response = new HashMap<>();
            response.put("totalRevenue", totalRevenue);
            response.put("formattedTotalRevenue", formatCurrency(totalRevenue));

            return ResponseEntity.ok().body(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Lỗi khi tính tổng doanh thu");
        }
    }

    // ----------- API DOANH THU THEO BÁC SĨ -----------
    @GetMapping("/revenue-by-doctor")
    public ResponseEntity<?> getRevenueByDoctor() {
        try {
            List<Object[]> revenueByDoctor = bookingRevenueRepository.getRevenueByDoctor();
            Map<String, Object> response = new HashMap<>();
            
            for (Object[] result : revenueByDoctor) {
                Integer docId = (Integer) result[0];
                BigDecimal revenue = (BigDecimal) result[1];
                
                // Lấy thông tin bác sĩ
                Doctor doctor = doctorRepository.findById(docId).orElse(null);
                String doctorName = doctor != null ? doctor.getDocFullName() : "Bác sĩ không xác định";
                
                Map<String, Object> doctorRevenue = new HashMap<>();
                doctorRevenue.put("docId", docId);
                doctorRevenue.put("doctorName", doctorName);
                doctorRevenue.put("revenue", revenue);
                doctorRevenue.put("formattedRevenue", formatCurrency(revenue));
                
                response.put("doctor_" + docId, doctorRevenue);
            }

            return ResponseEntity.ok().body(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Lỗi khi tính doanh thu theo bác sĩ");
        }
    }

    // ----------- API DOANH THU THEO BÁC SĨ CỤ THỂ -----------
    @GetMapping("/revenue-by-doctor/{docId}")
    public ResponseEntity<?> getRevenueByDoctorId(@PathVariable Integer docId) {
        try {
            BigDecimal revenue = bookingRevenueRepository.getRevenueByDoctorId(docId);
            if (revenue == null) {
                revenue = BigDecimal.ZERO;
            }

            Doctor doctor = doctorRepository.findById(docId).orElse(null);
            String doctorName = doctor != null ? doctor.getDocFullName() : "Bác sĩ không xác định";

            Map<String, Object> response = new HashMap<>();
            response.put("docId", docId);
            response.put("doctorName", doctorName);
            response.put("revenue", revenue);
            response.put("formattedRevenue", formatCurrency(revenue));

            return ResponseEntity.ok().body(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Lỗi khi tính doanh thu cho bác sĩ");
        }
    }

    // ----------- API RATING TRUNG BÌNH TỔNG THỂ -----------
    @GetMapping("/average-rating")
    public ResponseEntity<?> getAverageRating() {
        try {
            // Lấy tất cả feedback
            List<Feedback> allFeedbacks = feedbackRepository.findAll();
            
            if (allFeedbacks.isEmpty()) {
                Map<String, Object> response = new HashMap<>();
                response.put("averageRating", 0.0);
                response.put("totalFeedbacks", 0);
                response.put("formattedRating", "0.0");
                return ResponseEntity.ok().body(response);
            }
            
            // Tính rating trung bình
            double totalRating = allFeedbacks.stream().mapToInt(Feedback::getRating).sum();
            double averageRating = totalRating / allFeedbacks.size();
            averageRating = Math.round(averageRating * 10.0) / 10.0; // Làm tròn 1 chữ số thập phân
            
            String formattedRating = String.format("%.1f", averageRating);
            
            Map<String, Object> response = new HashMap<>();
            response.put("averageRating", averageRating);
            response.put("totalFeedbacks", allFeedbacks.size());
            response.put("formattedRating", formattedRating);
            
            return ResponseEntity.ok().body(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Lỗi khi tính rating trung bình");
        }
    }

    // ----------- API DOANH THU THEO THỜI GIAN -----------
    @GetMapping("/revenue-trend")
    public ResponseEntity<?> getRevenueTrend() {
        try {
            // Tính ngày bắt đầu (11 tháng trước)
            java.time.LocalDateTime startDate = java.time.LocalDateTime.now().minusMonths(11);
            
            // Lấy doanh thu theo tháng trong 12 tháng gần nhất
            List<Object[]> monthlyRevenue = bookingRevenueRepository.getMonthlyRevenue(startDate);
            
            // Convert to simple format for frontend
            List<Map<String, Object>> formattedData = new ArrayList<>();
            for (Object[] row : monthlyRevenue) {
                Map<String, Object> monthData = new HashMap<>();
                monthData.put("year", row[0]);
                monthData.put("month", row[1]);
                monthData.put("revenue", row[2]);
                formattedData.add(monthData);
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("monthlyData", formattedData);
            
            return ResponseEntity.ok().body(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Lỗi khi lấy dữ liệu doanh thu theo thời gian");
        }
    }

    // ----------- API THỐNG KÊ TỔNG HỢP -----------
    @GetMapping("/summary")
    public ResponseEntity<?> getRevenueSummary() {
        try {
            // Tổng doanh thu
            BigDecimal totalRevenue = bookingRevenueRepository.getTotalRevenue();
            if (totalRevenue == null) {
                totalRevenue = BigDecimal.ZERO;
            }

            // Doanh thu theo bác sĩ
            List<Object[]> revenueByDoctor = bookingRevenueRepository.getRevenueByDoctor();
            Map<String, Object> doctorRevenues = new HashMap<>();
            
            for (Object[] result : revenueByDoctor) {
                Integer docId = (Integer) result[0];
                BigDecimal revenue = (BigDecimal) result[1];
                
                Doctor doctor = doctorRepository.findById(docId).orElse(null);
                String doctorName = doctor != null ? doctor.getDocFullName() : "Bác sĩ không xác định";
                
                Map<String, Object> doctorRevenue = new HashMap<>();
                doctorRevenue.put("docId", docId);
                doctorRevenue.put("doctorName", doctorName);
                doctorRevenue.put("revenue", revenue);
                doctorRevenue.put("formattedRevenue", formatCurrency(revenue));
                
                doctorRevenues.put("doctor_" + docId, doctorRevenue);
            }

            // Rating trung bình
            List<Feedback> allFeedbacks = feedbackRepository.findAll();
            double averageRating = 0.0;
            if (!allFeedbacks.isEmpty()) {
                double totalRating = allFeedbacks.stream().mapToInt(Feedback::getRating).sum();
                averageRating = totalRating / allFeedbacks.size();
                averageRating = Math.round(averageRating * 10.0) / 10.0;
            }

            Map<String, Object> summary = new HashMap<>();
            summary.put("totalRevenue", totalRevenue);
            summary.put("formattedTotalRevenue", formatCurrency(totalRevenue));
            summary.put("doctorRevenues", doctorRevenues);
            summary.put("averageRating", averageRating);
            summary.put("formattedRating", String.format("%.1f", averageRating));
            summary.put("totalFeedbacks", allFeedbacks.size());

            return ResponseEntity.ok().body(summary);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Lỗi khi tính thống kê tổng hợp");
        }
    }

    // Helper method để format tiền tệ
    private String formatCurrency(BigDecimal amount) {
        if (amount == null) {
            return "0 VNĐ";
        }
        return String.format("%,.0f VNĐ", amount);
    }
} 