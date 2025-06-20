package com.example.project.service;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.project.entity.Manager;
import com.example.project.repository.ManagerRepository;

@Service
public class ManagerService {
    @Autowired
    private ManagerRepository managerRepository;
    
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public Optional<Manager> login(String email, String password) {
        Optional<Manager> managerOpt = managerRepository.findByMaEmail(email);
        if (managerOpt.isPresent()) {
            Manager manager = managerOpt.get();
            if (passwordEncoder.matches(password, manager.getMaPassword())) {
                return Optional.of(manager);
            }
        }
        return Optional.empty();
    }
}