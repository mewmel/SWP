package com.example.project.controller;

import com.example.project.entity.Service;
import com.example.project.entity.SubService;
import com.example.project.repository.ServiceRepository;
import com.example.project.repository.SubServiceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api")
public class ServiceController {
    @Autowired
    private ServiceRepository serviceRepo;
    
    @Autowired
    private SubServiceRepository subServiceRepo;

    @GetMapping("/services")
    public List<Service> getAllServices() {
        return serviceRepo.findAll();
    }
    
    @GetMapping("/subservices")
    public List<SubService> getAllSubServices() {
        return subServiceRepo.findAll();
    }
    
    @GetMapping("/subservices/by-service/{serId}")
    public List<SubService> getSubServicesByService(@PathVariable Integer serId) {
        return subServiceRepo.findBySerId(serId);
    }
}