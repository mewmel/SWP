package com.example.project.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.example.project.entity.Doctor;
import com.example.project.repository.DoctorRepository;
import com.example.project.service.DoctorService;

@RestController
@RequestMapping("/api")
public class DoctorController {
    @Autowired
    private DoctorRepository doctorRepository;
    @Autowired
    private DoctorService doctorService;

    @GetMapping("/doctors")
    public List<Doctor> getAllDoctors() {
        return doctorRepository.findAll();
    }

    @GetMapping("/doctors/{id}")
    public Optional<Doctor> getDoctorById(@PathVariable Integer id) {
        return doctorRepository.findById(id);
    }

    @PostMapping("/doctors")
    public Doctor createDoctor(@RequestBody Doctor doctor) {
        return doctorService.createDoctor(doctor);
    }

    @PutMapping("/doctors/{id}")
    public Optional<Doctor> updateDoctor(@PathVariable Integer id, @RequestBody Doctor doctor) {
        return doctorService.updateDoctor(id, doctor);
    }
}