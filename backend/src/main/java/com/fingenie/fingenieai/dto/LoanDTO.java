package com.fingenie.fingenieai.dto;

import com.fingenie.fingenieai.entity.Loan;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class LoanDTO {
    private Long id;
    private BigDecimal amount;
    private BigDecimal interestRate;
    private String status;
    private LocalDateTime createdAt;
    private String userEmail;
    private String userName;

    public static LoanDTO fromEntity(Loan loan) {
        return LoanDTO.builder()
                .id(loan.getId())
                .amount(loan.getAmount())
                .interestRate(loan.getInterestRate())
                .status(loan.getStatus().name())
                .createdAt(loan.getCreatedAt())
                .userEmail(loan.getUser().getEmail())
                .userName(loan.getUser().getFirstName() + " " + loan.getUser().getLastName())
                .build();
    }
}
