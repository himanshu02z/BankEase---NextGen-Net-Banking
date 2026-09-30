package com.bankease.backend.dto;

import com.bankease.backend.entity.Transaction;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record TransactionResponse(
        Long id,
        String transactionReference,
        String type,
        BigDecimal amount,
        BigDecimal balanceAfter,
        String description,
        String relatedAccountNumber,
        LocalDateTime createdAt
) {

    public static TransactionResponse from(Transaction transaction) {

        return new TransactionResponse(
                transaction.getId(),
                transaction.getTransactionReference(),
                transaction.getType().name(),
                transaction.getAmount(),
                transaction.getBalanceAfter(),
                transaction.getDescription(),
                transaction.getRelatedAccountNumber(),
                transaction.getCreatedAt()
        );
    }
}