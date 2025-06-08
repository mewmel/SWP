package com.example.project.dto;



public class RegisterRequest {
    private String cusFullName;
    private String cusEmail;
    private String cusPassword;
    private String confirmPassword;

    // Getters and setters
    public String getCusFullName() { return cusFullName; }
    public void setCusFullName(String cusFullName) { this.cusFullName = cusFullName; }
    public String getCusEmail() { return cusEmail; }
    public void setCusEmail(String cusEmail) { this.cusEmail = cusEmail; }
    public String getCusPassword() { return cusPassword; }
    public void setCusPassword(String cusPassword) { this.cusPassword = cusPassword; }
    public String getConfirmPassword() { return confirmPassword; }
    public void setConfirmPassword(String confirmPassword) { this.confirmPassword = confirmPassword; }
}