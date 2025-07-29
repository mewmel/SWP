package com.example.project.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class VerifyPasswordRequest {
    private String currentPassword;
}