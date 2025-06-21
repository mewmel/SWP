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
@Table(name = "Manager")
public class Manager {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "maId")
    private Integer maId;

    @Column(name = "maFullName", length = 100)
    private String maFullName;

    @Column(name = "maEmail", length = 100)
    private String maEmail;

    @Column(name = "maPhone", length = 20)
    private String maPhone;

    @Column(name = "maPassword", length = 100)
    private String maPassword;

    @Column(name = "position", length = 50)
    private String position;

    @Column(name = "roles", length = 20, nullable = false)
    private String roles;    
}