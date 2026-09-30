package com.bankease.backend.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record TransferRequest(

        @NotBlank(message = "Receiver account number is required")
        String receiverAccountNumber,

        @NotNull(message = "Amount is required")
        @DecimalMin(
                value = "0.01",
                message = "Amount must be greater than 0"
        )
        BigDecimal amount,

        String description
) {
}