package com.bankease.backend.service;

import com.bankease.backend.dto.AuthResponse;
import com.bankease.backend.dto.LoginRequest;
import com.bankease.backend.dto.UserResponse;
import com.bankease.backend.entity.User;
import com.bankease.backend.repository.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final JwtService jwtService;

    public AuthService(
            AuthenticationManager authenticationManager,
            UserRepository userRepository,
            JwtService jwtService
    ) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.jwtService = jwtService;
    }

    public AuthResponse login(LoginRequest request) {

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.username(),
                        request.password()
                )
        );

        User user = userRepository.findByUsername(request.username())
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );

        String token = jwtService.generateToken(user.getUsername());

        return new AuthResponse(
                token,
                UserResponse.from(user)
        );
    }
}