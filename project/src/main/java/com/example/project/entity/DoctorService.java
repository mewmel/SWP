package com.example.project.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "DoctorService")
@IdClass(DoctorServiceId.class)
public class DoctorService {
    @Id
    @Column(name = "docId")
    private Integer docId;

    @Id
    @Column(name = "serId")
    private Integer serId;
}