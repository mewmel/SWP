package com.example.project.controller;

import java.time.LocalDate;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

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
    // GET /api/booking/doctor/{docId}/today
@GetMapping("/booking/doctor/{docId}/today")
public ResponseEntity<List<Booking>> getTodayConfirmedBookings(@PathVariable Integer docId) {
    LocalDate today = LocalDate.now();
    List<Booking> bookings = bookingRepository.findBookingsToday(docId, today);
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



    @PostMapping("/booking/create-follow-up-booking")
    public ResponseEntity<?> createFollowUpBooking(@RequestBody Map<String, Object> bookingData) {
        try {
            Integer bookId = bookingService.createFollowUpBooking(bookingData);
            // Có thể trả thêm info nếu cần (VD: message, bookId,...)
            return ResponseEntity.ok(Map.of("bookId", bookId));
        } catch (Exception e) {
            // Nếu muốn show rõ lỗi backend
            return ResponseEntity.badRequest().body("Không thể tạo lịch tái khám: " + e.getMessage());
        }
    }

    // API lấy tất cả booking của customer với thông tin WorkSlot và SubService (cả lần đầu và tái khám)
    @GetMapping("/booking/history/{cusId}")
    public ResponseEntity<?> getAllBookings(@PathVariable Integer cusId) {
        try {
            List<Object[]> rawResults = bookingRepository.findAllBookingsWithSubServices(cusId);
            List<Map<String, Object>> allBookings = rawResults.stream().map(row -> {
                Map<String, Object> booking = new HashMap<>();
                booking.put("bookId", row[0]);
                booking.put("bookType", row[1]);
                booking.put("bookStatus", row[2]);
                booking.put("note", row[3]);
                booking.put("serName", row[4]);
                booking.put("docFullName", row[5]);
                booking.put("workDate", row[6]);
                booking.put("startTime", row[7]);
                booking.put("endTime", row[8]);
                booking.put("createdAt", row[9]);
                booking.put("subServices", row[10]); // SubService names joined by comma
                return booking;
            }).collect(Collectors.toList());
            
            return ResponseEntity.ok(allBookings);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error loading booking history: " + e.getMessage());
        }
    }

    /**
     * ✅ API MỚI: Xử lý yêu cầu dời lịch từ customer
     * PUT /api/booking/{bookId}/reschedule
     * @param bookId ID của booking cần dời lịch
     * @param rescheduleRequest chứa newSlotId, reason, note
     * @return Kết quả xử lý yêu cầu dời lịch
     */
    @PutMapping("/booking/{bookId}/reschedule")
    public ResponseEntity<?> rescheduleBooking(
            @PathVariable Integer bookId,
            @RequestBody Map<String, Object> rescheduleRequest) {
        try {
            // Validate input
            if (!rescheduleRequest.containsKey("newSlotId")) {
                return ResponseEntity.badRequest().body("Thiếu thông tin newSlotId");
            }

            Integer newSlotId = (Integer) rescheduleRequest.get("newSlotId");
            String reason = (String) rescheduleRequest.getOrDefault("reason", "");
            
            // Lý do dời lịch sẽ được lưu trực tiếp vào cột note
            String finalNote = reason;

            // Tìm booking hiện tại
            Optional<Booking> bookingOpt = bookingRepository.findById(bookId);
            if (!bookingOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            Booking booking = bookingOpt.get();
            
            // Lưu thông tin cũ để log
            Integer oldSlotId = booking.getSlotId();
            String oldStatus = booking.getBookStatus();

            // Cập nhật booking với thông tin mới
            booking.setSlotId(newSlotId);
            booking.setNote(finalNote);
            booking.setBookStatus("pending"); // Đợi bác sĩ xác nhận
            
            bookingRepository.save(booking);

            // Tạo response
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Yêu cầu dời lịch đã được gửi thành công. Vui lòng đợi bác sĩ xác nhận.");
            response.put("bookId", bookId);
            response.put("oldSlotId", oldSlotId);
            response.put("newSlotId", newSlotId);
            response.put("oldStatus", oldStatus);
            response.put("newStatus", "pending");
            
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Lỗi hệ thống khi xử lý yêu cầu dời lịch: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @GetMapping("/booking/{bookId}/has-drug")
public ResponseEntity<?> checkBookingHasDrug(@PathVariable Integer bookId) {
    Optional<Booking> bookingOpt = bookingRepository.findByBookId(bookId);
    if (bookingOpt.isPresent()) {
        Booking booking = bookingOpt.get();
        boolean hasDrug = booking.getDrugId() != null;
        return ResponseEntity.ok(Collections.singletonMap("hasDrug", hasDrug));
    }
    return ResponseEntity.status(404).body("Không tìm thấy booking");
}

@PutMapping("/booking/{bookId}/set-drug/{drugId}")
public ResponseEntity<?> setBookingDrugId(@PathVariable Integer bookId, @PathVariable Integer drugId) {
    Optional<Booking> bookingOpt = bookingRepository.findByBookId(bookId);
    if (bookingOpt.isPresent()) {
        Booking booking = bookingOpt.get();
        booking.setDrugId(drugId);   // gán drugId
        bookingRepository.save(booking);
        return ResponseEntity.ok(Collections.singletonMap("drugId", booking.getDrugId()));
    }
    return ResponseEntity.status(404).body("Không tìm thấy booking");
}



}