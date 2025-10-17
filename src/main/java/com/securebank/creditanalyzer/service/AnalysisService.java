package com.securebank.creditanalyzer.service;

import com.securebank.creditanalyzer.model.CreditScore;
import com.securebank.creditanalyzer.repository.CreditScoreRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Random;

@Service
public class AnalysisService {

    @Autowired
    private CreditScoreRepository creditScoreRepository;

    @Autowired
    private PythonMLService pythonMLService;

    @Autowired
    private UserService userService;

    public CreditScore analyzeCredit(String userId, String csvFilePath) {
        // Run Python ML analysis
        Map<String, Object> mlResult = pythonMLService.runAnalysis(csvFilePath);

        // Generate credit score based on ML results
        double r2Score = (double) mlResult.getOrDefault("r2Score", 0.85);
        double mseScore = (double) mlResult.getOrDefault("mseScore", 250.0);

        // Calculate credit score (simplified logic)
        int creditScore = calculateCreditScore(r2Score, mseScore);
        String status = getCreditStatus(creditScore);

        // Create analysis result
        CreditScore analysis = new CreditScore();
        analysis.setUserId(userId);
        analysis.setTimestamp(LocalDateTime.now().toString());
        analysis.setCreditScore(creditScore);

        // Generate breakdown
        analysis.setBreakdown(generateBreakdown());

        // Set ML metrics
        CreditScore.MLMetrics metrics = new CreditScore.MLMetrics();
        metrics.setR2Score(r2Score);
        metrics.setMseScore(mseScore);
        metrics.setConfidence(Math.min(0.95, r2Score + 0.05));
        analysis.setMlMetrics(metrics);

        // Generate recommendations
        analysis.setRecommendations(generateRecommendations(creditScore));

        // Generate account overview
        analysis.setAccountOverview(generateAccountOverview(creditScore));

        // Save analysis
        creditScoreRepository.save(analysis);

        // Update user's credit score
        userService.updateCreditScore(userId, creditScore, status);

        return analysis;
    }

    private int calculateCreditScore(double r2Score, double mseScore) {
        // Base score from R²
        int baseScore = (int) (r2Score * 600) + 300;

        // Adjust based on MSE (lower is better)
        int adjustment = (int) Math.max(-100, 100 - (mseScore / 5));

        int finalScore = baseScore + adjustment;
        return Math.min(850, Math.max(300, finalScore));
    }

    private String getCreditStatus(int score) {
        if (score >= 750) return "Excellent";
        if (score >= 700) return "Good";
        if (score >= 650) return "Fair";
        if (score >= 600) return "Poor";
        return "Very Poor";
    }

    private List<CreditScore.BreakdownItem> generateBreakdown() {
        Random random = new Random();
        List<CreditScore.BreakdownItem> breakdown = new ArrayList<>();

        breakdown.add(new CreditScore.BreakdownItem("Payment History", 75 + random.nextInt(20), "#3b82f6"));
        breakdown.add(new CreditScore.BreakdownItem("Credit Utilization", 55 + random.nextInt(25), "#f59e0b"));
        breakdown.add(new CreditScore.BreakdownItem("Credit History Length", 65 + random.nextInt(20), "#10b981"));
        breakdown.add(new CreditScore.BreakdownItem("New Credit Accounts", 60 + random.nextInt(25), "#8b5cf6"));
        breakdown.add(new CreditScore.BreakdownItem("Credit Mix", 70 + random.nextInt(20), "#06b6d4"));

        return breakdown;
    }

    private List<String> generateRecommendations(int creditScore) {
        List<String> allRecommendations = Arrays.asList(
            "Pay down credit card balances to improve utilization ratio",
            "Keep old accounts open to maintain credit history length",
            "Limit new credit inquiries over the next 6 months",
            "Set up automatic payments to avoid missed payments",
            "Diversify your credit mix with different account types",
            "Monitor your credit report regularly for errors",
            "Keep credit utilization below 30% on all cards",
            "Pay bills on time consistently for the next 6 months"
        );

        int recommendationCount = creditScore < 650 ? 4 : 3;
        return allRecommendations.subList(0, recommendationCount);
    }

    private CreditScore.AccountOverview generateAccountOverview(int creditScore) {
        Random random = new Random();

        double creditLimit = 10000 + random.nextInt(10000);
        double balance = creditLimit * (0.15 + random.nextDouble() * 0.25);
        int utilization = (int) ((balance / creditLimit) * 100);
        int accounts = 5 + random.nextInt(5);

        return new CreditScore.AccountOverview(creditLimit, balance, utilization, accounts);
    }
}