package com.securebank.creditanalyzer.controller;

import com.securebank.creditanalyzer.model.CreditScore;
import com.securebank.creditanalyzer.model.User;
import com.securebank.creditanalyzer.service.AnalysisService;
import com.securebank.creditanalyzer.service.FileStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.servlet.http.HttpSession;
import java.util.HashMap;
import java.util.Map;

@Controller
public class FileUploadController {

    @Autowired
    private FileStorageService fileStorageService;

    @Autowired
    private AnalysisService analysisService;

    @PostMapping("/api/upload")
    @ResponseBody
    public Map<String, Object> uploadFile(
            @RequestParam("file") MultipartFile file,
            HttpSession session) {

        Map<String, Object> response = new HashMap<>();

        try {
            User user = (User) session.getAttribute("user");
            if (user == null) {
                response.put("success", false);
                response.put("message", "User not authenticated");
                return response;
            }

            // Validate file
            if (file.isEmpty()) {
                response.put("success", false);
                response.put("message", "Please select a file to upload");
                return response;
            }

            String filename = file.getOriginalFilename();
            if (!filename.endsWith(".csv")) {
                response.put("success", false);
                response.put("message", "Only CSV files are supported for ML analysis");
                return response;
            }

            // Store file
            String filePath = fileStorageService.storeFile(file);

            response.put("success", true);
            response.put("message", "File uploaded successfully");
            response.put("filePath", filePath);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error uploading file: " + e.getMessage());
        }

        return response;
    }

    @PostMapping("/api/analyze")
    @ResponseBody
    public Map<String, Object> analyzeCredit(
            @RequestBody Map<String, String> data,
            HttpSession session) {

        Map<String, Object> response = new HashMap<>();

        try {
            User user = (User) session.getAttribute("user");
            if (user == null) {
                response.put("success", false);
                response.put("message", "User not authenticated");
                return response;
            }

            String filePath = data.get("filePath");

            // Run analysis
            CreditScore analysis = analysisService.analyzeCredit(user.getId(), filePath);

            // Clean up file
            fileStorageService.deleteFile(filePath);

            response.put("success", true);
            response.put("message", "Analysis completed successfully");
            response.put("data", analysis);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error during analysis: " + e.getMessage());
        }

        return response;
    }
}