package com.securebank.creditanalyzer.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreditScore {
    private String userId;
    private String analysisId;
    private String timestamp;
    private int creditScore;
    private List<BreakdownItem> breakdown;
    private MLMetrics mlMetrics;
    private List<String> recommendations;
    private AccountOverview accountOverview;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BreakdownItem {
        private String name;
        private int value;
        private String color;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MLMetrics {
        private double r2Score;
        private double mseScore;
        private double confidence;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AccountOverview {
        private double totalCreditLimit;
        private double currentBalance;
        private int utilizationRate;
        private int activeAccounts;
    }
}