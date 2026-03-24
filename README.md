# FormOS – Intelligent Data Platform for Autofill Automation

A full-stack prototype demonstrating intelligent document-based form autofill, RAG-powered AI queries, smart field mapping, eligibility checking, and IoT simulation (NFC + Smart Scanner).

---

## Quick Start

### 1. Install dependencies
```bash
cd backend
npm install
```

### 2. Start the backend
```bash
node server.js
```
Backend runs at: `http://localhost:5001`

### 3. Open the app
Visit `http://localhost:5001` in your browser.
The backend serves the frontend automatically — no separate step needed.

---

## Demo Credentials

| Field | Value |
|-------|-------|
| Phone | +91 9209783499 (any number works) |
| PIN / OTP | `123456` |

---

## Demo User Profile

| Field | Value |
|-------|-------|
| Name | Mansi Kiran Jadhav |
| Date of Birth | 07 Aug 2005 |
| Email | mansikj07@gmail.com |
| Phone | +91 9209783499 |
| Address | Kalyan, Mumbai, Maharashtra |
| Aadhaar | XXXX-XXXX-1234 (masked) |
| PAN | \*\*\*E1234F (masked) |

---

## Project Structure

```
AutoForm-AI/
├── backend/
│   ├── server.js          # Express API server
│   ├── package.json
│   └── node_modules/
├── frontend/
│   └── index.html         # Single-file SPA (all pages + logic)
└── README.md
```

---

## Pages & Features

### Core
| Page | Description |
|------|-------------|
| Login | Phone + OTP/PIN login, WhatsApp login, Biometric login simulation |
| Dashboard | Dynamic stats, uploaded documents, extracted data, quick AI query |
| Upload Documents | Drag-and-drop upload, 4-step OCR animation, extracted data display |
| WhatsApp Chat | Pixel-accurate WA UI, PIN gate, typing indicator, quick query chips |
| Form Autofill | One-click autofill with staggered field animation, records analytics |

### Intelligence
| Page | Description |
|------|-------------|
| AI Assistant | Chat-style queries with re-auth for sensitive fields |
| RAG Query Engine | Retrieval-Augmented Generation — summarize profile, find missing fields |
| Smart Field Mapping | Maps non-standard field names (e.g. "Surname" → Name, "Correspondence Address" → Address) |
| Form Intelligence | Upload any form — detects fields, shows available vs missing data with coverage % |
| Eligibility Checker | Paste a job description — AI checks eligibility with criteria breakdown |
| Profile Builder | Generates formatted profile summary, multi-document merge simulation |

### Hardware (IoT Simulation)
| Page | Description |
|------|-------------|
| Smart Scanner | Camera scan animation with OCR progress, auto-extracts data |
| NFC Tap | NFC ring animation, PIN verification, triggers autofill |

### System
| Page | Description |
|------|-------------|
| Analytics | Live stats — forms filled, time saved, OCR accuracy, activity log |
| Security Center | JWT token display, 6-point security checks, data masking preview |
| Settings | Profile edit, security toggles, document management, danger zone |

---

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/send-otp` | No | Simulate OTP send |
| POST | `/login` | No | Validate PIN, returns session token |
| POST | `/logout` | No | Invalidate session token |
| GET | `/get-user` | Yes | Fetch user profile |
| PUT | `/update-user-data` | Yes | Update name, email, address, DOB |
| GET | `/get-analytics` | Yes | Fetch live usage stats |
| GET | `/get-documents` | Yes | Fetch uploaded documents list |
| POST | `/process-doc` | Yes | Simulate OCR, updates document list + analytics |
| POST | `/record-autofill` | Yes | Increment autofill count + time saved |
| POST | `/chat` | Yes | Keyword-based chatbot with data masking |
| POST | `/rag-query` | Yes | RAG-style complex query responses |
| POST | `/smart-map` | Yes | Intelligent field alias mapping |
| POST | `/eligibility-check` | Yes | JD-based eligibility analysis |
| GET | `/profile-generate` | Yes | Generate formatted profile summary |
| POST | `/analyze-form` | Yes | Detect form fields, show data coverage |

> **Auth:** Protected routes require `x-token` header with the token returned by `/login`.
> The frontend automatically includes this header on every request.

---

## Architecture

```
Browser (frontend/index.html)
    │
    │  fetch() with x-token header
    ▼
Express Server (backend/server.js :5001)
    │
    ├── Auth middleware (token validation)
    ├── In-memory user object (no database)
    ├── In-memory analytics + documents array
    └── Mock OCR / RAG / mapping logic
```

**Offline mode:** If the backend is unreachable, the frontend automatically falls back to a built-in `mock()` function that returns realistic dummy data for every endpoint — the app remains fully functional.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vanilla HTML/CSS/JS — single file SPA |
| Backend | Node.js + Express |
| Styling | CSS custom properties, Inter font |
| Auth | Token-based (in-memory session store) |
| Data | In-memory (no database required) |
| Fonts | Google Fonts — Inter |

---

## Notes

- No real external APIs are used — everything is simulated with mock data
- No database required — all data lives in memory (resets on server restart)
- The frontend works standalone even without the backend running
- Sensitive fields (Aadhaar, PAN) are always masked in all responses
- PIN re-authentication is required before accessing sensitive data in AI/chat
