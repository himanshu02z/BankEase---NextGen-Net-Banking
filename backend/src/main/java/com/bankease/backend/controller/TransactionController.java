package com.bankease.backend.controller;

import com.bankease.backend.dto.TransactionRequest;
import com.bankease.backend.dto.TransactionResponse;
import com.bankease.backend.dto.TransferRequest;
import com.bankease.backend.entity.Transaction;
import com.bankease.backend.service.TransactionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {
    private final TransactionService transactionService;

    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    @PostMapping("/deposit/{accountNumber}")
    @ResponseStatus(HttpStatus.CREATED)
    public TransactionResponse deposit(
            @PathVariable String accountNumber,
            @Valid @RequestBody TransactionRequest request,
            @AuthenticationPrincipal UserDetails user
    ) {
        return TransactionResponse.from(transactionService.deposit(accountNumber, request, user.getUsername()));
    }

    @PostMapping("/withdraw/{accountNumber}")
    @ResponseStatus(HttpStatus.CREATED)
    public TransactionResponse withdraw(
            @PathVariable String accountNumber,
            @Valid @RequestBody TransactionRequest request,
            @AuthenticationPrincipal UserDetails user
    ) {
        return TransactionResponse.from(transactionService.withdraw(accountNumber, request, user.getUsername()));
    }

    @GetMapping("/{accountNumber}")
    public List<TransactionResponse> getTransactionHistory(
            @PathVariable String accountNumber,
            @AuthenticationPrincipal UserDetails user
    ) {
        return transactionService.getTransactionHistory(accountNumber, user.getUsername()).stream()
                .map(TransactionResponse::from)
                .toList();
    }

    @PostMapping("/transfer/{senderAccountNumber}")
    @ResponseStatus(HttpStatus.CREATED)
    public String transfer(
            @PathVariable String senderAccountNumber,
            @Valid @RequestBody TransferRequest request,
            @AuthenticationPrincipal UserDetails user
    ) {
        transactionService.transfer(senderAccountNumber, request, user.getUsername());
        return "Transfer successful";
    }
}
