package com.bankease.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record RegisterRequest(

        @NotBlank(message = "Username is required")
        String username,

        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email")
        String email,

        @NotBlank(message = "Password is required")
        String password,

        @NotBlank(message = "Full name is required")
        String fullName,

        @NotBlank(message = "Phone is required")
        String phone

) {
}