package com.example.project.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "Feedback")
public class Feedback {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "feedbackId")
    private Integer feedbackId;

    @Column(name = "cusId", nullable = false)
    private Integer cusId;

    @Column(name = "docId", nullable = false)
    private Integer docId;

    @Column(name = "serId", nullable = false)
    private Integer serId;

    @Column(name = "rating", nullable = false)
    private Integer rating;

    @Column(name = "comment", length = 1000)
    private String comment;

    @Column(name = "feedback_date")
    private LocalDateTime feedbackDate;
}