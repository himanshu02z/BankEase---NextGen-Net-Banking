package com.bankease.backend.controller;

import com.bankease.backend.dto.TransactionRequest;
import com.bankease.backend.dto.TransactionResponse;
import com.bankease.backend.dto.TransferRequest;
import com.bankease.backend.entity.Transaction;
import com.bankease.backend.service.JwtService;
import com.bankease.backend.service.TransactionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@CrossOrigin(origins = "http://localhost:5173")
public class TransactionController {

    private final TransactionService transactionService;
    private final JwtService jwtService;

    public TransactionController(
            TransactionService transactionService,
            JwtService jwtService
    ) {
        this.transactionService = transactionService;
        this.jwtService = jwtService;
    }

    @PostMapping("/deposit/{accountNumber}")
    public ResponseEntity<?> deposit(
            @PathVariable String accountNumber,
            @Valid @RequestBody TransactionRequest request,
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

        Transaction transaction =
                transactionService.deposit(
                        accountNumber,
                        request,
                        username
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(TransactionResponse.from(transaction));
    }

    @PostMapping("/withdraw/{accountNumber}")
    public ResponseEntity<?> withdraw(
            @PathVariable String accountNumber,
            @Valid @RequestBody TransactionRequest request,
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

        Transaction transaction =
                transactionService.withdraw(
                        accountNumber,
                        request,
                        username
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(TransactionResponse.from(transaction));
    }

    @GetMapping("/{accountNumber}")
    public ResponseEntity<?> getTransactionHistory(
            @PathVariable String accountNumber,
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

        List<TransactionResponse> transactions =
                transactionService
                        .getTransactionHistory(
                                accountNumber,
                                username
                        )
                        .stream()
                        .map(TransactionResponse::from)
                        .toList();

        return ResponseEntity.ok(transactions);
    }

    @PostMapping("/transfer/{senderAccountNumber}")
    public ResponseEntity<?> transfer(
            @PathVariable String senderAccountNumber,
            @Valid @RequestBody TransferRequest request,
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

        transactionService.transfer(
                senderAccountNumber,
                request,
                username
        );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body("Transfer successful");
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