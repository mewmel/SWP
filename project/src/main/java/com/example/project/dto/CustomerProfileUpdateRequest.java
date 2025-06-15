package com.example.project.dto;

import java.time.LocalDate;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter

public class CustomerProfileUpdateRequest {

    private String fullName;
    private String cusGender;
    private LocalDate cusDate;
    private String cusPhone;
    private String cusAddress;
    private String cusOccupation;
    private String emergencyContact;

}
