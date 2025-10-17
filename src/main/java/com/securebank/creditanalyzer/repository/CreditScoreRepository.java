package com.securebank.creditanalyzer.repository;

import com.google.gson.reflect.TypeToken;
import com.securebank.creditanalyzer.model.CreditScore;
import com.securebank.creditanalyzer.util.JsonStorageUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Repository;

import java.lang.reflect.Type;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Repository
public class CreditScoreRepository {

    @Value("${app.data.path}credit-scores.json")
    private String creditScoresFilePath;

    @Autowired
    private JsonStorageUtil jsonStorage;

    private static final Type CREDIT_SCORE_LIST_TYPE = new TypeToken<List<CreditScore>>(){}.getType();

    public List<CreditScore> findAll() {
        return jsonStorage.readList(creditScoresFilePath, CREDIT_SCORE_LIST_TYPE);
    }

    public Optional<CreditScore> findByUserId(String userId) {
        return findAll().stream()
                .filter(cs -> cs.getUserId().equals(userId))
                .findFirst();
    }

    public List<CreditScore> findAllByUserId(String userId) {
        return findAll().stream()
                .filter(cs -> cs.getUserId().equals(userId))
                .collect(Collectors.toList());
    }

    public CreditScore save(CreditScore creditScore) {
        List<CreditScore> scores = findAll();

        if (creditScore.getAnalysisId() == null || creditScore.getAnalysisId().isEmpty()) {
            creditScore.setAnalysisId("ana_" + UUID.randomUUID().toString().substring(0, 8));
        }

        scores.add(creditScore);
        jsonStorage.writeList(creditScoresFilePath, scores);
        return creditScore;
    }
}