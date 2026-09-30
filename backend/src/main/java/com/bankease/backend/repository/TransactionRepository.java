package com.bankease.backend.repository;

import com.bankease.backend.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TransactionRepository
        extends JpaRepository<Transaction, Long> {

    List<Transaction> findByAccountIdOrderByCreatedAtDesc(Long accountId);
}