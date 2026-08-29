<div align="center">
  <img src="https://i.imgur.com/OTiADfM.jpeg" width="80" height="80" />
  <h1>Money Me Out</h1>
  <p><b>The 30% Tax Killer for YouTube Creators.</b></p>

  <p>
    <img src="https://img.shields.io/badge/Version-1.0_Candidate-emerald?style=for-the-badge" />
    <img src="https://img.shields.io/badge/Framework-React_19-blue?style=for-the-badge&logo=react" />
    <img src="https://img.shields.io/badge/Backend-Node.js_Express-339933?style=for-the-badge&logo=node.js" />
    <img src="https://img.shields.io/badge/Database-Firebase_Firestore-FFCA28?style=for-the-badge&logo=firebase" />
    <img src="https://img.shields.io/badge/Payments-Stripe_Connect-635BFF?style=for-the-badge&logo=stripe" />
  </p>

  <h4>
    <a href="#-what-is-money-me-out">The Problem</a> •
    <a href="#-core-features">Features</a> •
    <a href="#-tech-stack">Tech Stack</a> •
    <a href="#-installation--setup">Installation</a> •
    <a href="#-security--data-integrity">Security</a>
  </h4>
</div>

---

# Money Me Out

**The 30% Tax Killer for YouTube Creators.**

---

## 🚀 What is Money Me Out?

**Money Me Out** is a direct-to-bank monetization bridge for the next generation of YouTube creators. 

Today, legacy platforms like YouTube Super Chat take a **30% cut** of fan support and hold your money hostage until you hit a $100 threshold. We built a high-speed alternative that verifies creator identity via the YouTube Data API and allows for **instant liquidity** via Stripe Connect.

**The Goal:** Lower fees (5%), zero payout thresholds, and real-time gratitude.

---

## 🔥 Core Features

* **🛡️ Verified Identity:** Creators "claim" their channel via the YouTube Data API. Fans can donate with 100% confidence knowing the recipient is verified and the owner of the channel.
* **💸 Instant Payouts:** Integrated with **Stripe Connect Express**. No more "30-day payout cycles." If you have $5 in your balance, you can cash it out to your bank account instantly.
* **⚡ Real-Time Toasts:** Creators receive instant, high-contrast dashboard notifications the second a fan supports them—displaying the supporter's name, the amount, and their personal message.
* **📊 Creator Analytics:** A dedicated dashboard for tracking Lifetime Earnings vs. Available Balance with atomic precision.
* **🌙 Aggressive Dark UI:** A conversion-optimized landing page designed for the creator aesthetic, emphasizing speed and financial growth.

---

## 🛠 Tech Stack

**Frontend**
* **React 19 (Vite):** Leveraging the latest React features for ultra-fast rendering.
* **Tailwind CSS:** Professional-grade, utility-first responsive styling.
* **Framer Motion:** High-fidelity layout animations and state transitions.
* **Lucide React:** Clean, consistent iconography system.

**Backend & Infrastructure**
* **Node.js & Express:** Secure API proxying and logic execution to hide sensitive keys.
* **Firebase Auth:** Secure Google OAuth & YouTube scope management for creator verification.
* **Cloud Firestore:** Real-time NoSQL database with ABAC (Attribute-Based Access Control) security rules.
* **Stripe SDK:** Complex financial logic handling Application Fees (5%), Payment Intents, and Transfers.
* **Nodemailer:** Integrated SMTP support for administrative and user support inquiries.

---

## 🏗 Directory Architecture

```text
/
├── server.ts              # Express Backend (API Master Entry Point)
├── App.tsx                # Main Router & Global State Management
├── firestore.rules        # Hardened Zero-Trust Security Configuration
├── components/            # Reusable UI Architecture
│   ├── layout/            # Header, Footer, Navigation, Tabs
│   └── ui/                # Atomic Elements (Buttons, Spinners, Modals)
├── pages/                 # Full-Page Routing Views
│   ├── SearchPage.tsx     # Landing & Discovery Interface
│   ├── DashboardPage.tsx  # Creator Control Center & Analytics
│   ├── PaymentPage.tsx    # Secure PCI-Compliant Checkout
│   └── LegalPages/        # Terms and Privacy (Compliance)
├── services/              # API Abstraction Layers (Stripe/YouTube)
└── contexts/              # Global Real-Time State (Auth/CreatorData)
```

---

## 🔐 Security & Data Integrity

We treat financial data with zero-trust principles:
* **The Master Gate:** All financial updates (balance, earnings) are Server-Write Only. Client-side SDKs are blocked from editing sensitive data via hardened Firestore rules.
* **Idempotent Ledger:** Every donation uses the Stripe `paymentIntentId` as the unique Document ID in Firestore. This prevents double-counting or balance duplication, even during network retries.
* **KYC Compliance:** Identity verification, anti-money laundering (AML) checks, and tax reporting are offloaded to Stripe Express, ensuring the platform remains legally compliant in 30+ countries.

---

## 🛠 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/money-me-out.git
cd money-me-out
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables
Create a `.env` file in the root directory:
```env
VITE_FIREBASE_API_KEY=your_firebase_key
STRIPE_SECRET_KEY=your_stripe_secret
STRIPE_WEBHOOK_SECRET=your_webhook_signing_secret
YOUTUBE_API_KEY=your_google_cloud_api_key
GMAIL_APP_PASSWORD=your_smtp_app_password
```

### 4. Run Development Mode
```bash
# Terminal 1: Frontend Development
npm run dev

# Terminal 2: Backend API
npm run server
```

---

## 📈 Revenue Model

Money Me Out is built to be a sustainable, value-first platform:
* **5% Platform Fee:** Automatically deducted via the Stripe `application_fee_amount` parameter.
* **Zero Subscriptions:** No monthly costs. We only earn when our creators earn.
* **Transparent Processing:** Standard Stripe fees (2.9% + 30¢) are calculated and shown upfront.

---

<div align="center">
  <p>Built with ❤️ for the Creator Economy.</p>
  <p><b>Interested in the project?</b> Contact support@moneymeout.com</p>
</div>
