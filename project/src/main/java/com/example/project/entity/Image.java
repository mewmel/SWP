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
@Table(name = "Image")
public class Image {

        @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "imageId")
    private Integer imageId;

    @Column(name = "docId", nullable = false)
    private Integer docId;

    @Column(name = "imageData", nullable = false)
    private byte[] imageData;

    @Column(name = "imageMimeType", length = 100, nullable = false)
    private String imageMimeType;


}
