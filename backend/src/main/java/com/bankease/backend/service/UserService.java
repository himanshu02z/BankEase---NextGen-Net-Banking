package com.bankease.backend.service;

import com.bankease.backend.dto.RegisterRequest;
import com.bankease.backend.entity.User;
import com.bankease.backend.repository.UserRepository;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AccountService accountService;

    public UserService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            @Lazy AccountService accountService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.accountService = accountService;
    }

    @Transactional
    public User registerUser(RegisterRequest request) {

        if (userRepository.existsByUsername(request.username())) {
            throw new RuntimeException("Username already exists");
        }

        if (userRepository.existsByEmail(request.email())) {
            throw new RuntimeException("Email already exists");
        }

        User user = User.builder()
                .username(request.username().trim())
                .email(request.email().trim().toLowerCase())
                .password(passwordEncoder.encode(request.password()))
                .fullName(request.fullName().trim())
                .phone(request.phone().trim())
                .role("CUSTOMER")
                .active(true)
                .build();

        User savedUser = userRepository.save(user);
        accountService.createDefaultAccountForUser(savedUser);
        return savedUser;
    }

    public User findByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}