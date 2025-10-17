package com.securebank.creditanalyzer.controller;

import com.securebank.creditanalyzer.model.CreditScore;
import com.securebank.creditanalyzer.model.Transaction;
import com.securebank.creditanalyzer.model.User;
import com.securebank.creditanalyzer.repository.CreditScoreRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpSession;
import java.util.*;

@Controller
public class DashboardController {

    @Autowired
    private CreditScoreRepository creditScoreRepository;

    @GetMapping("/dashboard")
    public String dashboard(HttpSession session) {
        User user = (User) session.getAttribute("user");
        if (user == null) {
            return "redirect:/";
        }
        return "index";
    }

    @GetMapping("/api/dashboard/data")
    @ResponseBody
    public Map<String, Object> getDashboardData(HttpSession session) {
        Map<String, Object> response = new HashMap<>();

        User user = (User) session.getAttribute("user");
        if (user == null) {
            response.put("success", false);
            response.put("message", "User not authenticated");
            return response;
        }

        // Get latest credit score analysis
        Optional<CreditScore> creditScoreOpt = creditScoreRepository.findByUserId(user.getId());

        if (creditScoreOpt.isPresent()) {
            CreditScore creditScore = creditScoreOpt.get();

            response.put("success", true);
            response.put("creditScore", creditScore);
            response.put("lastUpdated", creditScore.getTimestamp());
            response.put("transactions", generateMockTransactions());
        } else {
            response.put("success", false);
            response.put("message", "No analysis data available");
        }

        return response;
    }

    @GetMapping("/api/dashboard/chart-data")
    @ResponseBody
    public Map<String, Object> getChartData(HttpSession session) {
        Map<String, Object> response = new HashMap<>();

        User user = (User) session.getAttribute("user");
        if (user == null) {
            response.put("success", false);
            return response;
        }

        Optional<CreditScore> creditScoreOpt = creditScoreRepository.findByUserId(user.getId());

        if (creditScoreOpt.isPresent()) {
            CreditScore creditScore = creditScoreOpt.get();

            // Prepare data for Chart.js
            Map<String, Object> chartData = new HashMap<>();

            // Breakdown chart data
            List<String> labels = new ArrayList<>();
            List<Integer> values = new ArrayList<>();
            List<String> colors = new ArrayList<>();

            for (CreditScore.BreakdownItem item : creditScore.getBreakdown()) {
                labels.add(item.getName());
                values.add(item.getValue());
                colors.add(item.getColor());
            }

            chartData.put("labels", labels);
            chartData.put("values", values);
            chartData.put("colors", colors);

            response.put("success", true);
            response.put("chartData", chartData);
        } else {
            response.put("success", false);
        }

        return response;
    }

    private List<Transaction> generateMockTransactions() {
        List<Transaction> transactions = new ArrayList<>();

        transactions.add(new Transaction("2025-10-15", "Credit Card Payment", "Payment", "$500.00", "Positive"));
        transactions.add(new Transaction("2025-10-12", "Online Purchase", "Purchase", "$125.50", "Neutral"));
        transactions.add(new Transaction("2025-10-10", "Salary Deposit", "Income", "$3,200.00", "Positive"));
        transactions.add(new Transaction("2025-10-08", "Rent Payment", "Bills", "$1,200.00", "Positive"));

        return transactions;
    }
}