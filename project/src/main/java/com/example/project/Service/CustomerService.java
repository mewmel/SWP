package com.example.project.service;

import java.time.LocalDate;
import java.util.Optional;
import java.util.regex.Pattern;

import org.apache.commons.lang3.RandomStringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.project.dto.LoginRequest;
import com.example.project.dto.RegisterRequest;
import com.example.project.entity.Customer;
import com.example.project.repository.CustomerRepository;

@Service
public class CustomerService {
    @Autowired
    private CustomerRepository customerRepository;
    private JavaMailSender mailSender;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public Optional<Customer> login(LoginRequest request) {
        Optional<Customer> customerOpt = customerRepository.findByCusEmail(request.getCusEmail());
        if (customerOpt.isPresent()) {
            Customer customer = customerOpt.get();
            if (passwordEncoder.matches(request.getCusPassword(), customer.getCusPassword())) {
                return Optional.of(customer);
            }
        }
        return Optional.empty();
    }

    public String register(RegisterRequest req) {
        // Validate
        if (req.getCusFullName() == null || req.getCusFullName().isEmpty()
                || req.getCusEmail() == null || req.getCusEmail().isEmpty()
                || req.getCusPassword() == null || req.getCusPassword().isEmpty()
                || req.getConfirmPassword() == null || req.getConfirmPassword().isEmpty()
                || req.getCusPhone() == null || req.getCusPhone().isEmpty()
                || req.getCusDob() == null || req.getCusDob().isEmpty()) {
            return "Vui lòng nhập đầy đủ tất cả các trường!";
        }
        if (!isValidEmail(req.getCusEmail())) {
            return "Email không hợp lệ!";
        }
        if (!isValidPhone(req.getCusPhone())) {
            return "Số điện thoại không hợp lệ!";
        }
        if (!req.getCusPassword().equals(req.getConfirmPassword())) {
            return "Mật khẩu xác nhận không khớp!";
        }
        if (customerRepository.findByCusEmail(req.getCusEmail()).isPresent()) {
            return "email_exists";
        }

        LocalDate dob = null;
        try {
            dob = LocalDate.parse(req.getCusDob());
        } catch (Exception ex) {
            return "Ngày sinh không hợp lệ!";
        }

        Customer customer = new Customer();
        customer.setCusFullName(req.getCusFullName());
        customer.setCusEmail(req.getCusEmail());
        customer.setCusPassword(passwordEncoder.encode(req.getCusPassword()));
        customer.setCusPhone(req.getCusPhone());
        customer.setCusDate(dob);
        customer.setCusGender(null);
        customer.setCusAddress(null);
        customer.setCusStatus("active"); // chỉ set là  "active" hoặc "inactive"

        customerRepository.save(customer);
        return "success";
    }
    public Customer updateCustomer(Integer cusId, Customer updatedData) {
    Optional<Customer> customerOpt = customerRepository.findByCusId(cusId);
    if (!customerOpt.isPresent()) return null;
    Customer customer = customerOpt.get();

    // tạm chưa cho update email và password!
    customer.setCusFullName(updatedData.getCusFullName());
    customer.setCusGender(updatedData.getCusGender());
    customer.setCusDate(updatedData.getCusDate());
    customer.setCusPhone(updatedData.getCusPhone());
    customer.setCusOccupation(updatedData.getCusOccupation());
    customer.setCusAddress(updatedData.getCusAddress());
    customer.setEmergencyContact(updatedData.getEmergencyContact());

    // Có thể validate số điện thoại, ngày sinh... nếu muốn

    return customerRepository.save(customer);
}


    private boolean isValidEmail(String email) {
        return Pattern.matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$", email);
    }
    private boolean isValidPhone(String phone) {
        return Pattern.matches("^(0|\\+84)\\d{9,10}$", phone);
    }

    public Customer findOrCreateGoogleUser(String email, String name) {
        Optional<Customer> customerOpt = customerRepository.findByCusEmail(email);
        if (customerOpt.isPresent()) {
            return customerOpt.get();
        } else {
            Customer customer = new Customer();
            customer.setCusFullName(name);
            customer.setCusEmail(email);
            customer.setCusStatus("active");
            customerRepository.save(customer);
            return customer;
        }
    }

    private void sendNewPasswordEmail(String to, String newPassword) {
    SimpleMailMessage msg = new SimpleMailMessage();
    msg.setTo(to);
    msg.setSubject("Mật khẩu mới từ FertilityEHR");
    msg.setText(
        "Bạn vừa yêu cầu cấp lại mật khẩu cho tài khoản trên hệ thống phòng khám FertilityEHR.\n"
        + "Mật khẩu mới của bạn là: " + newPassword
        + "\nVui lòng đăng nhập và đổi mật khẩu sau khi nhận được email này."
    );
    mailSender.send(msg);
}

    public boolean resetPassword(String email) {
    Optional<Customer> optCustomer = customerRepository.findByCusEmail(email);
    if (optCustomer.isEmpty()) return false;

    Customer customer = optCustomer.get();
    String newRawPassword = RandomStringUtils.randomAlphanumeric(8);
    customer.setCusPassword(passwordEncoder.encode(newRawPassword));
    customerRepository.save(customer);

    // Gửi email mật khẩu mới cho user (viết hàm gửi mail riêng)
    sendNewPasswordEmail(customer.getCusEmail(), newRawPassword);
    return true;
}

public boolean changePassword(String email, String oldPassword, String newPassword) {
    Optional<Customer> optCustomer = customerRepository.findByCusEmail(email);
    if (optCustomer.isEmpty()) return false;

    Customer customer = optCustomer.get();
    // Kiểm tra mật khẩu cũ
    if (!passwordEncoder.matches(oldPassword, customer.getCusPassword())) {
        return false;
    }
    // Lưu mật khẩu mới
    customer.setCusPassword(passwordEncoder.encode(newPassword));
    customerRepository.save(customer);
    return true;
}

}
