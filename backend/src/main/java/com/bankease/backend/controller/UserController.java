package com.bankease.backend.controller;

import com.bankease.backend.dto.RegisterRequest;
import com.bankease.backend.dto.UserResponse;
import com.bankease.backend.entity.User;
import com.bankease.backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping({"/api/users", "/api/auth", "/api", "/users", "/auth"})
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping({"/register", "/signup"})
    public ResponseEntity<UserResponse> registerUser(
            @Valid @RequestBody RegisterRequest request
    ) {

        User registeredUser = userService.registerUser(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(UserResponse.from(registeredUser));
    }

    @GetMapping({"/me", "/profile"})
    public ResponseEntity<UserResponse> getCurrentUser(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User user = userService.findByUsername(userDetails.getUsername());
        return ResponseEntity.ok(UserResponse.from(user));
    }
}