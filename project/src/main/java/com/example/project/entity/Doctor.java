package com.example.project.entity;

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
@Table(name = "Doctor")
public class Doctor {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "docId")
    private Integer docId;

    @Column(name = "docFullName", length = 100)
    private String docFullName;

    @Column(name = "docEmail", length = 100)
    private String docEmail;

    @Column(name = "docPhone", length = 20)
    private String docPhone;

    @Column(name = "docPassword", length = 100)
    private String docPassword;

    @Column(name = "expertise", length = 100)
    private String expertise;

    @Column(name = "degree", length = 500)
    private String degree;

    @Column(name = "profileDescription", length = 1000)
    private String profileDescription;
}