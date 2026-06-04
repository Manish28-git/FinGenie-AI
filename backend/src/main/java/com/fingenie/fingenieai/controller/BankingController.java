package com.fingenie.fingenieai.controller;

import com.fingenie.fingenieai.dto.AccountDTO;
import com.fingenie.fingenieai.dto.MessageResponse;
import com.fingenie.fingenieai.dto.TransactionDTO;
import com.fingenie.fingenieai.dto.TransferRequest;
import com.fingenie.fingenieai.service.BankingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/banking")
public class BankingController {
    @Autowired
    BankingService bankingService;

    @GetMapping("/my-account")
    public ResponseEntity<?> getMyAccount() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        try {
            AccountDTO accountDTO = bankingService.getAccountByEmail(email);
            return ResponseEntity.ok(accountDTO);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @PostMapping("/transfer")
    public ResponseEntity<?> transfer(@RequestBody TransferRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        try {
            bankingService.transferFunds(email, request);
            return ResponseEntity.ok(new MessageResponse("Transfer successful"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @PostMapping("/deposit")
    public ResponseEntity<?> deposit(@RequestBody java.util.Map<String, BigDecimal> request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        try {
            bankingService.deposit(email, request.get("amount"));
            return ResponseEntity.ok(new MessageResponse("Deposit successful"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @PostMapping("/withdraw")
    public ResponseEntity<?> withdraw(@RequestBody java.util.Map<String, BigDecimal> request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        try {
            bankingService.withdraw(email, request.get("amount"));
            return ResponseEntity.ok(new MessageResponse("Withdrawal successful"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @GetMapping("/history")
    public ResponseEntity<?> getHistory() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        try {
            List<TransactionDTO> history = bankingService.getTransactionHistory(email)
                    .stream()
                    .map(TransactionDTO::fromEntity)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(history);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @GetMapping("/credit-score")
    public ResponseEntity<?> getCreditScore() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        try {
            int score = bankingService.calculateCreditScore(email);
            return ResponseEntity.ok(Map.of("score", score));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }
}
