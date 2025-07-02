package com.example.project.service;

import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.project.dto.DocFullProfile;
import com.example.project.entity.Doctor;
import com.example.project.entity.DoctorService;
import com.example.project.entity.Image;
import com.example.project.repository.DoctorRepository;
import com.example.project.repository.DoctorServiceRepository;
import com.example.project.repository.ServiceRepository;
import com.example.project.repository.ImageRepository;


@Service
public class DoctorManagementService {
    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private DoctorServiceRepository doctorServiceRepository;

    @Autowired
    private ServiceRepository serviceRepository;

    @Autowired
    private ImageRepository imageRepository;
    
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

    /**
     * Lấy đầy đủ hồ sơ bác sĩ, bao gồm service hiện tại
     */
    public DocFullProfile getFullProfile(Integer docId) {
        // 1) Lấy Doctor chính
        Optional<Doctor> doctorOpt = doctorRepository.findById(docId);
        if (!doctorOpt.isPresent()) {
            Doctor d = doctorOpt.get();

            // Map thông tin cơ bản
            DocFullProfile dto = new DocFullProfile();
            dto.setDocId(d.getDocId());
            dto.setDocFullName(d.getDocFullName());
            dto.setDocEmail(d.getDocEmail());
            dto.setDocPhone(d.getDocPhone());
            dto.setExpertise(d.getExpertise());
            dto.setDegree(d.getDegree());
            dto.setProfileDescription(d.getProfileDescription());

// 3) Lấy tất cả record DoctorService
        List<DoctorService> dsList = doctorServiceRepository.findByDocId(docId);

        // Map từng DoctorService -> CurrentService
    List<DocFullProfile.CurrentService> csList = dsList.stream()
      .map(docServ -> 
        serviceRepository.findBySerId(docServ.getSerId())
          .map(svc -> {
            DocFullProfile.CurrentService cs = new DocFullProfile.CurrentService();
            cs.setSerId(svc.getSerId());
            cs.setSerName(svc.getSerName());
            return cs;
          })
          .orElse(null)
      )
      .filter(Objects::nonNull)
      .collect(Collectors.toList());

    dto.setCurrentService(csList);

         // 4) Lấy ảnh đầu tiên (nếu có)
        List<Image> images = imageRepository.findByDocId(docId);
        if (!images.isEmpty()) {
            Image img = images.get(0);
            dto.setImageData(img.getImageData());
        }
    return dto;
        } else {
            return null; // ném exception ra 
        }
    }
    }