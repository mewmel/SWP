package com.example.project.controller;

import com.example.project.dto.BookingStepDto;
import com.example.project.dto.PatientProfileDto;
import com.example.project.dto.PatientDashboardDto;
import com.example.project.entity.Booking;
import com.example.project.entity.BookingStep;
import com.example.project.entity.SubService;
import com.example.project.repository.BookingRepository;
import com.example.project.repository.BookingStepRepository;
import com.example.project.repository.SubServiceRepository;
import com.example.project.service.PatientProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/patient-profile")
public class PatientProfileController {

    @Autowired
    private PatientProfileService patientProfileService;
    @Autowired
    private BookingRepository bookingRepo;
    @Autowired
    private BookingStepRepository bookingStepRepo;
    @Autowired
    private SubServiceRepository subServiceRepo;

    // Lấy tổng quan hồ sơ bằng cusId
    @GetMapping("/{cusId}")
    public PatientProfileDto getPatientProfile(@PathVariable("cusId") Integer cusId) {
        return patientProfileService.getPatientProfile(cusId);
    }

    // Đường dẫn mới: Lấy dữ liệu tổng quan dashboard (chu kỳ hiện tại, ngày tiếp theo, ...)
    @GetMapping("/dashboard/{cusId}")
    public PatientDashboardDto getPatientDashboard(@PathVariable("cusId") Integer cusId) {
        return patientProfileService.getPatientDashboard(cusId);
    }

    @GetMapping("/steps/{cusId}")
    public List<BookingStepDto> getBookingSteps(@PathVariable Integer cusId) {
        List<Booking> bookings = bookingRepo.findByCusIdOrderByCreatedAtDesc(cusId);
        if (bookings.isEmpty()) return List.of();
        Booking latestBooking = bookings.get(0);

        List<BookingStep> steps = bookingStepRepo.findByBookId(latestBooking.getBookId());
        return steps.stream()
                .map(step -> new BookingStepDto(
                        step.getPerformedAt(),
                        subServiceRepo.findById(step.getSubId())
                                .map(SubService::getSubName)
                                .orElse("Khác"),
                        step.getStepStatus()                  // Thêm dòng này!
                ))
                .toList();
    }

    @GetMapping("/all-steps/{cusId}")
    public List<BookingStepDto> getSteps(@PathVariable Integer cusId) {
        List<Booking> bookings = bookingRepo.findByCusIdOrderByCreatedAtDesc(cusId);
        if (bookings.isEmpty()) return List.of();
        Booking latestBooking = bookings.get(0);

        List<BookingStep> steps = bookingStepRepo.findByBookId(latestBooking.getBookId());
        return steps.stream().map(step -> {
            String subName = "";
            if (step.getSubId() != null) {
                Optional<SubService> subOpt = subServiceRepo.findById(step.getSubId());
                subName = subOpt.map(SubService::getSubName).orElse("");
            }
            return new BookingStepDto(
                    step.getPerformedAt(),
                    subName,
                    step.getStepStatus()        // Thêm dòng này!
            );
        }).collect(Collectors.toList());
    }
}