package com.example.project.controller;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.project.entity.BookingRevenue;
import com.example.project.entity.Image;
import com.example.project.repository.BookingRevenueRepository;
import com.example.project.repository.ImageRepository;

@RestController
@RequestMapping("/api/booking-revenue")
public class BookingRevenueController {

    @Autowired
    private BookingRevenueRepository bookingRevenueRepository;

    @Autowired
    private ImageRepository imageRepository;

    // ----------- API UPLOAD ẢNH BILL THANH TOÁN -----------
    @PostMapping("/upload-bill-image/{revenueId}")
    public ResponseEntity<?> uploadBillImage(
            @PathVariable Integer revenueId,
            @RequestParam("billImage") MultipartFile file
    ) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body("File rỗng");
            }
            if (file.getSize() > 10 * 1024 * 1024) {
                return ResponseEntity.badRequest().body("Ảnh quá lớn, tối đa 10MB");
            }

            // Kiểm tra BookingRevenue tồn tại
            Optional<BookingRevenue> revenueOpt = bookingRevenueRepository.findById(revenueId);
            if (revenueOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            BookingRevenue revenue = revenueOpt.get();

            // Lưu ảnh vào Image
            Image image = new Image();
            image.setImageData(file.getBytes());
            image.setImageMimeType(file.getContentType());
            imageRepository.save(image);

            // Cập nhật imageId cho BookingRevenue
            revenue.setImageId(image.getImageId());
            bookingRevenueRepository.save(revenue);

            return ResponseEntity.ok().body("Upload ảnh bill thành công");
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Upload thất bại");
        }
    }

    // ----------- API LẤY ẢNH BILL THANH TOÁN -----------
    @GetMapping("/bill-image/{revenueId}")
    public ResponseEntity<?> getBillImage(@PathVariable Integer revenueId) {
        Optional<BookingRevenue> revenueOpt = bookingRevenueRepository.findById(revenueId);
        if (revenueOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        BookingRevenue revenue = revenueOpt.get();
        if (revenue.getImageId() == null) {
            return ResponseEntity.notFound().build();
        }

        Optional<Image> imageOpt = imageRepository.findById(revenue.getImageId());
        if (imageOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Image image = imageOpt.get();
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(image.getImageMimeType()))
                .body(image.getImageData());
    }

    // ----------- API XÁC NHẬN THANH TOÁN -----------
    @PutMapping("/confirm-payment/{revenueId}")
    public ResponseEntity<?> confirmPayment(@PathVariable Integer revenueId) {
        Optional<BookingRevenue> revenueOpt = bookingRevenueRepository.findById(revenueId);
        if (revenueOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        BookingRevenue revenue = revenueOpt.get();
        revenue.setRevenueStatus(BookingRevenue.RevenueStatus.success);
        bookingRevenueRepository.save(revenue);

        return ResponseEntity.ok().body("Xác nhận thanh toán thành công");
    }

    // ----------- API TẠO REVENUE MỚI -----------
    @PostMapping("/create")
    public ResponseEntity<?> createRevenue(
            @RequestParam Integer bookId,
            @RequestParam Integer serId,
            @RequestParam BigDecimal totalAmount
    ) {
        try {
            BookingRevenue revenue = new BookingRevenue(bookId, serId, totalAmount);
            bookingRevenueRepository.save(revenue);
            return ResponseEntity.ok().body(Map.of(
                "revenueId", revenue.getRevenueId(),
                "message", "Tạo revenue thành công"
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Tạo revenue thất bại");
        }
    }

    // ----------- API LẤY THÔNG TIN REVENUE -----------
    @GetMapping("/{revenueId}")
    public ResponseEntity<?> getRevenue(@PathVariable Integer revenueId) {
        Optional<BookingRevenue> revenueOpt = bookingRevenueRepository.findById(revenueId);
        if (revenueOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        BookingRevenue revenue = revenueOpt.get();
        return ResponseEntity.ok().body(Map.of(
            "revenueId", revenue.getRevenueId(),
            "bookId", revenue.getBookId(),
            "serId", revenue.getSerId(),
            "totalAmount", revenue.getTotalAmount(),
            "imageId", revenue.getImageId(),
            "revenueStatus", revenue.getRevenueStatus(),
            "createdAt", revenue.getCreatedAt()
        ));
    }

    // ----------- API LẤY REVENUE THEO BOOKING -----------
    @GetMapping("/by-booking/{bookId}")
    public ResponseEntity<?> getRevenueByBooking(@PathVariable Integer bookId) {
        try {
            List<BookingRevenue> revenues = bookingRevenueRepository.findAllByBookId(bookId);
            
            // Convert to simple DTOs to avoid lazy loading issues
            List<Map<String, Object>> revenueDTOs = revenues.stream()
                .map(revenue -> {
                    Map<String, Object> dto = new HashMap<>();
                    dto.put("revenueId", revenue.getRevenueId());
                    dto.put("bookId", revenue.getBookId());
                    dto.put("serId", revenue.getSerId());
                    dto.put("totalAmount", revenue.getTotalAmount());
                    dto.put("imageId", revenue.getImageId());
                    dto.put("revenueStatus", revenue.getRevenueStatus());
                    dto.put("createdAt", revenue.getCreatedAt());
                    return dto;
                })
                .collect(Collectors.toList());
            
            return ResponseEntity.ok().body(revenueDTOs);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi khi lấy thông tin revenue: " + e.getMessage());
        }
    }
}
