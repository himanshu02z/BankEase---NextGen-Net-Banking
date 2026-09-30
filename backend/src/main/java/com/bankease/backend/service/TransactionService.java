package com.bankease.backend.service;

import com.bankease.backend.dto.TransactionRequest;
import com.bankease.backend.dto.TransferRequest;
import com.bankease.backend.entity.Account;
import com.bankease.backend.entity.Transaction;
import com.bankease.backend.repository.AccountRepository;
import com.bankease.backend.repository.TransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
public class TransactionService {

    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;

    public TransactionService(
            AccountRepository accountRepository,
            TransactionRepository transactionRepository
    ) {
        this.accountRepository = accountRepository;
        this.transactionRepository = transactionRepository;
    }

    @Transactional
    public Transaction deposit(
            String accountNumber,
            TransactionRequest request,
            String username
    ) {

        Account account =
                getUserAccount(accountNumber, username);

        BigDecimal newBalance =
                account.getBalance().add(request.amount());

        account.setBalance(newBalance);

        accountRepository.save(account);

        Transaction transaction =
                Transaction.builder()
                        .transactionReference(
                                generateReference()
                        )
                        .type(
                                Transaction.TransactionType.DEPOSIT
                        )
                        .amount(request.amount())
                        .balanceAfter(newBalance)
                        .description(
                                request.description() != null
                                        ? request.description()
                                        : "Cash deposit"
                        )
                        .account(account)
                        .build();

        return transactionRepository.save(transaction);
    }

    @Transactional
    public Transaction withdraw(
            String accountNumber,
            TransactionRequest request,
            String username
    ) {

        Account account =
                getUserAccount(accountNumber, username);

        BigDecimal currentBalance =
                account.getBalance();

        if (currentBalance.compareTo(request.amount()) < 0) {
            throw new RuntimeException(
                    "Insufficient balance"
            );
        }

        BigDecimal newBalance =
                currentBalance.subtract(request.amount());

        account.setBalance(newBalance);

        accountRepository.save(account);

        Transaction transaction =
                Transaction.builder()
                        .transactionReference(
                                generateReference()
                        )
                        .type(
                                Transaction.TransactionType.WITHDRAW
                        )
                        .amount(request.amount())
                        .balanceAfter(newBalance)
                        .description(
                                request.description() != null
                                        ? request.description()
                                        : "Cash withdrawal"
                        )
                        .account(account)
                        .build();

        return transactionRepository.save(transaction);
    }

    @Transactional
    public void transfer(
            String senderAccountNumber,
            TransferRequest request,
            String username
    ) {

        if (senderAccountNumber.equals(
                request.receiverAccountNumber())) {

            throw new RuntimeException(
                    "Sender and receiver accounts cannot be the same"
            );
        }

        Account sender =
                accountRepository
                        .findByAccountNumberForUpdate(
                                senderAccountNumber
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Sender account not found"
                                ));

        if (!sender.getUser()
                .getUsername()
                .equals(username)) {

            throw new RuntimeException(
                    "You are not authorized to access this account"
            );
        }

        if (!sender.isActive()) {
            throw new RuntimeException(
                    "Sender account is inactive"
            );
        }

        Account receiver =
                accountRepository
                        .findByAccountNumberForUpdate(
                                request.receiverAccountNumber()
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Receiver account not found"
                                ));

        if (!receiver.isActive()) {
            throw new RuntimeException(
                    "Receiver account is inactive"
            );
        }

        BigDecimal amount = request.amount();

        if (sender.getBalance()
                .compareTo(amount) < 0) {

            throw new RuntimeException(
                    "Insufficient balance"
            );
        }

        BigDecimal senderNewBalance =
                sender.getBalance()
                        .subtract(amount);

        BigDecimal receiverNewBalance =
                receiver.getBalance()
                        .add(amount);

        sender.setBalance(senderNewBalance);
        receiver.setBalance(receiverNewBalance);

        accountRepository.save(sender);
        accountRepository.save(receiver);

        String description =
                request.description() != null
                        ? request.description()
                        : "Money transfer";

        Transaction debitTransaction =
                Transaction.builder()
                        .transactionReference(
                                generateReference()
                        )
                        .type(
                                Transaction.TransactionType
                                        .TRANSFER_DEBIT
                        )
                        .amount(amount)
                        .balanceAfter(senderNewBalance)
                        .description(description)
                        .relatedAccountNumber(
                                receiver.getAccountNumber()
                        )
                        .account(sender)
                        .build();

        Transaction creditTransaction =
                Transaction.builder()
                        .transactionReference(
                                generateReference()
                        )
                        .type(
                                Transaction.TransactionType
                                        .TRANSFER_CREDIT
                        )
                        .amount(amount)
                        .balanceAfter(receiverNewBalance)
                        .description(description)
                        .relatedAccountNumber(
                                sender.getAccountNumber()
                        )
                        .account(receiver)
                        .build();

        transactionRepository.save(debitTransaction);
        transactionRepository.save(creditTransaction);
    }

    public List<Transaction> getTransactionHistory(
            String accountNumber,
            String username
    ) {

        Account account =
                getUserAccount(accountNumber, username);

        return transactionRepository
                .findByAccountIdOrderByCreatedAtDesc(
                        account.getId()
                );
    }

    private Account getUserAccount(
            String accountNumber,
            String username
    ) {

        Account account =
                accountRepository
                        .findByAccountNumber(accountNumber)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Account not found"
                                ));

        if (!account.getUser()
                .getUsername()
                .equals(username)) {

            throw new RuntimeException(
                    "You are not authorized to access this account"
            );
        }

        if (!account.isActive()) {
            throw new RuntimeException(
                    "Account is inactive"
            );
        }

        return account;
    }

    private String generateReference() {

        return "TXN" +
                UUID.randomUUID()
                        .toString()
                        .replace("-", "")
                        .substring(0, 27);
    }
}