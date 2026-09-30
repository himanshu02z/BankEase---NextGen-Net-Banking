package com.bankease.backend.controller;

import com.bankease.backend.dto.TransactionRequest;
import com.bankease.backend.dto.TransactionResponse;
import com.bankease.backend.dto.TransferRequest;
import com.bankease.backend.entity.Transaction;
import com.bankease.backend.service.TransactionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    private final TransactionService transactionService;

    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    @PostMapping("/deposit/{accountNumber}")
    public ResponseEntity<TransactionResponse> deposit(
            @PathVariable String accountNumber,
            @Valid @RequestBody TransactionRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {

        Transaction transaction =
                transactionService.deposit(
                        accountNumber,
                        request,
                        userDetails.getUsername()
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(TransactionResponse.from(transaction));
    }

    @PostMapping("/withdraw/{accountNumber}")
    public ResponseEntity<TransactionResponse> withdraw(
            @PathVariable String accountNumber,
            @Valid @RequestBody TransactionRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {

        Transaction transaction =
                transactionService.withdraw(
                        accountNumber,
                        request,
                        userDetails.getUsername()
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(TransactionResponse.from(transaction));
    }

    @GetMapping("/{accountNumber}")
    public ResponseEntity<List<TransactionResponse>> getTransactionHistory(
            @PathVariable String accountNumber,
            @AuthenticationPrincipal UserDetails userDetails
    ) {

        List<TransactionResponse> transactions =
                transactionService
                        .getTransactionHistory(
                                accountNumber,
                                userDetails.getUsername()
                        )
                        .stream()
                        .map(TransactionResponse::from)
                        .toList();

        return ResponseEntity.ok(transactions);
    }

    @PostMapping("/transfer/{senderAccountNumber}")
    public ResponseEntity<Map<String, String>> transfer(
            @PathVariable String senderAccountNumber,
            @Valid @RequestBody TransferRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {

        transactionService.transfer(
                senderAccountNumber,
                request,
                userDetails.getUsername()
        );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(Map.of("message", "Transfer successful"));
    }
}
