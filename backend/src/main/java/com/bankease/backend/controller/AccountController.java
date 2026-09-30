package com.bankease.backend.controller;

import com.bankease.backend.dto.AccountResponse;
import com.bankease.backend.dto.CreateAccountRequest;
import com.bankease.backend.entity.Account;
import com.bankease.backend.service.AccountService;
import com.bankease.backend.service.JwtService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/accounts")
@CrossOrigin(origins = "http://localhost:5173")
public class AccountController {

    private final AccountService accountService;
    private final JwtService jwtService;

    public AccountController(
            AccountService accountService,
            JwtService jwtService
    ) {
        this.accountService = accountService;
        this.jwtService = jwtService;
    }

    @PostMapping
    public ResponseEntity<?> createAccount(
            @Valid @RequestBody CreateAccountRequest request,
            @RequestHeader(
                    value = "Authorization",
                    required = false
            ) String authorization
    ) {

        String username = getUsername(authorization);

        if (username == null) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid or missing JWT");
        }

        Account account =
                accountService.createAccount(
                        request,
                        username
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(AccountResponse.from(account));
    }

    @GetMapping
    public ResponseEntity<?> getMyAccounts(
            @RequestHeader(
                    value = "Authorization",
                    required = false
            ) String authorization
    ) {

        String username = getUsername(authorization);

        if (username == null) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid or missing JWT");
        }

        List<AccountResponse> accounts =
                accountService
                        .getMyAccounts(username)
                        .stream()
                        .map(AccountResponse::from)
                        .toList();

        return ResponseEntity.ok(accounts);
    }

    private String getUsername(String authorization) {

        if (authorization == null ||
                !authorization.startsWith("Bearer ")) {
            return null;
        }

        String token =
                authorization.substring(7).trim();

        if (token.isEmpty()) {
            return null;
        }

        try {

            if (!jwtService.isTokenValid(token)) {
                return null;
            }

            return jwtService.extractUsername(token);

        } catch (Exception e) {
            return null;
        }
    }
}