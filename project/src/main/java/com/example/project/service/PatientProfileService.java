package com.example.project.service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.project.dto.PatientDashboardDto;
import com.example.project.dto.PatientProfileDto;
import com.example.project.entity.Booking;
import com.example.project.entity.BookingStep;
import com.example.project.entity.Doctor;
import com.example.project.entity.SubService;
import com.example.project.repository.BookingRepository;
import com.example.project.repository.BookingStepRepository;
import com.example.project.repository.DoctorRepository;
import com.example.project.repository.ServiceRepository;
import com.example.project.repository.SubServiceRepository;

@Service
public class PatientProfileService {
    @Autowired
    private BookingRepository bookingRepository;
    @Autowired
    private DoctorRepository doctorRepository;
    @Autowired
    private BookingStepRepository bookingStepRepository;
    @Autowired
    private ServiceRepository serviceRepository;
    @Autowired
    private SubServiceRepository subServiceRepository;

    public PatientProfileDto getPatientProfile(Integer cusId) {
        List<Booking> bookings = bookingRepository.findByCusIdOrderByCreatedAt(cusId);
        if (bookings.isEmpty()) throw new RuntimeException("Không có booking nào!");

        Booking latestBooking = bookings.get(0);
        LocalDateTime ngayDangKy = latestBooking.getCreatedAt();

        String bacSiPhuTrach = doctorRepository.findById(latestBooking.getDocId())
                .map(Doctor::getDocFullName)
                .orElse("Không xác định");

        Integer latestBookingId = latestBooking.getBookId();
        List<BookingStep> stepsOfLatestBooking = bookingStepRepository.findByBookId(latestBookingId);

        LocalDateTime now = LocalDateTime.now();
        long completedCount = stepsOfLatestBooking.stream()
                .filter(step -> step.getPerformedAt() != null
                        && !step.getPerformedAt().isAfter(now)
                        && "Completed".equalsIgnoreCase(step.getStepStatus()))
                .count();

        int chuKyHienTai = (int) completedCount + 1; // Mặc định bắt đầu từ 1

        return new PatientProfileDto(
                cusId,
                ngayDangKy,
                bacSiPhuTrach,
                chuKyHienTai
        );
    }

    public PatientDashboardDto getPatientDashboard(Integer cusId) {
        List<Booking> bookings = bookingRepository.findByCusIdOrderByCreatedAt(cusId);
        if (bookings.isEmpty()) {
            return new PatientDashboardDto(null, null, null, null);
        }
        Booking latestBooking = bookings.get(0);

        String treatmentName = null;
        if (latestBooking.getSerId() != null) {
            Optional<com.example.project.entity.Service> serviceOpt = serviceRepository.findById(latestBooking.getSerId());
            if (serviceOpt.isPresent()) {
                treatmentName = serviceOpt.get().getSerName();
            }
        }

        List<BookingStep> steps = bookingStepRepository.findByBookId(latestBooking.getBookId());

        LocalDateTime now = LocalDateTime.now();
        long completedCount = steps.stream()
                .filter(step -> step.getPerformedAt() != null
                        && !step.getPerformedAt().isAfter(now)
                        && "Completed".equalsIgnoreCase(step.getStepStatus()))
                .count();

        String treatmentStage = "Giai đoạn " + (completedCount + 1);

        Optional<BookingStep> nextStepOpt = steps.stream()
                .filter(step -> step.getPerformedAt() != null && step.getPerformedAt().isAfter(now))
                .sorted((a, b) -> a.getPerformedAt().compareTo(b.getPerformedAt()))
                .findFirst();

        String nextEventDate = null;
        String nextEventType = null;
        if (nextStepOpt.isPresent()) {
            BookingStep nextStep = nextStepOpt.get();
            nextEventDate = nextStep.getPerformedAt().format(DateTimeFormatter.ofPattern("dd/MM"));

            if (nextStep.getSubId() != null) {
                Optional<SubService> subServiceOpt = subServiceRepository.findById(nextStep.getSubId());
                if (subServiceOpt.isPresent()) {
                    nextEventType = subServiceOpt.get().getSubName();
                }
            }
        }

        return new PatientDashboardDto(
                treatmentName,
                treatmentStage,
                nextEventDate,
                nextEventType
        );
    }
}
