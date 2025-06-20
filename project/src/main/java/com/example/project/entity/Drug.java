package com.example.project.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "Drug")
public class Drug {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "drugId")
    private Integer drugId;

    @Column(name = "bookId", nullable = false)
    private Integer bookId;

    @Column(name = "docId", nullable = false)
    private Integer docId;

    @Column(name = "cusId", nullable = false)
    private Integer cusId;

    @Column(name = "drugName", length = 100, nullable = false)
    private String drugName;

    @Column(name = "dosage", length = 50, nullable = false)
    private String dosage;

    @Column(name = "frequency", length = 50, nullable = false)
    private String frequency;

    @Column(name = "duration", length = 50, nullable = false)
    private String duration;

    @Column(name = "note", length = 200)
    private String note;

    @Column(name = "createdAt")
    private LocalDateTime createdAt;
}