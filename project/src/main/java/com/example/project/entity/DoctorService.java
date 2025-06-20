package com.example.project.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;
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