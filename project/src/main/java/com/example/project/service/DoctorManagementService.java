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
import com.example.project.repository.DoctorRepository;
import com.example.project.repository.DoctorServiceRepository;
import com.example.project.repository.ServiceRepository;


@Service
public class DoctorManagementService {
    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private DoctorServiceRepository doctorServiceRepository;

    @Autowired
    private ServiceRepository serviceRepository;


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

    /**
     * Lấy đầy đủ hồ sơ bác sĩ, bao gồm service hiện tại
     */
 public DocFullProfile getFullProfile(Integer docId) {
    // 1. Lấy Doctor
    Optional<Doctor> doctorOpt = doctorRepository.findByDocId(docId);
    if (!doctorOpt.isPresent()) {
        // Có thể throw NotFoundException ở đây nếu muốn
        return null;
    }
    Doctor d = doctorOpt.get();

    // 2. Map thông tin cơ bản
    DocFullProfile dto = new DocFullProfile();
    dto.setDocId(d.getDocId());
    dto.setDocFullName(d.getDocFullName());
    dto.setDocEmail(d.getDocEmail());
    dto.setDocPhone(d.getDocPhone());
    dto.setExpertise(d.getExpertise());
    dto.setDegree(d.getDegree());
    dto.setProfileDescription(d.getProfileDescription());

    // 3. Map service hiện tại
    List<DoctorService> dsList = doctorServiceRepository.findByDocId(docId);

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

    // // 4. Lấy avatar hiện tại (isActive = true)
    // Optional<DoctorAvatar> avatarOpt = doctorAvatarRepository.findActiveAvatarByDoctorId(docId);
    // if (avatarOpt.isPresent()) {
    //     Image img = avatarOpt.get().getImage();
    //     dto.setCurrentAvatar(img.getImageData());
    // } else {
    //     dto.setCurrentAvatar(null); // hoặc có thể để mặc định
    // }

    return dto;
}



    }