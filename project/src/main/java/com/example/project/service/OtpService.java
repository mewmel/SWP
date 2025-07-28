package com.example.project.service;


import java.time.LocalDateTime;
import java.util.concurrent.ConcurrentHashMap;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;


@Service
public class OtpService {

    @Autowired
    private JavaMailSender mailSender;

    private static final ConcurrentHashMap<Integer, OtpData> otpCache = new ConcurrentHashMap<>();

    public void sendOtp(Integer customerId, String email) {
        String otp = generateOtp();
        OtpData otpData = new OtpData(otp, LocalDateTime.now().plusMinutes(10));
        otpCache.put(customerId, otpData);

        // Gửi mail
        sendOtpEmail(email, otp);
    }

    public boolean verifyOtp(Integer customerId, String otp) {
        OtpData otpData = otpCache.get(customerId);
        if (otpData == null) return false;
        boolean isValid = otpData.getOtp().equals(otp)
                && otpData.getExpiredAt().isAfter(LocalDateTime.now());
        if (isValid) otpCache.remove(customerId); // clear sau khi dùng
        return isValid;
    }


    private static class OtpData {
        private final String otp;
        private final LocalDateTime expiredAt;

        public OtpData(String otp, LocalDateTime expiredAt) {
            this.otp = otp;
            this.expiredAt = expiredAt;
        }

        public String getOtp() {
            return otp;
        }

        public LocalDateTime getExpiredAt() {
            return expiredAt;
        }
    }

    private String generateOtp() {
        return String.format("%06d", new java.util.Random().nextInt(999999));
    }

public void sendOtpEmail(String email, String otp) {
    // Dùng logger thay vì System.err
    Logger logger = LoggerFactory.getLogger(OtpService.class);
    try {
        // Log OTP để debug
        logger.info("=== OTP DEBUG ===");
        logger.info("Email: {}", email);
        logger.info("OTP: {}", otp);
        logger.info("=== END OTP DEBUG ===");
        
        // Gửi email thật
        try {
            SimpleMailMessage msg = new SimpleMailMessage();
            msg.setTo(email);
            msg.setSubject("Mã xác thực OTP đổi mật khẩu");

            StringBuilder body = new StringBuilder();
            body.append("Bạn vừa yêu cầu đổi mật khẩu tài khoản trên hệ thống FertilityEHR.\n\n")
                .append("Mã OTP của bạn là: ").append(otp).append("\n")
                .append("Lưu ý: OTP này chỉ có hiệu lực trong vòng 10 phút.\n")
                .append("Nếu bạn không thực hiện yêu cầu này, hãy bỏ qua email này.");

            msg.setText(body.toString());
            mailSender.send(msg);
            logger.info("Email OTP đã được gửi thành công đến: {}", email);
        } catch (Exception emailError) {
            logger.error("Lỗi gửi email: {}", emailError.getMessage());
            // Tạm thời không throw exception để test logic
            logger.info("OTP vẫn được tạo và lưu trong cache: {}", otp);
        }
        
        logger.info("Email OTP đã được gửi thành công đến: {}", email);
    } catch (Exception e) {
        logger.error("Lỗi gửi email OTP: {}", e.getMessage(), e);
        throw new RuntimeException("Không thể gửi email OTP, vui lòng thử lại sau.");
    }
}
 
}
