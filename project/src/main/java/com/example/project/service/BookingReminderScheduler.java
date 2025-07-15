package com.example.project.service;

import com.example.project.entity.Booking;
import com.example.project.entity.BookingStep;
import com.example.project.entity.Customer;
import com.example.project.repository.BookingRepository;
import com.example.project.repository.BookingStepRepository;
import com.example.project.repository.CustomerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;
import org.springframework.util.ResourceUtils;
import java.io.File;
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

    // Gửi thông báo mỗi ngày lúc 12h (trưa)
    @Scheduled(cron = "0 0 8 * * *")
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

            Integer cusId = booking.getCusId();
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
            String htmlContent = buildHtmlReminderContent(
                    cus.getCusFullName(),
                    customerStepsMap.get(cusId),
                    tomorrowStart.toLocalDate()
            );

            System.out.println("Sẽ gửi mail tới: " + cus.getCusEmail());
            System.out.println("Nội dung mail:\n" + htmlContent);

            try {
                MimeMessage message = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
                helper.setTo(cus.getCusEmail());
                helper.setSubject(subject);
                helper.setText(htmlContent, true);

                // Thêm logo vào email qua CID nếu có
                File logoFile = ResourceUtils.getFile("classpath:static/img/logo.png");
                if (logoFile.exists()) {
                    helper.addInline("logoImage", logoFile);
                }

                mailSender.send(message);
                System.out.println("Đã gửi mail tới: " + cus.getCusEmail());
            } catch (Exception e) {
                System.err.println("Gửi mail thất bại tới: " + cus.getCusEmail());
                e.printStackTrace();
            }
        }
    }

    // Hàm dựng HTML form nhắc nhở đẹp, có màu, có header
    private String buildHtmlReminderContent(String fullName, List<LocalDateTime> steps, LocalDate day) {
        String logoUrl = "cid:logoImage";
        StringBuilder html = new StringBuilder();
        html.append("<div style=\"max-width:520px;margin:auto;font-family:Arial,Helvetica,sans-serif;\">")
                .append("<div style=\"background:#2196f3;color:#fff;padding:16px 24px 10px 24px;border-radius:7px 7px 0 0;display:flex;align-items:center;\">")
                .append("<img src=\"").append(logoUrl).append("\" alt=\"FertilityEHR Logo\" style=\"height:44px;width:auto;margin-right:14px;vertical-align:middle;\">")
                .append("<span style=\"font-size:20px;font-weight:bold;letter-spacing:1px;\">FertilityEHR - Nhắc lịch khám</span>")
                .append("</div>")
                .append("<div style=\"border:1px solid #ddd;padding:22px 26px 18px 26px;border-radius:0 0 7px 7px;background:#fff;\">")
                .append("<p style=\"margin-bottom:7px;\">Xin chào <b>")
                .append(fullName != null && !fullName.isBlank() ? fullName : "quý khách")
                .append("</b>,</p>")
                .append("<p style=\"margin-top:0;margin-bottom:15px;\">Bạn có <b>")
                .append(steps.size())
                .append("</b> lịch khám/điều trị vào ngày mai (<b>")
                .append(day)
                .append("</b>):</p>");

        html.append("<table style=\"width:100%;border-collapse:collapse;font-size:15px;\">")
                .append("<tr><th style=\"text-align:left;color:#2196f3;padding:3px 0 6px 0;\">STT</th>")
                .append("<th style=\"text-align:left;color:#2196f3;padding:3px 0 6px 0;\">Thời gian dự kiến</th></tr>");
        int stt = 1;
        for (LocalDateTime time : steps) {
            html.append("<tr>")
                    .append("<td style=\"padding:4px 3px 4px 0;\">").append(stt++).append("</td>")
                    .append("<td style=\"padding:4px 0 4px 0;\">").append(time.toLocalTime().toString()).append("</td>")
                    .append("</tr>");
        }
        html.append("</table>")
                .append("<div style=\"margin-top:16px;color:#888;font-size:13px;\">Vui lòng đến đúng giờ. Nếu có thắc mắc, vui lòng liên hệ phòng khám.</div>")
                .append("</div>")
                .append("</div>");
        return html.toString();
    }
}