package com.example.project.entity;

import jakarta.persistence.*;
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

    @Column(name = "maPassword", length = 100)
    private String maPassword;

    @Column(name = "maPhone", length = 20)
    private String maPhone;

    @Column(name = "position", length = 50)
    private String position;
}