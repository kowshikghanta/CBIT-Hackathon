package com.securebank.creditanalyzer.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.HashMap;
import java.util.Map;

@Service
public class PythonMLService {

    @Value("${app.python.executable}")
    private String pythonExecutable;

    @Value("${app.python.script.path}")
    private String scriptPath;

    public Map<String, Object> runAnalysis(String csvFilePath) {
        Map<String, Object> result = new HashMap<>();

        try {
            ProcessBuilder pb = new ProcessBuilder(pythonExecutable, scriptPath, csvFilePath);
            pb.redirectErrorStream(true);

            Process process = pb.start();
            BufferedReader reader = new BufferedReader(
                    new InputStreamReader(process.getInputStream()));

            StringBuilder output = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                output.append(line).append("\n");
            }

            int exitCode = process.waitFor();

            if (exitCode == 0) {
                // Parse Python output
                String outputStr = output.toString();
                result.put("success", true);
                result.put("output", outputStr);

                // Extract R² and MSE from output
                double r2 = extractMetric(outputStr, "Mean R²:");
                double mse = extractMetric(outputStr, "Mean MSE:");

                result.put("r2Score", r2);
                result.put("mseScore", mse);
            } else {
                result.put("success", false);
                result.put("error", "Python script failed with exit code: " + exitCode);
            }

        } catch (Exception e) {
            result.put("success", false);
            result.put("error", e.getMessage());
        }

        return result;
    }

    private double extractMetric(String output, String metricName) {
        try {
            int index = output.indexOf(metricName);
            if (index != -1) {
                String substring = output.substring(index + metricName.length()).trim();
                String[] parts = substring.split("\s+");
                return Double.parseDouble(parts[0]);
            }
        } catch (Exception e) {
            System.err.println("Error extracting metric: " + metricName);
        }
        return 0.0;
    }
}