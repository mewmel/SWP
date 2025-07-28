package com.example.project.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "DoctorAvatar")
public class DoctorAvatar {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer docAvatarId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "docId", nullable = false)
    private Doctor doctor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "imageId", nullable = false)
    private Image image;

    @Column(nullable = false)
    private Boolean isActive = false;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
