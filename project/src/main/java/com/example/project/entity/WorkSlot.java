package com.example.project.entity;

import java.time.LocalDate;
import java.time.LocalTime;

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
@Table(name = "WorkSlot")
public class WorkSlot {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "slotId")
    private Integer slotId;

    @Column(name = "docId", nullable = false)
    private Integer docId;

    @Column(name = "maId")
    private Integer maId;

    @Column(name = "workDate", nullable = false)
    private LocalDate workDate;

    @Column(name = "startTime", nullable = false)
    private LocalTime startTime;

    @Column(name = "endTime", nullable = false)
    private LocalTime endTime;

    @Column(name = "maxPatient", nullable = false)
    private Integer maxPatient;

    @Column(name = "slotStatus", length = 20, nullable = false)
    private String slotStatus;
}