package com.bankease.backend.dto;

public record LoginRequest(
        String username,
        String password
) {
}