package com.example.project.controller;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.project.entity.Drug;
import com.example.project.service.DrugService;

@RestController
@RequestMapping("/api/drugs")
public class DrugController {

@Autowired
    private DrugService drugService;

    

    // PUT /api/drugs/update-with-booking/{bookId}
    @PutMapping("/update-with-booking/{bookId}")
    public ResponseEntity<?> updateDrug(
            @PathVariable Integer bookId, @RequestBody Drug drug) {
        boolean ok = drugService.updateDrug(bookId, drug);
        if (ok) return ResponseEntity.ok().build();
        return ResponseEntity.status(404).body("Drug not found");
    }   
}
