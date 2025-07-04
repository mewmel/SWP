package com.example.project.service;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.project.entity.Doctor;
import com.example.project.repository.DoctorRepository;

@Service
public class DoctorService {
    @Autowired
    private DoctorRepository doctorRepository;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public Optional<Doctor> login(String email, String password) {
        Optional<Doctor> doctorOpt = doctorRepository.findByDocEmail(email);
        if (doctorOpt.isPresent()) {
            Doctor doctor = doctorOpt.get();
            if (passwordEncoder.matches(password, doctor.getDocPassword())) {
                return Optional.of(doctor);
            }
        }
        return Optional.empty();
    }

    // Tạo mới bác sĩ (từ JSON, có thể có mật khẩu)
    public Doctor createDoctor(Doctor doctor) {
        // Hash password nếu có nhập mới
        if (doctor.getDocPassword() != null && !doctor.getDocPassword().isEmpty()) {
            doctor.setDocPassword(passwordEncoder.encode(doctor.getDocPassword()));
        } else {
            // Nếu không nhập, có thể cho giá trị mặc định hoặc bỏ qua
            doctor.setDocPassword(""); // hoặc null tùy bạn
        }
        return doctorRepository.save(doctor);
    }

    // Update, nếu docPassword rỗng hoặc null thì giữ nguyên password cũ
    public Optional<Doctor> updateDoctor(Integer id, Doctor doctorUpdate) {
        return doctorRepository.findById(id).map(doctor -> {
            doctor.setDocFullName(doctorUpdate.getDocFullName());
            doctor.setDocEmail(doctorUpdate.getDocEmail());
            doctor.setDocPhone(doctorUpdate.getDocPhone());
            doctor.setExpertise(doctorUpdate.getExpertise());
            doctor.setDegree(doctorUpdate.getDegree());
            doctor.setProfileDescription(doctorUpdate.getProfileDescription());
            // Nếu có nhập password mới thì hash lại, nếu không thì giữ nguyên
            if (doctorUpdate.getDocPassword() != null && !doctorUpdate.getDocPassword().isEmpty()) {
                doctor.setDocPassword(passwordEncoder.encode(doctorUpdate.getDocPassword()));
            }
            // Nếu không nhập password mới -> giữ nguyên password cũ
            return doctorRepository.save(doctor);
        });
    }
}