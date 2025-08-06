package com.example.project.controller;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.project.entity.BookingStatusDetail;
import com.example.project.repository.BookingStatusDetailRepository;

@RestController
@RequestMapping("/api/booking-status-detail")
public class BookingStatusDetailController {

    @Autowired
    private BookingStatusDetailRepository bookingStatusDetailRepository;

    /**
     * Tạo BookingStatusDetail mới với bookId
     * Được gọi khi bác sĩ xác nhận lịch hẹn khám lần đầu hoặc tạo lịch tái khám
     */
    @PostMapping("/create/{bookId}")
    public ResponseEntity<?> createBookingStatusDetail(@PathVariable Integer bookId) {
        try {
            // Kiểm tra xem đã tồn tại chưa
            if (bookingStatusDetailRepository.existsByBookId(bookId)) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "BookingStatusDetail đã tồn tại cho bookId: " + bookId);
                response.put("bookId", bookId);
                // Sử dụng 409 Conflict thay vì 400 Bad Request cho trường hợp đã tồn tại
                return ResponseEntity.status(409).body(response);
            }

            // Tạo mới BookingStatusDetail
            BookingStatusDetail statusDetail = new BookingStatusDetail(bookId);
            BookingStatusDetail saved = bookingStatusDetailRepository.save(statusDetail);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Tạo BookingStatusDetail thành công");
            response.put("statusDetailId", saved.getStatusDetailId());
            response.put("bookId", saved.getBookId());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Lỗi khi tạo BookingStatusDetail: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * Cập nhật checkInTime khi bác sĩ nhấn markAsExamined
     * Set prescriptionStatus và revenueStatus về pending
     */
    @PutMapping("/check-in/{bookId}")
    public ResponseEntity<?> updateCheckInTime(@PathVariable Integer bookId) {
        try {
            Optional<BookingStatusDetail> optStatusDetail = bookingStatusDetailRepository.findByBookId(bookId);
            
            if (optStatusDetail.isEmpty()) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Không tìm thấy BookingStatusDetail cho bookId: " + bookId);
                return ResponseEntity.notFound().build();
            }

            BookingStatusDetail statusDetail = optStatusDetail.get();
            statusDetail.setCheckInTime(LocalDateTime.now());
            statusDetail.setPrescriptionStatus("pending");
            statusDetail.setRevenueStatus("pending");
            
            BookingStatusDetail saved = bookingStatusDetailRepository.save(statusDetail);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Cập nhật check-in time thành công");
            response.put("checkInTime", saved.getCheckInTime());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Lỗi khi cập nhật check-in time: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * Cập nhật prescriptionStatus thành 'success' khi lưu đơn thuốc thành công
     */
    @PutMapping("/prescription-success/{bookId}")
    public ResponseEntity<?> updatePrescriptionStatus(@PathVariable Integer bookId) {
        try {
            Optional<BookingStatusDetail> optStatusDetail = bookingStatusDetailRepository.findByBookId(bookId);
            
            if (optStatusDetail.isEmpty()) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Không tìm thấy BookingStatusDetail cho bookId: " + bookId);
                return ResponseEntity.notFound().build();
            }

            BookingStatusDetail statusDetail = optStatusDetail.get();
            statusDetail.setPrescriptionStatus("success");
            
            BookingStatusDetail saved = bookingStatusDetailRepository.save(statusDetail);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Cập nhật prescription status thành công");
            response.put("prescriptionStatus", saved.getPrescriptionStatus());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Lỗi khi cập nhật prescription status: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * Cập nhật revenueStatus thành 'success' khi thanh toán thành công
     */
    @PutMapping("/revenue-success/{bookId}")
    public ResponseEntity<?> updateRevenueStatus(@PathVariable Integer bookId) {
        try {
            Optional<BookingStatusDetail> optStatusDetail = bookingStatusDetailRepository.findByBookId(bookId);
            
            if (optStatusDetail.isEmpty()) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Không tìm thấy BookingStatusDetail cho bookId: " + bookId);
                return ResponseEntity.notFound().build();
            }

            BookingStatusDetail statusDetail = optStatusDetail.get();
            statusDetail.setRevenueStatus("success");
            
            BookingStatusDetail saved = bookingStatusDetailRepository.save(statusDetail);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Cập nhật revenue status thành công");
            response.put("revenueStatus", saved.getRevenueStatus());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Lỗi khi cập nhật revenue status: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * Kiểm tra và cập nhật checkOutTime khi nhấn checkout
     * Chỉ cho checkout khi cả prescriptionStatus và revenueStatus đều là 'success'
     */
    @PutMapping("/check-out/{bookId}")
    public ResponseEntity<?> updateCheckOutTime(@PathVariable Integer bookId) {
        try {
            Optional<BookingStatusDetail> optStatusDetail = bookingStatusDetailRepository.findByBookId(bookId);
            
            if (optStatusDetail.isEmpty()) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Không tìm thấy BookingStatusDetail cho bookId: " + bookId);
                return ResponseEntity.notFound().build();
            }

            BookingStatusDetail statusDetail = optStatusDetail.get();
            
            // Kiểm tra điều kiện checkout
            if (!"success".equals(statusDetail.getPrescriptionStatus()) || 
                !"success".equals(statusDetail.getRevenueStatus())) {
                
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Không thể checkout. Vui lòng hoàn thành đơn thuốc và thanh toán trước.");
                response.put("prescriptionStatus", statusDetail.getPrescriptionStatus());
                response.put("revenueStatus", statusDetail.getRevenueStatus());
                return ResponseEntity.badRequest().body(response);
            }

            // Cập nhật checkout time
            statusDetail.setCheckOutTime(LocalDateTime.now());
            BookingStatusDetail saved = bookingStatusDetailRepository.save(statusDetail);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Checkout thành công");
            response.put("checkOutTime", saved.getCheckOutTime());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Lỗi khi checkout: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * Lấy thông tin BookingStatusDetail theo bookId
     */
    @GetMapping("/get/{bookId}")
    public ResponseEntity<?> getBookingStatusDetail(@PathVariable Integer bookId) {
        try {
            Optional<BookingStatusDetail> optStatusDetail = bookingStatusDetailRepository.findByBookId(bookId);
            
            if (optStatusDetail.isEmpty()) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Không tìm thấy BookingStatusDetail cho bookId: " + bookId);
                return ResponseEntity.notFound().build();
            }

            BookingStatusDetail statusDetail = optStatusDetail.get();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("statusDetailId", statusDetail.getStatusDetailId());
            response.put("bookId", statusDetail.getBookId());
            response.put("checkInTime", statusDetail.getCheckInTime());
            response.put("checkOutTime", statusDetail.getCheckOutTime());
            response.put("prescriptionStatus", statusDetail.getPrescriptionStatus());
            response.put("revenueStatus", statusDetail.getRevenueStatus());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Lỗi khi lấy thông tin BookingStatusDetail: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * Kiểm tra xem có thể checkout không
     */
    @GetMapping("/can-checkout/{bookId}")
    public ResponseEntity<?> canCheckout(@PathVariable Integer bookId) {
        try {
            Optional<BookingStatusDetail> optStatusDetail = bookingStatusDetailRepository.findByBookId(bookId);
            
            if (optStatusDetail.isEmpty()) {
                Map<String, Object> response = new HashMap<>();
                response.put("canCheckout", false);
                response.put("message", "Không tìm thấy BookingStatusDetail");
                return ResponseEntity.ok(response);
            }

            BookingStatusDetail statusDetail = optStatusDetail.get();
            boolean canCheckout = "success".equals(statusDetail.getPrescriptionStatus()) && 
                                 "success".equals(statusDetail.getRevenueStatus());
            
            Map<String, Object> response = new HashMap<>();
            response.put("canCheckout", canCheckout);
            response.put("prescriptionStatus", statusDetail.getPrescriptionStatus());
            response.put("revenueStatus", statusDetail.getRevenueStatus());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("canCheckout", false);
            response.put("message", "Lỗi khi kiểm tra: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
}
