package com.example.project.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoginRequest {
    private String cusEmail;
    private String cusPassword;
}
