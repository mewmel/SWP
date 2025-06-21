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
@Table(name = "BookingStep")
public class BookingStep {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "bookingStepId")
    private Integer bookingStepId;

    @Column(name = "bookId", nullable = false)
    private Integer bookId;

    @Column(name = "subId", nullable = false)
    private Integer subId;

    @Column(name = "performedAt")
    private LocalDateTime performedAt;

    @Column(name = "result", length = 500)
    private String result;

    @Column(name = "note", length = 500)
    private String note;

    @Column(name = "drugId")
    private Integer drugId;
}