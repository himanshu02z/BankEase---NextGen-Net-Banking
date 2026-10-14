package com.bankease.backend.service;

import com.bankease.backend.dto.CreateAccountRequest;
import com.bankease.backend.entity.Account;
import com.bankease.backend.entity.User;
import com.bankease.backend.repository.AccountRepository;
import com.bankease.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.security.SecureRandom;
import java.util.List;

@Service
public class AccountService {

    private final AccountRepository accountRepository;
    private final UserRepository userRepository;

    private final SecureRandom secureRandom = new SecureRandom();

    public AccountService(
            AccountRepository accountRepository,
            UserRepository userRepository
    ) {
        this.accountRepository = accountRepository;
        this.userRepository = userRepository;
    }

    public Account createAccount(
            CreateAccountRequest request,
            String username
    ) {

        User user = userRepository.findByUsername(username)
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );

        String accountNumber = generateAccountNumber();

        Account account = Account.builder()
                .accountNumber(accountNumber)
                .ifscCode("BNKE0000001")
                .accountType(request.accountType())
                .balance(BigDecimal.ZERO)
                .currency("INR")
                .active(true)
                .user(user)
                .build();

        return accountRepository.save(account);
    }

    public Account createDefaultAccountForUser(User user) {
        String accountNumber = generateAccountNumber();

        Account account = Account.builder()
                .accountNumber(accountNumber)
                .ifscCode("BNKE0000001")
                .accountType(Account.AccountType.SAVINGS)
                .balance(new BigDecimal("10000.00"))
                .currency("INR")
                .active(true)
                .user(user)
                .build();

        return accountRepository.save(account);
    }

    public List<Account> getMyAccounts(String username) {

        User user = userRepository.findByUsername(username)
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );

        List<Account> accounts = accountRepository.findByUserId(user.getId());
        if (accounts.isEmpty()) {
            Account defaultAccount = createDefaultAccountForUser(user);
            return List.of(defaultAccount);
        }

        return accounts;
    }

    private String generateAccountNumber() {

        String accountNumber;

        do {
            long number =
                    100000000000L +
                            secureRandom.nextLong(900000000000L);

            accountNumber = String.valueOf(number);

        } while (accountRepository.existsByAccountNumber(accountNumber));

        return accountNumber;
    }
}