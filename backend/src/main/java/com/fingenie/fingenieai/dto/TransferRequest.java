package com.fingenie.fingenieai.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class TransferRequest {
    private String receiverAccountNumber;
    private BigDecimal amount;
    private String description;
}
