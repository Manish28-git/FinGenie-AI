package com.fingenie.fingenieai.dto;

import com.fingenie.fingenieai.entity.Transaction;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class TransactionDTO {
    private Long id;
    private String senderAccountNumber;
    private String senderName;
    private String receiverAccountNumber;
    private String receiverName;
    private BigDecimal amount;
    private String transactionType; // Renamed to match frontend usage if needed, or keep type
    private String type;
    private String status;
    private LocalDateTime timestamp;

    public static TransactionDTO fromEntity(Transaction transaction) {
        String senderAcc = "System/ATM";
        String senderName = "FinGenie Vault";
        if (transaction.getSenderAccount() != null) {
            senderAcc = transaction.getSenderAccount().getAccountNumber();
            if (transaction.getSenderAccount().getUser() != null) {
                senderName = transaction.getSenderAccount().getUser().getFirstName() + " " + 
                             transaction.getSenderAccount().getUser().getLastName();
            }
        }

        String receiverAcc = "System/ATM";
        String receiverName = "FinGenie Vault";
        if (transaction.getReceiverAccount() != null) {
            receiverAcc = transaction.getReceiverAccount().getAccountNumber();
            if (transaction.getReceiverAccount().getUser() != null) {
                receiverName = transaction.getReceiverAccount().getUser().getFirstName() + " " + 
                               transaction.getReceiverAccount().getUser().getLastName();
            }
        }

        return TransactionDTO.builder()
                .id(transaction.getId())
                .senderAccountNumber(senderAcc)
                .senderName(senderName)
                .receiverAccountNumber(receiverAcc)
                .receiverName(receiverName)
                .amount(transaction.getAmount())
                .transactionType(transaction.getTransactionType().name())
                .type(transaction.getTransactionType().name())
                .status(transaction.getStatus().name())
                .timestamp(transaction.getTimestamp())
                .build();
    }
}
