package com.example.project.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "MedicalRecord")
public class MedicalRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "recordId")
    private Integer recordId;

    @Column(name = "cusId")
    private Integer cusId;

    @Column(name = "docId")
    private Integer docId;

    @Column(name = "serId")
    private Integer serId;

    @Column(name = "createdAt")
    private LocalDateTime createdAt;

    @Column(name = "recordStatus", length = 50, nullable = false)
    private String recordStatus;

    @Column(name = "note", length = 1000)
    private String note;

    @Column(name = "diagnosis", length = 500)
    private String diagnosis;

    @Column(name = "treatmentPlan", length = 1000)
    private String treatmentPlan;

    @Column(name = "dischargeDate")
    private LocalDateTime dischargeDate;
}