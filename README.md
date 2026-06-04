# FinGenie AI – Intelligent Digital Banking Platform

FinGenie AI is a next-generation **Digital Banking & Wealth Management** ecosystem. It combines modern banking operations with AI-driven insights to help users manage their finances, simulate loans, and interact with a voice-enabled financial assistant.

---

## 🚀 Key Features

### **1. AI-Powered Assistant**
*   **Voice Integration:** Speak to FinGenie using your microphone.
*   **Smart Feedback:** FinGenie speaks back to you with financial advice.
*   **Context Aware:** The AI knows your balance and recent transactions to give accurate answers.
*   **Persistent Memory:** Conversations are saved to the database.

### **2. Smart Banking Operations**
*   **Contactless Transfers:** Generate and use QR Codes for rapid fund transfers.
*   **Core Banking:** Functional Deposit, Withdrawal, and Fund Transfer systems.
*   **Real-time Ledger:** A transparent history of every transaction.

### **3. Loan & Credit Hub**
*   **Dynamic Credit Scoring:** A real-time algorithm that calculates your credit health based on   your banking behavior.
*   **EMI Simulator:** Interactive sliders to plan your loan repayments instantly.
*   **Application Tracking:** Submit and monitor loan requests through a professional dashboard.

### **4. Administrative Oversight**
*   **Master Dashboard:** Monitor global liquidity and user growth.
*   **Loan Management:** Review and Approve/Reject applications with one click.
*   **Revenue Forecasting:** Real-time interest revenue projections.

---

##  Tech Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide Icons |
| **Backend** | Spring Boot 3, Spring Security, Java 17 |
| **Database** | MySQL / PostgreSQL |
| **AI Core** | Google Gemini 2.5 Flash API |
| **Security** | JWT (JSON Web Tokens), BCrypt Encryption, Email OTP |

---

##  Installation & Setup

### **1. Backend (Spring Boot)**
1.  Navigate to the `backend/` folder.
2.  Open `src/main/resources/application.properties` and update your:
    *   `spring.datasource.url` (Database link)
    *   `gemini.api.key` (Get one from Google AI Studio)
    *   `spring.mail.username/password` (For OTP emails)
3.  Run the application using your IDE or Maven:
    

### **2. Frontend (React + Vite)**
1.  Navigate to the `frontend/` folder.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```
4.  Open `http://localhost:5173` in your browser.

---

##  Default Credentials

| Role | Email | Password |
| :--- | :--- | :--- |
| **Administrator** | `admin@gmail.com` | `admin123` |
| **Customer** | *Register a new account to use* |

---

## 📖 API Documentation
Once the backend is running, you can access the interactive **Swagger UI** to test the APIs:
 `http://localhost:8080/swagger-ui/index.html`

---


