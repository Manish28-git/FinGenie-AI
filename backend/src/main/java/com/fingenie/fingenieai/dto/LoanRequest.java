package com.fingenie.fingenieai.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class LoanRequest {
    private BigDecimal amount;
    private BigDecimal interestRate;
}
