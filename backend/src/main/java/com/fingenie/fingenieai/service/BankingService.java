package com.fingenie.fingenieai.service;

import com.fingenie.fingenieai.dto.AccountDTO;
import com.fingenie.fingenieai.dto.TransferRequest;
import com.fingenie.fingenieai.entity.Account;
import com.fingenie.fingenieai.entity.Transaction;
import com.fingenie.fingenieai.entity.User;
import com.fingenie.fingenieai.repository.AccountRepository;
import com.fingenie.fingenieai.repository.TransactionRepository;
import com.fingenie.fingenieai.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class BankingService {

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService;

    public AccountDTO getAccountByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Account account = accountRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Account not found"));

        return AccountDTO.fromEntity(account);
    }

    @Transactional
    public void deposit(String email, BigDecimal amount) {
        if (amount.compareTo(BigDecimal.ZERO) <= 0) throw new RuntimeException("Invalid amount");
        
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Account account = accountRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Account not found"));

        account.setBalance(account.getBalance().add(amount));
        accountRepository.save(account);

        Transaction transaction = Transaction.builder()
                .receiverAccount(account)
                .amount(amount)
                .transactionType(Transaction.TransactionType.DEPOSIT)
                .status(Transaction.Status.COMPLETED)
                .build();
        transactionRepository.save(transaction);
        
        emailService.sendTransactionAlert(user.getEmail(), "DEPOSIT", amount.toString(), "Self-ATM", account.getBalance().toString());
    }

    @Transactional
    public void withdraw(String email, BigDecimal amount) {
        if (amount.compareTo(BigDecimal.ZERO) <= 0) throw new RuntimeException("Invalid amount");
        
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Account account = accountRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Account not found"));

        if (account.getBalance().compareTo(amount) < 0) throw new RuntimeException("Insufficient balance");

        account.setBalance(account.getBalance().subtract(amount));
        accountRepository.save(account);

        Transaction transaction = Transaction.builder()
                .senderAccount(account)
                .amount(amount)
                .transactionType(Transaction.TransactionType.WITHDRAWAL)
                .status(Transaction.Status.COMPLETED)
                .build();
        transactionRepository.save(transaction);
        
        emailService.sendTransactionAlert(user.getEmail(), "WITHDRAWAL", amount.toString(), "Self-ATM", account.getBalance().toString());
    }

    @Transactional
    public void transferFunds(String senderEmail, TransferRequest request) {
        User senderUser = userRepository.findByEmail(senderEmail)
                .orElseThrow(() -> new RuntimeException("Sender not found"));
        Account senderAccount = accountRepository.findByUserId(senderUser.getId())
                .orElseThrow(() -> new RuntimeException("Sender account not found"));

        Account receiverAccount = accountRepository.findByAccountNumber(request.getReceiverAccountNumber())
                .orElseThrow(() -> new RuntimeException("Receiver account not found"));

        if (senderAccount.getBalance().compareTo(request.getAmount()) < 0) {
            throw new RuntimeException("Insufficient balance");
        }

        if (senderAccount.getAccountNumber().equals(receiverAccount.getAccountNumber())) {
            throw new RuntimeException("Cannot transfer to the same account");
        }

        // Update balances
        senderAccount.setBalance(senderAccount.getBalance().subtract(request.getAmount()));
        receiverAccount.setBalance(receiverAccount.getBalance().add(request.getAmount()));

        accountRepository.save(senderAccount);
        accountRepository.save(receiverAccount);

        // Record transaction
        Transaction transaction = Transaction.builder()
                .senderAccount(senderAccount)
                .receiverAccount(receiverAccount)
                .amount(request.getAmount())
                .transactionType(Transaction.TransactionType.TRANSFER)
                .status(Transaction.Status.COMPLETED)
                .build();

        transactionRepository.save(transaction);

        // Send Email Notifications
        emailService.sendTransactionAlert(
            senderUser.getEmail(), 
            "DEBIT", 
            request.getAmount().toString(), 
            receiverAccount.getUser().getFirstName() + " (" + receiverAccount.getAccountNumber() + ")", 
            senderAccount.getBalance().toString()
        );

        emailService.sendTransactionAlert(
            receiverAccount.getUser().getEmail(), 
            "CREDIT", 
            request.getAmount().toString(), 
            senderUser.getFirstName() + " (" + senderAccount.getAccountNumber() + ")", 
            receiverAccount.getBalance().toString()
        );
    }

    @Transactional(readOnly = true)
    public List<Transaction> getTransactionHistory(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Account account = accountRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Account not found"));

        return transactionRepository.findBySenderAccountIdOrReceiverAccountIdOrderByTimestampDesc(account.getId(), account.getId());
    }

    public int calculateCreditScore(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Account account = accountRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Account not found"));

        int score = 600; // Base score

        // 1. Liquidity Bonus (+1 per $100, max 150)
        BigDecimal balance = account.getBalance();
        int liquidityBonus = balance.divide(BigDecimal.valueOf(100), 0, java.math.RoundingMode.DOWN).intValue();
        score += Math.min(liquidityBonus, 150);

        // 2. Transaction Consistency (+50 if > 5 transactions)
        long txCount = transactionRepository.countBySenderAccountIdOrReceiverAccountId(account.getId(), account.getId());
        if (txCount > 5) score += 50;

        // 3. Health Penalty (-100 if balance < $100)
        if (balance.compareTo(BigDecimal.valueOf(100)) < 0) score -= 100;

        // 4. Caps
        if (score > 850) score = 850;
        if (score < 300) score = 300;

        return score;
    }
}
