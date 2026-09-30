package com.bankease.backend.dto;

import com.bankease.backend.entity.Account.AccountType;
import jakarta.validation.constraints.NotNull;

public record CreateAccountRequest(

        @NotNull(message = "Account type is required")
        AccountType accountType

) {
}