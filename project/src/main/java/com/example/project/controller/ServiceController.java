package com.example.project.controller;

import com.example.project.entity.Service;
import com.example.project.repository.ServiceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api")
public class ServiceController {
    @Autowired
    private ServiceRepository serviceRepo;

    @GetMapping("/services")
    public List<Service> getAllServices() {
        return serviceRepo.findAll();
    }
}