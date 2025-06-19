package com.example.project.dto;

public class RegisterRequest {
    private String cusFullName;
    private String cusEmail;
    private String cusPassword;
    private String confirmPassword;
    private String cusPhone;
    private String cusDob; // yyyy-MM-dd

    // Getters and setters
    public String getCusFullName() { return cusFullName; }
    public void setCusFullName(String cusFullName) { this.cusFullName = cusFullName; }
    public String getCusEmail() { return cusEmail; }
    public void setCusEmail(String cusEmail) { this.cusEmail = cusEmail; }
    public String getCusPassword() { return cusPassword; }
    public void setCusPassword(String cusPassword) { this.cusPassword = cusPassword; }
    public String getConfirmPassword() { return confirmPassword; }
    public void setConfirmPassword(String confirmPassword) { this.confirmPassword = confirmPassword; }
    public String getCusPhone() { return cusPhone; }
    public void setCusPhone(String cusPhone) { this.cusPhone = cusPhone; }
    public String getCusDob() { return cusDob; }
    public void setCusDob(String cusDob) { this.cusDob = cusDob; }
}