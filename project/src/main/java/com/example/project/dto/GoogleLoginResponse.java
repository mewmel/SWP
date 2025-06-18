package com.example.project.dto;

public class GoogleLoginResponse {
    private String cusFullName;
    private String cusEmail;
    // private String accessToken; // Nếu muốn trả về JWT, mở dòng này

    public GoogleLoginResponse(String cusFullName, String cusEmail) {
        this.cusFullName = cusFullName;
        this.cusEmail = cusEmail;
        // this.accessToken = accessToken; // nếu dùng JWT
    }

    public String getCusFullName() {
        return cusFullName;
    }

    public void setCusFullName(String cusFullName) {
        this.cusFullName = cusFullName;
    }

    public String getCusEmail() {
        return cusEmail;
    }

    public void setCusEmail(String cusEmail) {
        this.cusEmail = cusEmail;
    }

    // public String getAccessToken() { return accessToken; }
    // public void setAccessToken(String accessToken) { this.accessToken = accessToken; }
}