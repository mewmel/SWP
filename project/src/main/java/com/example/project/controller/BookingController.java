package com.example.project.controller;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.project.dto.BookingRequest;
import com.example.project.dto.BookingWithSlotAndCus;
import com.example.project.entity.Booking;
import com.example.project.repository.BookingRepository;
import com.example.project.service.BookingService;



@RestController
@RequestMapping("/api")
public class BookingController {


    @Autowired
    private BookingService bookingService;

    @Autowired
    private BookingRepository bookingRepository;


    @PostMapping("/booking")
    public ResponseEntity<?> createBooking(@RequestBody BookingRequest req) {
        boolean isNewAccount = bookingService.createBookingAndAccount(req);
        return ResponseEntity.ok(java.util.Map.of("success", true, "newAccount", isNewAccount));
    }

    // API lấy danh sách booking theo docId
    @GetMapping("/booking/doctor/{docId}")
    public ResponseEntity<List<Booking>> getBookingsByDoctor(@PathVariable Integer docId) {
        try {
            List<Booking> bookings = bookingRepository.findByDocIdOrderByCreatedAt(docId);
            return ResponseEntity.ok(bookings);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    // API lấy chi tiết một booking theo bookId
    @GetMapping("/booking/{bookId}")
    public ResponseEntity<Booking> getBookingDetail(@PathVariable Integer bookId) {
        try {
            Optional<Booking> booking = bookingRepository.findById(bookId);
            if (booking.isPresent()) {
                return ResponseEntity.ok(booking.get());
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    // API gộp: Cập nhật trạng thái booking (confirm/reject)
    @PutMapping("/booking/{bookId}/status")
    public ResponseEntity<String> updateBookingStatus(
            @PathVariable Integer bookId,
            @RequestParam String status,
            @RequestParam(required = false) String note) {
        try {
            Optional<Booking> bookingOpt = bookingRepository.findById(bookId);
            if (!bookingOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            Booking booking = bookingOpt.get();

            // Chỉ cho phép chuyển từ pending sang confirmed/rejected
            if (!"pending".equals(booking.getBookStatus())) {
                return ResponseEntity.badRequest().body("Booking is not in pending status");
            }

            // Validate status value
            if (!"confirmed".equals(status) && !"rejected".equals(status)) {
                return ResponseEntity.badRequest().body("Status must be 'confirmed' or 'rejected'");
            }


            // Update trạng thái
            booking.setBookStatus(status);
            if (note != null && !note.trim().isEmpty()) {
                booking.setNote(note.trim());
            }

            bookingRepository.save(booking);

            String message = "confirmed".equals(status) ? "Booking confirmed successfully" : "Booking rejected successfully";
            return ResponseEntity.ok(message);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error updating booking status: " + e.getMessage());
        }
    }

    // API lấy booking theo docId và status
    @GetMapping("/booking/doctor/{docId}/status")
    public ResponseEntity<List<Booking>> getBookingsByDoctorAndStatus(
            @PathVariable Integer docId,
            @RequestParam String status) {
        try {
            List<Booking> bookings = bookingRepository.findByDocIdAndBookStatusOrderByCreatedAt(docId, status);
            return ResponseEntity.ok(bookings);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    // API đếm số booking theo status
    @GetMapping("/booking/doctor/{docId}/count")
    public ResponseEntity<Long> countBookingsByStatus(
            @PathVariable Integer docId,
            @RequestParam String status) {
        try {
            long count = bookingRepository.countByDocIdAndBookStatus(docId, status);
            return ResponseEntity.ok(count);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/booking/by-customer/{cusId}")
    public ResponseEntity<List<Booking>> getBookingsByCustomer(@PathVariable Integer cusId) {
        List<Booking> bookings = bookingRepository.findByCusIdOrderByCreatedAt(cusId);
        return ResponseEntity.ok(bookings);
    }

    @GetMapping("/booking/doctor/{docId}/confirmed-today")
public ResponseEntity<List<BookingWithSlotAndCus>> getTodayConfirmedBookings(
        @PathVariable Integer docId) {
    LocalDate today = LocalDate.now(); // hoặc nhận từ FE nếu cần
    List<BookingWithSlotAndCus> list = bookingRepository.findBookingWithSlotByDocIdAndBookStatusAndWorkDate(docId, "confirmed", today);
    return ResponseEntity.ok(list);
}



}