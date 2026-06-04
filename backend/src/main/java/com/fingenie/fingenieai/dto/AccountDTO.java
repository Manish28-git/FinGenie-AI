package com.fingenie.fingenieai.dto;

import com.fingenie.fingenieai.entity.Account;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Builder
public class AccountDTO {
    private String accountNumber;
    private String accountType;
    private BigDecimal balance;
    private String status;

    public static AccountDTO fromEntity(Account account) {
        return AccountDTO.builder()
                .accountNumber(account.getAccountNumber())
                .accountType(account.getAccountType().name())
                .balance(account.getBalance())
                .status(account.getStatus().name())
                .build();
    }
}
