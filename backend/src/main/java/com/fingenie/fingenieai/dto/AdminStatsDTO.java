package com.fingenie.fingenieai.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Builder
public class AdminStatsDTO {
    private long totalUsers;
    private BigDecimal totalBalance;
    private long pendingLoans;
    private BigDecimal approvedLoanVolume;
    private double loanToDepositRatio;
    private BigDecimal estimatedInterestRevenue;
}
