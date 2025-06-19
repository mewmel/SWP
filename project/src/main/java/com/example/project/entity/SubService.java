package com.example.project.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "SubService")
public class SubService {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "subId")
    private Integer subId;

    @Column(name = "serId", nullable = false)
    private Integer serId;

    @Column(name = "subName", length = 100, nullable = false)
    private String subName;

    @Column(name = "subDescription", length = 255)
    private String subDescription;

    @Column(name = "estimatedDayOffset")
    private Integer estimatedDayOffset;

    @Column(name = "subPrice")
    private Integer subPrice;
}