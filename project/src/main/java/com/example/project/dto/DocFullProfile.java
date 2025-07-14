package com.example.project.dto;


import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
// Dùng show ttin bác sĩ trong hồ sơ cá nhân
public class DocFullProfile {
    private Integer docId;
    private String docFullName;
    private String docEmail;
    private String docPhone;
    private String expertise;
    private String degree;
    private String profileDescription;
    private byte[] imageData;
    private String imageMimeType;

    
    // Danh sách dịch vụ hiện tại của bác sĩ
    private List<CurrentService> currentService;

    

    @Getter
    @Setter
    public static class CurrentService {
    private int serId;
    private String serName;
    }
    
}
