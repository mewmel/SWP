package com.example.project.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "Booking")
public class Booking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "bookId")
    private Integer bookId;

    @Column(name = "cusId", nullable = false)
    private Integer cusId;

    @Column(name = "docId", nullable = false)
    private Integer docId;

    @Column(name = "slotId", nullable = false)
    private Integer slotId;

    @Column(name = "bookType", length = 20, nullable = false)
    private String bookType;

    @Column(name = "bookStatus", length = 20, nullable = false)
    private String bookStatus;

    @Column(name = "createdAt", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "note", length = 1000)
    private String note;
}