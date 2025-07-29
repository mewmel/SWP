package com.example.project.dto;

import java.time.LocalTime;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;


@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class BookingPatientService {

    private Integer bookId;
    private String cusName;
    private String cusPhone;
    private String cusEmail;
    private String serName;   
    private LocalTime startTime;

}
