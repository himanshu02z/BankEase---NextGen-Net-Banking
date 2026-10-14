package com.bankease.backend.service;

import com.bankease.backend.dto.AuthResponse;
import com.bankease.backend.dto.LoginRequest;
import com.bankease.backend.dto.UserResponse;
import com.bankease.backend.entity.User;
import com.bankease.backend.repository.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
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

        String identifier = request.username() != null ? request.username().trim() : "";

        User user = userRepository.findByUsername(identifier)
                .or(() -> userRepository.findByEmail(identifier))
                .orElseThrow(() ->
                        new BadCredentialsException("Invalid username or password")
                );

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        user.getUsername(),
                        request.password()
                )
        );

        String token = jwtService.generateToken(user.getUsername());

        return new AuthResponse(
                token,
                UserResponse.from(user)
        );
    }
}