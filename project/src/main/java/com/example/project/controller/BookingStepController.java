package com.example.project.controller;

import com.example.project.dto.BookingStepResultDTO;
import com.example.project.entity.BookingStep;
import com.example.project.entity.SubService;
import com.example.project.repository.BookingStepRepository;
import com.example.project.repository.SubServiceRepository;
import com.example.project.service.BookingStepService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

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

    @GetMapping("/booking-steps/today-performed-at")
    public List<LocalDateTime> getBookingStepPerformedAtToday() {
        LocalDate today = LocalDate.now();
        LocalDateTime start = today.atStartOfDay();
        LocalDateTime end = today.plusDays(1).atStartOfDay();
        return bookingStepRepo.findByPerformedAtBetween(start, end)
                .stream()
                .map(BookingStep::getPerformedAt)
                .collect(Collectors.toList());
    }

    @GetMapping("/results")
    public List<BookingStepResultDTO> getResultsByCus(@RequestParam Integer cusId) {
        // Query list BookingStep theo cusId
        List<BookingStep> steps = bookingStepRepo.findByCusId(cusId); // Viết custom query JOIN với Booking để lấy theo cusId

        return steps.stream().map(step -> {
            BookingStepResultDTO dto = new BookingStepResultDTO();
            SubService sub = subServiceRepo.findById(step.getSubId()).orElse(null);
            dto.setSubName(sub != null ? sub.getSubName() : "");
            dto.setPerformedAt(step.getPerformedAt() != null ? step.getPerformedAt().toString() : "");
            dto.setResult(step.getResult());
            dto.setNote(step.getNote());
            dto.setStepStatus(step.getStepStatus());
            return dto;
        }).collect(Collectors.toList());
    }
}