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

    @Column(name = "recordStatus", length = 20, nullable = false)
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