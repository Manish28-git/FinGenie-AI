package com.fingenie.fingenieai.service;

import com.fingenie.fingenieai.dto.AdminStatsDTO;
import com.fingenie.fingenieai.dto.UserDetailsDTO;
import com.fingenie.fingenieai.entity.Account;
import com.fingenie.fingenieai.entity.Loan;
import com.fingenie.fingenieai.entity.User;
import com.fingenie.fingenieai.repository.AccountRepository;
import com.fingenie.fingenieai.repository.LoanRepository;
import com.fingenie.fingenieai.repository.TransactionRepository;
import com.fingenie.fingenieai.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminService {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private LoanRepository loanRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    public AdminStatsDTO getGlobalStats() {
        // Only count customers (USER role) for the main 'Total Users' stat
        long totalUsers = userRepository.findAll().stream()
                .filter(u -> u.getRole() == User.Role.USER)
                .count();
        
        BigDecimal totalBalance = accountRepository.findAll().stream()
                .map(Account::getBalance)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<Loan> allLoans = loanRepository.findAll();
        
        long pendingLoans = allLoans.stream()
                .filter(l -> l.getStatus() == Loan.Status.PENDING)
                .count();

        BigDecimal approvedVolume = allLoans.stream()
                .filter(l -> l.getStatus() == Loan.Status.APPROVED)
                .map(Loan::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Calculate Interest Revenue
        BigDecimal interestRevenue = allLoans.stream()
                .filter(l -> l.getStatus() == Loan.Status.APPROVED)
                .map(l -> l.getAmount().multiply(l.getInterestRate()).divide(BigDecimal.valueOf(100)))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        double ratio = 0;
        if (totalBalance.compareTo(BigDecimal.ZERO) > 0) {
            ratio = approvedVolume.multiply(BigDecimal.valueOf(100))
                    .divide(totalBalance, 2, java.math.RoundingMode.HALF_UP)
                    .doubleValue();
        }

        return AdminStatsDTO.builder()
                .totalUsers(totalUsers)
                .totalBalance(totalBalance)
                .pendingLoans(pendingLoans)
                .approvedLoanVolume(approvedVolume)
                .loanToDepositRatio(ratio)
                .estimatedInterestRevenue(interestRevenue)
                .build();
    }

    public List<UserDetailsDTO> getAllUsersDetails() {
        return userRepository.findAll().stream()
                .filter(u -> u.getRole() != User.Role.ADMIN) // Don't list admins for deletion
                .map(user -> {
            Account account = accountRepository.findByUserId(user.getId()).orElse(null);
            return UserDetailsDTO.fromEntity(
                user, 
                account != null ? account.getAccountNumber() : "N/A", 
                account != null ? account.getBalance() : BigDecimal.ZERO
            );
        }).collect(Collectors.toList());
    }

    @Transactional
    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getRole() == User.Role.ADMIN) {
            throw new RuntimeException("Cannot delete administrator accounts");
        }

        // 1. Delete Loans
        loanRepository.deleteByUserId(userId);

        // 2. Delete Transactions
        accountRepository.findByUserId(userId).ifPresent(account -> {
            transactionRepository.deleteBySenderAccountIdOrReceiverAccountId(account.getId(), account.getId());
        });

        // 3. Delete Account
        accountRepository.deleteByUserId(userId);

        // 4. Delete User
        userRepository.deleteById(userId);
    }
}
