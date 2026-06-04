package com.fingenie.fingenieai.service;

import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Async
    public void sendEmail(String to, String subject, String body) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom("FinGenie AI <" + fromEmail + ">");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(body, true); // true = HTML

            mailSender.send(message);
            System.out.println("Email sent successfully to: " + to);
        } catch (Exception e) {
            System.err.println("Failed to send email to " + to + ": " + e.getMessage());
        }
    }

    // Template for Welcome Email
    public void sendWelcomeEmail(String to, String name) {
        String subject = "Welcome to FinGenie AI - Your Digital Vault is Ready!";
        String body = "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; padding: 20px; border-radius: 10px;'>" +
                "<h2 style='color: #6366F1;'>Greetings, " + name + "!</h2>" +
                "<p>Welcome to <b>FinGenie AI</b>. We've successfully initialized your banking core and added a <b>$1,000.00</b> starting balance to your vault.</p>" +
                "<p>You can now use our <b>Rapid Transfer</b> system or chat with our <b>AI Banking Assistant</b> to manage your wealth.</p>" +
                "<hr style='border: 0; border-top: 1px solid #eee;'>" +
                "<p style='font-size: 12px; color: #888;'>This is an automated security notification from FinGenie AI.</p>" +
                "</div>";
        sendEmail(to, subject, body);
    }

    // Template for OTP Email
    public void sendOtpEmail(String to, String otp) {
        String subject = "FinGenie AI: Verify Your Identity";
        String body = "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; padding: 20px; border-radius: 10px; text-align: center;'>" +
                "<h2 style='color: #6366F1;'>Email Verification</h2>" +
                "<p>Use the following One-Time Password (OTP) to complete your registration:</p>" +
                "<div style='font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #111827; margin: 30px 0;'>" + otp + "</div>" +
                "<p style='color: #6B7280;'>This code is required to activate your vault.</p>" +
                "<hr style='border: 0; border-top: 1px solid #eee;'>" +
                "</div>";
        sendEmail(to, subject, body);
    }

    // Template for Transaction Receipt
    public void sendTransactionAlert(String to, String type, String amount, String otherParty, String balance) {
        String subject = "FinGenie AI: Transaction Alert - " + type;
        String color = type.equals("DEBIT") ? "#EF4444" : "#10B981";
        String body = "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; padding: 20px; border-radius: 10px;'>" +
                "<h2 style='color: " + color + ";'>" + type + " Notification</h2>" +
                "<p>A transaction of <b>$" + amount + "</b> has been processed on your account.</p>" +
                "<p><b>Counterparty:</b> " + otherParty + "</p>" +
                "<p><b>New Available Balance:</b> $" + balance + "</p>" +
                "<hr style='border: 0; border-top: 1px solid #eee;'>" +
                "<p style='font-size: 12px; color: #888;'>If you did not authorize this, please contact support immediately.</p>" +
                "</div>";
        sendEmail(to, subject, body);
    }

    // Template for Loan Status
    public void sendLoanUpdate(String to, String amount, String status) {
        String subject = "FinGenie AI: Loan Application Update";
        String color = status.equals("APPROVED") ? "#10B981" : "#EF4444";
        String body = "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; padding: 20px; border-radius: 10px;'>" +
                "<h2>Loan Application Status: <span style='color: " + color + ";'>" + status + "</span></h2>" +
                "<p>Your application for a loan of <b>$" + amount + "</b> has been " + status.toLowerCase() + " by our underwriting team.</p>" +
                (status.equals("APPROVED") ? "<p>The funds have been credited to your account balance.</p>" : "<p>Please review our eligibility criteria before applying again.</p>") +
                "<hr style='border: 0; border-top: 1px solid #eee;'>" +
                "</div>";
        sendEmail(to, subject, body);
    }
}
