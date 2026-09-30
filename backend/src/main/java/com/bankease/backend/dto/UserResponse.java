package com.bankease.backend.dto;

import com.bankease.backend.entity.User;

import java.time.LocalDateTime;

public record UserResponse(
        Long id,
        String username,
        String email,
        String fullName,
        String phone,
        String role,
        boolean active,
        LocalDateTime createdAt
) {

    public static UserResponse from(User user) {
        return new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getFullName(),
                user.getPhone(),
                user.getRole(),
                user.isActive(),
                user.getCreatedAt()
        );
    }
}