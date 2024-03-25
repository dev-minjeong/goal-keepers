package com.goalkeepers.server.config;

import java.io.InputStream;
import java.io.ByteArrayInputStream;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Order(1)
@Service
public class FirebaseConfig {
    
    @Value("${app.firebase-configuration-json}")
    private String firebaseCredentialsJson;

    @Value("${app.firebase-bucket}")
    private String firebaseBucket;

    @PostConstruct
    public void init() {
        try {
            log.info("----------Firebase start----------");
            InputStream serviceAccount = new ByteArrayInputStream(firebaseCredentialsJson.getBytes());
            FirebaseOptions options = FirebaseOptions.builder()
                                        .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                                        .setStorageBucket(firebaseBucket)
                                        .build();
            if(FirebaseApp.getApps().isEmpty()) {
                FirebaseApp.initializeApp(options);
                log.info("Firebase has been initialized");
            }

        } catch (Exception e) {
            log.error("Error initializing Firebase: {}", e.getMessage());
        }
    }
}
