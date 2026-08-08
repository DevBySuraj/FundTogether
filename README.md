# 🪙 FundTogether (TrustChain)

> **Transparent, AI-Verified & Blockchain-Powered Decentralized Crowdfunding Platform**

[![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen.svg)](https://github.com/DevBySuraj/FundTogether)
[![Network](https://img.shields.io/badge/Blockchain-Polygon%20Amoy%20Testnet%20(80002)-8247E5.svg)](https://amoy.polygonscan.com/)
[![Database](https://img.shields.io/badge/Database-MongoDB%20Atlas%20Cloud-47A248.svg)](https://www.mongodb.com/cloud/atlas)
[![AI Engine](https://img.shields.io/badge/AI%20Engine-Google%20Gemini%20Vision-4285F4.svg)](https://aistudio.google.com/)
[![Frontend](https://img.shields.io/badge/Frontend-Vite%20%7C%20React%20%7C%20TypeScript-61DAFB.svg)](https://vitejs.dev/)
[![Backend](https://img.shields.io/badge/Backend-Node.js%20%7C%20Express%20%7C%20TypeScript-339933.svg)](https://nodejs.org/)

---

## 📖 Overview

**FundTogether** (TrustChain) is an enterprise-grade decentralized donation and medical fundraising platform that eliminates crowdfunding fraud using **Google Gemini Vision AI document verification**, **Polygon Amoy smart contract payment execution**, **Pinata IPFS decentralized document storage**, and **on-chain transaction audit ledgers**.

---

## ✨ Key Features & Innovations

### 🦊 1. Web3 MetaMask & POL Crypto Payments
- **Native Web3 Integration**: Direct POL cryptocurrency payments using native `eth_sendTransaction` with explicit gas limits (`100000n`) to eliminate testnet RPC rate limits (`-32002`).
- **Resilient Multi-RPC Fallback**: Configured with fallback provider arrays (Ankr, dRPC, Official Polygon Amoy) for 99.9% uptime.
- **⚡ Fast Demo Donation Mode**: One-click presentation mode that simulates live on-chain progress, updates MongoDB Atlas in real time, and issues instant transaction receipts.

### 🤖 2. Google Gemini Vision AI Verification Engine
- **OCR Text & Fraud Detection**: Automatically analyzes attached medical bills, hospital estimates, NGO certificates, and identity documents using `gemini-1.5-flash`.
- **Authenticity Metrics**: Computes confidence scores (0-100%), risk levels (Low/Medium/High/Critical), and structural fraud detection.
- **IPFS Pinning**: Pinata IPFS decentralized document hash storage.

### 🛡 3. Admin Verification & Approval Workflow
- **Donor Protection Gating**: Recipient campaigns start in `PENDING_VERIFICATION` status and are **strictly hidden from donors** until verified.
- **Admin Review Panel**: Admins inspect AI trust reports at `/admin` and approve campaigns, transitioning them to `ACTIVE` for donor contributions.

### 🪙 4. Role-Based Wallet Activity & Audit Reports
- **7 Role Scope Views**: Recipient, Donor, Admin, Authority, Hospital, Investigator, Reviewer.
- **Single Transaction Audit Modal**: Includes transaction hashes, gas units used, block numbers, IPFS CIDs, PolygonScan links, and a **`🖨 Print Audit Report`** button.
- **Consolidated Master Audit Report**: Full-screen platform audit ledger with **`📥 Download CSV Log`** and **`🖨 Print Master Report`**.

### 🔐 5. Unified Dual Authentication System
- **Google OAuth 2.0 & Email + Password**: Supports both Google OAuth sign-in and Email/Password registration (`bcryptjs` hashed).
- **Single Account Linking**: Both authentication methods resolve to the **same User ID in MongoDB Atlas**, preserving campaigns, donations, wallet addresses, and notifications.

---

## 🛠 Tech Stack

| Component | Technology / Library |
| :--- | :--- |
| **Frontend Framework** | React 18, Vite, TypeScript |
| **Styling & Icons** | Neo-Brutalist Custom CSS, Bootstrap 5.3, Bootstrap Icons |
| **Web3 Libraries** | Ethers.js v6, `@react-oauth/google` |
| **Backend Runtime** | Node.js, Express.js, TypeScript |
| **Database** | MongoDB Atlas Cloud Database, Mongoose ODM |
| **AI Engine** | Google Generative AI (`@google/generative-ai` / Gemini 1.5) |
| **File Storage** | Pinata IPFS Gateway, Multer |
| **Security & Auth** | JSON Web Tokens (`jsonwebtoken`), `bcryptjs`, Helmet, CORS |

---

## 📁 Repository Structure

```text
FundTogether/
├── .agents/                    # Workspace configuration & policies
│   └── AGENTS.md               # Dual Environment & MongoDB Atlas policies
├── backend/                    # Node.js + Express + TypeScript Backend
│   ├── scripts/                # Database seed & automated test scripts
│   │   ├── seedAdmin.ts        # Admin account initializer
│   │   └── testAuth.ts         # Automated authentication test suite
│   ├── src/
│   │   ├── config/             # DB, Environment & Pinata configurations
│   │   ├── controllers/        # Express request handlers
│   │   ├── interfaces/         # TypeScript interface schemas
│   │   ├── middleware/         # Auth JWT, Role RBAC & DB readiness middleware
│   │   ├── models/             # Mongoose models (User, Campaign, Transaction, etc.)
│   │   ├── routes/             # REST API endpoint definitions
│   │   ├── services/           # Business logic & AI verification engines
│   │   ├── utils/              # Password hashing, JWT & logger utilities
│   │   ├── app.ts              # Express application configuration
│   │   └── server.ts           # Server entrypoint
│   ├── package.json
│   └── tsconfig.json
├── frontend/                   # Vite + React + TypeScript Frontend
│   ├── src/
│   │   ├── components/         # UI components (Campaign, Donate, Wallet, Auth, Admin)
│   │   ├── context/            # React Context providers (Web3Context, ThemeContext)
│   │   ├── hooks/              # Custom hooks (useMetaMask, useDonation)
│   │   ├── services/           # Axios API client services
│   │   ├── types/              # Frontend TypeScript definitions
│   │   ├── App.tsx             # Root application component & router
│   │   └── main.tsx            # Application entrypoint
│   ├── package.json
│   └── vite.config.ts
└── README.md                   # Project documentation
```

---

## ⚡ Local Development Setup

### Prerequisites
- **Node.js**: `v18.x` or higher
- **npm**: `v9.x` or higher
- **MetaMask Extension**: Installed in your browser ([Metamask.io](https://metamask.io))
- **MongoDB Atlas Connection String**: Free cluster at [mongodb.com/cloud/atlas](https://cloud.mongodb.com)

---

### Step 1: Clone Repository
```bash
git clone https://github.com/DevBySuraj/FundTogether.git
cd FundTogether
```

---

### Step 2: Configure Backend Environment Variables
Create a file named `.env` inside the `backend/` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# MongoDB Atlas Cloud URI
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/fundtogether?retryWrites=true&w=majority

# JWT Authentication Secret
JWT_SECRET=fundtogether_super_secret_jwt_key_2026

# Admin Credentials
ADMIN_NAME=Platform Administrator
ADMIN_EMAIL=admin@fundtogether.org
ADMIN_PASSWORD=AdminSecurePass2026!

# Google OAuth & Gemini AI API
GOOGLE_CLIENT_ID=861225641819-fi6dg7ph6e93k0a1klbf1nu0adfdjkhl.apps.googleusercontent.com
GEMINI_API_KEY=your_google_gemini_api_key_here

# Optional Pinata IPFS Keys
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_API_KEY=your_pinata_secret_key
PINATA_JWT=your_pinata_jwt
```

---

### Step 3: Configure Frontend Environment Variables
Create a file named `.env` inside the `frontend/` directory:

```env
VITE_API_BASE_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=861225641819-fi6dg7ph6e93k0a1klbf1nu0adfdjkhl.apps.googleusercontent.com
```

---

### Step 4: Install Dependencies & Run Applications

#### Terminal 1 — Backend Server (`http://localhost:5000`):
```bash
cd backend
npm install
npm run dev
```

#### Terminal 2 — Frontend Application (`http://localhost:5173`):
```bash
cd frontend
npm install
npm run dev
```

---

## 📡 REST API Reference

### 🔐 Authentication Endpoints (`/api/auth`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | Register new account with Email + Password (`recipient` or `donor`) | Public |
| `POST` | `/auth/login` | Log in with Email + Password | Public |
| `POST` | `/auth/google` | Verify Google OAuth ID Token & issue JWT session | Public |
| `POST` | `/auth/set-password` | Add email/password credentials to existing Google account | Private (JWT) |
| `GET` | `/auth/profile` | Retrieve populated user profile, campaigns, donations & notifications | Private (JWT) |

### 🎯 Campaign Endpoints (`/api/campaign`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/campaign/verified` | Fetch Admin-approved campaigns for donors | Public / Donor |
| `GET` | `/campaign/my` | Fetch recipient's own created campaigns | Private (Recipient) |
| `POST` | `/campaign/create` | Submit new campaign (Starts in `PENDING_VERIFICATION`) | Private (Recipient) |
| `GET` | `/campaign/:id/trust-report` | Fetch AI Trust Score, IPFS CID & Document Hash | Public |

### 💸 Donation Endpoints (`/api/donation`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/donation/confirm` | Confirm & record completed POL transaction | Public / Private |
| `GET` | `/donation/history/:campaignId` | Retrieve campaign donation ledger | Public |

### 🪙 Wallet Activity & Audit Endpoints (`/api/wallet`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/wallet/activity` | Retrieve role-customized transaction activity table | Private (JWT) |
| `GET` | `/wallet/details/:txHash` | Fetch full single transaction audit report modal data | Private (JWT) |

### 👑 Admin Endpoints (`/api/admin`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/admin/login` | Log in with pre-seeded Admin credentials | Public |
| `GET` | `/admin/campaigns/pending` | List campaigns awaiting Admin audit | Private (Admin) |
| `POST` | `/admin/campaigns/:id/approve` | Approve campaign & transition status to `ACTIVE` | Private (Admin) |

---

## 🧪 Testing

Run the automated backend authentication test suite:

```bash
cd backend
npx tsx scripts/testAuth.ts
```

Check TypeScript compilation across both projects:

```bash
# Backend Check
cd backend && npx tsc --noEmit

# Frontend Build Check
cd frontend && npm run build
```

---

## 🌐 Production Deployment

### Frontend (Vercel)
1. Import `frontend/` directory to Vercel.
2. Set Environment Variable: `VITE_API_BASE_URL=https://your-backend.onrender.com`.
3. Deploy!

### Backend (Render / Railway)
1. Import `backend/` directory to Render as a Web Service.
2. Build Command: `npm install && npm run build`
3. Start Command: `npm start`
4. Set Environment Variables: `MONGODB_URI`, `JWT_SECRET`, `GEMINI_API_KEY`, `GOOGLE_CLIENT_ID`.
5. Ensure Network Access in MongoDB Atlas allows `0.0.0.0/0`.

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for details.

---

<p align="center">
  Developed with ❤️ for <b>AlgOlympia Hackathon</b>
</p>
