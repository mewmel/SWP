package com.example.project.controller;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.project.entity.Booking;
import com.example.project.entity.Customer;
import com.example.project.entity.Doctor;
import com.example.project.entity.Feedback;
import com.example.project.entity.Service;
import com.example.project.repository.BookingRepository;
import com.example.project.repository.CustomerRepository;
import com.example.project.repository.DoctorRepository;
import com.example.project.repository.FeedbackRepository;
import com.example.project.repository.ServiceRepository;

@RestController
@RequestMapping("/api/feedback")
public class FeedbackController {
    
    @Autowired
    private FeedbackRepository feedbackRepository;
    
    @Autowired
    private BookingRepository bookingRepository;
    
    @Autowired
    private CustomerRepository customerRepository;
    
    @Autowired
    private DoctorRepository doctorRepository;
    
    @Autowired
    private ServiceRepository serviceRepository;
    
    /**
     * API lấy danh sách dịch vụ đã hoàn thành của customer để có thể feedback
     * GET /api/feedback/completed-services/{cusId}
     */
    @GetMapping("/completed-services/{cusId}")
    public ResponseEntity<List<Map<String, Object>>> getCompletedServices(@PathVariable Integer cusId) {
        try {
            List<Map<String, Object>> completedServices = new ArrayList<>();
            
            // Lấy các booking đã hoàn thành của customer
            List<Booking> completedBookings = bookingRepository.findByCusIdAndBookStatusOrderByCreatedAtDesc(cusId, "completed");
            
            for (Booking booking : completedBookings) {
                // Lấy thông tin doctor
                Doctor doctor = doctorRepository.findById(booking.getDocId()).orElse(null);
                // Lấy thông tin service
                Service service = serviceRepository.findById(booking.getSerId()).orElse(null);
                
                if (doctor != null && service != null) {
                    // Kiểm tra đã feedback chưa
                    boolean alreadyFeedback = feedbackRepository.existsByCusIdAndDocIdAndSerId(
                        cusId, booking.getDocId(), booking.getSerId());
                    
                    Map<String, Object> serviceData = new HashMap<>();
                    serviceData.put("bookId", booking.getBookId());
                    serviceData.put("docId", booking.getDocId());
                    serviceData.put("serId", booking.getSerId());
                    serviceData.put("doctorName", doctor.getDocFullName());
                    serviceData.put("serviceName", service.getSerName());
                    serviceData.put("serviceDate", booking.getCreatedAt().toLocalDate().toString());
                    serviceData.put("bookStatus", booking.getBookStatus());
                    serviceData.put("alreadyFeedback", alreadyFeedback);
                    
                    completedServices.add(serviceData);
                }
            }
            
            return ResponseEntity.ok(completedServices);
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }
    
    /**
     * API lưu feedback mới
     * POST /api/feedback
     */
    @PostMapping("")
    public ResponseEntity<Map<String, Object>> createFeedback(@RequestBody Map<String, Object> feedbackData) {
        try {
            // Validate dữ liệu đầu vào
            Integer cusId = (Integer) feedbackData.get("cusId");
            Integer docId = (Integer) feedbackData.get("docId");
            Integer serId = (Integer) feedbackData.get("serId");
            Integer rating = (Integer) feedbackData.get("rating");
            String comment = (String) feedbackData.get("comment");
            
            if (cusId == null || docId == null || serId == null || rating == null) {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("message", "Thiếu thông tin bắt buộc!");
                return ResponseEntity.badRequest().body(error);
            }
            
            if (rating < 1 || rating > 5) {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("message", "Rating phải từ 1 đến 5 sao!");
                return ResponseEntity.badRequest().body(error);
            }
            
            // Kiểm tra đã feedback chưa
            if (feedbackRepository.existsByCusIdAndDocIdAndSerId(cusId, docId, serId)) {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("message", "Bạn đã đánh giá dịch vụ này rồi!");
                return ResponseEntity.badRequest().body(error);
            }
            
            // Tạo feedback mới
            Feedback feedback = new Feedback();
            feedback.setCusId(cusId);
            feedback.setDocId(docId);
            feedback.setSerId(serId);
            feedback.setRating(rating);
            feedback.setComment(comment);
            feedback.setFeedbackDate(LocalDateTime.now());
            
            Feedback savedFeedback = feedbackRepository.save(feedback);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Đánh giá đã được gửi thành công!");
            response.put("feedbackId", savedFeedback.getFeedbackId());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Có lỗi xảy ra: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
    
    /**
     * API lấy lịch sử feedback của customer
     * GET /api/feedback/history/{cusId}
     */
    @GetMapping("/history/{cusId}")
    public ResponseEntity<List<Map<String, Object>>> getFeedbackHistory(@PathVariable Integer cusId) {
        try {
            List<Object[]> rawData = feedbackRepository.findFeedbackHistoryByCusId(cusId);
            List<Map<String, Object>> feedbackHistory = new ArrayList<>();
            
            for (Object[] row : rawData) {
                Map<String, Object> feedback = new HashMap<>();
                feedback.put("feedbackId", row[0]);
                feedback.put("rating", row[1]);
                feedback.put("comment", row[2]);
                feedback.put("feedbackDate", row[3].toString());
                feedback.put("doctorName", row[4]);
                feedback.put("serviceName", row[5]);
                
                feedbackHistory.add(feedback);
            }
            
            return ResponseEntity.ok(feedbackHistory);
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }
    
    /**
     * API lấy thống kê feedback cho doctor (bonus)
     * GET /api/feedback/doctor-stats/{docId}
     */
    @GetMapping("/doctor-stats/{docId}")
    public ResponseEntity<Map<String, Object>> getDoctorFeedbackStats(@PathVariable Integer docId) {
        try {
            List<Feedback> doctorFeedbacks = feedbackRepository.findByDocIdOrderByFeedbackDateDesc(docId);
            
            if (doctorFeedbacks.isEmpty()) {
                Map<String, Object> stats = new HashMap<>();
                stats.put("totalFeedbacks", 0);
                stats.put("averageRating", 0.0);
                stats.put("ratingDistribution", new HashMap<>());
                return ResponseEntity.ok(stats);
            }
            
            // Tính toán thống kê
            int totalFeedbacks = doctorFeedbacks.size();
            double totalRating = doctorFeedbacks.stream().mapToInt(Feedback::getRating).sum();
            double averageRating = totalRating / totalFeedbacks;
            
            // Phân bố rating
            Map<Integer, Integer> ratingDistribution = new HashMap<>();
            for (int i = 1; i <= 5; i++) {
                ratingDistribution.put(i, 0);
            }
            
            for (Feedback feedback : doctorFeedbacks) {
                int rating = feedback.getRating();
                ratingDistribution.put(rating, ratingDistribution.get(rating) + 1);
            }
            
            Map<String, Object> stats = new HashMap<>();
            stats.put("totalFeedbacks", totalFeedbacks);
            stats.put("averageRating", Math.round(averageRating * 100.0) / 100.0);
            stats.put("ratingDistribution", ratingDistribution);
            
            return ResponseEntity.ok(stats);
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }
    
    /**
     * API lấy testimonials để hiển thị trên trang chủ
     * GET /api/feedback/testimonials
     */
    @GetMapping("/testimonials")
    public ResponseEntity<List<Map<String, Object>>> getTestimonials() {
        try {
            System.out.println("=== Starting testimonials API ===");
            
            // First, check if we have any feedback at all
            List<Feedback> allFeedbacks = feedbackRepository.findAll();
            System.out.println("Total feedbacks in database: " + allFeedbacks.size());
            
            if (allFeedbacks.isEmpty()) {
                System.out.println("No feedbacks found in database");
                return ResponseEntity.ok(new ArrayList<>());
            }
            
            // Try to get testimonials
            List<Object[]> testimonialData = feedbackRepository.findTestimonialsForHomepage();
            System.out.println("Testimonials found: " + testimonialData.size());
            
            List<Map<String, Object>> testimonials = new ArrayList<>();
            
            for (Object[] row : testimonialData) {
                try {
                    Map<String, Object> testimonial = new HashMap<>();
                    
                    // Safely extract data with null checks
                    testimonial.put("rating", row[0] != null ? row[0] : 0);
                    testimonial.put("comment", row[1] != null ? row[1].toString() : "");
                    testimonial.put("feedbackDate", row[2] != null ? row[2].toString() : "");
                    testimonial.put("doctorName", row[3] != null ? row[3].toString() : "Bác sĩ");
                    testimonial.put("serviceName", row[4] != null ? row[4].toString() : "Dịch vụ");
                    testimonial.put("customerName", row[5] != null ? row[5].toString() : "Khách hàng");
                    
                    testimonials.add(testimonial);
                    System.out.println("Added testimonial: " + testimonial);
                    
                    // Limit to 6 testimonials
                    if (testimonials.size() >= 6) {
                        break;
                    }
                    
                } catch (Exception rowError) {
                    System.err.println("Error processing row: " + rowError.getMessage());
                    continue;
                }
            }
            
            System.out.println("=== Testimonials API completed with " + testimonials.size() + " testimonials ===");
            return ResponseEntity.ok(testimonials);
            
        } catch (Exception e) {
            System.err.println("Error in testimonials API: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(new ArrayList<>());
        }
    }
    
    /**
     * API đơn giản để lấy testimonials (fallback)
     * GET /api/feedback/testimonials-simple
     */
    @GetMapping("/testimonials-simple")
    public ResponseEntity<List<Map<String, Object>>> getTestimonialsSimple() {
        try {
            System.out.println("=== Starting simple testimonials API ===");
            
            // Get all feedbacks with rating >= 4
            List<Feedback> goodFeedbacks = feedbackRepository.findAll().stream()
                .filter(f -> f.getRating() >= 4 && f.getComment() != null && !f.getComment().trim().isEmpty())
                .sorted((f1, f2) -> {
                    // Sort by rating desc, then by date desc
                    int ratingCompare = Integer.compare(f2.getRating(), f1.getRating());
                    if (ratingCompare != 0) return ratingCompare;
                    return f2.getFeedbackDate().compareTo(f1.getFeedbackDate());
                })
                .limit(6)
                .collect(Collectors.toList());
            
            System.out.println("Good feedbacks found: " + goodFeedbacks.size());
            
            List<Map<String, Object>> testimonials = new ArrayList<>();
            
            for (Feedback feedback : goodFeedbacks) {
                Map<String, Object> testimonial = new HashMap<>();
                testimonial.put("rating", feedback.getRating());
                testimonial.put("comment", feedback.getComment());
                testimonial.put("feedbackDate", feedback.getFeedbackDate().toString());
                testimonial.put("doctorName", "Bác sĩ"); // Placeholder
                testimonial.put("serviceName", "Dịch vụ"); // Placeholder
                testimonial.put("customerName", "Khách hàng"); // Placeholder
                
                testimonials.add(testimonial);
                System.out.println("Added simple testimonial: " + testimonial);
            }
            
            System.out.println("=== Simple testimonials API completed with " + testimonials.size() + " testimonials ===");
            return ResponseEntity.ok(testimonials);
            
        } catch (Exception e) {
            System.err.println("Error in simple testimonials API: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(new ArrayList<>());
        }
    }
    
    /**
     * API test để kiểm tra dữ liệu feedback
     * GET /api/feedback/test
     */
    @GetMapping("/test")
    public ResponseEntity<Map<String, Object>> testFeedbackData() {
        try {
            Map<String, Object> result = new HashMap<>();
            
            // Count all feedbacks
            long totalFeedbacks = feedbackRepository.count();
            result.put("totalFeedbacks", totalFeedbacks);
            
            // Get some sample feedbacks
            List<Feedback> sampleFeedbacks = feedbackRepository.findAll();
            List<Map<String, Object>> feedbacks = new ArrayList<>();
            
            for (Feedback f : sampleFeedbacks) {
                Map<String, Object> feedback = new HashMap<>();
                feedback.put("id", f.getFeedbackId());
                feedback.put("rating", f.getRating());
                feedback.put("comment", f.getComment());
                feedback.put("cusId", f.getCusId());
                feedback.put("docId", f.getDocId());
                feedback.put("serId", f.getSerId());
                feedbacks.add(feedback);
            }
            
            result.put("feedbacks", feedbacks);
            
            // Test the complex query
            try {
                List<Object[]> testimonialData = feedbackRepository.findTestimonialsForHomepage();
                result.put("testimonialQueryResult", testimonialData.size());
                result.put("testimonialQuerySuccess", true);
            } catch (Exception queryError) {
                result.put("testimonialQueryError", queryError.getMessage());
                result.put("testimonialQuerySuccess", false);
            }
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            error.put("stackTrace", e.getStackTrace());
            return ResponseEntity.status(500).body(error);
        }
    }
} 