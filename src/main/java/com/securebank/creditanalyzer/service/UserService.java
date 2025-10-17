package com.securebank.creditanalyzer.service;

import com.securebank.creditanalyzer.model.User;
import com.securebank.creditanalyzer.repository.UserRepository;
import com.securebank.creditanalyzer.util.PasswordUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordUtil passwordUtil;

    public User registerUser(String fullName, String email, String phone, String password) {
        // Check if user already exists
        Optional<User> existingUser = userRepository.findByEmail(email);
        if (existingUser.isPresent()) {
            throw new RuntimeException("User with this email already exists");
        }

        User user = new User();
        user.setFullName(fullName);
        user.setEmail(email);
        user.setPhone(phone);
        user.setPasswordHash(passwordUtil.hashPassword(password));
        user.setCreatedAt(LocalDateTime.now());
        user.setLastLogin(LocalDateTime.now());

        // Initialize credit score
        User.CreditScoreInfo creditScore = new User.CreditScoreInfo();
        creditScore.setValue(0);
        creditScore.setStatus("Not Analyzed");
        creditScore.setLastUpdated(LocalDateTime.now().toString());
        user.setCreditScore(creditScore);

        return userRepository.save(user);
    }

    public Optional<User> loginUser(String email, String password) {
        Optional<User> userOpt = userRepository.findByEmail(email);

        if (userOpt.isEmpty()) {
            return Optional.empty();
        }

        User user = userOpt.get();
        if (!passwordUtil.verifyPassword(password, user.getPasswordHash())) {
            return Optional.empty();
        }

        // Update last login
        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);

        return Optional.of(user);
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public Optional<User> findById(String id) {
        return userRepository.findById(id);
    }

    public void updateCreditScore(String userId, int score, String status) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            User.CreditScoreInfo creditScore = new User.CreditScoreInfo();
            creditScore.setValue(score);
            creditScore.setStatus(status);
            creditScore.setLastUpdated(LocalDateTime.now().toString());
            user.setCreditScore(creditScore);
            userRepository.save(user);
        }
    }
}