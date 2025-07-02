package com.example.project.service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.project.repository.DrugItemRepository;

@Service
public class DrugService {
    @Autowired
    private DrugItemRepository drugItemRepository;


    // /**
    //  * Cập nhật thông tin Drug theo bookId
    //  * @param bookId ID của booking
    //  * @param drug Thông tin Drug mới
    //  * @return true nếu cập nhật thành công, false nếu không tìm thấy Drug
    //  */
    // public boolean updateDrugItem(Integer bookId, Drug drug) {
    //     // Tìm kiếm drug theo bookId
    //     List<DrugItem> existingDrugOpt = drugItemRepository.findByDrugId(drug.getDrugId());
    //     if (existingDrugOpt.isEmpty()) return false;

    //     DrugItem existingDrug = existingDrugOpt.get(0);
    //     // Cập nhật thông tin drug
    //     existingDrug.setDrugName(drug.getDrugName());
    //     existingDrug.setFrequency(drug.getFrequency());
    //     existingDrug.setDuration(drug.getDuration());
    //     existingDrug.setNote(drug.getNote());
    //     existingDrug.setDosage(drug.getDosage());

    //     drugItemRepository.save(existingDrug);
    //     return true;
    // }

}