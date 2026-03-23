# AutoForm AI – Intelligent Document-Based Form Autofill System

## Quick Start

### 1. Start the Backend
```bash
cd backend
node server.js
```
Backend runs at: http://localhost:5001

### 2. Open the Frontend
Open `frontend/index.html` directly in your browser.
(No build step needed — it's a self-contained HTML file)

## Demo Credentials
- Phone: +91 9876543210 (any phone works)
- PIN / OTP: **123456**

## Features
- 🔐 Login with OTP / WhatsApp simulation
- 📊 Dashboard with profile & documents
- 📄 Document upload with OCR simulation
- 💬 WhatsApp chatbot with PIN gate
- 🌐 Form autofill with one click
- 🤖 AI assistant with smart responses
- 🔐 Security center with JWT & masking
- ⚙️ Settings with profile management

## API Endpoints (Backend)
| Method | Path | Description |
|--------|------|-------------|
| POST | /login | Validate phone + PIN |
| POST | /send-otp | Simulate OTP send |
| POST | /process-doc | OCR simulation |
| GET  | /get-user-data | Fetch user profile |
| PUT  | /update-user-data | Update profile |
| POST | /chatbot-query | AI chatbot response |
| GET  | /security-status | Security checks |

> Note: Frontend auto-falls back to mock data if backend is offline.
