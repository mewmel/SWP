package com.example.project.dto;

import lombok.Getter;
import lombok.Setter;
@Getter
@Setter
public class ChangePasswordRequest {
    
    private String currentPassword;
    private String newPassword;
    private String otp;

}
