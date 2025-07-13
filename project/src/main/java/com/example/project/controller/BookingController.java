package com.example.project.controller;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;
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

import com.example.project.dto.BookingPatientService;
import com.example.project.dto.BookingRequest;
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


    // API tạo booking và tài khoản khách hàng mới nếu cần
    @PostMapping("/booking")
    public ResponseEntity<?> createBooking(@RequestBody BookingRequest req) {
        boolean isNewAccount = bookingService.createBookingAndAccount(req);
        return ResponseEntity.ok(java.util.Map.of("success", true, "newAccount", isNewAccount));
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
            List<Booking> bookings = bookingRepository.findByDocIdAndBookStatusOrderByBookId(docId, status);
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
        List<Booking> bookings = bookingRepository.findByCusIdOrderByBookIdDesc(cusId);
        return ResponseEntity.ok(bookings);
    }

    // API lấy danh sách booking đã xác nhận trong ngày hôm nay của bác sĩ
    // GET /api/booking/doctor/{docId}/confirmed-today
@GetMapping("/booking/doctor/{docId}/today")
public ResponseEntity<List<Booking>> getTodayConfirmedBookings(@PathVariable Integer docId) {
    LocalDate today = LocalDate.now();
    LocalDateTime startOfDay = today.atStartOfDay();         // 00:00:00
    LocalDateTime endOfDay = today.atTime(LocalTime.MAX);    // 23:59:59.999999999

    List<Booking> bookings = bookingRepository.findBookingsToday(docId, startOfDay, endOfDay);
    return ResponseEntity.ok(bookings);
}


    // dùng để update khi đã khám xong
    // PUT /api/booking/note-status/{bookId}
    @PutMapping("/booking/update-note-status/{bookId}")
    public ResponseEntity<?> updateBookingNoteStatus(@PathVariable Integer bookId, @RequestBody Booking bookingUpdate) {
        boolean ok = bookingService.updateNoteAndStatus(bookId, bookingUpdate.getBookStatus(), bookingUpdate.getNote());
        if (ok) return ResponseEntity.ok().build();
        return ResponseEntity.status(404).body("Booking not found");
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
    
    // Lấy thông tin tên khách hàng và tên dịch vụ của 1 booking theo bookId
    //PUT /api/booking/patient-service/{bookId}
@GetMapping("/booking/patient-service/{bookId}")
    public ResponseEntity<?> getBookingPatientService(@PathVariable Integer bookId) {
        BookingPatientService dto = bookingRepository.findBookingPatientServiceByBookId(bookId);
        if (dto == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(dto);
    }

// dùng để update khi có đến khám
    // PUT /api/booking/update-status/{bookId}
    @PutMapping("/booking/update-status/{bookId}")
    public ResponseEntity<?> updateBookingStatus(@PathVariable Integer bookId, @RequestBody Booking bookingUpdate) {
        boolean ok = bookingService.updateStatus(bookId, bookingUpdate.getBookStatus());
        if (ok) return ResponseEntity.ok().build();
        return ResponseEntity.status(404).body("Booking not found");
    }


    @PostMapping("/booking/create-initial-booking")
    public ResponseEntity<?> createInitialBooking(@RequestBody Map<String, Object> bookingData) {
        try {
            Booking booking = new Booking();
            booking.setCusId((Integer) bookingData.get("cusId"));
            booking.setDocId((Integer) bookingData.get("docId"));
            booking.setSlotId((Integer) bookingData.get("slotId"));
            booking.setNote((String) bookingData.get("note"));
            booking.setBookType((String) bookingData.get("bookType"));
            booking.setSerId((Integer) bookingData.get("serId"));

            // Thiết lập các field mặc định
            booking.setBookStatus("confirmed"); // hoặc confirmed tuỳ logic
            booking.setCreatedAt(LocalDateTime.now());
            // // Nếu có truyền drugId thì lấy luôn
            // if (bookingData.get("drugId") != null) {
            //     booking.setDrugId((Integer) bookingData.get("drugId"));
            // }

            // Lưu vào DB
            Booking saved = bookingRepository.save(booking);

            // Trả về bookingId cho FE
            return ResponseEntity.ok(Map.of("bookId", saved.getBookId()));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Không thể tạo lịch hẹn: " + e.getMessage());
        }
    }

}