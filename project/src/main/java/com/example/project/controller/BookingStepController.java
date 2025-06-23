package com.example.project.controller;

import com.example.project.entity.BookingStep;
import com.example.project.entity.SubService;
import com.example.project.repository.BookingStepRepository;
import com.example.project.repository.SubServiceRepository;
import com.example.project.service.BookingStepService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/booking-steps")
public class BookingStepController {
    @Autowired
    private BookingStepRepository bookingStepRepo;
    @Autowired
    private SubServiceRepository subServiceRepo;
    @Autowired
    private BookingStepService bookingStepService; // Thêm dòng này

    // Trả về danh sách BookingStep kèm tên bước cho 1 bookingId
    @GetMapping("/by-booking/{bookingId}")
    public List<Map<String, Object>> getStepsByBooking(@PathVariable Integer bookingId) {
        List<BookingStep> steps = bookingStepRepo.findByBookId(bookingId);
        List<Map<String, Object>> result = new ArrayList<>();
        for (BookingStep step : steps) {
            SubService sub = subServiceRepo.findById(step.getSubId()).orElse(null);
            Map<String, Object> map = new HashMap<>();
            map.put("bookingStepId", step.getBookingStepId());
            map.put("subName", sub != null ? sub.getSubName() : "");
            map.put("performedAt", step.getPerformedAt());
            map.put("result", step.getResult());
            map.put("note", step.getNote());
            result.add(map);
        }
        return result;
    }

    // Endpoint tạo BookingStep cho booking đã xác nhận
    @PostMapping("/create/{bookingId}")
    public Map<String, Object> createStepForBooking(@PathVariable Integer bookingId) {
        bookingStepService.createStepForConfirmedBooking(bookingId);
        Map<String, Object> resp = new HashMap<>();
        resp.put("status", "success");
        resp.put("message", "Đã tạo bước điều trị cho booking " + bookingId);
        return resp;
    }


}