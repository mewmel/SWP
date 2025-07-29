package com.example.project.dto;

import lombok.Getter;
import lombok.Setter;
@Getter
@Setter
public class StaffLoginRequest {

    private String email;
    private String password;
    private String role;

}