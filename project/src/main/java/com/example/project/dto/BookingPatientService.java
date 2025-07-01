package com.example.project.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class BookingPatientService {

    private Integer bookId;
    private String cusName;
    private String serName;
}
