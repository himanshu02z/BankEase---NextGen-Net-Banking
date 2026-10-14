package com.bankease.backend.service;

import com.bankease.backend.dto.RegisterRequest;
import com.bankease.backend.entity.User;
import com.bankease.backend.repository.AccountRepository;
import com.bankease.backend.repository.UserRepository;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final AccountRepository accountRepository;
    private final PasswordEncoder passwordEncoder;
    private final AccountService accountService;

    public UserService(
            UserRepository userRepository,
            AccountRepository accountRepository,
            PasswordEncoder passwordEncoder,
            @Lazy AccountService accountService
    ) {
        this.userRepository = userRepository;
        this.accountRepository = accountRepository;
        this.passwordEncoder = passwordEncoder;
        this.accountService = accountService;
    }

    @Transactional
    public User registerUser(RegisterRequest request) {

        String username = request.username().trim();
        String email = request.email().trim().toLowerCase();

        Optional<User> existingUserOpt = userRepository.findByUsername(username)
                .or(() -> userRepository.findByEmail(email));

        if (existingUserOpt.isPresent()) {
            User existing = existingUserOpt.get();
            existing.setUsername(username);
            existing.setEmail(email);
            existing.setPassword(passwordEncoder.encode(request.password()));
            existing.setFullName(request.fullName().trim());
            existing.setPhone(request.phone().trim());
            existing.setActive(true);
            User updated = userRepository.save(existing);
            if (accountRepository.findByUserId(updated.getId()).isEmpty()) {
                accountService.createDefaultAccountForUser(updated);
            }
            return updated;
        }

        User user = User.builder()
                .username(username)
                .email(email)
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
                .or(() -> userRepository.findByEmail(username))
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}