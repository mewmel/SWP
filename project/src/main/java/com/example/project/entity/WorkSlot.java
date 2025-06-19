package com.example.project.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;
import java.time.LocalTime;

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