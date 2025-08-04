package com.example.project.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.project.entity.BookingRevenueDetail;
import com.example.project.repository.BookingRevenueDetailRepository;
import com.example.project.repository.SubServiceRepository;

@RestController
@RequestMapping("/api/booking-revenue-detail")
@CrossOrigin
public class BookingRevenueDetailController {
    
    @Autowired
    private BookingRevenueDetailRepository bookingRevenueDetailRepository;
    
    @Autowired
    private SubServiceRepository subServiceRepository;
    
    /**
     * Lấy chi tiết dịch vụ từ BookingRevenueDetail cho tab thanh toán
     * API tương tự như /api/booking-steps/{bookId}/subservice-of-visit
     * nhưng sử dụng BookingRevenueDetail để lấy thông tin giá cả
     */
    @GetMapping("/{bookId}/service-details")
    public ResponseEntity<List<Map<String, Object>>> getServiceDetailsForPayment(@PathVariable Integer bookId) {
        try {
            // Lấy tất cả BookingRevenueDetail theo bookId
            List<BookingRevenueDetail> revenueDetails = bookingRevenueDetailRepository.findByBookId(bookId);
            
            if (revenueDetails.isEmpty()) {
                return ResponseEntity.ok(List.of());
            }
            
            // Convert sang format phù hợp cho frontend
            List<Map<String, Object>> serviceDetails = revenueDetails.stream()
                .map(detail -> {
                    Map<String, Object> serviceDetail = new HashMap<>();
                    serviceDetail.put("revenueDetailId", detail.getRevenueDetailId());
                    serviceDetail.put("bookId", detail.getBookId());
                    serviceDetail.put("serId", detail.getSerId());
                    serviceDetail.put("subId", detail.getSubId());
                    serviceDetail.put("subPrice", detail.getSubPrice());
                    serviceDetail.put("createdAt", detail.getCreatedAt());
                    
                    // Lấy thông tin SubService để có tên dịch vụ
                    subServiceRepository.findById(detail.getSubId()).ifPresent(subService -> {
                        serviceDetail.put("subName", subService.getSubName());
                        serviceDetail.put("subDescription", subService.getSubDescription());
                    });
                    
                    return serviceDetail;
                })
                .collect(Collectors.toList());
            
            return ResponseEntity.ok(serviceDetails);
            
        } catch (Exception e) {
            System.err.println("Lỗi khi lấy service details cho booking " + bookId + ": " + e.getMessage());
            return ResponseEntity.ok(List.of());
        }
    }
    
    /**
     * Tạo mới BookingRevenueDetail
     */
    @PostMapping("/create")
    public ResponseEntity<BookingRevenueDetail> createBookingRevenueDetail(@RequestBody Map<String, Object> request) {
        try {
            Integer bookId = (Integer) request.get("bookId");
            Integer serId = (Integer) request.get("serId");
            Integer subId = (Integer) request.get("subId");
            Object subPriceObj = request.get("subPrice");
            
            // Convert subPrice to BigDecimal
            java.math.BigDecimal subPrice = java.math.BigDecimal.ZERO;
            if (subPriceObj != null) {
                if (subPriceObj instanceof Number) {
                    subPrice = java.math.BigDecimal.valueOf(((Number) subPriceObj).doubleValue());
                } else if (subPriceObj instanceof String) {
                    subPrice = new java.math.BigDecimal((String) subPriceObj);
                }
            }
            
            BookingRevenueDetail detail = new BookingRevenueDetail(bookId, serId, subId, subPrice);
            BookingRevenueDetail saved = bookingRevenueDetailRepository.save(detail);
            
            System.out.println("✅ Created BookingRevenueDetail: " + saved.getRevenueDetailId() + 
                             " for booking " + bookId + " with price " + subPrice);
            
            return ResponseEntity.ok(saved);
            
        } catch (Exception e) {
            System.err.println("❌ Lỗi khi tạo BookingRevenueDetail: " + e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
    
}
