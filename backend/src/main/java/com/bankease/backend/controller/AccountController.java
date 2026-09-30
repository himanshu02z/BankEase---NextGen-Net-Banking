package com.bankease.backend.controller;

import com.bankease.backend.dto.AccountResponse;
import com.bankease.backend.dto.CreateAccountRequest;
import com.bankease.backend.entity.Account;
import com.bankease.backend.service.AccountService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/accounts")
public class AccountController {

    private final AccountService accountService;

    public AccountController(AccountService accountService) {
        this.accountService = accountService;
    }

    @PostMapping
    public ResponseEntity<AccountResponse> createAccount(
            @Valid @RequestBody CreateAccountRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {

        Account account =
                accountService.createAccount(
                        request,
                        userDetails.getUsername()
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(AccountResponse.from(account));
    }

    @GetMapping
    public ResponseEntity<List<AccountResponse>> getMyAccounts(
            @AuthenticationPrincipal UserDetails userDetails
    ) {

        List<AccountResponse> accounts =
                accountService
                        .getMyAccounts(userDetails.getUsername())
                        .stream()
                        .map(AccountResponse::from)
                        .toList();

        return ResponseEntity.ok(accounts);
    }
}
