package com.bankease.backend.dto;

import com.bankease.backend.entity.Account;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record AccountResponse(
        Long id,
        String accountNumber,
        String ifscCode,
        String accountType,
        BigDecimal balance,
        String currency,
        boolean active,
        LocalDateTime createdAt
) {

    public static AccountResponse from(Account account) {

        return new AccountResponse(
                account.getId(),
                account.getAccountNumber(),
                account.getIfscCode(),
                account.getAccountType().name(),
                account.getBalance(),
                account.getCurrency(),
                account.isActive(),
                account.getCreatedAt()
        );
    }
}