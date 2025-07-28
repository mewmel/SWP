package com.example.project.service;

import java.io.File;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Map;
import java.util.Optional;

import jakarta.mail.internet.MimeMessage;
import org.apache.commons.lang3.RandomStringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.ResourceUtils;

import com.example.project.dto.BookingRequest;
import com.example.project.entity.Booking;
import com.example.project.entity.Customer;
import com.example.project.entity.Doctor;
import com.example.project.entity.WorkSlot;
import com.example.project.repository.BookingRepository;
import com.example.project.repository.CustomerRepository;
import com.example.project.repository.DoctorRepository;
import com.example.project.repository.ServiceRepository;
import com.example.project.repository.WorkSlotRepository;


@Service
public class BookingService {
    @Autowired
    private CustomerRepository customerRepo;
    @Autowired
    private BookingRepository bookingRepo;
    @Autowired
    private WorkSlotRepository workSlotRepo;
    @Autowired
    private JavaMailSender mailSender;
    @Autowired
    private BCryptPasswordEncoder passwordEncoder;
    @Autowired
    private DoctorRepository doctorRepo;
    @Autowired
    private ServiceRepository serviceRepo;

    public boolean createBookingAndAccount(BookingRequest req) {
        // Tìm Customer theo email và provider = 'local'
        Optional<Customer> optCustomer = customerRepo.findByCusEmailAndCusProvider(req.getEmail(), "local");
        Customer customer;
        boolean isNewAccount = false;
        String rawPassword = null;

        // === Lấy tên bác sĩ và dịch vụ ===
        String doctorName = "";
        String serviceName = "";

        // Lấy tên bác sĩ
        Optional<Doctor> optDoctor = doctorRepo.findById(req.getDocId());
        doctorName = optDoctor.map(Doctor::getDocFullName).orElse("Không xác định");

        Optional<com.example.project.entity.Service> optService = serviceRepo.findById(req.getSerId());
        serviceName = optService.map(s -> s.getSerName()).orElse("Không xác định");

        // Tạo customer mới nếu chưa có
        if (optCustomer.isEmpty()) {
            rawPassword = RandomStringUtils.randomAlphanumeric(8);
            customer = new Customer();
            customer.setCusFullName(req.getFullName());
            customer.setCusGender(req.getGender());
            customer.setCusDate(LocalDate.parse(req.getDob()));
            customer.setCusEmail(req.getEmail());
            customer.setCusPhone(req.getPhone());
            customer.setCusAddress(req.getAddress());
            customer.setCusOccupation(req.getOccupation());
            customer.setEmergencyContact(req.getEmergencyContact());
            customer.setCusStatus("active");
            customer.setCusProvider("local");
            customer.setCusPassword(passwordEncoder.encode(rawPassword));
            customerRepo.save(customer);
            isNewAccount = true;
        } else {
            // Gửi email xác nhận đặt lịch (không gửi mật khẩu)
            customer = optCustomer.get();
        }

        // ==== XỬ LÝ CHUẨN DỮ LIỆU GIỜ ====
        String startTimeStr = req.getStartTime();
        String endTimeStr = req.getEndTime();

        if (startTimeStr != null) {
            startTimeStr = startTimeStr.trim();
            if (startTimeStr.length() == 8)
                startTimeStr = startTimeStr.substring(0, 5);
        }
        if (endTimeStr != null) {
            endTimeStr = endTimeStr.trim();
            if (endTimeStr.length() == 8)
                endTimeStr = endTimeStr.substring(0, 5);
        }

        LocalDate workDate = LocalDate.parse(req.getAppointmentDate());
        LocalTime startTime = LocalTime.parse(startTimeStr);
        LocalTime endTime = LocalTime.parse(endTimeStr);

        // Tìm WorkSlot
        Optional<WorkSlot> optSlot = workSlotRepo.findSlotNative(
                req.getDocId(),
                workDate,
                startTime.toString(),
                endTime.toString());
        if (optSlot.isEmpty()) {
            // Không gửi mail khi đặt lịch thất bại
            throw new RuntimeException("Không tìm thấy khung giờ phù hợp!");
        }

        WorkSlot slot = optSlot.get();

        // Tạo booking
        Booking booking = new Booking();
        booking.setCusId(customer.getCusId());
        booking.setDocId(req.getDocId());
        booking.setSlotId(slot.getSlotId());
        booking.setSerId(req.getSerId());
        booking.setBookType(req.getBookType());
        booking.setBookStatus("pending");
        booking.setCreatedAt(LocalDateTime.of(workDate, startTime));
        booking.setNote(req.getNote());

        // Chỉ gửi mail khi booking save thành công
        bookingRepo.save(booking);

        if (isNewAccount) {
            sendNewAccountAndBookingEmail(customer, rawPassword, req, doctorName, serviceName);
        } else {
            sendBookingConfirmationEmail(customer, req, doctorName, serviceName);
        }

        return isNewAccount;
    }

       // Gửi email cho tài khoản mới và xác nhận đặt lịch (có mật khẩu)
    // Gửi email tài khoản mới và đặt lịch thành công (HTML, đóng khung, trang trí đẹp, có logo dùng CID)
    private void sendNewAccountAndBookingEmail(Customer customer, String password, BookingRequest req,
                                               String doctorName, String serviceName) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(customer.getCusEmail());
            helper.setSubject("Tạo tài khoản & Đặt lịch thành công trên FertilityEHR");

            String htmlContent = buildStyledEmailContentWithCID(customer, password, req, doctorName, serviceName, true);
            helper.setText(htmlContent, true); // true để gửi HTML

            // Sử dụng ResourceUtils để lấy file logo trong resources
            File logoFile = ResourceUtils.getFile("classpath:static/img/logo.png");
            System.out.println("Logo absolute path: " + logoFile.getAbsolutePath());
            System.out.println("Logo exists: " + logoFile.exists());
            if (logoFile.exists()) {
                helper.addInline("logoImage", logoFile);
            }

            mailSender.send(message);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    // Gửi email xác nhận đặt lịch (không gửi tài khoản/mật khẩu, HTML đóng khung, có logo dùng CID)
    private void sendBookingConfirmationEmail(Customer customer, BookingRequest req, String doctorName,
                                              String serviceName) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(customer.getCusEmail());
            helper.setSubject("Xác nhận đặt lịch khám trên FertilityEHR");

            String htmlContent = buildStyledEmailContentWithCID(customer, null, req, doctorName, serviceName, false);
            helper.setText(htmlContent, true);

            File logoFile = ResourceUtils.getFile("classpath:static/img/logo.png");
            System.out.println("Logo absolute path: " + logoFile.getAbsolutePath());
            System.out.println("Logo exists: " + logoFile.exists());
            if (logoFile.exists()) {
                helper.addInline("logoImage", logoFile);
            }

            mailSender.send(message);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    // Hàm dựng nội dung HTML đẹp, đóng khung, header nổi bật, có logo bên trái chữ tiêu đề
    private String buildStyledEmailContentWithCID(Customer customer, String password, BookingRequest req,
                                                  String doctorName, String serviceName, boolean includeAccount) {
        // Logo dùng CID
        String logoCid = "cid:logoImage";

        StringBuilder html = new StringBuilder();
        html.append("<div style=\"max-width:600px;margin:auto;font-family:Arial,Helvetica,sans-serif;background:#fff;\">")
                // Header/banner: logo bên trái, chữ bên phải
                .append("<div style=\"background:#2196f3;color:#fff;padding:0;border-radius:8px 8px 0 0;\">")
                .append("<div style=\"display:flex;align-items:center;justify-content:flex-start;padding:18px 24px;\">")
                .append("<img src=\"").append(logoCid).append("\" alt=\"FertilityEHR Logo\" style=\"height:60px;width:auto;display:inline-block;margin-right:16px;\">")
                .append("<span style=\"font-size:24px;font-weight:bold;letter-spacing:1px;\">FertilityEHR - Đặt lịch & Tài khoản</span>")
                .append("</div>")
                .append("</div>")
                // Main content box
                .append("<div style=\"border:1.5px solid #ddd;padding:24px;border-radius:0 0 8px 8px;\">")
                .append("<p>Xin chào <b>").append(req.getFullName()).append("</b>,</p>")
                .append("<p style=\"margin-top:0;\">");

        if (includeAccount) {
            html.append("Bạn đã được tạo tài khoản tự động và đặt lịch khám thành công trên hệ thống <b>FertilityEHR</b>.<br>")
                    .append("Vui lòng đăng nhập & đổi mật khẩu sau khi nhận được email này.");
        } else {
            html.append("Bạn đã đặt lịch khám thành công trên hệ thống <b>FertilityEHR</b>.");
        }
        html.append("</p>");

        if (includeAccount) {
            html.append("<div style=\"background:#e3f2fd;padding:12px 16px;border-radius:6px;margin-bottom:14px;\">")
                    .append("<b>Thông tin đăng nhập:</b><br>")
                    .append("Email: <b>").append(customer.getCusEmail()).append("</b><br>")
                    .append("Mật khẩu: <b>").append(password).append("</b>")
                    .append("</div>");
        }

        // Thông tin đặt lịch
        html.append("<div style=\"margin-bottom:10px;\"><b>Thông tin đặt lịch khám:</b></div>")
                .append("<table style=\"width:100%;border-collapse:collapse;font-size:15px;\">")
                .append("<tr><td style=\"padding:6px 0;width:140px;color:#2196f3;\">Họ tên</td><td>").append(req.getFullName()).append("</td></tr>")
                .append("<tr><td style=\"padding:6px 0;color:#2196f3;\">Số điện thoại</td><td>").append(req.getPhone()).append("</td></tr>")
                .append("<tr><td style=\"padding:6px 0;color:#2196f3;\">Ngày sinh</td><td>").append(req.getDob()).append("</td></tr>")
                .append("<tr><td style=\"padding:6px 0;color:#2196f3;\">Ngày khám</td><td>").append(req.getAppointmentDate()).append("</td></tr>")
                .append("<tr><td style=\"padding:6px 0;color:#2196f3;\">Khung giờ</td><td>")
                .append(req.getStartTime()).append(" - ").append(req.getEndTime()).append("</td></tr>")
                .append("<tr><td style=\"padding:6px 0;color:#2196f3;\">Bác sĩ</td><td>").append(doctorName).append("</td></tr>")
                .append("<tr><td style=\"padding:6px 0;color:#2196f3;\">Dịch vụ</td><td>").append(serviceName).append("</td></tr>")
                .append("<tr><td style=\"padding:6px 0;color:#2196f3;\">Ghi chú</td><td>")
                .append((req.getNote() == null || req.getNote().trim().isEmpty()) ? "(Không có)" : req.getNote())
                .append("</td></tr>")
                .append("</table>")
                .append("<div style=\"margin-top:18px;color:#888;font-size:13px;\">Nếu có thắc mắc, vui lòng liên hệ phòng khám để được hỗ trợ.</div>")
                .append("</div>") // end box
                .append("</div>");
        return html.toString();
    }

    // Cập nhật ghi chú và trạng thái booking
    public boolean updateNoteAndStatus(Integer bookId, String status, String note) {
        Optional<Booking> optBooking = bookingRepo.findById(bookId);
        if (optBooking.isPresent()) {
            Booking booking = optBooking.get();
            booking.setBookStatus(status);
            booking.setNote(note);
            bookingRepo.save(booking);
            return true;
        }
        return false;
    }

    // Cập nhật trạng thái booking
    public boolean updateStatus(Integer bookId, String status) {
        Optional<Booking> optBooking = bookingRepo.findById(bookId);
        if (optBooking.isPresent()) {
            Booking booking = optBooking.get();
            // Validate status value
            booking.setBookStatus(status);
            bookingRepo.save(booking);
            return true;
        }
        return false; // Booking không tồn tại
    }

    // Hàm xử lý tạo booking + gửi mail
    public Integer createFollowUpBooking(Map<String, Object> bookingData) {
        // 1. Tạo Booking
        Booking booking = new Booking();
        booking.setCusId((Integer) bookingData.get("cusId"));
        booking.setDocId((Integer) bookingData.get("docId"));
        booking.setSlotId((Integer) bookingData.get("slotId"));
        booking.setNote((String) bookingData.get("note"));
        booking.setBookType((String) bookingData.get("bookType")); // "follow-up"
        booking.setSerId((Integer) bookingData.get("serId"));
        booking.setBookStatus("confirmed");
        booking.setCreatedAt(LocalDateTime.now());

        String workDate = (String) bookingData.get("workDate");
        String startTime = (String) bookingData.get("startTime");
        String endTime = (String) bookingData.get("endTime");

        Booking saved = bookingRepo.save(booking);

        // 2. Gửi email cho bệnh nhân
        Customer customer = customerRepo.findById(booking.getCusId()).orElse(null);
        Doctor doctor = doctorRepo.findById(booking.getDocId()).orElse(null);
        com.example.project.entity.Service service = serviceRepo.findById(booking.getSerId()).orElse(null);

        if (customer != null && doctor != null) {
            sendFollowUpBookingEmail(saved, customer, doctor, service, workDate, startTime, endTime);
        }

        return saved.getBookId();
    }

    // Gửi email lịch tái khám (giống form các email khác, có logo, bảng, màu xanh)
    private void sendFollowUpBookingEmail(
            Booking booking, Customer customer, Doctor doctor,
            com.example.project.entity.Service service,
            String workDate, String startTime, String endTime
    ) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(customer.getCusEmail());
            helper.setSubject("Thông báo lịch tái khám mới");

            // Logo CID
            String logoCid = "cid:logoImage";

            // Format ngày giờ tái khám
            String thoiGian = (workDate != null && startTime != null && endTime != null)
                    ? (workDate + " (" + startTime + " - " + endTime + ")")
                    : (booking.getCreatedAt() == null ? "" : booking.getCreatedAt().toString());

            // Build HTML content (themed like các email còn lại)
            StringBuilder html = new StringBuilder();
            html.append("<div style=\"max-width:600px;margin:auto;font-family:Arial,Helvetica,sans-serif;background:#fff;\">")
                    // Header with logo and title
                    .append("<div style=\"background:#2196f3;color:#fff;padding:0;border-radius:8px 8px 0 0;\">")
                    .append("<div style=\"display:flex;align-items:center;justify-content:flex-start;padding:18px 24px;\">")
                    .append("<img src=\"").append(logoCid).append("\" alt=\"FertilityEHR Logo\" style=\"height:60px;width:auto;display:inline-block;margin-right:16px;\">")
                    .append("<span style=\"font-size:22px;font-weight:bold;letter-spacing:1px;\">FertilityEHR - Lịch tái khám</span>")
                    .append("</div>")
                    .append("</div>")
                    // Main content box
                    .append("<div style=\"border:1.5px solid #ddd;padding:24px;border-radius:0 0 8px 8px;\">")
                    .append("<p>Xin chào <b>").append(customer.getCusFullName()).append("</b>,</p>")
                    .append("<p style=\"margin-top:0;\">")
                    .append("Bác sĩ <b>").append(doctor.getDocFullName()).append("</b> đã đặt lịch tái khám cho bạn tại phòng khám <b>FertilityEHR</b>.")
                    .append("</p>")
                    // Thông tin chi tiết
                    .append("<div style=\"margin-bottom:10px;\"><b>Thông tin lịch tái khám:</b></div>")
                    .append("<table style=\"width:100%;border-collapse:collapse;font-size:15px;\">")
                    .append("<tr><td style=\"padding:6px 0;width:140px;color:#2196f3;\">Thời gian</td><td>").append(thoiGian).append("</td></tr>")
                    .append("<tr><td style=\"padding:6px 0;color:#2196f3;\">Dịch vụ</td><td>")
                    .append(service == null ? "(Không rõ)" : service.getSerName()).append("</td></tr>")
                    .append("<tr><td style=\"padding:6px 0;color:#2196f3;\">Ghi chú</td><td>")
                    .append(booking.getNote() == null || booking.getNote().trim().isEmpty() ? "(Không có)" : booking.getNote())
                    .append("</td></tr>")
                    .append("</table>")
                    .append("<div style=\"margin-top:14px;color:#888;font-size:13px;\">Vui lòng kiểm tra lại lịch cá nhân và đến đúng giờ hẹn.<br>Nếu có thắc mắc, vui lòng liên hệ phòng khám.</div>")
                    .append("</div>") // end box
                    .append("</div>");

            helper.setText(html.toString(), true);

            // Gửi logo bằng CID
            File logoFile = ResourceUtils.getFile("classpath:static/img/logo.png");
            if (logoFile.exists()) {
                helper.addInline("logoImage", logoFile);
            }

            mailSender.send(message);

            // In ra toàn bộ nội dung HTML đã gửi (in ra console)
            System.out.println("=== Nội dung email tái khám (HTML) gửi cho " + customer.getCusEmail() + " ===");
            System.out.println(html.toString());
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

}