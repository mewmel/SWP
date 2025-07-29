package com.example.project.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;


@Getter@Setter
@Table(name = "DrugItem")
@Entity
public class DrugItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "drugItemId")
    private Integer drugItemId;


    @Column(name = "drugId", nullable = false)
    private Integer drugId;

    @Column(name = "drugName", length = 100)
    private String drugName;

    @Column(name = "dosage", length = 50)
    private String dosage;

    @Column(name = "frequency", length = 50)
    private String frequency;

    @Column(name = "duration", length = 50)
    private String duration;

    @Column(name = "drugItemNote", length = 200)
    private String drugItemNote;
    
}
