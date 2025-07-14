package com.example.project.service;

import com.example.project.entity.Booking;
import com.example.project.entity.BookingStep;
import com.example.project.entity.Customer;
import com.example.project.repository.BookingRepository;
import com.example.project.repository.BookingStepRepository;
import com.example.project.repository.CustomerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class BookingReminderScheduler {

    @Autowired
    private BookingStepRepository bookingStepRepo;
    @Autowired
    private BookingRepository bookingRepo;
    @Autowired
    private CustomerRepository customerRepo;
    @Autowired
    private JavaMailSender mailSender;

    // Gửi thông báo mỗi ngày lúc 8h sáng
    @Scheduled(cron = "0 0 12 * * *")
    public void sendBookingReminders() {
        System.out.println("BookingReminderScheduler: Đang gửi nhắc lịch...");
        LocalDateTime tomorrowStart = LocalDate.now().plusDays(1).atStartOfDay();
        LocalDateTime tomorrowEnd = tomorrowStart.plusDays(1);

        // Lấy các bước khám diễn ra vào ngày mai
        List<BookingStep> steps = bookingStepRepo.findByPerformedAtBetween(tomorrowStart, tomorrowEnd);

        // Map customerId (Integer) -> List thời gian các bước khám của khách đó trong ngày mai
        Map<Integer, List<LocalDateTime>> customerStepsMap = new HashMap<>();

        for (BookingStep step : steps) {
            // Tìm booking liên quan
            Optional<Booking> optBooking = bookingRepo.findById(step.getBookId());
            if (optBooking.isEmpty()) continue;
            Booking booking = optBooking.get();

            Integer cusId = booking.getCusId(); // Sửa lại dùng Integer thay vì Long
            customerStepsMap
                    .computeIfAbsent(cusId, k -> new ArrayList<>())
                    .add(step.getPerformedAt());
        }

        for (Integer cusId : customerStepsMap.keySet()) {
            Optional<Customer> optCus = customerRepo.findById(cusId);
            if (optCus.isEmpty()) continue;
            Customer cus = optCus.get();

            if (cus.getCusEmail() == null || cus.getCusEmail().isBlank()) continue;

            String subject = "Nhắc nhở lịch khám/điều trị ngày mai tại FertilityEHR";
            StringBuilder body = new StringBuilder();
            body.append("Chào ").append(cus.getCusFullName() != null ? cus.getCusFullName() : "quý khách").append(",\n\n");
            body.append("Bạn có ").append(customerStepsMap.get(cusId).size()).append(" lịch khám/điều trị vào ngày mai (")
                    .append(tomorrowStart.toLocalDate()).append("):\n");
            int stt = 1;
            for (LocalDateTime time : customerStepsMap.get(cusId)) {
                body.append("  ").append(stt++).append(". Thời gian dự kiến: ").append(time.toLocalTime().toString()).append("\n");
            }
            body.append("\nVui lòng đến đúng giờ.\n\n")
                    .append("Nếu có thắc mắc, vui lòng liên hệ phòng khám.\n")
                    .append("Trân trọng!");

            System.out.println("Sẽ gửi mail tới: " + cus.getCusEmail());
            System.out.println("Nội dung mail:\n" + body);

            SimpleMailMessage msg = new SimpleMailMessage();
            msg.setTo(cus.getCusEmail());
            msg.setSubject(subject);
            msg.setText(body.toString());
            try {
                mailSender.send(msg);
                System.out.println("Đã gửi mail tới: " + cus.getCusEmail());
            } catch (Exception e) {
                System.err.println("Gửi mail thất bại tới: " + cus.getCusEmail());
                e.printStackTrace();
            }
        }
    }
}