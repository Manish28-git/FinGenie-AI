package com.fingenie.fingenieai.repository;

import com.fingenie.fingenieai.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findBySenderAccountIdOrReceiverAccountIdOrderByTimestampDesc(Long senderId, Long receiverId);
    void deleteBySenderAccountIdOrReceiverAccountId(Long senderId, Long receiverId);
    long countBySenderAccountIdOrReceiverAccountId(Long senderId, Long receiverId);
}
