package com.securebank.creditanalyzer.controller;

import com.securebank.creditanalyzer.model.User;
import com.securebank.creditanalyzer.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpSession;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Controller
public class AuthController {

    @Autowired
    private UserService userService;

    @GetMapping("/")
    public String home(HttpSession session) {
        User user = (User) session.getAttribute("user");
        return (user != null) ? "redirect:/dashboard" : "index";
    }

    @PostMapping("/api/login")
    @ResponseBody
    public Map<String, Object> login(@RequestBody Map<String, String> credentials, HttpSession session) {
        Map<String, Object> response = new HashMap<>();
        String email = credentials.get("email");
        String password = credentials.get("password");

        Optional<User> userOpt = userService.loginUser(email, password);

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            session.setAttribute("user", user);
            response.put("success", true);
            response.put("message", "Login successful");
            response.put("user", user);
        } else {
            response.put("success", false);
            response.put("message", "Invalid email or password");
        }
        return response;
    }

    @PostMapping("/api/signup")
    @ResponseBody
    public Map<String, Object> signup(@RequestBody Map<String, String> userData, HttpSession session) {
        Map<String, Object> response = new HashMap<>();
        try {
            String fullName = userData.get("fullName");
            String email = userData.get("email");
            String phone = userData.get("phone");
            String password = userData.get("password");
            User user = userService.registerUser(fullName, email, phone, password);
            session.setAttribute("user", user);
            response.put("success", true);
            response.put("message", "Registration successful");
            response.put("user", user);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Signup failed: " + e.getMessage());
        }
        return response;
    }

    @GetMapping("/logout")
    public String logout(HttpSession session) {
        session.invalidate();
        return "redirect:/";
    }
}
