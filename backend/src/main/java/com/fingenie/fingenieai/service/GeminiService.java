package com.fingenie.fingenieai.service;

import com.fingenie.fingenieai.dto.AccountDTO;
import com.fingenie.fingenieai.entity.Transaction;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.fingenie.fingenieai.entity.ChatHistory;
import com.fingenie.fingenieai.entity.User;
import com.fingenie.fingenieai.repository.ChatHistoryRepository;
import com.fingenie.fingenieai.repository.UserRepository;

@Service
public class GeminiService {
    @Value("${gemini.api.key}")
    private String apiKey;

    @Autowired
    private BankingService bankingService;

    @Autowired
    private ChatHistoryRepository chatHistoryRepository;

    @Autowired
    private UserRepository userRepository;

    private final String GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=";

    public List<ChatHistory> getChatHistory(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return chatHistoryRepository.findByUserIdOrderByTimestampAsc(user.getId());
    }

    public String getAiResponse(String email, String userMessage) {
        AccountDTO account = bankingService.getAccountByEmail(email);
        List<Transaction> history = bankingService.getTransactionHistory(email);

        // Format transactions with explicit index (1 is newest)
        StringBuilder historyBuilder = new StringBuilder();
        for (int i = 0; i < history.size() && i < 10; i++) {
            Transaction t = history.get(i);
            historyBuilder.append(String.format("[%d] %s of $%s on %s; ", 
                i + 1, t.getTransactionType(), t.getAmount(), t.getTimestamp()));
        }

        String context = String.format(
                "You are FinGenie, a helpful AI banking assistant. User's current account balance is $%s. " +
                "Their recent transactions (ordered from newest to oldest): %s. " +
                "IMPORTANT: Transaction [1] is the most recent one. " +
                "If they ask about recent transactions, always refer to the ones with lower index numbers. " +
                "If they ask about loans, analyze their balance (at least $500 balance for approval). " +
                "Answer concisely: ",
                account.getBalance(),
                historyBuilder.toString()
        );

        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        // Robust JSON Construction
        Map<String, Object> part = new HashMap<>();
        part.put("text", context + userMessage);
        
        Map<String, Object> content = new HashMap<>();
        content.put("parts", List.of(part));
        
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("contents", List.of(content));

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        String botResponse = "";
        try {
            if (apiKey == null || apiKey.isEmpty() || apiKey.contains("YOUR_API_KEY")) {
                botResponse = "[SYSTEM INFO: API Key Missing or Default] " + generateFallbackResponse(account, userMessage);
            } else {
                String fullUrl = GEMINI_API_URL + apiKey.trim();
                Map<String, Object> response = restTemplate.postForObject(fullUrl, entity, Map.class);
                
                if (response != null && response.containsKey("candidates")) {
                    List candidates = (List) response.get("candidates");
                    if (!candidates.isEmpty()) {
                        Map candidate = (Map) candidates.get(0);
                        Map resContent = (Map) candidate.get("content");
                        List resParts = (List) resContent.get("parts");
                        Map resPart = (Map) resParts.get(0);
                        botResponse = (String) resPart.get("text");
                    }
                }
                
                if (botResponse.isEmpty()) {
                    botResponse = "[SYSTEM INFO: Unexpected API Response Structure] " + generateFallbackResponse(account, userMessage);
                }
            }
        } catch (org.springframework.web.client.HttpClientErrorException e) {
            System.err.println("HttpClientError: " + e.getResponseBodyAsString());
            botResponse = "[SYSTEM INFO: API Error " + e.getStatusCode() + "] " + generateFallbackResponse(account, userMessage);
        } catch (Exception e) {
            System.err.println("Gemini Core Error: " + e.getMessage());
            botResponse = "[SYSTEM INFO: API Call Failed] " + generateFallbackResponse(account, userMessage);
        }

        // Save to Database
        User dbUser = userRepository.findByEmail(email).orElse(null);
        if (dbUser != null) {
            chatHistoryRepository.save(ChatHistory.builder()
                    .user(dbUser)
                    .query(userMessage)
                    .response(botResponse)
                    .build());
        }

        return botResponse;
    }

    private String generateFallbackResponse(AccountDTO account, String userMessage) {
        String msg = userMessage.toLowerCase();
        if (msg.contains("balance")) {
            return "I've analyzed your vault. Your current available balance is exactly $" + account.getBalance() + ".";
        } else if (msg.contains("hi") || msg.contains("hello")) {
            return "Greetings. FinGenie Core is active. I see you have $" + account.getBalance() + " in your account. How can I assist your wealth strategy?";
        } else if (msg.contains("save") || msg.contains("advice")) {
            return "Based on your balance of $" + account.getBalance() + ", I recommend moving 20% to a high-yield savings plan to optimize growth.";
        } else if (msg.contains("loan") || msg.contains("eligible")) {
            if (account.getBalance().doubleValue() >= 500) {
                return "Analysis complete. Given your healthy balance of $" + account.getBalance() + ", you are likely eligible for a loan. Check the 'Wealth' tab to apply.";
            } else {
                return "Analysis complete. Your current balance ($" + account.getBalance() + ") is below our minimum threshold of $500 for loan eligibility. I recommend building more capital first.";
            }
        }
        return "I am currently in 'Deep Sync' mode with your data. I can confirm your account (" + account.getAccountNumber() + ") is secure with a balance of $" + account.getBalance() + ". What else would you like to know?";
    }
}
