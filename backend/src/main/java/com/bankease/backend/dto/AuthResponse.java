package com.bankease.backend.dto;

public record AuthResponse(
        String token,
        UserResponse user
) {
}