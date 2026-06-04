package com.fingenie.fingenieai.dto;

import com.fingenie.fingenieai.entity.User;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class UserDetailsDTO {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String role;
    private LocalDateTime createdAt;
    private String accountNumber;
    private java.math.BigDecimal balance;

    public static UserDetailsDTO fromEntity(User user, String accountNumber, java.math.BigDecimal balance) {
        return UserDetailsDTO.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .createdAt(user.getCreatedAt())
                .accountNumber(accountNumber)
                .balance(balance)
                .build();
    }
}
