package com.fingenie.fingenieai.service;

import com.fingenie.fingenieai.dto.JwtResponse;
import com.fingenie.fingenieai.dto.LoginRequest;
import com.fingenie.fingenieai.dto.SignupRequest;
import com.fingenie.fingenieai.entity.Account;
import com.fingenie.fingenieai.entity.User;
import com.fingenie.fingenieai.repository.AccountRepository;
import com.fingenie.fingenieai.repository.UserRepository;
import com.fingenie.fingenieai.security.JwtUtils;
import com.fingenie.fingenieai.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import jakarta.annotation.PostConstruct;

import java.math.BigDecimal;
import java.util.Random;

@Service
public class AuthService {
    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

    @Autowired
    AccountRepository accountRepository;

    @Autowired
    PasswordEncoder encoder;

    @Autowired
    JwtUtils jwtUtils;

    @Autowired
    EmailService emailService;

    @PostConstruct
    public void initAdmin() {
        createAdminIfMissing();
    }

    private void createAdminIfMissing() {
        userRepository.findByEmail("admin@gmail.com").ifPresentOrElse(
            admin -> {
                admin.setPassword(encoder.encode("admin123"));
                admin.setRole(User.Role.ADMIN);
                admin.setVerified(true);
                userRepository.save(admin);
            },
            () -> {
                User admin = User.builder()
                        .firstName("System")
                        .lastName("Admin")
                        .email("admin@gmail.com")
                        .password(encoder.encode("admin123"))
                        .role(User.Role.ADMIN)
                        .isVerified(true)
                        .build();
                userRepository.save(admin);
                System.out.println(">>> [FinGenie] FIXED ADMIN CREATED: admin@gmail.com / admin123");
            }
        );
    }

    public JwtResponse authenticateUser(LoginRequest loginRequest) {
        if ("admin@gmail.com".equalsIgnoreCase(loginRequest.getEmail())) {
            createAdminIfMissing();
        }

        User user = userRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new RuntimeException("Error: User not found"));

        if (!user.isVerified()) {
            throw new RuntimeException("Error: Please verify your email first.");
        }

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        String role = userDetails.getAuthorities().iterator().next().getAuthority();

        return new JwtResponse(jwt, userDetails.getId(), userDetails.getEmail(), role);
    }

    @Transactional
    public void registerUser(SignupRequest signUpRequest) {
        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            throw new RuntimeException("Error: Email is already in use!");
        }

        String otp = String.format("%06d", new Random().nextInt(999999));

        User user = User.builder()
                .firstName(signUpRequest.getFirstName())
                .lastName(signUpRequest.getLastName())
                .email(signUpRequest.getEmail())
                .password(encoder.encode(signUpRequest.getPassword()))
                .role(User.Role.USER)
                .isVerified(false)
                .otp(otp)
                .build();

        userRepository.save(user);

        // Send OTP Email
        emailService.sendOtpEmail(user.getEmail(), otp);
    }

    @Transactional
    public void verifyOtp(String email, String otp) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Error: User not found"));

        if (user.isVerified()) {
            throw new RuntimeException("Error: Account already verified.");
        }

        if (otp.equals(user.getOtp())) {
            user.setVerified(true);
            user.setOtp(null);
            userRepository.save(user);

            // Create banking account after verification
            Account account = Account.builder()
                    .user(user)
                    .accountNumber(generateAccountNumber())
                    .accountType(Account.AccountType.SAVINGS)
                    .balance(BigDecimal.valueOf(1000.00))
                    .status(Account.Status.ACTIVE)
                    .build();

            accountRepository.save(account);

            // Send Welcome Email
            emailService.sendWelcomeEmail(user.getEmail(), user.getFirstName());
        } else {
            throw new RuntimeException("Error: Invalid OTP.");
        }
    }

    private String generateAccountNumber() {
        Random random = new Random();
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 10; i++) {
            sb.append(random.nextInt(10));
        }
        return sb.toString();
    }
}
