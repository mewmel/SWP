package com.example.project.controller;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.project.entity.Doctor;
import com.example.project.entity.DoctorAvatar;
import com.example.project.entity.Image;
import com.example.project.repository.DoctorAvatarRepository;
import com.example.project.repository.DoctorRepository;
import com.example.project.repository.ImageRepository;


@RestController
@RequestMapping("/api/avatar")
public class ImageController {

     @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private ImageRepository imageRepository;

    @Autowired
    private DoctorAvatarRepository doctorAvatarRepository;

    // ----------- API UPLOAD ẢNH ĐẠI DIỆN -----------
    @PostMapping("/upload-doctor-avatar/{docId}")
    public ResponseEntity<?> uploadAvatar(
            @PathVariable Integer docId,
            @RequestParam("avatar") MultipartFile file
    ) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body("File rỗng");
            }
            if (file.getSize() > 5 * 1024 * 1024) {
                return ResponseEntity.badRequest().body("Ảnh quá lớn, tối đa 5MB");
            }

            // Kiểm tra doctor tồn tại
            Optional<Doctor> doctorOpt = doctorRepository.findById(docId);
            if (doctorOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
            }

            // Lưu ảnh vào Image
            Image image = new Image();
            image.setImageData(file.getBytes());
            image.setImageMimeType(file.getContentType());
            imageRepository.save(image);

            // Xử lý avatar:
            // 1. Deactivate all old avatars
            doctorAvatarRepository.deactivateAllAvatarsByDocId(docId);

            // 2. Save new avatar with isActive = true (như cũ)
            DoctorAvatar avatar = new DoctorAvatar();
            avatar.setDoctor(doctorOpt.get());
            avatar.setImage(image);
            avatar.setIsActive(true); // Chỉ duy nhất cái mới là true
            avatar.setCreatedAt(LocalDateTime.now() );
            doctorAvatarRepository.save(avatar);

            return ResponseEntity.ok().body("Upload thành công");
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Upload thất bại");
        }
    }

    // ----------- API LẤY AVATAR ĐANG DÙNG -----------
    @GetMapping("/doctor-avatar/{docId}")
    public ResponseEntity<?> getAvatar(@PathVariable Integer docId) {
        Optional<DoctorAvatar> avatarOpt = doctorAvatarRepository.findActiveAvatarByDoctorId(docId);
        if (avatarOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Image image = avatarOpt.get().getImage();
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(image.getImageMimeType()))
                .body(image.getImageData());
    }
}
