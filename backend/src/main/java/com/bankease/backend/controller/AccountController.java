package com.bankease.backend.controller;

import com.bankease.backend.dto.AccountResponse;
import com.bankease.backend.dto.CreateAccountRequest;
import com.bankease.backend.entity.Account;
import com.bankease.backend.service.AccountService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
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
    @ResponseStatus(HttpStatus.CREATED)
    public AccountResponse createAccount(
            @Valid @RequestBody CreateAccountRequest request,
            @AuthenticationPrincipal UserDetails user
    ) {
        Account account = accountService.createAccount(request, user.getUsername());
        return AccountResponse.from(account);
    }

    @GetMapping
    public List<AccountResponse> getMyAccounts(@AuthenticationPrincipal UserDetails user) {
        return accountService.getMyAccounts(user.getUsername()).stream()
                .map(AccountResponse::from)
                .toList();
    }
}
