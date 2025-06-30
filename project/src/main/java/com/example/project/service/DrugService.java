package com.example.project.service;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.project.entity.Drug;
import com.example.project.repository.DrugRepository;

@Service
public class DrugService {
    @Autowired
    private DrugRepository drugRepo;

    /**
     * Cập nhật thông tin Drug theo bookId
     * @param bookId ID của booking
     * @param drug Thông tin Drug mới
     * @return true nếu cập nhật thành công, false nếu không tìm thấy Drug
     */
    public boolean updateDrug(Integer bookId, Drug drug) {
        // Tìm kiếm drug theo bookId
        Optional<Drug> existingDrugOpt = drugRepo.findByBookId(bookId);
        if (!existingDrugOpt.isPresent()) return false;

        Drug existingDrug = existingDrugOpt.get();
        // Cập nhật thông tin drug
        existingDrug.setDrugName(drug.getDrugName());
        existingDrug.setFrequency(drug.getFrequency());
        existingDrug.setDuration(drug.getDuration());
        existingDrug.setNote(drug.getNote());
        existingDrug.setDosage(drug.getDosage());

        drugRepo.save(existingDrug);
        return true;
    }

}