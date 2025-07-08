package com.example.project.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class BookingPatientService {

    private Integer bookId;
    private String cusName;
    private String cusPhone;
    private String cusEmail;
    private String serName;
    private LocalDateTime lastVisitDate;
}
