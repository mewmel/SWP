package com.example.project.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

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
}