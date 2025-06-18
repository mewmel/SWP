package com.example.project.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ConfigController {
    @Value("${google.client.id}")
    private String googleClientId;

    @GetMapping("/api/config/google-client-id")
    public String getGoogleClientId() {
        return googleClientId;
    }
}