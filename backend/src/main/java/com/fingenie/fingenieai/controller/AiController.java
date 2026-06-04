package com.fingenie.fingenieai.controller;

import com.fingenie.fingenieai.dto.ChatRequest;
import com.fingenie.fingenieai.dto.ChatResponse;
import com.fingenie.fingenieai.service.GeminiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/ai")
public class AiController {
    @Autowired
    GeminiService geminiService;

    @GetMapping("/history")
    public ResponseEntity<?> getHistory() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(geminiService.getChatHistory(email));
    }

    @PostMapping("/chat")
    public ResponseEntity<ChatResponse> chat(@RequestBody ChatRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        String aiResponse = geminiService.getAiResponse(email, request.getMessage());
        return ResponseEntity.ok(new ChatResponse(aiResponse));
    }
}
