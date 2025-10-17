package com.securebank.creditanalyzer.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Transaction {
    private String date;
    private String description;
    private String category;
    private String amount;
    private String impact;
}