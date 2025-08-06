package com.example.project.dto;

import java.time.LocalDateTime;

public class PatientProfileDto {
    private Integer cusId;
    private LocalDateTime ngayDangKy;
    private String bacSiPhuTrach;
    private String bacSiEmail;
    private Integer chuKyHienTai;

    public PatientProfileDto(Integer cusId, LocalDateTime ngayDangKy, String bacSiPhuTrach, String bacSiEmail, Integer chuKyHienTai) {
        this.cusId = cusId;
        this.ngayDangKy = ngayDangKy;
        this.bacSiPhuTrach = bacSiPhuTrach;
        this.bacSiEmail = bacSiEmail;
        this.chuKyHienTai = chuKyHienTai;
    }
    // Getter, Setter
    public Integer getCusId() { return cusId; }
    public void setCusId(Integer cusId) { this.cusId = cusId; }
    public LocalDateTime getNgayDangKy() { return ngayDangKy; }
    public void setNgayDangKy(LocalDateTime ngayDangKy) { this.ngayDangKy = ngayDangKy; }
    public String getBacSiPhuTrach() { return bacSiPhuTrach; }
    public void setBacSiPhuTrach(String bacSiPhuTrach) { this.bacSiPhuTrach = bacSiPhuTrach; }
    public String getBacSiEmail() { return bacSiEmail; }
    public void setBacSiEmail(String bacSiEmail) { this.bacSiEmail = bacSiEmail; }
    public Integer getChuKyHienTai() { return chuKyHienTai; }
    public void setChuKyHienTai(Integer chuKyHienTai) { this.chuKyHienTai = chuKyHienTai; }
}