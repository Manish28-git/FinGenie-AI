package com.fingenie.fingenieai.controller;

import com.fingenie.fingenieai.dto.LoanDTO;
import com.fingenie.fingenieai.dto.LoanRequest;
import com.fingenie.fingenieai.dto.MessageResponse;
import com.fingenie.fingenieai.service.LoanService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/loans")
public class LoanController {
    @Autowired
    private LoanService loanService;

    @PostMapping("/apply")
    public ResponseEntity<?> apply(@RequestBody LoanRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        try {
            LoanDTO loanDTO = loanService.applyForLoan(email, request);
            return ResponseEntity.ok(loanDTO);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @GetMapping("/my-loans")
    public ResponseEntity<?> getMyLoans() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        try {
            List<LoanDTO> loans = loanService.getMyLoans(email);
            return ResponseEntity.ok(loans);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllLoans() {
        try {
            List<LoanDTO> loans = loanService.getAllLoans();
            return ResponseEntity.ok(loans);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @PostMapping("/approve/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> approveLoan(@PathVariable Long id) {
        try {
            LoanDTO loanDTO = loanService.approveLoan(id);
            return ResponseEntity.ok(loanDTO);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @PostMapping("/reject/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> rejectLoan(@PathVariable Long id) {
        try {
            LoanDTO loanDTO = loanService.rejectLoan(id);
            return ResponseEntity.ok(loanDTO);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }
}
