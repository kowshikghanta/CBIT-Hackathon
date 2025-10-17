package com.securebank.creditanalyzer.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    private String id;
    private String fullName;
    private String email;
    private String phone;
    private String passwordHash;
    private LocalDateTime createdAt;
    private LocalDateTime lastLogin;
    private CreditScoreInfo creditScore;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreditScoreInfo {
        private int value;
        private String status;
        private String lastUpdated;
    }
}