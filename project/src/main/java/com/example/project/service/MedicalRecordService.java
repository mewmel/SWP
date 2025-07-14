package com.example.project.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.project.entity.MedicalRecord;
import com.example.project.repository.MedicalRecordRepository;

@Service
public class MedicalRecordService {
    @Autowired
    private MedicalRecordRepository medicalRecordRepository;


    public boolean updateMedicalRecord(Integer recordId, MedicalRecord req) {
    MedicalRecord mr = medicalRecordRepository.findById(recordId).orElse(null);
    if (mr == null) return false;
    mr.setRecordStatus(req.getRecordStatus());
    mr.setCreatedAt(req.getCreatedAt());
    mr.setDiagnosis(req.getDiagnosis());
    mr.setTreatmentPlan(req.getTreatmentPlan());
    mr.setDischargeDate(req.getDischargeDate());
    mr.setNote(req.getNote());
    medicalRecordRepository.save(mr);
    return true;
}

}
