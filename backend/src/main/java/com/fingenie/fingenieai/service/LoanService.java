package com.fingenie.fingenieai.service;

import com.fingenie.fingenieai.dto.LoanDTO;
import com.fingenie.fingenieai.dto.LoanRequest;
import com.fingenie.fingenieai.entity.Account;
import com.fingenie.fingenieai.entity.Loan;
import com.fingenie.fingenieai.entity.User;
import com.fingenie.fingenieai.repository.AccountRepository;
import com.fingenie.fingenieai.repository.LoanRepository;
import com.fingenie.fingenieai.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class LoanService {
    @Autowired
    private LoanRepository loanRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private EmailService emailService;

    public LoanDTO applyForLoan(String email, LoanRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Loan loan = Loan.builder()
                .user(user)
                .amount(request.getAmount())
                .interestRate(BigDecimal.valueOf(7.0))
                .status(Loan.Status.PENDING)
                .build();

        Loan savedLoan = loanRepository.save(loan);

        // Notify user about application
        emailService.sendEmail(user.getEmail(), 
            "FinGenie AI: Loan Application Received", 
            "Your application for a loan of <b>$" + request.getAmount() + "</b> has been received and is under review.");

        return LoanDTO.fromEntity(savedLoan);
    }

    @Transactional(readOnly = true)
    public List<LoanDTO> getMyLoans(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return loanRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(LoanDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<LoanDTO> getAllLoans() {
        return loanRepository.findAll()
                .stream()
                .map(LoanDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public LoanDTO approveLoan(Long loanId) {
        Loan loan = loanRepository.findById(loanId)
                .orElseThrow(() -> new RuntimeException("Loan not found"));
        
        if (loan.getStatus() != Loan.Status.PENDING) {
            throw new RuntimeException("Loan is already processed");
        }

        loan.setStatus(Loan.Status.APPROVED);
        
        // Add funds to user's account
        Account account = accountRepository.findByUserId(loan.getUser().getId())
                .orElseThrow(() -> new RuntimeException("User account not found"));
        
        account.setBalance(account.getBalance().add(loan.getAmount()));
        accountRepository.save(account);
        
        Loan savedLoan = loanRepository.save(loan);

        // Notify user
        emailService.sendLoanUpdate(loan.getUser().getEmail(), loan.getAmount().toString(), "APPROVED");
        
        return LoanDTO.fromEntity(savedLoan);
    }

    @Transactional
    public LoanDTO rejectLoan(Long loanId) {
        Loan loan = loanRepository.findById(loanId)
                .orElseThrow(() -> new RuntimeException("Loan not found"));

        if (loan.getStatus() != Loan.Status.PENDING) {
            throw new RuntimeException("Loan is already processed");
        }

        loan.setStatus(Loan.Status.REJECTED);
        Loan savedLoan = loanRepository.save(loan);

        // Notify user
        emailService.sendLoanUpdate(loan.getUser().getEmail(), loan.getAmount().toString(), "REJECTED");

        return LoanDTO.fromEntity(savedLoan);
    }
}
